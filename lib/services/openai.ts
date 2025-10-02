import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod/v3";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Schema for extracted biomarkers
export const BiomarkerSchema = z.object({
  concentration: z.number().nullable().describe("Sperm concentration in million/mL"),
  motility: z.number().nullable().describe("Total motility percentage"),
  progressiveMotility: z.number().nullable().describe("Progressive motility percentage"),
  morphology: z.number().nullable().describe("Normal morphology percentage"),
  volume: z.number().nullable().describe("Semen volume in mL"),
  ph: z.number().nullable().describe("pH level"),
  dfi: z.number().nullable().describe("DNA Fragmentation Index percentage"),
});

export type BiomarkerData = z.infer<typeof BiomarkerSchema>;

// Schema for lifestyle analysis
export const LifestyleAnalysisSchema = z.object({
  dietQuality: z.enum(["poor", "fair", "good", "excellent"]),
  sleepHours: z.number(),
  exerciseFrequency: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  smoking: z.boolean(),
  alcoholConsumption: z.enum(["none", "light", "moderate", "heavy"]),
  stressLevel: z.enum(["low", "moderate", "high", "severe"]),
});

export type LifestyleAnalysis = z.infer<typeof LifestyleAnalysisSchema>;

// Schema for recommendations
export const RecommendationSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(["diet", "exercise", "supplements", "lifestyle", "stress", "sleep"]),
    priority: z.enum(["low", "medium", "high", "critical"]),
    reasoning: z.string(),
  })),
});

export type RecommendationData = z.infer<typeof RecommendationSchema>;

