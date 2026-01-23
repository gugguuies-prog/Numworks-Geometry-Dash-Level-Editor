import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { gameDataSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  app.get(api.levels.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = await storage.getUserLevel(req.user.id);
      res.json(data || { levels: [] });
    } catch (e) {
      res.status(500).json({ message: "Failed to load game data" });
    }
  });

  app.put(api.levels.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = gameDataSchema.parse(req.body);
      await storage.updateUserLevel(req.user.id, data);
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: "Failed to update game data" });
    }
  });

  return httpServer;
}
