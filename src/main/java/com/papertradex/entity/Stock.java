package com.papertradex.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "stocks")
public class Stock extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String symbol;

    @Column(nullable = false, length = 200)
    private String companyName;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal lastPrice;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal previousClose = BigDecimal.ZERO;

    @Column(precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal change = BigDecimal.ZERO;

    @Column(precision = 10, scale = 4)
    @Builder.Default
    private BigDecimal changePercent = BigDecimal.ZERO;

    @Column(length = 100)
    private String sector;

    @Column(length = 10)
    private String exchange;
}

