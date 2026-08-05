Param(
  [string]$DaemonCmd = $env:DAEMON_CMD
)

Write-Host "Starting Turki AI OS (frontend and optional daemon)" -ForegroundColor Cyan

# Start frontend in current console
Write-Host "Launching frontend (Next.js)..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath pwsh -ArgumentList "-NoProfile -NoLogo -Command `"cd '$PWD/frontend' ; npm run dev`""

if ($DaemonCmd) {
  Write-Host "Launching daemon with command: $DaemonCmd" -ForegroundColor Green
  Start-Process -NoNewWindow -FilePath pwsh -ArgumentList "-NoProfile -NoLogo -Command `"$DaemonCmd`""
} else {
  Write-Host "No DAEMON_CMD provided. If you need the backend daemon, set DAEMON_CMD env var or run it manually." -ForegroundColor Yellow
}

Write-Host "Started processes. Check opened terminals for logs." -ForegroundColor Cyan
