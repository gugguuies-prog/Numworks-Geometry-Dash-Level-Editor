import { useRef, useState, useEffect } from "react";
import { type Level, type Block, type Spike, type Color } from "@shared/schema";
import { MousePointer2, Eraser, Square, Triangle } from "lucide-react";
import clsx from "clsx";

interface EditorCanvasProps {
  level: Level;
  tool: "cursor" | "block" | "spike" | "eraser";
  onChange: (updatedLevel: Level) => void;
  zoom?: number;
}

const TILE_W = 10;
const TILE_H = 32;
const VIEWPORT_H = 222; // Numworks screen height

export function EditorCanvas({ level, tool, onChange, zoom = 1 }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [hoverTile, setHoverTile] = useState<{ x: number; y: number } | null>(null);

  // Convert RGB array to CSS string
  const rgbString = (color: Color) => `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  // Handle mouse interactions
  const getTileCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / (TILE_W * zoom));
    const y = Math.floor((e.clientY - rect.top) / (TILE_H * zoom));
    return { x: Math.max(0, x), y: Math.max(0, Math.min(6, y)) }; // Clamp Y to ~7 rows (222px / 32px)
  };

  const getSpikeAt = (x: number, y: number) => {
    return level.spikes.find(s => s.x === x && s.y === y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const coords = getTileCoords(e);
    setIsDragging(true);
    setDragStart(coords);

    if (tool === "spike") {
      const existingSpike = getSpikeAt(coords.x, coords.y);
      if (existingSpike) {
        const newSpikes = level.spikes.map(s => 
          (s.x === coords.x && s.y === coords.y) 
            ? { ...s, orientation: s.orientation === 0 ? 1 : 0 } 
            : s
        );
        onChange({ ...level, spikes: newSpikes });
      } else {
        onChange({
          ...level,
          spikes: [...level.spikes, { x: coords.x, y: coords.y, orientation: 0 }],
        });
      }
    } else if (tool === "eraser") {
      deleteAt(coords.x, coords.y);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getTileCoords(e);
    setHoverTile(coords);

    if (isDragging) {
      if (tool === "eraser") {
        deleteAt(coords.x, coords.y);
      } else if (tool === "block" && dragStart) {
        // Preview handled by render overlay
      }
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    const coords = getTileCoords(e);
    
    if (isDragging && tool === "block" && dragStart) {
      const x = Math.min(dragStart.x, coords.x);
      const y = Math.min(dragStart.y, coords.y);
      const w = Math.abs(coords.x - dragStart.x) + 1;
      const h = Math.abs(coords.y - dragStart.y) + 1;

      // Check for overlap/merge logic could go here, for now just add
      // Ideally we merge overlapping blocks but keeping it simple for MVP
      onChange({
        ...level,
        blocks: [...level.blocks, { x, y, w, h }],
      });
    }

    setIsDragging(false);
    setDragStart(null);
  };

  const deleteAt = (x: number, y: number) => {
    const newBlocks = level.blocks.filter(b => 
      !(x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)
    );
    const newSpikes = level.spikes.filter(s => !(s.x === x && s.y === y));
    
    if (newBlocks.length !== level.blocks.length || newSpikes.length !== level.spikes.length) {
      onChange({ ...level, blocks: newBlocks, spikes: newSpikes });
    }
  };

  return (
    <div className="relative overflow-auto h-full bg-neutral-900 rounded-lg border border-neutral-800 shadow-inner">
      <div 
        ref={canvasRef}
        className="relative editor-grid cursor-crosshair"
        style={{
          width: `${(level.endX + 20) * TILE_W * zoom}px`, // Extra space at end
          height: `${VIEWPORT_H * zoom}px`,
          backgroundColor: rgbString(level.bgColor),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          setIsDragging(false);
          setHoverTile(null);
        }}
      >
        {/* Render Blocks */}
        {level.blocks.map((block, i) => (
          <div
            key={`block-${i}`}
            className="absolute border border-black/20"
            style={{
              left: `${block.x * TILE_W * zoom}px`,
              top: `${block.y * TILE_H * zoom}px`,
              width: `${block.w * TILE_W * zoom}px`,
              height: `${block.h * TILE_H * zoom}px`,
              backgroundColor: rgbString(level.groundColor),
            }}
          />
        ))}

        {/* Render Spikes */}
        {level.spikes.map((spike, i) => (
          <div
            key={`spike-${i}`}
            className={clsx(
              "absolute flex justify-center",
              spike.orientation === 0 ? "items-end" : "items-start"
            )}
            style={{
              left: `${spike.x * TILE_W * zoom}px`,
              top: `${spike.y * TILE_H * zoom}px`,
              width: `${TILE_W * zoom}px`,
              height: `${TILE_H * zoom}px`,
            }}
          >
            <div 
              style={{
                width: 0,
                height: 0,
                borderLeft: `${(TILE_W * zoom) / 2}px solid transparent`,
                borderRight: `${(TILE_W * zoom) / 2}px solid transparent`,
                borderBottom: spike.orientation === 0 ? `${TILE_H * 0.7 * zoom}px solid ${rgbString(level.groundColor)}` : 'none',
                borderTop: spike.orientation === 1 ? `${TILE_H * 0.7 * zoom}px solid ${rgbString(level.groundColor)}` : 'none',
              }}
            />
          </div>
        ))}

        {/* End Level Line */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-red-500/50 border-l border-red-500 dashed"
          style={{ left: `${level.endX * TILE_W * zoom}px` }}
        />

        {/* Player Spawn Point */}
        <div 
          className="absolute border-2 border-orange-500 bg-orange-500/20 rounded-sm pointer-events-none flex items-center justify-center shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          style={{
            left: `${50 * zoom}px`, // player_x is 50 in the script
            top: `${172 * zoom}px`, // player_y is 172 in the script
            width: `${20 * zoom}px`, // PLAYER_WIDTH is 20
            height: `${20 * zoom}px`, // PLAYER_HEIGHT is 20
          }}
        >
          <div className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter">Spawn</div>
        </div>

        {/* Drag Preview (Block Tool) */}
        {isDragging && tool === "block" && dragStart && hoverTile && (
          <div
            className="absolute bg-white/30 border border-white/50 pointer-events-none"
            style={{
              left: `${Math.min(dragStart.x, hoverTile.x) * TILE_W * zoom}px`,
              top: `${Math.min(dragStart.y, hoverTile.y) * TILE_H * zoom}px`,
              width: `${(Math.abs(hoverTile.x - dragStart.x) + 1) * TILE_W * zoom}px`,
              height: `${(Math.abs(hoverTile.y - dragStart.y) + 1) * TILE_H * zoom}px`,
            }}
          />
        )}

        {/* Hover Highlight */}
        {hoverTile && !isDragging && (
          <div
            className="absolute border-2 border-primary/50 pointer-events-none"
            style={{
              left: `${hoverTile.x * TILE_W * zoom}px`,
              top: `${hoverTile.y * TILE_H * zoom}px`,
              width: `${TILE_W * zoom}px`,
              height: `${TILE_H * zoom}px`,
            }}
          />
        )}
      </div>
    </div>
  );
}
