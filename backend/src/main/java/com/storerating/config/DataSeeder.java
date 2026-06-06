package com.storerating.config;

import com.storerating.model.User;
import com.storerating.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Seed default admin if not exists
        if (!userRepository.existsByEmail("admin@storerating.com")) {
            User admin = User.builder()
                    .name("System Administrator Account")
                    .email("admin@storerating.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .address("123 Admin Street, System City, SC 00001")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            System.out.println("===========================================");
            System.out.println("  Default Admin Created:");
            System.out.println("  Email:    admin@storerating.com");
            System.out.println("  Password: Admin@123");
            System.out.println("===========================================");
        }
    }
}