package com.papertradex.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HoldingResponse {
    private Long id;
    private Long stockId;
    private String symbol;
    private String companyName;
    private Integer quantity;
    private BigDecimal averageCost;
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal investedValue;
    private BigDecimal pnl;
    private BigDecimal pnlPercent;
    private BigDecimal change;
    private BigDecimal changePercent;
}
