package com.papertradex.dto.request;

import com.papertradex.enums.OrderSide;
import com.papertradex.enums.OrderType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {

    @NotNull
    private Long portfolioId;

    @NotBlank
    private String symbol;

    @NotNull
    private OrderSide side;

    @NotNull
    private OrderType type;

    @NotNull
    @Min(1)
    private Integer quantity;

    private BigDecimal limitPrice; // null for MARKET orders
}
