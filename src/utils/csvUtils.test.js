import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseCsv,
  generateCsv,
  downloadCsv,
  questionsToRows, rowsToQuestions,
  usersToRows, rowsToUsers,
  domainsToRows, rowsToDomains,
  frameworksToRows, rowsToFrameworks,
  QUESTIONS_COLUMNS, USERS_COLUMNS
} from './csvUtils';

describe('parseCsv', () => {
  it('parses simple CSV', () => {
    const result = parseCsv('a,b,c\n1,2,3');
    expect(result).toEqual([{ a: '1', b: '2', c: '3' }]);
  });

  it('handles quoted fields with commas', () => {
    const result = parseCsv('name,desc\nAlice,"has,comma"');
    expect(result[0].desc).toBe('has,comma');
  });

  it('handles escaped quotes', () => {
    const result = parseCsv('name\n"say ""hi"""');
    expect(result[0].name).toBe('say "hi"');
  });

  it('skips blank rows', () => {
    const result = parseCsv('a,b\n1,2\n\n3,4');
    expect(result).toHaveLength(2);
  });

  it('returns empty array for empty string', () => {
    expect(parseCsv('')).toEqual([]);
  });

  it('handles Windows line endings', () => {
    const result = parseCsv('a,b\r\n1,2\r\n3,4');
    expect(result).toHaveLength(2);
  });
});

describe('generateCsv', () => {
  it('generates header and rows', () => {
    const csv = generateCsv([{ a: '1', b: '2' }], ['a', 'b']);
    expect(csv).toBe('a,b\n1,2');
  });

  it('quotes fields with commas', () => {
    const csv = generateCsv([{ a: 'x,y' }], ['a']);
    expect(csv).toBe('a\n"x,y"');
  });

  it('only emits header when no rows', () => {
    expect(generateCsv([], ['a', 'b'])).toBe('a,b');
  });

  it('handles null/undefined values', () => {
    const csv = generateCsv([{ a: null, b: undefined }], ['a', 'b']);
    expect(csv).toBe('a,b\n,');
  });
});