// Extract biomarkers from PDF text
export async function extractBiomarkers(reportText: string): Promise<BiomarkerData> {
  const completion = await openai.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a medical data extraction expert. Extract sperm analysis biomarkers from the provided lab report text. 
        
Common terms to look for:
- Concentration: also called "count", "sperm concentration", measured in million/mL or M/mL
- Motility: total motile sperm, often includes progressive + non-progressive
- Progressive Motility: forward-moving sperm, grades A+B or "progressive"
- Morphology: normal forms, Kruger strict criteria
- Volume: semen volume in mL
- pH: acidity level
- DFI: DNA Fragmentation Index or DNA damage percentage

If a value is not found or unclear, return null for that field.`,
      },
      {
        role: "user",
        content: reportText,
      },
    ],
    response_format: zodResponseFormat(BiomarkerSchema, "biomarkers"),
  });

  const result = completion.choices[0]?.message?.parsed;
  if (!result) {
    throw new Error("Failed to extract biomarkers");
  }

  return result;
}

// Extract biomarkers directly from PDF/Image using Vision API
export async function extractBiomarkersFromPDF(base64Data: string, mimeType: string): Promise<BiomarkerData> {
  // For PDF, we need to convert it to image first or use a different approach
  // OpenAI's vision API works with images, so we'll use a text-based approach for PDFs
  
  try {
    // If it's a PDF, try to extract as text first using a simpler method
    if (mimeType === 'application/pdf') {
      // Use OpenAI to extract text from the document structure
      const textCompletion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are analyzing a sperm analysis lab report PDF. Extract all visible text and data from the document, focusing on numerical values and biomarker labels. Extract the raw content as structured text.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all biomarker values from this sperm analysis report. Focus on: Concentration (million/mL), Motility (%), Progressive Motility (%), Morphology (%), Volume (mL), pH, and DFI (%).",
              },
            ],
          },
        ],
      });

      const extractedText = textCompletion.choices[0]?.message?.content || "";
      
      // Now parse the extracted text
      return await extractBiomarkers(extractedText);
    }
    
    // For images (PNG, JPEG), use vision API directly
    const completion = await openai.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical data extraction expert. Extract sperm analysis biomarkers from the provided lab report image.
          
Look for these specific values:
- Concentration: sperm concentration in million/mL or M/mL
- Motility: total motility percentage
- Progressive Motility: progressive motility percentage (grades A+B)
- Morphology: normal morphology percentage (Kruger criteria)
- Volume: semen volume in mL
- pH: pH level (usually 7.2-8.0)
- DFI: DNA Fragmentation Index percentage

Return null for any value not clearly visible in the image.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
            {
              type: "text",
              text: "Extract all sperm analysis biomarkers from this lab report.",
            },
          ],
        },
      ],
      response_format: zodResponseFormat(BiomarkerSchema, "biomarkers"),
    });

    const result = completion.choices[0]?.message?.parsed;
    if (!result) {
      throw new Error("Failed to extract biomarkers from image");
    }

    return result;
  } catch (error) {
    console.error("Error extracting biomarkers from PDF/Image:", error);
    // Fallback: try to decode the PDF as text if vision fails
    try {
      const textBuffer = Buffer.from(base64Data, 'base64');
      const textContent = textBuffer.toString('utf-8');
      return await extractBiomarkers(textContent);
    } catch (fallbackError) {
      throw new Error("Failed to extract biomarkers from document. Please try manual entry or ensure the PDF contains readable text.");
    }
  }
}

// Calculate base score using WHO 2021 reference values
export function calculateBaseScore(biomarkers: BiomarkerData): number {
  let score = 0;
  let maxScore = 0;

  // Concentration (0-25 points)
  if (biomarkers.concentration !== null) {
    maxScore += 25;
    if (biomarkers.concentration >= 16) score += 25;
    else if (biomarkers.concentration >= 10) score += 20;
    else if (biomarkers.concentration >= 5) score += 15;
    else if (biomarkers.concentration >= 1) score += 10;
    else score += 5;
  }

  // Progressive Motility (0-25 points)
  if (biomarkers.progressiveMotility !== null) {
    maxScore += 25;
    if (biomarkers.progressiveMotility >= 32) score += 25;
    else if (biomarkers.progressiveMotility >= 25) score += 20;
    else if (biomarkers.progressiveMotility >= 15) score += 15;
    else if (biomarkers.progressiveMotility >= 5) score += 10;
    else score += 5;
  }

  // Morphology (0-20 points)
  if (biomarkers.morphology !== null) {
    maxScore += 20;
    if (biomarkers.morphology >= 4) score += 20;
    else if (biomarkers.morphology >= 3) score += 15;
    else if (biomarkers.morphology >= 2) score += 10;
    else if (biomarkers.morphology >= 1) score += 5;
    else score += 2;
  }

  // Volume (0-15 points)
  if (biomarkers.volume !== null) {
    maxScore += 15;
    if (biomarkers.volume >= 1.5 && biomarkers.volume <= 6) score += 15;
    else if (biomarkers.volume >= 1.0 || biomarkers.volume <= 7) score += 10;
    else score += 5;
  }

  // DFI (0-15 points) - lower is better
  if (biomarkers.dfi !== null) {
    maxScore += 15;
    if (biomarkers.dfi < 15) score += 15;
    else if (biomarkers.dfi < 25) score += 10;
    else if (biomarkers.dfi < 30) score += 5;
    else score += 2;
  }

  // Return score out of 100
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

// Simple lifestyle data from MCQs
export type SimpleLifestyleData = {
  healthyEating?: 'excellent' | 'good' | 'fair' | 'poor';
  smoking?: 'never' | 'skipped' | 'reduced' | 'normal';
  alcohol?: 'none' | 'light' | 'moderate' | 'heavy';
  exercise?: 'intense' | 'moderate' | 'light' | 'none';
  sleep?: 'optimal' | 'good' | 'fair' | 'poor';
  underwear?: 'loose' | 'moderate' | 'briefs' | 'tight';
};

// Generate personalized recommendations
export async function generateRecommendations(
  biomarkers: BiomarkerData,
  baseScore: number,
  lifestyle?: LifestyleAnalysis | SimpleLifestyleData | null
): Promise<RecommendationData> {
  let lifestyleInfo = "";
  
  // Handle different lifestyle data formats
  if (lifestyle) {
    if ('healthyEating' in lifestyle) {
      // Simple MCQ format
      const habits: string[] = [];
      
      if (lifestyle.healthyEating) {
        habits.push(`- Diet quality: ${lifestyle.healthyEating}`);
      }
      if (lifestyle.smoking) {
        habits.push(`- Smoking status: ${lifestyle.smoking}`);
      }
      if (lifestyle.alcohol) {
        habits.push(`- Alcohol consumption: ${lifestyle.alcohol}`);
      }
      if (lifestyle.exercise) {
        habits.push(`- Exercise level: ${lifestyle.exercise}`);
      }
      if (lifestyle.sleep) {
        habits.push(`- Sleep quality: ${lifestyle.sleep}`);
      }
      if (lifestyle.underwear) {
        habits.push(`- Underwear type: ${lifestyle.underwear}`);
      }
      
      if (habits.length > 0) {
        lifestyleInfo = `\n\nCurrent lifestyle habits:\n${habits.join('\n')}`;
      }
    } else if ('dietQuality' in lifestyle) {
      // Detailed lifestyle analysis format
      lifestyleInfo = `\n\nLifestyle factors:\n- Diet: ${lifestyle.dietQuality}\n- Sleep: ${lifestyle.sleepHours} hours/night\n- Exercise: ${lifestyle.exerciseFrequency}\n- Smoking: ${lifestyle.smoking ? "Yes" : "No"}\n- Alcohol: ${lifestyle.alcoholConsumption}\n- Stress: ${lifestyle.stressLevel}`;
    }
  }

  const completion = await openai.chat.completions.parse({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a fertility specialist providing personalized recommendations to improve sperm health. 
        
Base your recommendations on:
1. The biomarker values (identify which are suboptimal)
2. Current lifestyle factors (if provided)
3. Evidence-based interventions from research

Provide 3-6 specific, actionable recommendations prioritized by potential impact. Each recommendation should:
- Have a clear, specific title
- Include detailed description with actionable steps
- Specify the type (diet, exercise, supplements, lifestyle, stress, sleep)
- Set appropriate priority (critical for severe issues, high for major improvements, medium for moderate, low for fine-tuning)
- Explain the scientific reasoning

Focus on interventions that address the specific deficiencies shown in the biomarkers.`,
      },
      {
        role: "user",
        content: `Analyze this sperm analysis report:

Biomarkers:
- Concentration: ${biomarkers.concentration ?? "Not measured"} million/mL
- Total Motility: ${biomarkers.motility ?? "Not measured"}%
- Progressive Motility: ${biomarkers.progressiveMotility ?? "Not measured"}%
- Morphology: ${biomarkers.morphology ?? "Not measured"}%
- Volume: ${biomarkers.volume ?? "Not measured"} mL
- pH: ${biomarkers.ph ?? "Not measured"}
- DFI: ${biomarkers.dfi ?? "Not measured"}%

Base Score: ${baseScore}/100${lifestyleInfo}

Provide personalized recommendations to improve these results.`,
      },
    ],
    response_format: zodResponseFormat(RecommendationSchema, "recommendations"),
  });

  const result = completion.choices[0]?.message?.parsed;
  if (!result) {
    throw new Error("Failed to generate recommendations");
  }

  return result;
}

