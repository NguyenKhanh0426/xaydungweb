import { env } from '../config/env.js';

const mysqlFriendlyMessage = (err) => {
  if (!err) return null;

  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return 'Database login failed. Check DB_USER and DB_PASSWORD in backend/.env.';
  }

  if (err.code === 'ECONNREFUSED') {
    return 'Cannot connect to MySQL. Make sure MySQL is running and DB_HOST/DB_PORT are correct.';
  }

  if (err.code === 'ER_BAD_DB_ERROR') {
    return 'Database not found. Create/import the database from database/schema.sql first.';
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return 'Database schema is incomplete. Import database/schema.sql again.';
  }

  return null;
};

export const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const friendlyMessage = mysqlFriendlyMessage(err);
  const message = friendlyMessage || err.message || 'Internal Server Error';

  const response = {
    success: false,
    message
  };

  if (env.nodeEnv !== 'production') {
    response.error = {
      code: err.code || null,
      detail: err.sqlMessage || err.message || null
    };
  }

  return res.status(statusCode).json(response);
};
