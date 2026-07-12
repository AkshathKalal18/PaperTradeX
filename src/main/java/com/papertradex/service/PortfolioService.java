package com.papertradex.service;

import com.papertradex.dto.response.HoldingResponse;
import com.papertradex.dto.response.PortfolioResponse;

import java.util.List;

public interface PortfolioService {
    List<PortfolioResponse> getUserPortfolios(Long userId);
    PortfolioResponse getPortfolio(Long portfolioId, Long userId);
    List<HoldingResponse> getHoldings(Long portfolioId, Long userId);
}
