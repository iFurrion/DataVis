/**
 * Clean + standardize datasets for D3.js
 *
 * Place this file in the same folder as:
 *   - Sleep_health_and_lifestyle_dataset_adjusted_to_join.csv
 *   - Extended_Employee_Performance_and_Productivity_Data_for_joining_datasets.csv
 *
 * Run: node standardize_for_d3.js
 * Output: ./out/joined_for_d3.csv and ./out/transform_log.json
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { csvParse, csvFormat } from "d3-dsv";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Input files (must be in same folder)
const sleepFile = join(__dirname, "Sleep_health_and_lifestyle_dataset_adjusted_to_join.csv");
const perfFile  = join(__dirname, "Extended_Employee_Performance_and_Productivity_Data_for_joining_datasets.csv");

// Output folder
const outDir = join(__dirname, "out");

// -------- Helpers --------
function toNull(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s || ["na","n/a","null","none","nan","undefined"].includes(s.toLowerCase())) return null;
  return s;
}
function toNumber(v) {
  if (v == null) return null;
  const n = Number(String(v).replace(/,/g,""));
  return Number.isFinite(n) ? n : null;
}
function standardizeGender(v) {
  const s = (v||"").toLowerCase();
  if (["m","male"].includes(s)) return "Male";
  if (["f","female","fem"].includes(s)) return "Female";
  return "Other";
}
function dropUnnamed(rows) {
  if (!rows.length) return rows;
  const keep = Object.keys(rows[0]).filter(c => !/^unnamed/i.test(c));
  return rows.map(r => Object.fromEntries(keep.map(c => [c,r[c]])));
}
function minmax(values) {
  const nums = values.filter(v => typeof v === "number");
  if (!nums.length) return {min:null,max:null,scale:()=>null};
  const min = Math.min(...nums), max = Math.max(...nums);
  return {min,max,scale:x => (x==null||max===min)?null:(x-min)/(max-min)};
}

// -------- Main --------
async function main() {
  if (!existsSync(outDir)) await mkdir(outDir,{recursive:true});

  // Load CSVs
  const sleepRows = dropUnnamed(csvParse(await readFile(sleepFile,"utf8"))
    .map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k.trim(),toNull(v)]))));
  const perfRows  = dropUnnamed(csvParse(await readFile(perfFile,"utf8"))
    .map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k.trim(),toNull(v)]))));

  // Standardize + coerce
  const sRows = sleepRows.map(r=>({
    ...r,
    person_id: toNumber(r["Person ID"]),
    Gender: standardizeGender(r["Gender"]),
    Age: toNumber(r["Age"]),
    "Sleep Duration": toNumber(r["Sleep Duration"]),
    "Quality of Sleep": toNumber(r["Quality of Sleep"]),
    "Stress Level": toNumber(r["Stress Level"])
  }));
  const pRows = perfRows.map(r=>({
    ...r,
    person_id: toNumber(r["Employee_ID"]),
    Gender: standardizeGender(r["Gender"]),
    Age: toNumber(r["Age"]),
    Performance_Score: toNumber(r["Performance_Score"])
  }));

  // Join on person_id
  const perfById = new Map(pRows.map(r=>[r.person_id,r]));
  const joined = sRows.filter(r=>r.person_id && perfById.has(r.person_id))
    .map(r=>({
      ...r,
      ...Object.fromEntries(
        Object.entries(perfById.get(r.person_id))
          .filter(([k])=>!["Gender","Age"].includes(k))
      )
    }));

  // Normalize numeric cols
  const numCols=["Sleep Duration","Quality of Sleep","Stress Level","Performance_Score","Age"];
  const ranges = Object.fromEntries(numCols.map(c=>{
    const vals=joined.map(r=>toNumber(r[c])).filter(v=>v!=null);
    return [c,minmax(vals)];
  }));
  const normalized=joined.map(r=>{
    const o={...r};
    for (const c of numCols) o[c+"_norm"]=ranges[c].scale(toNumber(r[c]));
    return o;
  });

  // Save outputs
  await writeFile(join(outDir,"joined_for_d3.csv"),csvFormat(normalized),"utf8");
  await writeFile(join(outDir,"transform_log.json"),
    JSON.stringify({
      steps:["dropUnnamed","standardize","join","normalize"],
      ranges:Object.fromEntries(numCols.map(c=>[c,{min:ranges[c].min,max:ranges[c].max}]))
    },null,2),"utf8");

  console.log("✓ wrote",join(outDir,"joined_for_d3.csv"));
  console.log("✓ wrote",join(outDir,"transform_log.json"));
}

main();
