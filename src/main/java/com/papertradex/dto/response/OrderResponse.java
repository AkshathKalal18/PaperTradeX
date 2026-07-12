package com.papertradex.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    private Long id;
    private Long portfolioId;
    private String symbol;
    private String companyName;
    private String side;
    private String type;
    private String status;
    private Integer quantity;
    private BigDecimal limitPrice;
    private BigDecimal filledPrice;
    private BigDecimal totalValue;
    private Instant createdAt;
}
