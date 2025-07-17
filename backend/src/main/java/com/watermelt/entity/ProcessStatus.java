package com.watermelt.entity;

public enum ProcessStatus {
    PENDING,    // 待处理
    RUNNING,    // 运行中
    PAUSED,     // 已暂停
    COMPLETED,  // 已完成
    FAILED,     // 失败
    CANCELLED   // 已取消
} 