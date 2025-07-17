package com.watermelt.controller;

import com.watermelt.entity.ProcessImage;
import com.watermelt.service.ImageProcessingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/images")
@RequiredArgsConstructor
@Tag(name = "Process Images", description = "Endpoints for managing process images")
public class ImageController {
    private final ImageProcessingService imageService;

    @PostMapping("/{processId}")
    @Operation(summary = "Upload a new process image")
    public ResponseEntity<ProcessImage> uploadImage(
            @PathVariable Long processId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) throws IOException {
        ProcessImage image = imageService.saveImage(processId, file, description);
        return ResponseEntity.ok(image);
    }

    @GetMapping("/{imageId}")
    @Operation(summary = "Get image data")
    public ResponseEntity<byte[]> getImage(@PathVariable Long imageId) throws IOException {
        byte[] imageData = imageService.getImageData(imageId);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(imageData);
    }

    @DeleteMapping("/{imageId}")
    @Operation(summary = "Delete an image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long imageId) throws IOException {
        imageService.deleteImage(imageId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{imageId}/analyze")
    @Operation(summary = "Trigger image analysis")
    public ResponseEntity<Void> analyzeImage(@PathVariable Long imageId) {
        imageService.analyzeImage(imageId);
        return ResponseEntity.accepted().build();
    }
} 