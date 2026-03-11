import { useState, useRef } from 'react';
import { HelpCircle, Users, FolderOpen, Lock, Download, ClipboardList, Upload } from 'lucide-react';
import { useDataStore } from '../hooks/useDataStore';
import {
  downloadCsv,
  questionsToRows, rowsToQuestions,
  usersToRows, rowsToUsers,
  domainsToRows, rowsToDomains,
  frameworksToRows, rowsToFrameworks,
  QUESTIONS_COLUMNS, USERS_COLUMNS, DOMAINS_COLUMNS, FRAMEWORKS_COLUMNS,
  parseCsv, TEMPLATE_ROWS
} from '../utils/csvUtils';
import './CSVImportExport.css';

const ENTITIES = [
  { key: 'questions', label: 'Questions', Icon: HelpCircle, columns: QUESTIONS_COLUMNS },
  { key: 'users',     label: 'Users',     Icon: Users,      columns: USERS_COLUMNS },
  { key: 'domains',   label: 'Domains',   Icon: FolderOpen, columns: DOMAINS_COLUMNS },
  { key: 'frameworks',label: 'Frameworks',Icon: Lock,       columns: FRAMEWORKS_COLUMNS }
];

function useExportHandlers(ds) {
  function exportQuestions() {
    const rows = questionsToRows(ds.getDomains());
    downloadCsv('questions.csv', rows, QUESTIONS_COLUMNS);
  }
  function exportUsers() {
    const rows = usersToRows(ds.getUsers());
    downloadCsv('users.csv', rows, USERS_COLUMNS);
  }
  function exportDomains() {
    const rows = domainsToRows(ds.getDomains());
    downloadCsv('domains.csv', rows, DOMAINS_COLUMNS);
  }
  function exportFrameworks() {
    const rows = frameworksToRows(ds.getFrameworks());
    downloadCsv('frameworks.csv', rows, FRAMEWORKS_COLUMNS);
  }
  return { exportQuestions, exportUsers, exportDomains, exportFrameworks };
}

function downloadTemplate(key) {
  const entity = ENTITIES.find(e => e.key === key);
  downloadCsv(`${key}-template.csv`, TEMPLATE_ROWS[key], entity.columns);
}

async function importFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function validateColumns(rows, required) {
  if (rows.length === 0) return 'CSV has no data rows.';
  const present = Object.keys(rows[0]);
  const missing = required.filter(c => !present.includes(c));
  if (missing.length) return `Missing columns: ${missing.join(', ')}`;
  return null;
}

export const CSVImportExport = () => {
  const ds = useDataStore();
  const exporters = useExportHandlers(ds);

  const [importStatus, setImportStatus] = useState({});
  const fileRefs = useRef({});

  const setStatus = (key, msg, type = 'info') => {
    setImportStatus(prev => ({ ...prev, [key]: { msg, type } }));
  };

  async function handleImport(key, file) {
    setStatus(key, 'Reading file…');
    let text;
    try {
      text = await importFile(file);
    } catch {
      setStatus(key, 'Could not read file.', 'error');
      return;
    }

    const rows = parseCsv(text);
    const entity = ENTITIES.find(e => e.key === key);
    const err = validateColumns(rows, entity.columns);
    if (err) {
      setStatus(key, err, 'error');
      return;
    }

    try {
      if (key === 'questions') {
        const domainsObj = rowsToQuestions(rows);
        let qCount = 0;
        Object.values(domainsObj).forEach(d =>
          Object.values(d.categories).forEach(c => (qCount += c.questions.length))
        );
        Object.entries(domainsObj).forEach(([domainId, domain]) => {
          Object.entries(domain.categories).forEach(([categoryId, cat]) => {
            cat.questions.forEach(q => {
              ds.addQuestion({ ...q, domainId, categoryId });
            });
          });
        });
        setStatus(key, `Imported ${qCount} questions across ${Object.keys(domainsObj).length} domains.`, 'success');
      } else if (key === 'users') {
        const users = rowsToUsers(rows);
        users.forEach(u => ds.addUser(u));
        setStatus(key, `Imported ${users.length} users.`, 'success');
      } else if (key === 'domains') {
        const domainsObj = rowsToDomains(rows);
        Object.entries(domainsObj).forEach(([id, d]) => ds.addDomain({ id, ...d }));
        setStatus(key, `Imported ${Object.keys(domainsObj).length} domains.`, 'success');
      } else if (key === 'frameworks') {
        const frameworks = rowsToFrameworks(rows);
        frameworks.forEach(f => ds.addFramework(f));
        setStatus(key, `Imported ${frameworks.length} frameworks.`, 'success');
      }
    } catch (e) {
      setStatus(key, `Import failed: ${e.message}`, 'error');
    }

    if (fileRefs.current[key]) fileRefs.current[key].value = '';
  }

  function handleExport(key) {
    exporters[`export${key.charAt(0).toUpperCase() + key.slice(1)}`]();
  }

  return (
    <section className="csv-import-export management-card" data-testid="csv-import-export">
      <h3>CSV Import / Export</h3>
      <p className="help-text">
        Download current data as CSV, edit in Excel/Sheets, then re-import.
        Templates show the required column format with example rows.
      </p>

      <div className="csv-entity-grid">
        {ENTITIES.map(({ key, label, Icon }) => {
          const status = importStatus[key];
          return (
            <div key={key} className="csv-entity-card" data-testid={`csv-entity-${key}`}>
              <div className="csv-entity-header">
                <span className="csv-entity-icon"><Icon size={20} /></span>
                <span className="csv-entity-label">{label}</span>
              </div>

              <div className="csv-entity-actions">
                <button
                  className="csv-btn csv-btn--export"
                  onClick={() => handleExport(key)}
                  data-testid={`csv-export-${key}`}
                  title={`Download current ${label} as CSV`}
                >
                  <Download size={14} /> Export
                </button>
                <button
                  className="csv-btn csv-btn--template"
                  onClick={() => downloadTemplate(key)}
                  data-testid={`csv-template-${key}`}
                  title={`Download example ${label} template`}
                >
                  <ClipboardList size={14} /> Template
                </button>
                <label
                  className="csv-btn csv-btn--import"
                  title={`Import ${label} from CSV`}
                  data-testid={`csv-import-label-${key}`}
                >
                  <Upload size={14} /> Import
                  <input
                    type="file"
                    accept=".csv"
                    className="csv-file-input"
                    ref={el => (fileRefs.current[key] = el)}
                    onChange={e => {
                      if (e.target.files[0]) handleImport(key, e.target.files[0]);
                    }}
                    data-testid={`csv-import-${key}`}
                  />
                </label>
              </div>

              {status && (
                <div
                  className={`csv-status csv-status--${status.type}`}
                  data-testid={`csv-status-${key}`}
                  role="status"
                >
                  {status.msg}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CSVImportExport;
