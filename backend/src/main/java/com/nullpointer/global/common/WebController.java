package com.nullpointer.global.common;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class WebController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        // status가 null이 아닐 때만 체크
        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            // 404 에러(페이지 없음)가 났을 때
            if (statusCode == 404) {
                // 원래 요청했던 주소를 가져옴
                Object pathAttr = request.getAttribute(RequestDispatcher.FORWARD_REQUEST_URI);
                String path = pathAttr != null ? pathAttr.toString() : "";

                // API 요청(/api)이나 웹소켓(/ws), 파일(.js, .css 등)은 절대 납치하면 안 됨
                if (!path.startsWith("/api") && !path.startsWith("/ws") && !path.contains(".")) {
                    return "forward:/index.html";
                }
            }
        }
        
        // 404가 아니거나, API 에러인 경우는 그냥 원래 에러 처리(WhiteLabel Page 등)로 넘김
        return "error"; 
    }
}
