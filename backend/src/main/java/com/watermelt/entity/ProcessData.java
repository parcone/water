package com.watermelt.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@Entity
@Table(name = "process_data")
public class ProcessData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    private MeltingProcess process;

    private LocalDateTime timestamp;
    private Double temperature;
    private Double pressure;
    
    @Column(name = "flow_rate")
    private Double flowRate;
    private Double volume;
    private Double density;
    private Double viscosity;
    private String quality;
    private String notes;
} 