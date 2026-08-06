export function getTimeouts() {
  return {
    detectTimeoutMs: Number(process.env.DAEMON_DETECT_TIMEOUT_MS || 5000),
    versionProbeTimeoutMs: Number(process.env.DAEMON_VERSION_PROBE_TIMEOUT_MS || 2000),
    processStartupTimeoutMs: Number(process.env.DAEMON_PROCESS_STARTUP_TIMEOUT_MS || 5000),
    processExecutionTimeoutMs: Number(process.env.DAEMON_PROCESS_EXECUTION_TIMEOUT_MS || 120000),
    parserIdleTimeoutMs: Number(process.env.DAEMON_PARSER_IDLE_TIMEOUT_MS || 30000),
  };
}
