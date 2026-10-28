import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
export class TestD1 {
  constructor(path = ':memory:', migrate = true) {
    this.sqlite = new DatabaseSync(path);
    this.sqlite.exec('PRAGMA foreign_keys=ON');
    if (migrate) this.sqlite.exec(readFileSync(new URL('../server/migrations/0001_replies.sql', import.meta.url), 'utf8'));
  }
  prepare(sql) {
    const db = this.sqlite;
    function statement(args = []) {
      function execute() {
        const results = db.prepare(sql).all(...args).map((row) => ({ ...row }));
        return { results, success: true, meta: { changes: db.prepare('SELECT changes() AS n').get().n } };
      }
      return { bind: (...values) => statement(values), first: async () => execute().results[0] || null, all: async () => execute(), run: async () => execute(), execute };
    }
    return statement();
  }
  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try { const result = statements.map((statement) => statement.execute()); this.sqlite.exec('COMMIT'); return result; }
    catch (error) { this.sqlite.exec('ROLLBACK'); throw error; }
  }
  close() { this.sqlite.close(); }
}
