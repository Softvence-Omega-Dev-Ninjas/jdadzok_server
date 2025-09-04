const http = require("http");
const { URL } = require("url");

// Configuration
const config = {
  maxRetries: 5,
  retryDelay: 3000, // 3 seconds
  timeout: 10000, // 10 seconds
  healthEndpoint:
    process.env.HEALTH_ENDPOINT || "http://localhost:5055/api/health",
  expectedStatus: 200,
};

function makeRequest(url, timeout) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: "GET",
      timeout: timeout,
      headers: {
        "User-Agent": "Health-Check-Script/1.0",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
}

async function checkHealth(attempt = 1) {
  try {
    console.log(
      `[Attempt ${attempt}/${config.maxRetries}] Checking health endpoint: ${config.healthEndpoint}`,
    );

    const response = await makeRequest(config.healthEndpoint, config.timeout);

    if (response.statusCode === config.expectedStatus) {
      console.log(`✅ Health check passed! Status: ${response.statusCode}`);

      // Try to parse response body for additional info
      try {
        const body = JSON.parse(response.body);
        if (body.status) {
          console.log(`   Server status: ${body.status}`);
        }
        if (body.timestamp) {
          console.log(`   Timestamp: ${body.timestamp}`);
        }
      } catch (e) {
        console.log(
          `   Response: ${response.body.substring(0, 100)}${response.body.length > 100 ? "..." : ""}`,
        );
      }

      return true;
    } else {
      console.log(
        `❌ Health check failed! Expected status ${config.expectedStatus}, got ${response.statusCode}`,
      );
      return false;
    }
  } catch (error) {
    console.log(`❌ Health check failed with error: ${error.message}`);
    return false;
  }
}

async function healthCheckWithRetry() {
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    const success = await checkHealth(attempt);

    if (success) {
      console.log("🎉 Server is healthy!");
      process.exit(0);
    }

    if (attempt < config.maxRetries) {
      console.log(
        `⏳ Waiting ${config.retryDelay / 1000}s before next attempt...`,
      );
      await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
    }
  }

  console.log(`💥 Health check failed after ${config.maxRetries} attempts`);
  process.exit(1);
}

// Run health check
if (require.main === module) {
  console.log("🏥 Starting health check...");
  healthCheckWithRetry().catch((error) => {
    console.error("Unexpected error:", error);
    process.exit(1);
  });
}

module.exports = { checkHealth, healthCheckWithRetry };
