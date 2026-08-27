// Database Layer using Dexie.js (IndexedDB local relational storage)
// Zero configuration, 100% free, runs entirely in the browser.

import { SAMPLE_USER_PROFILE, SAMPLE_JOB_DESCRIPTIONS } from './sampleData.js';

class AppDatabase {
  constructor() {
    // Check if Dexie is available globally from CDN, or provide fallback
    if (typeof Dexie !== 'undefined') {
      this.db = new Dexie('AICareerCopilotDB');
      this.db.version(2).stores({
        users: 'id, email, target_role',
        education: 'id, user_id, institution',
        experience: 'id, user_id, company, job_title',
        skills: 'id, user_id, skill, category',
        projects: 'id, user_id, name',
        resumes: 'id, user_id, title, updated_at',
        job_descriptions: 'id, user_id, title, created_at',
        match_analysis: 'id, user_id, resume_id, jd_id, created_at',
        templates: 'id, name, type, is_default, created_at'
      });
    } else {
      console.warn('Dexie.js not found in global scope. Using LocalStorage fallback adapter.');
      this.db = this.createLocalStorageFallback();
    }
  }

  createLocalStorageFallback() {
    const getStore = (key) => JSON.parse(localStorage.getItem('aicp_' + key) || '[]');
    const setStore = (key, data) => localStorage.setItem('aicp_' + key, JSON.stringify(data));
    
    return {
      users: this.makeStoreAdapter('users', getStore, setStore),
      education: this.makeStoreAdapter('education', getStore, setStore),
      experience: this.makeStoreAdapter('experience', getStore, setStore),
      skills: this.makeStoreAdapter('skills', getStore, setStore),
      projects: this.makeStoreAdapter('projects', getStore, setStore),
      resumes: this.makeStoreAdapter('resumes', getStore, setStore),
      job_descriptions: this.makeStoreAdapter('job_descriptions', getStore, setStore),
      match_analysis: this.makeStoreAdapter('match_analysis', getStore, setStore),
      templates: this.makeStoreAdapter('templates', getStore, setStore)
    };
  }

  makeStoreAdapter(name, getStore, setStore) {
    return {
      toArray: async () => getStore(name),
      get: async (id) => getStore(name).find(item => item.id === id) || null,
      put: async (item) => {
        const list = getStore(name);
        const idx = list.findIndex(i => i.id === item.id);
        if (idx >= 0) list[idx] = item;
        else list.push(item);
        setStore(name, list);
        return item.id;
      },
      bulkPut: async (items) => {
        const list = getStore(name);
        for (const item of items) {
          const idx = list.findIndex(i => i.id === item.id);
          if (idx >= 0) list[idx] = item;
          else list.push(item);
        }
        setStore(name, list);
      },
      delete: async (id) => {
        const list = getStore(name).filter(i => i.id !== id);
        setStore(name, list);
      },
      clear: async () => setStore(name, []),
      where: (field) => ({
        equals: (val) => ({
          toArray: async () => getStore(name).filter(item => item[field] === val)
        })
      })
    };
  }

