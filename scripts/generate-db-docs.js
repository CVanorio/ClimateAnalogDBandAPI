#!/usr/bin/env node
/**
 * Generate Markdown docs from a MySQL schema dump.
 * Input : docs/db-dump.sql
 * Outputs: docs/TABLES.md, docs/PROCEDURES.md
 *
 * Notes:
 * - Works on dumps created with:
 *   mysqldump ... --no-data --routines --no-tablespaces
 * - Parsing is regex-based and best-effort. It preserves full DDL/DML blocks
 *   when precise extraction is ambiguous.
 */

const fs = require('fs');
const path = require('path');

const INPUT = path.join(process.cwd(), 'docs', 'db-dump.sql');
const OUT_TABLES = path.join(process.cwd(), 'docs', 'TABLES.md');
const OUT_PROCS = path.join(process.cwd(), 'docs', 'PROCEDURES.md');

function readSql() {
  if (!fs.existsSync(INPUT)) {
    console.error(`❌ Input SQL not found at: ${INPUT}`);
    process.exit(1);
  }
  return fs.readFileSync(INPUT, 'utf8');
}

/**
 * Extract CREATE TABLE blocks.
 * Returns: [{ name, ddl, columns: [{name,type,null,default,extra}], primaryKeys:[], foreignKeys:[] }]
 */
