const timeout = (ms) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout'
        });
      }
    }, ms);

    res.on('finish', () => {
      clearTimeout(timeoutId);
    });

    next();
  };
};

module.exports = timeout;

