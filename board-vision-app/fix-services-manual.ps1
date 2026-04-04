# Final Fix Script - Manually fix each file

$base = "D:\New folder\CLens\board-vision-app\src\main\java\CLens\pgn_backend"
cd $base

Write-Host "=== Manually Fixing Each File ===" -ForegroundColor Green

# Fix ScanService
$content = @"
package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import CLens.pgn_backend.enums.Role;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class ScanService {

    private final UserRepository users;

    @Value("${app.trial.days:2}")
    private int trialDays;
"@
# Read rest of file
$rest = Get-Content service\ScanService.java | Select-Object -Skip 16
Set-Content service\ScanService.java -Value ($content + "`n" + ($rest -join "`n"))

Write-Host "✅ Fixed ScanService" -ForegroundColor Cyan

# Fix OtpService
$content = @"
package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import CLens.pgn_backend.repository.UserRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final Map<String, OtpData> otpStore = new ConcurrentHashMap<>();
"@
$rest = Get-Content service\OtpService.java | Select-Object -Skip 15
Set-Content service\OtpService.java -Value ($content + "`n" + ($rest -join "`n"))
Write-Host "✅ Fixed OtpService" -ForegroundColor Cyan

# Fix ScanAllowanceService
$content = @"
package CLens.pgn_backend.service;

import CLens.pgn_backend.entity.User;
import org.springframework.stereotype.Service;

@Service
public class ScanAllowanceService {
"@
$rest = Get-Content service\ScanAllowanceService.java | Select-Object -Skip 7
Set-Content service\ScanAllowanceService.java -Value ($content + "`n" + ($rest -join "`n"))
Write-Host "✅ Fixed ScanAllowanceService" -ForegroundColor Cyan

# Fix StockfishAnalysisService
$content = @"
package CLens.pgn_backend.service;

import CLens.pgn_backend.dto.GameAnalysisDTO;
import CLens.pgn_backend.dto.GameAnalysisDTO.MoveEvaluation;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockfishAnalysisService {
"@
$rest = Get-Content service\StockfishAnalysisService.java | Select-Object -Skip 11
Set-Content service\StockfishAnalysisService.java -Value ($content + "`n" + ($rest -join "`n"))
Write-Host "✅ Fixed StockfishAnalysisService" -ForegroundColor Cyan

Write-Host "`n=== Service Files Fixed! ===" -ForegroundColor Green