function extractTables(sql) {
  // Strip MySQL conditional comments like /*!40101 ... */
  const cleaned = sql.replace(/\/\*![\s\S]*?\*\//g, ' ');

  // Match CREATE TABLE ... ; (non-greedy up to the first unmatched semicolon)
  const tableRegex = /CREATE\s+TABLE\s+`?([A-Za-z0-9_]+)`?\s*\(([\s\S]*?)\)\s*ENGINE[\s\S]*?;/gim;

  const tables = [];
  let m;
  while ((m = tableRegex.exec(cleaned)) !== null) {
    const name = m[1];
    const body = m[2];

    const lines = body
      .split('\n')
      .map(l => l.trim().replace(/,+$/, '')); // trim and drop trailing commas for parsing

    const columns = [];
    const primaryKeys = [];
    const foreignKeys = [];

    for (const ln of lines) {
      // Column definition: `colname` TYPE ... [DEFAULT ...] [NULL|NOT NULL] [AUTO_INCREMENT] ...
      const colMatch = ln.match(/^`([^`]+)`\s+([^,]+)$/);
      if (colMatch) {
        const colName = colMatch[1];
        const tail = colMatch[2];

        // Type is the first token (may include parentheses)
        const typeMatch = tail.match(/^([A-Za-z0-9_]+(?:\s*\([^)]+\))?)/);
        const colType = typeMatch ? typeMatch[1] : 'UNKNOWN';

        const isNull = /NOT\s+NULL/i.test(tail) ? 'NO' : 'YES';
        const defaultMatch = tail.match(/\bDEFAULT\s+([^,\s]+)/i);
        const colDefault = defaultMatch ? defaultMatch[1].replace(/^'/, '').replace(/'$/, '') : '';

        const extraBits = [];
        if (/AUTO_INCREMENT/i.test(tail)) extraBits.push('AUTO_INCREMENT');
        if (/ON\s+UPDATE/i.test(tail)) extraBits.push('ON UPDATE');
        const extra = extraBits.join(' ');

        columns.push({
          name: colName,
          type: colType,
          null: isNull,
          default: colDefault,
          extra
        });
        continue;
      }

      // PRIMARY KEY (`id`, ...)
      const pkMatch = ln.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        const cols = pkMatch[1]
          .split(',')
          .map(s => s.trim().replace(/`/g, ''));
        primaryKeys.push(...cols);
        continue;
      }

      // FOREIGN KEY (`col`) REFERENCES `table`(`id`)
      const fkMatch = ln.match(/^CONSTRAINT\s+`[^`]+`\s+FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+`([^`]+)`\s*\(([^)]+)\)/i)
                    || ln.match(/^FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+`([^`]+)`\s*\(([^)]+)\)/i);
      if (fkMatch) {
        const fromCols = fkMatch[1].split(',').map(s => s.trim().replace(/`/g, ''));
        const refTable = fkMatch[2];
        const toCols = fkMatch[3].split(',').map(s => s.trim().replace(/`/g, ''));
        foreignKeys.push({ from: fromCols, refTable, to: toCols });
        continue;
      }
    }

    // Full DDL for reference (reconstruct)
    const ddl = `CREATE TABLE \`${name}\` (\n  ${body.trim()}\n);`;

    tables.push({ name, ddl, columns, primaryKeys, foreignKeys });
  }

  return tables.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extract CREATE PROCEDURE / FUNCTION blocks.
 * Returns: [{ kind: 'PROCEDURE'|'FUNCTION', name, signature, body }]
 */
function extractRoutines(sql) {
  // Keep original (routines often wrapped in /*!50003 ... */ with DEFINER)
  const text = sql;

  // A robust-ish routine regex:
  // - capture kind (PROCEDURE|FUNCTION)
  // - capture name in backticks or bare
  // - capture args (...) lazily
  // - capture body until END followed by delimiter or semicolon
  const routineRegex =
    /CREATE\s+(?:DEFINER=`[^`]+`@`[^`]+`\s+)?(PROCEDURE|FUNCTION)\s+`?([A-Za-z0-9_]+)`?\s*\(([\s\S]*?)\)\s*([\s\S]*?END)\s*[\W]/gim;

  const routines = [];
  let m;
  while ((m = routineRegex.exec(text)) !== null) {
    const kind = m[1].toUpperCase();
    const name = m[2];
    const args = m[3].trim().replace(/\s+/g, ' ');
    const body = m[4].trim();

    // Compose a readable signature
    const signature = `${kind} ${name}(${args})`;

    routines.push({ kind, name, signature, body });
  }

  return routines.sort((a, b) => a.name.localeCompare(b.name));
}

function emitTablesMarkdown(tables) {
  const lines = [];
  lines.push('# Tables\n');
  if (!tables.length) {
    lines.push('_No tables found in dump._\n');
    return lines.join('\n');
  }

  for (const t of tables) {
    lines.push(`## \`${t.name}\``);
    if (t.columns.length) {
      lines.push('\n**Columns**');
      lines.push('\n| Name | Type | Null | Default | Extra |');
      lines.push('|------|------|------|---------|-------|');
      for (const c of t.columns) {
        lines.push(`| \`${c.name}\` | \`${c.type}\` | ${c.null} | ${c.default ? '`' + c.default + '`' : ''} | ${c.extra} |`);
      }
    } else {
      lines.push('\n_Columns could not be parsed reliably. See DDL below._');
    }

    if (t.primaryKeys.length) {
      lines.push('\n**Primary Key**');
      lines.push('\n`' + t.primaryKeys.join('`, `') + '`');
    }

    if (t.foreignKeys.length) {
      lines.push('\n**Foreign Keys**');
      for (const fk of t.foreignKeys) {
        lines.push(`- \`${fk.from.join('`, `')}\` → \`${fk.refTable}\`(\`${fk.to.join('`, `')}\`)`);
      }
    }

    lines.push('\n<details>');
    lines.push('<summary>Full DDL</summary>\n');
    lines.push('```sql');
    lines.push(t.ddl);
    lines.push('```');
    lines.push('</details>\n');
  }

  return lines.join('\n');
}

function emitProceduresMarkdown(routines) {
  const lines = [];
  lines.push('# Stored Procedures & Functions\n');
  if (!routines.length) {
    lines.push('_No routines found in dump._\n');
    return lines.join('\n');
  }

  for (const r of routines) {
    lines.push(`## \`${r.name}\``);
    lines.push('\n**Signature**');
    lines.push('\n```sql');
    lines.push(r.signature);
    lines.push('```');

    lines.push('\n<details>');
    lines.push('<summary>Body</summary>\n');
    lines.push('```sql');
    lines.push(r.body);
    lines.push('```');
    lines.push('</details>\n');
  }

  return lines.join('\n');
}

function main() {
  const sql = readSql();
  const tables = extractTables(sql);
  const routines = extractRoutines(sql);

  const tablesMd = emitTablesMarkdown(tables);
  const procsMd = emitProceduresMarkdown(routines);

  // Ensure docs/ exists
  const docsDir = path.join(process.cwd(), 'docs');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(OUT_TABLES, tablesMd, 'utf8');
  fs.writeFileSync(OUT_PROCS, procsMd, 'utf8');

  console.log(`✅ Wrote: ${OUT_TABLES}`);
  console.log(`✅ Wrote: ${OUT_PROCS}`);
}

main();
