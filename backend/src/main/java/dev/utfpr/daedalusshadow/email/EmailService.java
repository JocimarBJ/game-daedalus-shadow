package dev.utfpr.daedalusshadow.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${spring.mail.username}")
    private String fromEmail;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public void sendVerificationEmail(String destination, String link, String userName){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true,  "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(destination);
            helper.setSubject("Verify your email");

            Context context = new Context();
            context.setVariable("userName", userName);
            context.setVariable("link", link);

            String html = templateEngine.process("templates/emails/email-verification", context);

            helper.setText(html, true);

            mailSender.send(message);

        }catch(Exception e){
            e.printStackTrace();
            throw new RuntimeException("Error while sending verification email");
        }
    }

    public void sendWelcomeEmail(String destination, String userName){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true,  "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(destination);
            helper.setSubject("Welcome to Bittencourt Academy!");

            Context context = new Context();
            context.setVariable("userName", userName);

            String html = templateEngine.process("templates/emails/email-welcome", context);
            helper.setText(html, true);

            mailSender.send(message);
        }catch(Exception e){
            e.printStackTrace();
            throw new RuntimeException("Error while sending welcome email");
        }

    }
}
