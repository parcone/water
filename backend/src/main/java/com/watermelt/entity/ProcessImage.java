package com.watermelt.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "process_images")
public class ProcessImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MeltingProcess process;

    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private LocalDateTime captureTime;
    private LocalDateTime analysisTime;
    private String description;
    private String analysisResults;
    private Double meltedAreaPercentage;
    private Double temperatureAtCapture;
    private Double qualityScore;
} 