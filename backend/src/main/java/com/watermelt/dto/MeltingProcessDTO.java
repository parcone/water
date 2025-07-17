package com.watermelt.dto;

import com.watermelt.entity.MeltingProcess;
import com.watermelt.entity.ProcessStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeltingProcessDTO {
    private Long id;
    private String name;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private ProcessStatus status;
    private Double targetTemperature;
    private Double currentTemperature;
    private Double meltingRate;
    private Double totalVolume;
    private Double currentVolume;
    private Long userId;
    private String userName;
    private String notes;
    private boolean alarmActive;
    private String alarmConditions;
    private int imageCount;
    private int dataPointCount;
    
    // Latest metrics
    private Double latestTemperature;
    private Double latestHumidity;
    private Double latestPressure;
    private Double latestFlowRate;
    private LocalDateTime lastUpdated;
    
    // Process statistics
    private Double averageTemperature;
    private Double maxTemperature;
    private Double minTemperature;
    private Double completionPercentage;
    private Long duration; // in seconds
    
    public static MeltingProcessDTO fromEntity(MeltingProcess process) {
        MeltingProcessDTO dto = new MeltingProcessDTO();
        dto.setId(process.getId());
        dto.setName(process.getName());
        dto.setStartTime(process.getStartTime());
        dto.setEndTime(process.getEndTime());
        dto.setStatus(process.getStatus());
        dto.setTargetTemperature(process.getTargetTemperature());
        dto.setCurrentTemperature(process.getCurrentTemperature());
        dto.setMeltingRate(process.getMeltingRate());
        dto.setTotalVolume(process.getTotalVolume());
        dto.setCurrentVolume(process.getCurrentVolume());
        dto.setUserId(process.getUser().getId());
        dto.setUserName(process.getUser().getUsername());
        dto.setNotes(process.getNotes());
        dto.setAlarmActive(process.isAlarmActive());
        dto.setAlarmConditions(process.getAlarmConditions());
        dto.setImageCount(process.getImages().size());
        dto.setDataPointCount(process.getDataPoints().size());
        return dto;
    }
} 