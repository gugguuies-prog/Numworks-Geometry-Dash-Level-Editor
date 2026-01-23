import { users, userLevels, type User, type InsertUser, type GameData } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserLevel(userId: number): Promise<GameData | undefined>;
  updateUserLevel(userId: number, data: GameData): Promise<void>;
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
}

export const storage = new DatabaseStorage();
