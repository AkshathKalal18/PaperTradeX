package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.dto.response.StockResponse;
import com.papertradex.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockResponse>>> getAllStocks(
            @RequestParam(required = false) String q) {
        List<StockResponse> stocks = (q != null && !q.isBlank())
                ? stockService.searchStocks(q)
                : stockService.getAllStocks();
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<ApiResponse<StockResponse>> getStock(@PathVariable String symbol) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getStockBySymbol(symbol)));
    }

    @GetMapping("/{symbol}/candles")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCandles(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ApiResponse.success(stockService.getCandlestickData(symbol, days)));
    }

    @GetMapping("/market/gainers")
    public ResponseEntity<ApiResponse<List<StockResponse>>> getTopGainers() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getTopGainers()));
    }

    @GetMapping("/market/losers")
    public ResponseEntity<ApiResponse<List<StockResponse>>> getTopLosers() {
        return ResponseEntity.ok(ApiResponse.success(stockService.getTopLosers()));
    }
}
