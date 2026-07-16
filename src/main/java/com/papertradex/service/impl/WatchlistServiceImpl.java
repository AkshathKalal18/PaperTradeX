package com.papertradex.service.impl;

import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.Stock;
import com.papertradex.entity.User;
import com.papertradex.entity.WatchlistItem;
import com.papertradex.exception.BadRequestException;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.StockRepository;
import com.papertradex.repository.UserRepository;
import com.papertradex.repository.WatchlistRepository;
import com.papertradex.service.MarketDataService;
import com.papertradex.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final MarketDataService marketDataService;

    @Override
    @Transactional(readOnly = true)
    public List<StockResponse> getUserWatchlist(Long userId) {
        log.info("Fetching watchlist for user ID: {}", userId);
        List<WatchlistItem> items = watchlistRepository.findByUserId(userId);
        
        return items.stream()
                .map(item -> marketDataService.getLiveStockData(item.getStock().getSymbol()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToWatchlist(Long userId, String symbol) {
        log.info("Adding symbol {} to watchlist of user ID: {}", symbol, userId);
        String sym = symbol.toUpperCase();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Stock stock = stockRepository.findBySymbol(sym)
                .orElseGet(() -> {
                    // Try to fetch live data to see if it's a valid symbol
                    StockResponse liveData = marketDataService.getLiveStockData(sym);
                    if (liveData == null) {
                        throw new ResourceNotFoundException("Stock symbol not found: " + sym);
                    }
                    return stockRepository.findBySymbol(sym)
                            .orElseThrow(() -> new ResourceNotFoundException("Stock could not be initialized: " + sym));
                });

        if (watchlistRepository.existsByUserIdAndStockId(user.getId(), stock.getId())) {
            throw new BadRequestException(sym + " is already in your watchlist");
        }

        WatchlistItem item = WatchlistItem.builder()
                .user(user)
                .stock(stock)
                .build();
        watchlistRepository.save(item);
    }

    @Override
    @Transactional
    public void removeFromWatchlist(Long userId, String symbol) {
        log.info("Removing symbol {} from watchlist of user ID: {}", symbol, userId);
        String sym = symbol.toUpperCase();
        
        Stock stock = stockRepository.findBySymbol(sym)
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + sym));
        
        watchlistRepository.deleteByUserIdAndStockId(userId, stock.getId());
    }
}
