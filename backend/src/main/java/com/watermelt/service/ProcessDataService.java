package com.watermelt.service;

import com.watermelt.entity.ProcessData;
import com.watermelt.repository.ProcessDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class ProcessDataService {
    private final ProcessDataRepository processDataRepository;
    private final WebSocketService webSocketService;

    @Value("${app.process.temperature.max:150.0}")
    private Double maxTemperature;

    @Value("${app.process.temperature.min:0.0}")
    private Double minTemperature;

    @Value("${app.process.pressure.max:10.0}")
    private Double maxPressure;

    @Value("${app.process.pressure.min:0.0}")
    private Double minPressure;

    @Value("${app.process.flowRate.max:100.0}")
    private Double maxFlowRate;

    @Value("${app.process.flowRate.min:0.0}")
    private Double minFlowRate;

    // 异常检测的Z分数阈值
    private static final double Z_SCORE_THRESHOLD = 3.0;
    // 趋势分析的时间窗口（小时）
    private static final int TREND_WINDOW_HOURS = 24;

    @Transactional(readOnly = true)
    public List<ProcessData> findByProcessId(Long processId) {
        return processDataRepository.findByProcess_IdOrderByTimestampDesc(processId);
    }

    @Transactional(readOnly = true)
    public List<ProcessData> findProcessDataInTimeRange(Long processId, LocalDateTime startTime, LocalDateTime endTime) {
        return processDataRepository.findProcessDataInTimeRange(processId, startTime, endTime);
    }

    @Transactional(readOnly = true)
    public List<ProcessData> findAnomalousData(Long processId) {
        return processDataRepository.findAnomalousData(
            processId,
            maxTemperature,
            minTemperature,
            maxPressure,
            minPressure,
            maxFlowRate,
            minFlowRate
        );
    }

    /**
     * 使用Z分数进行智能异常检测
     */
    public Map<String, Boolean> detectAnomalies(ProcessData newData, List<ProcessData> historicalData) {
        Map<String, Boolean> anomalies = new HashMap<>();
        DescriptiveStatistics tempStats = new DescriptiveStatistics();
        DescriptiveStatistics pressureStats = new DescriptiveStatistics();
        DescriptiveStatistics flowStats = new DescriptiveStatistics();

        // 收集历史数据统计信息
        for (ProcessData data : historicalData) {
            tempStats.addValue(data.getTemperature());
            pressureStats.addValue(data.getPressure());
            flowStats.addValue(data.getFlowRate());
        }

        // 检测温度异常
        double tempZScore = calculateZScore(newData.getTemperature(), tempStats.getMean(), tempStats.getStandardDeviation());
        anomalies.put("temperature", Math.abs(tempZScore) > Z_SCORE_THRESHOLD);

        // 检测压力异常
        double pressureZScore = calculateZScore(newData.getPressure(), pressureStats.getMean(), pressureStats.getStandardDeviation());
        anomalies.put("pressure", Math.abs(pressureZScore) > Z_SCORE_THRESHOLD);

        // 检测流速异常
        double flowZScore = calculateZScore(newData.getFlowRate(), flowStats.getMean(), flowStats.getStandardDeviation());
        anomalies.put("flowRate", Math.abs(flowZScore) > Z_SCORE_THRESHOLD);

        // 如果检测到异常，发送告警
        if (anomalies.values().stream().anyMatch(Boolean::booleanValue)) {
            sendAnomalyAlert(newData, anomalies);
        }

        return anomalies;
    }

    /**
     * 分析数据趋势
     */
    public Map<String, String> analyzeTrends(Long processId) {
        LocalDateTime endTime = LocalDateTime.now();
        LocalDateTime startTime = endTime.minusHours(TREND_WINDOW_HOURS);
        List<ProcessData> data = findProcessDataInTimeRange(processId, startTime, endTime);

        Map<String, String> trends = new HashMap<>();
        
        if (!data.isEmpty()) {
            // 分析温度趋势
            double tempTrend = calculateTrend(data, ProcessData::getTemperature);
            trends.put("temperature", getTrendDescription(tempTrend));

            // 分析压力趋势
            double pressureTrend = calculateTrend(data, ProcessData::getPressure);
            trends.put("pressure", getTrendDescription(pressureTrend));

            // 分析流速趋势
            double flowTrend = calculateTrend(data, ProcessData::getFlowRate);
            trends.put("flowRate", getTrendDescription(flowTrend));
        }

        return trends;
    }

    private double calculateZScore(double value, double mean, double stdDev) {
        return stdDev == 0 ? 0 : (value - mean) / stdDev;
    }

    private void sendAnomalyAlert(ProcessData data, Map<String, Boolean> anomalies) {
        StringBuilder message = new StringBuilder("检测到异常数据:\n");
        if (anomalies.get("temperature")) {
            message.append("- 温度异常: ").append(data.getTemperature()).append("°C\n");
        }
        if (anomalies.get("pressure")) {
            message.append("- 压力异常: ").append(data.getPressure()).append(" MPa\n");
        }
        if (anomalies.get("flowRate")) {
            message.append("- 流速异常: ").append(data.getFlowRate()).append(" m³/s\n");
        }
        webSocketService.notifyAlarm(data.getProcess().getId(), message.toString());
    }

    private double calculateTrend(List<ProcessData> data, java.util.function.Function<ProcessData, Double> valueExtractor) {
        if (data.size() < 2) return 0;
        
        double firstValue = valueExtractor.apply(data.get(data.size() - 1));
        double lastValue = valueExtractor.apply(data.get(0));
        return (lastValue - firstValue) / data.size();
    }

    private String getTrendDescription(double trend) {
        if (Math.abs(trend) < 0.01) return "稳定";
        if (trend > 0) return "上升";
        return "下降";
    }
} 