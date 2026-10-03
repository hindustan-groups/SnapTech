/**
 * backup.controller.js
 *
 * GET  /api/admin/backup         — Download full or selective DB backup as JSON
 * POST /api/admin/backup/restore — Restore data from a backup JSON (future)
 *
 * SUPER_ADMIN only.
 * No sensitive credentials are included in the backup (no SiteSetting sys_* keys).
 */

import prisma from '../config/db.js'

// Tables available for backup — display name + prisma model key
const BACKUP_TABLES = {
  services: {
    label: 'Services',
    fetch: () => prisma.service.findMany({ orderBy: { order: 'asc' } }),
  },
  projects: {
    label: 'Projects',
    fetch: () => prisma.project.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  team: {
    label: 'Team Members',
    fetch: () => prisma.teamMember.findMany({ orderBy: { order: 'asc' } }),
  },
  testimonials: {
    label: 'Testimonials',
    fetch: () => prisma.testimonial.findMany({ orderBy: { order: 'asc' } }),
  },
  faqs: { label: 'FAQs', fetch: () => prisma.faq.findMany({ orderBy: { order: 'asc' } }) },
  milestones: {
    label: 'Milestones',
    fetch: () => prisma.milestone.findMany({ orderBy: { order: 'asc' } }),
  },
  partners: {
    label: 'Partners',
    fetch: () => prisma.partner.findMany({ orderBy: { order: 'asc' } }),
  },
  leads: {
    label: 'Contact Leads',
    fetch: () => prisma.contactLead.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  careers: {
    label: 'Job Postings',
    fetch: () => prisma.jobPosting.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  applications: {
    label: 'Applications',
    fetch: () => prisma.jobApplication.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  legal: { label: 'Legal Pages', fetch: () => prisma.legalPage.findMany() },
  siteSettings: {
    label: 'Site Settings',
    fetch: () =>
      prisma.siteSetting.findMany({
        // Exclude all sys_* keys — these contain credentials
        where: { key: { not: { startsWith: 'sys_' } } },
      }),
  },
  clientProjects: {
    label: 'Client Projects',
    fetch: () => prisma.clientProject.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  workTasks: {
    label: 'Work Tasks',
    fetch: () => prisma.workTask.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  quickNotes: {
    label: 'Quick Notes',
    fetch: () => prisma.quickNote.findMany({ orderBy: { createdAt: 'desc' } }),
  },
  activityLogs: {
    label: 'Activity Logs',
    fetch: () => prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' } }),
  },
}

/**
 * GET /api/admin/backup
 * Query param: ?tables=services,projects,team  (comma-separated, defaults to all)
 * Returns a JSON file download.
 */
export const downloadBackup = async (req, res, next) => {
  try {
    const requested = req.query.tables
      ? req.query.tables
          .split(',')
          .map((t) => t.trim())
          .filter((t) => BACKUP_TABLES[t])
      : Object.keys(BACKUP_TABLES)

    if (requested.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No valid tables specified.' })
    }

    // Fetch all requested tables in parallel
    const results = await Promise.allSettled(
      requested.map(async (key) => {
        const data = await BACKUP_TABLES[key].fetch()
        return { key, label: BACKUP_TABLES[key].label, count: data.length, data }
      })
    )

    const tables = {}
    const summary = []

    for (const result of results) {
      if (result.status === 'fulfilled') {
        const { key, label, count, data } = result.value
        tables[key] = data
        summary.push({ table: key, label, count })
      }
    }

    const backup = {
      meta: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        generatedBy: req.admin?.email || 'admin',
        project: 'SnapTech Digital',
        tablesIncluded: summary,
        totalRecords: summary.reduce((acc, t) => acc + t.count, 0),
        note: 'Sensitive credentials (sys_* site settings) are excluded from this backup.',
      },
      tables,
    }

    const format = req.query.format || 'json'
    const dateStr = new Date().toISOString().slice(0, 10)

    if (format === 'sql') {
      const filename = `snaptech-backup-${dateStr}.sql`
      
      const escapeSql = (val) => {
        if (val === null || val === undefined) return 'NULL'
        if (typeof val === 'boolean') return val ? 'true' : 'false'
        if (typeof val === 'number') return String(val)
        if (val instanceof Date) return `'${val.toISOString()}'`
        if (typeof val === 'string') {
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) {
            return `'${val}'`
          }
          return `'${val.replace(/'/g, "''")}'`
        }
        if (typeof val === 'object') {
          if (Array.isArray(val)) {
            const elements = val.map(el => {
              if (typeof el === 'string') return `'${el.replace(/'/g, "''")}'`
              return String(el)
            }).join(', ')
            return `ARRAY[${elements}]`
          }
          return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`
        }
        return `'${String(val).replace(/'/g, "''")}'`
      }

      const TABLE_DB_NAMES = {
        services: 'services',
        projects: 'projects',
        team: 'team_members',
        testimonials: 'testimonials',
        faqs: 'faqs',
        milestones: 'milestones',
        partners: 'partners',
        leads: 'contact_leads',
        careers: 'job_postings',
        applications: 'job_applications',
        legal: 'legal_pages',
        siteSettings: 'site_settings',
        clientProjects: 'client_projects',
        workTasks: 'work_tasks',
        quickNotes: 'quick_notes',
        activityLogs: 'activity_logs',
      }

      let sql = `-- SnapTech Digital Database Backup Dump\n`
      sql += `-- Generated at: ${new Date().toISOString()}\n`
      sql += `-- Generated by: ${req.admin?.email || 'admin'}\n\n`
      sql += `BEGIN;\n\n`

      for (const key of requested) {
        const dbName = TABLE_DB_NAMES[key] || key
        const data = tables[key] || []
        if (data.length === 0) continue

        sql += `-- Table: ${dbName} (${data.length} records)\n`
        sql += `TRUNCATE TABLE "${dbName}" CASCADE;\n`

        const columns = Object.keys(data[0])
        for (const row of data) {
          const colsStr = columns.map(c => `"${c}"`).join(', ')
          const valsStr = columns.map(c => escapeSql(row[c])).join(', ')
          sql += `INSERT INTO "${dbName}" (${colsStr}) VALUES (${valsStr});\n`
        }
        sql += `\n`
      }
      sql += `COMMIT;\n`

      res.setHeader('Content-Type', 'text/plain')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.send(sql)
    }

    if (format === 'html') {
      const filename = `snaptech-backup-${dateStr}.html`
      const jsonStr = JSON.stringify(backup)
      
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapTech Digital - Offline Data Backup</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#1A3E8C',
              red: '#E31E24',
            }
          }
        }
      }
    }
  </script>
</head>
<body class="bg-slate-50 text-slate-800 min-h-screen flex flex-col">
  <header class="bg-gradient-to-r from-brand-blue to-[#0f2660] text-white py-6 px-8 shadow-md">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold">SnapTech Digital</h1>
        <p class="text-sm text-blue-200 mt-1">Offline Database Backup & Report</p>
      </div>
      <div class="text-xs md:text-right text-blue-100 space-y-1">
        <p>Generated At: <span class="font-bold text-white" id="meta-time"></span></p>
        <p>Generated By: <span class="font-bold text-white" id="meta-by"></span></p>
        <p>Total Records: <span class="font-bold text-white" id="meta-count"></span></p>
      </div>
    </div>
  </header>

  <main class="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col lg:flex-row gap-8">
    <div class="w-full lg:w-64 shrink-0 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-2 h-fit">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2">Tables</h2>
      <nav id="table-tabs" class="flex flex-col gap-1"></nav>
    </div>

    <div class="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
      <div class="p-4 bg-slate-50/60 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <h3 id="current-tab-title" class="text-base font-bold text-slate-800">Select a table</h3>
        <div class="relative w-full md:w-80">
          <input type="text" id="search-input" placeholder="Search rows..." class="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue" />
        </div>
      </div>

      <div class="flex-1 overflow-x-auto">
        <table class="w-full text-left border-collapse text-sm">
          <thead id="table-head" class="bg-slate-150 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-250"></thead>
          <tbody id="table-body" class="divide-y divide-slate-150"></tbody>
        </table>
        <div id="empty-state" class="hidden p-16 text-center text-slate-400 space-y-2">
          <p class="font-semibold">No records found</p>
          <p class="text-xs">Try adjusting your search criteria.</p>
        </div>
      </div>
    </div>
  </main>

  <footer class="bg-white border-t border-slate-200 py-4 px-8 text-center text-xs text-slate-400">
    <p>SnapTech Digital Database Backup Report. Excludes sensitive credentials. Internal Use Only.</p>
  </footer>

  <script>
    const DATA = ${jsonStr};

    document.getElementById('meta-time').innerText = new Date(DATA.meta.generatedAt).toLocaleString();
    document.getElementById('meta-by').innerText = DATA.meta.generatedBy;
    document.getElementById('meta-count').innerText = DATA.meta.totalRecords;

    let activeTable = '';
    let searchQuery = '';

    const tabsContainer = document.getElementById('table-tabs');
    const tabTitle = document.getElementById('current-tab-title');
    const tableHead = document.getElementById('table-head');
    const tableBody = document.getElementById('table-body');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');

    DATA.meta.tablesIncluded.forEach(t => {
      if (!activeTable) activeTable = t.table;
      const btn = document.createElement('button');
      btn.className = \`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors \${activeTable === t.table ? 'bg-brand-blue text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}\`;
      btn.innerHTML = \`<span>\${t.label}</span><span class="\${activeTable === t.table ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'} px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">\${t.count}</span>\`;
      btn.onclick = () => {
        Array.from(tabsContainer.children).forEach(child => {
          child.className = 'flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors hover:bg-slate-100 text-slate-600';
          child.querySelector('span:last-child').className = 'bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono text-[10px] font-bold';
        });
        btn.className = 'flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors bg-brand-blue text-white shadow-sm';
        btn.querySelector('span:last-child').className = 'bg-white/20 text-white px-2 py-0.5 rounded-full font-mono text-[10px] font-bold';
        
        activeTable = t.table;
        searchQuery = '';
        searchInput.value = '';
        renderTable();
      };
      tabsContainer.appendChild(btn);
    });

    function renderTable() {
      const tableInfo = DATA.meta.tablesIncluded.find(t => t.table === activeTable);
      tabTitle.innerText = tableInfo ? tableInfo.label : 'Data Table';
      
      const rows = DATA.tables[activeTable] || [];
      const filtered = rows.filter(row => {
        if (!searchQuery) return true;
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchQuery.toLowerCase())
        );
      });

      if (filtered.length === 0) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
      }
      emptyState.classList.add('hidden');

      const cols = Object.keys(filtered[0]);
      tableHead.innerHTML = \`<tr>\${cols.map(col => \`<th class="px-6 py-3.5">\${col}</th>\`).join('')}</tr>\`;

      tableBody.innerHTML = filtered.map(row => {
        return \`<tr class="hover:bg-slate-50/50 transition-colors border-b border-slate-100">\${cols.map(col => {
          const val = row[col];
          let displayVal = val;
          if (val === null || val === undefined) displayVal = '<span class="text-slate-350 italic">null</span>';
          else if (typeof val === 'boolean') displayVal = val ? '<span class="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-250">true</span>' : '<span class="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-slate-200">false</span>';
          else if (typeof val === 'object') displayVal = \`<pre class="max-w-[300px] overflow-x-auto text-[10px] font-mono bg-slate-50 p-1.5 border border-slate-100 rounded leading-tight">\${JSON.stringify(val, null, 2)}</pre>\`;
          else if (typeof val === 'string' && val.startsWith('http')) displayVal = \`<a href="\${val}" target="_blank" class="text-brand-blue hover:underline break-all truncate max-w-[200px] inline-block">\${val}</a>\`;
          else if (col.toLowerCase().includes('time') || col.toLowerCase().includes('at')) {
            try {
              displayVal = new Date(val).toLocaleString();
            } catch {}
          }
          return \`<td class="px-6 py-4 max-w-[400px] truncate align-top">\${displayVal}</td>\`;
        }).join('')}</tr>\`;
      }).join('');
    }

    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      renderTable();
    };

    renderTable();
  </script>
</body>
</html>`;

      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      return res.send(htmlContent)
    }

    const filename = `snaptech-backup-${dateStr}.json`
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(JSON.stringify(backup, null, 2))
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/admin/backup/tables
 * Returns list of available tables with record counts.
 */
export const getBackupTableInfo = async (req, res, next) => {
  try {
    const counts = await Promise.allSettled(
      Object.entries(BACKUP_TABLES).map(async ([key, cfg]) => {
        const data = await cfg.fetch()
        return { key, label: cfg.label, count: data.length }
      })
    )

    const tables = counts.filter((r) => r.status === 'fulfilled').map((r) => r.value)

    res.json({ status: 'ok', data: tables })
  } catch (err) {
    next(err)
  }
}
