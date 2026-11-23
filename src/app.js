/*! Eretek IT Admin Tools — standalone page renderer.
 * Builds the tool page from src/data.js in Turkish, English or German and boots src/core.js.
 * No network requests, no storage, nothing written to the URL except the chosen language (?lang=).
 */
(function () {
	'use strict';
	var D = window.ERT_TOOL, LANGS = ['en', 'tr', 'de'];

	function pickLang() {
		var q = (location.search.match(/[?&]lang=(en|tr|de)\b/) || [])[1];
		if (q) { return q; }
		var n = (navigator.language || 'en').slice(0, 2).toLowerCase();
		return LANGS.indexOf(n) !== -1 ? n : 'en';
	}
	function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
	/* Allowed inline markup in content strings (same allow-list as the website). */
	function k(html) {
		var tpl = document.createElement('template'); tpl.innerHTML = String(html == null ? '' : html);
		var OK = { CODE: 1, STRONG: 1, EM: 1, SUB: 1, SUP: 1, BR: 1, A: 1, KBD: 1 };
		(function clean(n) {
			Array.prototype.slice.call(n.childNodes).forEach(function (c) {
				if (c.nodeType === 1) {
					if (!OK[c.tagName]) { c.replaceWith(document.createTextNode(c.textContent)); return; }
					Array.prototype.slice.call(c.attributes).forEach(function (a) {
						if (!(c.tagName === 'A' && a.name === 'href' && /^https?:\/\//.test(a.value))) { c.removeAttribute(a.name); }
					});
					clean(c);
				} else if (c.nodeType !== 3) { c.remove(); }
			});
		}(tpl.content));
		var d = document.createElement('div'); d.appendChild(tpl.content); return d.innerHTML;
	}
	function ps(arr) {
		return [].concat(arr || []).map(function (p) {
			if (Array.isArray(p)) { return '<ul>' + p.map(function (x) { return '<li>' + k(x) + '</li>'; }).join('') + '</ul>'; }
			if (String(p).indexOf('pre:') === 0) { return '<pre class="ert-pre"><code>' + esc(String(p).slice(4)) + '</code></pre>'; }
			return '<p>' + k(p) + '</p>';
		}).join('');
	}
	function field(f, L) {
		var n = f.n, lab = L[n] || [n, '', ''], fid = 'ert-f-' + n, w = f.w || (f.t === 'area' ? 'l' : 's');
		var desc = (lab[1] ? 'ert-h-' + n + ' ' : '') + 'ert-e-' + n;
		var common = ' id="' + fid + '" data-n="' + esc(n) + '" aria-describedby="' + esc(desc) + '"' + (f.req ? ' aria-required="true"' : '');
		var o = '<div class="ert-f ert-w-' + esc(w) + (f.t === 'chk' ? ' ert-f--chk' : '') + '">';
		var lbl = '<label for="' + fid + '">' + esc(lab[0]) + (f.unit ? ' <span class="ert-unit">(' + esc(f.unit) + ')</span>' : '') + '</label>';
		var ph = lab[2] !== undefined && lab[2] !== '' ? ' placeholder="' + esc(lab[2]) + '"' : '';
		var def = f.def !== undefined ? ' value="' + esc(f.def) + '"' : '';
		switch (f.t) {
			case 'sel':
				o += lbl + '<select' + common + '>' + f.opt.map(function (v) {
					var tx = (L['opt:' + n] || {})[v]; return '<option value="' + esc(v) + '"' + (String(f.def || '') === String(v) ? ' selected' : '') + '>' + esc(tx === undefined ? v : tx) + '</option>';
				}).join('') + '</select>'; break;
			case 'area': o += lbl + '<textarea' + common + ' rows="' + (f.rows || 6) + '" spellcheck="false" autocomplete="off"' + ph + ' class="ert-mono"></textarea>'; break;
			case 'chk': o += '<input type="checkbox"' + common + (f.def ? ' checked' : '') + '>' + lbl; break;
			case 'file': o += lbl + '<input type="file"' + common + (f.accept ? ' accept="' + esc(f.accept) + '"' : '') + '>'; break;
			case 'date': case 'dt': o += lbl + '<input type="' + (f.t === 'date' ? 'date' : 'datetime-local') + '"' + common + def + '>'; break;
			default: o += lbl + '<input type="' + (f.t === 'pw' ? 'password' : 'text') + '"' + common + (f.t === 'num' ? ' inputmode="decimal"' : '') + ' autocomplete="off" spellcheck="false"' + ph + def + (f.mono ? ' class="ert-mono"' : '') + '>';
		}
		if (lab[1]) { o += '<p class="ert-help" id="ert-h-' + esc(n) + '">' + k(lab[1]) + '</p>'; }
		return o + '<p class="ert-err" id="ert-e-' + esc(n) + '" hidden></p></div>';
	}
	function exTable(ex, x, S) {
		var o = '<table class="ert-ex"><thead><tr><th scope="col">' + esc(S.s_ex_in) + '</th><th scope="col">' + esc(S.s_ex_val) + '</th></tr></thead><tbody>';
		D.f.forEach(function (f) {
			var v = ex[f.n]; if (v === undefined || v === '' || v === false) { return; }
			var L = x.L[f.n] || [f.n];
			if (f.t === 'sel') { var t = (x.L['opt:' + f.n] || {})[v]; v = t === undefined ? v : t; }
			if (f.t === 'chk') { v = v ? '✓' : '–'; }
			v = Array.isArray(v) ? v.join(', ') : String(v);
			var cell = v.indexOf('\n') !== -1 || f.t === 'area' ? '<pre class="ert-pre ert-pre--s"><code>' + esc(v) + '</code></pre>' : esc(v);
			o += '<tr><th scope="row">' + esc(L[0]) + '</th><td>' + cell + '</td></tr>';
		});
		return o + '</tbody></table>';
	}

	function render(lang) {
		var x = D.text[lang], S = D.S[lang], name = D.name[lang];
		var h1 = lang === 'de' ? name + ' online' : 'Online ' + name;
		var mode = D.mode === 'dns' ? S.mode_dns : S.mode_local;
		var exp = D.exp.filter(function (e) { return e !== 'copy'; });
		var cfg = { id: D.id, lang: lang, mode: D.mode, exp: D.exp, f: D.f, ex: D.ex || {}, ex2: D.ex2 || null, L: x.L || {}, o: x.o || {}, name: name, xlsx: 'src/lib/xlsx.js', auto: !!D.auto, dnsfx: D.dnsfx || null };
		document.documentElement.lang = lang;
		document.title = h1 + ' — Eretek';
		var md = document.querySelector('meta[name="description"]'); if (md) { md.setAttribute('content', x.d || ''); }

		var o = '<div class="ert ert-tool" id="ert" data-ert="' + esc(D.id) + '" data-lang="' + lang + '" data-cfg="' + esc(JSON.stringify(cfg)) + '">';
		o += '<nav class="ert-langs" aria-label="Language">' + ['tr', 'en', 'de'].map(function (l) {
			return '<a href="?lang=' + l + '"' + (l === lang ? ' aria-current="true"' : '') + ' hreflang="' + l + '" lang="' + l + '">' + { tr: 'Türkçe', en: 'English', de: 'Deutsch' }[l] + '</a>';
		}).join('') + '</nav>';
		o += '<header class="ert-hd ert-hd--ic">' + (D.icon ? '<svg class="ert-ic ert-ic--hd" viewBox="-6 -6 212 212" aria-hidden="true" focusable="false">' + D.icon + '</svg>' : '') + '<div class="ert-hd__b"><p class="ert-kick">' + esc(D.group[lang]) + ' · #' + esc(D.id) + '</p>';
		o += '<h1 class="ert-h1">' + esc(h1) + '</h1><p class="ert-lead">' + k(x.lead) + '</p>';
		o += '<ul class="ert-badges"><li>' + esc(mode) + '</li>' + (exp.length ? '<li>' + esc(S.exp) + ': ' + esc(exp.join(', ').toUpperCase()) + '</li>' : '') + '</ul></div></header>';

		o += '<section class="ert-app" aria-labelledby="ert-app-h"><h2 id="ert-app-h" class="screen-reader-text">' + esc(S.form_h) + '</h2>';
		o += '<form class="ert-form" novalidate action="#" onsubmit="return false"><div class="ert-fields">' + D.f.map(function (f) { return field(f, x.L || {}); }).join('') + '</div>';
		if (D.mode === 'dns') { o += '<p class="ert-note">' + esc(S.dns_note) + '</p>'; }
		if (x.formnote) { o += '<p class="ert-note">' + k(x.formnote) + '</p>'; }
		o += '<div class="ert-actions"><button type="submit" class="ert-btn ert-btn--p" data-act="run">' + esc(D.run ? S.run : S.calc) + '</button>';
		o += '<button type="button" class="ert-btn" data-act="example">' + esc(S.example) + '</button>';
		if (D.ex2) { o += '<button type="button" class="ert-btn" data-act="example2">' + esc(S.example2) + '</button>'; }
		o += '<button type="button" class="ert-btn ert-btn--g" data-act="reset">' + esc(S.reset) + '</button></div></form>';
		o += '<div class="ert-out" id="ert-out" role="region" aria-label="' + esc(S.result_h) + '" tabindex="-1" hidden></div>';
		o += '<p class="ert-live screen-reader-text" aria-live="polite" id="ert-live"></p>';
		o += '<p class="ert-credit"><a href="https://eretek.com/">' + esc(D.credit[lang]) + '</a></p></section>';

		o += '<div class="ert-doc">';
		o += '<section><h2>' + esc(S.s_what) + '</h2>' + ps(x.intro) + '</section>';
		o += '<section><h2>' + esc(S.s_how) + '</h2><ol class="ert-steps">' + [].concat(x.steps || []).map(function (s) { return '<li>' + k(s) + '</li>'; }).join('') + '</ol>';
		o += '<h3>' + esc(S.s_fields) + '</h3><dl class="ert-dl">' + D.f.map(function (f) { var L = (x.L || {})[f.n] || [f.n, '']; return '<dt>' + esc(L[0]) + '</dt><dd>' + k(L[1] || '') + '</dd>'; }).join('') + '</dl></section>';
		o += '<section><h2>' + esc(S.s_ex) + '</h2>' + exTable(D.ex || {}, x, S) + '<p><strong>' + esc(S.s_ex_out) + ':</strong> ' + k(x.exO) + '</p>' + ps(x.exT);
		if (D.ex2 && x.ex2O) { o += '<h3>' + esc(S.s_ex2) + '</h3>' + exTable(D.ex2, x, S) + '<p><strong>' + esc(S.s_ex_out) + ':</strong> ' + k(x.ex2O) + '</p>' + (x.ex2T ? ps(x.ex2T) : ''); }
		o += '</section>';
		o += '<section><h2>' + esc(S.s_method) + '</h2>' + ps(x.m) + '</section>';
		o += '<section><h2>' + esc(S.s_use) + '</h2>' + ps(x.u) + '</section>';
		o += '<section><h2>' + esc(S.s_lim) + '</h2><ul>' + [].concat(x.lim || []).map(function (l) { return '<li>' + k(l) + '</li>'; }).join('') + '</ul></section>';
		if (x.faq && x.faq.length) { o += '<section class="ert-faq"><h2>' + esc(S.s_faq) + '</h2>' + x.faq.map(function (qa) { return '<h3>' + esc(qa[0]) + '</h3>' + ps(qa[1]); }).join('') + '</section>'; }
		if (D.live[lang]) { o += '<p class="ert-back"><a href="' + esc(D.live[lang]) + '" hreflang="' + lang + '">' + esc(D.liveLabel[lang]) + '</a></p>'; }
		o += '</div></div>';

		var app = document.getElementById('app');
		app.innerHTML = o;
		window.ERT.boot();
	}
	render(pickLang());
}());
