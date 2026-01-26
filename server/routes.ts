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

  app.get("/api/export", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = await storage.getUserLevel(req.user.id);
      if (!data) return res.status(404).json({ message: "No levels found" });
      
      const content = await storage.generatePython(data);
      res.setHeader('Content-Disposition', 'attachment; filename="gd_edited.py"');
      res.setHeader('Content-Type', 'text/x-python');
      res.send(content);
    } catch (e) {
      res.status(500).json({ message: "Failed to export script" });
    }
  });

  app.post("/api/import", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ message: "No content provided" });
      
      const data = storage.parsePython(content);
      await storage.updateUserLevel(req.user.id, data);
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: "Failed to import script" });
    }
  });

  app.post("/api/export-optimized", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const data = await storage.getUserLevel(req.user.id);
      if (!data) return res.status(404).json({ message: "No levels found" });
      
      const content = await storage.generatePython(data);
      
      // Call external minify API
      const minifyRes = await fetch("https://python-minify-api--gugguuies.replit.app/api/minify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: content })
      });
      
      if (!minifyRes.ok) {
        throw new Error("Minification service failed");
      }
      
      const minifyData = await minifyRes.json();
      res.setHeader('Content-Disposition', 'attachment; filename="gd_optimized.py"');
      res.setHeader('Content-Type', 'text/x-python');
      res.send(minifyData.minimizedCode);
    } catch (e) {
      console.error("Optimized export failed", e);
      res.status(500).json({ message: "Failed to export optimized script" });
    }
  });

  return httpServer;
}
