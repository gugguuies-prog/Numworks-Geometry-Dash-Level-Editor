import { useState, useEffect } from "react";
import { useLevels, useUpdateLevels, useExportScript, useAuth } from "@/hooks/use-levels";
import { EditorCanvas } from "@/components/EditorCanvas";
import { ColorInput } from "@/components/ColorPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, Download, Plus, Trash2, Upload,
  MousePointer2, Square, Triangle, Eraser, 
  Settings, Layers, Monitor, Play, LogOut, Loader2,
  CircleDot
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import clsx from "clsx";
import type { Level } from "@shared/schema";

type ToolType = "cursor" | "block" | "spike" | "eraser" | "pad";

export default function Editor() {
  const { data: gameData, isLoading } = useLevels();
  const updateMutation = useUpdateLevels();
  const exportScript = useExportScript();
  const { logout } = useAuth();
  
  const [selectedLevelId, setSelectedLevelId] = useState<number>(0);
  const [localGameData, setLocalGameData] = useState(gameData);
  const [activeTool, setActiveTool] = useState<ToolType>("cursor");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local state when data loads
  useEffect(() => {
    if (gameData && !localGameData) {
      setLocalGameData(gameData);
    }
  }, [gameData]);

  // Handle level updates locally first
  const handleLevelChange = (updatedLevel: Level) => {
    if (!localGameData) return;
    const newLevels = localGameData.levels.map(l => 
      l.id === updatedLevel.id ? updatedLevel : l
    );
    setLocalGameData({ ...localGameData, levels: newLevels });
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!localGameData) return;
    updateMutation.mutate(localGameData, {
      onSuccess: () => setHasUnsavedChanges(false)
    });
  };

  const handleAddLevel = () => {
    if (!localGameData) return;
    const newId = Math.max(0, ...localGameData.levels.map(l => l.id)) + 1;
    const newLevel: Level = {
      id: newId,
      blocks: [],
      spikes: [],
      endX: 100,
      bgColor: [30, 30, 30],
      groundColor: [100, 100, 255],
      name: `Level ${newId + 1}`,
      author: "Unknown",
      attempts: 0,
      completed: 0,
      pads: []
    };
    setLocalGameData({
      ...localGameData,
      levels: [...localGameData.levels, newLevel]
    });
    setSelectedLevelId(newId);
    setHasUnsavedChanges(true);
  };

  const handleDeleteLevel = () => {
    if (!localGameData || localGameData.levels.length <= 1) return;
    const newLevels = localGameData.levels.filter(l => l.id !== selectedLevelId);
    setLocalGameData({ ...localGameData, levels: newLevels });
    setSelectedLevelId(newLevels[0].id);
    setHasUnsavedChanges(true);
  };

  const handleExport = () => {
    exportScript();
  };

  const handleExportOptimized = async () => {
    try {
      const response = await fetch("/api/export-optimized");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gd_optimized.py";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Optimized export failed", err);
    }
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".py";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const res = await fetch("/api/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
          if (res.ok) {
            const data = await res.json();
            setLocalGameData(data);
            setHasUnsavedChanges(false);
            window.location.reload(); // Refresh to ensure all states are clean
          }
        } catch (err) {
          console.error("Import failed", err);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const currentLevel = localGameData?.levels.find(l => l.id === selectedLevelId);

  // If no level is selected but we have levels, select the first one
  useEffect(() => {
    if (localGameData && localGameData.levels.length > 0 && !currentLevel) {
      setSelectedLevelId(localGameData.levels[0].id);
    }
  }, [localGameData, currentLevel]);

  if (isLoading || !localGameData) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono animate-pulse">Initializing Editor Protocol...</p>
        </div>
      </div>
    );
  }

  // Handle case where user has no levels yet
  if (localGameData.levels.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-6 max-w-md text-center p-6">
          <Monitor className="w-16 h-16 text-primary animate-pulse" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome to Level Studio</h2>
            <p className="text-muted-foreground">You don't have any levels yet. Create your first one to start designing!</p>
          </div>
          <Button onClick={handleAddLevel} size="lg" className="w-full gap-2">
            <Plus className="w-5 h-5" /> Create First Level
          </Button>
          <Button variant="ghost" onClick={() => logout.mutate()} className="gap-2">
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>
      </div>
    );
  }

  // Ensure currentLevel exists before rendering editor
  if (!currentLevel) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-display">
      {/* HEADER */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Monitor className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none tracking-tight">Numworks GD Editor</h1>
            <p className="text-xs text-muted-foreground font-mono mt-1">v1.4.0 • {localGameData.levels.length} Levels Loaded</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={handleImport}
            className="font-mono text-xs gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
          >
            <Upload className="w-4 h-4" />
            IMPORT .PY
          </Button>
          <Button 
            variant={hasUnsavedChanges ? "default" : "secondary"}
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className={clsx(
              "font-mono text-xs gap-2 transition-all duration-300",
              hasUnsavedChanges && "shadow-[0_0_20px_rgba(124,58,237,0.3)] animate-pulse"
            )}
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "SAVING..." : hasUnsavedChanges ? "SAVE CHANGES*" : "SAVED"}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="font-mono text-xs gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50"
          >
            <Download className="w-4 h-4" />
            EXPORT .PY
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportOptimized}
            className="font-mono text-xs gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary hover:border-primary/50 bg-primary/5 shadow-sm shadow-primary/10"
          >
            <Play className="w-4 h-4" />
            EXPORT OPTIMIZED
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => logout.mutate()}
            className="font-mono text-xs gap-2"
          >
            <LogOut className="w-4 h-4" />
            LOGOUT
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - Level Selector */}
        <aside className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Levels</h2>
            <Button onClick={handleAddLevel} className="w-full gap-2" variant="secondary">
              <Plus className="w-4 h-4" /> New Level
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {localGameData.levels.map((level) => (
              <button
                key={level.id}
                onClick={() => setSelectedLevelId(level.id)}
                className={clsx(
                  "w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all group relative",
                  selectedLevelId === level.id 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <span className="font-mono">{level.name || `Level ${level.id + 1}`}</span>
                <span className="text-xs ml-2 opacity-50 block">
                  {level.blocks.length} blocks • {level.spikes.length} spikes • {level.author || 'Unknown'}
                </span>
                
                {selectedLevelId === level.id && localGameData.levels.length > 1 && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); handleDeleteLevel(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-destructive/20 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <main className="flex-1 bg-black/50 relative flex flex-col overflow-hidden">
          {/* Toolbar overlay */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full shadow-2xl p-1.5 flex gap-1 z-20">
            <ToolButton 
              active={activeTool === "cursor"} 
              onClick={() => setActiveTool("cursor")} 
              icon={MousePointer2} 
              tooltip="Select (V)" 
            />
            <div className="w-px bg-border mx-1 h-6 self-center" />
            <ToolButton 
              active={activeTool === "block"} 
              onClick={() => setActiveTool("block")} 
              icon={Square} 
              tooltip="Block Tool (B)" 
            />
            <ToolButton 
              active={activeTool === "spike"} 
              onClick={() => setActiveTool("spike")} 
              icon={Triangle} 
              tooltip="Spike Tool (S)" 
            />
            <ToolButton 
              active={activeTool === "pad"} 
              onClick={() => setActiveTool("pad")} 
              icon={CircleDot} 
              tooltip="Pad Tool (P)" 
            />
            <div className="w-px bg-border mx-1 h-6 self-center" />
            <ToolButton 
              active={activeTool === "eraser"} 
              onClick={() => setActiveTool("eraser")} 
              icon={Eraser} 
              tooltip="Eraser (E)" 
            />
            <div className="w-px bg-border mx-1 h-6 self-center" />
            <ToolButton 
              active={false} 
              onClick={() => window.open('/play', '_blank')} 
              icon={Play} 
              tooltip="Play Level (P)" 
            />
          </div>

          <div className="flex-1 overflow-auto p-8 flex items-center justify-start min-h-0 bg-neutral-950/50 backdrop-blur-sm">
            <EditorCanvas 
              level={currentLevel} 
              onChange={handleLevelChange} 
              tool={activeTool}
              zoom={2} // Default zoom 2x for visibility
            />
          </div>
          
          <div className="h-8 bg-card border-t border-border flex items-center px-4 text-xs font-mono text-muted-foreground justify-between">
             <span>Coordinates: X:{currentLevel.endX} tiles</span>
             <span>Press 'Shift' to scroll horizontally</span>
          </div>
        </main>

        {/* RIGHT SIDEBAR - Properties */}
        <aside className="w-72 bg-card border-l border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" /> Properties
            </h2>
          </div>
          
          <div className="p-6 space-y-8">
            {/* Level Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Level Name</h3>
                <Input 
                  value={currentLevel.name}
                  onChange={(e) => handleLevelChange({ ...currentLevel, name: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Author</h3>
                <Input 
                  value={currentLevel.author}
                  onChange={(e) => handleLevelChange({ ...currentLevel, author: e.target.value })}
                  className="font-mono"
                />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Level Length</h3>
                <span className="text-xs text-muted-foreground font-mono">{currentLevel.endX} tiles</span>
              </div>
              <Input 
                type="number" 
                value={currentLevel.endX}
                onChange={(e) => handleLevelChange({ ...currentLevel, endX: parseInt(e.target.value) || 100 })}
                className="font-mono"
              />
              <p className="text-[10px] text-muted-foreground">
                Defines the X coordinate where the level ends.
              </p>
            </div>

            <Separator />

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Layers className="w-4 h-4" /> Appearance
              </h3>
              
              <ColorInput 
                label="Background Color"
                color={currentLevel.bgColor}
                onChange={(c) => handleLevelChange({ ...currentLevel, bgColor: c })}
              />
              
              <ColorInput 
                label="Ground/Block Color"
                color={currentLevel.groundColor}
                onChange={(c) => handleLevelChange({ ...currentLevel, groundColor: c })}
              />
            </div>

            <Separator />

            {/* Stats */}
            <div className="rounded-lg bg-background/50 p-4 space-y-2 border border-border/50">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Blocks</span>
                <span className="font-mono">{currentLevel.blocks.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Spikes</span>
                <span className="font-mono">{currentLevel.spikes.length}</span>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Use <b>Left Click</b> to place/select.<br/>
                <b>Drag</b> to create large blocks.<br/>
                <b>Click</b> existing spike to flip.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ToolButton({ 
  active, 
  onClick, 
  icon: Icon, 
  tooltip 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: any; 
  tooltip: string 
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={clsx(
            "p-2 rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
            active 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Icon className="w-5 h-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="font-mono text-xs">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
