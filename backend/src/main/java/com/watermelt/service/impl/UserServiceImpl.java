package com.watermelt.service.impl;

import com.watermelt.common.exception.ApiException;
import com.watermelt.entity.User;
import com.watermelt.repository.UserRepository;
import com.watermelt.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;

/**
 * 用户服务实现类
 */
@Service
@Primary
@RequiredArgsConstructor
public class UserServiceImpl implements UserService, UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    @Cacheable(value = "user", key = "#username", unless = "#result == null")
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElse(null);
    }

    @Override
    @Transactional
    public User save(User user) {
        if (existsByUsername(user.getUsername())) {
            throw new ApiException("Username already exists");
        }
        if (existsByEmail(user.getEmail())) {
            throw new ApiException("Email already exists");
        }
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public User update(User user) {
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new ApiException("User not found"));

        // 如果修改了用户名，检查是否已存在
        if (!existingUser.getUsername().equals(user.getUsername()) &&
            existsByUsername(user.getUsername())) {
            throw new ApiException("Username already exists");
        }

        // 如果修改了邮箱，检查是否已存在
        if (!existingUser.getEmail().equals(user.getEmail()) &&
            existsByEmail(user.getEmail())) {
            throw new ApiException("Email already exists");
        }

        return userRepository.save(user);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
} 