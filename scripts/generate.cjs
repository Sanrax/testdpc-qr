#!/usr/bin/env node
'use strict';
// Optional headless generator, suitable for a local terminal or cloud runner.
// No npm install is needed. Output contains the enrollment payload, not an APK.
const fs = require('node:fs');
const path = require('node:path');
const core = require('../dist/core.js');
const qrcode = require('../dist/vendor/qrcode.js');

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node scripts/generate.cjs [--out output-directory] [--apk-url https://... --sha256 APK_HASH]');
    return;
  }
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--out', '--apk-url', '--sha256'].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith('--')) {
      throw new Error('Unknown or missing argument. Use --help.');
    }
    options[args[i]] = args[i + 1];
  }
  const payload = core.buildPayload({ apkUrl: options['--apk-url'], checksum: options['--sha256'] });
  const { qr } = core.makeQr(payload, qrcode);
  const directory = path.resolve(options['--out'] || 'output');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'testdpc-enrollment.svg'), core.toSvg(qr));
  fs.writeFileSync(path.join(directory, 'testdpc-enrollment.json'), JSON.stringify(payload, null, 2) + '\n');
  console.log('Created testdpc-enrollment.svg and testdpc-enrollment.json in ' + directory);
}
try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
