import { create } from 'zustand';

const useFormulaStore = create((set) => ({
  tags: [],
  result: 0,
  
  addTag: (tag) => set((state) => ({
    ...state,
    tags: [...state.tags, tag]
  })),
  
  removeTag: (index) => set((state) => ({
    ...state,
    tags: state.tags.filter((_, i) => i !== index)
  })),
  
  updateTag: (index, newValue) => set((state) => ({
    ...state,
    tags: state.tags.map((tag, i) => i === index ? { ...tag, value: newValue } : tag)
  })),
  
  setResult: (result) => set((state) => ({ ...state, result })),
  
  // Clear all tags
  clearTags: () => set({ tags: [], result: 0 }),
}));

export default useFormulaStore; 