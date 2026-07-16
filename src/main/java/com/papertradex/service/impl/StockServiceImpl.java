package com.papertradex.service.impl;

import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.Stock;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.StockRepository;
import com.papertradex.service.MarketDataService;
import com.papertradex.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final MarketDataService marketDataService;

    @Override
    public List<StockResponse> getAllStocks() {
        return stockRepository.findAll().stream()
                .map(s -> marketDataService.getLiveStockData(s.getSymbol()))
                .collect(Collectors.toList());
    }

    @Override
    public StockResponse getStockBySymbol(String symbol) {
        return marketDataService.getLiveStockData(symbol);
    }

    @Override
    public List<StockResponse> searchStocks(String query) {
        // Query local database matches
        List<Stock> matching = stockRepository.findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query);
        if (matching.isEmpty()) {
            // Try live search from Finnhub and register any new stock that is returned
            List<Map<String, String>> liveMatches = marketDataService.searchSymbols(query);
            for (Map<String, String> item : liveMatches.stream().limit(5).collect(Collectors.toList())) {
                String sym = item.get("symbol");
                if (sym != null && !sym.contains(".") && !stockRepository.existsBySymbol(sym.toUpperCase())) {
                    try {
                        marketDataService.getLiveStockData(sym);
                    } catch (Exception e) {
                        // ignore and skip
                    }
                }
            }
            matching = stockRepository.findBySymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query);
        }

        return matching.stream()
                .map(s -> marketDataService.getLiveStockData(s.getSymbol()))
                .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getCandlestickData(String symbol, int days) {
        long to = Instant.now().getEpochSecond();
        long from = Instant.now().minus(days, java.time.temporal.ChronoUnit.DAYS).getEpochSecond();
        return marketDataService.getCandlestickData(symbol, "D", from, to);
    }

    @Override
    public List<StockResponse> getTopGainers() {
        // Fetch current live stock data for all stocks in the database, then sort by changePercent desc
        return getAllStocks().stream()
                .filter(s -> s.getChangePercent() != null && s.getChangePercent().compareTo(BigDecimal.ZERO) > 0)
                .sorted((a, b) -> b.getChangePercent().compareTo(a.getChangePercent()))
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    public List<StockResponse> getTopLosers() {
        // Fetch current live stock data for all stocks in the database, then sort by changePercent asc
        return getAllStocks().stream()
                .filter(s -> s.getChangePercent() != null && s.getChangePercent().compareTo(BigDecimal.ZERO) < 0)
                .sorted(Comparator.comparing(StockResponse::getChangePercent))
                .limit(5)
                .collect(Collectors.toList());
    }

    public StockResponse toResponse(Stock stock) {
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
                .updatedAt(stock.getUpdatedAt())
                .build();
    }
}

