package com.kannagi.legal;

import com.kannagi.legal.domain.LegalResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface LegalRepository extends JpaRepository<LegalResource, UUID> {

    List<LegalResource> findByActiveTrue();

    @Query("select r from LegalResource r where r.active = true "
         + "and lower(r.issueCategories) like lower(concat('%', :category, '%'))")
    List<LegalResource> findByCategory(@Param("category") String category);
}
