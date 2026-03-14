/**
 * Logger - Colored console output for automation logs
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Bright foreground colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
};

class Logger {
  constructor() {
    this.prefix = '[GAMING-COINS]';
    this.logs = [];
  }

  log(message, color = colors.white) {
    const timestamp = new Date().toISOString();
    const formatted = `${colors.cyan}${timestamp}${colors.reset} ${color}${this.prefix}${colors.reset} ${message}`;
    console.log(formatted);
    this.logs.push({ timestamp, message, level: 'INFO' });
  }

  info(message) {
    this.log(message, colors.cyan);
  }

  success(message) {
    this.log(message, colors.brightGreen);
  }

  warn(message) {
    this.log(`${colors.yellow}⚠️  ${message}${colors.reset}`, colors.yellow);
    this.logs.push({ timestamp: new Date().toISOString(), message, level: 'WARN' });
  }

  error(message) {
    this.log(`${colors.brightRed}❌ ${message}${colors.reset}`, colors.brightRed);
    this.logs.push({ timestamp: new Date().toISOString(), message, level: 'ERROR' });
  }

  debug(message) {
    if (process.env.DEBUG === 'true') {
      this.log(`${colors.magenta}🐛 ${message}${colors.reset}`, colors.magenta);
    }
  }

  header(text) {
    const line = '='.repeat(60);
    console.log(`\n${colors.brightBlue}${line}\n${text}\n${line}${colors.reset}\n`);
    this.logs.push({ timestamp: new Date().toISOString(), message: text, level: 'HEADER' });
  }

  table(data) {
    console.table(data);
    this.logs.push({ timestamp: new Date().toISOString(), message: JSON.stringify(data), level: 'TABLE' });
  }

  stats(label, stats) {
    const formatted = Object.entries(stats)
      .map(([key, value]) => `${colors.cyan}${key}${colors.reset}: ${colors.brightYellow}${value}${colors.reset}`)
      .join(' | ');
    this.log(`📊 ${label} | ${formatted}`);
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

module.exports = new Logger();
