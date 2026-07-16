package com.papertradex.service.impl;

import com.papertradex.entity.Stock;
import com.papertradex.repository.StockRepository;
import com.papertradex.service.NewsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsServiceImpl implements NewsService {

    private final StockRepository stockRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${finnhub.api.key:}")
    private String apiKey;

    private static final String[] SOURCES = {"Reuters", "Bloomberg", "CNBC", "WSJ", "MarketWatch", "FT", "Benzinga"};
    private static final String[][] TEMPLATES = {
        {"%s Surges After Strong Earnings Beat", "POSITIVE"},
        {"%s Reports Record Revenue in Q4", "POSITIVE"},
        {"%s Launches Revolutionary AI Product Line", "POSITIVE"},
        {"%s Gains Market Share Amid Industry Growth", "POSITIVE"},
        {"%s Announces $5B Stock Buyback Program", "POSITIVE"},
        {"%s Slips on Disappointing Guidance", "NEGATIVE"},
        {"%s Faces Regulatory Scrutiny in EU Markets", "NEGATIVE"},
        {"%s Misses Earnings Estimates for Third Quarter", "NEGATIVE"},
        {"%s Shares Drop on Leadership Changes", "NEGATIVE"},
        {"%s Under Pressure as Competition Intensifies", "NEGATIVE"},
        {"%s Holds Steady Amid Mixed Market Signals", "NEUTRAL"},
        {"%s Analysts Set Price Targets Ahead of Earnings", "NEUTRAL"},
        {"%s Partners With Major Tech Giant", "NEUTRAL"},
        {"Market Watch: %s Eyes New Highs", "NEUTRAL"},
        {"%s Expands Into Emerging Markets", "NEUTRAL"}
    };

    @Override
    @Cacheable(value = "news", key = "#symbol != null ? #symbol.toUpperCase() + '-' + #limit : 'general-' + #limit")
    public List<Map<String, Object>> getNews(String symbol, int limit) {
        log.info("Fetching news for symbol: {}, limit: {}", symbol, limit);

        if (apiKey == null || apiKey.trim().isEmpty()) {
            return getFallbackNews(symbol, limit);
        }

        try {
            String url;
            if (symbol != null && !symbol.trim().isEmpty()) {
                String sym = symbol.trim().toUpperCase();
                LocalDate toDate = LocalDate.now();
                LocalDate fromDate = toDate.minusDays(14);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                url = String.format("https://finnhub.io/api/v1/company-news?symbol=%s&from=%s&to=%s&token=%s",
                        sym, fromDate.format(formatter), toDate.format(formatter), apiKey);
            } else {
                url = String.format("https://finnhub.io/api/v1/news?category=general&token=%s", apiKey);
            }

            List<Map<String, Object>> response = restTemplate.getForObject(url, List.class);
            if (response == null || response.isEmpty()) {
                return getFallbackNews(symbol, limit);
            }

            List<Map<String, Object>> result = new ArrayList<>();
            int count = 0;
            for (Map<String, Object> item : response) {
                if (count >= limit) break;

                Map<String, Object> article = new LinkedHashMap<>();
                article.put("id", item.getOrDefault("id", UUID.randomUUID().toString()).toString());
                
                // Map both title and headline to headline to be highly compatible with frontend
                String headline = item.getOrDefault("headline", "").toString();
                article.put("title", headline);
                article.put("headline", headline);
                
                article.put("source", item.getOrDefault("source", "Market News").toString());
                
                // Datetime conversion
                Object dtObj = item.get("datetime");
                Instant publishedInstant = Instant.now();
                if (dtObj != null) {
                    try {
                        long seconds = Long.parseLong(dtObj.toString());
                        publishedInstant = Instant.ofEpochSecond(seconds);
                    } catch (Exception e) {
                        // ignore
                    }
                }
                article.put("publishedAt", publishedInstant.toString());
                article.put("publishedDate", publishedInstant.toString());
                article.put("url", item.getOrDefault("url", "").toString());
                article.put("summary", item.getOrDefault("summary", "").toString());
                article.put("image", item.getOrDefault("image", "").toString());
                article.put("thumbnail", item.getOrDefault("image", "").toString()); // compatibility
                article.put("symbol", symbol != null ? symbol : item.getOrDefault("related", "GENERAL").toString());

                result.add(article);
                count++;
            }
            return result;

        } catch (Exception e) {
            log.error("Failed to fetch news from Finnhub. Falling back.", e);
            return getFallbackNews(symbol, limit);
        }
    }

    private List<Map<String, Object>> getFallbackNews(String symbol, int limit) {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) {
            return Collections.emptyList();
        }

        List<Map<String, Object>> articles = new ArrayList<>();
        Random rng = new Random();
        Instant now = Instant.now();

        for (int i = 0; i < limit; i++) {
            Stock stock;
            if (symbol != null && !symbol.trim().isEmpty()) {
                stock = stockRepository.findBySymbol(symbol.toUpperCase())
                        .orElse(stocks.get(rng.nextInt(stocks.size())));
            } else {
                stock = stocks.get(rng.nextInt(stocks.size()));
            }

            String[] template = TEMPLATES[rng.nextInt(TEMPLATES.length)];
            String title = String.format(template[0], stock.getCompanyName());
            String sentiment = template[1];

            Map<String, Object> article = new LinkedHashMap<>();
            article.put("id", UUID.randomUUID().toString());
            article.put("title", title);
            article.put("headline", title);
            article.put("symbol", stock.getSymbol());
            article.put("companyName", stock.getCompanyName());
            article.put("source", SOURCES[rng.nextInt(SOURCES.length)]);
            article.put("sentiment", sentiment);
            article.put("publishedAt", now.minus(rng.nextInt(48), ChronoUnit.HOURS).toString());
            article.put("publishedDate", now.minus(rng.nextInt(48), ChronoUnit.HOURS).toString());
            article.put("url", "https://finance.yahoo.com/quote/" + stock.getSymbol().toUpperCase());
            article.put("summary", generateSummary(stock.getCompanyName(), sentiment));
            article.put("image", "");
            article.put("thumbnail", "");
            articles.add(article);
        }

        articles.sort((a, b) -> ((String) b.get("publishedAt")).compareTo((String) a.get("publishedAt")));
        return articles;
    }

    private String generateSummary(String company, String sentiment) {
        return switch (sentiment) {
            case "POSITIVE" -> company + " demonstrated outstanding performance this quarter, with analysts upgrading their outlook and institutional investors increasing their positions in the stock.";
            case "NEGATIVE" -> company + " faces headwinds as market conditions tighten. Analysts have revised their price targets downward amid growing uncertainty.";
            default -> company + " remains in focus as investors assess the company's strategic direction and long-term growth prospects in an evolving market landscape.";
        };
    }
}
