package com.watermelt.repository;

import com.watermelt.entity.ProcessData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ProcessDataRepository extends JpaRepository<ProcessData, Long> {
    List<ProcessData> findByProcess_IdOrderByTimestampDesc(Long processId);
    
    @Query("SELECT pd FROM ProcessData pd WHERE pd.process.id = :processId " +
           "AND pd.timestamp BETWEEN :startTime AND :endTime " +
           "ORDER BY pd.timestamp")
    List<ProcessData> findProcessDataInTimeRange(
        @Param("processId") Long processId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
    
    @Query("SELECT pd FROM ProcessData pd WHERE pd.process.id = :processId " +
           "AND (pd.temperature > :maxTemp OR pd.temperature < :minTemp " +
           "OR pd.pressure > :maxPressure OR pd.pressure < :minPressure " +
           "OR pd.flowRate > :maxFlowRate OR pd.flowRate < :minFlowRate)")
    List<ProcessData> findAnomalousData(
        @Param("processId") Long processId,
        @Param("maxTemp") Double maxTemp,
        @Param("minTemp") Double minTemp,
        @Param("maxPressure") Double maxPressure,
        @Param("minPressure") Double minPressure,
        @Param("maxFlowRate") Double maxFlowRate,
        @Param("minFlowRate") Double minFlowRate
    );
    
    @Query("SELECT AVG(pd.temperature) FROM ProcessData pd " +
           "WHERE pd.process.id = :processId " +
           "AND pd.timestamp >= :since")
    Double calculateAverageTemperature(
        @Param("processId") Long processId,
        @Param("since") LocalDateTime since
    );
    
    Optional<ProcessData> findFirstByProcess_IdOrderByTimestampDesc(Long processId);

    default ProcessData findLatestDataPoint(Long processId) {
        return findFirstByProcess_IdOrderByTimestampDesc(processId).orElse(null);
    }
} 