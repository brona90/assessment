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

  it('strips UTF-8 BOM from input', () => {
    const result = parseCsv('\uFEFFa,b\n1,2');
    expect(result[0]).toHaveProperty('a', '1');
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

  it('prefixes formula-injection characters with single quote', () => {
    const csv = generateCsv([{ a: '=CMD()', b: '+1', c: '-1', d: '@sum' }], ['a', 'b', 'c', 'd']);
    expect(csv).toContain("'=CMD()");
    expect(csv).toContain("'+1");
    expect(csv).toContain("'-1");
    expect(csv).toContain("'@sum");
  });
});

describe('downloadCsv', () => {
  beforeEach(() => {
    const mockUrl = 'blob:test';
    globalThis.URL.createObjectURL = vi.fn(() => mockUrl);
    globalThis.URL.revokeObjectURL = vi.fn();
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

// ─── Additional branch coverage tests ─────────────────────────────────────

describe('parseCsv - additional branches', () => {
  it('handles quoted fields containing newlines', () => {
    const result = parseCsv('name,desc\nAlice,"line1\nline2"');
    expect(result[0].desc).toBe('line1\nline2');
  });

  it('handles bare \\r line endings', () => {
    const result = parseCsv('a,b\r1,2\r3,4');
    expect(result).toHaveLength(2);
    expect(result[0].a).toBe('1');
  });

  it('handles header-only CSV (no data rows)', () => {
    const result = parseCsv('a,b,c');
    expect(result).toEqual([]);
  });

  it('handles rows with fewer values than headers', () => {
    const result = parseCsv('a,b,c\n1');
    expect(result[0].a).toBe('1');
    expect(result[0].b).toBe('');
    expect(result[0].c).toBe('');
  });

  it('trims whitespace from headers and values', () => {
    const result = parseCsv(' name , value \n Alice , 42 ');
    expect(result[0]).toHaveProperty('name', 'Alice');
    expect(result[0]).toHaveProperty('value', '42');
  });
});

describe('generateCsv - additional branches', () => {
  it('escapes double quotes within field values', () => {
    const csv = generateCsv([{ a: 'say "hello"' }], ['a']);
    expect(csv).toBe('a\n"say ""hello"""');
  });

  it('quotes fields containing newlines', () => {
    const csv = generateCsv([{ a: 'line1\nline2' }], ['a']);
    expect(csv).toBe('a\n"line1\nline2"');
  });

  it('prefixes tab-starting values with single quote for injection protection', () => {
    const csv = generateCsv([{ a: '\tfoo' }], ['a']);
    expect(csv).toContain("'\tfoo");
  });

  it('handles missing column key in row object', () => {
    const csv = generateCsv([{ a: '1' }], ['a', 'b']);
    expect(csv).toBe('a,b\n1,');
  });
});

describe('downloadCsv - additional branches', () => {
  let mockA;
  beforeEach(() => {
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:test');
    globalThis.URL.revokeObjectURL = vi.fn();
    mockA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(mockA);
  });

  it('sets the correct filename on the download link', () => {
    downloadCsv('export.csv', [{ a: '1' }], ['a']);
    expect(mockA.download).toBe('export.csv');
    expect(mockA.href).toBe('blob:test');
  });

  it('works with empty rows', () => {
    downloadCsv('empty.csv', [], ['a', 'b']);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});

// ─── questionsToRows fallback branches ────────────────────────────────────

describe('questionsToRows - fallback branches', () => {
  it('falls back to empty string when domain.title is falsy', () => {
    const domains = {
      d1: {
        weight: 0.5,
        categories: {
          c1: { title: 'Cat', questions: [{ id: 'q1', text: 'Q?', requiresEvidence: false }] }
        }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows[0].domain_title).toBe('');
  });

  it('falls back to 1 when domain.weight is null/undefined', () => {
    const domains = {
      d1: {
        title: 'D',
        categories: {
          c1: { title: 'Cat', questions: [{ id: 'q1', text: 'Q?', requiresEvidence: false }] }
        }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows[0].domain_weight).toBe(1);
  });

  it('falls back to empty string when category.title is falsy', () => {
    const domains = {
      d1: {
        title: 'D', weight: 0.5,
        categories: {
          c1: { questions: [{ id: 'q1', text: 'Q?', requiresEvidence: false }] }
        }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows[0].category_title).toBe('');
  });

  it('falls back to empty string when question.id is falsy', () => {
    const domains = {
      d1: {
        title: 'D', weight: 0.5,
        categories: {
          c1: { title: 'Cat', questions: [{ text: 'Q?', requiresEvidence: false }] }
        }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows[0].question_id).toBe('');
  });

  it('falls back to empty string when question.text is falsy', () => {
    const domains = {
      d1: {
        title: 'D', weight: 0.5,
        categories: {
          c1: { title: 'Cat', questions: [{ id: 'q1', requiresEvidence: false }] }
        }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows[0].question_text).toBe('');
  });

  it('handles domain with no categories key', () => {
    const domains = { d1: { title: 'D', weight: 0.5 } };
    const rows = questionsToRows(domains);
    expect(rows).toEqual([]);
  });

  it('handles category with no questions key', () => {
    const domains = {
      d1: {
        title: 'D', weight: 0.5,
        categories: { c1: { title: 'Cat' } }
      }
    };
    const rows = questionsToRows(domains);
    expect(rows).toEqual([]);
  });
});

// ─── rowsToQuestions fallback branches ────────────────────────────────────

describe('rowsToQuestions - fallback branches', () => {
  it('uses domain_id as title when domain_title is empty', () => {
    const rows = [{ domain_id: 'myDomain', domain_title: '', domain_weight: '1', category_id: 'c1', category_title: 'Cat', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }];
    const result = rowsToQuestions(rows);
    expect(result.myDomain.title).toBe('myDomain');
  });

  it('defaults domain weight to 1 when domain_weight is non-numeric', () => {
    const rows = [{ domain_id: 'd1', domain_title: 'D', domain_weight: 'abc', category_id: 'c1', category_title: 'Cat', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }];
    const result = rowsToQuestions(rows);
    expect(result.d1.weight).toBe(1);
  });

  it('uses category_id as title when category_title is empty', () => {
    const rows = [{ domain_id: 'd1', domain_title: 'D', domain_weight: '1', category_id: 'myCat', category_title: '', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }];
    const result = rowsToQuestions(rows);
    expect(result.d1.categories.myCat.title).toBe('myCat');
  });

  it('defaults question_text to empty string when missing', () => {
    const rows = [{ domain_id: 'd1', domain_title: 'D', domain_weight: '1', category_id: 'c1', category_title: 'Cat', question_id: 'q1', question_text: '', requires_evidence: 'false' }];
    const result = rowsToQuestions(rows);
    expect(result.d1.categories.c1.questions[0].text).toBe('');
  });

  it('sets requiresEvidence false when requires_evidence is not "true"', () => {
    const rows = [{ domain_id: 'd1', domain_title: 'D', domain_weight: '1', category_id: 'c1', category_title: 'Cat', question_id: 'q1', question_text: 'Q?', requires_evidence: 'false' }];
    const result = rowsToQuestions(rows);
    expect(result.d1.categories.c1.questions[0].requiresEvidence).toBe(false);
  });

  it('skips rows where question_id is falsy but domain_id is present', () => {
    const rows = [{ domain_id: 'd1', question_id: '' }];
    const result = rowsToQuestions(rows);
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('adds multiple questions to the same category', () => {
    const rows = [
      { domain_id: 'd1', domain_title: 'D', domain_weight: '0.5', category_id: 'c1', category_title: 'Cat', question_id: 'q1', question_text: 'Q1?', requires_evidence: 'true' },
      { domain_id: 'd1', domain_title: 'D', domain_weight: '0.5', category_id: 'c1', category_title: 'Cat', question_id: 'q2', question_text: 'Q2?', requires_evidence: 'false' }
    ];
    const result = rowsToQuestions(rows);
    expect(result.d1.categories.c1.questions).toHaveLength(2);
  });
});

// ─── usersToRows fallback branches ────────────────────────────────────────

describe('usersToRows - fallback branches', () => {
  it('falls back for missing user fields', () => {
    const rows = usersToRows([{}]);
    expect(rows[0].id).toBe('');
    expect(rows[0].name).toBe('');
    expect(rows[0].email).toBe('');
    expect(rows[0].role).toBe('user');
    expect(rows[0].title).toBe('');
    expect(rows[0].assigned_question_ids).toBe('');
  });

  it('handles user with undefined assignedQuestions', () => {
    const rows = usersToRows([{ id: 'u1', name: 'Test' }]);
    expect(rows[0].assigned_question_ids).toBe('');
  });
});

// ─── rowsToUsers fallback branches ────────────────────────────────────────

describe('rowsToUsers - fallback branches', () => {
  it('falls back name to id when name is empty', () => {
    const rows = [{ id: 'u1', name: '', email: '', role: '', title: '', assigned_question_ids: '' }];
    const result = rowsToUsers(rows);
    expect(result[0].name).toBe('u1');
  });

  it('falls back role to user when role is empty', () => {
    const rows = [{ id: 'u1', name: 'Alice', email: '', role: '', title: '', assigned_question_ids: '' }];
    const result = rowsToUsers(rows);
    expect(result[0].role).toBe('user');
  });

  it('falls back email and title to empty string when missing', () => {
    const rows = [{ id: 'u1', name: 'Alice' }];
    const result = rowsToUsers(rows);
    expect(result[0].email).toBe('');
    expect(result[0].title).toBe('');
  });

  it('returns empty assignedQuestions when assigned_question_ids is falsy', () => {
    const rows = [{ id: 'u1', name: 'Alice', assigned_question_ids: '' }];
    const result = rowsToUsers(rows);
    expect(result[0].assignedQuestions).toEqual([]);
  });

  it('trims and filters blank entries in assigned_question_ids', () => {
    const rows = [{ id: 'u1', name: 'Alice', assigned_question_ids: 'q1 | | q2' }];
    const result = rowsToUsers(rows);
    expect(result[0].assignedQuestions).toEqual(['q1', 'q2']);
  });
});

// ─── domainsToRows fallback branches ──────────────────────────────────────

describe('domainsToRows - fallback branches', () => {
  it('handles null input', () => {
    expect(domainsToRows(null)).toEqual([]);
  });

  it('falls back title to empty string when domain.title is falsy', () => {
    const rows = domainsToRows({ d1: { weight: 0.5 } });
    expect(rows[0].title).toBe('');
  });

  it('falls back weight to 1 when domain.weight is null/undefined', () => {
    const rows = domainsToRows({ d1: { title: 'D' } });
    expect(rows[0].weight).toBe(1);
  });
});

// ─── rowsToDomains fallback branches ──────────────────────────────────────

describe('rowsToDomains - fallback branches', () => {
  it('falls back title to id when title is empty', () => {
    const result = rowsToDomains([{ id: 'myId', title: '', weight: '0.5' }]);
    expect(result.myId.title).toBe('myId');
  });

  it('defaults weight to 1 when weight is non-numeric', () => {
    const result = rowsToDomains([{ id: 'd1', title: 'D', weight: 'notanumber' }]);
    expect(result.d1.weight).toBe(1);
  });

  it('defaults weight to 1 when weight is empty string', () => {
    const result = rowsToDomains([{ id: 'd1', title: 'D', weight: '' }]);
    expect(result.d1.weight).toBe(1);
  });
});

// ─── frameworksToRows fallback branches ───────────────────────────────────

describe('frameworksToRows - fallback branches', () => {
  it('falls back for missing framework fields', () => {
    const rows = frameworksToRows([{}]);
    expect(rows[0].id).toBe('');
    expect(rows[0].name).toBe('');
    expect(rows[0].enabled).toBe('false');
    expect(rows[0].category).toBe('');
    expect(rows[0].threshold).toBe('');
    expect(rows[0].color).toBe('');
    expect(rows[0].icon).toBe('');
    expect(rows[0].description).toBe('');
    expect(rows[0].mapped_question_ids).toBe('');
  });

  it('uses f.questions as fallback when f.mappedQuestions is falsy', () => {
    const rows = frameworksToRows([{
      id: 'f1', name: 'F', enabled: true,
      questions: ['q1', 'q3']
    }]);
    expect(rows[0].mapped_question_ids).toBe('q1|q3');
  });

  it('sets enabled to "false" when framework is disabled', () => {
    const rows = frameworksToRows([{ id: 'f1', enabled: false }]);
    expect(rows[0].enabled).toBe('false');
  });

  it('handles threshold of 0 (falsy but valid)', () => {
    const rows = frameworksToRows([{ id: 'f1', threshold: 0 }]);
    expect(rows[0].threshold).toBe(0);
  });
});

// ─── rowsToFrameworks fallback branches ───────────────────────────────────

describe('rowsToFrameworks - fallback branches', () => {
  it('falls back name to id when name is empty', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: '', enabled: 'false', category: '', threshold: '', color: '', icon: '', description: '', mapped_question_ids: '' }]);
    expect(result[0].name).toBe('f1');
  });

  it('sets enabled to false when value is not "true"', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F', enabled: 'false' }]);
    expect(result[0].enabled).toBe(false);
  });

  it('sets threshold to undefined when threshold is empty', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F', threshold: '' }]);
    expect(result[0].threshold).toBeUndefined();
  });

  it('falls back category, color, icon, description to empty string', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F' }]);
    expect(result[0].category).toBe('');
    expect(result[0].color).toBe('');
    expect(result[0].icon).toBe('');
    expect(result[0].description).toBe('');
  });

  it('returns empty mappedQuestions when mapped_question_ids is falsy', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F', mapped_question_ids: '' }]);
    expect(result[0].mappedQuestions).toEqual([]);
  });

  it('trims and filters blank entries in mapped_question_ids', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F', mapped_question_ids: 'q1 | | q2' }]);
    expect(result[0].mappedQuestions).toEqual(['q1', 'q2']);
  });

  it('parses threshold as float', () => {
    const result = rowsToFrameworks([{ id: 'f1', name: 'F', threshold: '3.5' }]);
    expect(result[0].threshold).toBe(3.5);
  });
});
