package com.watermelt.service;

import com.watermelt.dto.ProcessRequest;
import com.watermelt.entity.MeltingProcess;
import com.watermelt.entity.ProcessData;
import com.watermelt.entity.ProcessStatus;
import com.watermelt.entity.User;
import com.watermelt.repository.MeltingProcessRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeltingProcessService {

    private final MeltingProcessRepository processRepository;
    private final UserService userService;
    private final WebSocketService webSocketService;

    public List<MeltingProcess> getAllProcesses() {
        return processRepository.findAll();
    }

    public MeltingProcess getProcess(Long id) {
        return processRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Process not found"));
    }

    @Transactional
    public MeltingProcess createProcess(ProcessRequest request) {
        User user = getCurrentUser();
        
        MeltingProcess process = new MeltingProcess();
        process.setName(request.getName());
        process.setDescription(request.getDescription());
        process.setTargetTemperature(request.getTargetTemperature());
        process.setUser(user);
        process.setStatus(ProcessStatus.PENDING);
        
        process = processRepository.save(process);
        webSocketService.notifyProcessUpdate(process);
        return process;
    }

    @Transactional
    public MeltingProcess updateProcess(Long id, ProcessRequest request) {
        MeltingProcess process = getProcess(id);
        
        process.setName(request.getName());
        process.setDescription(request.getDescription());
        process.setTargetTemperature(request.getTargetTemperature());
        
        process = processRepository.save(process);
        webSocketService.notifyProcessUpdate(process);
        return process;
    }

    @Transactional
    public void deleteProcess(Long id) {
        MeltingProcess process = getProcess(id);
        processRepository.delete(process);
    }

    @Transactional
    public MeltingProcess startProcess(Long id) {
        MeltingProcess process = getProcess(id);
        process.setStatus(ProcessStatus.RUNNING);
        process.setStartTime(LocalDateTime.now());
        
        process = processRepository.save(process);
        webSocketService.notifyProcessUpdate(process);
        return process;
    }

    @Transactional
    public MeltingProcess stopProcess(Long id) {
        MeltingProcess process = getProcess(id);
        process.setStatus(ProcessStatus.COMPLETED);
        process.setEndTime(LocalDateTime.now());
        
        process = processRepository.save(process);
        webSocketService.notifyProcessUpdate(process);
        return process;
    }

    public List<ProcessData> getProcessData(Long id, String timeRange) {
        MeltingProcess process = getProcess(id);
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime;
        
        if (timeRange == null) {
            startTime = endTime.minus(1, ChronoUnit.HOURS);
        } else {
            switch (timeRange.toLowerCase()) {
                case "hour" -> startTime = endTime.minus(1, ChronoUnit.HOURS);
                case "day" -> startTime = endTime.minus(1, ChronoUnit.DAYS);
                case "week" -> startTime = endTime.minus(7, ChronoUnit.DAYS);
                case "month" -> startTime = endTime.minus(30, ChronoUnit.DAYS);
                default -> startTime = endTime.minus(1, ChronoUnit.HOURS);
            }
        }
        
        return process.getProcessData().stream()
                .filter(data -> !data.getTimestamp().isBefore(startTime))
                .toList();
    }

    private User getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByUsername(username);
    }
} 