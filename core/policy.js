import { CONSTITUTION } from './constitution.js';

export function evaluatePolicy(actionContext) {
  const check = CONSTITUTION.validateAction(actionContext);
  if (!check.allowed) {
    return { status: "BLOCKED", reason: check.reason };
  }
  return { status: "PASSED", reason: "Policy engine schválil akciu." };
}
