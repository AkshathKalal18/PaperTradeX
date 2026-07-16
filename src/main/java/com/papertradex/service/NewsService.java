package com.papertradex.service;

import java.util.List;
import java.util.Map;

public interface NewsService {
    List<Map<String, Object>> getNews(String symbol, int limit);
}
