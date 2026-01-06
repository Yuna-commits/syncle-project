package com.nullpointer.global;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

    // 404 에러 등 처리되지 않은 모든 요청을 index.html로 포워딩
    @RequestMapping("/error")
    public String handleError() {
        return "forward:/index.html";
    }
}