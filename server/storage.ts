import { GameData, Level } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getGameData(): Promise<GameData>;
  updateGameData(data: GameData): Promise<GameData>;
  getScriptContent(): Promise<string>;
  importPythonData(content: string): Promise<GameData>;
}

// Helper to parse the Python file
// This is a naive parser specific to the provided file format
function parsePythonData(content: string): GameData {
  try {
    // Find the levels list definition
    const levelsStart = content.indexOf("levels: list[tuple[");
    if (levelsStart === -1) throw new Error("Could not find levels definition");
    
    const listStart = content.indexOf("= [", levelsStart);
    if (listStart === -1) throw new Error("Could not find start of levels list");

    // We need to extract the list content. 
    // Since it's Python syntax, we can try to interpret it as JSON-like if we clean it up,
    // or just regex it. The format is:
    // ( [blocks], [spikes], endX, (r,g,b), (r,g,b) ),
    
    // Let's use a more manual extraction to be safe against Python syntax nuances (like comments, trailing commas)
    
    // Extract the part between the outer [ ]
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

    const levelsString = content.substring(listStart + 1, endIndex + 1).trim(); // The [...] content

    // Now we need to parse the tuples inside the list.
    // Python tuples (...) -> JS arrays [...] for JSON parsing if we replace () with []
    // Also remove comments
    
    let cleanString = levelsString
      .replace(/#.*$/gm, '') // Remove comments
      .replace(/\(/g, '[')   // Replace tuple parens with brackets
      .replace(/\)/g, ']')
      .replace(/'/g, '"')    // Replace single quotes
      .replace(/,(\s*[\]])/g, '$1') // Robust trailing comma removal
      .replace(/,(\s*[\]])/g, '$1'); // Double pass for nested arrays

    // Fix trailing comma at the end of the main list if present
    if (cleanString.endsWith(',]')) cleanString = cleanString.slice(0, -2) + ']';

    // The outer structure is now [[blocks], [spikes], end, [color], [color]], ...]
    // But wait, the python structure is a LIST of TUPLES.
    // levels = [ ( ... ), ( ... ) ]
    // cleanString should look like [[...], [...]]
    
    // NOTE: The `cleanString` logic above effectively converts the outer [...] and inner (...) all to [...].
    // So `[(...)]` becomes `[[...]]`.
    
    // Let's try to parse it
    // There is a risk of `1/30` or other expressions, but the levels list contains integers.
    
    const parsedRaw = JSON.parse(cleanString);
    
    const levels: Level[] = parsedRaw.map((lvl: any, index: number) => ({
      id: index,
      blocks: lvl[0].map((b: any) => ({ x: b[0], y: b[1], w: b[2], h: b[3] })),
      spikes: lvl[1].map((s: any) => {
        let y = s[1];
        if (s[2] === 0) y -= 1; // Shift UP on import for floor spikes (orientation 0)
        return { x: s[0], y, orientation: s[2] };
      }),
      endX: lvl[2],
      bgColor: lvl[3],
      groundColor: lvl[4],
    }));

    return { levels };
  } catch (e) {
    console.error("Failed to parse Python file:", e);
    // Return empty default if parsing fails
    return { levels: [] };
  }
}

function generatePythonContent(originalContent: string, data: GameData): string {
   // Reconstruct the levels string
   const levelsStr = "[\n" + data.levels.map(lvl => {
     const blocks = "[" + lvl.blocks.map(b => `[${b.x}, ${b.y}, ${b.w}, ${b.h}]`).join(", ") + "]";
     const spikes = "[" + lvl.spikes.map(s => {
       let y = s.y;
       if (s.orientation === 0) y += 1; // Shift DOWN on export for floor spikes (orientation 0)
       return `[${s.x}, ${y}, ${s.orientation}]`;
     }).join(", ") + "]";
     const bg = `(${lvl.bgColor.join(", ")})`;
     const ground = `(${lvl.groundColor.join(", ")})`;
     return `    (\n        ${blocks},\n        ${spikes},\n        ${lvl.endX}, ${bg}, ${ground}\n    )`;
   }).join(",\n") + "\n]";

   // Replace the original list in the file
   const levelsStart = originalContent.indexOf("levels: list[tuple[");
   const listStart = originalContent.indexOf("= [", levelsStart);
   
    let braceCount = 0;
    let endIndex = -1;
    let foundStart = false;
    
    for (let i = listStart; i < originalContent.length; i++) {
      if (originalContent[i] === '[') {
        if (!foundStart) foundStart = true;
        braceCount++;
      } else if (originalContent[i] === ']') {
        braceCount--;
        if (foundStart && braceCount === 0) {
          endIndex = i;
          break;
        }
      }
    }

   if (listStart !== -1 && endIndex !== -1) {
      return originalContent.substring(0, listStart + 2) + levelsStr + originalContent.substring(endIndex + 1);
   }
   
   return originalContent;
}


export class FileStorage implements IStorage {
  private filePath = path.join(process.cwd(), "attached_assets", "gd_-_Copie_1768980648645.txt");
  private cachedData: GameData | null = null;
  private cachedContent: string | null = null;

  async getGameData(): Promise<GameData> {
    const content = await fs.readFile(this.filePath, "utf-8");
    this.cachedContent = content;
    this.cachedData = parsePythonData(content);
    return this.cachedData;
  }

  async updateGameData(data: GameData): Promise<GameData> {
    if (!this.cachedContent) {
        await this.getGameData();
    }
    const newContent = generatePythonContent(this.cachedContent!, data);
    await fs.writeFile(this.filePath, newContent, "utf-8");
    
    this.cachedContent = newContent;
    this.cachedData = data;
    return data;
  }

  async getScriptContent(): Promise<string> {
    return await fs.readFile(this.filePath, "utf-8");
  }

  async importPythonData(content: string): Promise<GameData> {
    const data = parsePythonData(content);
    await fs.writeFile(this.filePath, content, "utf-8");
    this.cachedContent = content;
    this.cachedData = data;
    return data;
  }
}

export const storage = new FileStorage();
