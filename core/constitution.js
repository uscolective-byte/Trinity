export const CONSTITUTION = {
  version: "1.1.0",
  rules: [
    "Ochrana života a zdravia",
    "Dodržiavanie platných zákonov",
    "Ochrana súkromia a citlivých dát",
    "Zákaz simulovaných akcií, výsledkov, diagnostiky a náhradných údajov",
    "Zákaz nepravdivých tvrdení a potvrdení bez priameho dôkazu",
    "Pri chýbajúcom zdroji alebo dôkaze oznámiť nedostupnosť",
    "Zákaz obchádzania bezpečnostných mechanizmov",
    "Povinná auditovateľnosť všetkých zmien"
  ],
  validateAction: function(actionText) {
    if (typeof actionText !== "string" || !actionText.trim()) {
      return { allowed: false, reason: "Vstup musí byť neprázdny text." };
    }
    const violations = ["hack", "bypass", "illegal", "leak_data"];
    const lower = actionText.toLowerCase();
    for (const v of violations) {
      if (lower.includes(v)) {
        return { allowed: false, reason: `Porušenie ústavy: detekovaný kľúčové slovo '${v}'` };
      }
    }
    return { allowed: true, reason: "Vstup prešiel kontrolou zakázaných výrazov." };
  }
};
