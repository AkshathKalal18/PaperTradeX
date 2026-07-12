package com.papertradex.repository;

import com.papertradex.entity.Order;
import com.papertradex.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByPortfolioIdOrderByCreatedAtDesc(Long portfolioId);

    List<Order> findByPortfolioIdAndStatus(Long portfolioId, OrderStatus status);

    List<Order> findByPortfolioUserIdOrderByCreatedAtDesc(Long userId);
}
