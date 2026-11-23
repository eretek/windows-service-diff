/*! Eretek Online Araçlar #40 — Windows Servis Envanteri Karşılaştırıcı */
ERT.def('40', {
	run: function (v, c) {
		var load = function (t, f) {
			var r = c.csv(t, f, 20000), iN = ERT.csv.col(r.head, ['Name', 'ServiceName']), iS = ERT.csv.col(r.head, ['Status', 'State']), iT = ERT.csv.col(r.head, ['StartType', 'StartMode', 'Start']), iD = ERT.csv.col(r.head, ['DisplayName']);
			if (iN < 0) { throw c.fe(f, 'col', { c: 'Name' }); }
			var m = new Map(); r.rows.forEach(function (x) { m.set(String(x[iN]).toLowerCase(), { name: x[iN], st: iS >= 0 ? x[iS] : null, start: iT >= 0 ? x[iT] : null, disp: iD >= 0 ? x[iD] : '' }); });
			return { m: m, hasT: iT >= 0, hasS: iS >= 0 };
		};
		var A = load(v.a, 'a'), B = load(v.b, 'b'), rows = [], cls = [], cnt = { onlyA: 0, onlyB: 0, chg: 0, same: 0 };
		var u = function (x) { return x === null || x === undefined || x === '' ? c.t('unknown') : x; };
		var nm = function (x) { return String(x || '').toLowerCase().replace(/^auto$/, 'automatic'); };
		A.m.forEach(function (a, k) {
			var b = B.m.get(k);
			if (!b) { cnt.onlyA++; rows.push([a.name, a.disp, u(a.st) + ' / ' + u(a.start), '–', c.t('onlyA')]); cls.push('err'); return; }
			var ch = [];
			if (A.hasS && B.hasS && nm(a.st) !== nm(b.st)) { ch.push(c.t('stCh')); }
			if (A.hasT && B.hasT && nm(a.start) !== nm(b.start)) { ch.push(c.t('stTypeCh')); }
			if (ch.length) { cnt.chg++; rows.push([a.name, a.disp, u(a.st) + ' / ' + u(a.start), u(b.st) + ' / ' + u(b.start), ch.join(', ')]); cls.push('warn'); } else { cnt.same++; }
		});
		B.m.forEach(function (b, k) { if (!A.m.has(k)) { cnt.onlyB++; rows.push([b.name, b.disp, '–', u(b.st) + ' / ' + u(b.start), c.t('onlyB')]); cls.push('ok'); } });
		var msgs = []; if (!A.hasT || !B.hasT) { msgs.push(['info', c.t('noType')]); }
		var cols = [c.t('c_name'), c.t('c_disp'), c.t('c_a'), c.t('c_b'), c.t('c_ch')];
		return { big: c.t('sum', cnt), msgs: msgs, tables: rows.length ? [{ cols: cols, rows: rows, cls: cls }] : [], x: rows.length ? { csv: { name: 'service-diff', cols: cols, rows: rows } } : {}, v: cnt };
	}
});
