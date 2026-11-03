import jwt from "jsonwebtoken";

export const assertJWTSecretIsConfigured = (): void => {
  const jwtSecret = process.env["JWT_SECRET"];
  
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
  }
  
  if (jwtSecret.length < 32) {
    throw new Error("JWT_SECRET is too short. It must be at least 32 characters long for security.");
  }
}



export const generateToken = (userId: number) => {
  const jwtSecret = process.env["JWT_SECRET"];

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is missing in environment variables.");
  }

  return jwt.sign(
    { sub: userId },
    jwtSecret, 
    {
      algorithm: "HS256",
      expiresIn: "15m",
    },
  );
};