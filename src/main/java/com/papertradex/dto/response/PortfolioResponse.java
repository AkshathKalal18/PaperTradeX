package com.papertradex.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PortfolioResponse {
    private Long id;
    private String name;
    private BigDecimal cashBalance;
    private BigDecimal initialBalance;
    private BigDecimal holdingsValue;
    private BigDecimal totalValue;
    private BigDecimal totalPnl;
    private BigDecimal totalPnlPercent;
    private List<HoldingResponse> holdings;
    private Instant createdAt;
}
