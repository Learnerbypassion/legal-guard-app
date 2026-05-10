// In-memory store for passing large data between screens without URL limits or Async limitations
export const GlobalDataStore: Record<string, any> = {
  currentAnalysis: null,
  currentContractText: '',
};
