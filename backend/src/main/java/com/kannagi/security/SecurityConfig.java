package com.kannagi.security;

import com.kannagi.common.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security is deny-by-default: anything not listed as public requires
 * authentication, and role rules are additionally enforced per-method with
 * {@code @PreAuthorize} so a routing mistake here cannot silently expose data.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint authenticationEntryPoint;
    private final RestAccessDeniedHandler accessDeniedHandler;
    private final AppProperties props;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/register",
            "/api/auth/send-code",
            "/api/auth/verify-code",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/api/professional-auth/lawyer/register",
            "/api/professional-auth/therapist/register",
            "/api/professional-auth/login",
            "/api/config/brand",
            "/actuator/health",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    /**
     * BCrypt at strength 12. Costlier than the default 10, which is the point:
     * sign-in happens rarely, offline cracking happens at volume.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            // Safe to disable: the API is stateless and authenticates with a
            // bearer token, which a cross-site form post cannot attach.
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(e -> e
                    .authenticationEntryPoint(authenticationEntryPoint)
                    .accessDeniedHandler(accessDeniedHandler))
            .headers(h -> h
                    .frameOptions(HeadersConfigurer.FrameOptionsConfig::deny)
                    .contentTypeOptions(Customizer.withDefaults())
                    .referrerPolicy(r -> r.policy(
                            org.springframework.security.web.header.writers
                                    .ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                    .httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true)
                            .maxAgeInSeconds(31_536_000)))
            .authorizeHttpRequests(auth -> auth
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                    // Anonymous case creation and resume are the whole point of
                    // the product: someone must be able to speak without an
                    // account. Both are CAPTCHA-gated and rate-limited, and
                    // CaseAccessGuard still decides who may read what.
                    .requestMatchers(HttpMethod.POST, "/api/cases").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/cases/resume").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/cases/*").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/cases/*/messages").permitAll()
                    .requestMatchers(HttpMethod.PATCH, "/api/cases/*/legal-pathway").permitAll()
                    .requestMatchers(HttpMethod.DELETE, "/api/cases/*").permitAll()
                    // She requests a professional from the case itself, using
                    // the same access-key model as every other case sub-resource.
                    .requestMatchers(HttpMethod.POST, "/api/cases/*/assignments").permitAll()
                    // Analysis, chat and transcription serve the anonymous path too.
                    .requestMatchers("/api/ai/**").permitAll()
                    .requestMatchers("/api/speech/**").permitAll()
                    // Reference material is public by design; there is nothing
                    // personal in a law or a professional's listed profile.
                    .requestMatchers("/api/legal/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/lawyers/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/psychologists/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/community/**").permitAll()
                    // Booking works anonymously; the service records no requester.
                    .requestMatchers(HttpMethod.POST, "/api/appointments").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/appointments/by-reference/*").permitAll()
                    .requestMatchers(HttpMethod.POST, "/api/community/posts").permitAll()
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .requestMatchers("/api/moderation/**").hasAnyRole("MODERATOR", "ADMIN")
                    .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(props.security().corsAllowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization", "Content-Type", "Accept", "X-Case-Access-Key"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
