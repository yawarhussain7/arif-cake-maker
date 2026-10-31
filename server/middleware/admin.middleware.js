
import AppError from "../utils/AppError.js";

export const adminProtectedRoute = (req, res, next) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (req.user.role !== "admin") {
      return next(new AppError("Access denied. Admins only.", 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
