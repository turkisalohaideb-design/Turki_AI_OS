Param(
  [string]$ImageName = "turki-ai-os-frontend:latest",
  [string]$ContextDir = "$PWD\frontend",
  [switch]$SaveTar
)

Write-Host "Building Docker image: $ImageName" -ForegroundColor Cyan
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Write-Error "Docker CLI not found. Install Docker Desktop to build images."; exit 1
}

Push-Location $ContextDir
try {
  docker build -t $ImageName .
  if ($LASTEXITCODE -ne 0) { throw "docker build failed with code $LASTEXITCODE" }
  Write-Host "Built image $ImageName" -ForegroundColor Green
  if ($SaveTar) {
    $tar = Join-Path $PWD "../release/${ImageName.Replace(':','_')}.tar"
    New-Item -ItemType Directory -Path (Split-Path $tar) -Force | Out-Null
    Write-Host "Saving image to $tar" -ForegroundColor Cyan
    docker save -o $tar $ImageName
    if ($LASTEXITCODE -ne 0) { throw "docker save failed with code $LASTEXITCODE" }
    Write-Host "Saved image to $tar" -ForegroundColor Green
  }
} finally {
  Pop-Location
}

Write-Host "Done." -ForegroundColor Cyan
