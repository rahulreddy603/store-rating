package com.storerating.dto;

import com.storerating.model.User;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class AppDTO {

    // ─── AUTH ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegisterRequest {
        @NotBlank @Size(min = 20, max = 60)
        private String name;

        @NotBlank @Email
        private String email;

        @NotBlank @Size(max = 400)
        private String address;

        @NotBlank
        @Size(min = 8, max = 16)
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,16}$",
                 message = "Password must be 8-16 chars with at least one uppercase letter and one special character")
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        @Builder.Default
        private String type = "Bearer";
        private Long id;
        private String name;
        private String email;
        private String role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ChangePasswordRequest {
        @NotBlank private String currentPassword;

        @NotBlank
        @Size(min = 8, max = 16)
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,16}$",
                 message = "Password must be 8-16 chars with at least one uppercase and one special character")
        private String newPassword;
    }

    // ─── USER ────────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateUserRequest {
        @NotBlank @Size(min = 20, max = 60) private String name;
        @NotBlank @Email                    private String email;
        @NotBlank @Size(max = 400)          private String address;

        @NotBlank
        @Size(min = 8, max = 16)
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?]).{8,16}$",
                 message = "Password must be 8-16 chars with at least one uppercase and one special character")
        private String password;

        @NotNull
        private User.Role role;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private String address;
        private String role;
        private Double storeRating;    // only for STORE_OWNER
        private LocalDateTime createdAt;

        public static UserResponse from(com.storerating.model.User user, Double storeRating) {
            return UserResponse.builder()
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .address(user.getAddress())
                    .role(user.getRole().name())
                    .storeRating(storeRating)
                    .createdAt(user.getCreatedAt())
                    .build();
        }
    }

    // ─── STORE ───────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateStoreRequest {
        @NotBlank @Size(min = 20, max = 60) private String name;
        @NotBlank @Email                    private String email;
        @NotBlank @Size(max = 400)          private String address;
        private Long ownerId;   // optional — links to an existing STORE_OWNER user
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StoreResponse {
        private Long id;
        private String name;
        private String email;
        private String address;
        private Double averageRating;
        private Integer userRating;     // current user's rating (for USER role)
        private Long ownerId;
        private String ownerName;
        private LocalDateTime createdAt;
    }

    // ─── RATING ──────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class SubmitRatingRequest {
        @NotNull @Min(1) @Max(5)
        private Integer value;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RatingResponse {
        private Long id;
        private Integer value;
        private Long userId;
        private String userName;
        private String userEmail;
        private Long storeId;
        private String storeName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ─── ADMIN DASHBOARD ────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long totalStores;
        private long totalRatings;
        private long totalAdmins;
        private long totalStoreOwners;
        private long totalNormalUsers;
    }

    // ─── STORE OWNER DASHBOARD ───────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class StoreOwnerDashboard {
        private String storeName;
        private Double averageRating;
        private long totalRatings;
        private List<RatingResponse> ratingsList;
    }

    // ─── COMMON ──────────────────────────────────────────────────────────

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(String msg, T data) {
            return new ApiResponse<>(true, msg, data);
        }
        public static <T> ApiResponse<T> error(String msg) {
            return new ApiResponse<>(false, msg, null);
        }
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}