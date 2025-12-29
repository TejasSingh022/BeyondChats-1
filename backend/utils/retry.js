const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retry = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    delayMs = 1000,
    backoff = 2,
    retryable = (error) => true
  } = options;

  let lastError;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !retryable(error)) {
        throw error;
      }

      await delay(currentDelay);
      currentDelay *= backoff;
    }
  }

  throw lastError;
};

module.exports = retry;

