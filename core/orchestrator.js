import { evaluatePolicy } from './policy.js';
import { saveMemory } from '../memory/store.js';
import { runEvals } from '../evals/validator.js';

export function processTrinityStep(userInput) {
  // 1. Kontrola cez Policy Engine
  const policyCheck = evaluatePolicy(userInput);
  if (policyCheck.status === "BLOCKED") {
    return { success: false, error: policyCheck.reason };
  }

  // 2. Spustenie Evalov
  const evalResult = runEvals({ input: userInput });
  if (!evalResult.passed) {
    return { success: false, error: evalResult.message };
  }

  // 3. Uloženie do pamäte
  const memoryRecord = saveMemory(userInput);

  return {
    success: true,
    message: "Butcher Trinity úspešne spracoval požiadavku.",
    memory: memoryRecord
  };
}
