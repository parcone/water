-- 用户表
DROP TABLE IF EXISTS `wm_user`;
CREATE TABLE `wm_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `username` varchar(64) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `nickname` varchar(64) DEFAULT NULL COMMENT '昵称',
  `email` varchar(128) DEFAULT NULL COMMENT '邮箱',
  `phone` varchar(16) DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(255) DEFAULT NULL COMMENT '头像',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态：0-禁用，1-启用',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 熔化流程表
DROP TABLE IF EXISTS `wm_melting_process`;
CREATE TABLE `wm_melting_process` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(128) NOT NULL COMMENT '流程名称',
  `description` text COMMENT '流程描述',
  `status` varchar(32) NOT NULL COMMENT '状态：PENDING, RUNNING, COMPLETED',
  `start_time` datetime DEFAULT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `user_id` bigint(20) NOT NULL COMMENT '创建用户ID',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  CONSTRAINT `fk_melting_process_user` FOREIGN KEY (`user_id`) REFERENCES `wm_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='熔化流程表';

-- V2 里的流程数据表（旧）
DROP TABLE IF EXISTS `wm_process_data`;
CREATE TABLE `wm_process_data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `temperature` decimal(10,2) NOT NULL COMMENT '温度值',
  `pressure` decimal(10,2) NOT NULL COMMENT '压力值',
  `flow_rate` decimal(10,2) NOT NULL COMMENT '流速',
  `timestamp` datetime NOT NULL COMMENT '数据时间戳',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`),
  KEY `idx_process_id` (`process_id`),
  CONSTRAINT `fk_process_data_process` FOREIGN KEY (`process_id`) REFERENCES `wm_melting_process` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程数据表';

-- 流程图片表
DROP TABLE IF EXISTS `wm_process_image`;
CREATE TABLE `wm_process_image` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `file_name` varchar(255) NOT NULL COMMENT '文件名',
  `file_path` varchar(512) NOT NULL COMMENT '文件路径',
  `file_type` varchar(32) NOT NULL COMMENT '文件类型',
  `file_size` bigint(20) NOT NULL COMMENT '文件大小(bytes)',
  `analysis_time` datetime NOT NULL COMMENT '分析时间',
  `melted_area_percentage` decimal(5,2) DEFAULT NULL COMMENT '熔化区域百分比',
  `temperature_at_capture` decimal(10,2) DEFAULT NULL COMMENT '拍摄时温度',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  `update_time` datetime NOT NULL COMMENT '更新时间',
  `deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否删除',
  PRIMARY KEY (`id`),
  KEY `idx_process_id` (`process_id`),
  CONSTRAINT `fk_process_image_process` FOREIGN KEY (`process_id`) REFERENCES `wm_melting_process` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程图像表';

-- V3 里的新版流程数据表
DROP TABLE IF EXISTS `process_data`;
CREATE TABLE `process_data` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `process_id` bigint(20) NOT NULL COMMENT '流程ID',
  `timestamp` datetime NOT NULL COMMENT '数据时间戳',
  `temperature` double DEFAULT NULL COMMENT '温度',
  `pressure` double DEFAULT NULL COMMENT '压力',
  `flow_rate` double DEFAULT NULL COMMENT '流速',
  `volume` double DEFAULT NULL COMMENT '体积',
  `density` double DEFAULT NULL COMMENT '密度',
  `viscosity` double DEFAULT NULL COMMENT '粘度',
  `quality` varchar(50) DEFAULT NULL COMMENT '质量评估',
  `notes` text COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_process_id` (`process_id`),
  KEY `idx_timestamp` (`timestamp`),
  CONSTRAINT `fk_process_data_process_v2` FOREIGN KEY (`process_id`) REFERENCES `wm_melting_process` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='流程数据表'; 