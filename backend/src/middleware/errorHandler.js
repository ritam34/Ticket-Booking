// Centralized error handler - keeps controllers free of repetitive try/catch boilerplate
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    return res.status(409).json({ message: `${field} already exists` });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal server error',
  });
};

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
