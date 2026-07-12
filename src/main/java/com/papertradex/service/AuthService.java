package com.papertradex.service;

import com.papertradex.dto.request.LoginRequest;
import com.papertradex.dto.request.RegisterRequest;
import com.papertradex.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}
