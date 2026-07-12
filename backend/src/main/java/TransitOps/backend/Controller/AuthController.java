package TransitOps.backend.Controller;



import TransitOps.backend.dto.request.auth.LoginRequest;
import TransitOps.backend.dto.response.JwtResponse;
import TransitOps.backend.entity.User;
import TransitOps.backend.jwt.JwtTokenProvider;
import TransitOps.backend.repository.UserRepository;
import TransitOps.backend.response.ApiResponse;

import TransitOps.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken((UserPrincipal) authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail()).orElseThrow();

        JwtResponse response = JwtResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .role(user.getRole().getName().name())
                .name(user.getName())
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }
}

