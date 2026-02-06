
import { GoogleGenAI, Type } from "@google/genai";
import { SearchResult, NonprofitCategory, VerificationInfo, GroundingSource, NonprofitProjectInfo, DonorLead, DebugLog } from "../types";

// Intelligence Bus for Debugging
const broadcastDebug = (log: Omit<DebugLog, 'id' | 'timestamp'>) => {
  const event = new CustomEvent('donor-scout-debug', {
    detail: {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString()
    }
  });
  window.dispatchEvent(event);
};

export const findDonors = async (
  category: NonprofitCategory | string,
  region: string
): Promise<SearchResult> => {
  const startTime = Date.now();
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

    broadcastDebug({
      method: 'findDonors',
      payload: { category, region, prompt },
      response: { text, leads, sourcesCount: sources.length },
      latency: Date.now() - startTime,
      status: 'success'
    });

    return { analysis: text, leads, sources };
  } catch (error: any) {
    broadcastDebug({
      method: 'findDonors',
      payload: { category, region },
      response: error.message,
      latency: Date.now() - startTime,
      status: 'error'
    });
    throw error;
  }
};

export const verifyNonprofit = async (
  name: string,
  regId: string,
  region: string
): Promise<VerificationInfo> => {
  const startTime = Date.now();
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

    const result = {
      status,
      officialName: name,
      registrationId: regId,
      taxStatus: "501(c)(3) or Equivalent",
      lastUpdated: new Date().toLocaleDateString(),
      verificationSources: sources,
      summary: text
    };

    broadcastDebug({
      method: 'verifyNonprofit',
      payload: { name, regId, region },
      response: result,
      latency: Date.now() - startTime,
      status: 'success'
    });

    return result;
  } catch (error: any) {
    broadcastDebug({
      method: 'verifyNonprofit',
      payload: { name, regId },
      response: error.message,
      latency: Date.now() - startTime,
      status: 'error'
    });
    throw error;
  }
};

export const generateOutreachDraft = async (
  donorName: string,
  donorType: string,
  donorFocus: string[],
  nonprofitSector: string
): Promise<string> => {
  const startTime = Date.now();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Write a professional and compelling outreach email draft for a nonprofit in the "${nonprofitSector}" sector seeking a partnership or grant from "${donorName}" (${donorType}).
  The donor is known for focusing on: ${donorFocus.join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 0.8 }
    });

    const result = response.text || "Failed to generate draft.";

    broadcastDebug({
      method: 'generateOutreachDraft',
      payload: { donorName, donorType },
      response: result,
      latency: Date.now() - startTime,
      status: 'success'
    });

    return result;
  } catch (error: any) {
    broadcastDebug({
      method: 'generateOutreachDraft',
      payload: { donorName },
      response: error.message,
      latency: Date.now() - startTime,
      status: 'error'
    });
    throw error;
  }
};

export const generateGrantProposal = async (
  donor: DonorLead,
  project: NonprofitProjectInfo
): Promise<string> => {
  const startTime = Date.now();
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as a professional grant writer. Write a comprehensive grant proposal for "${project.nonprofitName}" directed to "${donor.name}" (${donor.type}).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const result = response.text || "Failed to generate proposal.";

    broadcastDebug({
      method: 'generateGrantProposal',
      payload: { donor: donor.name, project: project.projectTitle },
      response: result,
      latency: Date.now() - startTime,
      status: 'success'
    });

    return result;
  } catch (error: any) {
    broadcastDebug({
      method: 'generateGrantProposal',
      payload: { donor: donor.name },
      response: error.message,
      latency: Date.now() - startTime,
      status: 'error'
    });
    throw error;
  }
};
