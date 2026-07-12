package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.Stock;
import com.papertradex.entity.User;
import com.papertradex.entity.WatchlistItem;
import com.papertradex.exception.BadRequestException;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.StockRepository;
import com.papertradex.repository.UserRepository;
import com.papertradex.repository.WatchlistRepository;
import com.papertradex.service.impl.StockServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final StockServiceImpl stockService;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<StockResponse>>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<StockResponse> stocks = watchlistRepository.findByUserId(user.getId()).stream()
                .map(w -> stockService.toResponse(w.getStock()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @PostMapping("/{symbol}")
    public ResponseEntity<ApiResponse<Map<String, String>>> addToWatchlist(
            @PathVariable String symbol,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Stock stock = stockRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + symbol));

        if (watchlistRepository.existsByUserIdAndStockId(user.getId(), stock.getId())) {
            throw new BadRequestException(symbol + " is already in your watchlist");
        }

        WatchlistItem item = WatchlistItem.builder().user(user).stock(stock).build();
        watchlistRepository.save(item);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", symbol + " added to watchlist")));
    }

    @DeleteMapping("/{symbol}")
    @Transactional
    public ResponseEntity<ApiResponse<Map<String, String>>> removeFromWatchlist(
            @PathVariable String symbol,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        Stock stock = stockRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + symbol));
        watchlistRepository.deleteByUserIdAndStockId(user.getId(), stock.getId());
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", symbol + " removed from watchlist")));
    }
}