// Analyze lifestyle and calculate adjustment score
export async function analyzeLifestyleImpact(
  lifestyle: LifestyleAnalysis,
  baseScore: number
): Promise<{ adjustedScore: number; impact: string }> {
  let adjustment = 0;

  // Diet quality impact (-5 to +5)
  const dietImpact = { poor: -5, fair: -2, good: 2, excellent: 5 };
  adjustment += dietImpact[lifestyle.dietQuality];

  // Sleep impact (-3 to +3)
  if (lifestyle.sleepHours >= 7 && lifestyle.sleepHours <= 9) adjustment += 3;
  else if (lifestyle.sleepHours >= 6 || lifestyle.sleepHours <= 10) adjustment += 1;
  else adjustment -= 3;

  // Exercise impact (-2 to +4)
  const exerciseImpact = { sedentary: -2, light: 1, moderate: 4, active: 4, very_active: 2 };
  adjustment += exerciseImpact[lifestyle.exerciseFrequency];

  // Smoking impact (-10 to 0)
  if (lifestyle.smoking) adjustment -= 10;

  // Alcohol impact (-4 to 0)
  const alcoholImpact = { none: 0, light: -1, moderate: -2, heavy: -4 };
  adjustment += alcoholImpact[lifestyle.alcoholConsumption];

  // Stress impact (-5 to 0)
  const stressImpact = { low: 0, moderate: -2, high: -4, severe: -5 };
  adjustment += stressImpact[lifestyle.stressLevel];

  const adjustedScore = Math.max(0, Math.min(100, baseScore + adjustment));

  let impact = "";
  if (adjustment > 5) impact = "Your lifestyle is significantly boosting your fertility potential!";
  else if (adjustment > 0) impact = "Your lifestyle is helping improve your results.";
  else if (adjustment === 0) impact = "Your lifestyle is neutral - there are opportunities for improvement.";
  else if (adjustment > -10) impact = "Some lifestyle factors are holding back your potential.";
  else impact = "Your lifestyle is significantly impacting your fertility. Immediate changes recommended.";

  return { adjustedScore, impact };
}

// Calculate daily lifestyle score from quick checks (simplified transparent scoring)
export function calculateDailyLifestyleScore(dailyPoints: number, baseScore: number): number {
  // Each point from daily checks adds directly to the base score
  // Max daily points is 8 (healthy eating 1 + no smoking 2 + no alcohol 1 + exercise 1 + good sleep 2 + loose underwear 1)
  const adjustedScore = Math.max(0, Math.min(100, baseScore + dailyPoints));
  return adjustedScore;
}
