package com.watermelt.repository;

import com.watermelt.entity.ProcessImage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProcessImageRepository extends JpaRepository<ProcessImage, Long> {
    Page<ProcessImage> findByProcessId(Long processId, Pageable pageable);
    
    @Query("SELECT pi FROM ProcessImage pi WHERE pi.process.id = :processId " +
           "AND pi.captureTime BETWEEN :startTime AND :endTime " +
           "ORDER BY pi.captureTime")
    List<ProcessImage> findImagesByTimeRange(
        @Param("processId") Long processId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT pi FROM ProcessImage pi WHERE pi.process.id = :processId " +
           "AND pi.meltedAreaPercentage >= :threshold")
    List<ProcessImage> findImagesWithMeltedAreaAboveThreshold(
        @Param("processId") Long processId,
        @Param("threshold") Double threshold
    );
    
    @Query("SELECT pi FROM ProcessImage pi WHERE pi.process.id = :processId " +
           "ORDER BY pi.captureTime DESC LIMIT 1")
    ProcessImage findLatestImage(@Param("processId") Long processId);
    
    @Query("SELECT COUNT(pi) FROM ProcessImage pi WHERE pi.process.id = :processId " +
           "AND pi.analysisTime IS NOT NULL")
    long countAnalyzedImages(@Param("processId") Long processId);
} 