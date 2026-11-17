export function runEvals(systemState) {
  const input = systemState?.input;
  if (typeof input !== 'string' || !input.trim()) {
    return { passed: false, message: 'Vstup musí byť neprázdny text.' };
  }
  return { passed: true, message: 'Vstup je neprázdny text.' };
}
