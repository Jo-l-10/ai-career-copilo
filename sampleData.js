// Realistic sample profiles & job descriptions for instant testing and demonstration

export const SAMPLE_USER_PROFILE = {
  user: {
    id: "user_joel_j",
    name: "JOEL J",
    email: "joelj09@zohomail.in",
    phone: "+91 9791053460",
    location: "Tiruchirappalli / Chennai, India",
    linkedin: "https://linkedin.com/in/joel-j-3a269318b",
    portfolio: "https://github.com/Jo-l-10/Projects",
    target_role: "Business Operations & Analytics Specialist",
    summary: "Dynamic MBA candidate at NIT Trichy with a background in Civil Engineering and 3 years of experience as a System Engineer at Tata Consultancy Services. Proficient in SQL, Python, Power BI, Advanced Excel, Azure, and SAP, with proven success in streamlining operations, KPI reporting frameworks, and data analytics."
  },
  education: [
    {
      id: "edu_1",
      institution: "National Institute of Technology, Tiruchirappalli",
      degree: "MBA",
      field: "Management",
      start_year: "2025",
      end_year: "2027",
      grade: "07.93/10*"
    },
    {
      id: "edu_2",
      institution: "Panimalar Institute of Technology, Chennai",
      degree: "B.E. CIVIL",
      field: "Civil Engineering",
      start_year: "2018",
      end_year: "2022",
      grade: "83.80%"
    },
    {
      id: "edu_3",
      institution: "S.B.O.A Matric Hr Sec School Anna Nagar, Chennai",
      degree: "Class XII",
      field: "Higher Secondary",
      start_year: "2016",
      end_year: "2018",
      grade: "74.00%"
    },
    {
      id: "edu_4",
      institution: "S.B.O.A Matric Hr Sec School Anna Nagar, Chennai",
      degree: "Class X",
      field: "Secondary School",
      start_year: "2014",
      end_year: "2016",
      grade: "95.20%"
    }
  ],
  experience: [
    {
      id: "exp_1",
      company: "GOWREADS",
      job_title: "Business Operations Intern",
      location: "Remote",
      start_date: "May'26",
      end_date: "Jun'26",
      current: false,
      tag: "Responsibilities",
      description: "Conducted market research and customer analytics for Swedish EdTech expansion.",
      achievements: [
        "Conducted market research, competitive benchmarking, and customer behavior analysis across the Swedish EdTech market, addressing 12+ strategic business questions to identify growth opportunities and support the company's expansion strategy.",
        "Analyzed customer demand, enrollment trends, and CRM data using Excel, Google Sheets, and Klaviyo, generating actionable business insights that informed customer engagement strategies and marketing decision-making.",
        "Evaluated partnership opportunities, public relations initiatives, and customer acquisition channels, synthesizing research-backed recommendations to strengthen market positioning and improve brand visibility.",
        "Coordinated cross-functional business initiatives using Jira, improving project visibility, streamlining issue resolution, and enhancing collaboration among stakeholders."
      ]
    },
    {
      id: "exp_2",
      company: "TATA CONSULTANCY SERVICES",
      job_title: "System Engineer",
      location: "Chennai, India",
      start_date: "Jul'22",
      end_date: "Jul'25",
      current: false,
      tag: "Responsibilities",
      description: "PMO process optimization, reporting frameworks, and automated workflows.",
      achievements: [
        "Partnered with engineering and business stakeholders to analyze project performance, streamline PMO processes, and reduce delivery timelines by 20%.",
        "Developed standardized KPI reporting frameworks across 50+ projects, enabling leadership to monitor operational performance and make faster, data-driven decisions.",
        "Identified process inefficiencies through 100+ data quality assessments, recommending governance improvements that increased infrastructure data accuracy by 25%.",
        "Automated reporting and operational workflows using SQL, SAP, Excel, and Azure, reducing manual reporting effort and improving team productivity by 15%."
      ]
    }
  ],
  skills: [
    { id: "sk_1", skill: "Excel", category: "Tools", proficiency: "Expert" },
    { id: "sk_2", skill: "SQL", category: "Technical", proficiency: "Advanced" },
    { id: "sk_3", skill: "Power BI", category: "Technical", proficiency: "Advanced" },
    { id: "sk_4", skill: "Python", category: "Technical", proficiency: "Intermediate" },
    { id: "sk_5", skill: "Jira", category: "Tools", proficiency: "Advanced" },
    { id: "sk_6", skill: "SAP", category: "Tools", proficiency: "Intermediate" },
    { id: "sk_7", skill: "Azure", category: "Technical", proficiency: "Intermediate" },
    { id: "sk_8", skill: "Klaviyo", category: "Tools", proficiency: "Intermediate" },
    { id: "sk_9", skill: "GIS", category: "Tools", proficiency: "Intermediate" }
  ],
  projects: [
    {
      id: "proj_1",
      name: "Customer Churn & Revenue Analytics Dashboard",
      technologies: "SQL, Python, Power BI",
      tag: "Academic Projects",
      role: "Lead Analyst",
      description: "Identified key customer churn drivers through exploratory data analysis and customer segmentation using SQL and Python. Developed interactive Power BI dashboards to visualize customer lifetime value, churn trends, and revenue performance, supporting data-driven retention strategies.",
      outcome: "Enabled retention strategies with multi-dimensional churn forecasting.",
      url: "https://github.com/Jo-l-10/Projects"
    }
  ],
  leadership: [
    {
      id: "lead_1",
      role: "Lead Coordinator, Events Organizing Committee",
      organization: "DoMS, NIT Trichy",
      year: "2026",
      tag: "Positions of Responsibility",
      description: "Led cross-functional teams in planning and executing 5+ large-scale events involving 200+ participants, coordinating vendors, budgets, and stakeholder communication to ensure seamless execution."
    },
    {
      id: "lead_2",
      role: "Hospitality Coordinator, NISADAYA – Management Fest",
      organization: "DoMS, NIT Trichy",
      year: "2026",
      tag: "Positions of Responsibility",
      description: "Coordinated accommodation, travel logistics, and vendor operations for 120+ participants, ensuring seamless event execution through effective stakeholder management."
    }
  ],
  awards: [
    {
      id: "aw_1",
      tag: "Academics",
      title: "Honored with the “Tata Applause Award” twice at Tata Consultancy Services for outstanding teamwork and exceptional performance."
    },
    {
      id: "aw_2",
      tag: "Academics",
      title: "Awarded “Certificate of Appreciation” twice at Tata Consultancy Services for significant contributions to project success and service excellence."
    },
    {
      id: "aw_3",
      tag: "Academics",
      title: "Finalist in CORPORENZA 2026 – The Insight Terminal (Data Dominion), advancing among 267 registered participants in a national-level data analytics competition."
    },
    {
      id: "aw_4",
      tag: "Academics",
      title: "Secured Top 1% Rank in “Management Information System” certification exam conducted by NPTEL."
    }
  ],
  certifications: [
    { id: "cert_1", name: "McKinsey.org Forward Program", issuer: "McKinsey", year: "2025" },
    { id: "cert_2", name: "Microsoft Azure AI Fundamentals", issuer: "Microsoft", year: "2025" },
    { id: "cert_3", name: "Power BI – For Business Applications", issuer: "Microsoft Elevate", year: "2025" },
    { id: "cert_4", name: "Management Information System", issuer: "NPTEL", year: "2024" }
  ]
};

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: "jd_frontend_eng",
    title: "Junior Frontend Engineer (React / TypeScript)",
    company: "CloudScale Technologies",
    raw_content: `Job Title: Junior Frontend Engineer
Company: CloudScale Technologies
Location: Remote / San Francisco, CA

About the Role:
We are seeking an enthusiastic Junior Frontend Engineer to join our core product team. You will build high-performance, responsive web interfaces using React, TypeScript, and Tailwind CSS, and collaborate closely with backend engineers and UI designers.

Key Responsibilities:
- Build and maintain responsive, accessible user interfaces using React and TypeScript.
- Integrate RESTful APIs and handle asynchronous state management.
- Write clean, modular, and maintainable code adhering to modern web standards.
- Participate in Agile/Scrum ceremonies, code reviews, and sprint planning.
- Collaborate with UX designers to translate Figma mockups into pixel-perfect components.
- Optimize web applications for maximum speed and scalability.

Required Qualifications:
- Bachelor's degree in Computer Science, Software Engineering, or related technical field (or equivalent practical experience).
- 0-2 years of software engineering experience or strong project portfolio.
- Proficiency in JavaScript (ES6+), TypeScript, HTML5, and CSS3.
- Hands-on experience with modern frontend frameworks, specifically React.js.
- Familiarity with modern CSS tooling like Tailwind CSS or CSS Modules.
- Solid understanding of Git version control and GitHub workflows.
- Strong problem-solving abilities and communication skills.

Preferred / Bonus Skills:
- Experience with Next.js or Vite.
- Understanding of state management tools (Redux, Zustand, or Context API).
- Experience with unit testing using Jest or React Testing Library.
- Familiarity with Docker and CI/CD pipelines.
- Basic knowledge of backend APIs in Node.js / Express.`
  },
  {
    id: "jd_data_analyst",
    title: "Junior Data Analyst & Business Intelligence Associate",
    company: "Metro Analytics Group",
    raw_content: `Job Title: Junior Data Analyst
Company: Metro Analytics Group
Location: Chicago, IL (Hybrid)

Role Overview:
Metro Analytics Group is looking for an analytical Junior Data Analyst to support our business intelligence operations. You will analyze complex datasets, build interactive dashboards, and deliver actionable insights to cross-functional stakeholders.

Responsibilities:
- Extract, clean, and transform raw business data from relational databases using SQL.
- Build and maintain interactive dashboards in Power BI and Tableau.
- Perform exploratory data analysis and trend forecasting in Python (Pandas, NumPy) and Advanced Excel.
- Present data visualizations and analytical findings to business leaders in clear reports.
- Collaborate with data engineers to validate data pipeline integrity and ETL processes.

Requirements:
- Bachelor's degree in Computer Science, Statistics, Mathematics, Economics, or related quantitative field.
- Strong proficiency in SQL (joins, aggregations, window functions).
- Hands-on experience with Business Intelligence tools (Power BI, Tableau).
- Practical familiarity with Python or R for data analysis (Pandas, Matplotlib, Seaborn).
- Advanced Excel skills (Pivot Tables, VLOOKUP, Power Query).
- Excellent verbal and written communication skills and attention to detail.

Preferred Qualifications:
- Familiarity with Cloud Data Warehouses (Google BigQuery, Snowflake, or AWS Redshift).
- Knowledge of basic Machine Learning algorithms (Scikit-Learn).
- Experience with Git and version control.`
  }
];