describe('downloadCsv', () => {
  beforeEach(() => {
    const mockUrl = 'blob:test';
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = vi.fn();
    const mockA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockA);
  });

  it('creates a link and triggers click', () => {
    downloadCsv('test.csv', [{ a: '1' }], ['a']);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

// ─── Questions ─────────────────────────────────────────────────────────────

const sampleDomains = {
  domain1: {
    title: 'Platform',
    weight: 0.3,
    categories: {
      cat1: {
        title: 'Pipelines',
        questions: [
          { id: 'q1', text: 'How mature?', requiresEvidence: true },
          { id: 'q2', text: 'How monitored?', requiresEvidence: false }
        ]
      }
    }
  }
};

describe('questionsToRows', () => {
  it('flattens domains to rows', () => {
    const rows = questionsToRows(sampleDomains);
    expect(rows).toHaveLength(2);
    expect(rows[0].domain_id).toBe('domain1');
    expect(rows[0].category_id).toBe('cat1');
    expect(rows[0].question_id).toBe('q1');
    expect(rows[0].requires_evidence).toBe('true');
    expect(rows[1].requires_evidence).toBe('false');
  });

  it('handles empty input', () => {
    expect(questionsToRows({})).toEqual([]);
    expect(questionsToRows(null)).toEqual([]);
  });

  it('produces all expected columns', () => {
    const rows = questionsToRows(sampleDomains);
    QUESTIONS_COLUMNS.forEach(col => {
      expect(rows[0]).toHaveProperty(col);
    });
  });
});

describe('rowsToQuestions', () => {
  it('rebuilds domains structure', () => {
    const rows = questionsToRows(sampleDomains);
    const rebuilt = rowsToQuestions(rows);
    expect(rebuilt.domain1.title).toBe('Platform');
    expect(rebuilt.domain1.categories.cat1.questions).toHaveLength(2);
    expect(rebuilt.domain1.categories.cat1.questions[0].id).toBe('q1');
    expect(rebuilt.domain1.categories.cat1.questions[0].requiresEvidence).toBe(true);
  });

  it('skips rows without domain_id or question_id', () => {
    const result = rowsToQuestions([{ domain_id: '', question_id: 'q1' }]);
    expect(Object.keys(result)).toHaveLength(0);
  });
});

// ─── Users ─────────────────────────────────────────────────────────────────

const sampleUsers = [
  { id: 'u1', name: 'Alice', email: 'a@a.com', role: 'user', title: 'Engineer', assignedQuestions: ['q1', 'q2'] },
  { id: 'u2', name: 'Bob', email: 'b@b.com', role: 'admin', title: 'Manager', assignedQuestions: [] }
];

describe('usersToRows', () => {
  it('converts user array to rows', () => {
    const rows = usersToRows(sampleUsers);
    expect(rows).toHaveLength(2);
    expect(rows[0].assigned_question_ids).toBe('q1|q2');
    expect(rows[1].assigned_question_ids).toBe('');
  });

  it('handles empty input', () => {
    expect(usersToRows([])).toEqual([]);
    expect(usersToRows(null)).toEqual([]);
  });
});

describe('rowsToUsers', () => {
  it('rebuilds users from rows', () => {
    const rows = usersToRows(sampleUsers);
    const rebuilt = rowsToUsers(rows);
    expect(rebuilt).toHaveLength(2);
    expect(rebuilt[0].assignedQuestions).toEqual(['q1', 'q2']);
    expect(rebuilt[1].assignedQuestions).toEqual([]);
  });

  it('skips rows without id', () => {
    expect(rowsToUsers([{ id: '', name: 'Ghost' }])).toHaveLength(0);
  });
});

// ─── Domains ───────────────────────────────────────────────────────────────

describe('domainsToRows', () => {
  it('converts domain object to rows', () => {
    const rows = domainsToRows(sampleDomains);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toEqual({ id: 'domain1', title: 'Platform', weight: 0.3 });
  });
});

describe('rowsToDomains', () => {
  it('rebuilds domains from rows', () => {
    const rows = domainsToRows(sampleDomains);
    const rebuilt = rowsToDomains(rows);
    expect(rebuilt.domain1.title).toBe('Platform');
    expect(rebuilt.domain1.weight).toBe(0.3);
    expect(rebuilt.domain1.categories).toEqual({});
  });

  it('skips rows without id', () => {
    expect(rowsToDomains([{ id: '', title: 'Empty' }])).toEqual({});
  });
});

// ─── Frameworks ─────────────────────────────────────────────────────────────

const sampleFrameworks = [
  {
    id: 'iso', name: 'ISO 27001', enabled: true,
    category: 'Security', threshold: 3, color: '#22c55e',
    icon: '🔒', description: 'InfoSec', mappedQuestions: ['q1', 'q2']
  }
];

describe('frameworksToRows', () => {
  it('converts framework array to rows', () => {
    const rows = frameworksToRows(sampleFrameworks);
    expect(rows).toHaveLength(1);
    expect(rows[0].enabled).toBe('true');
    expect(rows[0].mapped_question_ids).toBe('q1|q2');
  });

  it('handles empty input', () => {
    expect(frameworksToRows([])).toEqual([]);
    expect(frameworksToRows(null)).toEqual([]);
  });
});

describe('rowsToFrameworks', () => {
  it('rebuilds frameworks from rows', () => {
    const rows = frameworksToRows(sampleFrameworks);
    const rebuilt = rowsToFrameworks(rows);
    expect(rebuilt).toHaveLength(1);
    expect(rebuilt[0].enabled).toBe(true);
    expect(rebuilt[0].mappedQuestions).toEqual(['q1', 'q2']);
    expect(rebuilt[0].threshold).toBe(3);
  });

  it('skips rows without id', () => {
    expect(rowsToFrameworks([{ id: '', name: 'Ghost' }])).toHaveLength(0);
  });
});

// ─── Roundtrip ────────────────────────────────────────────────────────────

describe('CSV roundtrip', () => {
  it('questions survive parse→generate→parse', () => {
    const rows = questionsToRows(sampleDomains);
    const csv = generateCsv(rows, QUESTIONS_COLUMNS);
    const parsed = parseCsv(csv);
    const rebuilt = rowsToQuestions(parsed);
    expect(rebuilt.domain1.categories.cat1.questions).toHaveLength(2);
  });

  it('users survive parse→generate→parse', () => {
    const rows = usersToRows(sampleUsers);
    const csv = generateCsv(rows, USERS_COLUMNS);
    const parsed = parseCsv(csv);
    const rebuilt = rowsToUsers(parsed);
    expect(rebuilt[0].assignedQuestions).toEqual(['q1', 'q2']);
  });
});
