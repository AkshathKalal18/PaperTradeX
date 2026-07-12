package com.papertradex.config;

import com.papertradex.entity.Portfolio;
import com.papertradex.entity.Stock;
import com.papertradex.entity.User;
import com.papertradex.enums.Role;
import com.papertradex.repository.PortfolioRepository;
import com.papertradex.repository.StockRepository;
import com.papertradex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockDataInitializer implements CommandLineRunner {

    private final StockRepository stockRepository;
    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initializeStocks();
        initializeUsers();
    }

    private void initializeStocks() {
        if (stockRepository.count() == 0) {
            log.info("Initializing default stocks in database...");
            List<Stock> stocks = List.of(
                    Stock.builder().symbol("AAPL").companyName("Apple Inc.").lastPrice(new BigDecimal("225.50")).previousClose(new BigDecimal("224.10")).change(new BigDecimal("1.40")).changePercent(new BigDecimal("0.62")).sector("Technology").exchange("NASDAQ").build(),
                    Stock.builder().symbol("MSFT").companyName("Microsoft Corporation").lastPrice(new BigDecimal("420.20")).previousClose(new BigDecimal("422.50")).change(new BigDecimal("-2.30")).changePercent(new BigDecimal("-0.54")).sector("Technology").exchange("NASDAQ").build(),
                    Stock.builder().symbol("NVDA").companyName("NVIDIA Corporation").lastPrice(new BigDecimal("127.80")).previousClose(new BigDecimal("122.30")).change(new BigDecimal("5.50")).changePercent(new BigDecimal("4.50")).sector("Technology").exchange("NASDAQ").build(),
                    Stock.builder().symbol("TSLA").companyName("Tesla Inc.").lastPrice(new BigDecimal("185.30")).previousClose(new BigDecimal("189.40")).change(new BigDecimal("-4.10")).changePercent(new BigDecimal("-2.16")).sector("Automotive").exchange("NASDAQ").build(),
                    Stock.builder().symbol("AMZN").companyName("Amazon.com Inc.").lastPrice(new BigDecimal("193.10")).previousClose(new BigDecimal("191.20")).change(new BigDecimal("1.90")).changePercent(new BigDecimal("0.99")).sector("Consumer Cyclical").exchange("NASDAQ").build(),
                    Stock.builder().symbol("GOOGL").companyName("Alphabet Inc.").lastPrice(new BigDecimal("180.40")).previousClose(new BigDecimal("181.10")).change(new BigDecimal("-0.70")).changePercent(new BigDecimal("-0.39")).sector("Communication").exchange("NASDAQ").build(),
                    Stock.builder().symbol("NFLX").companyName("Netflix Inc.").lastPrice(new BigDecimal("685.00")).previousClose(new BigDecimal("675.20")).change(new BigDecimal("9.80")).changePercent(new BigDecimal("1.45")).sector("Communication").exchange("NASDAQ").build(),
                    Stock.builder().symbol("COIN").companyName("Coinbase Global Inc.").lastPrice(new BigDecimal("210.60")).previousClose(new BigDecimal("201.20")).change(new BigDecimal("9.40")).changePercent(new BigDecimal("4.67")).sector("Financial Services").exchange("NASDAQ").build()
            );
            stockRepository.saveAll(stocks);
            log.info("Successfully initialized {} stocks.", stocks.size());
        }
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            log.info("Initializing default user and admin accounts...");
            
            // Create Admin
            User admin = User.builder()
                    .email("admin@papertradex.com")
                    .password(passwordEncoder.encode("adminpassword"))
                    .fullName("Platform Administrator")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin account created (admin@papertradex.com / adminpassword)");

            // Create Regular User
            User user = User.builder()
                    .email("user@papertradex.com")
                    .password(passwordEncoder.encode("userpassword"))
                    .fullName("John Doe")
                    .role(Role.USER)
                    .build();
            userRepository.save(user);
            log.info("User account created (user@papertradex.com / userpassword)");

            // Give John Doe a default portfolio
            Portfolio portfolio = Portfolio.builder()
                    .user(user)
                    .name("Main Portfolio")
                    .initialBalance(new BigDecimal("100000.00"))
                    .cashBalance(new BigDecimal("100000.00"))
                    .build();
            portfolioRepository.save(portfolio);
            log.info("Created default portfolio for user@papertradex.com");
        }
    }
}
