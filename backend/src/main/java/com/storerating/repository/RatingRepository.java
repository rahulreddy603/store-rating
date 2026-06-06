package com.storerating.repository;

import com.storerating.model.Rating;
import com.storerating.model.Store;
import com.storerating.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    Optional<Rating> findByUserAndStore(User user, Store store);

    List<Rating> findByStore(Store store);

    List<Rating> findByUser(User user);

    @Query("SELECT AVG(r.value) FROM Rating r WHERE r.store = :store")
    Double findAverageRatingByStore(@Param("store") Store store);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.store.owner = :owner")
    long countByStoreOwner(@Param("owner") User owner);

    boolean existsByUserAndStore(User user, Store store);
}