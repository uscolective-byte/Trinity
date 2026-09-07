export const CONSTITUTION = {
  version: "1.0.0",
  rules: [
    "Ochrana života a zdravia",
    "Dodržiavanie platných zákonov",
    "Ochrana súkromia a citlivých dát",
    "Prísne rozlíšenie simulácie od reality",
    "Zákaz obchádzania bezpečnostných mechanizmov",
    "Povinná auditovateľnosť všetkých zmien"
  ],
  validateAction: function(actionText) {
    // Základná bezpečnostná kontrola proti porušeniu ústavy
    const violations = ["hack", "bypass", "illegal", "leak_data"];
    const lower = actionText.toLowerCase();
    for (const v of violations) {
      if (lower.includes(v)) {
        return { allowed: false, reason: `Porušenie ústavy: detekovaný kľúčové slovo '${v}'` };
      }
    }
    return { allowed: true, reason: "Akcia je v súlade s ústavou." };
  }
};
