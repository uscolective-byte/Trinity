// Bezpečná vrstva pre správu pamäte (server-side)
const memoryStore = [];

export function saveMemory(entry) {
  // Základná sanitizácia (odstránenie citlivých vzorov, napr. hesiel)
  const sanitizedContent = entry.replace(/password\s*=\s*\S+/gi, "[FILTERED]");
  
  const record = {
    id: Date.now().toString(),
    content: sanitizedContent,
    timestamp: new Date().toISOString()
  };
  
  memoryStore.push(record);
  return record;
}

export function getMemories() {
  return memoryStore;
} Bezpečná vrstva pre správu pamäte (server-side)
const memoryStore = [];

export function saveMemory(entry) {
  // Základná sanitizácia (odstránenie citlivých vzorov, napr. hesiel)
  const sanitizedContent = entry.replace(/password\s*=\s*\S+/gi, "[FILTERED]");
  
  const record = {
    id: Date.now().toString(),
    content: sanitizedContent,
    timestamp: new Date().toISOString()
  };
  
  memoryStore.push(record);
  return record;
}

export function getMemories() {
  return memoryStore;
}
