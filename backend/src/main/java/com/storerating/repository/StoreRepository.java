package com.storerating.repository;

import com.storerating.model.Store;
import com.storerating.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    Optional<Store> findByOwner(User owner);
    boolean existsByEmail(String email);

    @Query("SELECT s FROM Store s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%')))")
    Page<Store> findWithFilters(
        @Param("name") String name,
        @Param("address") String address,
        Pageable pageable
    );

    @Query("SELECT s FROM Store s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(s.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:address IS NULL OR LOWER(s.address) LIKE LOWER(CONCAT('%', :address, '%')))")
    Page<Store> findWithAdminFilters(
        @Param("name") String name,
        @Param("email") String email,
        @Param("address") String address,
        Pageable pageable
    );
}