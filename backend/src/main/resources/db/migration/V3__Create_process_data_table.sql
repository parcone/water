-- Create process data table
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