import { create } from 'zustand';

interface UiState {
  showCodex: boolean;
  showResult: boolean;
  showSettings: boolean;
  showEventLog: boolean;
  hoveredCell: { x: number; y: number } | null;
  cellSize: number;
  mobileLayout: boolean;
  animationSpeed: number;
  codexCategory: 'all' | 'species' | 'habitat' | 'migration' | 'threat';

  setShowCodex: (v: boolean) => void;
  setShowResult: (v: boolean) => void;
  setShowSettings: (v: boolean) => void;
  setShowEventLog: (v: boolean) => void;
  setHoveredCell: (v: { x: number; y: number } | null) => void;
  setCellSize: (v: number) => void;
  setMobileLayout: (v: boolean) => void;
  setAnimationSpeed: (v: number) => void;
  setCodexCategory: (v: UiState['codexCategory']) => void;
}

export const useUiStore = create<UiState>((set) => ({
  showCodex: false,
  showResult: false,
  showSettings: false,
  showEventLog: false,
  hoveredCell: null,
  cellSize: 52,
  mobileLayout: false,
  animationSpeed: 1,
  codexCategory: 'all',

  setShowCodex: (v) => set({ showCodex: v }),
  setShowResult: (v) => set({ showResult: v }),
  setShowSettings: (v) => set({ showSettings: v }),
  setShowEventLog: (v) => set({ showEventLog: v }),
  setHoveredCell: (v) => set({ hoveredCell: v }),
  setCellSize: (v) => set({ cellSize: v }),
  setMobileLayout: (v) => set({ mobileLayout: v }),
  setAnimationSpeed: (v) => set({ animationSpeed: v }),
  setCodexCategory: (v) => set({ codexCategory: v }),
}));
