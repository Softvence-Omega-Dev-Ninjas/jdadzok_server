const http = require("http");
const https = require("https");
const { URL } = require("url");

// Configuration
const config = {
  url: process.env.HEALTH_CHECK_URL || "http://localhost:5055/health",
  timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT) || 10000,
  retries: parseInt(process.env.HEALTH_CHECK_RETRIES) || 3,
  interval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 2000,
};

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const colorMap = {
    info: colors.blue,
    success: colors.green,
    warning: colors.yellow,
    error: colors.red,
  };

  const color = colorMap[level] || colors.reset;
  console.log(
    `${color}[${timestamp}] [${level.toUpperCase()}] ${message}${colors.reset}`,
  );
}

function makeRequest(url, timeout) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === "https:" ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "GET",
      timeout: timeout,
      headers: {
        "User-Agent": "Health-Check/1.0.0",
        Accept: "application/json, text/plain, */*",
      },
    };

    const req = client.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          responseTime: Date.now() - startTime,
        });
      });
    });

    const startTime = Date.now();

    req.on("error", (error) => {
      reject({
        error: error.message,
        code: error.code,
        responseTime: Date.now() - startTime,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      reject({
        error: "Request timeout",
        code: "TIMEOUT",
        responseTime: Date.now() - startTime,
      });
    });

    req.end();
  });
}

async function performHealthCheck(url, retries, interval) {
  log("info", `Starting health check for: ${url}`);
  log(
    "info",
    `Configuration: retries=${retries}, interval=${interval}ms, timeout=${config.timeout}ms`,
  );

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      log("info", `Health check attempt ${attempt}/${retries}`);

      const result = await makeRequest(url, config.timeout);

      log("info", `Response: ${result.statusCode} (${result.responseTime}ms)`);

      if (result.statusCode >= 200 && result.statusCode < 300) {
        // Try to parse response body as JSON for additional health info
        let healthData = null;
        try {
          healthData = JSON.parse(result.body);
        } catch (e) {
          // Not JSON, that's fine
        }

        if (healthData) {
          log(
            "success",
            `Health check passed! Status: ${healthData.status || "unknown"}`,
          );
          if (healthData.timestamp) {
            log("info", `Server timestamp: ${healthData.timestamp}`);
          }
          if (healthData.uptime) {
            log("info", `Server uptime: ${healthData.uptime}`);
          }
          if (healthData.version) {
            log("info", `Server version: ${healthData.version}`);
          }
        } else {
          log("success", `Health check passed! (${result.responseTime}ms)`);
        }

        return {
          success: true,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          data: healthData,
        };
      } else {
        log("warning", `Unexpected status code: ${result.statusCode}`);
        if (result.body) {
          log("info", `Response body: ${result.body.substring(0, 200)}`);
        }
      }
    } catch (error) {
      log("error", `Health check failed: ${error.error} (${error.code})`);
      if (error.responseTime) {
        log("info", `Response time: ${error.responseTime}ms`);
      }
    }

    if (attempt < retries) {
      log("info", `Waiting ${interval}ms before next attempt...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  log("error", `All ${retries} health check attempts failed`);
  return {
    success: false,
  };
}

// Additional health checks
async function checkDatabaseConnection() {
  // This is a placeholder - implement actual database health check
  // based on your database type (PostgreSQL, MySQL, MongoDB, etc.)
  log("info", "Database connection check not implemented");
  return { success: true, message: "Skipped" };
}

async function checkRedisConnection() {
  // This is a placeholder - implement actual Redis health check
  log("info", "Redis connection check not implemented");
  return { success: true, message: "Skipped" };
}

async function checkDependencies() {
  log("info", "Checking external dependencies...");

  const checks = [
    { name: "Database", check: checkDatabaseConnection },
    { name: "Redis", check: checkRedisConnection },
  ];

  const results = {};

  for (const { name, check } of checks) {
    try {
      const result = await check();
      results[name] = result;
      log(
        result.success ? "success" : "warning",
        `${name}: ${result.message || (result.success ? "OK" : "Failed")}`,
      );
    } catch (error) {
      results[name] = { success: false, error: error.message };
      log("error", `${name}: ${error.message}`);
    }
  }

  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "check";

  switch (command) {
    case "check":
    case "health":
      const result = await performHealthCheck(
        config.url,
        config.retries,
        config.interval,
      );
      process.exit(result.success ? 0 : 1);

    case "full":
      log("info", "Performing comprehensive health check...");
      const healthResult = await performHealthCheck(
        config.url,
        config.retries,
        config.interval,
      );
      const depResults = await checkDependencies();

      const allSuccessful =
        healthResult.success &&
        Object.values(depResults).every((r) => r.success);

      log("info", "=== Health Check Summary ===");
      log(
        healthResult.success ? "success" : "error",
        `Application: ${healthResult.success ? "HEALTHY" : "UNHEALTHY"}`,
      );

      for (const [name, result] of Object.entries(depResults)) {
        log(
          result.success ? "success" : "warning",
          `${name}: ${result.success ? "OK" : "FAILED"}`,
        );
      }

      process.exit(allSuccessful ? 0 : 1);

    case "monitor":
      log("info", "Starting continuous monitoring...");
      const monitorInterval = parseInt(args[1]) || 30000; // Default 30 seconds

      while (true) {
        await performHealthCheck(config.url, 1, 0);
        await new Promise((resolve) => setTimeout(resolve, monitorInterval));
      }

    case "help":
    default:
      console.log(`
Health Check Script Usage:

  node health-check.js [command] [options]

Commands:
  check, health    Perform a single health check (default)
  full            Perform comprehensive health check including dependencies
  monitor [ms]    Continuously monitor health (default interval: 30s)
  help            Show this help message

Environment Variables:
  HEALTH_CHECK_URL       Health check endpoint (default: http://localhost:5055/health)
  HEALTH_CHECK_TIMEOUT   Request timeout in ms (default: 10000)
  HEALTH_CHECK_RETRIES   Number of retry attempts (default: 3)
  HEALTH_CHECK_INTERVAL  Interval between retries in ms (default: 2000)

Examples:
  node health-check.js
  node health-check.js full
  node health-check.js monitor 60000
  HEALTH_CHECK_URL=https://myapi.com/health node health-check.js

Exit Codes:
  0 - Health check passed
  1 - Health check failed
      `);
      process.exit(0);
  }
}

// Handle process signals gracefully
process.on("SIGINT", () => {
  log("info", "Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  log("info", "Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  log("error", `Uncaught exception: ${error.message}`);
  console.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  log("error", `Unhandled rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    log("error", `Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  });
}
