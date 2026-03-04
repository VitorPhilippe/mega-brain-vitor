#!/usr/bin/env node

/**
 * Mega Brain - Setup Wizard
 * Interactive first-time configuration guide
 *
 * Usage:
 *   npx mega-brain-ai setup
 *   node bin/mega-brain.js setup
 */

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import boxen from 'boxen';
import gradient from 'gradient-string';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, '..', '..');

const megaGradient = gradient(['#6366f1', '#8b5cf6', '#a855f7']);

// ─────────────────────────────────────────────────────────────
// Banner
// ─────────────────────────────────────────────────────────────

function showWizardBanner() {
  const banner = `
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                              \u2551
\u2551   \u2588\u2588\u2588\u2557   \u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2557                       \u2551
\u2551   \u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557                      \u2551
\u2551   \u2588\u2588\u2554\u2588\u2588\u2588\u2588\u2554\u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2551  \u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2551                      \u2551
\u2551   \u2588\u2588\u2551\u255a\u2588\u2588\u2554\u255d\u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d  \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2551                      \u2551
\u2551   \u2588\u2588\u2551 \u255a\u2550\u255d \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2551  \u2588\u2588\u2551                      \u2551
\u2551   \u255a\u2550\u255d     \u255a\u2550\u255d\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u255d  \u255a\u2550\u255d                     \u2551
\u2551                                                              \u2551
\u2551         B R A I N    S E T U P    W I Z A R D                \u2551
\u2551                                                              \u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d`;

  console.log(megaGradient(banner));
  console.log();
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function stepHeader(step, total, title) {
  console.log();
  console.log(chalk.dim('\u2500'.repeat(60)));
  console.log(`  ${chalk.cyan.bold(`[${step}/${total}]`)} ${chalk.bold(title)}`);
  console.log(chalk.dim('\u2500'.repeat(60)));
}

function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 15000, stdio: 'pipe' }).trim();
  } catch {
    return null;
  }
}

