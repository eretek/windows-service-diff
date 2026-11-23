#!/usr/bin/env node
// Headless tests: the tool's own fixtures plus the worked examples in Turkish, English and German.
// Usage: node test/run.js   (Node.js 18 or later, no dependencies)
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
const g = { console, URL, TextEncoder, TextDecoder, Intl, Promise, BigInt, Uint8Array, Uint32Array, DataView, ArrayBuffer, Math, Date, JSON, Set, Map, Number, String, Array, Object, RegExp, Error, isFinite, isNaN, parseInt, parseFloat, encodeURIComponent, decodeURIComponent, unescape, escape,
	crypto: require('crypto').webcrypto, Blob: class { constructor(p) { this.p = p; } }, DOMParser: undefined,
	atob: (s) => Buffer.from(s, 'base64').toString('binary'), btoa: (s) => Buffer.from(s, 'binary').toString('base64') };
g.globalThis = g; g.window = g;
vm.createContext(g);
const load = (rel) => vm.runInContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), g, { filename: rel });
load('src/core.js');
const D = (load('src/data.js'), g.ERT_TOOL);
D.libs.forEach((l) => load('src/lib/' + l + '.js'));
if (fs.existsSync(path.join(ROOT, 'src/lib/xlsx.js')) && !D.libs.includes('xlsx')) load('src/lib/xlsx.js');
load('src/tool.js');
const ERT = g.ERT, cases = JSON.parse(fs.readFileSync(path.join(ROOT, 'test/cases.json'), 'utf8'));
const eq = (a, b) => {
	if (b && typeof b === 'object' && !Array.isArray(b) && '$approx' in b) return typeof a === 'number' && Math.abs(a - b.$approx[0]) <= b.$approx[1];
	if (typeof a === 'bigint') a = a.toString();
	if (Array.isArray(b)) return Array.isArray(a) && a.length === b.length && b.every((x, i) => eq(a[i], x));
	if (b && typeof b === 'object') return a && typeof a === 'object' && Object.keys(b).every((k) => eq(a[k], b[k]));
	return JSON.stringify(a) === JSON.stringify(b);
};
const get = (o, p) => String(p).split('.').reduce((x, k) => (x == null ? undefined : x[k]), o);
const cfgFor = (lang) => ({ id: D.id, lang, f: D.f, o: D.text[lang].o, mode: D.mode });
(async () => {
	let pass = 0, fail = 0;
	for (const [i, tc] of (cases.tests || []).entries()) {
		const lang = tc.lang || 'en', raw = {};
		D.f.forEach((fd) => { raw[fd.n] = tc.in[fd.n] !== undefined ? (fd.t === 'chk' ? !!tc.in[fd.n] : (fd.t === 'file' ? tc.in[fd.n] : String(tc.in[fd.n]))) : (fd.def !== undefined ? (fd.t === 'chk' ? !!fd.def : String(fd.def)) : (fd.t === 'chk' ? false : (fd.t === 'sel' ? fd.opt[0] : ''))); });
		if (ERT.dns) ERT.dns._fixture = tc.dns || {};
		let r;
		try { r = await ERT.runRaw(cfgFor(lang), raw); } catch (e) { fail++; console.log(`FAIL test ${i + 1}: exception ${e.stack}`); continue; }
		if (tc.err !== undefined) {
			const ok = r.errs && (tc.err === true || r.errs.some((e) => e.field === tc.err || (tc.err === null && e.field === null)));
			ok ? pass++ : (fail++, console.log(`FAIL test ${i + 1}: expected an input error (${tc.err})`));
			continue;
		}
		if (r.errs) { fail++; console.log(`FAIL test ${i + 1}: unexpected error`, r.errs.map((e) => e.field + ': ' + e.msg)); continue; }
		let ok = true;
		for (const [k, want] of Object.entries(tc.v || {})) { const got = get(r.v, k); if (!eq(got, want)) { ok = false; console.log(`FAIL test ${i + 1}: ${k} expected ${JSON.stringify(want)}, got ${JSON.stringify(typeof got === 'bigint' ? got.toString() : got)}`); } }
		ok ? pass++ : fail++;
	}
	for (const lang of ['tr', 'en', 'de']) {
		for (const exk of ['ex', 'ex2']) {
			if (!D[exk]) continue;
			if (D.mode === 'dns') { if (!D.dnsfx) continue; ERT.dns._fixture = D.dnsfx; }
			const raw = {};
			D.f.forEach((fd) => { const v = D[exk][fd.n] !== undefined ? D[exk][fd.n] : fd.def; raw[fd.n] = fd.t === 'chk' ? !!v : (fd.t === 'file' ? (v || null) : (v === undefined ? (fd.t === 'sel' ? fd.opt[0] : '') : String(ERT.fmtEx(fd, v, lang)))); });
			try {
				const r = await ERT.runRaw(cfgFor(lang), raw);
				if (r.errs) { fail++; console.log(`FAIL example ${exk}/${lang}:`, r.errs.map((e) => e.field + ': ' + e.msg)); continue; }
				if (r.x && r.x.xlsx) ERT.xlsx(r.x.xlsx.sheets);
				if (r.x && r.x.csv) ERT.csv.build(r.x.csv.cols, r.x.csv.rows, ';');
				if (r.x && r.x.ics) ERT.ics(r.x.ics.events, 'x');
				pass++;
			} catch (e) { fail++; console.log(`FAIL example ${exk}/${lang}: exception ${e.stack}`); }
		}
	}
	console.log(`${pass} passed, ${fail} failed`);
	process.exit(fail ? 1 : 0);
})();
