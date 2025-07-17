package com.watermelt.controller;

import com.watermelt.dto.ProcessRequest;
import com.watermelt.entity.MeltingProcess;
import com.watermelt.service.MeltingProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.watermelt.entity.ProcessData;

@RestController
@RequestMapping("/api/processes")
@RequiredArgsConstructor
public class MeltingProcessController {

    private final MeltingProcessService processService;

    @GetMapping
    public ResponseEntity<List<MeltingProcess>> getAllProcesses() {
        return ResponseEntity.ok(processService.getAllProcesses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MeltingProcess> getProcess(@PathVariable Long id) {
        return ResponseEntity.ok(processService.getProcess(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<MeltingProcess> createProcess(@Valid @RequestBody ProcessRequest request) {
        return ResponseEntity.ok(processService.createProcess(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<MeltingProcess> updateProcess(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRequest request
    ) {
        return ResponseEntity.ok(processService.updateProcess(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProcess(@PathVariable Long id) {
        processService.deleteProcess(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<MeltingProcess> startProcess(@PathVariable Long id) {
        return ResponseEntity.ok(processService.startProcess(id));
    }

    @PostMapping("/{id}/stop")
    @PreAuthorize("hasRole('OPERATOR')")
    public ResponseEntity<MeltingProcess> stopProcess(@PathVariable Long id) {
        return ResponseEntity.ok(processService.stopProcess(id));
    }

    @GetMapping("/{id}/data")
    public ResponseEntity<List<ProcessData>> getProcessData(
            @PathVariable Long id,
            @RequestParam(required = false) String timeRange
    ) {
        return ResponseEntity.ok(processService.getProcessData(id, timeRange));
    }
} 