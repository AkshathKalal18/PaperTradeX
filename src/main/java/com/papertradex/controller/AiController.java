package com.papertradex.controller;

import com.papertradex.dto.response.ApiResponse;
import com.papertradex.entity.User;
import com.papertradex.exception.ResourceNotFoundException;
import com.papertradex.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final UserRepository userRepository;

    @Value("${openai.api.key:}")
    private String openAiKey;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chat(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {

        String message = body.getOrDefault("message", "").trim();
        if (message.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("reply", "Please ask me something about the markets!")));
        }

        String reply = generateAiReply(message);
        return ResponseEntity.ok(ApiResponse.success(Map.of("reply", reply)));
    }

    private String generateAiReply(String message) {
        String lowerMsg = message.toLowerCase();

        if (lowerMsg.contains("buy") && (lowerMsg.contains("stock") || lowerMsg.contains("share"))) {
            return "📈 Before buying any stock, I recommend doing thorough research. Look at:\n" +
                   "• **P/E Ratio** – Is it fairly valued?\n" +
                   "• **Revenue Growth** – Is the business expanding?\n" +
                   "• **Debt-to-Equity** – Can they handle their debt?\n" +
                   "• **Market Moat** – Does the company have a competitive advantage?\n\n" +
                   "Remember: Never invest more than you can afford to lose! 🎯";
        } else if (lowerMsg.contains("portfolio") || lowerMsg.contains("diversif")) {
            return "🗂️ Portfolio diversification is key to managing risk! Here are some tips:\n\n" +
                   "• **Rule of 100**: Subtract your age from 100 for your stock allocation %\n" +
                   "• **Sector spread**: Don't put all your eggs in tech or any single sector\n" +
                   "• **Geographic diversification**: Consider international ETFs\n" +
                   "• **Rebalance quarterly**: Maintain your target allocation over time\n\n" +
                   "A well-diversified portfolio should weather most market conditions! 💪";
        } else if (lowerMsg.contains("market") && (lowerMsg.contains("crash") || lowerMsg.contains("bear"))) {
            return "🐻 Bear markets are a normal part of investing cycles. Historical data shows:\n\n" +
                   "• Average bear market lasts ~9-16 months\n" +
                   "• Markets historically recover and reach new highs\n" +
                   "• Crashes can be buying opportunities for long-term investors\n" +
                   "• **Dollar-cost averaging (DCA)** helps reduce timing risk\n\n" +
                   "Stay calm, stay the course, and don't panic sell! 🧘";
        } else if (lowerMsg.contains("crypto") || lowerMsg.contains("bitcoin")) {
            return "₿ Cryptocurrency is a high-risk, high-reward asset class. Key points:\n\n" +
                   "• Extremely volatile — can swing 20-30% in days\n" +
                   "• Not backed by any physical asset or government\n" +
                   "• Recommended allocation: No more than 5-10% of portfolio\n" +
                   "• Always store in a hardware wallet for security\n\n" +
                   "Crypto can be exciting, but never invest what you can't afford to lose! ⚡";
        } else if (lowerMsg.contains("etf") || lowerMsg.contains("index fund")) {
            return "📊 ETFs and Index Funds are excellent for passive investing!\n\n" +
                   "**Popular ETFs to consider:**\n" +
                   "• **SPY/VOO** – S&P 500 (broad market)\n" +
                   "• **QQQ** – NASDAQ 100 (tech-heavy)\n" +
                   "• **VTI** – Total US Market\n" +
                   "• **VXUS** – International markets\n\n" +
                   "Warren Buffett himself recommends low-cost index funds for most investors! 🎩";
        } else if (lowerMsg.contains("aapl") || lowerMsg.contains("apple")) {
            return "🍎 **Apple (AAPL)** is one of the world's most valuable companies.\n\n" +
                   "**Key metrics to watch:**\n" +
                   "• iPhone sales (largest revenue driver)\n" +
                   "• Services revenue (App Store, iCloud, Apple TV+)\n" +
                   "• China market exposure\n" +
                   "• Upcoming product cycles (Vision Pro, foldable iPhone rumours)\n\n" +
                   "Apple has returned trillions to shareholders through buybacks! 💰";
        } else if (lowerMsg.contains("tesla") || lowerMsg.contains("tsla")) {
            return "⚡ **Tesla (TSLA)** is a high-volatility growth stock.\n\n" +
                   "**Bull case:** EV market leadership, FSD monetization, energy storage growth\n" +
                   "**Bear case:** Increasing competition, valuation premium, Elon Musk distractions\n\n" +
                   "Tesla is not just a car company — it's also an AI and energy company. DYOR! 🚗";
        } else if (lowerMsg.contains("hello") || lowerMsg.contains("hi ") || lowerMsg.equals("hi")) {
            return "👋 Hello! I'm your **PaperTradeX AI Advisor**.\n\n" +
                   "I can help you with:\n" +
                   "• 📈 Stock analysis and tips\n" +
                   "• 🗂️ Portfolio diversification strategies\n" +
                   "• 📊 Understanding ETFs and index funds\n" +
                   "• 🐻 Navigating bear markets\n" +
                   "• 💡 General investing education\n\n" +
                   "Ask me anything about investing! 🎯";
        } else if (lowerMsg.contains("nvda") || lowerMsg.contains("nvidia")) {
            return "🖥️ **NVIDIA (NVDA)** has become the poster child for the AI revolution.\n\n" +
                   "**Why the hype?**\n" +
                   "• Dominates GPU market for AI training (H100/H200 chips)\n" +
                   "• Data center revenue growing exponentially\n" +
                   "• CUDA ecosystem creates strong moat\n\n" +
                   "**Risk:** High valuation, competition from AMD/Intel/custom chips. Trade carefully! 🤖";
        } else {
            return "🤖 Great question! As your AI finance advisor, here's my take:\n\n" +
                   "Investing is a marathon, not a sprint. Key principles:\n" +
                   "• **Time in market** beats timing the market\n" +
                   "• **Compound interest** is the 8th wonder of the world\n" +
                   "• **Risk management** is more important than returns\n" +
                   "• **Stay informed** but don't react to every headline\n\n" +
                   "Feel free to ask me about specific stocks, portfolio strategies, or market concepts! 📚";
        }
    }
}
