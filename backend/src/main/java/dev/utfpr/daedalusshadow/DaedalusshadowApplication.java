package dev.utfpr.daedalusshadow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class DaedalusshadowApplication {

	public static void main(String[] args) {
		SpringApplication.run(DaedalusshadowApplication.class, args);
	}

}
