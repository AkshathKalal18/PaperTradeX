package com.papertradex.service;

import com.papertradex.entity.Stock;
import com.papertradex.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockPriceSimulator {

    private final StockRepository stockRepository;
    private final Random random = new Random();

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void simulatePriceMovements() {
        List<Stock> stocks = stockRepository.findAll();
        if (stocks.isEmpty()) return;

        log.debug("Simulating stock price movements...");
        for (Stock stock : stocks) {
            BigDecimal currentPrice = stock.getLastPrice();
            
            // Random price change between -1.5% and +1.5%
            double changePercent = (random.nextDouble() * 3.0) - 1.5;
            BigDecimal multiplier = BigDecimal.valueOf(1.0 + (changePercent / 100.0));
            BigDecimal newPrice = currentPrice.multiply(multiplier).setScale(4, RoundingMode.HALF_UP);

            BigDecimal previousClose = stock.getPreviousClose();
            if (previousClose.compareTo(BigDecimal.ZERO) == 0) {
                previousClose = currentPrice;
                stock.setPreviousClose(previousClose);
            }

            BigDecimal change = newPrice.subtract(previousClose).setScale(4, RoundingMode.HALF_UP);
            BigDecimal changePct = change.divide(previousClose, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

            stock.setLastPrice(newPrice);
            stock.setChange(change);
            stock.setChangePercent(changePct);
        }
        
        stockRepository.saveAll(stocks);
    }
}
