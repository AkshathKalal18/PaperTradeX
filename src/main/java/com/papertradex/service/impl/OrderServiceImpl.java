package com.papertradex.service.impl;

import com.papertradex.dto.request.PlaceOrderRequest;
import com.papertradex.dto.response.OrderResponse;
import com.papertradex.entity.Holding;
import com.papertradex.entity.Order;
import com.papertradex.entity.Portfolio;
import com.papertradex.entity.Stock;
import com.papertradex.enums.OrderSide;
import com.papertradex.enums.OrderStatus;
import com.papertradex.exception.BadRequestException;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.exception.UnauthorizedException;
import com.papertradex.repository.HoldingRepository;
import com.papertradex.repository.OrderRepository;
import com.papertradex.repository.PortfolioRepository;
import com.papertradex.repository.StockRepository;
import com.papertradex.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PortfolioRepository portfolioRepository;
    private final StockRepository stockRepository;
    private final HoldingRepository holdingRepository;

    @Override
    @Transactional
    public OrderResponse placeOrder(PlaceOrderRequest request, Long userId) {
        Portfolio portfolio = portfolioRepository.findById(request.getPortfolioId())
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        if (!portfolio.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }

        Stock stock = stockRepository.findBySymbol(request.getSymbol().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Stock not found: " + request.getSymbol()));

        BigDecimal fillPrice = request.getType().name().equals("MARKET")
                ? stock.getLastPrice()
                : (request.getLimitPrice() != null ? request.getLimitPrice() : stock.getLastPrice());

        BigDecimal orderValue = fillPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        if (request.getSide() == OrderSide.BUY) {
            if (portfolio.getCashBalance().compareTo(orderValue) < 0) {
                throw new BadRequestException("Insufficient cash balance. Required: $" + orderValue +
                        ", Available: $" + portfolio.getCashBalance());
            }
            portfolio.setCashBalance(portfolio.getCashBalance().subtract(orderValue));

            Optional<Holding> existingHolding = holdingRepository
                    .findByPortfolioIdAndStockId(portfolio.getId(), stock.getId());

            if (existingHolding.isPresent()) {
                Holding holding = existingHolding.get();
                int newQty = holding.getQuantity() + request.getQuantity();
                BigDecimal totalCost = holding.getAverageCost().multiply(BigDecimal.valueOf(holding.getQuantity()))
                        .add(orderValue);
                holding.setAverageCost(totalCost.divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP));
                holding.setQuantity(newQty);
                holdingRepository.save(holding);
            } else {
                Holding holding = Holding.builder()
                        .portfolio(portfolio)
                        .stock(stock)
                        .quantity(request.getQuantity())
                        .averageCost(fillPrice)
                        .build();
                holdingRepository.save(holding);
            }
        } else { // SELL
            Holding holding = holdingRepository
                    .findByPortfolioIdAndStockId(portfolio.getId(), stock.getId())
                    .orElseThrow(() -> new BadRequestException("No holding found for " + stock.getSymbol()));

            if (holding.getQuantity() < request.getQuantity()) {
                throw new BadRequestException("Insufficient shares. Have: " + holding.getQuantity() +
                        ", Trying to sell: " + request.getQuantity());
            }

            int newQty = holding.getQuantity() - request.getQuantity();
            if (newQty == 0) {
                holdingRepository.delete(holding);
            } else {
                holding.setQuantity(newQty);
                holdingRepository.save(holding);
            }
            portfolio.setCashBalance(portfolio.getCashBalance().add(orderValue));
        }

        portfolioRepository.save(portfolio);

        Order order = Order.builder()
                .portfolio(portfolio)
                .stock(stock)
                .side(request.getSide())
                .type(request.getType())
                .status(OrderStatus.FILLED)
                .quantity(request.getQuantity())
                .limitPrice(request.getLimitPrice())
                .filledPrice(fillPrice)
                .build();

        Order saved = orderRepository.save(order);
        return toOrderResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getPortfolioOrders(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (!portfolio.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        return orderRepository.findByPortfolioIdOrderByCreatedAtDesc(portfolioId).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(Long userId) {
        return orderRepository.findByPortfolioUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toOrderResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse toOrderResponse(Order order) {
        BigDecimal filledPrice = order.getFilledPrice() != null ? order.getFilledPrice() : BigDecimal.ZERO;
        return OrderResponse.builder()
                .id(order.getId())
                .portfolioId(order.getPortfolio().getId())
                .symbol(order.getStock().getSymbol())
                .companyName(order.getStock().getCompanyName())
                .side(order.getSide().name())
                .type(order.getType().name())
                .status(order.getStatus().name())
                .quantity(order.getQuantity())
                .limitPrice(order.getLimitPrice())
                .filledPrice(filledPrice)
                .totalValue(filledPrice.multiply(BigDecimal.valueOf(order.getQuantity())))
                .createdAt(order.getCreatedAt())
                .build();
    }
}
