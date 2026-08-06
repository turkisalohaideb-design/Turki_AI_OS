Turki AI OS - Adapter and Daemon

This repository contains an example integration of a local CLI-backed AI runtime adapter (Turki AI OS) for the daemon runtime.

Key points:
- Adapter definition: apps/daemon/src/runtimes/defs/turki-ai-os.ts
- Server runtime dispatch and parsers: apps/daemon/src/server.ts and apps/daemon/src/runtimes/*-stream.ts
- Tests include unit and integration tests that exercise a stub CLI under tests/fixtures/bin/turki-stub.js

Running tests:
- Ensure dependencies installed (npm/yarn) and run the project's test runner (e.g. npm test or yarn test). The integration tests use a Node-based stub and do not require the real Turki AI OS binary.

Configuration:
- Timeouts and retry settings are configurable via environment variables (see apps/daemon/src/runtimes/config.ts and DAEMON_* env vars).

For maintainers: see docs/ for architecture notes and agent-adapters.md for how adapters are intended to be added.
