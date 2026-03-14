/**
 * Enhanced Logger - Rich console output with Consola (2026)
 * Tags: PLAYWRIGHT | FANDOM | REDDIT | CACHE | SCRAPER | GENERATOR | PUBLISHER | CONFIG
 * Uses consola for fancy boxes, colors, and structured logging
 */

const { consola } = require('consola');

// Tagged loggers for different automation components
const loggers = {
  main: consola.withTag('AUTO'),
  playwright: consola.withTag('PLAYWRIGHT'),
  fandom: consola.withTag('FANDOM'),
  reddit: consola.withTag('REDDIT'),
  cache: consola.withTag('CACHE'),
  scraper: consola.withTag('SCRAPER'),
  generator: consola.withTag('GENERATOR'),
  publisher: consola.withTag('PUBLISHER'),
  config: consola.withTag('CONFIG'),
  http: consola.withTag('HTTP'),
};

class Logger {
  constructor() {
    this.prefix = '[GAMING-COINS]';
    this.logs = [];
    this._useConsola = true;
  }

  _addLog(level, message) {
    this.logs.push({ timestamp: new Date().toISOString(), message: String(message), level });
  }

  log(message, color = 'white') {
    if (this._useConsola) {
      consola.log(message);
    } else {
      console.log(`${this.prefix} ${message}`);
    }
    this._addLog('INFO', message);
  }

  info(message) {
    loggers.main.info(message);
    this._addLog('INFO', message);
  }

  success(message) {
    loggers.main.success(message);
    this._addLog('SUCCESS', message);
  }

  warn(message) {
    loggers.main.warn(message);
    this._addLog('WARN', message);
  }

  error(message) {
    loggers.main.error(message);
    this._addLog('ERROR', message);
  }

  debug(message) {
    if (process.env.DEBUG === 'true') {
      loggers.main.debug(message);
      this._addLog('DEBUG', message);
    }
  }

  header(text) {
    const line = '═'.repeat(60);
    consola.log('\n' + line + '\n' + text + '\n' + line + '\n');
    this._addLog('HEADER', text);
  }

  box(title, content) {
    const border = '─'.repeat(50);
    consola.log(`\n┌${border}┐\n│ ${title || ''}\n│ ${String(content).replace(/\n/g, '\n│ ')}\n└${border}┘\n`);
    this._addLog('BOX', `${title}: ${content}`);
  }

  table(data) {
    consola.table(data);
    this._addLog('TABLE', JSON.stringify(data));
  }

  stats(label, statsObj) {
    const entries = Object.entries(statsObj)
      .map(([k, v]) => `   ${k}: ${v}`)
      .join('\n');
    const border = '─'.repeat(40);
    consola.success(`\n📊 ${label}\n┌${border}┐\n${entries}\n└${border}┘\n`);
    this._addLog('STATS', `${label} ${JSON.stringify(statsObj)}`);
  }

  // ─── Tagged loggers for components ─────────────────────────────────────

  playwright(message, level = 'info') {
    loggers.playwright[level](message);
    this._addLog(`PLAYWRIGHT:${level.toUpperCase()}`, message);
  }

  fandom(message, level = 'info') {
    loggers.fandom[level](message);
    this._addLog(`FANDOM:${level.toUpperCase()}`, message);
  }

  reddit(message, level = 'info') {
    loggers.reddit[level](message);
    this._addLog(`REDDIT:${level.toUpperCase()}`, message);
  }

  cacheHit(game, source) {
    loggers.cache.info(`✓ ${game} ← ${source}`);
    this._addLog('CACHE', `hit ${game}/${source}`);
  }

  cacheMiss(game, source) {
    loggers.cache.debug(`✗ ${game} → fetching ${source}`);
  }

  scraper(game, message, level = 'info') {
    loggers.scraper[level](`[${game}] ${message}`);
    this._addLog(`SCRAPER:${game}`, message);
  }

  generator(message, level = 'info') {
    loggers.generator[level](message);
    this._addLog(`GENERATOR:${level.toUpperCase()}`, message);
  }

  publisher(message, level = 'info') {
    loggers.publisher[level](message);
    this._addLog(`PUBLISHER:${level.toUpperCase()}`, message);
  }

  http(message, level = 'info') {
    loggers.http[level](message);
    this._addLog(`HTTP:${level.toUpperCase()}`, message);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

module.exports = new Logger();
