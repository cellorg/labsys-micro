package com.example.microa.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {
    @Value("${pdp.owner.jdbc.url}")
    private String dbUrl;

    @GetMapping
    public String helloWorld() {
        return "Welcome to micorA! parameter dbUrl is " + dbUrl;
    }

    @GetMapping("/health")
    public String healthcheck() {
        return "MicroA is healthy!";
    }
}
