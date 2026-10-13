# 🧭 WANAREKSA: User Journey & UI/UX Audit for NASA Judges

**Project:** WANAREKSA (`D:\laragon\www\NasaHackathon`)  
**Audience:** NASA Space Apps Challenge Evaluation Panel (Judges with only 3–5 minutes per project)

---

## 🎯 The "3-Minute Judge Experience" (Ideal Flow)

Judges evaluate dozens of submissions back-to-back. If they land on a dense, confusing wall of controls, they move on. **Wanareksa must guide them through an effortless, progressive reveal of value:**

```
[00:00 - 00:30] ──▶ STEP 1: THE STORY (LandingStory / Problem Context)
[00:30 - 01:30] ──▶ STEP 2: THE EVIDENCE (Interactive Overview & Dual-Map)
[01:30 - 02:30] ──▶ STEP 3: THE SCIENCE (HarmonizationLab & Math Proof)
[02:30 - 03:00] ──▶ STEP 4: THE ACTION (MitigationHub & WhatsApp SitRep)
```

---

## 1. Component Sequence & Recommended Navigation Flow

### Step 1: First Impression — `LandingStory` (The Hook)
* **What Judge Sees First:**
  * Clean, cinematic narrative explaining the 2012 satellite resolution rupture.
  * Side-by-side interactive visual: 1 MODIS pixel vs 7 VIIRS points over the same peat dome.
  * Direct Call-to-Action button: *"Explore the Harmonized Platform →"*.
* **Goal:** In 30 seconds, the judge completely understands **WHY** this project exists and respects the problem.

### Step 2: The Core Workspace — `Overview` (Interactive Map & Dual-Map Comparator)
* **What Judge Explores:**
  * Sovereign boundary-locked Leaflet map over Indonesia.
  * 26-year scrubber slider (2000–2026): Judge clicks *"2015 Super El Niño"* benchmark $\rightarrow$ sees how raw VIIRS data artificially distorts baselines vs calibrated clusters.
  * Toggle **Dual-Map Comparison**: Left map displays raw satellite noise, right map displays clean harmonized clusters.
* **Goal:** Demonstrates technical feasibility, real-time interactivity, and fluid UI performance.

### Step 3: Scientific Validation — `HarmonizationLab`
* **What Judge Evaluates:**
  * 5.5 km equal-area spatial binning breakdown.
  * Stefan-Boltzmann Fire Radiative Power (FRP) cross-calibration formula.
  * 500-run Monte Carlo stability simulation ($\text{variance} < 2.4\%$).
* **Goal:** Satisfies the **Validity (20%)** and **Relevance (20%)** criteria of NASA's judging rubric.

### Step 4: The Impact Delivery — `MitigationHub` (The Punchline)
* **What Judge Finishes With:**
  * In-situ Peat Hydrology coupling (Groundwater Table $TMAG < -40\text{ cm}$).
  * **1-Click WhatsApp SitRep Dispatch Generator** for frontline Manggala Agni rangers.
  * **1-Click Executive PDF SitRep** download via client-side `jsPDF`.
* **Goal:** Guarantees maximum score on **Impact (20%)** by proving this is not just an academic exercise, but a life-saving tool.

---

## 2. Key Polish Checklist Before Final Submission

1. **Judges Evaluation Guide Pill:**
   * Keep the `JudgesEvaluationGuide` button prominent in the Navbar or Floating Bar (e.g., `⭐ Judges Guide`).
   * When clicked, it opens a modal detailing exact answers mapped to the 5 official NASA rubrics (*Impact, Creativity, Validity, Relevance, Presentation*).

2. **Language Default:**
   * Ensure English is the default language (`en`) when judges open the link, with the bilingual toggle (`[EN | ID]`) clearly visible in the Navbar.

3. **Performance & Offline Fallbacks:**
   * Verify that if a live NASA FIRMS API key is absent, the application gracefully defaults to cached historical benchmark data without throwing console errors.
