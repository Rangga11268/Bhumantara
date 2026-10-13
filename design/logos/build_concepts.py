import math

# -------------------------------------------------------------
# Concept A: WANAREKSA - Kawung Sentinel Aperture
# -------------------------------------------------------------
# Pure single-color SVG using fill-rule="evenodd" with true holes.
# Outer ring (R=114, r=102), four Kawung petals, 4 cardinal dots,
# center ring (R=24, r=12).
# -------------------------------------------------------------

svg_a = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>WANAREKSA — Kawung Sentinel Aperture</title>
  <g fill="#080E1A" fill-rule="evenodd">
    <!-- Outer Aerospace Ring (Donut) -->
    <path d="M 128,14 A 114,114 0 1 0 128,242 A 114,114 0 1 0 128,14 Z M 128,26 A 102,102 0 1 1 128,230 A 102,102 0 1 1 128,26 Z"/>
    
    <!-- North Petal (Orbital Zenith) -->
    <path d="M 128,36 C 148,64 164,88 152,112 C 144,124 136,128 128,128 C 120,128 112,124 104,112 C 92,88 108,64 128,36 Z"/>
    
    <!-- South Petal (Peatland Nadir) -->
    <path d="M 128,220 C 108,192 92,168 104,144 C 112,132 120,128 128,128 C 136,128 144,132 152,144 C 164,168 148,192 128,220 Z"/>
    
    <!-- West Petal (Swath West) -->
    <path d="M 36,128 C 64,108 88,92 112,104 C 124,112 128,120 128,128 C 128,136 124,144 112,152 C 88,164 64,148 36,128 Z"/>
    
    <!-- East Petal (Swath East) -->
    <path d="M 220,128 C 192,148 168,164 144,152 C 132,144 128,136 128,128 C 128,120 132,112 144,104 C 168,92 192,108 220,128 Z"/>
    
    <!-- Four Cardinal Telemetry Sensors -->
    <path d="M 80,70 A 10,10 0 1 0 80,90 A 10,10 0 1 0 80,70 Z"/>
    <path d="M 176,70 A 10,10 0 1 0 176,90 A 10,10 0 1 0 176,70 Z"/>
    <path d="M 80,166 A 10,10 0 1 0 80,186 A 10,10 0 1 0 80,166 Z"/>
    <path d="M 176,166 A 10,10 0 1 0 176,186 A 10,10 0 1 0 176,166 Z"/>
    
    <!-- Central Aperture Focal Lens with true negative space -->
    <path d="M 128,104 A 24,24 0 1 0 128,152 A 24,24 0 1 0 128,104 Z M 128,116 A 12,12 0 1 1 128,140 A 12,12 0 1 1 128,116 Z"/>
  </g>
</svg>
'''

with open(r"d:\laragon\www\NasaHackathon\design\logos\concept-a.svg", "w", encoding="utf-8") as f:
    f.write(svg_a)

# -------------------------------------------------------------
# Concept B: NETRABUANA - The Orbital Eye & Archipelagic Horizon
# -------------------------------------------------------------
# Pure single-color SVG using fill-rule="evenodd" for true negative space holes.
# -------------------------------------------------------------

svg_b = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>NETRABUANA — Planetary Orbital Eye</title>
  <g fill="#080E1A" fill-rule="evenodd">
    <!-- Upper Orbital Eyelid Arc -->
    <path d="M 28,128 C 64,56 192,56 228,128 C 188,84 68,84 28,128 Z"/>
    
    <!-- Lower Orbital Eyelid Arc -->
    <path d="M 28,128 C 64,200 192,200 228,128 C 188,172 68,172 28,128 Z"/>
    
    <!-- Central Planetary Sphere with Equatorial Horizon Slot cut through -->
    <path d="M 128,80 A 48,48 0 1 0 128,176 A 48,48 0 1 0 128,80 Z
             M 82,124 L 174,124 A 4,4 0 0 1 174,132 L 82,132 A 4,4 0 0 1 82,124 Z
             M 128,112 A 16,16 0 1 1 128,144 A 16,16 0 1 1 128,112 Z"/>
    
    <!-- Sensor Core -->
    <circle cx="128" cy="128" r="8"/>
    
    <!-- Polar Zenith & Nadir Telemetry Beacons -->
    <circle cx="128" cy="44" r="8"/>
    <circle cx="128" cy="212" r="8"/>
  </g>
</svg>
'''

with open(r"d:\laragon\www\NasaHackathon\design\logos\concept-b.svg", "w", encoding="utf-8") as f:
    f.write(svg_b)

# -------------------------------------------------------------
# Concept C: WASKITHA - Aerospace 'W' Chevron & Nadir Sensor
# -------------------------------------------------------------
# Clean 30/60/75 degree snapped geometry. Outer hexagonal shield ring.
# -------------------------------------------------------------

svg_c = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>WASKITHA — Aerospace W Sentinel</title>
  <g fill="#080E1A" fill-rule="evenodd">
    <!-- Outer Hexagonal Frame Ring (True hollow polygon) -->
    <path d="M 128,18 L 224,73 L 224,183 L 128,238 L 32,183 L 32,73 Z
             M 128,32 L 44,80 L 44,176 L 128,224 L 212,176 L 212,80 Z"/>
    
    <!-- Left Wing of 'W' (Snapped to 75 deg) -->
    <polygon points="56,86 86,86 110,176 80,176"/>
    
    <!-- Right Wing of 'W' (Snapped to 105 deg / mirror 75) -->
    <polygon points="200,86 170,86 146,176 176,176"/>
    
    <!-- Central Chevron / Tumpal Spearhead -->
    <polygon points="128,74 152,154 128,140 104,154"/>
    
    <!-- Nadir Telemetry Core -->
    <circle cx="128" cy="192" r="12"/>
  </g>
</svg>
'''

with open(r"d:\laragon\www\NasaHackathon\design\logos\concept-c.svg", "w", encoding="utf-8") as f:
    f.write(svg_c)

print("Refined all 3 concepts with pure paths and 0 white knockouts.")
