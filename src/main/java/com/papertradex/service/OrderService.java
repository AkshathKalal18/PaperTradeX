package com.papertradex.service;

import com.papertradex.dto.request.PlaceOrderRequest;
import com.papertradex.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse placeOrder(PlaceOrderRequest request, Long userId);
    List<OrderResponse> getPortfolioOrders(Long portfolioId, Long userId);
    List<OrderResponse> getUserOrders(Long userId);
}
