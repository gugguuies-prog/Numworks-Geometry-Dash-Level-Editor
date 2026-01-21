import { HexColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { type Color } from "@shared/schema";

interface ColorInputProps {
  color: Color;
  onChange: (color: Color) => void;
  label: string;
}

// Convert RGB array [r, g, b] to Hex string
const rgbToHex = (c: Color) => {
  return "#" + c.map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

// Convert Hex string to RGB array
const hexToRgb = (hex: string): Color => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ]
    : [0, 0, 0];
};

export function ColorInput({ color, onChange, label }: ColorInputProps) {
  const hex = rgbToHex(color);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 px-3 h-10 bg-card border-input hover:bg-accent/10"
          >
            <div 
              className="w-5 h-5 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: hex }} 
            />
            <span className="font-mono text-xs text-muted-foreground">{hex}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 bg-popover border-border">
          <HexColorPicker color={hex} onChange={(c) => onChange(hexToRgb(c))} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
