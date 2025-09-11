import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import type { User as UserType } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends UserType {}
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    activatedLicenseKey?: string;
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Hash factice pour éviter les timing attacks lors de l'énumération d'utilisateurs
const DUMMY_HASH = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef.0123456789abcdef0123456789abcdef";

export function setupAuth(app: Express) {
  // Configuration de la limitation de taux pour les tentatives de connexion
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives par IP par fenêtre de 15 minutes
    message: {
      message: "Trop de tentatives de connexion depuis cette adresse IP. Réessayez dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: "Trop de tentatives de connexion depuis cette adresse IP. Réessayez dans 15 minutes."
      });
    }
  });

  // Simple session configuration using memory store
  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Sécurisé en production seulement
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          // Vérifier l'utilisateur et l'état de verrouillage en une seule requête
          const { user, isLocked } = await storage.checkUserForLogin(email);
          
          if (isLocked) {
            // Effectuer une comparaison factice pour éviter les timing attacks
            await comparePasswords(password, DUMMY_HASH);
            return done(null, false, { 
              message: "Email ou mot de passe incorrect" // Message générique pour éviter l'énumération
            });
          }

          // Incrémenter les tentatives pour TOUS les emails, existants ou non (évite l'énumération)
          let shouldLock = false;
          let attemptsCount = 0;

          if (!user || !user.password) {
            // Incrémenter les tentatives pour TOUS les emails (évite l'énumération)
            await storage.incrementLoginAttempts(email);
            // Effectuer une comparaison factice pour éviter les timing attacks
            await comparePasswords(password, DUMMY_HASH);
            return done(null, false, { message: "Email ou mot de passe incorrect" });
          }
          
          const isValid = await comparePasswords(password, user.password);
          if (!isValid) {
            // Incrémenter les tentatives d'échec
            await storage.incrementLoginAttempts(email);
            
            // Vérifier si on doit verrouiller le compte (3 tentatives)
            attemptsCount = (user.loginAttempts || 0) + 1;
            if (attemptsCount >= 3) {
              await storage.lockAccount(email, 30); // Verrouiller pendant 30 minutes
              shouldLock = true;
            }
            
            // Message générique pour éviter la fuite d'informations
            return done(null, false, { 
              message: "Email ou mot de passe incorrect" 
            });
          }
          
          // Connexion réussie : réinitialiser les tentatives
          await storage.resetLoginAttempts(email);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration route
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: "Email, mot de passe, prénom et nom sont requis" 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: "Le mot de passe doit contenir au moins 6 caractères" 
        });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Un compte avec cet email existe déjà" 
        });
      }

      const hashedPassword = await hashPassword(password);
      const userId = randomBytes(16).toString("hex");

      const newUser = await storage.createLocalUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
      });

      req.login(newUser, async (err) => {
        if (err) return next(err);
        
        try {
          // Check if there's a pending license activation in session
          if (req.session && req.session.activatedLicenseKey) {
            await storage.setUserLicenseActivated(newUser.id, true);
            // Clear the license from session
            delete req.session.activatedLicenseKey;
          }
        } catch (error) {
          console.error("Error associating license with new user:", error);
          // Continue registration even if license association fails
        }
        
        res.status(201).json({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        });
      });
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
    }
  });

  // Login route avec limitation de taux
  app.post("/api/login", loginLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Erreur serveur" });
      }
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Email ou mot de passe incorrect" 
        });
      }
      
      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ message: "Erreur de connexion" });
        }
        
        try {
          // Check if there's a pending license activation in session
          if (req.session && req.session.activatedLicenseKey && !user.licenseActivated) {
            await storage.setUserLicenseActivated(user.id, true);
            // Clear the license from session
            delete req.session.activatedLicenseKey;
          }
        } catch (error) {
          console.error("Error associating license with user:", error);
          // Continue login even if license association fails
        }
        
        res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Déconnexion réussie" });
    });
  });

  // Get current user route
  app.get("/api/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }
    
    try {
      // Always fetch fresh user data from database to get current license status
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ message: "Utilisateur non trouvé" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        company: user.company,
        position: user.position,
        address: user.address,
        businessType: user.businessType,
        profileImageUrl: user.profileImageUrl,
        licenseActivated: user.licenseActivated, // Include license status
        currency: user.currency,
        language: user.language,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      res.status(500).json({ message: "Erreur lors de la récupération des données utilisateur" });
    }
  });

  // Password reset routes avec limitation de taux
  const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 tentatives par IP par fenêtre de 15 minutes
    message: {
      message: "Trop de demandes de réinitialisation. Réessayez dans 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        message: "Trop de demandes de réinitialisation. Réessayez dans 15 minutes."
      });
    }
  });

  app.post("/api/request-password-reset", passwordResetLimiter, async (req, res) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        return res.status(400).json({ 
          message: "Email requis" 
        });
      }

      // Générer un token sécurisé
      const token = randomBytes(32).toString("hex");
      
      // Hasher le token avant de le stocker (utilise le hachage cryptographique)
      const salt = randomBytes(16).toString("hex");
      const tokenHash = (await scryptAsync(token, salt, 64)) as Buffer;
      const hashedToken = `${tokenHash.toString("hex")}.${salt}`;
      
      // Token valide pendant 1 heure
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Toujours retourner succès même si l'email n'existe pas (évite l'énumération)
      await storage.setPasswordResetToken(email, hashedToken, expiresAt);
      
      // TODO: Envoyer l'email avec le token (intégration email)
      // Ne jamais logger le token pour la sécurité
      console.log(`Demande de réinitialisation pour ${email}`);
      
      res.json({ 
        message: "Si cet email existe dans notre système, vous recevrez un lien de réinitialisation." 
      });
    } catch (error) {
      console.error("Erreur lors de la demande de réinitialisation:", error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la demande de réinitialisation" 
      });
    }
  });

  app.post("/api/reset-password", passwordResetLimiter, async (req, res) => {
    try {
      const { token, newPassword, email } = req.body;

      if (!token || !newPassword || !email || typeof token !== "string" || typeof newPassword !== "string" || typeof email !== "string") {
        return res.status(400).json({ 
          message: "Token, email et nouveau mot de passe requis" 
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ 
          message: "Le nouveau mot de passe doit contenir au moins 8 caractères" 
        });
      }

      // Utiliser la méthode de storage pour vérifier le token (optimisé pour un utilisateur spécifique)
      const validUser = await storage.verifyPasswordResetToken(token, email);
      
      if (!validUser) {
        return res.status(400).json({ 
          message: "Token invalide ou expiré" 
        });
      }

      // Hasher le nouveau mot de passe
      const hashedPassword = await hashPassword(newPassword);
      
      // Mettre à jour le mot de passe et nettoyer le token
      await storage.updateUserProfile(validUser.id, { 
        password: hashedPassword 
      });
      await storage.clearPasswordResetToken(validUser.email);
      await storage.resetLoginAttempts(validUser.email);

      res.json({ 
        message: "Mot de passe mis à jour avec succès" 
      });
    } catch (error) {
      console.error("Erreur lors de la réinitialisation du mot de passe:", error);
      res.status(500).json({ 
        message: "Erreur serveur lors de la réinitialisation" 
      });
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentification requise" });
}