function parseVersion(versionStr) {
  if (!versionStr) return null;
  const match = versionStr.match(/(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    raw: match[0],
  };
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function isValidProvider(p) {
  return ['replicate', 'openai', 'local'].includes(String(p || '').toLowerCase());
}

// ─────────────────────────────────────────────────────────────
// Step 1: Check Python
// ─────────────────────────────────────────────────────────────

async function checkPython() {
  stepHeader(1, 6, 'Checking Python 3');

  const spinner = ora({ text: 'Detecting Python...', indent: 4 }).start();
  await sleep(400);

  let pythonCmd = null;
  let versionOutput = null;

  for (const cmd of ['python3 --version', 'python --version']) {
    const result = runCommand(cmd);
    if (result && result.toLowerCase().includes('python 3')) {
      pythonCmd = cmd.split(' ')[0];
      versionOutput = result;
      break;
    }
  }

  if (versionOutput) {
    const version = parseVersion(versionOutput);
    if (version && version.major >= 3 && version.minor >= 10) {
      spinner.succeed(chalk.green(`Python ${version.raw} detected (${pythonCmd})`));
      return { ok: true, version: version.raw, command: pythonCmd };
    } else if (version) {
      spinner.warn(chalk.yellow(`Python ${version.raw} found - 3.10+ recommended`));
      return { ok: true, version: version.raw, command: pythonCmd, warning: true };
    }
  }

  spinner.fail(chalk.red('Python 3 not found'));
  console.log(chalk.dim('    Install from: https://python.org/downloads'));
  console.log(chalk.dim('    Python is needed for hooks and processing scripts.'));
  return { ok: false, version: null, command: null };
}

// ─────────────────────────────────────────────────────────────
// Step 2: Check Node.js
// ─────────────────────────────────────────────────────────────

async function checkNode() {
  stepHeader(2, 6, 'Checking Node.js');

  const spinner = ora({ text: 'Detecting Node.js...', indent: 4 }).start();
  await sleep(300);

  const versionOutput = runCommand('node --version');
  if (versionOutput) {
    const version = parseVersion(versionOutput.replace('v', ''));
    if (version && version.major >= 18) {
      spinner.succeed(chalk.green(`Node.js ${version.raw} detected`));
      return { ok: true, version: version.raw };
    } else if (version) {
      spinner.fail(chalk.red(`Node.js ${version.raw} found - need >= 18.0.0`));
      console.log(chalk.dim('    Update from: https://nodejs.org'));
      return { ok: false, version: version.raw };
    }
  }

  spinner.fail(chalk.red('Could not detect Node.js version'));
  return { ok: false, version: null };
}

// ─────────────────────────────────────────────────────────────
// Step 3: Install Python Dependencies
// ─────────────────────────────────────────────────────────────

async function installPythonDeps(pythonResult) {
  stepHeader(3, 6, 'Python Dependencies');

  const reqPath = resolve(PROJECT_ROOT, 'requirements.txt');
  if (!existsSync(reqPath)) {
    console.log(chalk.dim('    No requirements.txt found - skipping'));
    return { ok: true, skipped: true };
  }

  if (!pythonResult.ok) {
    console.log(chalk.yellow('    Skipped (Python not available)'));
    return { ok: false, skipped: true };
  }

  const spinner = ora({ text: 'Installing Python packages...', indent: 4 }).start();

  const pipCommands = [
    `${pythonResult.command} -m pip install -r "${reqPath}" --quiet`,
    `pip install -r "${reqPath}" --quiet`,
    `pip3 install -r "${reqPath}" --quiet`,
  ];

  for (const cmd of pipCommands) {
    try {
      execSync(cmd, { encoding: 'utf-8', timeout: 60000, stdio: 'pipe' });
      spinner.succeed(chalk.green('Python dependencies installed'));
      return { ok: true, skipped: false };
    } catch {
      // Try next command
    }
  }

  spinner.warn(chalk.yellow('Could not install Python deps automatically'));
  console.log(chalk.dim('    Run manually: pip install -r requirements.txt'));
  return { ok: false, skipped: false };
}

// ─────────────────────────────────────────────────────────────
// Step 4: Configure API Keys
// ─────────────────────────────────────────────────────────────

async function configureApiKeys() {
  stepHeader(4, 6, 'API Key Configuration');

  console.log();
  console.log(chalk.dim('    Enter your keys below. Press Enter to skip optional ones.'));
  console.log(chalk.dim('    Keys are stored locally in .env (never committed to git).'));
  console.log();

  const keys = {};

  // Transcription provider
  console.log(`  ${chalk.cyan.bold('SELECT')} ${chalk.bold('TRANSCRIPTION_PROVIDER')} ${chalk.dim('- How to transcribe video/audio')}`);
  const providerAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'value',
      message: chalk.cyan('  Choose transcription provider:'),
      choices: [
        { name: 'Replicate (recommended for low effort / no GPU)', value: 'replicate' },
        { name: 'OpenAI (Whisper API)', value: 'openai' },
        { name: 'Local (run Whisper on this machine later)', value: 'local' },
      ],
      default: 'replicate',
    },
  ]);
  keys.TRANSCRIPTION_PROVIDER = providerAnswer.value || 'replicate';
  console.log();

  // --- OPENAI_API_KEY (OPTIONAL) ---
  console.log(
    `  ${chalk.dim.bold('OPTIONAL')} ${chalk.bold('OPENAI_API_KEY')} ${chalk.dim('- Whisper transcription via OpenAI')}`
  );
  console.log(chalk.dim('    Get yours at: https://platform.openai.com/api-keys'));
  const openaiAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: chalk.cyan('  OpenAI API Key (Enter to skip):'),
      validate: (input) => {
        if (!input) return true; // allow empty
        if (!input.startsWith('sk-')) return chalk.yellow('OpenAI keys typically start with sk-');
        return true;
      },
    },
  ]);
  keys.OPENAI_API_KEY = openaiAnswer.value || '';
  console.log();

  // --- REPLICATE_API_TOKEN (OPTIONAL) ---
  console.log(
    `  ${chalk.dim.bold('OPTIONAL')} ${chalk.bold('REPLICATE_API_TOKEN')} ${chalk.dim('- Whisper transcription via Replicate')}`
  );
  console.log(chalk.dim('    Get yours at: https://replicate.com/account/api-tokens'));
  const replicateAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: chalk.cyan('  Replicate API Token (Enter to skip):'),
    },
  ]);
  keys.REPLICATE_API_TOKEN = replicateAnswer.value || '';
  console.log();

  // --- VOYAGE_API_KEY (RECOMMENDED) ---
  console.log(
    `  ${chalk.yellow.bold('RECOMMENDED')} ${chalk.bold('VOYAGE_API_KEY')} ${chalk.dim('- Semantic embeddings for RAG search')}`
  );
  console.log(chalk.dim('    Without this, semantic search uses mock vectors (degraded quality)'));
  console.log(chalk.dim('    Get yours at: https://dash.voyageai.com/api-keys'));
  const voyageAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: chalk.cyan('  Voyage API Key (Enter to skip):'),
    },
  ]);
  keys.VOYAGE_API_KEY = voyageAnswer.value || '';
  console.log();

  // --- GOOGLE OAUTH (OPTIONAL) ---
  console.log(
    `  ${chalk.dim.bold('OPTIONAL')} ${chalk.bold('Google OAuth')} ${chalk.dim('- Import transcriptions from Google Drive')}`
  );
  console.log(chalk.dim('    Without these, download files manually to inbox/'));
  console.log(chalk.dim('    Setup at: https://console.cloud.google.com/apis/credentials'));
  const googleIdAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message: chalk.cyan('  Google Client ID (Enter to skip):'),
    },
  ]);
  keys.GOOGLE_CLIENT_ID = googleIdAnswer.value || '';

  if (keys.GOOGLE_CLIENT_ID) {
    const googleSecretAnswer = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message: chalk.cyan('  Google Client Secret:'),
      },
    ]);
    keys.GOOGLE_CLIENT_SECRET = googleSecretAnswer.value || '';
  } else {
    keys.GOOGLE_CLIENT_SECRET = '';
  }

  // Gentle warnings (no blocking)
  const provider = String(keys.TRANSCRIPTION_PROVIDER || '').toLowerCase();
  if (!isValidProvider(provider)) {
    console.log(chalk.yellow(`    Warning: unknown TRANSCRIPTION_PROVIDER="${keys.TRANSCRIPTION_PROVIDER}". Defaulting to replicate.`));
    keys.TRANSCRIPTION_PROVIDER = 'replicate';
  }

  if (provider === 'openai' && !keys.OPENAI_API_KEY) {
    console.log(chalk.yellow('    Warning: TRANSCRIPTION_PROVIDER is openai but OPENAI_API_KEY is empty.'));
  }
  if (provider === 'replicate' && !keys.REPLICATE_API_TOKEN) {
    console.log(chalk.yellow('    Warning: TRANSCRIPTION_PROVIDER is replicate but REPLICATE_API_TOKEN is empty.'));
  }
  if (provider === 'local') {
    console.log(chalk.dim('    Note: Local transcription will be configured later (no API token required).'));
  }

  return keys;
}

