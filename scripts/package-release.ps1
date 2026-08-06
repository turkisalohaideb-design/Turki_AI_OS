Param(
  [string]$ImageName = "turki-ai-os-frontend:latest",
  [string]$Version = "1.0.0"
)

$root = Get-Location
$releaseDir = Join-Path $root "release\turki-ai-os-$Version"

Write-Host "Preparing release bundle in $releaseDir" -ForegroundColor Cyan

# Ensure release dir
New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

# Build & save image
Write-Host "Building and saving Docker image..." -ForegroundColor Green
& powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build-image.ps1 -ImageName $ImageName -SaveTar
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to build/save image"; exit 1 }

# Copy docker-compose and scripts
Copy-Item -Path .\docker-compose.yml -Destination $releaseDir -Force
Copy-Item -Path .\scripts\start-all.ps1 -Destination $releaseDir -Force
Copy-Item -Path .\scripts\stub-daemon.js -Destination $releaseDir -Force
Copy-Item -Path frontend\Dockerfile -Destination $releaseDir -Force
Copy-Item -Path README_RELEASE.md -Destination $releaseDir -Force

# Move saved image tar into release dir
$tarPattern = "release\*.tar"
$tar = Get-ChildItem -Path (Join-Path $root 'release') -Filter *.tar -File -Recurse -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($tar) { Copy-Item -Path $tar.FullName -Destination $releaseDir -Force }

# Create zip
$zipPath = Join-Path $root "release\turki-ai-os-$Version.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($releaseDir, $zipPath)
Write-Host "Release bundle created: $zipPath" -ForegroundColor Green
