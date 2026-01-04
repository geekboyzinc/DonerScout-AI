
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, NonprofitCategory, VerificationInfo, GroundingSource, NonprofitProjectInfo, DonorLead } from "../types";

export const findDonors = async (
  category: NonprofitCategory | string,
  region: string
): Promise<SearchResult> => {
  // Use process.env.API_KEY directly as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Research and find potential major donors, foundations, and corporate social responsibility (CSR) programs that support "${category}" initiatives in the region of "${region}". 
  Provide a detailed analysis of the funding landscape and a list of specific leads. 
  
  The response should include:
  1. A summary of the regional philanthropic environment for this sector.
  2. A list of 5-8 high-potential leads with their focus areas and relevance.
  3. Why they are a good fit for a ${category} nonprofit.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No analysis available.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'External Source',
        uri: chunk.web?.uri || '#'
      }));

    // Explicitly typing mock leads to ensure compatibility with DonorLead interface
    const leads: DonorLead[] = [
      { 
        name: "Global Giving Foundation", 
        type: "Foundation", 
        relevanceScore: 95, 
        focusAreas: ["Education", "Global Health"], 
        description: "Provides direct grants to community-led projects.",
        email: "grants@globalgiving.org" 
      },
      { 
        name: "TechCare Corp CSR", 
        type: "Corporate", 
        relevanceScore: 88, 
        focusAreas: ["Innovation", "Healthcare"], 
        description: "Focuses on technology-driven social impact.",
        email: "csr-contact@techcare.com"
      },
      { 
        name: "Regional Community Trust", 
        type: "Foundation", 
        relevanceScore: 92, 
        focusAreas: ["Human Services", "Local Region"], 
        description: "Largest local endowment for community development.",
        email: "info@regionaltrust.org"
      },
    ];

    return {
      analysis: text,
      leads,
      sources
    };
  } catch (error) {
    console.error("Error fetching donors:", error);
    throw error;
  }
};

export const verifyNonprofit = async (
  name: string,
  regId: string,
  region: string
): Promise<VerificationInfo> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Verify the registration status and non-profit credentials for an organization named "${name}" with registration/EIN number "${regId}" in the region "${region}". 
  Search official registries (like IRS, Charity Commission, etc.) and news sources.
  Return a summary of their status, whether they are in good standing, and their primary tax-exempt classification.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Verification data unavailable.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Registry Source',
        uri: chunk.web?.uri || '#'
      }));

    const status: 'Verified' | 'Unverified' = text.toLowerCase().includes('good standing') || text.toLowerCase().includes('active') ? 'Verified' : 'Unverified';

    return {
      status,
      officialName: name,
      registrationId: regId,
      taxStatus: "501(c)(3) or Equivalent",
      lastUpdated: new Date().toLocaleDateString(),
      verificationSources: sources,
      summary: text
    };
  } catch (error) {
    console.error("Error verifying nonprofit:", error);
    throw error;
  }
};

export const generateOutreachDraft = async (
  donorName: string,
  donorType: string,
  donorFocus: string[],
  nonprofitSector: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Write a professional and compelling outreach email draft for a nonprofit in the "${nonprofitSector}" sector seeking a partnership or grant from "${donorName}" (${donorType}).
  The donor is known for focusing on: ${donorFocus.join(', ')}.
  
  The draft should:
  1. Have a clear, engaging subject line.
  2. Reference the donor's specific focus areas.
  3. Be concise and goal-oriented.
  4. Use a collaborative tone.
  5. Include placeholders for [Nonprofit Name] and [Specific Project].`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Failed to generate draft.";
  } catch (error) {
    console.error("Error generating outreach draft:", error);
    throw error;
  }
};

export const generateGrantProposal = async (
  donor: DonorLead,
  project: NonprofitProjectInfo
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // prompt now correctly accesses project.nonprofitName and project.mission as defined in types.ts
  const prompt = `Act as a professional grant writer. Write a comprehensive grant proposal for "${project.nonprofitName}" directed to "${donor.name}" (${donor.type}).
  
  The donor focuses on: ${donor.focusAreas.join(', ')}.
  The nonprofit's mission: ${project.mission}
  The specific project: "${project.projectTitle}"
  Goals: ${project.projectGoals}
  Amount Requested: ${project.amountRequested}
  Timeline: ${project.timeline}
  
  The proposal must include:
  1. Executive Summary
  2. Organizational Mission and Alignment with Donor Goals
  3. Problem Statement / Needs Assessment
  4. Project Description and Methodology
  5. Anticipated Impact and Outcomes
  6. Sustainability Plan
  
  Maintain a highly professional, persuasive, and visionary tone. Ensure the alignment between the donor's stated focus and the project is explicitly highlighted.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    return response.text || "Failed to generate proposal.";
  } catch (error) {
    console.error("Error generating grant proposal:", error);
    throw error;
  }
};
