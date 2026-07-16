package com.papertradex.service;

import com.papertradex.dto.response.StockResponse;
import java.util.List;

public interface WatchlistService {
    List<StockResponse> getUserWatchlist(Long userId);
    void addToWatchlist(Long userId, String symbol);
    void removeFromWatchlist(Long userId, String symbol);
}
