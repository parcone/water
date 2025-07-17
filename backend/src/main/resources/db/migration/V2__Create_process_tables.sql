-- Create melting process table
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

-- Create process data table
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

-- Create process image table
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

