package com.watermelt.security;

import com.watermelt.entity.Role;
import com.watermelt.entity.User;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import java.lang.reflect.Field;

class JwtServiceTest {

    private JwtService createJwtService() throws Exception {
        JwtService jwtService = new JwtService();
        // Inject private fields via reflection
        setField(jwtService, "jwtSecret", "test-secret-key-test-secret-key-test-secret-key");
        setField(jwtService, "jwtExpiration", 3600000L);
        setField(jwtService, "refreshExpiration", 7200000L);
        setField(jwtService, "issuer", "water-melt-test");
        setField(jwtService, "audience", "water-melt-test");
        return jwtService;
    }

    private void setField(Object target, String name, Object value) throws Exception {
        Field field = JwtService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(target, value);
    }

    @Test
    void generateAndValidateToken() throws Exception {
        JwtService jwtService = createJwtService();

        User user = User.builder()
                .id(1L)
                .username("testUser")
                .password("encodedPwd")
                .email("test@example.com")
                .role(Role.USER)
                .enabled(true)
                .build();

        // when
        String token = jwtService.generateToken(user);

        // then
        Assertions.assertNotNull(token);
        Assertions.assertEquals("testUser", jwtService.extractUsername(token));
        Assertions.assertTrue(jwtService.isTokenValid(token, user));
    }
} 