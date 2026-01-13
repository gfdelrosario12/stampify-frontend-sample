## 🔧 Backend Security Configuration Needed

The 403 Forbidden error occurs because the `/api/upload/*` endpoints are blocked by Spring Security.

### Add this to your SecurityConfig.java:

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth
            // Public endpoints
            .requestMatchers("/api/users/login", "/api/users/logout", "/api/users/me").permitAll()
            .requestMatchers("/api/users").permitAll()
            
            // Upload endpoints - IMPORTANT: Add these
            .requestMatchers("/api/upload/**").permitAll() // Allow file uploads
            
            // Admin endpoints
            .requestMatchers("/api/admins/**").permitAll()
            
            // Other endpoints
            .requestMatchers("/api/events/**").permitAll()
            .requestMatchers("/api/organizations/**").permitAll()
            .requestMatchers("/api/stamps/**").permitAll()
            .requestMatchers("/api/members/**").permitAll()
            .requestMatchers("/api/scanners/**").permitAll()
            .requestMatchers("/api/passports/**").permitAll()
            .requestMatchers("/api/super-admins/**").permitAll()
            
            .anyRequest().permitAll()
        )
        .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        );

    return http.build();
}
```

### Make sure your upload controllers exist:

```java
@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @PostMapping("/event-badge")
    public ResponseEntity<Map<String, String>> uploadEventBadge(
        @RequestParam("file") MultipartFile file
    ) {
        // Upload to S3 and return URL
        String url = s3Service.uploadEventBadge(file);
        return ResponseEntity.ok(Map.of("eventBadgeUrl", url));
    }

    @PostMapping("/venue-image")
    public ResponseEntity<Map<String, String>> uploadVenueImage(
        @RequestParam("file") MultipartFile file
    ) {
        // Upload to S3 and return URL
        String url = s3Service.uploadVenueImage(file);
        return ResponseEntity.ok(Map.of("venueImageUrl", url));
    }
}
```
