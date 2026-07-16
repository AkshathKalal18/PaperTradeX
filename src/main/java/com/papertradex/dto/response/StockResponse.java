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
public class StockResponse {
    private Long id;
    private String symbol;
    private String companyName;
    private BigDecimal lastPrice;
    private BigDecimal open;
    private BigDecimal high;
    private BigDecimal low;
    private BigDecimal previousClose;
    private BigDecimal change;
    private BigDecimal changePercent;
    private Long volume;
    private String sector;
    private String exchange;
    private String logo;
    private String weburl;
    private Instant updatedAt;
}
