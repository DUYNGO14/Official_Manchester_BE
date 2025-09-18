// enums/Position.ts
export enum Position {
  GK = "GK",   // Goalkeeper
  LB = "LB",   // Left Back
  LCB = "LCB", // Left Center Back (optional)
  CB = "CB",   // Center Back
  RCB = "RCB", // Right Center Back (optional)
  RB = "RB",   // Right Back
  CDM = "CDM", // Central Defensive Midfielder
  LWB = "LWB", // Left Wing Back
  RWB = "RWB", // Right Wing Back
  DM = "DM",   // Defensive Midfielder
  CM = "CM",   // Central Midfielder
  MF = "MF",   // Midfielder
  AM = "AM",   // Attacking Midfielder
  LW = "LW",   // Left Winger
  RW = "RW",   // Right Winger
  CF = "CF",   // Centre Forward
  ST = "ST",   // Striker
  SS = "SS"    // Second Striker / Support Striker
}

// Hiển thị tên đầy đủ cho UI
export const PositionLabel: Record<Position, string> = {
  [Position.GK]: "Goalkeeper",
  [Position.MF]: "Midfielder",
  [Position.LB]: "Left Back",
  [Position.LCB]: "Left Center Back",
  [Position.CB]: "Center Back",
  [Position.RCB]: "Right Center Back",
  [Position.RB]: "Right Back",
  [Position.LWB]: "Left Wing Back",
  [Position.RWB]: "Right Wing Back",
  [Position.CDM]: "Central Defensive Midfielder",
  [Position.DM]: "Defensive Midfielder",
  [Position.CM]: "Central Midfielder",
  [Position.AM]: "Attacking Midfielder",
  [Position.LW]: "Left Winger",
  [Position.RW]: "Right Winger",
  [Position.CF]: "Centre Forward",
  [Position.ST]: "Striker",
  [Position.SS]: "Second Striker"
};

// Helper: lấy label từ enum value
export function getPositionLabel(pos: Position | string): string {
  return (PositionLabel as any)[pos] ?? String(pos);
}

// Helper: danh sách tất cả positions (mảng)
export const ALL_POSITIONS: Position[] = Object.values(Position) as Position[];
