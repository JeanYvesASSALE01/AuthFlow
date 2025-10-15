function erreurBox(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Erreur serveur";
  res.status(status).json({ success: false, message });
}
export default erreurBox;
