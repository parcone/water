package com.watermelt.service;

import com.watermelt.entity.MeltingProcess;
import com.watermelt.entity.ProcessData;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class WebSocketService {

    private final SimpMessagingTemplate messagingTemplate;
    
    // 用于存储每个进程的告警状态
    private final Map<Long, Map<String, Boolean>> processAlarmStatus = new ConcurrentHashMap<>();
    // 用于存储告警恢复的时间阈值（分钟）
    private static final int ALARM_RECOVERY_THRESHOLD = 5;

    public void notifyProcessUpdate(MeltingProcess process) {
        messagingTemplate.convertAndSend(
            "/topic/process/" + process.getId(),
            process
        );
    }

    public void notifyProcessDataUpdate(ProcessData data) {
        messagingTemplate.convertAndSend(
            "/topic/process/" + data.getProcess().getId() + "/data",
            data
        );
    }

    public void notifyAlarm(Long processId, String alarmMessage) {
        Map<String, Object> alarmData = new HashMap<>();
        alarmData.put("timestamp", LocalDateTime.now());
        alarmData.put("message", alarmMessage);
        alarmData.put("level", determineAlarmLevel(alarmMessage));
        alarmData.put("id", System.currentTimeMillis());

        messagingTemplate.convertAndSend(
            "/topic/process/" + processId + "/alarm",
            alarmData
        );

        // 同时发送系统级告警通知
        messagingTemplate.convertAndSend(
            "/topic/system/alarms",
            alarmData
        );
    }

    public void notifyQualityAlert(Long processId, String qualityMessage) {
        Map<String, Object> alertData = new HashMap<>();
        alertData.put("timestamp", LocalDateTime.now());
        alertData.put("message", qualityMessage);
        alertData.put("type", "quality");
        alertData.put("id", System.currentTimeMillis());

        messagingTemplate.convertAndSend(
            "/topic/process/" + processId + "/quality",
            alertData
        );
    }

    public void notifySystemStatus(Map<String, Object> statusData) {
        messagingTemplate.convertAndSend(
            "/topic/system/status",
            statusData
        );
    }

    public void sendUserNotification(String username, String message) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("timestamp", LocalDateTime.now());
        notification.put("message", message);
        notification.put("id", System.currentTimeMillis());

        messagingTemplate.convertAndSendToUser(
            username,
            "/queue/notifications",
            notification
        );
    }

    public void notifyTrendAnalysis(Long processId, Map<String, String> trends) {
        messagingTemplate.convertAndSend(
            "/topic/process/" + processId + "/trends",
            trends
        );
    }

    public void notifyDeviceStatus(Long deviceId, Map<String, Object> status) {
        messagingTemplate.convertAndSend(
            "/topic/device/" + deviceId + "/status",
            status
        );
    }

    private String determineAlarmLevel(String message) {
        message = message.toLowerCase();
        if (message.contains("严重") || message.contains("危险") || message.contains("超过阈值")) {
            return "severe";
        } else if (message.contains("警告") || message.contains("异常")) {
            return "warning";
        } else {
            return "info";
        }
    }

    public void handleAlarmRecovery(Long processId, String parameter) {
        Map<String, Boolean> alarmStatus = processAlarmStatus.computeIfAbsent(processId, k -> new ConcurrentHashMap<>());
        
        if (alarmStatus.getOrDefault(parameter, false)) {
            // 如果之前有告警，现在恢复了，发送恢复通知
            String recoveryMessage = String.format("%s参数已恢复正常", parameter);
            Map<String, Object> recoveryData = new HashMap<>();
            recoveryData.put("timestamp", LocalDateTime.now());
            recoveryData.put("message", recoveryMessage);
            recoveryData.put("type", "recovery");
            recoveryData.put("parameter", parameter);

            messagingTemplate.convertAndSend(
                "/topic/process/" + processId + "/recovery",
                recoveryData
            );

            // 更新告警状态
            alarmStatus.put(parameter, false);
        }
    }

    public void broadcastSystemMessage(String message, String type) {
        Map<String, Object> broadcastData = new HashMap<>();
        broadcastData.put("timestamp", LocalDateTime.now());
        broadcastData.put("message", message);
        broadcastData.put("type", type);

        messagingTemplate.convertAndSend(
            "/topic/system/broadcast",
            broadcastData
        );
    }
} 