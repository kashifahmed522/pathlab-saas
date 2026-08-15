// Standard pathology test catalog - the common set of tests offered by
// most diagnostic labs (Dr Lal PathLabs / MedPlus style). Prices are
// indicative (INR) - every lab can edit/override them after loading.
// tat_hours = typical turnaround time in hours.

const STANDARD_TESTS = [
  // ---------------- HEMATOLOGY ----------------
  { code: 'CBC', name: 'Complete Blood Count (CBC)', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 350, unit: '', reference_range: 'See individual parameters', tat_hours: 6 },
  { code: 'HB', name: 'Hemoglobin (Hb)', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 100, unit: 'g/dL', reference_range: '13-17 (M), 12-15 (F)', tat_hours: 4 },
  { code: 'TLC', name: 'Total Leucocyte Count (TLC)', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 100, unit: 'cells/cumm', reference_range: '4000-11000', tat_hours: 4 },
  { code: 'DLC', name: 'Differential Leucocyte Count (DLC)', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 100, unit: '%', reference_range: 'See individual parameters', tat_hours: 4 },
  { code: 'PLT', name: 'Platelet Count', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 150, unit: 'lakhs/cumm', reference_range: '1.5-4.5', tat_hours: 4 },
  { code: 'ESR', name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 100, unit: 'mm/hr', reference_range: '0-20', tat_hours: 4 },
  { code: 'PS', name: 'Peripheral Smear Examination', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 200, unit: '', reference_range: 'Normal morphology', tat_hours: 8 },
  { code: 'RETIC', name: 'Reticulocyte Count', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 200, unit: '%', reference_range: '0.5-1.5', tat_hours: 8 },
  { code: 'PT-INR', name: 'Prothrombin Time / INR', category: 'Hematology', sample_type: 'Blood (Citrate)', price: 350, unit: 'sec / ratio', reference_range: '11-13.5 sec, INR 0.8-1.2', tat_hours: 6 },
  { code: 'APTT', name: 'Activated Partial Thromboplastin Time (APTT)', category: 'Hematology', sample_type: 'Blood (Citrate)', price: 350, unit: 'sec', reference_range: '25-35', tat_hours: 6 },
  { code: 'BT-CT', name: 'Bleeding Time / Clotting Time', category: 'Hematology', sample_type: 'Blood', price: 150, unit: 'min', reference_range: 'BT 2-7, CT 4-9', tat_hours: 4 },
  { code: 'DDIMER', name: 'D-Dimer', category: 'Hematology', sample_type: 'Blood (Citrate)', price: 1200, unit: 'ng/mL', reference_range: '< 500', tat_hours: 12 },
  { code: 'BLOODGRP', name: 'Blood Group & Rh Typing', category: 'Hematology', sample_type: 'Blood (EDTA)', price: 150, unit: '', reference_range: 'A/B/AB/O, Rh +/-', tat_hours: 2 },

  // ---------------- BIOCHEMISTRY - GLUCOSE ----------------
  { code: 'FBS', name: 'Fasting Blood Sugar (FBS)', category: 'Biochemistry - Glucose', sample_type: 'Blood (Fluoride)', price: 100, unit: 'mg/dL', reference_range: '70-100', tat_hours: 4 },
  { code: 'PPBS', name: 'Post Prandial Blood Sugar (PPBS)', category: 'Biochemistry - Glucose', sample_type: 'Blood (Fluoride)', price: 100, unit: 'mg/dL', reference_range: '< 140', tat_hours: 4 },
  { code: 'RBS', name: 'Random Blood Sugar (RBS)', category: 'Biochemistry - Glucose', sample_type: 'Blood (Fluoride)', price: 100, unit: 'mg/dL', reference_range: '< 200', tat_hours: 2 },
  { code: 'HBA1C', name: 'Glycated Hemoglobin (HbA1c)', category: 'Biochemistry - Glucose', sample_type: 'Blood (EDTA)', price: 500, unit: '%', reference_range: '< 5.7', tat_hours: 12 },
  { code: 'INSULIN', name: 'Insulin (Fasting)', category: 'Biochemistry - Glucose', sample_type: 'Serum', price: 700, unit: 'uIU/mL', reference_range: '2.6-24.9', tat_hours: 24 },

  // ---------------- KIDNEY FUNCTION ----------------
  { code: 'KFT', name: 'Kidney Function Test (KFT) Panel', category: 'Kidney Function', sample_type: 'Serum', price: 600, unit: '', reference_range: 'See individual parameters', tat_hours: 12 },
  { code: 'UREA', name: 'Blood Urea', category: 'Kidney Function', sample_type: 'Serum', price: 120, unit: 'mg/dL', reference_range: '15-40', tat_hours: 6 },
  { code: 'CREAT', name: 'Serum Creatinine', category: 'Kidney Function', sample_type: 'Serum', price: 120, unit: 'mg/dL', reference_range: '0.6-1.3', tat_hours: 6 },
  { code: 'URICACID', name: 'Uric Acid', category: 'Kidney Function', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '3.5-7.2', tat_hours: 6 },
  { code: 'MICROALB', name: 'Microalbumin (Urine)', category: 'Kidney Function', sample_type: 'Urine', price: 500, unit: 'mg/L', reference_range: '< 30', tat_hours: 12 },
  { code: 'UPCR', name: 'Urine Protein Creatinine Ratio', category: 'Kidney Function', sample_type: 'Urine', price: 500, unit: 'mg/g', reference_range: '< 150', tat_hours: 12 },

  // ---------------- LIVER FUNCTION ----------------
  { code: 'LFT', name: 'Liver Function Test (LFT) Panel', category: 'Liver Function', sample_type: 'Serum', price: 600, unit: '', reference_range: 'See individual parameters', tat_hours: 12 },
  { code: 'BILI-T', name: 'Bilirubin Total', category: 'Liver Function', sample_type: 'Serum', price: 100, unit: 'mg/dL', reference_range: '0.3-1.2', tat_hours: 6 },
  { code: 'BILI-D', name: 'Bilirubin Direct', category: 'Liver Function', sample_type: 'Serum', price: 100, unit: 'mg/dL', reference_range: '0.0-0.3', tat_hours: 6 },
  { code: 'SGOT', name: 'SGOT / AST', category: 'Liver Function', sample_type: 'Serum', price: 150, unit: 'U/L', reference_range: '5-40', tat_hours: 6 },
  { code: 'SGPT', name: 'SGPT / ALT', category: 'Liver Function', sample_type: 'Serum', price: 150, unit: 'U/L', reference_range: '5-40', tat_hours: 6 },
  { code: 'ALP', name: 'Alkaline Phosphatase (ALP)', category: 'Liver Function', sample_type: 'Serum', price: 150, unit: 'U/L', reference_range: '40-125', tat_hours: 6 },
  { code: 'GGT', name: 'Gamma GT (GGT)', category: 'Liver Function', sample_type: 'Serum', price: 200, unit: 'U/L', reference_range: '8-61', tat_hours: 6 },
  { code: 'TP-ALB', name: 'Total Protein & Albumin', category: 'Liver Function', sample_type: 'Serum', price: 200, unit: 'g/dL', reference_range: 'TP 6.4-8.3, Alb 3.5-5.0', tat_hours: 6 },

  // ---------------- LIPID PROFILE ----------------
  { code: 'LIPID', name: 'Lipid Profile Panel', category: 'Lipid Profile', sample_type: 'Serum', price: 600, unit: '', reference_range: 'See individual parameters', tat_hours: 12 },
  { code: 'CHOL-T', name: 'Total Cholesterol', category: 'Lipid Profile', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '< 200', tat_hours: 6 },
  { code: 'TRIG', name: 'Triglycerides', category: 'Lipid Profile', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '< 150', tat_hours: 6 },
  { code: 'HDL', name: 'HDL Cholesterol', category: 'Lipid Profile', sample_type: 'Serum', price: 200, unit: 'mg/dL', reference_range: '> 40', tat_hours: 6 },
  { code: 'LDL', name: 'LDL Cholesterol', category: 'Lipid Profile', sample_type: 'Serum', price: 200, unit: 'mg/dL', reference_range: '< 100', tat_hours: 6 },
  { code: 'VLDL', name: 'VLDL Cholesterol', category: 'Lipid Profile', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '5-40', tat_hours: 6 },

  // ---------------- ELECTROLYTES & MINERALS ----------------
  { code: 'ELECT', name: 'Electrolytes Panel (Na/K/Cl)', category: 'Electrolytes', sample_type: 'Serum', price: 350, unit: 'mmol/L', reference_range: 'Na 135-145, K 3.5-5.1, Cl 98-107', tat_hours: 6 },
  { code: 'CALCIUM', name: 'Serum Calcium', category: 'Electrolytes', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '8.6-10.3', tat_hours: 6 },
  { code: 'PHOS', name: 'Serum Phosphorus', category: 'Electrolytes', sample_type: 'Serum', price: 150, unit: 'mg/dL', reference_range: '2.5-4.5', tat_hours: 6 },
  { code: 'MAG', name: 'Serum Magnesium', category: 'Electrolytes', sample_type: 'Serum', price: 200, unit: 'mg/dL', reference_range: '1.7-2.2', tat_hours: 6 },
  { code: 'IRON', name: 'Serum Iron', category: 'Electrolytes', sample_type: 'Serum', price: 250, unit: 'ug/dL', reference_range: '60-170', tat_hours: 12 },
  { code: 'TIBC', name: 'Total Iron Binding Capacity (TIBC)', category: 'Electrolytes', sample_type: 'Serum', price: 300, unit: 'ug/dL', reference_range: '240-450', tat_hours: 12 },
  { code: 'FERRITIN', name: 'Ferritin', category: 'Electrolytes', sample_type: 'Serum', price: 600, unit: 'ng/mL', reference_range: '20-250', tat_hours: 24 },

  // ---------------- CARDIAC MARKERS ----------------
  { code: 'TROP-I', name: 'Troponin I', category: 'Cardiac Markers', sample_type: 'Serum', price: 900, unit: 'ng/mL', reference_range: '< 0.04', tat_hours: 4 },
  { code: 'CKMB', name: 'CPK-MB', category: 'Cardiac Markers', sample_type: 'Serum', price: 500, unit: 'U/L', reference_range: '< 25', tat_hours: 6 },
  { code: 'CPK', name: 'Creatine Phosphokinase (CPK Total)', category: 'Cardiac Markers', sample_type: 'Serum', price: 350, unit: 'U/L', reference_range: '30-200', tat_hours: 6 },
  { code: 'NTPROBNP', name: 'NT-proBNP', category: 'Cardiac Markers', sample_type: 'Serum', price: 2200, unit: 'pg/mL', reference_range: '< 125', tat_hours: 24 },
  { code: 'LDH', name: 'Lactate Dehydrogenase (LDH)', category: 'Cardiac Markers', sample_type: 'Serum', price: 300, unit: 'U/L', reference_range: '140-280', tat_hours: 6 },

  // ---------------- THYROID / ENDOCRINE ----------------
  { code: 'TSH', name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', sample_type: 'Serum', price: 350, unit: 'uIU/mL', reference_range: '0.4-4.0', tat_hours: 24 },
  { code: 'T3', name: 'Total T3', category: 'Endocrinology', sample_type: 'Serum', price: 250, unit: 'ng/dL', reference_range: '80-200', tat_hours: 24 },
  { code: 'T4', name: 'Total T4', category: 'Endocrinology', sample_type: 'Serum', price: 250, unit: 'ug/dL', reference_range: '5.1-14.1', tat_hours: 24 },
  { code: 'FT3', name: 'Free T3', category: 'Endocrinology', sample_type: 'Serum', price: 350, unit: 'pg/mL', reference_range: '2.3-4.2', tat_hours: 24 },
  { code: 'FT4', name: 'Free T4', category: 'Endocrinology', sample_type: 'Serum', price: 350, unit: 'ng/dL', reference_range: '0.8-1.8', tat_hours: 24 },
  { code: 'ANTITPO', name: 'Anti-TPO Antibody', category: 'Endocrinology', sample_type: 'Serum', price: 900, unit: 'IU/mL', reference_range: '< 34', tat_hours: 24 },
  { code: 'FSH', name: 'FSH (Follicle Stimulating Hormone)', category: 'Endocrinology', sample_type: 'Serum', price: 500, unit: 'mIU/mL', reference_range: 'Varies by cycle phase', tat_hours: 24 },
  { code: 'LH', name: 'LH (Luteinizing Hormone)', category: 'Endocrinology', sample_type: 'Serum', price: 500, unit: 'mIU/mL', reference_range: 'Varies by cycle phase', tat_hours: 24 },
  { code: 'PROLACTIN', name: 'Prolactin', category: 'Endocrinology', sample_type: 'Serum', price: 500, unit: 'ng/mL', reference_range: '4.8-23.3', tat_hours: 24 },
  { code: 'TESTO', name: 'Testosterone Total', category: 'Endocrinology', sample_type: 'Serum', price: 600, unit: 'ng/dL', reference_range: '280-1100 (M)', tat_hours: 24 },
  { code: 'ESTRADIOL', name: 'Estradiol (E2)', category: 'Endocrinology', sample_type: 'Serum', price: 600, unit: 'pg/mL', reference_range: 'Varies by cycle phase', tat_hours: 24 },
  { code: 'PROGEST', name: 'Progesterone', category: 'Endocrinology', sample_type: 'Serum', price: 600, unit: 'ng/mL', reference_range: 'Varies by cycle phase', tat_hours: 24 },
  { code: 'CORTISOL', name: 'Cortisol (Morning)', category: 'Endocrinology', sample_type: 'Serum', price: 600, unit: 'ug/dL', reference_range: '6.2-19.4', tat_hours: 24 },
  { code: 'PTH', name: 'Parathyroid Hormone (PTH)', category: 'Endocrinology', sample_type: 'Serum', price: 1200, unit: 'pg/mL', reference_range: '15-65', tat_hours: 24 },
  { code: 'BHCG', name: 'Beta hCG (Pregnancy)', category: 'Endocrinology', sample_type: 'Serum', price: 500, unit: 'mIU/mL', reference_range: '< 5 (non-pregnant)', tat_hours: 12 },

  // ---------------- VITAMINS ----------------
  { code: 'VITD', name: 'Vitamin D (25-OH)', category: 'Vitamins', sample_type: 'Serum', price: 1500, unit: 'ng/mL', reference_range: '30-100', tat_hours: 24 },
  { code: 'VITB12', name: 'Vitamin B12', category: 'Vitamins', sample_type: 'Serum', price: 800, unit: 'pg/mL', reference_range: '190-950', tat_hours: 24 },
  { code: 'FOLATE', name: 'Folate (Folic Acid)', category: 'Vitamins', sample_type: 'Serum', price: 900, unit: 'ng/mL', reference_range: '3.1-19.9', tat_hours: 24 },

  // ---------------- SEROLOGY / INFECTIOUS DISEASE ----------------
  { code: 'HIV', name: 'HIV I & II Antibody', category: 'Serology', sample_type: 'Serum', price: 400, unit: '', reference_range: 'Non-reactive', tat_hours: 12 },
  { code: 'HBSAG', name: 'HBsAg (Hepatitis B)', category: 'Serology', sample_type: 'Serum', price: 350, unit: '', reference_range: 'Non-reactive', tat_hours: 12 },
  { code: 'HCV', name: 'HCV Antibody (Hepatitis C)', category: 'Serology', sample_type: 'Serum', price: 500, unit: '', reference_range: 'Non-reactive', tat_hours: 12 },
  { code: 'VDRL', name: 'VDRL / RPR (Syphilis)', category: 'Serology', sample_type: 'Serum', price: 250, unit: '', reference_range: 'Non-reactive', tat_hours: 12 },
  { code: 'WIDAL', name: 'Widal Test (Typhoid)', category: 'Serology', sample_type: 'Serum', price: 200, unit: 'Titre', reference_range: '< 1:80', tat_hours: 6 },
  { code: 'TYPHIDOT', name: 'Typhidot IgM/IgG', category: 'Serology', sample_type: 'Serum', price: 700, unit: '', reference_range: 'Negative', tat_hours: 12 },
  { code: 'DENGUE-NS1', name: 'Dengue NS1 Antigen', category: 'Serology', sample_type: 'Serum', price: 600, unit: '', reference_range: 'Negative', tat_hours: 6 },
  { code: 'DENGUE-IGM', name: 'Dengue IgM/IgG Antibody', category: 'Serology', sample_type: 'Serum', price: 700, unit: '', reference_range: 'Negative', tat_hours: 6 },
  { code: 'MALARIA', name: 'Malaria Antigen (MP Card)', category: 'Serology', sample_type: 'Blood (EDTA)', price: 350, unit: '', reference_range: 'Negative', tat_hours: 2 },
  { code: 'CRP', name: 'C-Reactive Protein (CRP)', category: 'Serology', sample_type: 'Serum', price: 350, unit: 'mg/L', reference_range: '< 6', tat_hours: 6 },
  { code: 'ASO', name: 'ASO Titre', category: 'Serology', sample_type: 'Serum', price: 350, unit: 'IU/mL', reference_range: '< 200', tat_hours: 12 },
  { code: 'RA', name: 'RA Factor (Rheumatoid Factor)', category: 'Serology', sample_type: 'Serum', price: 350, unit: 'IU/mL', reference_range: '< 14', tat_hours: 12 },
  { code: 'ANA', name: 'ANA (Antinuclear Antibody)', category: 'Serology', sample_type: 'Serum', price: 900, unit: '', reference_range: 'Negative', tat_hours: 24 },
  { code: 'IGE', name: 'Total IgE', category: 'Serology', sample_type: 'Serum', price: 700, unit: 'IU/mL', reference_range: '< 100', tat_hours: 24 },
  { code: 'COVID-PCR', name: 'COVID-19 RT-PCR', category: 'Serology', sample_type: 'Nasopharyngeal Swab', price: 700, unit: '', reference_range: 'Negative', tat_hours: 24 },

  // ---------------- TUMOR MARKERS ----------------
  { code: 'PSA-T', name: 'PSA Total (Prostate Specific Antigen)', category: 'Tumor Markers', sample_type: 'Serum', price: 700, unit: 'ng/mL', reference_range: '< 4.0', tat_hours: 24 },
  { code: 'PSA-F', name: 'PSA Free', category: 'Tumor Markers', sample_type: 'Serum', price: 900, unit: 'ng/mL', reference_range: '> 25% of total', tat_hours: 24 },
  { code: 'CA125', name: 'CA 125 (Ovarian)', category: 'Tumor Markers', sample_type: 'Serum', price: 1200, unit: 'U/mL', reference_range: '< 35', tat_hours: 24 },
  { code: 'CA19-9', name: 'CA 19-9 (Pancreatic)', category: 'Tumor Markers', sample_type: 'Serum', price: 1200, unit: 'U/mL', reference_range: '< 37', tat_hours: 24 },
  { code: 'CEA', name: 'CEA (Carcinoembryonic Antigen)', category: 'Tumor Markers', sample_type: 'Serum', price: 900, unit: 'ng/mL', reference_range: '< 5', tat_hours: 24 },
  { code: 'AFP', name: 'AFP (Alpha-Fetoprotein)', category: 'Tumor Markers', sample_type: 'Serum', price: 900, unit: 'ng/mL', reference_range: '< 10', tat_hours: 24 },

  // ---------------- CLINICAL PATHOLOGY / URINE / STOOL ----------------
  { code: 'URINE-R', name: 'Urine Routine & Microscopy', category: 'Clinical Pathology', sample_type: 'Urine', price: 150, unit: '', reference_range: 'See individual parameters', tat_hours: 4 },
  { code: 'URINE-C', name: 'Urine Culture & Sensitivity', category: 'Clinical Pathology', sample_type: 'Urine', price: 600, unit: '', reference_range: 'No growth', tat_hours: 48 },
  { code: 'STOOL-R', name: 'Stool Routine & Microscopy', category: 'Clinical Pathology', sample_type: 'Stool', price: 150, unit: '', reference_range: 'See individual parameters', tat_hours: 6 },
  { code: 'STOOL-OB', name: 'Stool Occult Blood', category: 'Clinical Pathology', sample_type: 'Stool', price: 200, unit: '', reference_range: 'Negative', tat_hours: 6 },
  { code: 'SEMEN', name: 'Semen Analysis', category: 'Clinical Pathology', sample_type: 'Semen', price: 400, unit: '', reference_range: 'See WHO reference values', tat_hours: 6 },

  // ---------------- MICROBIOLOGY ----------------
  { code: 'BLOODC', name: 'Blood Culture & Sensitivity', category: 'Microbiology', sample_type: 'Blood', price: 900, unit: '', reference_range: 'No growth', tat_hours: 72 },
  { code: 'SPUTUMC', name: 'Sputum Culture & Sensitivity', category: 'Microbiology', sample_type: 'Sputum', price: 700, unit: '', reference_range: 'No growth', tat_hours: 72 },
  { code: 'WOUNDC', name: 'Wound Swab Culture & Sensitivity', category: 'Microbiology', sample_type: 'Swab', price: 700, unit: '', reference_range: 'No growth', tat_hours: 72 },
  { code: 'AFB', name: 'Sputum for AFB (TB) Smear', category: 'Microbiology', sample_type: 'Sputum', price: 250, unit: '', reference_range: 'Not detected', tat_hours: 24 },
];

module.exports = { STANDARD_TESTS };
