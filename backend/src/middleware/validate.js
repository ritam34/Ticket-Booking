const { validationResult } = require('express-validator');

// Runs after express-validator's chain of body()/query() checks, collects any
// failures into a single 400 response instead of letting bad data hit controllers.
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};