// ─────────────────────────────────────────────────────────────
// Step 5: Validate API Connectivity
// ─────────────────────────────────────────────────────────────

async function validateKeys(keys) {
  stepHeader(5, 6, 'Validating Configuration');

  const results = {};

  // Validate OpenAI (only if provided)
  if (keys.OPENAI_API_KEY) {
    const spinner = ora({ text: 'Testing OpenAI connection...', indent: 4 }).start();
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${keys.OPENAI_API_KEY}` },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        spinner.succeed(chalk.green('OpenAI API key is valid'));
        results.OPENAI_API_KEY = 'valid';
      } else if (response.status === 401) {
        spinner.fail(chalk.red('OpenAI API key is invalid (401 Unauthorized)'));
        results.OPENAI_API_KEY = 'invalid';
      } else {
        spinner.warn(chalk.yellow(`OpenAI returned HTTP ${response.status} - key may still work`));
        results.OPENAI_API_KEY = 'unknown';
      }
    } catch {
      spinner.warn(chalk.yellow('Could not reach OpenAI API - check your network'));
      results.OPENAI_API_KEY = 'network_error';
    }
  } else {
    console.log(chalk.dim('    OpenAI: skipped (no key provided)'));
    results.OPENAI_API_KEY = 'skipped';
  }

  // Validate Replicate token (light check, only if provided)
  if (keys.REPLICATE_API_TOKEN) {
    const spinner = ora({ text: 'Testing Replicate token...', indent: 4 }).start();
    try {
      const response = await fetch('https://api.replicate.com/v1/account', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${keys.REPLICATE_API_TOKEN}` },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        spinner.succeed(chalk.green('Replicate token is valid'));
        results.REPLICATE_API_TOKEN = 'valid';
      } else if (response.status === 401) {
        spinner.fail(chalk.red('Replicate token is invalid (401 Unauthorized)'));
        results.REPLICATE_API_TOKEN = 'invalid';
      } else {
        spinner.warn(chalk.yellow(`Replicate returned HTTP ${response.status} - token may still work`));
        results.REPLICATE_API_TOKEN = 'unknown';
      }
    } catch {
      spinner.warn(chalk.yellow('Could not reach Replicate API - check your network'));
      results.REPLICATE_API_TOKEN = 'network_error';
    }
  } else {
    console.log(chalk.dim('    Replicate: skipped (no token provided)'));
    results.REPLICATE_API_TOKEN = 'skipped';
  }

  // Validate Voyage
  if (keys.VOYAGE_API_KEY) {
    const spinner = ora({ text: 'Testing Voyage AI connection...', indent: 4 }).start();
    try {
      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${keys.VOYAGE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: ['test'], model: 'voyage-3-lite' }),
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        spinner.succeed(chalk.green('Voyage AI key is valid'));
        results.VOYAGE_API_KEY = 'valid';
      } else if (response.status === 401) {
        spinner.fail(chalk.red('Voyage AI key is invalid (401 Unauthorized)'));
        results.VOYAGE_API_KEY = 'invalid';
      } else {
        spinner.warn(chalk.yellow(`Voyage AI returned HTTP ${response.status}`));
        results.VOYAGE_API_KEY = 'unknown';
      }
    } catch {
      spinner.warn(chalk.yellow('Could not reach Voyage AI API'));
      results.VOYAGE_API_KEY = 'network_error';
    }
  } else {
    console.log(chalk.dim('    Voyage AI: skipped (no key provided)'));
    results.VOYAGE_API_KEY = 'skipped';
  }

  // Google - just mark as configured or not
  if (keys.GOOGLE_CLIENT_ID && keys.GOOGLE_CLIENT_SECRET) {
    console.log(chalk.dim('    Google OAuth: configured (validated on first use)'));
    results.GOOGLE_OAUTH = 'configured';
  } else {
    console.log(chalk.dim('    Google OAuth: not configured'));
    results.GOOGLE_OAUTH = 'skipped';
  }

  // Provider status
  results.TRANSCRIPTION_PROVIDER = isValidProvider(keys.TRANSCRIPTION_PROVIDER) ? 'set' : 'unknown';

  return results;
}

