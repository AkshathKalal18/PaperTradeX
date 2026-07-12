package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.entity.Stock;
import com.papertradex.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final StockRepository stockRepository;

    private static final String[] SENTIMENTS = {"POSITIVE", "NEUTRAL", "NEGATIVE"};
    private static final String[] SOURCES = {"Reuters", "Bloomberg", "CNBC", "WSJ", "MarketWatch", "FT", "Benzinga"};
    private static final String[][] TEMPLATES = {
        {"%s Surges After Strong Earnings Beat", "POSITIVE"},
        {"%s Reports Record Revenue in Q4", "POSITIVE"},
        {"%s Launches Revolutionary AI Product Line", "POSITIVE"},
        {"%s Gains Market Share Amid Industry Growth", "POSITIVE"},
        {"%s Announces $5B Stock Buyback Program", "POSITIVE"},
        {"%s Slips on Disappointing Guidance", "NEGATIVE"},
        {"%s Faces Regulatory Scrutiny in EU Markets", "NEGATIVE"},
        {"%s Misses Earnings Estimates for Third Quarter", "NEGATIVE"},
        {"%s Shares Drop on Leadership Changes", "NEGATIVE"},
        {"%s Under Pressure as Competition Intensifies", "NEGATIVE"},
        {"%s Holds Steady Amid Mixed Market Signals", "NEUTRAL"},
        {"%s Analysts Set Price Targets Ahead of Earnings", "NEUTRAL"},
        {"%s Partners With Major Tech Giant", "NEUTRAL"},
        {"Market Watch: %s Eyes New Highs", "NEUTRAL"},
        {"%s Expands Into Emerging Markets", "NEUTRAL"}
    };

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNews(
            @RequestParam(defaultValue = "20") int limit) {
        List<Stock> stocks = stockRepository.findAll();
        List<Map<String, Object>> articles = new ArrayList<>();
        Random rng = new Random();
        Instant now = Instant.now();

        for (int i = 0; i < Math.min(limit, 30); i++) {
            Stock stock = stocks.get(rng.nextInt(stocks.size()));
            String[] template = TEMPLATES[rng.nextInt(TEMPLATES.length)];
            String title = String.format(template[0], stock.getCompanyName());
            String sentiment = template[1];

            Map<String, Object> article = new LinkedHashMap<>();
            article.put("id", UUID.randomUUID().toString());
            article.put("title", title);
            article.put("symbol", stock.getSymbol());
            article.put("companyName", stock.getCompanyName());
            article.put("source", SOURCES[rng.nextInt(SOURCES.length)]);
            article.put("sentiment", sentiment);
            article.put("publishedAt", now.minus(rng.nextInt(48), ChronoUnit.HOURS).toString());
            article.put("url", "https://finance.example.com/news/" + stock.getSymbol().toLowerCase() + "-" + i);
            article.put("summary", generateSummary(stock.getCompanyName(), sentiment));
            articles.add(article);
        }

        articles.sort((a, b) -> ((String) b.get("publishedAt")).compareTo((String) a.get("publishedAt")));
        return ResponseEntity.ok(ApiResponse.success(articles));
    }

    private String generateSummary(String company, String sentiment) {
        return switch (sentiment) {
            case "POSITIVE" -> company + " demonstrated outstanding performance this quarter, with analysts upgrading their outlook and institutional investors increasing their positions in the stock.";
            case "NEGATIVE" -> company + " faces headwinds as market conditions tighten. Analysts have revised their price targets downward amid growing uncertainty.";
            default -> company + " remains in focus as investors assess the company's strategic direction and long-term growth prospects in an evolving market landscape.";
        };
    }
}
