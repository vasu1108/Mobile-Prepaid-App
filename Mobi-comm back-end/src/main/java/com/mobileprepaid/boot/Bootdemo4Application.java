package com.mobileprepaid.boot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan(basePackages = "com.mobileprepaid.boot.model")
public class Bootdemo4Application {

	public static void main(String[] args) {
		SpringApplication.run(Bootdemo4Application.class, args);
	}

}
