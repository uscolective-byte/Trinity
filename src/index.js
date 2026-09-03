export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- 1. BACKEND API (Skrytý mozog a hustling operácie) ---
    if (url.pathname.startsWith("/api/status")) {
      return new Response(JSON.stringify({ 
        status: "ONLINE", 
        system: "TENEBRIS CORE", 
        frequency: "369",
        message: "Ulica nikdy nespí."
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    // --- 2. FRONTEND (Surový, drsný dizajn pre USC) ---
    const html = `
    <!DOCTYPE html>
    <html lang="sk">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TENEBRIS // USC</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background-color: #050505; color: #d4d4d4; font-family: monospace; }
            .neon-border { border: 1px solid #ccff00; box-shadow: 0 0 12px rgba(204, 255, 0, 0.15); }
            .neon-text { color: #ccff00; text-shadow: 0 0 8px rgba(204,255,0,0.4); }
            .hustle-bg { background-color: #0a0a0a; }
        </style>
    </head>
    <body class="p-4 md:p-8">
        <div class="max-w-5xl mx-auto mt-4">
            <!-- HLAVIČKA -->
            <div class="border-b border-gray-800 pb-4 mb-8">
                <h1 class="text-4xl md:text-5xl font-black neon-text uppercase tracking-tighter">Tenebris Core</h1>
                <p class="mt-2 text-gray-500 tracking-widest text-sm">UNDERGROUND STREET COLLECTIVE // ŽIADNE REČI. ČISTÝ HUSTLE.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <!-- PANEL: DIVÍZIE -->
                <div class="neon-border p-6 hustle-bg relative">
                    <div class="absolute top-0 right-0 bg-[#ccff00] text-black text-xs font-bold px-2 py-1">LIVE</div>
                    <h2 class="text-xl font-bold neon-text mb-6 uppercase border-b border-gray-800 pb-2">⚙️ Aktívne Divízie</h2>
                    <ul class="space-y-4 text-sm font-bold tracking-wide text-gray-300">
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> AURA TRINITY [AI DISPEČING]</span> <span class="text-[#ccff00] text-xs">OFFLINE</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> USW STREETWEAR [MERCH]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> RENT A WHEEL [LOGISTIKA]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                        <li class="flex justify-between items-center hover:text-white cursor-pointer transition-colors">
                            <span>> USC WORK [MONTÁŽE DE]</span> <span class="text-[#ccff00] text-xs">STANDBY</span>
                        </li>
                    </ul>
                </div>
                
                <!-- PANEL: TERMINÁL -->
                <div class="neon-border p-6 hustle-bg flex flex-col">
                    <h2 class="text-xl font-bold neon-text mb-4 uppercase">📟 Matrix Terminál</h2>
                    <div id="log" class="flex-1 bg-black border border-gray-800 p-3 text-xs text-gray-400 overflow-y-auto h-48 mb-4 font-mono">
                        <span class="text-gray-600">--------------------------------</span><br>
                        > Inicializácia systému Tenebris...<br>
                        > Prepájam s auru.space...<br>
                        > Čakám na príkazy od admina Sabo Ivan...<br>
                        <span class="text-gray-600">--------------------------------</span>
                    </div>
                    <button onclick="pingApi()" class="w-full bg-[#ccff00] text-black font-black py-3 uppercase hover:bg-white transition-colors duration-300">
                        Ping Tenebris API [Skúška]
                    </button>
                </div>
            </div>
        </div>

        <script>
            async function pingApi() {
                const log = document.getElementById('log');
                const time = new Date().toLocaleTimeString();
                log.innerHTML += '<br><span class="text-gray-500">['+time+']</span> > Volám /api/status...';
                log.scrollTop = log.scrollHeight;
                
                try {
                    const res = await fetch('/api/status');
                    const data = await res.json();
                    log.innerHTML += '<br><span class="text-[#ccff00]">> ODOZVA: ' + JSON.stringify(data) + '</span>';
                } catch(e) {
                    log.innerHTML += '<br><span class="text-red-500">> CHYBA: Systém neodpovedá.</span>';
                }
                log.scrollTop = log.scrollHeight;
            }
        </script>
    </body>
    </html>
    `;

    return new Response(html, {
      headers: { "content-type": "text/html;charset=UTF-8" }
    });
  }
};
