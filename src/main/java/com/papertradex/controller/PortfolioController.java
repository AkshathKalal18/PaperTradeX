package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.dto.response.HoldingResponse;
import com.papertradex.dto.response.PortfolioResponse;
import com.papertradex.entity.User;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.UserRepository;
import com.papertradex.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/portfolios")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PortfolioResponse>>> getMyPortfolios(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                portfolioService.getUserPortfolios(getUserId(userDetails))));
    }

    @GetMapping("/{portfolioId}")
    public ResponseEntity<ApiResponse<PortfolioResponse>> getPortfolio(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                portfolioService.getPortfolio(portfolioId, getUserId(userDetails))));
    }

    @GetMapping("/{portfolioId}/holdings")
    public ResponseEntity<ApiResponse<List<HoldingResponse>>> getHoldings(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                portfolioService.getHoldings(portfolioId, getUserId(userDetails))));
    }
}
