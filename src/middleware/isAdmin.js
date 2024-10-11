

export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ isSuccess:false, message: "Access Denied: Only admin has permission to perfrom this task" });
  }
  next();
};
export default isAdmin;
