Turki AI OS - Release Packaging

This folder contains helper scripts to build a Docker image for the frontend and package a release bundle that can be deployed on another machine without requiring full source or Node.js installation.

Recommended flow (Linux/macOS/Windows with PowerShell):

1. Build the Docker image and optionally save it as a tar:
   powershell -File scripts\build-image.ps1 -ImageName "turki-ai-os-frontend:1.0.0" -SaveTar

   This builds the image from frontend/Dockerfile and writes a tar at release/ if -SaveTar is passed.

2. Create a release bundle that includes the docker-compose.yml, the saved image, the start scripts and a README:
   powershell -File scripts\package-release.ps1 -ImageName "turki-ai-os-frontend:1.0.0"

3. Optionally push the image to a registry (Docker Hub or GHCR):
   - Docker Hub (requires DOCKERHUB_USERNAME and DOCKERHUB_PASSWORD in env):
     powershell -File scripts\push-image.ps1 -ImageName "turki-ai-os-frontend:1.0.0" -Registry dockerhub

   - GitHub Container Registry (requires GHCR_OWNER and GHCR_TOKEN in env):
     powershell -File scripts\push-image.ps1 -ImageName "turki-ai-os-frontend:1.0.0" -Registry ghcr

4. On target machine, load the image (if a tar was included):
   docker load -i turki-ai-os-frontend_1.0.0.tar

5. Start with docker compose:
   docker compose up --build -d

Notes:
- The package scripts assume Docker and PowerShell are available on the target machine.
- For Windows installers (MSI) or native executables, consider using WiX, Inno Setup, or bundling an Electron wrapper.
