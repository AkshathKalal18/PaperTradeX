package com.papertradex.service.impl;

import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.Stock;
import com.papertradex.repository.StockRepository;
import com.papertradex.service.MarketDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataServiceImpl implements MarketDataService {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${finnhub.api.key:}")
    private String apiKey;

    @Override
    @Cacheable(value = "quotes", key = "#symbol.toUpperCase()")
    public StockResponse getLiveStockData(String symbol) {
        String sym = symbol.toUpperCase();
        log.info("Fetching live stock data for symbol: {}", sym);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            log.warn("Finnhub API key is not configured. Falling back to database/dummy simulation.");
            return getFallbackData(sym);
        }

        try {
            // 1. Fetch Quote
            String quoteUrl = String.format("https://finnhub.io/api/v1/quote?symbol=%s&token=%s", sym, apiKey);
            Map<String, Object> quote = restTemplate.getForObject(quoteUrl, Map.class);

            if (quote == null || quote.get("c") == null || Double.parseDouble(quote.get("c").toString()) == 0.0) {
                log.warn("Invalid quote response for {}, falling back to local database.", sym);
                return getFallbackData(sym);
            }

            // 2. Fetch Profile
            Map<String, Object> profile = null;
            try {
                String profileUrl = String.format("https://finnhub.io/api/v1/stock/profile2?symbol=%s&token=%s", sym, apiKey);
                profile = restTemplate.getForObject(profileUrl, Map.class);
            } catch (Exception pe) {
                log.warn("Failed to fetch profile for {}, using default details. Error: {}", sym, pe.getMessage());
            }

            BigDecimal currentPrice = toBigDecimal(quote.get("c"));
            BigDecimal open = toBigDecimal(quote.get("o"));
            BigDecimal high = toBigDecimal(quote.get("h"));
            BigDecimal low = toBigDecimal(quote.get("l"));
            BigDecimal previousClose = toBigDecimal(quote.get("pc"));
            BigDecimal change = toBigDecimal(quote.get("d"));
            BigDecimal changePercent = toBigDecimal(quote.get("dp"));

            // Parse profile details
            String companyName = (profile != null && profile.get("name") != null) ? profile.get("name").toString() : sym + " Corp";
            String sector = (profile != null && profile.get("finnhubIndustry") != null) ? profile.get("finnhubIndustry").toString() : "Technology";
            String exchange = (profile != null && profile.get("exchange") != null) ? profile.get("exchange").toString() : "NASDAQ";
            String logo = (profile != null && profile.get("logo") != null) ? profile.get("logo").toString() : "";
            String weburl = (profile != null && profile.get("weburl") != null) ? profile.get("weburl").toString() : "";

            // Check / estimate volume if not present (Finnhub quote has no volume)
            Long volume = 1500000L; 

            // Save/Update in DB so we keep our fallback and historical records fresh
            updateStockInDb(sym, companyName, currentPrice, previousClose, change, changePercent, sector, exchange);

            return StockResponse.builder()
                    .symbol(sym)
                    .companyName(companyName)
                    .lastPrice(currentPrice)
                    .open(open)
                    .high(high)
                    .low(low)
                    .previousClose(previousClose)
                    .change(change)
                    .changePercent(changePercent)
                    .volume(volume)
                    .sector(sector)
                    .exchange(exchange)
                    .logo(logo)
                    .weburl(weburl)
                    .updatedAt(Instant.now())
                    .build();

        } catch (HttpClientErrorException.TooManyRequests e) {
            log.error("Finnhub rate limit exceeded (HTTP 429). Trying FMP fallback for: {}", sym);
            return getFmpLiveStockData(sym);
        } catch (Exception e) {
            log.error("Error calling Finnhub API for: {}. Trying FMP fallback. Error: {}", sym, e.getMessage());
            return getFmpLiveStockData(sym);
        }
    }

    private StockResponse getFmpLiveStockData(String symbol) {
        if (fmpKey == null || fmpKey.trim().isEmpty()) {
            return getFallbackData(symbol);
        }
        try {
            log.info("Fetching live stock data from FMP fallback for: {}", symbol);
            String quoteUrl = String.format("https://financialmodelingprep.com/api/v3/quote/%s?apikey=%s", symbol, fmpKey);
            List<Map<String, Object>> quotes = restTemplate.getForObject(quoteUrl, List.class);
            if (quotes == null || quotes.isEmpty()) {
                return getFallbackData(symbol);
            }
            Map<String, Object> quote = quotes.get(0);

            String companyName = quote.getOrDefault("name", symbol + " Corp").toString();
            BigDecimal currentPrice = toBigDecimal(quote.get("price"));
            BigDecimal open = toBigDecimal(quote.get("open"));
            BigDecimal high = toBigDecimal(quote.get("dayHigh"));
            BigDecimal low = toBigDecimal(quote.get("dayLow"));
            BigDecimal previousClose = toBigDecimal(quote.get("previousClose"));
            BigDecimal change = toBigDecimal(quote.get("change"));
            BigDecimal changePercent = toBigDecimal(quote.get("changesPercentage"));
            Long volume = quote.get("volume") != null ? Long.parseLong(quote.get("volume").toString()) : 1500000L;

            // Fetch profile detail from FMP
            String sector = "Technology";
            String exchange = "NASDAQ";
            String logo = "";
            String weburl = "";
            try {
                String profileUrl = String.format("https://financialmodelingprep.com/api/v3/profile/%s?apikey=%s", symbol, fmpKey);
                List<Map<String, Object>> profiles = restTemplate.getForObject(profileUrl, List.class);
                if (profiles != null && !profiles.isEmpty()) {
                    Map<String, Object> profile = profiles.get(0);
                    sector = profile.getOrDefault("sector", "Technology").toString();
                    exchange = profile.getOrDefault("exchangeShortName", "NASDAQ").toString();
                    logo = profile.getOrDefault("image", "").toString();
                    weburl = profile.getOrDefault("website", "").toString();
                }
            } catch (Exception pe) {
                log.warn("FMP profile fetch failed: {}", pe.getMessage());
            }

            updateStockInDb(symbol, companyName, currentPrice, previousClose, change, changePercent, sector, exchange);

            return StockResponse.builder()
                    .symbol(symbol)
                    .companyName(companyName)
                    .lastPrice(currentPrice)
                    .open(open)
                    .high(high)
                    .low(low)
                    .previousClose(previousClose)
                    .change(change)
                    .changePercent(changePercent)
                    .volume(volume)
                    .sector(sector)
                    .exchange(exchange)
                    .logo(logo)
                    .weburl(weburl)
                    .updatedAt(Instant.now())
                    .build();
        } catch (Exception ex) {
            log.error("FMP quote fetch failed for symbol: {}. Falling back to database.", symbol, ex);
            return getFallbackData(symbol);
        }
    }

    @Override
    @Cacheable(value = "candles", key = "#symbol.toUpperCase() + '-' + #resolution + '-' + #from + '-' + #to")
    public List<Map<String, Object>> getCandlestickData(String symbol, String resolution, long from, long to) {
        String sym = symbol.toUpperCase();
        log.info("Fetching live candlestick data for: {} (Res: {}, {} to {})", sym, resolution, from, to);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getFallbackCandles(sym, resolution, from, to);
        }

        try {
            String url = String.format("https://finnhub.io/api/v1/stock/candle?symbol=%s&resolution=%s&from=%d&to=%d&token=%s",
                    sym, resolution, from, to, apiKey);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !"ok".equals(response.get("s"))) {
                log.warn("Finnhub candle API returned status: {}. Falling back.", response != null ? response.get("s") : "null");
                return getFallbackCandles(sym, resolution, from, to);
            }

            List<Object> t = (List<Object>) response.get("t");
            List<Object> o = (List<Object>) response.get("o");
            List<Object> h = (List<Object>) response.get("h");
            List<Object> l = (List<Object>) response.get("l");
            List<Object> c = (List<Object>) response.get("c");
            List<Object> v = (List<Object>) response.get("v");

            List<Map<String, Object>> result = new ArrayList<>();
            for (int i = 0; i < t.size(); i++) {
                Map<String, Object> candle = new LinkedHashMap<>();
                candle.put("time", Long.parseLong(t.get(i).toString()));
                candle.put("open", Double.parseDouble(o.get(i).toString()));
                candle.put("high", Double.parseDouble(h.get(i).toString()));
                candle.put("low", Double.parseDouble(l.get(i).toString()));
                candle.put("close", Double.parseDouble(c.get(i).toString()));
                candle.put("volume", Long.parseLong(v.get(i).toString()));
                result.add(candle);
            }
            return result;

        } catch (Exception e) {
            log.error("Failed to fetch candlestick data from Finnhub. Falling back.", e);
            return getFallbackCandles(sym, resolution, from, to);
        }
    }

    @Override
    @Cacheable(value = "search", key = "#query.toLowerCase()")
    public List<Map<String, String>> searchSymbols(String query) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        log.info("Searching symbols for query: {}", query);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getFallbackSearch(query);
        }

        try {
            String url = String.format("https://finnhub.io/api/v1/search?q=%s&token=%s", query, apiKey);
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || response.get("result") == null) {
                return getFallbackSearch(query);
            }

            List<Map<String, Object>> searchResults = (List<Map<String, Object>>) response.get("result");
            List<Map<String, String>> result = new ArrayList<>();
            for (Map<String, Object> item : searchResults) {
                Map<String, String> entry = new HashMap<>();
                entry.put("symbol", item.getOrDefault("symbol", "").toString());
                entry.put("description", item.getOrDefault("description", "").toString());
                result.add(entry);
            }
            return result;
        } catch (Exception e) {
            log.error("Failed to query Finnhub search. Falling back.", e);
            return getFallbackSearch(query);
        }
    }

    private StockResponse getFallbackData(String symbol) {
        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
        if (stockOpt.isPresent()) {
            Stock stock = stockOpt.get();
            BigDecimal price = stock.getLastPrice();
            return StockResponse.builder()
                    .id(stock.getId())
                    .symbol(stock.getSymbol())
                    .companyName(stock.getCompanyName())
                    .lastPrice(price)
                    .open(price)
                    .high(price.multiply(BigDecimal.valueOf(1.01)))
                    .low(price.multiply(BigDecimal.valueOf(0.99)))
                    .previousClose(stock.getPreviousClose())
                    .change(stock.getChange())
                    .changePercent(stock.getChangePercent())
                    .volume(1250000L)
                    .sector(stock.getSector())
                    .exchange(stock.getExchange())
                    .logo("")
                    .weburl("")
                    .updatedAt(stock.getUpdatedAt())
                    .build();
        }

        // If not in database at all, return dummy stock response
        BigDecimal defaultPrice = BigDecimal.valueOf(150.00);
        return StockResponse.builder()
                .symbol(symbol)
                .companyName(symbol + " Corp")
                .lastPrice(defaultPrice)
                .open(defaultPrice)
                .high(defaultPrice.multiply(BigDecimal.valueOf(1.02)))
                .low(defaultPrice.multiply(BigDecimal.valueOf(0.98)))
                .previousClose(defaultPrice)
                .change(BigDecimal.ZERO)
                .changePercent(BigDecimal.ZERO)
                .volume(1000000L)
                .sector("Technology")
                .exchange("NASDAQ")
                .logo("")
                .weburl("")
                .updatedAt(Instant.now())
                .build();
    }

    private List<Map<String, Object>> getFallbackCandles(String symbol, String resolution, long from, long to) {
        List<Map<String, Object>> candles = new ArrayList<>();
        Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
        double basePrice = stockOpt.map(stock -> stock.getLastPrice().doubleValue()).orElse(150.00);

        Random rng = new Random(symbol.hashCode());
        long interval = resolution.equals("D") ? 86400 : 3600;
        int count = 0;
        double currentPrice = basePrice;
        for (long time = from; time <= to && count < 100; time += interval) {
            double open = currentPrice;
            double volatility = open * 0.02;
            double high = open + Math.abs(rng.nextGaussian() * volatility);
            double low = open - Math.abs(rng.nextGaussian() * volatility);
            double close = low + rng.nextDouble() * (high - low);
            long volume = 1000000 + rng.nextInt(4000000);

            Map<String, Object> candle = new LinkedHashMap<>();
            candle.put("time", time);
            candle.put("open", round(open));
            candle.put("high", round(high));
            candle.put("low", round(low));
            candle.put("close", round(close));
            candle.put("volume", volume);
            candles.add(candle);

            currentPrice = close;
            count++;
        }
        return candles;
    }

    private List<Map<String, String>> getFallbackSearch(String query) {
        List<Map<String, String>> result = new ArrayList<>();
        List<Stock> matching = stockRepository.findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query);
        for (Stock s : matching) {
            Map<String, String> entry = new HashMap<>();
            entry.put("symbol", s.getSymbol());
            entry.put("description", s.getCompanyName());
            result.add(entry);
        }
        return result;
    }

    private void updateStockInDb(String symbol, String companyName, BigDecimal price, BigDecimal prevClose, BigDecimal change, BigDecimal changePct, String sector, String exchange) {
        try {
            Optional<Stock> stockOpt = stockRepository.findBySymbol(symbol);
            Stock stock;
            if (stockOpt.isPresent()) {
                stock = stockOpt.get();
                stock.setLastPrice(price);
                stock.setPreviousClose(prevClose);
                stock.setChange(change);
                stock.setChangePercent(changePct);
                if (sector != null && !sector.isEmpty()) stock.setSector(sector);
                if (exchange != null && !exchange.isEmpty()) stock.setExchange(exchange);
            } else {
                stock = Stock.builder()
                        .symbol(symbol)
                        .companyName(companyName)
                        .lastPrice(price)
                        .previousClose(prevClose)
                        .change(change)
                        .changePercent(changePct)
                        .sector(sector)
                        .exchange(exchange)
                        .build();
            }
            stockRepository.save(stock);
        } catch (Exception e) {
            log.error("Failed to update stock {} in local database. Error: {}", symbol, e.getMessage());
        }
    }

    @Value("${fmp.api.key:}")
    private String fmpKey;

    @Override
    @Cacheable(value = "marketStatus", key = "'status'")
    public Map<String, Object> getMarketStatus() {
        log.info("Fetching market status");
        
        // 1. Try Finnhub US market status
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            try {
                String url = String.format("https://finnhub.io/api/v1/stock/market-status?exchange=US&token=%s", apiKey);
                Map<String, Object> response = restTemplate.getForObject(url, Map.class);
                if (response != null && response.containsKey("isOpen")) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Failed to fetch market status from Finnhub: {}", e.getMessage());
            }
        }

        // 2. Fallback to Financial Modeling Prep (FMP)
        if (fmpKey != null && !fmpKey.trim().isEmpty()) {
            try {
                String url = String.format("https://financialmodelingprep.com/api/v3/market-hours?apikey=%s", fmpKey);
                List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
                if (response != null && !response.isEmpty()) {
                    Map<String, Object> first = response.get(0);
                    boolean isOpen = Boolean.TRUE.equals(first.get("isTheMarketOpen"));
                    return Map.of(
                        "exchange", "US",
                        "isOpen", isOpen,
                        "session", isOpen ? "regular" : "closed",
                        "timezone", "America/New_York"
                    );
                }
            } catch (Exception e) {
                log.warn("Failed to fetch market status from FMP: {}", e.getMessage());
            }
        }

        // 3. Fallback to local system time check
        boolean open = isUSMarketOpenLocalCheck();
        return Map.of(
            "exchange", "US",
            "isOpen", open,
            "session", open ? "regular" : "closed",
            "timezone", "America/New_York"
        );
    }

    private boolean isUSMarketOpenLocalCheck() {
        java.time.ZonedDateTime estTime = java.time.ZonedDateTime.now(java.time.ZoneId.of("America/New_York"));
        java.time.DayOfWeek day = estTime.getDayOfWeek();
        if (day == java.time.DayOfWeek.SATURDAY || day == java.time.DayOfWeek.SUNDAY) {
            return false;
        }
        int hour = estTime.getHour();
        int minute = estTime.getMinute();
        int timeInMins = hour * 60 + minute;
        return timeInMins >= 9 * 60 + 30 && timeInMins <= 16 * 60;
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value.toString()).setScale(4, RoundingMode.HALF_UP);
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
