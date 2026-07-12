package com.papertradex.service.impl;

import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.Stock;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.StockRepository;
import com.papertradex.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;

    @Override
    public List<StockResponse> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public StockResponse getStockBySymbol(String symbol) {
        Stock stock = stockRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + symbol));
        return toResponse(stock);
    }

    @Override
    public List<StockResponse> searchStocks(String query) {
        return stockRepository
                .findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCandlestickData(String symbol, int days) {
        Stock stock = stockRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + symbol));

        List<Map<String, Object>> candles = new ArrayList<>();
        Random rng = new Random(stock.getSymbol().hashCode());

        double price = stock.getLastPrice().doubleValue();
        // Start from 'days' ago and generate daily OHLCV data
        Instant now = Instant.now().truncatedTo(ChronoUnit.DAYS);
        for (int i = days; i >= 0; i--) {
            Instant time = now.minus(i, ChronoUnit.DAYS);
            double open = price;
            double volatility = open * 0.025;
            double high = open + Math.abs(rng.nextGaussian() * volatility);
            double low = open - Math.abs(rng.nextGaussian() * volatility);
            double close = low + rng.nextDouble() * (high - low);
            long volume = 1_000_000L + (long)(rng.nextDouble() * 5_000_000L);

            Map<String, Object> candle = new LinkedHashMap<>();
            candle.put("time", time.getEpochSecond());
            candle.put("open", round(open));
            candle.put("high", round(high));
            candle.put("low", round(low));
            candle.put("close", round(close));
            candle.put("volume", volume);
            candles.add(candle);
            price = close;
        }
        return candles;
    }

    @Override
    public List<StockResponse> getTopGainers() {
        return stockRepository.findAll().stream()
                .filter(s -> s.getChangePercent() != null && s.getChangePercent().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getChangePercent().compareTo(a.getChangePercent()))
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockResponse> getTopLosers() {
        return stockRepository.findAll().stream()
                .filter(s -> s.getChangePercent() != null && s.getChangePercent().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(Stock::getChangePercent))
                .limit(5)
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public StockResponse toResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .symbol(stock.getSymbol())
                .companyName(stock.getCompanyName())
                .lastPrice(stock.getLastPrice())
                .previousClose(stock.getPreviousClose())
                .change(stock.getChange())
                .changePercent(stock.getChangePercent())
                .sector(stock.getSector())
                .exchange(stock.getExchange())
                .updatedAt(stock.getUpdatedAt())
                .build();
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
