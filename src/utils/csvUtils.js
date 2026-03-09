/**
 * Pure CSV utilities: parse, generate, download, and entity converters.
 */

/**
 * Parse a CSV string into an array of row objects keyed by header names.
 * Handles quoted fields containing commas or newlines.
 */
export function parseCsv(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = splitCsvRows(lines);
  if (rows.length === 0) return [];
  const headers = parseRow(rows[0]);
  return rows.slice(1)
    .filter(r => r.trim() !== '')
    .map(r => {
      const values = parseRow(r);
      const obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = (values[i] ?? '').trim();
      });
      return obj;
    });
}

function splitCsvRows(text) {
  // Split on newlines that are NOT inside quoted fields.
  // Preserves raw characters (including quotes) so parseRow can process them.
  const rows = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === '\n' && !inQuotes) {
      rows.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) rows.push(current);
  return rows;
}

function parseRow(row) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Convert an array of row objects and a column list to a CSV string.
 */
export function generateCsv(rows, columns) {
  const escape = (v) => {
    const s = String(v ?? '');
    return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(',');
  const body = rows.map(r => columns.map(c => escape(r[c])).join(',')).join('\n');
  return body ? `${header}\n${body}` : header;
}

/**
 * Trigger a browser file download for a CSV string.
 */
export function downloadCsv(filename, rows, columns) {
  const csv = generateCsv(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Entity converters ────────────────────────────────────────────────────────

export const QUESTIONS_COLUMNS = [
  'domain_id', 'domain_title', 'domain_weight',
  'category_id', 'category_title',
  'question_id', 'question_text', 'requires_evidence'
];

/**
 * Convert domains object (from useDataStore().getDomains()) to flat question rows.
 */
export function questionsToRows(domainsObj) {
  const rows = [];
  Object.entries(domainsObj || {}).forEach(([domainId, domain]) => {
    Object.entries(domain.categories || {}).forEach(([catId, cat]) => {
      (cat.questions || []).forEach(q => {
        rows.push({
          domain_id: domainId,
          domain_title: domain.title || '',
          domain_weight: domain.weight ?? 1,
          category_id: catId,
          category_title: cat.title || '',
          question_id: q.id || '',
          question_text: q.text || '',
          requires_evidence: q.requiresEvidence ? 'true' : 'false'
        });
      });
    });
  });
  return rows;
}

/**
 * Convert flat question rows back to a domains object suitable for import.
 * Groups rows by domain_id → category_id → questions[].
 */
export function rowsToQuestions(rows) {
  const domains = {};
  rows.forEach(r => {
    const dId = r.domain_id;
    const cId = r.category_id;
    if (!dId || !r.question_id) return;
    if (!domains[dId]) {
      domains[dId] = {
        title: r.domain_title || dId,
        weight: parseFloat(r.domain_weight) || 1,
        categories: {}
      };
    }
    if (!domains[dId].categories[cId]) {
      domains[dId].categories[cId] = {
        title: r.category_title || cId,
        questions: []
      };
    }
    domains[dId].categories[cId].questions.push({
      id: r.question_id,
      text: r.question_text || '',
      requiresEvidence: r.requires_evidence === 'true'
    });
  });
  return domains;
}

export const USERS_COLUMNS = [
  'id', 'name', 'email', 'role', 'title', 'assigned_question_ids'
];

export function usersToRows(usersArray) {
  return (usersArray || []).map(u => ({
    id: u.id || '',
    name: u.name || '',
    email: u.email || '',
    role: u.role || 'user',
    title: u.title || '',
    assigned_question_ids: (u.assignedQuestions || []).join('|')
  }));
}

export function rowsToUsers(rows) {
  return rows
    .filter(r => r.id)
    .map(r => ({
      id: r.id,
      name: r.name || r.id,
      email: r.email || '',
      role: r.role || 'user',
      title: r.title || '',
      assignedQuestions: r.assigned_question_ids
        ? r.assigned_question_ids.split('|').map(s => s.trim()).filter(Boolean)
        : []
    }));
}

export const DOMAINS_COLUMNS = ['id', 'title', 'weight'];

export function domainsToRows(domainsObj) {
  return Object.entries(domainsObj || {}).map(([id, d]) => ({
    id,
    title: d.title || '',
    weight: d.weight ?? 1
  }));
}

export function rowsToDomains(rows) {
  const domains = {};
  rows.filter(r => r.id).forEach(r => {
    domains[r.id] = {
      title: r.title || r.id,
      weight: parseFloat(r.weight) || 1,
      categories: {}
    };
  });
  return domains;
}

export const FRAMEWORKS_COLUMNS = [
  'id', 'name', 'enabled', 'category', 'threshold', 'color', 'icon',
  'description', 'mapped_question_ids'
];

export function frameworksToRows(frameworksArray) {
  return (frameworksArray || []).map(f => ({
    id: f.id || '',
    name: f.name || '',
    enabled: f.enabled ? 'true' : 'false',
    category: f.category || '',
    threshold: f.threshold ?? '',
    color: f.color || '',
    icon: f.icon || '',
    description: f.description || '',
    mapped_question_ids: (f.mappedQuestions || f.questions || []).join('|')
  }));
}

export function rowsToFrameworks(rows) {
  return rows
    .filter(r => r.id)
    .map(r => ({
      id: r.id,
      name: r.name || r.id,
      enabled: r.enabled === 'true',
      category: r.category || '',
      threshold: r.threshold ? parseFloat(r.threshold) : undefined,
      color: r.color || '',
      icon: r.icon || '',
      description: r.description || '',
      mappedQuestions: r.mapped_question_ids
        ? r.mapped_question_ids.split('|').map(s => s.trim()).filter(Boolean)
        : []
    }));
}

// ─── Template rows ────────────────────────────────────────────────────────────

export const TEMPLATE_ROWS = {
  questions: [
    {
      domain_id: 'domain1', domain_title: 'Data Platform & Observability', domain_weight: '0.3',
      category_id: 'pipelines', category_title: 'Data Pipelines',
      question_id: 'q1', question_text: 'How mature is your pipeline automation?', requires_evidence: 'true'
    },
    {
      domain_id: 'domain1', domain_title: 'Data Platform & Observability', domain_weight: '0.3',
      category_id: 'pipelines', category_title: 'Data Pipelines',
      question_id: 'q2', question_text: 'How well do you monitor pipeline failures?', requires_evidence: 'false'
    }
  ],
  users: [
    { id: 'user1', name: 'Alice Smith', email: 'alice@example.com', role: 'user', title: 'Data Engineer', assigned_question_ids: 'q1|q2' },
    { id: 'admin1', name: 'Bob Jones', email: 'bob@example.com', role: 'admin', title: 'Head of Data', assigned_question_ids: '' }
  ],
  domains: [
    { id: 'domain1', title: 'Data Platform & Observability', weight: '0.3' },
    { id: 'domain2', title: 'Data Governance & Quality', weight: '0.25' }
  ],
  frameworks: [
    { id: 'iso27001', name: 'ISO 27001', enabled: 'true', category: 'Security', threshold: '3', color: '#3b82f6', icon: '🔒', description: 'Information security management', mapped_question_ids: 'q1|q2' },
    { id: 'gdpr', name: 'GDPR', enabled: 'false', category: 'Privacy', threshold: '4', color: '#10b981', icon: '🛡️', description: 'EU data protection regulation', mapped_question_ids: '' }
  ]
};
