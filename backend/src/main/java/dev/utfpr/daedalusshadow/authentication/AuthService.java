package dev.utfpr.daedalusshadow.authentication;

import dev.utfpr.daedalusshadow.AppProperties;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProvider;
import dev.utfpr.daedalusshadow.authentication.authenticationprovider.AuthenticationProviderService;
import dev.utfpr.daedalusshadow.authentication.emailverificationtoken.EmailVerificationToken;
import dev.utfpr.daedalusshadow.authentication.emailverificationtoken.EmailVerificationTokenRepository;
import dev.utfpr.daedalusshadow.authentication.model.dto.LoginRequestDto;
import dev.utfpr.daedalusshadow.authentication.model.dto.LoginResponseDto;
import dev.utfpr.daedalusshadow.authentication.refreshtoken.RefreshTokenService;
import dev.utfpr.daedalusshadow.email.EmailService;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.EmailAlreadyVerifiedException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.ExpiredTokenException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.InvalidCredentialsException;
import dev.utfpr.daedalusshadow.exception.exceptiontypes.InvalidTokenException;
import dev.utfpr.daedalusshadow.security.JwtService;
import dev.utfpr.daedalusshadow.user.User;
import dev.utfpr.daedalusshadow.user.UserService;
import dev.utfpr.daedalusshadow.user.dto.UserCreationDto;
import dev.utfpr.daedalusshadow.user.dto.UserResponseDto;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AuthService {
    private final AppProperties appProperties;
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationProviderService authenticationProviderService;
    private final EmailService emailService;

    @Transactional
    public LoginResponseDto localLogin(LoginRequestDto loginRequestDto) {
        /* #####
        E se o usuário estiver tentando fazer login com um email que ele se cadastrou com um google ou outro provider
        que não seja local???
         #####*/

        User user = userService.findEntityByEmail(loginRequestDto.email())
                .orElseThrow(InvalidCredentialsException::new);

        AuthenticationProvider provider = authenticationProviderService.findLocalProvider(user)
                .orElseThrow(InvalidCredentialsException::new);

        boolean passwordMatches = passwordEncoder.matches(loginRequestDto.password(), provider.getPasswordHash());

        if(!passwordMatches) {
            throw new InvalidCredentialsException();
        }

        if (!user.isEnabled()){
            throw new DisabledException("Please verify your email address before signing in");
        }

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.generateRefreshToken(user).getRefreshToken();
        return new LoginResponseDto(accessToken, refreshToken);
    }

    @Transactional
    public UserResponseDto localRegister(UserCreationDto userCreationDto) {
        User savedUser = userService.saveLocal(userCreationDto);

        authenticationProviderService.createLocalProvider(savedUser, userCreationDto.password());

        EmailVerificationToken tokenEntity = generateToken(savedUser);
        emailVerificationTokenRepository.save(tokenEntity);

        String link = generateEmailVerificationLink(tokenEntity.getToken());
        emailService.sendVerificationEmail(savedUser.getEmail(), link, savedUser.getUsername());

        return new UserResponseDto(savedUser);
    }


    @Transactional
    public void resendVerificationEmail(String email){
        EmailVerificationToken oldTtoken = emailVerificationTokenRepository
                .findByUserEmail(email)
                .orElseThrow(() -> new InvalidTokenException("The token is not valid."));

        if(oldTtoken.isUsed()){
            throw new EmailAlreadyVerifiedException("The email is already verified.");
        }

        emailVerificationTokenRepository.delete(oldTtoken);
        emailVerificationTokenRepository.flush(); //

        User user = oldTtoken.getUser();

        EmailVerificationToken newToken = generateToken(user);
        emailVerificationTokenRepository.save(newToken);

        String link = generateEmailVerificationLink(newToken.getToken());
        emailService.sendVerificationEmail(user.getEmail(), link, user.getUsername());
    }

    @Transactional
    public void verifyEmail(String token) {

        // Verificar se o token é válido ou não
        EmailVerificationToken tokenEntity = emailVerificationTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("The token is not valid."));

        if (tokenEntity.getExpiresAt().isBefore(Instant.now())) {
            throw new ExpiredTokenException("The token is expired");
        }

        // Verificar se o email já está verificado ou não
        if (tokenEntity.isUsed()){
            throw new EmailAlreadyVerifiedException("The email is already verified.");
        }

        tokenEntity.setUsed(true);
        tokenEntity.getUser().setEnabled(true);
        emailVerificationTokenRepository.save(tokenEntity);

        User user = tokenEntity.getUser();

        emailService.sendWelcomeEmail(user.getEmail(), user.getUsername());
    }

    private EmailVerificationToken generateToken(User user){
        String newToken = UUID.randomUUID().toString();
        EmailVerificationToken tokenEntity = new EmailVerificationToken();
        tokenEntity.setToken(newToken);
        tokenEntity.setUser(user);
        tokenEntity.setExpiresAt(Instant.now().plus(48, ChronoUnit.HOURS));
        return tokenEntity;
    }

    private String generateEmailVerificationLink(String token){
        return appProperties.frontendUrl() + "/auth/verify-email?token=" + token;
    }
}