  async initSeedData(force = false) {
    const userCount = (await this.db.users.toArray()).length;
    if (userCount === 0 || force) {
      console.log('Seeding initial sample profile and sample job descriptions...');
      if (force) {
        await this.clearAll();
      }

      // 1. Seed user
      await this.db.users.put(SAMPLE_USER_PROFILE.user);

      // 2. Seed education
      for (const edu of SAMPLE_USER_PROFILE.education) {
        await this.db.education.put({ ...edu, user_id: SAMPLE_USER_PROFILE.user.id });
      }

      // 3. Seed experience
      for (const exp of SAMPLE_USER_PROFILE.experience) {
        await this.db.experience.put({ ...exp, user_id: SAMPLE_USER_PROFILE.user.id });
      }

      // 4. Seed skills
      for (const sk of SAMPLE_USER_PROFILE.skills) {
        await this.db.skills.put({ ...sk, user_id: SAMPLE_USER_PROFILE.user.id });
      }

      // 5. Seed projects
      for (const proj of SAMPLE_USER_PROFILE.projects) {
        await this.db.projects.put({ ...proj, user_id: SAMPLE_USER_PROFILE.user.id });
      }

      // 6. Seed default resume matching Joel J Placement template
      const defaultResume = {
        id: "res_default_1",
        user_id: SAMPLE_USER_PROFILE.user.id,
        title: "NIT-IIM Premier Placement Resume",
        template_style: "placement_elite",
        summary: SAMPLE_USER_PROFILE.user.summary,
        version: 1,
        content: {
          personal: SAMPLE_USER_PROFILE.user,
          education: SAMPLE_USER_PROFILE.education,
          experience: SAMPLE_USER_PROFILE.experience,
          skills: SAMPLE_USER_PROFILE.skills,
          projects: SAMPLE_USER_PROFILE.projects,
          leadership: SAMPLE_USER_PROFILE.leadership,
          awards: SAMPLE_USER_PROFILE.awards,
          certifications: SAMPLE_USER_PROFILE.certifications
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await this.db.resumes.put(defaultResume);

      // 7. Seed sample job descriptions
      for (const jd of SAMPLE_JOB_DESCRIPTIONS) {
        await this.db.job_descriptions.put({
          ...jd,
          user_id: SAMPLE_USER_PROFILE.user.id,
          created_at: new Date().toISOString()
        });
      }

      // 8. Seed default templates (including Sample 1: Joel J Placement Template)
      const defaultTemplates = [
        {
          id: "placement_elite",
          name: "Sample 1: Joel J Placement & Corporate Format",
          description: "Institutional premier B-School format (NIT Trichy / IIM) with shaded section banners, 4-column tabular education, left category tags, and bottom footer.",
          type: "builtin",
          is_default: true,
          config: {
            header_style: "placement_banner",
            section_banner_style: "shaded_bar",
            banner_bg_color: "#d1d5db",
            banner_text_color: "#000000",
            border_color: "#4b5563",
            education_style: "table_grid",
            left_tag_column: true,
            bullet_style: "square",
            footer_style: "bottom_bar",
            font_family: "calibri"
          },
          created_at: new Date().toISOString()
        },
        {
          id: "classic_ats",
          name: "Sample 2: Classic Single-Column ATS Format",
          description: "Monochrome Times New Roman layout optimized for strict legacy enterprise parsing.",
          type: "builtin",
          is_default: false,
          config: {
            header_style: "classic_center",
            section_banner_style: "underline",
            banner_bg_color: "transparent",
            banner_text_color: "#000000",
            border_color: "#374151",
            education_style: "list_bullets",
            left_tag_column: false,
            bullet_style: "disc",
            footer_style: "top_contact",
            font_family: "times"
          },
          created_at: new Date().toISOString()
        },
        {
          id: "modern_tech",
          name: "Sample 3: Modern Minimalist Tech Format",
          description: "Clean tech startup layout with cyan accent indicators, bold skills pills, and crisp sans-serif font.",
          type: "builtin",
          is_default: false,
          config: {
            header_style: "modern_split",
            section_banner_style: "boxed",
            banner_bg_color: "#f1f5f9",
            banner_text_color: "#0f172a",
            border_color: "#06b6d4",
            education_style: "list_bullets",
            left_tag_column: true,
            bullet_style: "arrow",
            footer_style: "top_contact",
            font_family: "inter"
          },
          created_at: new Date().toISOString()
        }
      ];

      for (const tmpl of defaultTemplates) {
        await this.db.templates.put(tmpl);
      }

      console.log('Database initialized successfully with sample data and templates.');
    }
  }

  async getTemplates() {
    const list = await this.db.templates.toArray();
    if (list.length === 0) {
      // Re-seed default templates if empty
      await this.initSeedData(true);
      return await this.db.templates.toArray();
    }
    return list;
  }

  async getTemplateById(id) {
    return await this.db.templates.get(id);
  }

  async saveTemplate(template) {
    if (!template.id) {
      template.id = 'tmpl_' + Date.now();
    }
    template.updated_at = new Date().toISOString();
    await this.db.templates.put(template);
    return template.id;
  }

  async deleteTemplate(id) {
    const tmpl = await this.db.templates.get(id);
    if (tmpl && tmpl.type === 'builtin') {
      throw new Error("Cannot delete built-in sample templates.");
    }
    await this.db.templates.delete(id);
  }

  async getCurrentUser() {
    const users = await this.db.users.toArray();
    return users[0] || null;
  }

  async getFullUserProfile(userId) {
    const user = await this.db.users.get(userId);
    if (!user) return null;

    const education = await this.db.education.where('user_id').equals(userId).toArray();
    const experience = await this.db.experience.where('user_id').equals(userId).toArray();
    const skills = await this.db.skills.where('user_id').equals(userId).toArray();
    const projects = await this.db.projects.where('user_id').equals(userId).toArray();
    const resumes = await this.db.resumes.where('user_id').equals(userId).toArray();
    const defaultResume = resumes[0] || {};

    return {
      user,
      education,
      experience,
      skills,
      projects,
      leadership: defaultResume.content?.leadership || SAMPLE_USER_PROFILE.leadership || [],
      awards: defaultResume.content?.awards || SAMPLE_USER_PROFILE.awards || [],
      certifications: defaultResume.content?.certifications || SAMPLE_USER_PROFILE.certifications || []
    };
  }

  async getResumes(userId) {
    return await this.db.resumes.where('user_id').equals(userId).toArray();
  }

  async getJobDescriptions(userId) {
    return await this.db.job_descriptions.where('user_id').equals(userId).toArray();
  }

  async getMatchAnalyses(userId) {
    return await this.db.match_analysis.where('user_id').equals(userId).toArray();
  }

  async exportAllData() {
    const data = {
      users: await this.db.users.toArray(),
      education: await this.db.education.toArray(),
      experience: await this.db.experience.toArray(),
      skills: await this.db.skills.toArray(),
      projects: await this.db.projects.toArray(),
      resumes: await this.db.resumes.toArray(),
      job_descriptions: await this.db.job_descriptions.toArray(),
      match_analysis: await this.db.match_analysis.toArray(),
      templates: await this.db.templates.toArray(),
      exported_at: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString) {
    const data = JSON.parse(jsonString);
    if (data.users) await this.db.users.bulkPut(data.users);
    if (data.education) await this.db.education.bulkPut(data.education);
    if (data.experience) await this.db.experience.bulkPut(data.experience);
    if (data.skills) await this.db.skills.bulkPut(data.skills);
    if (data.projects) await this.db.projects.bulkPut(data.projects);
    if (data.resumes) await this.db.resumes.bulkPut(data.resumes);
    if (data.job_descriptions) await this.db.job_descriptions.bulkPut(data.job_descriptions);
    if (data.match_analysis) await this.db.match_analysis.bulkPut(data.match_analysis);
    if (data.templates) await this.db.templates.bulkPut(data.templates);
  }

  async clearAll() {
    await this.db.users.clear();
    await this.db.education.clear();
    await this.db.experience.clear();
    await this.db.skills.clear();
    await this.db.projects.clear();
    await this.db.resumes.clear();
    await this.db.job_descriptions.clear();
    await this.db.match_analysis.clear();
    await this.db.templates.clear();
  }
}

export const db = new AppDatabase();
