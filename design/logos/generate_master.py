svg_master = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <title>WANAREKSA — Earth Observation Sentinel</title>
  
  <!-- Outer Aerospace Sentinel Ring (NASA Deep Blue, true path donut) -->
  <path d="M 128,14 A 114,114 0 1 0 128,242 A 114,114 0 1 0 128,14 Z M 128,24 A 104,104 0 1 1 128,232 A 104,104 0 1 1 128,24 Z" fill="#0B3D91"/>

  <!-- Four Kawung Sentinel Petals: 
       Vertical (North/South) = Peatland Emerald (#059669),
       Horizontal (East/West) = NASA Deep Blue (#0B3D91) -->
  <g fill-rule="evenodd">
    <!-- North Petal: Zenith Telemetry (Peatland Emerald) -->
    <path d="M 128,34 C 150,62 166,88 154,112 C 146,124 137,128 128,128 C 119,128 110,124 102,112 C 90,88 106,62 128,34 Z" fill="#059669"/>
    
    <!-- South Petal: Nadir Biosphere (Peatland Emerald) -->
    <path d="M 128,222 C 106,194 90,168 102,144 C 110,132 119,128 128,128 C 137,128 146,132 154,144 C 166,168 150,194 128,222 Z" fill="#059669"/>
    
    <!-- West Petal: Western Orbital Swath (NASA Deep Blue) -->
    <path d="M 34,128 C 62,106 88,90 112,102 C 124,110 128,119 128,128 C 128,137 124,146 112,154 C 88,166 62,150 34,128 Z" fill="#0B3D91"/>
    
    <!-- East Petal: Eastern Orbital Swath (NASA Deep Blue) -->
    <path d="M 222,128 C 194,150 168,166 144,154 C 132,146 128,137 128,128 C 128,119 132,110 144,102 C 168,90 194,106 222,128 Z" fill="#0B3D91"/>

    <!-- Four Cardinal Telemetry Crosshair Nodes -->
    <circle cx="80" cy="80" r="10" fill="#0B3D91"/>
    <circle cx="176" cy="80" r="10" fill="#0B3D91"/>
    <circle cx="80" cy="176" r="10" fill="#059669"/>
    <circle cx="176" cy="176" r="10" fill="#059669"/>

    <!-- Central Aperture Lens Collar (NASA Deep Blue) -->
    <path d="M 128,102 A 26,26 0 1 0 128,154 A 26,26 0 1 0 128,102 Z M 128,114 A 14,14 0 1 1 128,142 A 14,14 0 1 1 128,114 Z" fill="#0B3D91"/>

    <!-- Central Fire Radiative Power (FRP) Thermal Core (Amber Flare #D97706) -->
    <circle cx="128" cy="128" r="9" fill="#D97706"/>
  </g>
</svg>
'''

with open(r"d:\laragon\www\NasaHackathon\public\wanareksa_logo.svg", "w", encoding="utf-8") as f:
    f.write(svg_master)

with open(r"d:\laragon\www\NasaHackathon\design\logos\wanareksa_master.svg", "w", encoding="utf-8") as f:
    f.write(svg_master)

print("Master Wanareksa 3-color SVG generated.")
