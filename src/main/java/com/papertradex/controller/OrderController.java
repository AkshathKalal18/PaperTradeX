package com.papertradex.controller;

import com.papertradex.dto.request.PlaceOrderRequest;
import com.papertradex.dto.response.ApiResponse;
import com.papertradex.dto.response.OrderResponse;
import com.papertradex.entity.User;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.UserRepository;
import com.papertradex.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @Valid @RequestBody PlaceOrderRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        OrderResponse response = orderService.placeOrder(request, getUserId(userDetails));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Order placed successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getMyOrders(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(getUserId(userDetails))));
    }

    @GetMapping("/portfolio/{portfolioId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getPortfolioOrders(
            @PathVariable Long portfolioId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getPortfolioOrders(portfolioId, getUserId(userDetails))));
    }
}
