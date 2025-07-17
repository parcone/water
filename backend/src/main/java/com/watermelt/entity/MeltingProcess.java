package com.watermelt.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Entity
@Table(name = "melting_processes")
public class MeltingProcess {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double targetTemperature;
    private Double currentTemperature;
    private Double meltingRate;
    private Double totalVolume;
    private Double currentVolume;
    private String notes;
    private boolean alarmActive;
    private String alarmConditions;

    @Enumerated(EnumType.STRING)
    private ProcessStatus status;

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProcessData> processData = new ArrayList<>();

    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProcessImage> processImages = new ArrayList<>();

    public List<ProcessData> getDataPoints() {
        return processData;
    }

    public List<ProcessImage> getImages() {
        return processImages;
    }
} 