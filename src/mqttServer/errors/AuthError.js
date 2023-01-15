class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
}

export default AuthError;
