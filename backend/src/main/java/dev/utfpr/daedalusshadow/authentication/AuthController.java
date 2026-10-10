package dev.utfpr.daedalusshadow.authentication;

import dev.utfpr.daedalusshadow.authentication.model.dto.LoginRequestDto;
import dev.utfpr.daedalusshadow.authentication.model.dto.LoginResponseDto;
import dev.utfpr.daedalusshadow.user.dto.UserCreationDto;
import dev.utfpr.daedalusshadow.user.dto.UserResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserCreationDto dto){
        UserResponseDto userResponseDto = authService.localRegister(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponseDto);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestParam String token){
        authService.verifyEmail(token);
        return ResponseEntity.ok(Map.of("message", "Email succesfully verified"));
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<Map<String, String>> resendVerificationEmail(@RequestParam String email){
        authService.resendVerificationEmail(email);
        return ResponseEntity.ok(Map.of("message", "Verification email resent"));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequestDto){
        return ResponseEntity.ok(authService.localLogin(loginRequestDto));
    }
}
