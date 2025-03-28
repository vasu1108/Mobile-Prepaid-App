package com.mobileprepaid.boot.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ValidationExceptionResponse {
    private String message;
    private List<String> errors;
}

