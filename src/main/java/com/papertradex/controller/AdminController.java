package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.entity.Order;
import com.papertradex.entity.User;
import com.papertradex.repository.OrderRepository;
import com.papertradex.repository.PortfolioRepository;
import com.papertradex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PortfolioRepository portfolioRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalPortfolios = portfolioRepository.count();

        BigDecimal totalTradeVolume = orderRepository.findAll().stream()
                .filter(o -> o.getFilledPrice() != null)
                .map(o -> o.getFilledPrice().multiply(BigDecimal.valueOf(o.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> dashboard = Map.of(
                "totalUsers", totalUsers,
                "totalOrders", totalOrders,
                "totalPortfolios", totalPortfolios,
                "totalTradeVolume", totalTradeVolume
        );
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "email", u.getEmail(),
                        "fullName", u.getFullName(),
                        "role", u.getRole().name(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/transactions")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllTransactions() {
        List<Map<String, Object>> txns = orderRepository.findAll().stream()
                .map(o -> Map.<String, Object>of(
                        "id", o.getId(),
                        "user", o.getPortfolio().getUser().getEmail(),
                        "symbol", o.getStock().getSymbol(),
                        "side", o.getSide().name(),
                        "quantity", o.getQuantity(),
                        "filledPrice", o.getFilledPrice() != null ? o.getFilledPrice() : BigDecimal.ZERO,
                        "status", o.getStatus().name(),
                        "createdAt", o.getCreatedAt() != null ? o.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(txns));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            com.papertradex.enums.Role role = com.papertradex.enums.Role.valueOf(body.get("role").toUpperCase());
            user.setRole(role);
            userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Role updated to " + role)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid role: " + body.get("role")));
        }
    }
}
