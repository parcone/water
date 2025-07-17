package com.watermelt.repository;

import com.watermelt.entity.MeltingProcess;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeltingProcessRepository extends JpaRepository<MeltingProcess, Long> {
} 