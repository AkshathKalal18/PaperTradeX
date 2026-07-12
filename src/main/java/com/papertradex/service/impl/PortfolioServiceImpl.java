package com.papertradex.service.impl;

import com.papertradex.dto.response.HoldingResponse;
import com.papertradex.dto.response.PortfolioResponse;
import com.papertradex.entity.Holding;
import com.papertradex.entity.Portfolio;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.exception.UnauthorizedException;
import com.papertradex.repository.HoldingRepository;
import com.papertradex.repository.PortfolioRepository;
import com.papertradex.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioServiceImpl implements PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final HoldingRepository holdingRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<PortfolioResponse> getUserPortfolios(Long userId) {
        return portfolioRepository.findByUserId(userId).stream()
                .map(p -> buildPortfolioResponse(p, false))
                .collect(Collectors.toList());
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PortfolioResponse getPortfolio(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (!portfolio.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        return buildPortfolioResponse(portfolio, true);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<HoldingResponse> getHoldings(Long portfolioId, Long userId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));
        if (!portfolio.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Access denied");
        }
        return holdingRepository.findByPortfolioId(portfolioId).stream()
                .map(this::toHoldingResponse)
                .collect(Collectors.toList());
    }

    private PortfolioResponse buildPortfolioResponse(Portfolio portfolio, boolean includeHoldings) {
        List<Holding> holdings = holdingRepository.findByPortfolioId(portfolio.getId());

        BigDecimal holdingsValue = holdings.stream()
                .map(h -> h.getStock().getLastPrice().multiply(BigDecimal.valueOf(h.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalValue = portfolio.getCashBalance().add(holdingsValue);
        BigDecimal totalPnl = totalValue.subtract(portfolio.getInitialBalance());
        BigDecimal totalPnlPercent = portfolio.getInitialBalance().compareTo(BigDecimal.ZERO) != 0
                ? totalPnl.divide(portfolio.getInitialBalance(), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        PortfolioResponse response = PortfolioResponse.builder()
                .id(portfolio.getId())
                .name(portfolio.getName())
                .cashBalance(portfolio.getCashBalance())
                .initialBalance(portfolio.getInitialBalance())
                .holdingsValue(holdingsValue)
                .totalValue(totalValue)
                .totalPnl(totalPnl)
                .totalPnlPercent(totalPnlPercent)
                .createdAt(portfolio.getCreatedAt())
                .build();

        if (includeHoldings) {
            response.setHoldings(holdings.stream().map(this::toHoldingResponse).collect(Collectors.toList()));
        }
        return response;
    }

    private HoldingResponse toHoldingResponse(Holding holding) {
        BigDecimal currentPrice = holding.getStock().getLastPrice();
        BigDecimal currentValue = currentPrice.multiply(BigDecimal.valueOf(holding.getQuantity()));
        BigDecimal investedValue = holding.getAverageCost().multiply(BigDecimal.valueOf(holding.getQuantity()));
        BigDecimal pnl = currentValue.subtract(investedValue);
        BigDecimal pnlPercent = investedValue.compareTo(BigDecimal.ZERO) != 0
                ? pnl.divide(investedValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        return HoldingResponse.builder()
                .id(holding.getId())
                .stockId(holding.getStock().getId())
                .symbol(holding.getStock().getSymbol())
                .companyName(holding.getStock().getCompanyName())
                .quantity(holding.getQuantity())
                .averageCost(holding.getAverageCost())
                .currentPrice(currentPrice)
                .currentValue(currentValue)
                .investedValue(investedValue)
                .pnl(pnl)
                .pnlPercent(pnlPercent)
                .change(holding.getStock().getChange())
                .changePercent(holding.getStock().getChangePercent())
                .build();
    }
}
