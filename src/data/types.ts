export type Level = "B2" | "C1";
export type ItemType = "pure" | "idiom";

export interface WordItem {
  id: string;
  unitNo: number;
  slot: number;
  word: string;
  pos: string;
  definitionEn: string;
  example: string;
  level: Level;
  itemType: ItemType;
  source: string;
  meaningKo: string;
  clozeSurface: string;
}

export interface ReviewSchedule {
  reviewNo: number;
  afterUnit: number;
  coversUnits: [number, number, number];
}
