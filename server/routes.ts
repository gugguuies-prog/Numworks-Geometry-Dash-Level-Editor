import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get(api.levels.list.path, async (req, res) => {
    try {
      const data = await storage.getGameData();
      res.json(data);
    } catch (e) {
      res.status(500).json({ message: "Failed to load game data" });
    }
  });

  app.put(api.levels.update.path, async (req, res) => {
    try {
      const data = api.levels.update.input.parse(req.body);
      const updated = await storage.updateGameData(data);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Failed to update game data" });
      }
    }
  });

  app.get(api.levels.export.path, async (req, res) => {
    try {
      const content = await storage.getScriptContent();
      res.setHeader('Content-Disposition', 'attachment; filename="gd_edited.py"');
      res.setHeader('Content-Type', 'text/x-python');
      res.send(content);
    } catch (e) {
      res.status(500).json({ message: "Failed to export script" });
    }
  });

  return httpServer;
}
