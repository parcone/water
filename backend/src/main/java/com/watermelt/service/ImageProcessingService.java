package com.watermelt.service;

import com.watermelt.entity.MeltingProcess;
import com.watermelt.entity.ProcessImage;
import com.watermelt.repository.MeltingProcessRepository;
import com.watermelt.repository.ProcessImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ImageProcessingService {
    private final ProcessImageRepository imageRepository;
    private final MeltingProcessRepository processRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public ProcessImage saveImage(Long processId, MultipartFile file, String description) throws IOException {
        MeltingProcess process = processRepository.findById(processId)
            .orElseThrow(() -> new RuntimeException("Process not found"));

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String newFilename = UUID.randomUUID().toString() + extension;
        Path filePath = uploadPath.resolve(newFilename);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        // Create image entity
        ProcessImage image = new ProcessImage();
        image.setProcess(process);
        image.setFileName(newFilename);
        image.setFilePath(filePath.toString());
        image.setFileType(file.getContentType());
        image.setFileSize(file.getSize());
        image.setCaptureTime(LocalDateTime.now());
        image.setDescription(description);
        image.setTemperatureAtCapture(process.getCurrentTemperature());

        // Save and analyze
        ProcessImage saved = imageRepository.save(image);
        analyzeImage(saved.getId());

        return saved;
    }

    @Async
    @Transactional
    public void analyzeImage(Long imageId) {
        ProcessImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found"));

        try {
            // Simulate image analysis (replace with actual implementation)
            Thread.sleep(2000); // Simulate processing time

            // Example analysis results
            double meltedArea = calculateMeltedArea(image.getFilePath());
            String analysisResults = generateAnalysisResults(meltedArea);

            // Update image with analysis results
            image.setMeltedAreaPercentage(meltedArea);
            image.setAnalysisResults(analysisResults);
            image.setAnalysisTime(LocalDateTime.now());

            imageRepository.save(image);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Image analysis interrupted", e);
        }
    }

    private double calculateMeltedArea(String imagePath) {
        // TODO: Implement actual image analysis using OpenCV or similar library
        // This is a placeholder implementation
        return Math.random() * 100; // Returns random percentage between 0 and 100
    }

    private String generateAnalysisResults(double meltedArea) {
        StringBuilder results = new StringBuilder();
        results.append("Melted Area: ").append(String.format("%.2f%%", meltedArea)).append("\n");

        if (meltedArea < 25) {
            results.append("Status: Early melting phase");
        } else if (meltedArea < 75) {
            results.append("Status: Active melting phase");
        } else {
            results.append("Status: Final melting phase");
        }

        return results.toString();
    }

    @Transactional(readOnly = true)
    public byte[] getImageData(Long imageId) throws IOException {
        ProcessImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found"));

        Path imagePath = Paths.get(image.getFilePath());
        return Files.readAllBytes(imagePath);
    }

    @Transactional
    public void deleteImage(Long imageId) throws IOException {
        ProcessImage image = imageRepository.findById(imageId)
            .orElseThrow(() -> new RuntimeException("Image not found"));

        // Delete file from filesystem
        Path imagePath = Paths.get(image.getFilePath());
        Files.deleteIfExists(imagePath);

        // Delete from database
        imageRepository.delete(image);
    }
} 