// ─────────────────────────────────────────────────────────────
// Step 6: Generate .env and Show Summary
// ─────────────────────────────────────────────────────────────

async function generateEnvAndSummary(keys, validationResults, pythonResult, nodeResult, pipResult) {
  stepHeader(6, 6, 'Summary & .env Generation');

  // Read env.example as the template base
  const envExamplePath = resolve(PROJECT_ROOT, 'bin', 'templates', 'env.example');
  const envTargetPath = resolve(PROJECT_ROOT, '.env');

  let envContent;
  if (existsSync(envExamplePath)) {
    envContent = readFileSync(envExamplePath, 'utf-8');
  } else {
    // Fallback template
    envContent = [
      '# Mega Brain - Environment Configuration',
      '# Generated by setup wizard',
      '',
      'TRANSCRIPTION_PROVIDER=replicate',
      'OPENAI_API_KEY=',
      'REPLICATE_API_TOKEN=',
      'VOYAGE_API_KEY=',
      'GOOGLE_CLIENT_ID=',
      'GOOGLE_CLIENT_SECRET=',
      '',
    ].join('\n');
  }

  // Ensure new keys exist in template even if env.example doesn't have them yet
  if (!/^TRANSCRIPTION_PROVIDER=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^OPENAI_API_KEY=.*$/m, `TRANSCRIPTION_PROVIDER=${keys.TRANSCRIPTION_PROVIDER || 'replicate'}\nOPENAI_API_KEY=`);
  }
  if (!/^REPLICATE_API_TOKEN=.*$/m.test(envContent)) {
    envContent = envContent.replace(/^OPENAI_API_KEY=.*$/m, `OPENAI_API_KEY=\nREPLICATE_API_TOKEN=`);
  }

  // Fill in the values
  if (keys.TRANSCRIPTION_PROVIDER) {
    envContent = envContent.replace(/^TRANSCRIPTION_PROVIDER=.*$/m, `TRANSCRIPTION_PROVIDER=${keys.TRANSCRIPTION_PROVIDER}`);
  }
  if (keys.OPENAI_API_KEY) {
    envContent = envContent.replace(/^OPENAI_API_KEY=.*$/m, `OPENAI_API_KEY=${keys.OPENAI_API_KEY}`);
  }
  if (keys.REPLICATE_API_TOKEN) {
    envContent = envContent.replace(/^REPLICATE_API_TOKEN=.*$/m, `REPLICATE_API_TOKEN=${keys.REPLICATE_API_TOKEN}`);
  }
  if (keys.VOYAGE_API_KEY) {
    envContent = envContent.replace(/^VOYAGE_API_KEY=.*$/m, `VOYAGE_API_KEY=${keys.VOYAGE_API_KEY}`);
  }
  if (keys.GOOGLE_CLIENT_ID) {
    envContent = envContent.replace(/^GOOGLE_CLIENT_ID=.*$/m, `GOOGLE_CLIENT_ID=${keys.GOOGLE_CLIENT_ID}`);
  }
  if (keys.GOOGLE_CLIENT_SECRET) {
    envContent = envContent.replace(/^GOOGLE_CLIENT_SECRET=.*$/m, `GOOGLE_CLIENT_SECRET=${keys.GOOGLE_CLIENT_SECRET}`);
  }

  // Check if .env already exists
  let wrote = false;
  if (existsSync(envTargetPath)) {
    const overwrite = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'value',
        message: chalk.yellow('  .env already exists. Overwrite?'),
        default: false,
      },
    ]);
    if (overwrite.value) {
      writeFileSync(envTargetPath, envContent, 'utf-8');
      wrote = true;
    } else {
      console.log(chalk.dim('    Kept existing .env'));
    }
  } else {
    writeFileSync(envTargetPath, envContent, 'utf-8');
    wrote = true;
  }

  if (wrote) {
    console.log(chalk.green('    .env file generated'));
  }

  // Summary Dashboard
  console.log();

  const statusIcon = (status) => {
    switch (status) {
      case 'valid':
      case true:
        return chalk.green('OK');
      case 'configured':
      case 'set':
        return chalk.green('SET');
      case 'invalid':
        return chalk.red('FAIL');
      case 'network_error':
        return chalk.yellow('NET?');
      case 'unknown':
        return chalk.yellow('????');
      case 'skipped':
      case false:
        return chalk.dim('SKIP');
      default:
        return chalk.dim('----');
    }
  };

  const maskKey = (key) => {
    if (!key) return chalk.dim('not set');
    if (key.length <= 8) return chalk.dim('***');
    return chalk.dim(key.substring(0, 5) + '...' + key.substring(key.length - 4));
  };

  const summaryLines = [];
  summaryLines.push(chalk.bold('  SETUP SUMMARY'));
  summaryLines.push('');
  summaryLines.push(chalk.bold('  Tools'));
  summaryLines.push(`    Python 3 ........... ${statusIcon(pythonResult.ok)}  ${chalk.dim(pythonResult.version || 'not found')}`);
  summaryLines.push(`    Node.js ............ ${statusIcon(nodeResult.ok)}  ${chalk.dim(nodeResult.version || 'not found')}`);
  summaryLines.push(`    pip install ........ ${statusIcon(pipResult.ok)}  ${chalk.dim(pipResult.skipped ? 'skipped' : 'installed')}`);
  summaryLines.push('');
  summaryLines.push(chalk.bold('  Transcription'));
  summaryLines.push(`    Provider ........... ${statusIcon(validationResults.TRANSCRIPTION_PROVIDER)}  ${chalk.dim(keys.TRANSCRIPTION_PROVIDER || 'replicate')}`);
  summaryLines.push('');
  summaryLines.push(chalk.bold('  API Keys'));
  summaryLines.push(`    OPENAI_API_KEY ..... ${statusIcon(validationResults.OPENAI_API_KEY)}  ${maskKey(keys.OPENAI_API_KEY)}`);
  summaryLines.push(`    REPLICATE_API_TOKEN  ${statusIcon(validationResults.REPLICATE_API_TOKEN)}  ${maskKey(keys.REPLICATE_API_TOKEN)}`);
  summaryLines.push(`    VOYAGE_API_KEY ..... ${statusIcon(validationResults.VOYAGE_API_KEY)}  ${maskKey(keys.VOYAGE_API_KEY)}`);
  summaryLines.push(`    Google OAuth ....... ${statusIcon(validationResults.GOOGLE_OAUTH)}  ${keys.GOOGLE_CLIENT_ID ? maskKey(keys.GOOGLE_CLIENT_ID) : chalk.dim('not set')}`);
  summaryLines.push('');
  summaryLines.push(`  .env file ............ ${wrote ? chalk.green('WRITTEN') : chalk.yellow('UNCHANGED')}`);

  console.log(boxen(summaryLines.join('\n'), {
    padding: { top: 1, bottom: 1, left: 1, right: 1 },
    margin: { left: 2 },
    borderStyle: 'round',
    borderColor: 'cyan',
  }));

  // Next steps
  console.log();
  const provider = String(keys.TRANSCRIPTION_PROVIDER || '').toLowerCase();

  const notes = [];
  notes.push(chalk.white('  Next steps:'));
  notes.push(chalk.dim('  1. Open this project in Claude Code'));
  notes.push(chalk.dim('  2. Drop a YouTube URL or PDF into inbox/'));
  notes.push(chalk.dim('  3. Tell JARVIS: /ingest'));
  notes.push('');
  if (provider === 'replicate' && !keys.REPLICATE_API_TOKEN) {
    notes.push(chalk.yellow('  Note: Provider is replicate but token is missing. Add REPLICATE_API_TOKEN in .env later.'));
  }
  if (provider === 'openai' && !keys.OPENAI_API_KEY) {
    notes.push(chalk.yellow('  Note: Provider is openai but key is missing. Add OPENAI_API_KEY in .env later.'));
  }
  if (provider === 'local') {
    notes.push(chalk.dim('  Note: Local transcription will be configured later (Whisper on this machine).'));
  }

  console.log(boxen(
    chalk.green.bold('  Setup complete!') + '\n\n' + notes.join('\n'),
    {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      margin: { left: 2 },
      borderStyle: 'round',
      borderColor: 'green',
    }
  ));

  console.log();
}

// ─────────────────────────────────────────────────────────────
// Main entry point
// ─────────────────────────────────────────────────────────────

export async function runSetup() {
  showWizardBanner();

  console.log(chalk.dim('  This wizard will configure Mega Brain for first-time use.'));
  console.log(chalk.dim('  It takes about 2 minutes.\n'));

  // Step 1: Python
  const pythonResult = await checkPython();

  // Step 2: Node.js
  const nodeResult = await checkNode();

  // Step 3: Python deps
  const pipResult = await installPythonDeps(pythonResult);

  // Step 4: API keys
  const keys = await configureApiKeys();

  // Step 5: Validate
  const validationResults = await validateKeys(keys);

  // Step 6: Summary + .env
  await generateEnvAndSummary(keys, validationResults, pythonResult, nodeResult, pipResult);
}
