package com.example.animal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DemoController {
    @Value("${pdp.owner.jdbc.url}")
    private String dbUrl;

    @GetMapping("/hello")
    public String helloWorld() {
        return "Greetings from Animal service! >>>>>> parameter dbUrl is " + dbUrl;
    }

}
