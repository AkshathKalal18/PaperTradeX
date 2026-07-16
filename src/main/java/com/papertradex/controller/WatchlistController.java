package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.dto.response.StockResponse;
import com.papertradex.entity.User;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.UserRepository;
import com.papertradex.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StockResponse>>> getWatchlist(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        List<StockResponse> stocks = watchlistService.getUserWatchlist(user.getId());
        return ResponseEntity.ok(ApiResponse.success(stocks));
    }

    @PostMapping("/{symbol}")
    public ResponseEntity<ApiResponse<Map<String, String>>> addToWatchlist(
            @PathVariable String symbol,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        watchlistService.addToWatchlist(user.getId(), symbol);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", symbol + " added to watchlist")));
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<ApiResponse<Map<String, String>>> removeFromWatchlist(
            @PathVariable String symbol,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        watchlistService.removeFromWatchlist(user.getId(), symbol);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", symbol + " removed from watchlist")));
    }
}

