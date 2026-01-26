import { users, userLevels, type User, type InsertUser, type GameData, type Level } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import fs from "fs/promises";
import path from "path";

const PostgresSessionStore = connectPg(session);

// Helper to parse the Python file
function parsePythonData(content: string): GameData {
  try {
    const levelsStart = content.indexOf("levels = [");
    if (levelsStart === -1) throw new Error("Could not find levels definition");
    
    const listStart = content.indexOf("[", levelsStart + 9);
    if (listStart === -1) throw new Error("Could not find start of levels list");

    let braceCount = 0;
    let endIndex = -1;
    let foundStart = false;
    
    for (let i = listStart; i < content.length; i++) {
      if (content[i] === '[') {
        if (!foundStart) foundStart = true;
        braceCount++;
      } else if (content[i] === ']') {
        braceCount--;
        if (foundStart && braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

    if (endIndex === -1) throw new Error("Could not find end of levels list");

    const levelsString = content.substring(listStart + 1, endIndex).trim();

    let cleanString = "[" + levelsString
      .replace(/#.*$/gm, '') 
      .replace(/\(/g, '[')   
      .replace(/\)/g, ']')
      .replace(/'/g, '"')    
      .replace(/,(\s*[\]])/g, '$1') 
      .replace(/,(\s*[\]])/g, '$1'); 

    if (cleanString.endsWith(',]')) cleanString = cleanString.slice(0, -2) + ']';
    if (!cleanString.endsWith(']')) cleanString += ']';

    const parsedRaw = JSON.parse(cleanString);
    
    const levels: Level[] = parsedRaw.map((lvl: any, index: number) => ({
      id: index,
      blocks: lvl[0].map((b: any) => ({ x: b[0], y: b[1], w: b[2], h: b[3] })),
      spikes: lvl[1].map((s: any) => {
        let y = s[1];
        if (s[2] === 0) y -= 1; 
        return { x: s[0], y, orientation: s[2] };
      }),
      endX: lvl[2],
      bgColor: lvl[3],
      groundColor: lvl[4],
      name: lvl[5] || "New Level",
      author: lvl[8] || "Unknown",
      attempts: lvl[7] || 0,
      completed: lvl[6] || 0,
      pads: lvl[9] || []
    }));

    return { levels };
  } catch (e) {
    console.error("Failed to parse Python file:", e);
    return { levels: [] };
  }
}

async function generatePythonContent(data: GameData): Promise<string> {
   const levelsStr = "[\n" + data.levels.map(lvl => {
     const blocks = "[" + lvl.blocks.map(b => `[${b.x}, ${b.y}, ${b.w}, ${b.h}]`).join(", ") + "]";
     const spikes = "[" + lvl.spikes.map(s => {
       let y = s.y;
       if (s.orientation === 0) y += 1; 
       return `[${s.x}, ${y}, ${s.orientation}]`;
     }).join(", ") + "]";
     const bg = `(${lvl.bgColor.join(", ")})`;
     const ground = `(${lvl.groundColor.join(", ")})`;
     const pads = "[" + (lvl.pads || []).map(p => `[${p[0]}, ${p[1]}]`).join(", ") + "]";
     return `    [  # ${lvl.name}\n        ${blocks},\n        ${spikes},\n        ${lvl.endX}, ${bg}, ${ground}, "${lvl.name}", ${lvl.completed}, ${lvl.attempts}, "${lvl.author}", ${pads}\n    ]`;
   }).join(",\n") + "\n]";

   const templatePath = path.join(process.cwd(), "attached_assets", "gd.V1.1.2_1769411210029.py");
   let template = await fs.readFile(templatePath, "utf-8");

   const levelsStart = template.indexOf("levels = [");
   const listStart = template.indexOf("[", levelsStart + 9);
   
   let braceCount = 0;
   let endIndex = -1;
   let foundStart = false;
   
   for (let i = listStart; i < template.length; i++) {
     if (template[i] === '[') {
       if (!foundStart) foundStart = true;
       braceCount++;
     } else if (template[i] === ']') {
       braceCount--;
       if (foundStart && braceCount === 0) {
         endIndex = i;
         break;
       }
     }
   }

   if (listStart !== -1 && endIndex !== -1) {
      return template.substring(0, listStart) + levelsStr + template.substring(endIndex + 1);
   }

   return template;
}

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserLevel(userId: number): Promise<GameData | undefined>;
  updateUserLevel(userId: number, data: GameData): Promise<void>;
  parsePython(content: string): GameData;
  generatePython(data: GameData): Promise<string>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUserLevel(userId: number): Promise<GameData | undefined> {
    const [record] = await db.select().from(userLevels).where(eq(userLevels.userId, userId));
    return record?.levelData as GameData | undefined;
  }

  async updateUserLevel(userId: number, data: GameData): Promise<void> {
    const existing = await this.getUserLevel(userId);
    if (existing) {
      await db.update(userLevels)
        .set({ levelData: data, updatedAt: new Date() })
        .where(eq(userLevels.userId, userId));
    } else {
      await db.insert(userLevels).values({
        userId,
        levelData: data,
      });
    }
  }

  parsePython(content: string): GameData {
    return parsePythonData(content);
  }

  async generatePython(data: GameData): Promise<string> {
    return await generatePythonContent(data);
  }
}

export const storage = new DatabaseStorage();
