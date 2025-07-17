package com.watermelt.common.exception;

import com.watermelt.common.api.Result;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = ApiException.class)
    public Result<Object> handle(ApiException e) {
        if (e.getErrorCode() != null) {
            return Result.failed(e.getErrorCode());
        }
        return Result.failed(e.getMessage());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public Result<Object> handleValidException(MethodArgumentNotValidException e) {
        BindingResult bindingResult = e.getBindingResult();
        String message = null;
        if (bindingResult.hasErrors()) {
            FieldError fieldError = bindingResult.getFieldError();
            if (fieldError != null) {
                message = fieldError.getField()+fieldError.getDefaultMessage();
            }
        }
        return Result.validateFailed(message);
    }

    @ExceptionHandler(value = BindException.class)
    public Result<Object> handleValidException(BindException e) {
        BindingResult bindingResult = e.getBindingResult();
        String message = null;
        if (bindingResult.hasErrors()) {
            FieldError fieldError = bindingResult.getFieldError();
            if (fieldError != null) {
                message = fieldError.getField()+fieldError.getDefaultMessage();
            }
        }
        return Result.validateFailed(message);
    }

    @ExceptionHandler(value = ConstraintViolationException.class)
    public Result<Object> handleValidException(ConstraintViolationException e) {
        return Result.validateFailed(e.getMessage());
    }

    @ExceptionHandler(value = Throwable.class)
    public Result<Object> handleException(Throwable e) {
        log.error("未知异常：", e);
        return Result.failed();
    }
} 