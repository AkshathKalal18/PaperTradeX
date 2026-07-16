package com.papertradex.service;

import com.papertradex.dto.response.StockResponse;
import java.util.List;
import java.util.Map;

public interface MarketDataService {
    StockResponse getLiveStockData(String symbol);
    List<Map<String, Object>> getCandlestickData(String symbol, String resolution, long from, long to);
    List<Map<String, String>> searchSymbols(String query);
}
