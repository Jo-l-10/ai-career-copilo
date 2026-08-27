// Automated Test Suite for AI Career Copilot Core Engine

import assert from 'node:assert';
import { SKILLS_TAXONOMY, findCanonicalSkill } from '../src/skillsTaxonomy.js';
import { OfflineNLPEngine } from '../src/aiProviders.js';
import { DocumentAgent } from '../src/agentManager.js';
import { SAMPLE_USER_PROFILE, SAMPLE_JOB_DESCRIPTIONS } from '../src/sampleData.js';

console.log("==================================================");
console.log("Running AI Career Copilot Automated Test Suite...");
console.log("==================================================");

// 1. Test Skills Taxonomy
console.log("\n[TEST 1] Skills Taxonomy & Canonical Matching");
assert(SKILLS_TAXONOMY.technical.includes("React"), "React should be in technical skills");
assert(SKILLS_TAXONOMY.technical.includes("SQL"), "SQL should be in technical skills");
assert.strictEqual(findCanonicalSkill("reactjs"), "React", "Alias 'reactjs' should resolve to 'React'");
assert.strictEqual(findCanonicalSkill("postgres"), "PostgreSQL", "Alias 'postgres' should resolve to 'PostgreSQL'");
console.log("✅ Passed Skills Taxonomy Verification.");

// 2. Test X-Y-Z Bullet Point Enhancer
console.log("\n[TEST 2] X-Y-Z Bullet Point Enhancer");
const rawBullet = "Worked on sales reports using Excel and SQL";
const bulletAlts = OfflineNLPEngine.enhanceBulletXYZ(rawBullet);
assert.strictEqual(bulletAlts.length, 3, "Should generate exactly 3 distinct bullet alternatives");
assert(bulletAlts[0].text.includes("sales reports"), "Enhanced bullet should preserve original context");
assert(bulletAlts[0].rationale.length > 5, "Enhanced bullet should provide rationale");
console.log("Sample Generated X-Y-Z Alternative 1:", bulletAlts[0].text);
console.log("✅ Passed X-Y-Z Bullet Enhancer Verification.");

// 3. Test Professional Summary Generator
console.log("\n[TEST 3] Professional Summary Generator (3 Variations)");
const summaries = OfflineNLPEngine.generateSummaries(SAMPLE_USER_PROFILE);
assert(summaries.short && summaries.short.length > 20, "Short summary should be generated");
assert(summaries.standard && summaries.standard.length > 50, "Standard summary should be generated");
assert(summaries.ats_focused && summaries.ats_focused.length > 50, "ATS focused summary should be generated");
console.log("Sample Short Summary:", summaries.short);
console.log("✅ Passed Summary Generator Verification.");

// 4. Test Job Description Parser
console.log("\n[TEST 4] Job Description Parsing Agent");
const parsedJd = OfflineNLPEngine.parseJobDescription(SAMPLE_JOB_DESCRIPTIONS[0].raw_content);
assert(parsedJd.technical_skills.length >= 3, "Should extract technical skills from JD");
assert(parsedJd.technical_skills.includes("React") || parsedJd.technical_skills.includes("TypeScript"), "Should detect React/TypeScript");
console.log("Extracted JD Title:", parsedJd.title);
console.log("Extracted Skills:", parsedJd.technical_skills.join(", "));
console.log("✅ Passed JD Parser Verification.");

// 5. Test Resume vs JD Match Analysis & 0-100% Score
console.log("\n[TEST 5] Resume vs JD Match Analysis & 0-100% ATS Compatibility");
const defaultResumeContent = {
  personal: SAMPLE_USER_PROFILE.user,
  education: SAMPLE_USER_PROFILE.education,
  experience: SAMPLE_USER_PROFILE.experience,
  skills: SAMPLE_USER_PROFILE.skills,
  projects: SAMPLE_USER_PROFILE.projects
};

const matchResult = OfflineNLPEngine.analyzeResumeMatch(defaultResumeContent, parsedJd);
assert(matchResult.overall_score >= 0 && matchResult.overall_score <= 100, "Overall score must be 0-100");
assert(matchResult.sub_scores.skills >= 0 && matchResult.sub_scores.skills <= 100, "Skills score must be 0-100");
assert(matchResult.matching_keywords.length > 0, "Should have matching keywords");
assert(matchResult.skill_gap_analysis.already_have.length > 0, "Skill gap matrix should have already_have");
assert(matchResult.recommendations.length > 0, "Should generate recommendations");
assert(matchResult.suggested_projects.length > 0, "Should generate suggested portfolio projects");

console.log(`Computed Match Score: ${matchResult.overall_score}%`);
console.log(`Sub-scores: Skills ${matchResult.sub_scores.skills}%, Keywords ${matchResult.sub_scores.keywords}%, Exp ${matchResult.sub_scores.experience}%, Qual ${matchResult.sub_scores.qualifications}%`);
console.log(`Matching Keywords (${matchResult.matching_keywords.length}):`, matchResult.matching_keywords.join(", "));
console.log(`Missing Keywords (${matchResult.missing_keywords.length}):`, matchResult.missing_keywords.join(", "));
console.log("✅ Passed Match Analysis & Scoring Verification.");

// 6. Test ATS Compliance Validator
console.log("\n[TEST 6] ATS Compliance & Document Validation");
const atsCheck = DocumentAgent.validateATSCompliance(defaultResumeContent);
assert(atsCheck.ats_score >= 80, "Default sample resume should score >= 80% on ATS compliance");
assert.strictEqual(atsCheck.is_ats_friendly, true, "Default resume should be marked ATS friendly");
console.log(`ATS Compliance Score: ${atsCheck.ats_score}% (${atsCheck.passed_checks.length} passed checks)`);
console.log("✅ Passed ATS Compliance Verification.");

// 7. Test Interview Questions Generator
console.log("\n[TEST 7] Interview Questions Generator");
const interviewPrep = OfflineNLPEngine.generateInterviewQuestions(parsedJd, defaultResumeContent);
assert(interviewPrep.technical.length > 0, "Should generate technical questions");
assert(interviewPrep.behavioral.length > 0, "Should generate behavioral questions");
console.log("Sample Tech Question:", interviewPrep.technical[0].question);
console.log("Sample STAR Strategy:", interviewPrep.technical[0].framework);
console.log("✅ Passed Interview Generator Verification.");

console.log("\n==================================================");
console.log("🎉 ALL 7 TEST SUITES PASSED WITH 100% SUCCESS!");
console.log("==================================================");
