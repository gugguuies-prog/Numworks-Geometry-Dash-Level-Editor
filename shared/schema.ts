import { z } from "zod";

// We represent the game data structure:
// levels: list[tuple[
//     list[list[int]],    # blocks[x_tile, y_tile, width_tiles, height_tiles]
//     list[list[int]],    # spikes[x_tile, y_tile, orientation]
//     int,                # level end (mesured in tiles)
//     tuple[int,int,int], # bg color (red, green, blue)
//     tuple[int,int,int]  # ground color (red, green, blue)
// ]]

export const blockSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export const spikeSchema = z.object({
  x: z.number(),
  y: z.number(),
  orientation: z.number(), // 0 = normal, 1 = upside down (ceiling)
});

// Color tuple [r, g, b]
export const colorSchema = z.tuple([z.number(), z.number(), z.number()]);

export const levelSchema = z.object({
  id: z.number(),
  blocks: z.array(blockSchema),
  spikes: z.array(spikeSchema),
  endX: z.number(),
  bgColor: colorSchema,
  groundColor: colorSchema,
});

export const gameDataSchema = z.object({
  levels: z.array(levelSchema),
});

export type Block = z.infer<typeof blockSchema>;
export type Spike = z.infer<typeof spikeSchema>;
export type Level = z.infer<typeof levelSchema>;
export type GameData = z.infer<typeof gameDataSchema>;
export type Color = z.infer<typeof colorSchema>;

// API Types
export type UpdateLevelRequest = Level;
