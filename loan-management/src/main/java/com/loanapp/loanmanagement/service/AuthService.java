package com.loanapp.loanmanagement.service;

import com.loanapp.loanmanagement.dto.request.LoginRequest;
import com.loanapp.loanmanagement.dto.request.RegisterRequest;
import com.loanapp.loanmanagement.dto.response.AuthResponse;
import com.loanapp.loanmanagement.entity.User;
import com.loanapp.loanmanagement.enums.Role;
import com.loanapp.loanmanagement.exception.ResourceNotFoundException;
import com.loanapp.loanmanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalStateException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .annualIncome(request.getAnnualIncome())
                .creditScore(request.getCreditScore())
                .role(Role.USER)
                .isActive(true)
                .build();
        userRepository.save(user);
        return buildAuthResponse(user, jwtService.generateToken(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return buildAuthResponse(user, jwtService.generateToken(user));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .expiresIn(86400000L)
                .build();
    }
}
