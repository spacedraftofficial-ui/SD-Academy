/* ============================================================
   SD Academy — Access Calculation & Organizational Validation Engine
   Built from Governance Master Registers (Data/*.xlsx)
   ============================================================ */

(function () {
  'use strict';

  const LEVEL_GUIDE = [
    { code: 'L1', name: 'Foundation', typicalRoles: 'Trainee / Executive / Operator', description: 'Group core conduct, company basics, safety & induction', cumulative: ['L1'] },
    { code: 'L2', name: 'Practitioner', typicalRoles: 'Senior Executive / Technician / Specialist', description: 'Functional execution SOPs, tools and hands-on processes', cumulative: ['L1', 'L2'] },
    { code: 'L3', name: 'Senior / Coordinator', typicalRoles: 'Senior Specialist / Team Coordinator / Lead', description: 'Coordination, quality compliance, client escalation & audits', cumulative: ['L1', 'L2', 'L3'] },
    { code: 'L4', name: 'Manager / HOD', typicalRoles: 'Manager / Head of Department', description: 'Department management, approvals, risk, DoA & appraisal', cumulative: ['L1', 'L2', 'L3', 'L4'] },
    { code: 'L5', name: 'Leadership', typicalRoles: 'Company Head / Function Head / Management', description: 'Enterprise strategy, corporate governance & restructuring', cumulative: ['L1', 'L2', 'L3', 'L4', 'L5'] },
  ];

  const SYSTEM_ROLES = [
    { code: 'learner', name: 'Learner', description: 'Personalized learning path, video player, SOPs & assessments' },
    { code: 'reviewer', name: 'HOD Reviewer', description: 'Learner permissions + review & verify team submissions & checklists' },
    { code: 'admin', name: 'Administrator', description: 'Full access to user management, course builder, governance & reports' },
  ];

  function getOrgData() {
    return window.SD_ORG_DATA || {
      companies: ['Common SD Group', 'SpaceDraft', 'Woodify', 'Uthra Media', 'Asgard', 'Oura Networks', 'Aram Pazhaguvom Foundation', 'SD Academy'],
      divisionsByCompany: {},
      departmentsByCompanyDivision: {},
      departmentsByCompany: {},
      handbooks: [],
    };
  }

  const AccessEngine = {
    getLevelGuide() {
      return LEVEL_GUIDE;
    },

    getSystemRoles() {
      return SYSTEM_ROLES;
    },

    getCompanies() {
      const data = getOrgData();
      return data.companies || [];
    },

    getDivisions(company) {
      const data = getOrgData();
      if (!company) return [];
      const divs = (data.divisionsByCompany && data.divisionsByCompany[company]) || [];
      return divs.length ? divs : ['General'];
    },

    getDepartments(company, division) {
      const data = getOrgData();
      if (!company) return [];
      
      // If division provided and mapped
      if (division && data.departmentsByCompanyDivision && data.departmentsByCompanyDivision[company]) {
        const divDepts = data.departmentsByCompanyDivision[company][division];
        if (divDepts && divDepts.length > 0) {
          return divDepts;
        }
      }
      
      // Fallback to all departments in company
      const allDepts = (data.departmentsByCompany && data.departmentsByCompany[company]) || [];
      return allDepts.length ? allDepts : ['General'];
    },

    /**
     * Validates whether Company, Division, and Department form a valid hierarchy
     */
    validateHierarchy(company, division, department) {
      const data = getOrgData();
      if (!company) {
        return { valid: false, error: 'Please select a valid Company / Entity.' };
      }
      if (!data.companies.includes(company)) {
        return { valid: false, error: `Invalid Company '${company}'. Must be a registered SD Group entity.` };
      }

      const validDivs = this.getDivisions(company);
      if (division && validDivs.length > 0 && !validDivs.includes(division)) {
        return { valid: false, error: `Division '${division}' does not belong to ${company}.` };
      }

      const validDepts = this.getDepartments(company, division);
      if (department && validDepts.length > 0 && !validDepts.includes(department)) {
        return { valid: false, error: `Department '${department}' does not belong to the selected company / division.` };
      }

      return { valid: true };
    },

    /**
     * Helper to match level cumulative access
     */
    isLevelEligible(userLevelCode, itemLevelAccess) {
      if (!itemLevelAccess) return true;
      const clean = String(itemLevelAccess).trim().toUpperCase();
      if (clean === 'L1-L5' || clean === 'ALL' || clean === 'COMMON' || clean === 'L1') return true;

      const userLevelNum = parseInt((userLevelCode || 'L1').replace('L', ''), 10) || 1;

      if (clean.includes('L2') && userLevelNum < 2) return false;
      if (clean.includes('L3') && userLevelNum < 3) return false;
      if (clean.includes('L4') && userLevelNum < 4) return false;
      if (clean.includes('L5') && userLevelNum < 5) return false;

      return true;
    },

    /**
     * Confidentiality permission check
     */
    isConfidentialityAllowed(userLevelCode, confidentialityLevel) {
      const userLevelNum = parseInt((userLevelCode || 'L1').replace('L', ''), 10) || 1;
      const conf = String(confidentialityLevel || 'Internal').trim().toLowerCase();

      if (conf === 'public' || conf === 'standard' || conf === 'general') return true;
      if (conf === 'internal') return true;
      if (conf === 'confidential') return userLevelNum >= 4; // L4 Manager / HOD & L5
      if (conf === 'restricted' || conf === 'strictly confidential' || conf === 'secret') return userLevelNum >= 5; // L5 Leadership only

      return true;
    },

    /**
     * Comprehensive Access Calculation Engine
     */
    calculateAccess(profile) {
      const data = getOrgData();
      const company = profile.company || 'Common SD Group';
      const division = profile.division || '';
      const department = profile.department || '';
      const levelCode = profile.level_code || profile.level || 'L1';
      const levelInfo = LEVEL_GUIDE.find(l => l.code === levelCode) || LEVEL_GUIDE[0];
      const cumulativeLevels = levelInfo.cumulative;

      const allBooks = data.handbooks || [];
      const eligibleCommon = [];
      const eligibleCompany = [];
      const restrictedBooks = [];

      allBooks.forEach(b => {
        const bookCompany = b.company || 'Common SD Group';
        const bookDiv = b['Brand / Division'] || '';
        const bookDept = b['Department'] || '';
        const bookLevel = b['Employee Level Access'] || b['Access Band'] || 'L1-L5';
        const bookConf = b['Confidentiality Level'] || 'Internal';

        const isLevelOk = this.isLevelEligible(levelCode, bookLevel);
        const isConfOk = this.isConfidentialityAllowed(levelCode, bookConf);

        // 1. Common SD Group Scope (Applies to all employees across SD Group)
        if (bookCompany === 'Common SD Group') {
          if (isLevelOk && isConfOk) {
            eligibleCommon.push(b);
          } else {
            restrictedBooks.push({ book: b, reason: !isLevelOk ? `Requires higher level (${bookLevel})` : `Confidentiality restricted (${bookConf})` });
          }
          return;
        }

        // 2. Company / Department Scope
        if (bookCompany === company) {
          // Check division / department match
          const isDivMatch = !division || !bookDiv || bookDiv === 'All Divisions' || bookDiv === division;
          const isDeptMatch = !department || !bookDept || bookDept === 'All Departments' || bookDept === 'Company-wide' || bookDept === 'Division-wide' || bookDept.toLowerCase() === department.toLowerCase();

          if (isDivMatch && isDeptMatch) {
            if (isLevelOk && isConfOk) {
              eligibleCompany.push(b);
            } else {
              restrictedBooks.push({ book: b, reason: !isLevelOk ? `Requires higher level (${bookLevel})` : `Confidentiality restricted (${bookConf})` });
            }
          }
        }
      });

      const totalEligible = eligibleCommon.length + eligibleCompany.length;

      return {
        company,
        division,
        department,
        jobTitle: profile.job_title || profile.role_label || 'Specialist',
        levelCode: levelInfo.code,
        levelName: levelInfo.name,
        typicalRoles: levelInfo.typicalRoles,
        systemRole: profile.role || 'learner',
        cumulativeLevels,
        totalEligibleCount: totalEligible,
        commonGroupCount: eligibleCommon.length,
        companySpecificCount: eligibleCompany.length,
        eligibleCommon,
        eligibleCompany,
        allEligibleBooks: [...eligibleCommon, ...eligibleCompany],
        restrictedCount: restrictedBooks.length,
        restrictedBooks,
        scopeSummary: `${company} ${division ? '• ' + division : ''} ${department ? '• ' + department : ''}`,
        levelsSummary: cumulativeLevels.join(' + '),
      };
    },
  };

  window.AccessEngine = AccessEngine;
})();
