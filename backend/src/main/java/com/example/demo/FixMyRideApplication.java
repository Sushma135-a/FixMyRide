package com.example.demo;

import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FixMyRideApplication {

    public static void main(String[] args) {
        SpringApplication.run(FixMyRideApplication.class, args);
    }

    @Bean
    public CommandLineRunner dataLoader(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@fixmyride.com").isEmpty()) {
                User admin = new User();
                admin.setFullName("Admin");
                admin.setEmail("admin@fixmyride.com");
                admin.setPassword("admin123");
                admin.setPhone("9999999999");
                admin.setRole(Role.ADMIN);
                userRepository.save(admin);
            }
        };
    }
}
