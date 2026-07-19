package com.papertradex.service;

import com.papertradex.dto.response.StockResponse;

import java.util.List;
import java.util.Map;

public interface StockService {
    List<StockResponse> getAllStocks();
    StockResponse getStockBySymbol(String symbol);
    List<StockResponse> searchStocks(String query);
    List<Map<String, Object>> getCandlestickData(String symbol, int days);
    List<StockResponse> getTopGainers();
    List<StockResponse> getTopLosers();
    Map<String, Object> getMarketStatus();
}
