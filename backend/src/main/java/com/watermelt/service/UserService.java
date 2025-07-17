package com.watermelt.service;

import com.watermelt.entity.User;

/**
 * 用户服务接口
 */
public interface UserService {
    /**
     * 根据用户名查询用户
     */
    User findByUsername(String username);

    /**
     * 保存用户
     */
    User save(User user);

    /**
     * 更新用户信息
     */
    User update(User user);

    /**
     * 检查用户名是否已存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否已存在
     */
    boolean existsByEmail(String email);
} 