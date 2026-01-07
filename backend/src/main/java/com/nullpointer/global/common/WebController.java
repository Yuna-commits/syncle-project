package com.nullpointer.global.common;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {
    @GetMapping(value = {"", "/{path:^(?!ws|api).*}"})
    public String forward() {
        return "forward:/index.html";
    }
} 
