export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const cleanName = name.replace(/\.(jpe?g|png|webp|svg)$/i, "").toLowerCase();

  const titleFormatted = cleanName
    .replace("-strip", "")
    .split("-")
    .map((w) => w.toUpperCase())
    .join(" ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 1800" width="768" height="1800">
  <defs>
    <linearGradient id="stripBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A0A0E" />
      <stop offset="25%" stop-color="#12101A" />
      <stop offset="50%" stop-color="#0B0E14" />
      <stop offset="75%" stop-color="#150F0D" />
      <stop offset="100%" stop-color="#08080A" />
    </linearGradient>

    <pattern id="screentone" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2" fill="#F5F1E8" opacity="0.12" />
    </pattern>

    <filter id="comicShadow">
      <feDropShadow dx="6" dy="6" stdDeviation="0" flood-color="#000000" />
    </filter>
  </defs>

  <!-- Full Canvas Background -->
  <rect width="768" height="1800" fill="url(#stripBg)" />

  <!-- ==================== PANEL 1: ESTABLISHING SHOT (Y: 40 - 360) ==================== -->
  <g transform="translate(40, 40)" filter="url(#comicShadow)">
    <rect width="688" height="320" fill="#0E121E" stroke="#F5F1E8" stroke-width="4" />
    <rect width="688" height="320" fill="url(#screentone)" />
    
    <!-- Cyber City Silhouette -->
    <path d="M 0 320 L 0 200 L 60 200 L 60 140 L 140 140 L 140 220 L 220 220 L 220 90 L 300 90 L 300 240 L 380 240 L 380 120 L 460 120 L 460 260 L 540 260 L 540 160 L 620 160 L 620 230 L 688 230 L 688 320 Z" 
          fill="#1C2333" />
    
    <!-- Neon Hologram Moon -->
    <circle cx="560" cy="100" r="45" fill="none" stroke="#C9F73A" stroke-width="4" opacity="0.8" />
    <circle cx="560" cy="100" r="15" fill="#C9F73A" opacity="0.5" />
    
    <!-- Narration Box -->
    <g transform="translate(30, 30)">
      <rect width="280" height="42" fill="#F5F1E8" stroke="#000" stroke-width="3" />
      <text x="140" y="26" fill="#0A0A0C" font-family="monospace" font-size="12" font-weight="900" letter-spacing="1" text-anchor="middle">
        SEKTOR 9 — JAKARTA 2099
      </text>
    </g>

    <!-- Japanese SFX -->
    <text x="640" y="290" fill="#35E0FF" font-family="sans-serif" font-size="44" font-weight="900" text-anchor="end" opacity="0.7">
      ゴゴゴ
    </text>
  </g>

  <!-- ==================== PANEL 2: ACTION CUT (Y: 390 - 740) ==================== -->
  <g transform="translate(40, 390)" filter="url(#comicShadow)">
    <rect width="688" height="350" fill="#140D15" stroke="#F5F1E8" stroke-width="4" />
    
    <!-- Speedlines -->
    <g stroke="#C9F73A" stroke-width="2" opacity="0.4">
      <line x1="0" y1="0" x2="688" y2="350" />
      <line x1="0" y1="70" x2="688" y2="280" />
      <line x1="0" y1="140" x2="688" y2="210" />
      <line x1="0" y1="210" x2="688" y2="140" />
      <line x1="0" y1="280" x2="688" y2="70" />
      <line x1="0" y1="350" x2="688" y2="0" />
    </g>

    <!-- Dramatic Katana Slash Light Beam -->
    <path d="M 60 300 Q 344 175 620 50" stroke="#FFF" stroke-width="12" fill="none" stroke-linecap="round" />
    <path d="M 60 300 Q 344 175 620 50" stroke="#C9F73A" stroke-width="24" fill="none" opacity="0.5" stroke-linecap="round" />

    <!-- Big Sound Effect Onomatopoeia -->
    <text x="344" y="210" fill="#FF3D81" font-family="sans-serif" font-size="76" font-weight="900" font-style="italic" letter-spacing="4" text-anchor="middle" stroke="#FFF" stroke-width="3">
      SLASH!
    </text>
  </g>

  <!-- ==================== PANEL 3: DIALOGUE (Y: 770 - 1130) ==================== -->
  <g transform="translate(40, 770)" filter="url(#comicShadow)">
    <rect width="688" height="360" fill="#0C1412" stroke="#F5F1E8" stroke-width="4" />
    <rect width="688" height="360" fill="url(#screentone)" />

    <!-- Left Character Silhouette (Back View) -->
    <circle cx="160" cy="220" r="50" fill="#182824" />
    <path d="M 90 360 Q 160 260 230 360 Z" fill="#182824" />

    <!-- Right Character Silhouette (Front View Eyes) -->
    <circle cx="530" cy="180" r="55" fill="#182824" />
    <path d="M 450 360 Q 530 230 610 360 Z" fill="#182824" />
    <!-- Glowing Eyes -->
    <circle cx="510" cy="175" r="4" fill="#C9F73A" />
    <circle cx="545" cy="175" r="4" fill="#C9F73A" />

    <!-- Comic Speech Bubble 1 -->
    <g transform="translate(50, 40)">
      <rect x="0" y="0" width="280" height="75" rx="16" fill="#F5F1E8" stroke="#000" stroke-width="3" />
      <polygon points="120,75 140,75 130,95" fill="#F5F1E8" stroke="#000" stroke-width="3" />
      <text x="140" y="32" fill="#0A0A0C" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">
        "Arsip sektor 9 tidak pernah hilang..."
      </text>
      <text x="140" y="54" fill="#0A0A0C" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">
        "Mereka sengaja menguncinya!"
      </text>
    </g>

    <!-- Comic Speech Bubble 2 -->
    <g transform="translate(360, 110)">
      <rect x="0" y="0" width="270" height="75" rx="16" fill="#F5F1E8" stroke="#000" stroke-width="3" />
      <polygon points="150,75 170,75 160,95" fill="#F5F1E8" stroke="#000" stroke-width="3" />
      <text x="135" y="32" fill="#0A0A0C" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">
        "Kalau begitu bersiaplah,"
      </text>
      <text x="135" y="54" fill="#FF4D00" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle">
        "KUNCI ITU ADA DI TANGAN KITA!"
      </text>
    </g>
  </g>

  <!-- ==================== PANEL 4: DRAMATIC IMPACT (Y: 1160 - 1520) ==================== -->
  <g transform="translate(40, 1160)" filter="url(#comicShadow)">
    <rect width="688" height="360" fill="#1C130D" stroke="#F5F1E8" stroke-width="4" />
    
    <!-- Central Burst Explosion / Sun Rays -->
    <g stroke="#FF8A00" stroke-width="3" opacity="0.6">
      <line x1="344" y1="180" x2="0" y2="0" />
      <line x1="344" y1="180" x2="344" y2="0" />
      <line x1="344" y1="180" x2="688" y2="0" />
      <line x1="344" y1="180" x2="688" y2="180" />
      <line x1="344" y1="180" x2="688" y2="360" />
      <line x1="344" y1="180" x2="344" y2="360" />
      <line x1="344" y1="180" x2="0" y2="360" />
      <line x1="344" y1="180" x2="0" y2="180" />
    </g>

    <circle cx="344" cy="180" r="70" fill="#FF8A00" opacity="0.3" />
    <circle cx="344" cy="180" r="35" fill="#FFF" />

    <!-- SFX Duar -->
    <text x="344" y="290" fill="#C9F73A" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle" stroke="#000" stroke-width="4">
      DUAAAR!
    </text>
  </g>

  <!-- ==================== PANEL 5: BERSAMBUNG / OUTRO (Y: 1550 - 1760) ==================== -->
  <g transform="translate(40, 1550)">
    <rect width="688" height="200" fill="#0A0A0C" stroke="#C9F73A" stroke-width="3" stroke-dasharray="10 5" />
    
    <text x="344" y="70" fill="#F5F1E8" font-family="sans-serif" font-size="28" font-weight="900" letter-spacing="3" text-anchor="middle">
      ${titleFormatted}
    </text>

    <text x="344" y="110" fill="#C9F73A" font-family="monospace" font-size="14" font-weight="bold" letter-spacing="4" text-anchor="middle">
      — BERSAMBUNG KE BAB BERIKUTNYA —
    </text>

    <text x="344" y="150" fill="#F5F1E8" opacity="0.4" font-family="monospace" font-size="11" letter-spacing="2" text-anchor="middle">
      KARYA ORISINAL RESMI DIBAWAKAN OLEH COMIC WEEK INDONESIA
    </text>
  </g>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
