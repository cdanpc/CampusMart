# Production Deployment Guide

## Prerequisites
- Java 17 or higher
- MySQL 8.0 or higher
- Production server (VPS, AWS, Azure, etc.)
- Domain name (recommended)

## Security Checklist

### 1. Generate New JWT Secret
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
$bytes = [byte[]]::new(32)
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 2. Set Environment Variables
Copy `.env.example` to `.env` and fill in production values:

```bash
cp .env.example .env
# Edit .env with your production values
```

**CRITICAL:** Never commit `.env` file to version control!

### 3. Update Database Configuration
- Create production MySQL database
- Create dedicated database user with limited privileges
- Use strong password (min 20 characters, alphanumeric + special chars)
- Enable SSL connections to database

```sql
CREATE DATABASE campusmart CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'campusmart_user'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON campusmart.* TO 'campusmart_user'@'%';
FLUSH PRIVILEGES;
```

### 4. Update CORS Origins
In `application-prod.properties`, update:
```properties
cors.allowed-origins=https://your-production-domain.com
```

### 5. Configure SSL/TLS
- Obtain SSL certificate (Let's Encrypt recommended)
- Configure HTTPS in application server or reverse proxy (nginx/Apache)

### 6. Database Migration
Run schema creation:
```bash
mysql -u campusmart_user -p campusmart < database/schema.sql
```

## Deployment Steps

### Option 1: JAR Deployment

1. **Build the application:**
```bash
cd backend/CampusMart/technominds
./mvnw clean package -DskipTests
```

2. **Copy JAR to server:**
```bash
scp target/technominds-0.0.1-SNAPSHOT.jar user@server:/opt/campusmart/
```

3. **Create systemd service** (Linux):
```ini
# /etc/systemd/system/campusmart.service
[Unit]
Description=CampusMart Backend
After=network.target mysql.service

[Service]
Type=simple
User=campusmart
WorkingDirectory=/opt/campusmart
Environment="SPRING_PROFILES_ACTIVE=prod"
EnvironmentFile=/opt/campusmart/.env
ExecStart=/usr/bin/java -jar /opt/campusmart/technominds-0.0.1-SNAPSHOT.jar
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

4. **Start service:**
```bash
sudo systemctl enable campusmart
sudo systemctl start campusmart
sudo systemctl status campusmart
```

### Option 2: Docker Deployment

1. **Create Dockerfile:**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/technominds-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

2. **Build and run:**
```bash
docker build -t campusmart-backend .
docker run -d -p 8080:8080 --env-file .env campusmart-backend
```

## Post-Deployment

### 1. Verify Application
```bash
# Health check
curl https://your-domain.com/api/profiles

# Check logs
sudo journalctl -u campusmart -f
```

### 2. Setup Monitoring
- Configure application monitoring (New Relic, DataDog, etc.)
- Set up log aggregation (ELK stack, CloudWatch, etc.)
- Configure alerts for errors and downtime

### 3. Backup Strategy
- Daily database backups
- Store backups in secure, off-site location
- Test restore procedure regularly

```bash
# Backup script example
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u campusmart_user -p campusmart > /backups/campusmart_$DATE.sql
```

### 4. Performance Optimization
- Enable connection pooling (already configured via HikariCP)
- Configure reverse proxy caching (nginx)
- Enable gzip compression (already configured)
- Set up CDN for static assets

### 5. Security Hardening
- [ ] Change default database password
- [ ] Generate new JWT secret
- [ ] Enable HTTPS only
- [ ] Configure firewall (allow only ports 80, 443)
- [ ] Set up fail2ban for brute force protection
- [ ] Regular security updates
- [ ] Enable database SSL
- [ ] Configure rate limiting

## Environment-Specific Configurations

### Development
```bash
export SPRING_PROFILES_ACTIVE=default
./mvnw spring-boot:run
```

### Production
```bash
export SPRING_PROFILES_ACTIVE=prod
java -jar target/technominds-0.0.1-SNAPSHOT.jar
```

## Rollback Procedure

1. Stop application
2. Restore previous JAR version
3. Restore database backup if needed
4. Start application
5. Verify functionality

## Troubleshooting

### Application won't start
- Check logs: `sudo journalctl -u campusmart -n 50`
- Verify environment variables are set
- Check database connectivity
- Verify port 8080 is not in use

### Database connection errors
- Verify database credentials
- Check MySQL service is running
- Verify firewall allows database connections
- Check SSL certificate if using SSL

### High memory usage
- Adjust JVM heap size: `-Xmx512m -Xms256m`
- Review connection pool settings
- Check for memory leaks in logs

## Support
For issues, contact: your-support-email@example.com

## Security Contacts
Report security vulnerabilities to: security@example.com
