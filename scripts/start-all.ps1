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
  Write-Host "No DAEMON_CMD provided. Launching embedded stub daemon on port 8080." -ForegroundColor Yellow
  $stub = Join-Path $PWD 'scripts\stub-daemon.js'
  if (Test-Path $stub) {
    Start-Process -NoNewWindow -FilePath pwsh -ArgumentList "-NoProfile -NoLogo -Command `"node '$stub'`""
  } else {
    Write-Host "Stub daemon not found at $stub. Run the daemon manually or set DAEMON_CMD." -ForegroundColor Red
  }
}

Write-Host "Started processes. Check opened terminals for logs." -ForegroundColor Cyan
