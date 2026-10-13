let Go = [], If = [];
(() => {
  let r = "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((e) => e ? parseInt(e, 36) : 1);
  for (let e = 0, t = 0; e < r.length; e++)
    (e % 2 ? If : Go).push(t = t + r[e]);
})();
function Cg(r) {
  if (r < 768) return !1;
  for (let e = 0, t = Go.length; ; ) {
    let i = e + t >> 1;
    if (r < Go[i]) t = i;
    else if (r >= If[i]) e = i + 1;
    else return !0;
    if (e == t) return !1;
  }
}
function kh(r) {
  return r >= 127462 && r <= 127487;
}
const xh = 8205;
function Tg(r, e, t = !0, i = !0) {
  return (t ? Wf : Ag)(r, e, i);
}
function Wf(r, e, t) {
  if (e == r.length) return e;
  e && Yf(r.charCodeAt(e)) && zf(r.charCodeAt(e - 1)) && e--;
  let i = so(r, e);
  for (e += wh(i); e < r.length; ) {
    let n = so(r, e);
    if (i == xh || n == xh || t && Cg(n))
      e += wh(n), i = n;
    else if (kh(n)) {
      let s = 0, o = e - 2;
      for (; o >= 0 && kh(so(r, o)); )
        s++, o -= 2;
      if (s % 2 == 0) break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Ag(r, e, t) {
  for (; e > 1; ) {
    let i = Wf(r, e - 2, t);
    if (i < e) return i;
    e--;
  }
  return 0;
}
function so(r, e) {
  let t = r.charCodeAt(e);
  if (!zf(t) || e + 1 == r.length) return t;
  let i = r.charCodeAt(e + 1);
  return Yf(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function Yf(r) {
  return r >= 56320 && r < 57344;
}
function zf(r) {
  return r >= 55296 && r < 56320;
}
function wh(r) {
  return r < 65536 ? 1 : 2;
}
let me = class Df {
  /**
  Get the line description around the given position.
  */
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  /**
  Get the description for the given (1-based) line number.
  */
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  /**
  Replace a range of the text with the given content.
  */
  replace(e, t, i) {
    [e, t] = fr(this, e, t);
    let n = [];
    return this.decompose(
      0,
      e,
      n,
      2
      /* Open.To */
    ), i.length && i.decompose(
      0,
      i.length,
      n,
      3
      /* Open.To */
    ), this.decompose(
      t,
      this.length,
      n,
      1
      /* Open.From */
    ), Ft.from(n, this.length - (t - e) + i.length);
  }
  /**
  Append another document to this one.
  */
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  /**
  Retrieve the text between the given points.
  */
  slice(e, t = this.length) {
    [e, t] = fr(this, e, t);
    let i = [];
    return this.decompose(e, t, i, 0), Ft.from(i, t - e);
  }
  /**
  Test whether this text is equal to another instance.
  */
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), n = new Yr(this), s = new Yr(e);
    for (let o = t, a = t; ; ) {
      if (n.next(o), s.next(o), o = 0, n.lineBreak != s.lineBreak || n.done != s.done || n.value != s.value)
        return !1;
      if (a += n.value.length, n.done || a >= i)
        return !0;
    }
  }
  /**
  Iterate over the text. When `dir` is `-1`, iteration happens
  from end to start. This will return lines and the breaks between
  them as separate strings.
  */
  iter(e = 1) {
    return new Yr(this, e);
  }
  /**
  Iterate over a range of the text. When `from` > `to`, the
  iterator will run in reverse.
  */
  iterRange(e, t = this.length) {
    return new Vf(this, e, t);
  }
  /**
  Return a cursor that iterates over the given range of lines,
  _without_ returning the line breaks between, and yielding empty
  strings for empty lines.
  
  When `from` and `to` are given, they should be 1-based line numbers.
  */
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let n = this.line(e).from;
      i = this.iterRange(n, Math.max(n, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new Nf(i);
  }
  /**
  Return the document as a string, using newline characters to
  separate lines.
  */
  toString() {
    return this.sliceString(0);
  }
  /**
  Convert the document to an array of lines (which can be
  deserialized again via [`Text.of`](https://codemirror.net/6/docs/ref/#state.Text^of)).
  */
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  /**
  @internal
  */
  constructor() {
  }
  /**
  Create a `Text` instance for the given array of lines.
  */
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? Df.empty : e.length <= 32 ? new Xe(e) : Ft.from(Xe.split(e, []));
  }
};
class Xe extends me {
  constructor(e, t = Mg(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, n) {
    for (let s = 0; ; s++) {
      let o = this.text[s], a = n + o.length;
      if ((t ? i : a) >= e)
        return new Rg(n, a, i, o);
      n = a + 1, i++;
    }
  }
  decompose(e, t, i, n) {
    let s = e <= 0 && t >= this.length ? this : new Xe(Qh(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (n & 1) {
      let o = i.pop(), a = Dn(s.text, o.text.slice(), 0, s.length);
      if (a.length <= 32)
        i.push(new Xe(a, o.length + s.length));
      else {
        let l = a.length >> 1;
        i.push(new Xe(a.slice(0, l)), new Xe(a.slice(l)));
      }
    } else
      i.push(s);
  }
  replace(e, t, i) {
    if (!(i instanceof Xe))
      return super.replace(e, t, i);
    [e, t] = fr(this, e, t);
    let n = Dn(this.text, Dn(i.text, Qh(this.text, 0, e)), t), s = this.length + i.length - (t - e);
    return n.length <= 32 ? new Xe(n, s) : Ft.from(Xe.split(n, []), s);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = fr(this, e, t);
    let n = "";
    for (let s = 0, o = 0; s <= t && o < this.text.length; o++) {
      let a = this.text[o], l = s + a.length;
      s > e && o && (n += i), e < l && t > s && (n += a.slice(Math.max(0, e - s), t - s)), s = l + 1;
    }
    return n;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let i = [], n = -1;
    for (let s of e)
      i.push(s), n += s.length + 1, i.length == 32 && (t.push(new Xe(i, n)), i = [], n = -1);
    return n > -1 && t.push(new Xe(i, n)), t;
  }
}
class Ft extends me {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, n) {
    for (let s = 0; ; s++) {
      let o = this.children[s], a = n + o.length, l = i + o.lines - 1;
      if ((t ? l : a) >= e)
        return o.lineInner(e, t, i, n);
      n = a + 1, i = l + 1;
    }
  }
  decompose(e, t, i, n) {
    for (let s = 0, o = 0; o <= t && s < this.children.length; s++) {
      let a = this.children[s], l = o + a.length;
      if (e <= l && t >= o) {
        let c = n & ((o <= e ? 1 : 0) | (l >= t ? 2 : 0));
        o >= e && l <= t && !c ? i.push(a) : a.decompose(e - o, t - o, i, c);
      }
      o = l + 1;
    }
  }
  replace(e, t, i) {
    if ([e, t] = fr(this, e, t), i.lines < this.lines)
      for (let n = 0, s = 0; n < this.children.length; n++) {
        let o = this.children[n], a = s + o.length;
        if (e >= s && t <= a) {
          let l = o.replace(e - s, t - s, i), c = this.lines - o.lines + l.lines;
          if (l.lines < c >> 4 && l.lines > c >> 6) {
            let u = this.children.slice();
            return u[n] = l, new Ft(u, this.length - (t - e) + i.length);
          }
          return super.replace(s, a, l);
        }
        s = a + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    [e, t] = fr(this, e, t);
    let n = "";
    for (let s = 0, o = 0; s < this.children.length && o <= t; s++) {
      let a = this.children[s], l = o + a.length;
      o > e && s && (n += i), e < l && t > o && (n += a.sliceString(e - o, t - o, i)), o = l + 1;
    }
    return n;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof Ft))
      return 0;
    let i = 0, [n, s, o, a] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; n += t, s += t) {
      if (n == o || s == a)
        return i;
      let l = this.children[n], c = e.children[s];
      if (l != c)
        return i + l.scanIdentical(c, t);
      i += l.length + 1;
    }
  }
  static from(e, t = e.reduce((i, n) => i + n.length + 1, -1)) {
    let i = 0;
    for (let v of e)
      i += v.lines;
    if (i < 32) {
      let v = [];
      for (let b of e)
        b.flatten(v);
      return new Xe(v, t);
    }
    let n = Math.max(
      32,
      i >> 5
      /* Tree.BranchShift */
    ), s = n << 1, o = n >> 1, a = [], l = 0, c = -1, u = [];
    function p(v) {
      let b;
      if (v.lines > s && v instanceof Ft)
        for (let w of v.children)
          p(w);
      else v.lines > o && (l > o || !l) ? (m(), a.push(v)) : v instanceof Xe && l && (b = u[u.length - 1]) instanceof Xe && v.lines + b.lines <= 32 ? (l += v.lines, c += v.length + 1, u[u.length - 1] = new Xe(b.text.concat(v.text), b.length + 1 + v.length)) : (l + v.lines > n && m(), l += v.lines, c += v.length + 1, u.push(v));
    }
    function m() {
      l != 0 && (a.push(u.length == 1 ? u[0] : Ft.from(u, c)), c = -1, l = u.length = 0);
    }
    for (let v of e)
      p(v);
    return m(), a.length == 1 ? a[0] : new Ft(a, t);
  }
}
me.empty = /* @__PURE__ */ new Xe([""], 0);
function Mg(r) {
  let e = -1;
  for (let t of r)
    e += t.length + 1;
  return e;
}
function Dn(r, e, t = 0, i = 1e9) {
  for (let n = 0, s = 0, o = !0; s < r.length && n <= i; s++) {
    let a = r[s], l = n + a.length;
    l >= t && (l > i && (a = a.slice(0, i - n)), n < t && (a = a.slice(t - n)), o ? (e[e.length - 1] += a, o = !1) : e.push(a)), n = l + 1;
  }
  return e;
}
function Qh(r, e, t) {
  return Dn(r, [""], e, t);
}
class Yr {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof Xe ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, n = this.nodes[i], s = this.offsets[i], o = s >> 1, a = n instanceof Xe ? n.text.length : n.children.length;
      if (o == (t > 0 ? a : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((s & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (n instanceof Xe) {
        let l = n.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, l.length > Math.max(0, e))
          return this.value = e == 0 ? l : t > 0 ? l.slice(e) : l.slice(0, l.length - e), this;
        e -= l.length;
      } else {
        let l = n.children[o + (t < 0 ? -1 : 0)];
        e > l.length ? (e -= l.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(l), this.offsets.push(t > 0 ? 1 : (l instanceof Xe ? l.text.length : l.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Vf {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new Yr(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: n } = this.cursor.next(e);
    return this.pos += (n.length + e) * t, this.value = n.length <= i ? n : t < 0 ? n.slice(n.length - i) : n.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class Nf {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: n } = this.inner.next(e);
    return t && this.afterBreak ? (this.value = "", this.afterBreak = !1) : t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = n, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (me.prototype[Symbol.iterator] = function() {
  return this.iter();
}, Yr.prototype[Symbol.iterator] = Vf.prototype[Symbol.iterator] = Nf.prototype[Symbol.iterator] = function() {
  return this;
});
let Rg = class {
  /**
  @internal
  */
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.number = i, this.text = n;
  }
  /**
  The length of the line (not including any line break after it).
  */
  get length() {
    return this.to - this.from;
  }
};
function fr(r, e, t) {
  return e = Math.max(0, Math.min(r.length, e)), [e, Math.max(e, Math.min(r.length, t))];
}
function We(r, e, t = !0, i = !0) {
  return Tg(r, e, t, i);
}
function Zg(r) {
  return r >= 56320 && r < 57344;
}
function Xg(r) {
  return r >= 55296 && r < 56320;
}
function Ha(r, e) {
  let t = r.charCodeAt(e);
  if (!Xg(t) || e + 1 == r.length)
    return t;
  let i = r.charCodeAt(e + 1);
  return Zg(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function Lg(r) {
  return r <= 65535 ? String.fromCharCode(r) : (r -= 65536, String.fromCharCode((r >> 10) + 55296, (r & 1023) + 56320));
}
function qf(r) {
  return r < 65536 ? 1 : 2;
}
const Uo = /\r\n?|\n/;
var Ue = /* @__PURE__ */ (function(r) {
  return r[r.Simple = 0] = "Simple", r[r.TrackDel = 1] = "TrackDel", r[r.TrackBefore = 2] = "TrackBefore", r[r.TrackAfter = 3] = "TrackAfter", r;
})(Ue || (Ue = {}));
class ii {
  // Sections are encoded as pairs of integers. The first is the
  // length in the current document, and the second is -1 for
  // unaffected sections, and the length of the replacement content
  // otherwise. So an insertion would be (0, n>0), a deletion (n>0,
  // 0), and a replacement two positive numbers.
  /**
  @internal
  */
  constructor(e) {
    this.sections = e;
  }
  /**
  The length of the document before the change.
  */
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  /**
  The length of the document after the change.
  */
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t + 1];
      e += i < 0 ? this.sections[t] : i;
    }
    return e;
  }
  /**
  False when there are actual changes in this set.
  */
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  /**
  Iterate over the unchanged parts left by these changes. `posA`
  provides the position of the range in the old document, `posB`
  the new position in the changed document.
  */
  iterGaps(e) {
    for (let t = 0, i = 0, n = 0; t < this.sections.length; ) {
      let s = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(i, n, s), n += s) : n += o, i += s;
    }
  }
  /**
  Iterate over the ranges changed by these changes. (See
  [`ChangeSet.iterChanges`](https://codemirror.net/6/docs/ref/#state.ChangeSet.iterChanges) for a
  variant that also provides you with the inserted text.)
  `fromA`/`toA` provides the extent of the change in the starting
  document, `fromB`/`toB` the extent of the replacement in the
  changed document.
  
  When `individual` is true, adjacent changes (which are kept
  separate for [position mapping](https://codemirror.net/6/docs/ref/#state.ChangeDesc.mapPos)) are
  reported separately.
  */
  iterChangedRanges(e, t = !1) {
    Fo(this, e, t);
  }
  /**
  Get a description of the inverted form of these changes.
  */
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], n = this.sections[t++];
      n < 0 ? e.push(i, n) : e.push(n, i);
    }
    return new ii(e);
  }
  /**
  Compute the combined effect of applying another set of changes
  after this one. The length of the document after this set should
  match the length before `other`.
  */
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Gf(this, e);
  }
  /**
  Map this description, which should start with the same document
  as `other`, over another set of changes, so that it can be
  applied after it. When `before` is true, map as if the changes
  in `this` happened before the ones in `other`.
  */
  mapDesc(e, t = !1) {
    return e.empty ? this : Ho(this, e, t);
  }
  mapPos(e, t = -1, i = Ue.Simple) {
    let n = 0, s = 0;
    for (let o = 0; o < this.sections.length; ) {
      let a = this.sections[o++], l = this.sections[o++], c = n + a;
      if (l < 0) {
        if (c > e)
          return s + (e - n);
        s += a;
      } else {
        if (i != Ue.Simple && c >= e && (i == Ue.TrackDel && n < e && c > e || i == Ue.TrackBefore && n < e || i == Ue.TrackAfter && c > e))
          return null;
        if (c > e || c == e && t < 0 && !a)
          return e == n || t < 0 ? s : s + l;
        s += l;
      }
      n = c;
    }
    if (e > n)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${n}`);
    return s;
  }
  /**
  Check whether these changes touch a given range. When one of the
  changes entirely covers the range, the string `"cover"` is
  returned.
  */
  touchesRange(e, t = e) {
    for (let i = 0, n = 0; i < this.sections.length && n <= t; ) {
      let s = this.sections[i++], o = this.sections[i++], a = n + s;
      if (o >= 0 && n <= t && a >= e)
        return n < e && a > t ? "cover" : !0;
      n = a;
    }
    return !1;
  }
  /**
  @internal
  */
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], n = this.sections[t++];
      e += (e ? " " : "") + i + (n >= 0 ? ":" + n : "");
    }
    return e;
  }
  /**
  Serialize this change desc to a JSON-representable value.
  */
  toJSON() {
    return this.sections;
  }
  /**
  Create a change desc from its JSON representation (as produced
  by [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeDesc.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ii(e);
  }
  /**
  @internal
  */
  static create(e) {
    return new ii(e);
  }
}
class Be extends ii {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  /**
  Apply the changes to a document, returning the modified
  document.
  */
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Fo(this, (t, i, n, s, o) => e = e.replace(n, n + (i - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return Ho(this, e, t, !0);
  }
  /**
  Given the document as it existed _before_ the changes, return a
  change set that represents the inverse of this set, which could
  be used to go from the document created by the changes back to
  the document as it existed before the changes.
  */
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let n = 0, s = 0; n < t.length; n += 2) {
      let o = t[n], a = t[n + 1];
      if (a >= 0) {
        t[n] = a, t[n + 1] = o;
        let l = n >> 1;
        for (; i.length < l; )
          i.push(me.empty);
        i.push(o ? e.slice(s, s + o) : me.empty);
      }
      s += o;
    }
    return new Be(t, i);
  }
  /**
  Combine two subsequent change sets into a single set. `other`
  must start in the document produced by `this`. If `this` goes
  `docA` → `docB` and `other` represents `docB` → `docC`, the
  returned value will represent the change `docA` → `docC`.
  */
  compose(e) {
    return this.empty ? e : e.empty ? this : Gf(this, e, !0);
  }
  /**
  Given another change set starting in the same document, maps this
  change set over the other, producing a new change set that can be
  applied to the document produced by applying `other`. When
  `before` is `true`, order changes as if `this` comes before
  `other`, otherwise (the default) treat `other` as coming first.
  
  Given two changes `A` and `B`, `A.compose(B.map(A))` and
  `B.compose(A.map(B, true))` will produce the same document. This
  provides a basic form of [operational
  transformation](https://en.wikipedia.org/wiki/Operational_transformation),
  and can be used for collaborative editing.
  */
  map(e, t = !1) {
    return e.empty ? this : Ho(this, e, t, !0);
  }
  /**
  Iterate over the changed ranges in the document, calling `f` for
  each, with the range in the original document (`fromA`-`toA`)
  and the range that replaces it in the new document
  (`fromB`-`toB`).
  
  When `individual` is true, adjacent changes are reported
  separately.
  */
  iterChanges(e, t = !1) {
    Fo(this, e, t);
  }
  /**
  Get a [change description](https://codemirror.net/6/docs/ref/#state.ChangeDesc) for this change
  set.
  */
  get desc() {
    return ii.create(this.sections);
  }
  /**
  @internal
  */
  filter(e) {
    let t = [], i = [], n = [], s = new Ur(this);
    e: for (let o = 0, a = 0; ; ) {
      let l = o == e.length ? 1e9 : e[o++];
      for (; a < l || a == l && s.len == 0; ) {
        if (s.done)
          break e;
        let u = Math.min(s.len, l - a);
        tt(n, u, -1);
        let p = s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0;
        tt(t, u, p), p > 0 && bi(i, t, s.text), s.forward(u), a += u;
      }
      let c = e[o++];
      for (; a < c; ) {
        if (s.done)
          break e;
        let u = Math.min(s.len, c - a);
        tt(t, u, -1), tt(n, u, s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0), s.forward(u), a += u;
      }
    }
    return {
      changes: new Be(t, i),
      filtered: ii.create(n)
    };
  }
  /**
  Serialize this change set to a JSON-representable value.
  */
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], n = this.sections[t + 1];
      n < 0 ? e.push(i) : n == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  /**
  Create a change set for the given changes, for a document of the
  given length, using `lineSep` as line separator.
  */
  static of(e, t, i) {
    let n = [], s = [], o = 0, a = null;
    function l(u = !1) {
      if (!u && !n.length)
        return;
      o < t && tt(n, t - o, -1);
      let p = new Be(n, s);
      a = a ? a.compose(p.map(a)) : p, n = [], s = [], o = 0;
    }
    function c(u) {
      if (Array.isArray(u))
        for (let p of u)
          c(p);
      else if (u instanceof Be) {
        if (u.length != t)
          throw new RangeError(`Mismatched change set length (got ${u.length}, expected ${t})`);
        l(), a = a ? a.compose(u.map(a)) : u;
      } else {
        let { from: p, to: m = p, insert: v } = u;
        if (p > m || p < 0 || m > t)
          throw new RangeError(`Invalid change range ${p} to ${m} (in doc of length ${t})`);
        let b = v ? typeof v == "string" ? me.of(v.split(i || Uo)) : v : me.empty, w = b.length;
        if (p == m && w == 0)
          return;
        p < o && l(), p > o && tt(n, p - o, -1), tt(n, m - p, w), bi(s, n, b), o = m;
      }
    }
    return c(e), l(!a), a;
  }
  /**
  Create an empty changeset of the given length.
  */
  static empty(e) {
    return new Be(e ? [e, -1] : [], []);
  }
  /**
  Create a changeset from its JSON representation (as produced by
  [`toJSON`](https://codemirror.net/6/docs/ref/#state.ChangeSet.toJSON).
  */
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      if (typeof s == "number")
        t.push(s, -1);
      else {
        if (!Array.isArray(s) || typeof s[0] != "number" || s.some((o, a) => a && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (s.length == 1)
          t.push(s[0], 0);
        else {
          for (; i.length < n; )
            i.push(me.empty);
          i[n] = me.of(s.slice(1)), t.push(s[0], i[n].length);
        }
      }
    }
    return new Be(t, i);
  }
  /**
  @internal
  */
  static createSet(e, t) {
    return new Be(e, t);
  }
}
function tt(r, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let n = r.length - 2;
  n >= 0 && t <= 0 && t == r[n + 1] ? r[n] += e : n >= 0 && e == 0 && r[n] == 0 ? r[n + 1] += t : i ? (r[n] += e, r[n + 1] += t) : r.push(e, t);
}
function bi(r, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < r.length)
    r[r.length - 1] = r[r.length - 1].append(t);
  else {
    for (; r.length < i; )
      r.push(me.empty);
    r.push(t);
  }
}
function Fo(r, e, t) {
  let i = r.inserted;
  for (let n = 0, s = 0, o = 0; o < r.sections.length; ) {
    let a = r.sections[o++], l = r.sections[o++];
    if (l < 0)
      n += a, s += a;
    else {
      let c = n, u = s, p = me.empty;
      for (; c += a, u += l, l && i && (p = p.append(i[o - 2 >> 1])), !(t || o == r.sections.length || r.sections[o + 1] < 0); )
        a = r.sections[o++], l = r.sections[o++];
      e(n, c, s, u, p), n = c, s = u;
    }
  }
}
function Ho(r, e, t, i = !1) {
  let n = [], s = i ? [] : null, o = new Ur(r), a = new Ur(e);
  for (let l = -1; ; ) {
    if (o.done && a.len || a.done && o.len)
      throw new Error("Mismatched change set lengths");
    if (o.ins == -1 && a.ins == -1) {
      let c = Math.min(o.len, a.len);
      tt(n, c, -1), o.forward(c), a.forward(c);
    } else if (a.ins >= 0 && (o.ins < 0 || l == o.i || o.off == 0 && (a.len < o.len || a.len == o.len && !t))) {
      let c = a.len;
      for (tt(n, a.ins, -1); c; ) {
        let u = Math.min(o.len, c);
        o.ins >= 0 && l < o.i && o.len <= u && (tt(n, 0, o.ins), s && bi(s, n, o.text), l = o.i), o.forward(u), c -= u;
      }
      a.next();
    } else if (o.ins >= 0) {
      let c = 0, u = o.len;
      for (; u; )
        if (a.ins == -1) {
          let p = Math.min(u, a.len);
          c += p, u -= p, a.forward(p);
        } else if (a.ins == 0 && a.len < u)
          u -= a.len, a.next();
        else
          break;
      tt(n, c, l < o.i ? o.ins : 0), s && l < o.i && bi(s, n, o.text), l = o.i, o.forward(o.len - u);
    } else {
      if (o.done && a.done)
        return s ? Be.createSet(n, s) : ii.create(n);
      throw new Error("Mismatched change set lengths");
    }
  }
}
function Gf(r, e, t = !1) {
  let i = [], n = t ? [] : null, s = new Ur(r), o = new Ur(e);
  for (let a = !1; ; ) {
    if (s.done && o.done)
      return n ? Be.createSet(i, n) : ii.create(i);
    if (s.ins == 0)
      tt(i, s.len, 0, a), s.next();
    else if (o.len == 0 && !o.done)
      tt(i, 0, o.ins, a), n && bi(n, i, o.text), o.next();
    else {
      if (s.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let l = Math.min(s.len2, o.len), c = i.length;
        if (s.ins == -1) {
          let u = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          tt(i, l, u, a), n && u && bi(n, i, o.text);
        } else o.ins == -1 ? (tt(i, s.off ? 0 : s.len, l, a), n && bi(n, i, s.textBit(l))) : (tt(i, s.off ? 0 : s.len, o.off ? 0 : o.ins, a), n && !o.off && bi(n, i, o.text));
        a = (s.ins > l || o.ins >= 0 && o.len > l) && (a || i.length > c), s.forward2(l), o.forward(l);
      }
    }
  }
}
class Ur {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? me.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? me.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class vi {
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.flags = i, this.goalColumn = n;
  }
  /**
  The anchor of the range—the side that doesn't move when you
  extend it.
  */
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  /**
  The head of the range, which is moved when the range is
  [extended](https://codemirror.net/6/docs/ref/#state.SelectionRange.extend).
  */
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  /**
  True when `anchor` and `head` are at the same position.
  */
  get empty() {
    return this.from == this.to;
  }
  /**
  If this is a cursor that is explicitly associated with the
  character on one of its sides, this returns the side. -1 means
  the character before its position, 1 the character after, and 0
  means no association.
  */
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  /**
  A flag that, when set, makes some selection-extending commands
  treat the range's head and anchor as exchangeable, so that for
  example Shift-ArrowUp will make the lower side of the selection
  the anchor, even if that was the head before. Used to implement
  MacOS-style undirectional selections.
  */
  get undirectional() {
    return (this.flags & 64) > 0;
  }
  /**
  The bidirectional text level associated with this cursor, if
  any.
  */
  get bidiLevel() {
    let e = this.flags & 7;
    return e == 7 ? null : e;
  }
  /**
  Map this range through a change, producing a valid range in the
  updated document.
  */
  map(e, t = -1) {
    let i, n;
    return this.empty ? i = n = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), n = e.mapPos(this.to, -1)), i == this.from && n == this.to ? this : new vi(i, n, this.flags, this.goalColumn);
  }
  /**
  Extend this range to cover at least `from` to `to`.
  */
  extend(e, t = e, i = 0) {
    if (e <= this.anchor && t >= this.anchor)
      return L.range(e, t, void 0, void 0, i);
    let n = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return L.range(this.anchor, n, void 0, void 0, i);
  }
  /**
  Compare this range to another range.
  */
  eq(e, t = !1) {
    return this.anchor == e.anchor && this.head == e.head && this.goalColumn == e.goalColumn && (!t || !this.empty || this.assoc == e.assoc);
  }
  /**
  Return a JSON-serializable object representing the range.
  */
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  /**
  Convert a JSON representation of a range to a `SelectionRange`
  instance.
  */
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return L.range(e.anchor, e.head);
  }
  /**
  @internal
  */
  static create(e, t, i, n) {
    return new vi(e, t, i, n);
  }
}
class L {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  /**
  Map a selection through a change. Used to adjust the selection
  position for changes.
  */
  map(e, t = -1) {
    return e.empty ? this : L.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
  }
  /**
  Compare this selection to another selection. By default, ranges
  are compared only by position. When `includeAssoc` is true,
  cursor ranges must also have the same
  [`assoc`](https://codemirror.net/6/docs/ref/#state.SelectionRange.assoc) value.
  */
  eq(e, t = !1) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(e.ranges[i], t))
        return !1;
    return !0;
  }
  /**
  Get the primary selection range. Usually, you should make sure
  your code applies to _all_ ranges, by using methods like
  [`changeByRange`](https://codemirror.net/6/docs/ref/#state.EditorState.changeByRange).
  */
  get main() {
    return this.ranges[this.mainIndex];
  }
  /**
  Make sure the selection only has one range. Returns a selection
  holding only the main range from this selection.
  */
  asSingle() {
    return this.ranges.length == 1 ? this : new L([this.main], 0);
  }
  /**
  Extend this selection with an extra range.
  */
  addRange(e, t = !0) {
    return L.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  /**
  Replace a given range with another range, and then normalize the
  selection to merge and sort ranges if necessary.
  */
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, L.create(i, this.mainIndex);
  }
  /**
  Convert this selection to an object that can be serialized to
  JSON.
  */
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  /**
  Create a selection from a JSON representation.
  */
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new L(e.ranges.map((t) => vi.fromJSON(t)), e.main);
  }
  /**
  Create a selection holding a single range.
  */
  static single(e, t = e) {
    return new L([L.range(e, t)], 0);
  }
  /**
  Sort and merge the given set of ranges, creating a valid
  selection.
  */
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, n = 0; n < e.length; n++) {
      let s = e[n];
      if (s.empty ? s.from <= i : s.from < i)
        return L.normalized(e.slice(), t);
      i = s.to;
    }
    return new L(e, t);
  }
  /**
  Create a cursor selection range at the given position. You can
  safely ignore the optional arguments in most situations.
  */
  static cursor(e, t = 0, i, n) {
    return vi.create(e, e, (t == 0 ? 0 : t < 0 ? 8 : 16) | (i == null ? 7 : Math.min(6, i)), n);
  }
  /**
  Create a selection range.
  */
  static range(e, t, i, n, s) {
    let o = n == null ? 7 : Math.min(6, n);
    return !s && e != t && (s = t < e ? 1 : -1), s && (o |= s < 0 ? 8 : 16), t < e ? vi.create(t, e, o | 32, i) : vi.create(e, t, o, i);
  }
  /**
  Create an [undirectional](https://codemirror.net/6/docs/ref/#state.SelectionRange.undirectional)
  selection range.
  */
  static undirectionalRange(e, t) {
    return vi.create(e, t, 64, void 0);
  }
  /**
  @internal
  */
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((n, s) => n.from - s.from), t = e.indexOf(i);
    for (let n = 1; n < e.length; n++) {
      let s = e[n], o = e[n - 1];
      if (s.empty ? s.from <= o.to : s.from < o.to) {
        let a = o.from, l = Math.max(s.to, o.to);
        n <= t && t--, e.splice(--n, 2, s.anchor > s.head ? L.range(l, a) : L.range(a, l));
      }
    }
    return new L(e, t);
  }
}
function Uf(r, e) {
  for (let t of r.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let Ka = 0;
class q {
  constructor(e, t, i, n, s) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = n, this.id = Ka++, this.default = e([]), this.extensions = typeof s == "function" ? s(this) : s;
  }
  /**
  Returns a facet reader for this facet, which can be used to
  [read](https://codemirror.net/6/docs/ref/#state.EditorState.facet) it but not to define values for it.
  */
  get reader() {
    return this;
  }
  /**
  Define a new facet.
  */
  static define(e = {}) {
    return new q(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Ja), !!e.static, e.enables);
  }
  /**
  Returns an extension that adds the given value to this facet.
  */
  of(e) {
    return new Vn([], this, 0, e);
  }
  /**
  Create an extension that computes a value for the facet from a
  state. You must take care to declare the parts of the state that
  this value depends on, since your function is only called again
  for a new state when one of those parts changed.
  
  In cases where your value depends only on a single field, you'll
  want to use the [`from`](https://codemirror.net/6/docs/ref/#state.Facet.from) method instead.
  */
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Vn(e, this, 1, t);
  }
  /**
  Create an extension that computes zero or more values for this
  facet from a state.
  */
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Vn(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Ja(r, e) {
  return r == e || r.length == e.length && r.every((t, i) => t === e[i]);
}
class Vn {
  constructor(e, t, i, n) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = n, this.id = Ka++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, n = this.facet.compareInput, s = this.id, o = e[s] >> 1, a = this.type == 2, l = !1, c = !1, u = [];
    for (let p of this.dependencies)
      p == "doc" ? l = !0 : p == "selection" ? c = !0 : (((t = e[p.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && u.push(e[p.id]);
    return {
      create(p) {
        return p.values[o] = i(p), 1;
      },
      update(p, m) {
        if (l && m.docChanged || c && (m.docChanged || m.selection) || Ko(p, u)) {
          let v = i(p);
          if (a ? !$h(v, p.values[o], n) : !n(v, p.values[o]))
            return p.values[o] = v, 1;
        }
        return 0;
      },
      reconfigure: (p, m) => {
        let v, b = m.config.address[s];
        if (b != null) {
          let w = ns(m, b);
          if (this.dependencies.every((C) => C instanceof q ? m.facet(C) === p.facet(C) : C instanceof Ke ? m.field(C, !1) == p.field(C, !1) : !0) || (a ? $h(v = i(p), w, n) : n(v = i(p), w)))
            return p.values[o] = w, 0;
        } else
          v = i(p);
        return p.values[o] = v, 1;
      }
    };
  }
  get extension() {
    return this;
  }
}
function $h(r, e, t) {
  if (r.length != e.length)
    return !1;
  for (let i = 0; i < r.length; i++)
    if (!t(r[i], e[i]))
      return !1;
  return !0;
}
function Ko(r, e) {
  let t = !1;
  for (let i of e)
    zr(r, i) & 1 && (t = !0);
  return t;
}
function Eg(r, e, t) {
  let i = t.map((l) => r[l.id]), n = t.map((l) => l.type), s = i.filter((l) => !(l & 1)), o = r[e.id] >> 1;
  function a(l) {
    let c = [];
    for (let u = 0; u < i.length; u++) {
      let p = ns(l, i[u]);
      if (n[u] == 2)
        for (let m of p)
          c.push(m);
      else
        c.push(p);
    }
    return e.combine(c);
  }
  return {
    create(l) {
      for (let c of i)
        zr(l, c);
      return l.values[o] = a(l), 1;
    },
    update(l, c) {
      if (!Ko(l, s))
        return 0;
      let u = a(l);
      return e.compare(u, l.values[o]) ? 0 : (l.values[o] = u, 1);
    },
    reconfigure(l, c) {
      let u = Ko(l, i), p = c.config.facets[e.id], m = c.facet(e);
      if (p && !u && Ja(t, p))
        return l.values[o] = m, 0;
      let v = a(l);
      return e.compare(v, m) ? (l.values[o] = m, 0) : (l.values[o] = v, 1);
    }
  };
}
const Qn = /* @__PURE__ */ q.define({ static: !0 });
class Ke {
  constructor(e, t, i, n, s) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = n, this.spec = s, this.provides = void 0;
  }
  /**
  Define a state field.
  */
  static define(e) {
    let t = new Ke(Ka++, e.create, e.update, e.compare || ((i, n) => i === n), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(Qn).find((i) => i.field == this);
    return (t?.create || this.createF)(e);
  }
  /**
  @internal
  */
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, n) => {
        let s = i.values[t], o = this.updateF(s, n);
        return this.compareF(s, o) ? 0 : (i.values[t] = o, 1);
      },
      reconfigure: (i, n) => {
        let s = i.facet(Qn), o = n.facet(Qn), a;
        return (a = s.find((l) => l.field == this)) && a != o.find((l) => l.field == this) ? (i.values[t] = a.create(i), 1) : n.config.address[this.id] != null ? (i.values[t] = n.field(this), 0) : (i.values[t] = this.create(i), 1);
      }
    };
  }
  /**
  Returns an extension that enables this field and overrides the
  way it is initialized. Can be useful when you need to provide a
  non-default starting value for the field.
  */
  init(e) {
    return [this, Qn.of({ field: this, create: e })];
  }
  /**
  State field instances can be used as
  [`Extension`](https://codemirror.net/6/docs/ref/#state.Extension) values to enable the field in a
  given state.
  */
  get extension() {
    return this;
  }
}
const Li = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function Ar(r) {
  return (e) => new Ff(e, r);
}
const qi = {
  /**
  The highest precedence level, for extensions that should end up
  near the start of the precedence ordering.
  */
  highest: /* @__PURE__ */ Ar(Li.highest),
  /**
  A higher-than-default precedence, for extensions that should
  come before those with default precedence.
  */
  high: /* @__PURE__ */ Ar(Li.high),
  /**
  The default precedence, which is also used for extensions
  without an explicit precedence.
  */
  default: /* @__PURE__ */ Ar(Li.default),
  /**
  A lower-than-default precedence.
  */
  low: /* @__PURE__ */ Ar(Li.low),
  /**
  The lowest precedence level. Meant for things that should end up
  near the end of the extension order.
  */
  lowest: /* @__PURE__ */ Ar(Li.lowest)
};
class Ff {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
  get extension() {
    return this;
  }
}
class Rs {
  /**
  Create an instance of this compartment to add to your [state
  configuration](https://codemirror.net/6/docs/ref/#state.EditorStateConfig.extensions).
  */
  of(e) {
    return new Jo(this, e);
  }
  /**
  Create an [effect](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) that
  reconfigures this compartment.
  */
  reconfigure(e) {
    return Rs.reconfigure.of({ compartment: this, extension: e });
  }
  /**
  Get the current content of the compartment in the state, or
  `undefined` if it isn't present.
  */
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Jo {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
  get extension() {
    return this;
  }
}
class rs {
  constructor(e, t, i, n, s, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = n, this.staticValues = s, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(
        0
        /* SlotStatus.Unresolved */
      );
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let n = [], s = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let m of _g(e, t, o))
      m instanceof Ke ? n.push(m) : (s[m.facet.id] || (s[m.facet.id] = [])).push(m);
    let a = /* @__PURE__ */ Object.create(null), l = [], c = [];
    for (let m of n)
      a[m.id] = c.length << 1, c.push((v) => m.slot(v));
    let u = i?.config.facets;
    for (let m in s) {
      let v = s[m], b = v[0].facet, w = u && u[m] || [];
      if (v.every(
        (C) => C.type == 0
        /* Provider.Static */
      ))
        if (a[b.id] = l.length << 1 | 1, Ja(w, v))
          l.push(i.facet(b));
        else {
          let C = b.combine(v.map((A) => A.value));
          l.push(i && b.compare(C, i.facet(b)) ? i.facet(b) : C);
        }
      else {
        for (let C of v)
          C.type == 0 ? (a[C.id] = l.length << 1 | 1, l.push(C.value)) : (a[C.id] = c.length << 1, c.push((A) => C.dynamicSlot(A)));
        a[b.id] = c.length << 1, c.push((C) => Eg(C, b, v));
      }
    }
    let p = c.map((m) => m(a));
    return new rs(e, o, p, a, l, s);
  }
}
function _g(r, e, t) {
  let i = [[], [], [], [], []], n = /* @__PURE__ */ new Map();
  function s(o, a) {
    let l = n.get(o);
    if (l != null) {
      if (l <= a)
        return;
      let c = i[l].indexOf(o);
      c > -1 && i[l].splice(c, 1), o instanceof Jo && t.delete(o.compartment);
    }
    if (n.set(o, a), Array.isArray(o))
      for (let c of o)
        s(c, a);
    else if (o instanceof Jo) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let c = e.get(o.compartment) || o.inner;
      t.set(o.compartment, c), s(c, a);
    } else if (o instanceof Ff)
      s(o.inner, o.prec);
    else if (o instanceof Ke)
      i[a].push(o), o.provides && s(o.provides, a);
    else if (o instanceof Vn)
      i[a].push(o), o.facet.extensions && s(o.facet.extensions, Li.default);
    else {
      let c = o.extension;
      if (!c)
        throw new Error(`Unrecognized extension value in extension set (${o}).`);
      if (c == o)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      s(c, a);
    }
  }
  return s(r, Li.default), i.reduce((o, a) => o.concat(a));
}
function zr(r, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = r.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  r.status[t] = 4;
  let n = r.computeSlot(r, r.config.dynamicSlots[t]);
  return r.status[t] = 2 | n;
}
function ns(r, e) {
  return e & 1 ? r.config.staticValues[e >> 1] : r.values[e >> 1];
}
const Hf = /* @__PURE__ */ q.define(), ea = /* @__PURE__ */ q.define({
  combine: (r) => r.some((e) => e),
  static: !0
}), Kf = /* @__PURE__ */ q.define({
  combine: (r) => r.length ? r[0] : void 0,
  static: !0
}), Jf = /* @__PURE__ */ q.define(), eu = /* @__PURE__ */ q.define(), tu = /* @__PURE__ */ q.define(), iu = /* @__PURE__ */ q.define({
  combine: (r) => r.length ? r[0] : !1
});
class ui {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Define a new type of annotation.
  */
  static define() {
    return new Bg();
  }
}
class Bg {
  /**
  Create an instance of this annotation.
  */
  of(e) {
    return new ui(this, e);
  }
}
class jg {
  /**
  @internal
  */
  constructor(e) {
    this.map = e;
  }
  /**
  Create a [state effect](https://codemirror.net/6/docs/ref/#state.StateEffect) instance of this
  type.
  */
  of(e) {
    return new be(this, e);
  }
}
class be {
  /**
  @internal
  */
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  /**
  Map this effect through a position mapping. Will return
  `undefined` when that ends up deleting the effect.
  */
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new be(this.type, t);
  }
  /**
  Tells you whether this effect object is of a given
  [type](https://codemirror.net/6/docs/ref/#state.StateEffectType).
  */
  is(e) {
    return this.type == e;
  }
  /**
  Define a new effect type. The type parameter indicates the type
  of values that his effect holds. It should be a type that
  doesn't include `undefined`, since that is used in
  [mapping](https://codemirror.net/6/docs/ref/#state.StateEffect.map) to indicate that an effect is
  removed.
  */
  static define(e = {}) {
    return new jg(e.map || ((t) => t));
  }
  /**
  Map an array of effects through a change set.
  */
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let n of e) {
      let s = n.map(t);
      s && i.push(s);
    }
    return i;
  }
}
be.reconfigure = /* @__PURE__ */ be.define();
be.appendConfig = /* @__PURE__ */ be.define();
class _e {
  constructor(e, t, i, n, s, o) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = n, this.annotations = s, this.scrollIntoView = o, this._doc = null, this._state = null, i && Uf(i, t.newLength), s.some((a) => a.type == _e.time) || (this.annotations = s.concat(_e.time.of(Date.now())));
  }
  /**
  @internal
  */
  static create(e, t, i, n, s, o) {
    return new _e(e, t, i, n, s, o);
  }
  /**
  The new document produced by the transaction. Contrary to
  [`.state`](https://codemirror.net/6/docs/ref/#state.Transaction.state)`.doc`, accessing this won't
  force the entire new state to be computed right away, so it is
  recommended that [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) use this getter
  when they need to look at the new document.
  */
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  /**
  The new selection produced by the transaction. If
  [`this.selection`](https://codemirror.net/6/docs/ref/#state.Transaction.selection) is undefined,
  this will [map](https://codemirror.net/6/docs/ref/#state.EditorSelection.map) the start state's
  current selection through the changes made by the transaction.
  */
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  /**
  The new state created by the transaction. Computed on demand
  (but retained for subsequent access), so it is recommended not to
  access it in [transaction
  filters](https://codemirror.net/6/docs/ref/#state.EditorState^transactionFilter) when possible.
  */
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  /**
  Get the value of the given annotation type, if any.
  */
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  /**
  Indicates whether the transaction changed the document.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Indicates whether this transaction reconfigures the state
  (through a [configuration compartment](https://codemirror.net/6/docs/ref/#state.Compartment) or
  with a top-level configuration
  [effect](https://codemirror.net/6/docs/ref/#state.StateEffect^reconfigure).
  */
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  /**
  Returns true if the transaction has a [user
  event](https://codemirror.net/6/docs/ref/#state.Transaction^userEvent) annotation that is equal to
  or more specific than `event`. For example, if the transaction
  has `"select.pointer"` as user event, `"select"` and
  `"select.pointer"` will match it.
  */
  isUserEvent(e) {
    let t = this.annotation(_e.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
_e.time = /* @__PURE__ */ ui.define();
_e.userEvent = /* @__PURE__ */ ui.define();
_e.addToHistory = /* @__PURE__ */ ui.define();
_e.remote = /* @__PURE__ */ ui.define();
function Ig(r, e) {
  let t = [];
  for (let i = 0, n = 0; ; ) {
    let s, o;
    if (i < r.length && (n == e.length || e[n] >= r[i]))
      s = r[i++], o = r[i++];
    else if (n < e.length)
      s = e[n++], o = e[n++];
    else
      return t;
    !t.length || t[t.length - 1] < s ? t.push(s, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function ru(r, e, t) {
  var i;
  let n, s, o;
  return t ? (n = e.changes, s = Be.empty(e.changes.length), o = r.changes.compose(e.changes)) : (n = e.changes.map(r.changes), s = r.changes.mapDesc(e.changes, !0), o = r.changes.compose(n)), {
    changes: o,
    selection: e.selection ? e.selection.map(s) : (i = r.selection) === null || i === void 0 ? void 0 : i.map(n),
    effects: be.mapEffects(r.effects, n).concat(be.mapEffects(e.effects, s)),
    annotations: r.annotations.length ? r.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: r.scrollIntoView || e.scrollIntoView
  };
}
function ta(r, e, t) {
  let i = e.selection, n = nr(e.annotations);
  return e.userEvent && (n = n.concat(_e.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof Be ? e.changes : Be.of(e.changes || [], t, r.facet(Kf)),
    selection: i && (i instanceof L ? i : L.single(i.anchor, i.head)),
    effects: nr(e.effects),
    annotations: n,
    scrollIntoView: !!e.scrollIntoView
  };
}
function nu(r, e, t) {
  let i = ta(r, e.length ? e[0] : {}, r.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let s = 1; s < e.length; s++) {
    e[s].filter === !1 && (t = !1);
    let o = !!e[s].sequential;
    i = ru(i, ta(r, e[s], o ? i.changes.newLength : r.doc.length), o);
  }
  let n = _e.create(r, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return Yg(t ? Wg(n) : n);
}
function Wg(r) {
  let e = r.startState, t = !0;
  for (let n of e.facet(Jf)) {
    let s = n(r);
    if (s === !1) {
      t = !1;
      break;
    }
    Array.isArray(s) && (t = t === !0 ? s : Ig(t, s));
  }
  if (t !== !0) {
    let n, s;
    if (t === !1)
      s = r.changes.invertedDesc, n = Be.empty(e.doc.length);
    else {
      let o = r.changes.filter(t);
      n = o.changes, s = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    r = _e.create(e, n, r.selection && r.selection.map(s), be.mapEffects(r.effects, s), r.annotations, r.scrollIntoView);
  }
  let i = e.facet(eu);
  for (let n = i.length - 1; n >= 0; n--) {
    let s = i[n](r);
    s instanceof _e ? r = s : Array.isArray(s) && s.length == 1 && s[0] instanceof _e ? r = s[0] : r = nu(e, nr(s), !1);
  }
  return r;
}
function Yg(r) {
  let e = r.startState, t = e.facet(tu), i = r;
  for (let n = t.length - 1; n >= 0; n--) {
    let s = t[n](r);
    s && Object.keys(s).length && (i = ru(i, ta(e, s, r.changes.newLength), !0));
  }
  return i == r ? r : _e.create(e, r.changes, r.selection, i.effects, i.annotations, i.scrollIntoView);
}
const zg = [];
function nr(r) {
  return r == null ? zg : Array.isArray(r) ? r : [r];
}
var Fe = /* @__PURE__ */ (function(r) {
  return r[r.Word = 0] = "Word", r[r.Space = 1] = "Space", r[r.Other = 2] = "Other", r;
})(Fe || (Fe = {}));
const Dg = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let ia;
try {
  ia = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Vg(r) {
  if (ia)
    return ia.test(r);
  for (let e = 0; e < r.length; e++) {
    let t = r[e];
    if (/\w/.test(t) || t > "" && (t.toUpperCase() != t.toLowerCase() || Dg.test(t)))
      return !0;
  }
  return !1;
}
function Ng(r) {
  return (e) => {
    if (!/\S/.test(e))
      return Fe.Space;
    if (Vg(e))
      return Fe.Word;
    for (let t = 0; t < r.length; t++)
      if (e.indexOf(r[t]) > -1)
        return Fe.Word;
    return Fe.Other;
  };
}
class ge {
  constructor(e, t, i, n, s, o) {
    this.config = e, this.doc = t, this.selection = i, this.values = n, this.status = e.statusTemplate.slice(), this.computeSlot = s, o && (o._state = this);
    for (let a = 0; a < this.config.dynamicSlots.length; a++)
      zr(this, a << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return zr(this, i), ns(this, i);
  }
  /**
  Create a [transaction](https://codemirror.net/6/docs/ref/#state.Transaction) that updates this
  state. Any number of [transaction specs](https://codemirror.net/6/docs/ref/#state.TransactionSpec)
  can be passed. Unless
  [`sequential`](https://codemirror.net/6/docs/ref/#state.TransactionSpec.sequential) is set, the
  [changes](https://codemirror.net/6/docs/ref/#state.TransactionSpec.changes) (if any) of each spec
  are assumed to start in the _current_ document (not the document
  produced by previous specs), and its
  [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection) and
  [effects](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) are assumed to refer
  to the document created by its _own_ changes. The resulting
  transaction contains the combined effect of all the different
  specs. For [selection](https://codemirror.net/6/docs/ref/#state.TransactionSpec.selection), later
  specs take precedence over earlier ones.
  */
  update(...e) {
    return nu(this, e, !0);
  }
  /**
  @internal
  */
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: n } = t;
    for (let a of e.effects)
      a.is(Rs.reconfigure) ? (t && (n = /* @__PURE__ */ new Map(), t.compartments.forEach((l, c) => n.set(c, l)), t = null), n.set(a.value.compartment, a.value.extension)) : a.is(be.reconfigure) ? (t = null, i = a.value) : a.is(be.appendConfig) && (t = null, i = nr(i).concat(a.value));
    let s;
    t ? s = e.startState.values.slice() : (t = rs.resolve(i, n, this), s = new ge(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (l, c) => c.reconfigure(l, this), null).values);
    let o = e.startState.facet(ea) ? e.newSelection : e.newSelection.asSingle();
    new ge(t, e.newDoc, o, s, (a, l) => l.update(a, e), e);
  }
  /**
  Create a [transaction spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec) that
  replaces every selection range with the given content.
  */
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: L.cursor(t.from + e.length)
    }));
  }
  /**
  Create a set of changes and a new selection by running the given
  function for each range in the active selection. The function
  can return an optional set of changes (in the coordinate space
  of the start document), plus an updated range (in the coordinate
  space of the document produced by the call's own changes). This
  method will merge all the changes and ranges into a single
  changeset and selection, and return it as a [transaction
  spec](https://codemirror.net/6/docs/ref/#state.TransactionSpec), which can be passed to
  [`update`](https://codemirror.net/6/docs/ref/#state.EditorState.update).
  */
  changeByRange(e) {
    let t = this.selection, i = e(t.ranges[0]), n = this.changes(i.changes), s = [i.range], o = nr(i.effects);
    for (let a = 1; a < t.ranges.length; a++) {
      let l = e(t.ranges[a]), c = this.changes(l.changes), u = c.map(n);
      for (let m = 0; m < a; m++)
        s[m] = s[m].map(u);
      let p = n.mapDesc(c, !0);
      s.push(l.range.map(p)), n = n.compose(u), o = be.mapEffects(o, u).concat(be.mapEffects(nr(l.effects), p));
    }
    return {
      changes: n,
      selection: L.create(s, t.mainIndex),
      effects: o
    };
  }
  /**
  Create a [change set](https://codemirror.net/6/docs/ref/#state.ChangeSet) from the given change
  description, taking the state's document length and line
  separator into account.
  */
  changes(e = []) {
    return e instanceof Be ? e : Be.of(e, this.doc.length, this.facet(ge.lineSeparator));
  }
  /**
  Using the state's [line
  separator](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator), create a
  [`Text`](https://codemirror.net/6/docs/ref/#state.Text) instance from the given string.
  */
  toText(e) {
    return me.of(e.split(this.facet(ge.lineSeparator) || Uo));
  }
  /**
  Return the given range of the document as a string.
  */
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  /**
  Get the value of a state [facet](https://codemirror.net/6/docs/ref/#state.Facet).
  */
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (zr(this, t), ns(this, t));
  }
  /**
  Convert this state to a JSON-serializable object. When custom
  fields should be serialized, you can pass them in as an object
  mapping property names (in the resulting object, which should
  not use `doc` or `selection`) to fields.
  */
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let i in e) {
        let n = e[i];
        n instanceof Ke && this.config.address[n.id] != null && (t[i] = n.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  /**
  Deserialize a state from its JSON representation. When custom
  fields should be deserialized, pass the same object you passed
  to [`toJSON`](https://codemirror.net/6/docs/ref/#state.EditorState.toJSON) when serializing as
  third argument.
  */
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let n = [];
    if (i) {
      for (let s in i)
        if (Object.prototype.hasOwnProperty.call(e, s)) {
          let o = i[s], a = e[s];
          n.push(o.init((l) => o.spec.fromJSON(a, l)));
        }
    }
    return ge.create({
      doc: e.doc,
      selection: L.fromJSON(e.selection),
      extensions: t.extensions ? n.concat([t.extensions]) : n
    });
  }
  /**
  Create a new state. You'll usually only need this when
  initializing an editor—updated states are created by applying
  transactions.
  */
  static create(e = {}) {
    let t = rs.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof me ? e.doc : me.of((e.doc || "").split(t.staticFacet(ge.lineSeparator) || Uo)), n = e.selection ? e.selection instanceof L ? e.selection : L.single(e.selection.anchor, e.selection.head) : L.single(0);
    return Uf(n, i.length), t.staticFacet(ea) || (n = n.asSingle()), new ge(t, i, n, t.dynamicSlots.map(() => null), (s, o) => o.create(s), null);
  }
  /**
  The size (in columns) of a tab in the document, determined by
  the [`tabSize`](https://codemirror.net/6/docs/ref/#state.EditorState^tabSize) facet.
  */
  get tabSize() {
    return this.facet(ge.tabSize);
  }
  /**
  Get the proper [line-break](https://codemirror.net/6/docs/ref/#state.EditorState^lineSeparator)
  string for this state.
  */
  get lineBreak() {
    return this.facet(ge.lineSeparator) || `
`;
  }
  /**
  Returns true when the editor is
  [configured](https://codemirror.net/6/docs/ref/#state.EditorState^readOnly) to be read-only.
  */
  get readOnly() {
    return this.facet(iu);
  }
  /**
  Look up a translation for the given phrase (via the
  [`phrases`](https://codemirror.net/6/docs/ref/#state.EditorState^phrases) facet), or return the
  original string if no translation is found.
  
  If additional arguments are passed, they will be inserted in
  place of markers like `$1` (for the first value) and `$2`, etc.
  A single `$` is equivalent to `$1`, and `$$` will produce a
  literal dollar sign.
  */
  phrase(e, ...t) {
    for (let i of this.facet(ge.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, n) => {
      if (n == "$")
        return "$";
      let s = +(n || 1);
      return !s || s > t.length ? i : t[s - 1];
    })), e;
  }
  /**
  Find the values for a given language data field, provided by the
  the [`languageData`](https://codemirror.net/6/docs/ref/#state.EditorState^languageData) facet.
  
  Examples of language data fields are...
  
  - [`"commentTokens"`](https://codemirror.net/6/docs/ref/#commands.CommentTokens) for specifying
    comment syntax.
  - [`"autocomplete"`](https://codemirror.net/6/docs/ref/#autocomplete.autocompletion^config.override)
    for providing language-specific completion sources.
  - [`"wordChars"`](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) for adding
    characters that should be considered part of words in this
    language.
  - [`"closeBrackets"`](https://codemirror.net/6/docs/ref/#autocomplete.CloseBracketConfig) controls
    bracket closing behavior.
  */
  languageDataAt(e, t, i = -1) {
    let n = [];
    for (let s of this.facet(Hf))
      for (let o of s(this, t, i))
        Object.prototype.hasOwnProperty.call(o, e) && n.push(o[e]);
    return n;
  }
  /**
  Return a function that can categorize strings (expected to
  represent a single [grapheme cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak))
  into one of:
  
   - Word (contains an alphanumeric character or a character
     explicitly listed in the local language's `"wordChars"`
     language data, which should be a string)
   - Space (contains only whitespace)
   - Other (anything else)
  */
  charCategorizer(e) {
    let t = this.languageDataAt("wordChars", e);
    return Ng(t.length ? t[0] : "");
  }
  /**
  Find the word at the given position, meaning the range
  containing all [word](https://codemirror.net/6/docs/ref/#state.CharCategory.Word) characters
  around it. If no word characters are adjacent to the position,
  this returns null.
  */
  wordAt(e) {
    let { text: t, from: i, length: n } = this.doc.lineAt(e), s = this.charCategorizer(e), o = e - i, a = e - i;
    for (; o > 0; ) {
      let l = We(t, o, !1);
      if (s(t.slice(l, o)) != Fe.Word)
        break;
      o = l;
    }
    for (; a < n; ) {
      let l = We(t, a);
      if (s(t.slice(a, l)) != Fe.Word)
        break;
      a = l;
    }
    return o == a ? null : L.range(o + i, a + i);
  }
}
ge.allowMultipleSelections = ea;
ge.tabSize = /* @__PURE__ */ q.define({
  combine: (r) => r.length ? r[0] : 4
});
ge.lineSeparator = Kf;
ge.readOnly = iu;
ge.phrases = /* @__PURE__ */ q.define({
  compare(r, e) {
    let t = Object.keys(r), i = Object.keys(e);
    return t.length == i.length && t.every((n) => r[n] == e[n]);
  }
});
ge.languageData = Hf;
ge.changeFilter = Jf;
ge.transactionFilter = eu;
ge.transactionExtender = tu;
Rs.reconfigure = /* @__PURE__ */ be.define();
function dn(r, e, t = {}) {
  let i = {};
  for (let n of r)
    for (let s of Object.keys(n)) {
      let o = n[s], a = i[s];
      if (a === void 0)
        i[s] = o;
      else if (!(a === o || o === void 0)) if (Object.hasOwnProperty.call(t, s))
        i[s] = t[s](a, o);
      else
        throw new Error("Config merge conflict for field " + s);
    }
  for (let n in e)
    i[n] === void 0 && (i[n] = e[n]);
  return i;
}
class xi {
  /**
  Compare this value with another value. Used when comparing
  rangesets. The default implementation compares by identity.
  Unless you are only creating a fixed number of unique instances
  of your value type, it is a good idea to implement this
  properly.
  */
  eq(e) {
    return this == e;
  }
  /**
  Create a [range](https://codemirror.net/6/docs/ref/#state.Range) with this value.
  */
  range(e, t = e) {
    return ra.create(e, t, this);
  }
}
xi.prototype.startSide = xi.prototype.endSide = 0;
xi.prototype.point = !1;
xi.prototype.mapMode = Ue.TrackDel;
function el(r, e) {
  return r == e || r.constructor == e.constructor && r.eq(e);
}
let ra = class su {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new su(e, t, i);
  }
};
function na(r, e) {
  return r.from - e.from || r.value.startSide - e.value.startSide;
}
class tl {
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = n;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  // Find the index of the given position and side. Use the ranges'
  // `from` pos when `end == false`, `to` when `end == true`.
  findIndex(e, t, i, n = 0) {
    let s = i ? this.to : this.from;
    for (let o = n, a = s.length; ; ) {
      if (o == a)
        return o;
      let l = o + a >> 1, c = s[l] - e || (i ? this.value[l].endSide : this.value[l].startSide) - t;
      if (l == o)
        return c >= 0 ? o : a;
      c >= 0 ? a = l : o = l + 1;
    }
  }
  between(e, t, i, n) {
    for (let s = this.findIndex(t, -1e9, !0), o = this.findIndex(i, 1e9, !1, s); s < o; s++)
      if (n(this.from[s] + e, this.to[s] + e, this.value[s]) === !1)
        return !1;
  }
  map(e, t) {
    let i = [], n = [], s = [], o = -1, a = -1;
    for (let l = 0; l < this.value.length; l++) {
      let c = this.value[l], u = this.from[l] + e, p = this.to[l] + e, m, v;
      if (u == p) {
        let b = t.mapPos(u, c.startSide, c.mapMode);
        if (b == null || (m = v = b, c.startSide != c.endSide && (v = t.mapPos(u, c.endSide), v < m)))
          continue;
      } else if (m = t.mapPos(u, c.startSide), v = t.mapPos(p, c.endSide), m > v || m == v && c.startSide > 0 && c.endSide <= 0)
        continue;
      (v - m || c.endSide - c.startSide) < 0 || (o < 0 && (o = m), c.point && (a = Math.max(a, v - m)), i.push(c), n.push(m - o), s.push(v - o));
    }
    return { mapped: i.length ? new tl(n, s, i, a) : null, pos: o };
  }
}
class pe {
  constructor(e, t, i, n) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = n;
  }
  /**
  @internal
  */
  static create(e, t, i, n) {
    return new pe(e, t, i, n);
  }
  /**
  @internal
  */
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  /**
  The number of ranges in the set.
  */
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  /**
  @internal
  */
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  /**
  Update the range set, optionally adding new ranges or filtering
  out existing ones.
  
  (Note: The type parameter is just there as a kludge to work
  around TypeScript variance issues that prevented `RangeSet<X>`
  from being a subtype of `RangeSet<Y>` when `X` is a subtype of
  `Y`.)
  */
  update(e) {
    let { add: t = [], sort: i = !1, filterFrom: n = 0, filterTo: s = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (i && (t = t.slice().sort(na)), this.isEmpty)
      return t.length ? pe.of(t) : this;
    let a = new ou(this, null, -1).goto(0), l = 0, c = [], u = new Ii();
    for (; a.value || l < t.length; )
      if (l < t.length && (a.from - t[l].from || a.startSide - t[l].value.startSide) >= 0) {
        let p = t[l++];
        u.addInner(p.from, p.to, p.value) || c.push(p);
      } else a.rangeIndex == 1 && a.chunkIndex < this.chunk.length && (l == t.length || this.chunkEnd(a.chunkIndex) < t[l].from) && (!o || n > this.chunkEnd(a.chunkIndex) || s < this.chunkPos[a.chunkIndex]) && u.addChunk(this.chunkPos[a.chunkIndex], this.chunk[a.chunkIndex]) ? a.nextChunk() : ((!o || n > a.to || s < a.from || o(a.from, a.to, a.value)) && (u.addInner(a.from, a.to, a.value) || c.push(ra.create(a.from, a.to, a.value))), a.next());
    return u.finishInner(this.nextLayer.isEmpty && !c.length ? pe.empty : this.nextLayer.update({ add: c, filter: o, filterFrom: n, filterTo: s }));
  }
  /**
  Map this range set through a set of changes, return the new set.
  */
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], n = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let a = this.chunkPos[o], l = this.chunk[o], c = e.touchesRange(a, a + l.length);
      if (c === !1)
        n = Math.max(n, l.maxPoint), t.push(l), i.push(e.mapPos(a));
      else if (c === !0) {
        let { mapped: u, pos: p } = l.map(a, e);
        u && (n = Math.max(n, u.maxPoint), t.push(u), i.push(p));
      }
    }
    let s = this.nextLayer.map(e);
    return t.length == 0 ? s : new pe(i, t, s || pe.empty, n);
  }
  /**
  Iterate over the ranges that touch the region `from` to `to`,
  calling `f` for each. There is no guarantee that the ranges will
  be reported in any specific order. When the callback returns
  `false`, iteration stops.
  */
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let n = 0; n < this.chunk.length; n++) {
        let s = this.chunkPos[n], o = this.chunk[n];
        if (t >= s && e <= s + o.length && o.between(s, e - s, t - s, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  /**
  Iterate over the ranges in this set, in order, including all
  ranges that end at or after `from`.
  */
  iter(e = 0) {
    return Fr.from([this]).goto(e);
  }
  /**
  @internal
  */
  get isEmpty() {
    return this.nextLayer == this;
  }
  /**
  Iterate over the ranges in a collection of sets, in order,
  starting from `from`.
  */
  static iter(e, t = 0) {
    return Fr.from(e).goto(t);
  }
  /**
  Iterate over two groups of sets, calling methods on `comparator`
  to notify it of possible differences.
  */
  static compare(e, t, i, n, s = -1) {
    let o = e.filter((p) => p.maxPoint > 0 || !p.isEmpty && p.maxPoint >= s), a = t.filter((p) => p.maxPoint > 0 || !p.isEmpty && p.maxPoint >= s), l = Ph(o, a, i), c = new Mr(o, l, s), u = new Mr(a, l, s);
    i.iterGaps((p, m, v) => Ch(c, p, u, m, v, n)), i.empty && i.length == 0 && Ch(c, 0, u, 0, 0, n);
  }
  /**
  Compare the contents of two groups of range sets, returning true
  if they are equivalent in the given range.
  */
  static eq(e, t, i = 0, n) {
    n == null && (n = 999999999);
    let s = e.filter((u) => !u.isEmpty && t.indexOf(u) < 0), o = t.filter((u) => !u.isEmpty && e.indexOf(u) < 0);
    if (s.length != o.length)
      return !1;
    if (!s.length)
      return !0;
    let a = Ph(s, o), l = new Mr(s, a, 0).goto(i), c = new Mr(o, a, 0).goto(i);
    for (; ; ) {
      if (l.to != c.to || !sa(l.active, c.active) || l.point && (!c.point || !el(l.point, c.point)))
        return !1;
      if (l.to > n)
        return !0;
      l.next(), c.next();
    }
  }
  /**
  Iterate over a group of range sets at the same time, notifying
  the iterator about the ranges covering every given piece of
  content. Returns the open count (see
  [`SpanIterator.span`](https://codemirror.net/6/docs/ref/#state.SpanIterator.span)) at the end
  of the iteration.
  */
  static spans(e, t, i, n, s = -1) {
    let o = new Mr(e, null, s).goto(t), a = t, l = o.openStart;
    for (; ; ) {
      let c = Math.min(o.to, i);
      if (o.point) {
        let u = o.activeForPoint(o.to), p = o.pointFrom < t ? u.length + 1 : o.point.startSide < 0 ? u.length : Math.min(u.length, l);
        n.point(a, c, o.point, u, p, o.pointRank), l = Math.min(o.openEnd(c), u.length);
      } else c > a && (n.span(a, c, o.active, l), l = o.openEnd(c));
      if (o.to > i)
        return l + (o.point && o.to > i ? 1 : 0);
      a = o.to, o.next();
    }
  }
  /**
  Create a range set for the given range or array of ranges. By
  default, this expects the ranges to be _sorted_ (by start
  position and, if two start at the same position,
  `value.startSide`). You can pass `true` as second argument to
  cause the method to sort them.
  */
  static of(e, t = !1) {
    let i = new Ii();
    for (let n of e instanceof ra ? [e] : t ? qg(e) : e)
      i.add(n.from, n.to, n.value);
    return i.finish();
  }
  /**
  Join an array of range sets into a single set.
  */
  static join(e) {
    if (!e.length)
      return pe.empty;
    let t = e[e.length - 1];
    for (let i = e.length - 2; i >= 0; i--)
      for (let n = e[i]; n != pe.empty; n = n.nextLayer)
        t = new pe(n.chunkPos, n.chunk, t, Math.max(n.maxPoint, t.maxPoint));
    return t;
  }
}
pe.empty = /* @__PURE__ */ new pe([], [], null, -1);
function qg(r) {
  if (r.length > 1)
    for (let e = r[0], t = 1; t < r.length; t++) {
      let i = r[t];
      if (na(e, i) > 0)
        return r.slice().sort(na);
      e = i;
    }
  return r;
}
pe.empty.nextLayer = pe.empty;
class Ii {
  finishChunk(e) {
    this.chunks.push(new tl(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  /**
  Create an empty builder.
  */
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  /**
  Add a range. Ranges should be added in sorted (by `from` and
  `value.startSide`) order.
  */
  add(e, t, i) {
    this.addInner(e, t, i) || (this.nextLayer || (this.nextLayer = new Ii())).add(e, t, i);
  }
  /**
  @internal
  */
  addInner(e, t, i) {
    let n = e - this.lastTo || i.startSide - this.last.endSide;
    if (n <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return n < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  /**
  @internal
  */
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  /**
  Finish the range set. Returns the new set. The builder can't be
  used anymore after this has been called.
  */
  finish() {
    return this.finishInner(pe.empty);
  }
  /**
  @internal
  */
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = pe.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function Ph(r, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let s of r)
    for (let o = 0; o < s.chunk.length; o++)
      s.chunk[o].maxPoint <= 0 && i.set(s.chunk[o], s.chunkPos[o]);
  let n = /* @__PURE__ */ new Set();
  for (let s of e)
    for (let o = 0; o < s.chunk.length; o++) {
      let a = i.get(s.chunk[o]);
      a != null && (t ? t.mapPos(a) : a) == s.chunkPos[o] && !t?.touchesRange(a, a + s.chunk[o].length) && n.add(s.chunk[o]);
    }
  return n;
}
class ou {
  constructor(e, t, i, n = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = n;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let n = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(n) || this.layer.chunkEnd(this.chunkIndex) < e || n.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let n = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < n) && this.setRangeIndex(n);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], i = e + t.from[this.rangeIndex];
        if (this.from = i, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class Fr {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let n = [];
    for (let s = 0; s < e.length; s++)
      for (let o = e[s]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && n.push(new ou(o, t, i, s));
    return n.length == 1 ? n[0] : new Fr(n);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      oo(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      oo(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), oo(this.heap, 0);
    }
  }
}
function oo(r, e) {
  for (let t = r[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= r.length)
      break;
    let n = r[i];
    if (i + 1 < r.length && n.compare(r[i + 1]) >= 0 && (n = r[i + 1], i++), t.compare(n) < 0)
      break;
    r[i] = t, r[e] = n, e = i;
  }
}
class Mr {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = Fr.from(e, t, i);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    $n(this.active, e), $n(this.activeTo, e), $n(this.activeRank, e), this.minActive = Th(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: n, rank: s } = this.cursor;
    for (; t < this.activeRank.length && (s - this.activeRank[t] || n - this.activeTo[t]) > 0; )
      t++;
    Pn(this.active, t, i), Pn(this.activeTo, t, n), Pn(this.activeRank, t, s), e && Pn(e, t, this.cursor.from), this.minActive = Th(this.active, this.activeTo);
  }
  // After calling this, if `this.point` != null, the next range is a
  // point. Otherwise, it's a regular range, covered by `this.active`.
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let n = this.minActive;
      if (n > -1 && (this.activeTo[n] - this.cursor.from || this.active[n].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[n] > e) {
          this.to = this.activeTo[n], this.endSide = this.active[n].endSide;
          break;
        }
        this.removeActive(n), i && $n(i, n);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let s = this.cursor.value;
          if (!s.point)
            this.addActive(i), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = s, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = s.endSide, this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      this.openStart = 0;
      for (let n = i.length - 1; n >= 0 && i[n] < e; n--)
        this.openStart++;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > e || this.activeTo[i] == e && this.active[i].endSide >= this.point.endSide) && t.push(this.active[i]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
      t++;
    return t;
  }
}
function Ch(r, e, t, i, n, s) {
  r.goto(e), t.goto(i);
  let o = i + n, a = i, l = i - e, c = !!s.boundChange;
  for (let u = !1; ; ) {
    let p = r.to + l - t.to, m = p || r.endSide - t.endSide, v = m < 0 ? r.to + l : t.to, b = Math.min(v, o);
    if (r.point || t.point ? (r.point && t.point && el(r.point, t.point) && sa(r.activeForPoint(r.to), t.activeForPoint(t.to)) || s.comparePoint(a, b, r.point, t.point), u = !1) : (u && s.boundChange(a), b > a && !sa(r.active, t.active) && s.compareRange(a, b, r.active, t.active), c && b < o && (p || r.openEnd(v) != t.openEnd(v)) && (u = !0)), v > o)
      break;
    a = v, m <= 0 && r.next(), m >= 0 && t.next();
  }
}
function sa(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (r[t] != e[t] && !el(r[t], e[t]))
      return !1;
  return !0;
}
function $n(r, e) {
  for (let t = e, i = r.length - 1; t < i; t++)
    r[t] = r[t + 1];
  r.pop();
}
function Pn(r, e, t) {
  for (let i = r.length - 1; i >= e; i--)
    r[i + 1] = r[i];
  r[e] = t;
}
function Th(r, e) {
  let t = -1, i = 1e9;
  for (let n = 0; n < e.length; n++)
    (e[n] - i || r[n].endSide - r[t].endSide) < 0 && (t = n, i = e[n]);
  return t;
}
function ri(r, e, t = r.length) {
  let i = 0;
  for (let n = 0; n < t && n < r.length; )
    r.charCodeAt(n) == 9 ? (i += e - i % e, n++) : (i++, n = We(r, n));
  return i;
}
function Gg(r, e, t, i) {
  for (let n = 0, s = 0; ; ) {
    if (s >= e)
      return n;
    if (n == r.length)
      break;
    s += r.charCodeAt(n) == 9 ? t - s % t : 1, n = We(r, n);
  }
  return r.length;
}
const oa = "ͼ", Ah = typeof Symbol > "u" ? "__" + oa : Symbol.for(oa), aa = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : /* @__PURE__ */ Symbol("styleSet"), Mh = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class wi {
  // :: (Object<Style>, ?{finish: ?(string) → string})
  // Create a style module from the given spec.
  //
  // When `finish` is given, it is called on regular (non-`@`)
  // selectors (after `&` expansion) to compute the final selector.
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function n(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function s(o, a, l, c) {
      let u = [], p = /^@(\w+)\b/.exec(o[0]), m = p && p[1] == "keyframes";
      if (p && a == null) return l.push(o[0] + ";");
      for (let v in a) {
        let b = a[v];
        if (/&/.test(v))
          s(
            v.split(/,\s*/).map((w) => o.map((C) => w.replace(/&/, C))).reduce((w, C) => w.concat(C)),
            b,
            l
          );
        else if (b && typeof b == "object") {
          if (!p) throw new RangeError("The value of a property (" + v + ") should be a primitive value.");
          s(n(v), b, u, m);
        } else b != null && u.push(v.replace(/_.*/, "").replace(/[A-Z]/g, (w) => "-" + w.toLowerCase()) + ": " + b + ";");
      }
      (u.length || m) && l.push((i && !p && !c ? o.map(i) : o).join(", ") + " {" + u.join(" ") + "}");
    }
    for (let o in e) s(n(o), e[o], this.rules);
  }
  // :: () → string
  // Returns a string containing the module's CSS rules.
  getRules() {
    return this.rules.join(`
`);
  }
  // :: () → string
  // Generate a new unique CSS class name.
  static newName() {
    let e = Mh[Ah] || 1;
    return Mh[Ah] = e + 1, oa + e.toString(36);
  }
  // :: (union<Document, ShadowRoot>, union<[StyleModule], StyleModule>, ?{nonce: ?string})
  //
  // Mount the given set of modules in the given DOM root, which ensures
  // that the CSS rules defined by the module are available in that
  // context.
  //
  // Rules are only added to the document once per root.
  //
  // Rule order will follow the order of the modules, so that rules from
  // modules later in the array take precedence of those from earlier
  // modules. If you call this function multiple times for the same root
  // in a way that changes the order of already mounted modules, the old
  // order will be changed.
  //
  // If a Content Security Policy nonce is provided, it is added to
  // the `<style>` tag generated by the library.
  static mount(e, t, i) {
    let n = e[aa], s = i && i.nonce;
    n ? s && n.setNonce(s) : n = new Ug(e, s), n.mount(Array.isArray(t) ? t : [t], e);
  }
}
let Rh = /* @__PURE__ */ new Map();
class Ug {
  constructor(e, t) {
    let i = e.ownerDocument || e, n = i.defaultView;
    if (!e.head && e.adoptedStyleSheets && n.CSSStyleSheet) {
      let s = Rh.get(i);
      if (s) return e[aa] = s;
      this.sheet = new n.CSSStyleSheet(), Rh.set(i, this);
    } else
      this.styleTag = i.createElement("style"), t && this.styleTag.setAttribute("nonce", t);
    this.modules = [], e[aa] = this;
  }
  mount(e, t) {
    let i = this.sheet, n = 0, s = 0;
    for (let o = 0; o < e.length; o++) {
      let a = e[o], l = this.modules.indexOf(a);
      if (l < s && l > -1 && (this.modules.splice(l, 1), s--, l = -1), l == -1) {
        if (this.modules.splice(s++, 0, a), i) for (let c = 0; c < a.rules.length; c++)
          i.insertRule(a.rules[c], n++);
      } else {
        for (; s < l; ) n += this.modules[s++].rules.length;
        n += a.rules.length, s++;
      }
    }
    if (i)
      t.adoptedStyleSheets.indexOf(this.sheet) < 0 && (t.adoptedStyleSheets = [this.sheet, ...t.adoptedStyleSheets]);
    else {
      let o = "";
      for (let l = 0; l < this.modules.length; l++)
        o += this.modules[l].getRules() + `
`;
      this.styleTag.textContent = o;
      let a = t.head || t;
      this.styleTag.parentNode != a && a.insertBefore(this.styleTag, a.firstChild);
    }
  }
  setNonce(e) {
    this.styleTag && this.styleTag.getAttribute("nonce") != e && this.styleTag.setAttribute("nonce", e);
  }
}
var Qi = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, Hr = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, Fg = typeof navigator < "u" && /Mac/.test(navigator.platform), Hg = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
for (var Ge = 0; Ge < 10; Ge++) Qi[48 + Ge] = Qi[96 + Ge] = String(Ge);
for (var Ge = 1; Ge <= 24; Ge++) Qi[Ge + 111] = "F" + Ge;
for (var Ge = 65; Ge <= 90; Ge++)
  Qi[Ge] = String.fromCharCode(Ge + 32), Hr[Ge] = String.fromCharCode(Ge);
for (var ao in Qi) Hr.hasOwnProperty(ao) || (Hr[ao] = Qi[ao]);
function Kg(r) {
  var e = Fg && r.metaKey && r.shiftKey && !r.ctrlKey && !r.altKey || Hg && r.shiftKey && r.key && r.key.length == 1 || r.key == "Unidentified", t = !e && r.key || (r.shiftKey ? Hr : Qi)[r.keyCode] || r.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
let at = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, la = typeof document < "u" ? document : { documentElement: { style: {} } };
const ha = /* @__PURE__ */ /Edge\/(\d+)/.exec(at.userAgent), au = /* @__PURE__ */ /MSIE \d/.test(at.userAgent), ca = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(at.userAgent), Zs = !!(au || ca || ha), Zh = !Zs && /* @__PURE__ */ /gecko\/(\d+)/i.test(at.userAgent), lo = !Zs && /* @__PURE__ */ /Chrome\/(\d+)/.exec(at.userAgent), Xh = "webkitFontSmoothing" in la.documentElement.style, fa = !Zs && /* @__PURE__ */ /Apple Computer/.test(at.vendor), Lh = fa && (/* @__PURE__ */ /Mobile\/\w+/.test(at.userAgent) || at.maxTouchPoints > 2);
var V = {
  mac: Lh || /* @__PURE__ */ /Mac/.test(at.platform),
  windows: /* @__PURE__ */ /Win/.test(at.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(at.platform),
  ie: Zs,
  ie_version: au ? la.documentMode || 6 : ca ? +ca[1] : ha ? +ha[1] : 0,
  gecko: Zh,
  gecko_version: Zh ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(at.userAgent) || [0, 0])[1] : 0,
  chrome: !!lo,
  chrome_version: lo ? +lo[1] : 0,
  ios: Lh,
  android: /* @__PURE__ */ /Android\b/.test(at.userAgent),
  webkit: Xh,
  webkit_version: Xh ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(at.userAgent) || [0, 0])[1] : 0,
  safari: fa,
  safari_version: fa ? +(/* @__PURE__ */ /\bVersion\/(\d+(\.\d+)?)/.exec(at.userAgent) || [0, 0])[1] : 0,
  tabSize: la.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
function il(r, e) {
  for (let t in r)
    t == "class" && e.class ? e.class += " " + r.class : t == "style" && e.style ? e.style += ";" + r.style : e[t] = r[t];
  return e;
}
const ss = /* @__PURE__ */ Object.create(null);
function rl(r, e, t) {
  if (r == e)
    return !0;
  r || (r = ss), e || (e = ss);
  let i = Object.keys(r), n = Object.keys(e);
  if (i.length - 0 != n.length - 0)
    return !1;
  for (let s of i)
    if (s != t && (n.indexOf(s) == -1 || r[s] !== e[s]))
      return !1;
  return !0;
}
function Jg(r, e) {
  for (let t = r.attributes.length - 1; t >= 0; t--) {
    let i = r.attributes[t].name;
    e[i] == null && r.removeAttribute(i);
  }
  for (let t in e) {
    let i = e[t];
    t == "style" ? r.style.cssText = i : r.getAttribute(t) != i && r.setAttribute(t, i);
  }
}
function Eh(r, e, t) {
  let i = !1;
  if (e)
    for (let n in e)
      t && n in t || (i = !0, n == "style" ? r.style.cssText = "" : r.removeAttribute(n));
  if (t)
    for (let n in t)
      e && e[n] == t[n] || (i = !0, n == "style" ? r.style.cssText = t[n] : r.setAttribute(n, t[n]));
  return i;
}
function em(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t = 0; t < r.attributes.length; t++) {
    let i = r.attributes[t];
    e[i.name] = i.value;
  }
  return e;
}
class Bt {
  /**
  Compare this instance to another instance of the same type.
  (TypeScript can't express this, but only instances of the same
  specific class will be passed to this method.) This is used to
  avoid redrawing widgets when they are replaced by a new
  decoration of the same type. The default implementation just
  returns `false`, which will cause new instances of the widget to
  always be redrawn.
  */
  eq(e) {
    return !1;
  }
  /**
  Update a DOM element created by a widget of the same type (but
  different, non-`eq` content) to reflect this widget. May return
  true to indicate that it could update, false to indicate it
  couldn't (in which case the widget will be redrawn). The default
  implementation just returns false.
  */
  updateDOM(e, t, i) {
    return !1;
  }
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  The estimated height this widget will have, to be used when
  estimating the height of content that hasn't been drawn. May
  return -1 to indicate you don't know. The default implementation
  returns -1.
  */
  get estimatedHeight() {
    return -1;
  }
  /**
  For inline widgets that are displayed inline (as opposed to
  `inline-block`) and introduce line breaks (through `<br>` tags
  or textual newlines), this must indicate the amount of line
  breaks they introduce. Defaults to 0.
  */
  get lineBreaks() {
    return 0;
  }
  /**
  Can be used to configure which kinds of events inside the widget
  should be ignored by the editor. The default is to ignore all
  events.
  */
  ignoreEvent(e) {
    return !0;
  }
  /**
  Override the way screen coordinates for positions at/in the
  widget are found. `pos` will be the offset into the widget, and
  `side` the side of the position that is being queried—less than
  zero for before, greater than zero for after, and zero for
  directly at that position.
  */
  coordsAt(e, t, i) {
    return null;
  }
  /**
  @internal
  */
  get isHidden() {
    return !1;
  }
  /**
  @internal
  */
  get editable() {
    return !1;
  }
  /**
  This is called when the an instance of the widget is removed
  from the editor view.
  */
  destroy(e) {
  }
}
var He = /* @__PURE__ */ (function(r) {
  return r[r.Text = 0] = "Text", r[r.WidgetBefore = 1] = "WidgetBefore", r[r.WidgetAfter = 2] = "WidgetAfter", r[r.WidgetRange = 3] = "WidgetRange", r;
})(He || (He = {}));
class ee extends xi {
  constructor(e, t, i, n) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = n;
  }
  /**
  @internal
  */
  get heightRelevant() {
    return !1;
  }
  /**
  Create a mark decoration, which influences the styling of the
  content in its range. Nested mark decorations will cause nested
  DOM elements to be created. Nesting order is determined by
  precedence of the [facet](https://codemirror.net/6/docs/ref/#view.EditorView^decorations), with
  the higher-precedence decorations creating the inner DOM nodes.
  Such elements are split on line boundaries and on the boundaries
  of lower-precedence decorations.
  */
  static mark(e) {
    return new On(e);
  }
  /**
  Create a widget decoration, which displays a DOM element at the
  given position.
  */
  static widget(e) {
    let t = Math.max(-1e4, Math.min(1e4, e.side || 0)), i = !!e.block;
    return t += i && !e.inlineOrder ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Wi(e, t, t, i, e.widget || null, !1);
  }
  /**
  Create a replace decoration which replaces the given range with
  a widget, or simply hides it.
  */
  static replace(e) {
    let t = !!e.block, i, n;
    if (e.isBlockGap)
      i = -5e8, n = 4e8;
    else {
      let { start: s, end: o } = lu(e, t);
      i = (s ? t ? -3e8 : -1 : 5e8) - 1, n = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Wi(e, i, n, t, e.widget || null, !0);
  }
  /**
  Create a line decoration, which can add DOM attributes to the
  line starting at the given position.
  */
  static line(e) {
    return new pn(e);
  }
  /**
  Build a [`DecorationSet`](https://codemirror.net/6/docs/ref/#view.DecorationSet) from the given
  decorated range or ranges. If the ranges aren't already sorted,
  pass `true` for `sort` to make the library sort them for you.
  */
  static set(e, t = !1) {
    return pe.of(e, t);
  }
  /**
  @internal
  */
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
ee.none = pe.empty;
class On extends ee {
  constructor(e) {
    let { start: t, end: i } = lu(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.attrs = e.class && e.attributes ? il(e.attributes, { class: e.class }) : e.class ? { class: e.class } : e.attributes || ss;
  }
  eq(e) {
    return this == e || e instanceof On && this.tagName == e.tagName && rl(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
On.prototype.point = !1;
class pn extends ee {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof pn && this.spec.class == e.spec.class && rl(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
pn.prototype.mapMode = Ue.TrackBefore;
pn.prototype.point = !0;
class Wi extends ee {
  constructor(e, t, i, n, s, o) {
    super(t, i, s, e), this.block = n, this.isReplace = o, this.mapMode = n ? t <= 0 ? Ue.TrackBefore : Ue.TrackAfter : Ue.TrackDel;
  }
  // Only relevant when this.block == true
  get type() {
    return this.startSide != this.endSide ? He.WidgetRange : this.startSide <= 0 ? He.WidgetBefore : He.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(e) {
    return e instanceof Wi && tm(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Wi.prototype.point = !0;
function lu(r, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = r;
  return t == null && (t = r.inclusive), i == null && (i = r.inclusive), { start: t ?? e, end: i ?? e };
}
function tm(r, e) {
  return r == e || !!(r && e && r.compare(e));
}
function sr(r, e, t, i = 0) {
  let n = t.length - 1;
  n >= 0 && t[n] + i >= r ? t[n] = Math.max(t[n], e) : t.push(r, e);
}
class Kr extends xi {
  constructor(e, t, i) {
    super(), this.tagName = e, this.attributes = t, this.rank = i;
  }
  eq(e) {
    return e == this || e instanceof Kr && this.tagName == e.tagName && rl(this.attributes, e.attributes);
  }
  /**
  Create a block wrapper object with the given tag name and
  attributes.
  */
  static create(e) {
    return new Kr(e.tagName, e.attributes || ss, e.rank == null ? 50 : Math.max(0, Math.min(e.rank, 100)));
  }
  /**
  Create a range set from the given block wrapper ranges.
  */
  static set(e, t = !1) {
    return pe.of(e, t);
  }
}
Kr.prototype.startSide = Kr.prototype.endSide = -1;
function Jr(r) {
  let e;
  return r.nodeType == 11 ? e = r.getSelection ? r : r.ownerDocument : e = r, e.getSelection();
}
function ua(r, e) {
  return e ? r == e || r.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Dr(r, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return ua(r, e.anchorNode);
  } catch {
    return !1;
  }
}
function Nn(r) {
  return r.nodeType == 3 ? en(r, 0, r.nodeValue.length).getClientRects() : r.nodeType == 1 ? r.getClientRects() : [];
}
function Vr(r, e, t, i) {
  return t ? _h(r, e, t, i, -1) || _h(r, e, t, i, 1) : !1;
}
function $i(r) {
  for (var e = 0; ; e++)
    if (r = r.previousSibling, !r)
      return e;
}
function os(r) {
  return r.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(r.nodeName);
}
function _h(r, e, t, i, n) {
  for (; ; ) {
    if (r == t && e == i)
      return !0;
    if (e == (n < 0 ? 0 : fi(r))) {
      if (r.nodeName == "DIV")
        return !1;
      let s = r.parentNode;
      if (!s || s.nodeType != 1)
        return !1;
      e = $i(r) + (n < 0 ? 0 : 1), r = s;
    } else if (r.nodeType == 1) {
      if (r = r.childNodes[e + (n < 0 ? -1 : 0)], r.nodeType == 1 && r.contentEditable == "false")
        return !1;
      e = n < 0 ? fi(r) : 0;
    } else
      return !1;
  }
}
function fi(r) {
  return r.nodeType == 3 ? r.nodeValue.length : r.childNodes.length;
}
function as(r, e) {
  let { left: t, right: i } = r;
  if (t == i)
    return r;
  let n = e ? t : i;
  return { left: n, right: n, top: r.top, bottom: r.bottom };
}
function im(r) {
  let e = r.visualViewport;
  return e ? {
    left: 0,
    right: e.width,
    top: 0,
    bottom: e.height
  } : {
    left: 0,
    right: r.innerWidth,
    top: 0,
    bottom: r.innerHeight
  };
}
function hu(r, e) {
  let t = e.width / r.offsetWidth, i = e.height / r.offsetHeight;
  return (t > 0.995 && t < 1.005 || !isFinite(t) || Math.abs(e.width - r.offsetWidth) < 1) && (t = 1), (i > 0.995 && i < 1.005 || !isFinite(i) || Math.abs(e.height - r.offsetHeight) < 1) && (i = 1), { scaleX: t, scaleY: i };
}
function rm(r, e, t, i, n, s, o, a) {
  let l = r.ownerDocument, c = l.defaultView || window;
  for (let u = r, p = !1; u && !p; )
    if (u.nodeType == 1) {
      let m, v = u == l.body, b = 1, w = 1;
      if (v)
        m = im(c);
      else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(u).position) && (p = !0), u.scrollHeight <= u.clientHeight && u.scrollWidth <= u.clientWidth) {
          u = u.assignedSlot || u.parentNode;
          continue;
        }
        let X = u.getBoundingClientRect();
        ({ scaleX: b, scaleY: w } = hu(u, X)), m = {
          left: X.left,
          right: X.left + u.clientWidth * b,
          top: X.top,
          bottom: X.top + u.clientHeight * w
        };
      }
      let C = 0, A = 0;
      if (n == "nearest")
        e.top < m.top + o ? (A = e.top - (m.top + o), t > 0 && e.bottom > m.bottom + A && (A = e.bottom - m.bottom + o)) : e.bottom > m.bottom - o && (A = e.bottom - m.bottom + o, t < 0 && e.top - A < m.top && (A = e.top - (m.top + o)));
      else {
        let X = e.bottom - e.top, _ = m.bottom - m.top;
        A = (n == "center" && X <= _ ? e.top + X / 2 - _ / 2 : n == "start" || n == "center" && t < 0 ? e.top - o : e.bottom - _ + o) - m.top;
      }
      if (i == "nearest" ? e.left < m.left + s ? (C = e.left - (m.left + s), t > 0 && e.right > m.right + C && (C = e.right - m.right + s)) : e.right > m.right - s && (C = e.right - m.right + s, t < 0 && e.left < m.left + C && (C = e.left - (m.left + s))) : C = (i == "center" ? e.left + (e.right - e.left) / 2 - (m.right - m.left) / 2 : i == "start" == a ? e.left - s : e.right - (m.right - m.left) + s) - m.left, C || A)
        if (v)
          c.scrollBy(C, A);
        else {
          let X = 0, _ = 0;
          if (A) {
            let H = u.scrollTop;
            u.scrollTop += A / w, _ = (u.scrollTop - H) * w;
          }
          if (C) {
            let H = u.scrollLeft;
            u.scrollLeft += C / b, X = (u.scrollLeft - H) * b;
          }
          e = {
            left: e.left - X,
            top: e.top - _,
            right: e.right - X,
            bottom: e.bottom - _
          }, X && Math.abs(X - C) < 1 && (i = "nearest"), _ && Math.abs(_ - A) < 1 && (n = "nearest");
        }
      if (v)
        break;
      (e.top < m.top || e.bottom > m.bottom || e.left < m.left || e.right > m.right) && (e = {
        left: Math.max(e.left, m.left),
        right: Math.min(e.right, m.right),
        top: Math.max(e.top, m.top),
        bottom: Math.min(e.bottom, m.bottom)
      }), u = u.assignedSlot || u.parentNode;
    } else if (u.nodeType == 11)
      u = u.host;
    else
      break;
}
function cu(r, e = !0) {
  let t = r.ownerDocument, i = null, n = null;
  for (let s = r.parentNode; s && !(s == t.body || (!e || i) && n); )
    if (s.nodeType == 1)
      !n && s.scrollHeight > s.clientHeight && (n = s), e && !i && s.scrollWidth > s.clientWidth && (i = s), s = s.assignedSlot || s.parentNode;
    else if (s.nodeType == 11)
      s = s.host;
    else
      break;
  return { x: i, y: n };
}
class nm {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    let { anchorNode: t, focusNode: i } = e;
    this.set(t, Math.min(e.anchorOffset, t ? fi(t) : 0), i, Math.min(e.focusOffset, i ? fi(i) : 0));
  }
  set(e, t, i, n) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = n;
  }
}
let Xi = null;
V.safari && V.safari_version >= 26 && (Xi = !1);
function fu(r) {
  if (r.setActive)
    return r.setActive();
  if (Xi)
    return r.focus(Xi);
  let e = [];
  for (let t = r; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (r.focus(Xi == null ? {
    get preventScroll() {
      return Xi = { preventScroll: !0 }, !0;
    }
  } : void 0), !Xi) {
    Xi = !1;
    for (let t = 0; t < e.length; ) {
      let i = e[t++], n = e[t++], s = e[t++];
      i.scrollTop != n && (i.scrollTop = n), i.scrollLeft != s && (i.scrollLeft = s);
    }
  }
}
let Bh;
function en(r, e, t = e) {
  let i = Bh || (Bh = document.createRange());
  return i.setEnd(r, t), i.setStart(r, e), i;
}
function or(r, e, t, i) {
  let n = { key: e, code: e, keyCode: t, which: t, cancelable: !0 };
  i && ({ altKey: n.altKey, ctrlKey: n.ctrlKey, shiftKey: n.shiftKey, metaKey: n.metaKey } = i);
  let s = new KeyboardEvent("keydown", n);
  s.synthetic = !0, r.dispatchEvent(s);
  let o = new KeyboardEvent("keyup", n);
  return o.synthetic = !0, r.dispatchEvent(o), s.defaultPrevented || o.defaultPrevented;
}
function sm(r) {
  for (; r; ) {
    if (r && (r.nodeType == 9 || r.nodeType == 11 && r.host))
      return r;
    r = r.assignedSlot || r.parentNode;
  }
  return null;
}
function om(r, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (i = Math.min(i, fi(t)); ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let n = t.childNodes[i - 1];
      n.contentEditable == "false" ? i-- : (t = n, i = fi(t));
    } else {
      if (t == r)
        return !0;
      i = $i(t), t = t.parentNode;
    }
}
function uu(r) {
  return r instanceof Window ? r.pageYOffset > Math.max(0, r.document.documentElement.scrollHeight - r.innerHeight - 4) : r.scrollTop > Math.max(1, r.scrollHeight - r.clientHeight - 4);
}
function du(r, e) {
  for (let t = r, i = e; ; ) {
    if (t.nodeType == 3 && i > 0)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i > 0) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i - 1], i = fi(t);
    } else if (t.parentNode && !os(t))
      i = $i(t), t = t.parentNode;
    else
      return null;
  }
}
function Ou(r, e) {
  for (let t = r, i = e; ; ) {
    if (t.nodeType == 3 && i < t.nodeValue.length)
      return { node: t, offset: i };
    if (t.nodeType == 1 && i < t.childNodes.length) {
      if (t.contentEditable == "false")
        return null;
      t = t.childNodes[i], i = 0;
    } else if (t.parentNode && !os(t))
      i = $i(t) + 1, t = t.parentNode;
    else
      return null;
  }
}
class Lt {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new Lt(e.parentNode, $i(e), t);
  }
  static after(e, t) {
    return new Lt(e.parentNode, $i(e) + 1, t);
  }
}
var Ce = /* @__PURE__ */ (function(r) {
  return r[r.LTR = 0] = "LTR", r[r.RTL = 1] = "RTL", r;
})(Ce || (Ce = {}));
const Yi = Ce.LTR, nl = Ce.RTL;
function pu(r) {
  let e = [];
  for (let t = 0; t < r.length; t++)
    e.push(1 << +r[t]);
  return e;
}
const am = /* @__PURE__ */ pu("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), lm = /* @__PURE__ */ pu("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), da = /* @__PURE__ */ Object.create(null), Vt = [];
for (let r of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ r.charCodeAt(0), t = /* @__PURE__ */ r.charCodeAt(1);
  da[e] = t, da[t] = -e;
}
function gu(r) {
  return r <= 247 ? am[r] : 1424 <= r && r <= 1524 ? 2 : 1536 <= r && r <= 1785 ? lm[r - 1536] : 1774 <= r && r <= 2220 ? 4 : 8192 <= r && r <= 8204 ? 256 : 64336 <= r && r <= 65023 ? 4 : 1;
}
const hm = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
class Kt {
  /**
  The direction of this span.
  */
  get dir() {
    return this.level % 2 ? nl : Yi;
  }
  /**
  @internal
  */
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
  }
  /**
  @internal
  */
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  /**
  @internal
  */
  forward(e, t) {
    return e == (this.dir == t);
  }
  /**
  @internal
  */
  static find(e, t, i, n) {
    let s = -1;
    for (let o = 0; o < e.length; o++) {
      let a = e[o];
      if (a.from <= t && a.to >= t) {
        if (a.level == i)
          return o;
        (s < 0 || (n != 0 ? n < 0 ? a.from < t : a.to > t : e[s].level > a.level)) && (s = o);
      }
    }
    if (s < 0)
      throw new RangeError("Index out of range");
    return s;
  }
}
function mu(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++) {
    let i = r[t], n = e[t];
    if (i.from != n.from || i.to != n.to || i.direction != n.direction || !mu(i.inner, n.inner))
      return !1;
  }
  return !0;
}
const xe = [];
function cm(r, e, t, i, n) {
  for (let s = 0; s <= i.length; s++) {
    let o = s ? i[s - 1].to : e, a = s < i.length ? i[s].from : t, l = s ? 256 : n;
    for (let c = o, u = l, p = l; c < a; c++) {
      let m = gu(r.charCodeAt(c));
      m == 512 ? m = u : m == 8 && p == 4 && (m = 16), xe[c] = m == 4 ? 2 : m, m & 7 && (p = m), u = m;
    }
    for (let c = o, u = l, p = l; c < a; c++) {
      let m = xe[c];
      if (m == 128)
        c < a - 1 && u == xe[c + 1] && u & 24 ? m = xe[c] = u : xe[c] = 256;
      else if (m == 64) {
        let v = c + 1;
        for (; v < a && xe[v] == 64; )
          v++;
        let b = c && u == 8 || v < t && xe[v] == 8 ? p == 1 ? 1 : 8 : 256;
        for (let w = c; w < v; w++)
          xe[w] = b;
        c = v - 1;
      } else m == 8 && p == 1 && (xe[c] = 1);
      u = m, m & 7 && (p = m);
    }
  }
}
function fm(r, e, t, i, n) {
  let s = n == 1 ? 2 : 1;
  for (let o = 0, a = 0, l = 0; o <= i.length; o++) {
    let c = o ? i[o - 1].to : e, u = o < i.length ? i[o].from : t;
    for (let p = c, m, v, b; p < u; p++)
      if (v = da[m = r.charCodeAt(p)])
        if (v < 0) {
          for (let w = a - 3; w >= 0; w -= 3)
            if (Vt[w + 1] == -v) {
              let C = Vt[w + 2], A = C & 2 ? n : C & 4 ? C & 1 ? s : n : 0;
              A && (xe[p] = xe[Vt[w]] = A), a = w;
              break;
            }
        } else {
          if (Vt.length == 189)
            break;
          Vt[a++] = p, Vt[a++] = m, Vt[a++] = l;
        }
      else if ((b = xe[p]) == 2 || b == 1) {
        let w = b == n;
        l = w ? 0 : 1;
        for (let C = a - 3; C >= 0; C -= 3) {
          let A = Vt[C + 2];
          if (A & 2)
            break;
          if (w)
            Vt[C + 2] |= 2;
          else {
            if (A & 4)
              break;
            Vt[C + 2] |= 4;
          }
        }
      }
  }
}
function um(r, e, t, i) {
  for (let n = 0, s = i; n <= t.length; n++) {
    let o = n ? t[n - 1].to : r, a = n < t.length ? t[n].from : e;
    for (let l = o; l < a; ) {
      let c = xe[l];
      if (c == 256) {
        let u = l + 1;
        for (; ; )
          if (u == a) {
            if (n == t.length)
              break;
            u = t[n++].to, a = n < t.length ? t[n].from : e;
          } else if (xe[u] == 256)
            u++;
          else
            break;
        let p = s == 1, m = (u < e ? xe[u] : i) == 1, v = p == m ? p ? 1 : 2 : i;
        for (let b = u, w = n, C = w ? t[w - 1].to : r; b > l; )
          b == C && (b = t[--w].from, C = w ? t[w - 1].to : r), xe[--b] = v;
        l = u;
      } else
        s = c, l++;
    }
  }
}
function Oa(r, e, t, i, n, s, o) {
  let a = i % 2 ? 2 : 1;
  if (i % 2 == n % 2)
    for (let l = e, c = 0; l < t; ) {
      let u = !0, p = !1;
      if (c == s.length || l < s[c].from) {
        let w = xe[l];
        w != a && (u = !1, p = w == 16);
      }
      let m = !u && a == 1 ? [] : null, v = u ? i : i + 1, b = l;
      e: for (; ; )
        if (c < s.length && b == s[c].from) {
          if (p)
            break e;
          let w = s[c];
          if (!u)
            for (let C = w.to, A = c + 1; ; ) {
              if (C == t)
                break e;
              if (A < s.length && s[A].from == C)
                C = s[A++].to;
              else {
                if (xe[C] == a)
                  break e;
                break;
              }
            }
          if (c++, m)
            m.push(w);
          else {
            w.from > l && o.push(new Kt(l, w.from, v));
            let C = w.direction == Yi != !(v % 2);
            pa(r, C ? i + 1 : i, n, w.inner, w.from, w.to, o), l = w.to;
          }
          b = w.to;
        } else {
          if (b == t || (u ? xe[b] != a : xe[b] == a))
            break;
          b++;
        }
      m ? Oa(r, l, b, i + 1, n, m, o) : l < b && o.push(new Kt(l, b, v)), l = b;
    }
  else
    for (let l = t, c = s.length; l > e; ) {
      let u = !0, p = !1;
      if (!c || l > s[c - 1].to) {
        let w = xe[l - 1];
        w != a && (u = !1, p = w == 16);
      }
      let m = !u && a == 1 ? [] : null, v = u ? i : i + 1, b = l;
      e: for (; ; )
        if (c && b == s[c - 1].to) {
          if (p)
            break e;
          let w = s[--c];
          if (!u)
            for (let C = w.from, A = c; ; ) {
              if (C == e)
                break e;
              if (A && s[A - 1].to == C)
                C = s[--A].from;
              else {
                if (xe[C - 1] == a)
                  break e;
                break;
              }
            }
          if (m)
            m.push(w);
          else {
            w.to < l && o.push(new Kt(w.to, l, v));
            let C = w.direction == Yi != !(v % 2);
            pa(r, C ? i + 1 : i, n, w.inner, w.from, w.to, o), l = w.from;
          }
          b = w.from;
        } else {
          if (b == e || (u ? xe[b - 1] != a : xe[b - 1] == a))
            break;
          b--;
        }
      m ? Oa(r, b, l, i + 1, n, m, o) : b < l && o.push(new Kt(b, l, v)), l = b;
    }
}
function pa(r, e, t, i, n, s, o) {
  let a = e % 2 ? 2 : 1;
  cm(r, n, s, i, a), fm(r, n, s, i, a), um(n, s, i, a), Oa(r, n, s, e, t, i, o);
}
function dm(r, e, t) {
  if (!r)
    return [new Kt(0, 0, e == nl ? 1 : 0)];
  if (e == Yi && !t.length && !hm.test(r))
    return yu(r.length);
  if (t.length)
    for (; r.length > xe.length; )
      xe[xe.length] = 256;
  let i = [], n = e == Yi ? 0 : 1;
  return pa(r, n, n, t, 0, r.length, i), i;
}
function yu(r) {
  return [new Kt(0, r, 0)];
}
let vu = "";
function Om(r, e, t, i, n) {
  var s;
  let o = i.head - r.from, a = Kt.find(e, o, (s = i.bidiLevel) !== null && s !== void 0 ? s : -1, i.assoc), l = e[a], c = l.side(n, t);
  if (o == c) {
    let m = a += n ? 1 : -1;
    if (m < 0 || m >= e.length)
      return null;
    l = e[a = m], o = l.side(!n, t), c = l.side(n, t);
  }
  let u = We(r.text, o, l.forward(n, t));
  (u < l.from || u > l.to) && (u = c), vu = r.text.slice(Math.min(o, u), Math.max(o, u));
  let p = a == (n ? e.length - 1 : 0) ? null : e[a + (n ? 1 : -1)];
  return p && u == c && p.level + (n ? 0 : 1) < l.level ? L.cursor(p.side(!n, t) + r.from, p.forward(n, t) ? 1 : -1, p.level) : L.cursor(u + r.from, l.forward(n, t) ? -1 : 1, l.level);
}
function pm(r, e, t) {
  for (let i = e; i < t; i++) {
    let n = gu(r.charCodeAt(i));
    if (n == 1)
      return Yi;
    if (n == 2 || n == 4)
      return nl;
  }
  return Yi;
}
const Su = /* @__PURE__ */ q.define(), bu = /* @__PURE__ */ q.define(), ku = /* @__PURE__ */ q.define(), xu = /* @__PURE__ */ q.define(), ga = /* @__PURE__ */ q.define(), wu = /* @__PURE__ */ q.define(), Qu = /* @__PURE__ */ q.define(), sl = /* @__PURE__ */ q.define(), ol = /* @__PURE__ */ q.define(), $u = /* @__PURE__ */ q.define({
  combine: (r) => r.some((e) => e)
}), Pu = /* @__PURE__ */ q.define({
  combine: (r) => r.some((e) => e)
}), Cu = /* @__PURE__ */ q.define();
class ar {
  constructor(e, t, i, n, s, o = !1) {
    this.range = e, this.y = t, this.x = i, this.yMargin = n, this.xMargin = s, this.isSnapshot = o;
  }
  map(e) {
    return e.empty ? this : new ar(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(e) {
    return this.range.to <= e.doc.length ? this : new ar(L.cursor(e.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
}
const Cn = /* @__PURE__ */ be.define({ map: (r, e) => r.map(e) }), Tu = /* @__PURE__ */ be.define();
function Jt(r, e, t) {
  let i = r.facet(xu);
  i.length ? i[0](e) : window.onerror && window.onerror(String(e), t, void 0, void 0, e) || (t ? console.error(t + ":", e) : console.error(e));
}
const ai = /* @__PURE__ */ q.define({ combine: (r) => r.length ? r[0] : !0 });
let gm = 0;
const ir = /* @__PURE__ */ q.define({
  combine(r) {
    return r.filter((e, t) => {
      for (let i = 0; i < t; i++)
        if (r[i].plugin == e.plugin)
          return !1;
      return !0;
    });
  }
});
class Tt {
  constructor(e, t, i, n, s) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.domEventObservers = n, this.baseExtensions = s(this), this.extension = this.baseExtensions.concat(ir.of({ plugin: this, arg: void 0 }));
  }
  /**
  Create an extension for this plugin with the given argument.
  */
  of(e) {
    return this.baseExtensions.concat(ir.of({ plugin: this, arg: e }));
  }
  /**
  Define a plugin from a constructor function that creates the
  plugin's value, given an editor view.
  */
  static define(e, t) {
    const { eventHandlers: i, eventObservers: n, provide: s, decorations: o } = t || {};
    return new Tt(gm++, e, i, n, (a) => {
      let l = [];
      return o && l.push(Xs.of((c) => {
        let u = c.plugin(a);
        return u ? o(u) : ee.none;
      })), s && l.push(s(a)), l;
    });
  }
  /**
  Create a plugin for a class whose constructor takes a single
  editor view as argument.
  */
  static fromClass(e, t) {
    return Tt.define((i, n) => new e(i, n), t);
  }
}
class ho {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  get plugin() {
    return this.spec && this.spec.plugin;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (i) {
            if (Jt(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.plugin.create(e, this.spec.arg);
      } catch (t) {
        Jt(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Jt(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Au = /* @__PURE__ */ q.define(), al = /* @__PURE__ */ q.define(), Xs = /* @__PURE__ */ q.define(), Mu = /* @__PURE__ */ q.define(), ll = /* @__PURE__ */ q.define(), gn = /* @__PURE__ */ q.define(), Ru = /* @__PURE__ */ q.define();
function jh(r, e) {
  let t = r.state.facet(Ru);
  if (!t.length)
    return t;
  let i = t.map((s) => s instanceof Function ? s(r) : s), n = [];
  return pe.spans(i, e.from, e.to, {
    point() {
    },
    span(s, o, a, l) {
      let c = s - e.from, u = o - e.from, p = n;
      for (let m = a.length - 1; m >= 0; m--, l--) {
        let v = a[m].spec.bidiIsolate, b;
        if (v == null && (v = pm(e.text, c, u)), l > 0 && p.length && (b = p[p.length - 1]).to == c && b.direction == v)
          b.to = u, p = b.inner;
        else {
          let w = { from: c, to: u, direction: v, inner: [] };
          p.push(w), p = w.inner;
        }
      }
    }
  }), n;
}
const Zu = /* @__PURE__ */ q.define();
function Xu(r) {
  let e = 0, t = 0, i = 0, n = 0;
  for (let s of r.state.facet(Zu)) {
    let o = s(r);
    o && (o.left != null && (e = Math.max(e, o.left)), o.right != null && (t = Math.max(t, o.right)), o.top != null && (i = Math.max(i, o.top)), o.bottom != null && (n = Math.max(n, o.bottom)));
  }
  return { left: e, right: t, top: i, bottom: n };
}
const Br = /* @__PURE__ */ q.define();
class $t {
  constructor(e, t, i, n) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = n;
  }
  join(e) {
    return new $t(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let n = e[t - 1];
      if (!(n.fromA > i.toA)) {
        if (n.toA < i.fromA)
          break;
        i = i.join(n), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  // Extend a set to cover all the content in `ranges`, which is a
  // flat array with each pair of numbers representing fromB/toB
  // positions. These pairs are generated in unchanged ranges, so the
  // offset between doc A and doc B is the same for their start and
  // end points.
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let n = 0, s = 0, o = 0; ; ) {
      let a = n < e.length ? e[n].fromB : 1e9, l = s < t.length ? t[s] : 1e9, c = Math.min(a, l);
      if (c == 1e9)
        break;
      let u = c + o, p = c, m = u;
      for (; ; )
        if (s < t.length && t[s] <= p) {
          let v = t[s + 1];
          s += 2, p = Math.max(p, v);
          for (let b = n; b < e.length && e[b].fromB <= p; b++)
            o = e[b].toA - e[b].toB;
          m = Math.max(m, v + o);
        } else if (n < e.length && e[n].fromB <= p) {
          let v = e[n++];
          p = Math.max(p, v.toB), m = Math.max(m, v.toA), o = v.toA - v.toB;
        } else
          break;
      i.push(new $t(u, m, c, p));
    }
    return i;
  }
}
class ls {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = Be.empty(this.startState.doc.length);
    for (let s of i)
      this.changes = this.changes.compose(s.changes);
    let n = [];
    this.changes.iterChangedRanges((s, o, a, l) => n.push(new $t(s, o, a, l))), this.changedRanges = n;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new ls(e, t, i);
  }
  /**
  Tells you whether the [viewport](https://codemirror.net/6/docs/ref/#view.EditorView.viewport) or
  [visible ranges](https://codemirror.net/6/docs/ref/#view.EditorView.visibleRanges) changed in this
  update.
  */
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  /**
  Returns true when
  [`viewportChanged`](https://codemirror.net/6/docs/ref/#view.ViewUpdate.viewportChanged) is true
  and the viewport change is not just the result of mapping it in
  response to document changes.
  */
  get viewportMoved() {
    return (this.flags & 8) > 0;
  }
  /**
  Indicates whether the height of a block element in the editor
  changed in this update.
  */
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  /**
  Returns true when the document was modified or the size of the
  editor, or elements within the editor, changed.
  */
  get geometryChanged() {
    return this.docChanged || (this.flags & 18) > 0;
  }
  /**
  True when this update indicates a focus change.
  */
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  /**
  Whether the document changed in this update.
  */
  get docChanged() {
    return !this.changes.empty;
  }
  /**
  Whether the selection was explicitly set in this update.
  */
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  /**
  @internal
  */
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
const mm = [];
class Me {
  constructor(e, t, i = 0) {
    this.dom = e, this.length = t, this.flags = i, this.parent = null, e.cmTile = this;
  }
  get breakAfter() {
    return this.flags & 1;
  }
  get children() {
    return mm;
  }
  isWidget() {
    return !1;
  }
  get isHidden() {
    return !1;
  }
  isComposite() {
    return !1;
  }
  isLine() {
    return !1;
  }
  isText() {
    return !1;
  }
  isBlock() {
    return !1;
  }
  get domAttrs() {
    return null;
  }
  sync(e) {
    if (this.flags |= 2, this.flags & 4) {
      this.flags &= -5;
      let t = this.domAttrs;
      t && Jg(this.dom, t);
    }
  }
  toString() {
    return this.constructor.name + (this.children.length ? `(${this.children})` : "") + (this.breakAfter ? "#" : "");
  }
  destroy() {
    this.parent = null;
  }
  setDOM(e) {
    this.dom = e, e.cmTile = this;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e, t = this.posAtStart) {
    let i = t;
    for (let n of this.children) {
      if (n == e)
        return i;
      i += n.length + n.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  covers(e) {
    return !0;
  }
  coordsIn(e, t, i) {
    return null;
  }
  domPosFor(e, t) {
    let i = $i(this.dom), n = this.length ? e > 0 : t > 0;
    return new Lt(this.parent.dom, i + (n ? 1 : 0), e == 0 || e == this.length);
  }
  markDirty(e) {
    this.flags &= -3, e && (this.flags |= 4), this.parent && this.parent.flags & 2 && this.parent.markDirty(!1);
  }
  get overrideDOMText() {
    return null;
  }
  get root() {
    for (let e = this; e; e = e.parent)
      if (e instanceof Es)
        return e;
    return null;
  }
  static get(e) {
    return e.cmTile;
  }
}
class Ls extends Me {
  constructor(e) {
    super(e, 0), this._children = [];
  }
  isComposite() {
    return !0;
  }
  get children() {
    return this._children;
  }
  get lastChild() {
    return this.children.length ? this.children[this.children.length - 1] : null;
  }
  append(e) {
    this.children.push(e), e.parent = this;
  }
  sync(e) {
    if (this.flags & 2)
      return;
    super.sync(e);
    let t = this.dom, i = null, n, s = e?.node == t ? e : null, o = 0;
    for (let a of this.children) {
      if (a.sync(e), o += a.length + a.breakAfter, n = i ? i.nextSibling : t.firstChild, s && n != a.dom && (s.written = !0), a.dom.parentNode == t)
        for (; n && n != a.dom; )
          n = Ih(n);
      else
        t.insertBefore(a.dom, n);
      i = a.dom;
    }
    for (n = i ? i.nextSibling : t.firstChild, s && n && (s.written = !0); n; )
      n = Ih(n);
    this.length = o;
  }
}
function Ih(r) {
  let e = r.nextSibling;
  return r.parentNode.removeChild(r), e;
}
class Es extends Ls {
  constructor(e, t) {
    super(t), this.view = e;
  }
  owns(e) {
    for (; e; e = e.parent)
      if (e == this)
        return !0;
    return !1;
  }
  isBlock() {
    return !0;
  }
  nearest(e) {
    for (; ; ) {
      if (!e)
        return null;
      let t = Me.get(e);
      if (t && this.owns(t))
        return t;
      e = e.parentNode;
    }
  }
  blockTiles(e) {
    for (let t = [], i = this, n = 0, s = 0; ; )
      if (n == i.children.length) {
        if (!t.length)
          return;
        i = i.parent, i.breakAfter && s++, n = t.pop();
      } else {
        let o = i.children[n++];
        if (o instanceof li)
          t.push(n), i = o, n = 0;
        else {
          let a = s + o.length, l = e(o, s);
          if (l !== void 0)
            return l;
          s = a + o.breakAfter;
        }
      }
  }
  // Find the block at the given position. If side < -1, make sure to
  // stay before block widgets at that position, if side > 1, after
  // such widgets (used for selection drawing, which needs to be able
  // to get coordinates for positions that aren't valid cursor positions).
  resolveBlock(e, t) {
    let i, n = -1, s, o = -1;
    if (this.blockTiles((a, l) => {
      let c = l + a.length;
      if (e >= l && e <= c) {
        if (a.isWidget() && t >= -1 && t <= 1) {
          if (a.flags & 32)
            return !0;
          a.flags & 16 && (i = void 0);
        }
        (l < e || e == c && (t < -1 ? a.length : a.covers(1))) && (!i || !a.isWidget() && i.isWidget()) && (i = a, n = e - l), (c > e || e == l && (t > 1 ? a.length : a.covers(-1))) && (!s || !a.isWidget() && s.isWidget()) && (s = a, o = e - l);
      }
    }), !i && !s)
      throw new Error("No tile at position " + e);
    return i && t < 0 || !s ? { tile: i, offset: n } : { tile: s, offset: o };
  }
}
class li extends Ls {
  constructor(e, t) {
    super(e), this.wrapper = t;
  }
  isBlock() {
    return !0;
  }
  covers(e) {
    return this.children.length ? e < 0 ? this.children[0].covers(-1) : this.lastChild.covers(1) : !1;
  }
  get domAttrs() {
    return this.wrapper.attributes;
  }
  static of(e, t) {
    let i = new li(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class ur extends Ls {
  constructor(e, t) {
    super(e), this.attrs = t;
  }
  isLine() {
    return !0;
  }
  static start(e, t, i) {
    let n = new ur(t || document.createElement("div"), e);
    return (!t || !i) && (n.flags |= 4), n;
  }
  get domAttrs() {
    return this.attrs;
  }
  // Find the tile associated with a given position in this line.
  resolveInline(e, t, i) {
    let n = null, s = -1, o = null, a = -1;
    function l(u, p) {
      for (let m = 0, v = 0; m < u.children.length && v <= p; m++) {
        let b = u.children[m], w = v + b.length;
        w >= p && (b.isComposite() ? l(b, p - v) : (!o || o.isHidden && (t > 0 && !(o.flags & 32) || i && vm(o, b))) && (w > p || b.flags & 32) ? (o = b, a = p - v) : (v < p || b.flags & 16 && !b.isHidden) && (n = b, s = p - v)), v = w;
      }
    }
    l(this, e);
    let c = (t < 0 ? n : o) || n || o;
    return c ? { tile: c, offset: c == n ? s : a } : null;
  }
  coordsIn(e, t, i) {
    let n = this.resolveInline(e, t, !0);
    return n ? n.tile.coordsIn(Math.max(0, n.offset), t, i) : ym(this);
  }
  domIn(e, t) {
    let i = this.resolveInline(e, t);
    if (i) {
      let { tile: n, offset: s } = i;
      if (this.dom.contains(n.dom))
        return n.isText() ? new Lt(n.dom, Math.min(n.dom.nodeValue.length, s)) : n.domPosFor(s, n.flags & 16 ? 1 : n.flags & 32 ? -1 : t);
      let o = i.tile.parent, a = !1;
      for (let l of o.children) {
        if (a)
          return new Lt(l.dom, 0);
        l == i.tile && (a = !0);
      }
    }
    return new Lt(this.dom, 0);
  }
}
function ym(r) {
  let e = r.dom.lastChild;
  if (!e)
    return r.dom.getBoundingClientRect();
  let t = Nn(e);
  return t[t.length - 1] || null;
}
function vm(r, e) {
  let t = r.coordsIn(0, 1), i = e.coordsIn(0, 1);
  return t && i && i.top < t.bottom;
}
class dt extends Ls {
  constructor(e, t) {
    super(e), this.mark = t;
  }
  get domAttrs() {
    return this.mark.attrs;
  }
  static of(e, t) {
    let i = new dt(t || document.createElement(e.tagName), e);
    return t || (i.flags |= 4), i;
  }
}
class _i extends Me {
  constructor(e, t) {
    super(e, t.length), this.text = t;
  }
  sync(e) {
    this.flags & 2 || (super.sync(e), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text));
  }
  isText() {
    return !0;
  }
  toString() {
    return JSON.stringify(this.text);
  }
  coordsIn(e, t, i) {
    let n = this.dom.nodeValue.length;
    e > n && (e = n);
    let s = e, o = e, a = 0;
    e == 0 && t < 0 || e == n && t >= 0 ? V.chrome || V.gecko || (e ? (s--, a = 1) : o < n && (o++, a = -1)) : t < 0 ? s-- : o < n && o++;
    let l = en(this.dom, s, o).getClientRects();
    if (!l.length)
      return null;
    let c = l[(a ? a < 0 : t >= 0) ? 0 : l.length - 1];
    return V.safari && !a && c.width == 0 && (c = Array.prototype.find.call(l, (u) => u.width) || c), i == null ? c : as(c, (a ? a > 0 : t < 0) == i);
  }
  static of(e, t) {
    let i = new _i(t || document.createTextNode(e), e);
    return t || (i.flags |= 2), i;
  }
}
class zi extends Me {
  constructor(e, t, i, n) {
    super(e, t, n), this.widget = i;
  }
  isWidget() {
    return !0;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  covers(e) {
    return this.flags & 48 ? !1 : (this.flags & (e < 0 ? 64 : 128)) > 0;
  }
  coordsIn(e, t) {
    return this.coordsInWidget(e, t, !1);
  }
  coordsInWidget(e, t, i) {
    let n = this.widget.coordsAt(this.dom, e, t);
    if (n)
      return n;
    if (i)
      return as(this.dom.getBoundingClientRect(), this.length ? e == 0 : t <= 0);
    {
      let s = this.dom.getClientRects(), o = null;
      if (!s.length)
        return null;
      let a = this.flags & 16 ? !0 : this.flags & 32 ? !1 : e > 0;
      for (let l = a ? s.length - 1 : 0; o = s[l], !(e > 0 ? l == 0 : l == s.length - 1 || o.top < o.bottom); l += a ? -1 : 1)
        ;
      return as(o, !a);
    }
  }
  get overrideDOMText() {
    if (!this.length)
      return me.empty;
    let { root: e } = this;
    if (!e)
      return me.empty;
    let t = this.posAtStart;
    return e.view.state.doc.slice(t, t + this.length);
  }
  destroy() {
    super.destroy(), this.widget.destroy(this.dom);
  }
  static of(e, t, i, n, s) {
    return s || (s = e.toDOM(t), e.editable || (s.contentEditable = "false")), new zi(s, i, e, n);
  }
}
class hs extends Me {
  constructor(e) {
    let t = document.createElement("img");
    t.className = "cm-widgetBuffer", t.setAttribute("aria-hidden", "true"), super(t, 0, e);
  }
  get isHidden() {
    return !0;
  }
  get overrideDOMText() {
    return me.empty;
  }
  coordsIn(e, t, i) {
    let n = this.dom.getBoundingClientRect();
    return i == null ? n : as(n, t > 0 == i);
  }
}
class Sm {
  constructor(e) {
    this.index = 0, this.beforeBreak = !1, this.parents = [], this.tile = e;
  }
  // Advance by the given distance. If side is -1, stop leaving or
  // entering tiles, or skipping zero-length tiles, once the distance
  // has been traversed. When side is 1, leave, enter, or skip
  // everything at the end position.
  advance(e, t, i) {
    let { tile: n, index: s, beforeBreak: o, parents: a } = this;
    for (; e || t > 0; )
      if (n.isComposite())
        if (o) {
          if (!e)
            break;
          i && i.break(), e--, o = !1;
        } else if (s == n.children.length) {
          if (!e && !a.length)
            break;
          i && i.leave(n), o = !!n.breakAfter, { tile: n, index: s } = a.pop(), s++;
        } else {
          let l = n.children[s], c = l.breakAfter;
          (t > 0 ? l.length <= e : l.length < e) && (!i || i.skip(l, 0, l.length) !== !1 || !l.isComposite) ? (o = !!c, s++, e -= l.length) : (a.push({ tile: n, index: s }), n = l, s = 0, i && l.isComposite() && i.enter(l));
        }
      else if (s == n.length)
        o = !!n.breakAfter, { tile: n, index: s } = a.pop(), s++;
      else if (e) {
        let l = Math.min(e, n.length - s);
        i && i.skip(n, s, s + l), e -= l, s += l;
      } else
        break;
    return this.tile = n, this.index = s, this.beforeBreak = o, this;
  }
  get root() {
    return this.parents.length ? this.parents[0].tile : this.tile;
  }
}
class bm {
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.wrapper = i, this.rank = n;
  }
}
class km {
  constructor(e, t, i) {
    this.cache = e, this.root = t, this.blockWrappers = i, this.curLine = null, this.lastBlock = null, this.afterWidget = null, this.pos = 0, this.wrappers = [], this.wrapperPos = 0;
  }
  addText(e, t, i, n) {
    var s;
    this.flushBuffer();
    let o = this.ensureMarks(t, i), a = o.lastChild;
    if (a && a.isText() && !(a.flags & 8) && a.length + e.length < 512) {
      this.cache.reused.set(
        a,
        2
        /* Reused.DOM */
      );
      let l = o.children[o.children.length - 1] = new _i(a.dom, a.text + e);
      l.parent = o;
    } else
      o.append(n || _i.of(e, (s = this.cache.find(_i)) === null || s === void 0 ? void 0 : s.dom));
    this.pos += e.length, this.afterWidget = null;
  }
  addComposition(e, t) {
    let i = this.curLine;
    i.dom != t.line.dom && (i.setDOM(this.cache.reused.has(t.line) ? co(t.line.dom) : t.line.dom), this.cache.reused.set(
      t.line,
      2
      /* Reused.DOM */
    ));
    let n = i;
    for (let a = t.marks.length - 1; a >= 0; a--) {
      let l = t.marks[a], c = n.lastChild;
      if (c instanceof dt && c.mark.eq(l.mark))
        c.dom != l.dom && c.setDOM(co(l.dom)), n = c;
      else {
        if (this.cache.reused.get(l)) {
          let p = Me.get(l.dom);
          p && p.setDOM(co(l.dom));
        }
        let u = dt.of(l.mark, l.dom);
        n.append(u), n = u;
      }
      this.cache.reused.set(
        l,
        2
        /* Reused.DOM */
      );
    }
    let s = Me.get(e.text);
    s && this.cache.reused.set(
      s,
      2
      /* Reused.DOM */
    );
    let o = new _i(e.text, e.text.nodeValue);
    o.flags |= 8, this.pos = e.range.toB, n.append(o);
  }
  addInlineWidget(e, t, i) {
    let n = this.afterWidget && e.flags & 48 && (this.afterWidget.flags & 48) == (e.flags & 48);
    n || this.flushBuffer();
    let s = this.ensureMarks(t, i);
    !n && !(e.flags & 16) && s.append(this.getBuffer(1)), s.append(e), this.pos += e.length, this.afterWidget = e;
  }
  addMark(e, t, i) {
    this.flushBuffer(), this.ensureMarks(t, i).append(e), this.pos += e.length, this.afterWidget = null;
  }
  addBlockWidget(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  continueWidget(e) {
    let t = this.afterWidget || this.lastBlock;
    t.length += e, this.pos += e;
  }
  addLineStart(e, t) {
    var i;
    e || (e = Lu);
    let n = ur.start(e, t || ((i = this.cache.find(ur)) === null || i === void 0 ? void 0 : i.dom), !!t);
    this.getBlockPos().append(this.lastBlock = this.curLine = n);
  }
  addLine(e) {
    this.getBlockPos().append(e), this.pos += e.length, this.lastBlock = e, this.endLine();
  }
  addBreak() {
    this.lastBlock.flags |= 1, this.endLine(), this.pos++;
  }
  addLineStartIfNotCovered(e) {
    this.blockPosCovered() || this.addLineStart(e);
  }
  ensureLine(e) {
    this.curLine || this.addLineStart(e);
  }
  ensureMarks(e, t) {
    var i;
    let n = this.curLine;
    for (let s = e.length - 1; s >= 0; s--) {
      let o = e[s], a;
      if (t > 0 && (a = n.lastChild) && a instanceof dt && a.mark.eq(o))
        n = a, t--;
      else {
        let l = dt.of(o, (i = this.cache.find(dt, (c) => c.mark.eq(o))) === null || i === void 0 ? void 0 : i.dom);
        n.append(l), n = l, t = 0;
      }
    }
    return n;
  }
  endLine() {
    if (this.curLine) {
      this.flushBuffer();
      let e = this.curLine.lastChild;
      (!e || !Wh(this.curLine, !1) || e.dom.nodeName != "BR" && e.isWidget() && !(V.ios && Wh(this.curLine, !0))) && this.curLine.append(this.cache.findWidget(
        fo,
        0,
        32
        /* TileFlag.After */
      ) || new zi(
        fo.toDOM(),
        0,
        fo,
        32
        /* TileFlag.After */
      )), this.curLine = this.afterWidget = null;
    }
  }
  updateBlockWrappers() {
    this.wrapperPos > this.pos + 1e4 && (this.blockWrappers.goto(this.pos), this.wrappers.length = 0);
    for (let e = this.wrappers.length - 1; e >= 0; e--)
      this.wrappers[e].to < this.pos && this.wrappers.splice(e, 1);
    for (let e = this.blockWrappers; e.value && e.from <= this.pos; e.next())
      if (e.to >= this.pos) {
        let t = e.rank * 102 + e.value.rank, i = new bm(e.from, e.to, e.value, t), n = this.wrappers.length;
        for (; n > 0 && (this.wrappers[n - 1].rank - i.rank || this.wrappers[n - 1].to - i.to) < 0; )
          n--;
        this.wrappers.splice(n, 0, i);
      }
    this.wrapperPos = this.pos;
  }
  getBlockPos() {
    var e;
    this.updateBlockWrappers();
    let t = this.root;
    for (let i of this.wrappers) {
      let n = t.lastChild;
      if (i.from < this.pos && n instanceof li && n.wrapper.eq(i.wrapper))
        t = n;
      else {
        let s = li.of(i.wrapper, (e = this.cache.find(li, (o) => o.wrapper.eq(i.wrapper))) === null || e === void 0 ? void 0 : e.dom);
        t.append(s), t = s;
      }
    }
    return t;
  }
  blockPosCovered() {
    let e = this.lastBlock;
    return e != null && !e.breakAfter && (!e.isWidget() || (e.flags & 160) > 0);
  }
  getBuffer(e) {
    let t = 2 | (e < 0 ? 16 : 32), i = this.cache.find(
      hs,
      void 0,
      1
      /* Reused.Full */
    );
    return i && (i.flags = t), i || new hs(t);
  }
  flushBuffer() {
    this.afterWidget && !(this.afterWidget.flags & 32) && (this.afterWidget.parent.append(this.getBuffer(-1)), this.afterWidget = null);
  }
}
class xm {
  constructor(e) {
    this.skipCount = 0, this.text = "", this.textOff = 0, this.cursor = e.iter();
  }
  skip(e) {
    this.textOff + e <= this.text.length ? this.textOff += e : (this.skipCount += e - (this.text.length - this.textOff), this.text = "", this.textOff = 0);
  }
  next(e) {
    if (this.textOff == this.text.length) {
      let { value: n, lineBreak: s, done: o } = this.cursor.next(this.skipCount);
      if (this.skipCount = 0, o)
        throw new Error("Ran out of text content when drawing inline views");
      this.text = n;
      let a = this.textOff = Math.min(e, n.length);
      return s ? null : n.slice(0, a);
    }
    let t = Math.min(this.text.length, this.textOff + e), i = this.text.slice(this.textOff, t);
    return this.textOff = t, i;
  }
}
const cs = [zi, ur, _i, dt, hs, li, Es];
for (let r = 0; r < cs.length; r++)
  cs[r].bucket = r;
class wm {
  constructor(e) {
    this.view = e, this.buckets = cs.map(() => []), this.index = cs.map(() => 0), this.reused = /* @__PURE__ */ new Map();
  }
  // Put a tile in the cache.
  add(e) {
    let t = e.constructor.bucket, i = this.buckets[t];
    i.length < 6 ? i.push(e) : i[
      this.index[t] = (this.index[t] + 1) % 6
      /* C.Bucket */
    ] = e;
  }
  find(e, t, i = 2) {
    let n = e.bucket, s = this.buckets[n], o = this.index[n];
    for (let a = 0; a < s.length; a++) {
      let l = (a + o) % s.length, c = s[l];
      if ((!t || t(c)) && !this.reused.has(c))
        return s.splice(l, 1), l < o && this.index[n]--, this.reused.set(c, i), c;
    }
    return null;
  }
  findWidget(e, t, i) {
    let n = this.buckets[0];
    if (n.length)
      for (let s = 0, o = 0; ; s++) {
        if (s == n.length) {
          if (o)
            return null;
          o = 1, s = 0;
        }
        let a = n[s];
        if (!this.reused.has(a) && (o == 0 ? a.widget.compare(e) : a.widget.constructor == e.constructor && e.updateDOM(a.dom, this.view, a.widget)))
          return n.splice(s, 1), s < this.index[0] && this.index[0]--, a.widget == e && a.length == t && (a.flags & 497) == i ? (this.reused.set(
            a,
            1
            /* Reused.Full */
          ), a) : (this.reused.set(
            a,
            2
            /* Reused.DOM */
          ), new zi(a.dom, t, e, a.flags & -498 | i));
      }
  }
  reuse(e) {
    return this.reused.set(
      e,
      1
      /* Reused.Full */
    ), e;
  }
  maybeReuse(e, t = 2) {
    if (!this.reused.has(e))
      return this.reused.set(e, t), e.dom;
  }
  clear() {
    for (let e = 0; e < this.buckets.length; e++)
      this.buckets[e].length = this.index[e] = 0;
  }
}
class Qm {
  constructor(e, t, i, n, s) {
    this.view = e, this.decorations = n, this.disallowBlockEffectsFor = s, this.openWidget = !1, this.openMarks = 0, this.cache = new wm(e), this.text = new xm(e.state.doc), this.builder = new km(this.cache, new Es(e, e.contentDOM), pe.iter(i)), this.cache.reused.set(
      t,
      2
      /* Reused.DOM */
    ), this.old = new Sm(t), this.reuseWalker = {
      skip: (o, a, l) => {
        if (this.cache.add(o), o.isComposite())
          return !1;
      },
      enter: (o) => this.cache.add(o),
      leave: () => {
      },
      break: () => {
      }
    };
  }
  run(e, t) {
    let i = t && this.getCompositionContext(t.text);
    for (let n = 0, s = 0, o = 0; ; ) {
      let a = o < e.length ? e[o++] : null, l = a ? a.fromA : this.old.root.length;
      if (l > n) {
        let c = l - n;
        this.preserve(c, !o, !a), n = l, s += c;
      }
      if (!a)
        break;
      t && a.fromA <= t.range.fromA && a.toA >= t.range.toA ? (this.forward(a.fromA, t.range.fromA, t.range.fromA < t.range.toA ? 1 : -1), this.emit(s, t.range.fromB), this.builder.flushBuffer(), this.cache.clear(), this.builder.addComposition(t, i), this.text.skip(t.range.toB - t.range.fromB), this.forward(t.range.fromA, a.toA), this.emit(t.range.toB, a.toB)) : (this.forward(a.fromA, a.toA), this.emit(s, a.toB)), s = a.toB, n = a.toA;
    }
    return this.builder.curLine && this.builder.endLine(), this.builder.root;
  }
  preserve(e, t, i) {
    let n = Cm(this.old), s = this.openMarks;
    this.old.advance(e, i ? 1 : -1, {
      skip: (o, a, l) => {
        if (o.isWidget())
          if (this.openWidget)
            this.builder.continueWidget(l - a);
          else {
            let c = l > 0 || a < o.length ? zi.of(o.widget, this.view, l - a, o.flags & 496, this.cache.maybeReuse(o)) : this.cache.reuse(o);
            c.flags & 256 ? (c.flags &= -2, this.builder.addBlockWidget(c)) : (this.builder.ensureLine(null), this.builder.addInlineWidget(c, n, s), s = n.length);
          }
        else if (o.isText())
          this.builder.ensureLine(null), !a && l == o.length && !this.cache.reused.has(o) ? this.builder.addText(o.text, n, s, this.cache.reuse(o)) : (this.cache.add(o), this.builder.addText(o.text.slice(a, l), n, s)), s = n.length;
        else if (o.isLine())
          o.flags &= -2, this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), this.builder.addLine(o);
        else if (o instanceof hs)
          this.cache.add(o);
        else if (o instanceof dt)
          this.builder.ensureLine(null), this.builder.addMark(o, n, s), this.cache.reused.set(
            o,
            1
            /* Reused.Full */
          ), s = n.length;
        else
          return !1;
        this.openWidget = !1;
      },
      enter: (o) => {
        o.isLine() ? this.builder.addLineStart(o.attrs, this.cache.maybeReuse(o)) : (this.cache.add(o), o instanceof dt && n.unshift(o.mark)), this.openWidget = !1;
      },
      leave: (o) => {
        o.isLine() ? n.length && (n.length = s = 0) : o instanceof dt && (n.shift(), s = Math.min(s, n.length));
      },
      break: () => {
        this.builder.addBreak(), this.openWidget = !1;
      }
    }), this.text.skip(e);
  }
  emit(e, t) {
    let i = null, n = this.builder, s = -1, o = pe.spans(this.decorations, e, t, {
      point: (a, l, c, u, p, m) => {
        if (c instanceof Wi) {
          if (this.disallowBlockEffectsFor[m]) {
            if (c.block)
              throw new RangeError("Block decorations may not be specified via plugins");
            if (l > this.view.state.doc.lineAt(a).to)
              throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
          }
          if (s = u.length, p > u.length)
            n.continueWidget(l - a);
          else {
            let v = c.widget || (c.block ? dr.block : dr.inline), b = $m(c), w = this.cache.findWidget(v, l - a, b) || zi.of(v, this.view, l - a, b);
            c.block ? (c.startSide > 0 && n.addLineStartIfNotCovered(i), n.addBlockWidget(w)) : (n.ensureLine(i), n.addInlineWidget(w, u, p));
          }
          i = null;
        } else
          i = Pm(i, c);
        l > a && this.text.skip(l - a);
      },
      span: (a, l, c, u) => {
        for (let p = a; p < l; ) {
          let m = this.text.next(Math.min(512, l - p));
          m == null ? (n.addLineStartIfNotCovered(i), n.addBreak(), p++) : (n.ensureLine(i), n.addText(m, c, p == a ? u : c.length), p += m.length), i = null;
        }
        s = c.length;
      }
    });
    s > -1 && (this.openWidget = o > s), this.openWidget || n.addLineStartIfNotCovered(i), this.openMarks = o;
  }
  forward(e, t, i = 1) {
    t - e <= 10 ? this.old.advance(t - e, i, this.reuseWalker) : (this.old.advance(5, -1, this.reuseWalker), this.old.advance(t - e - 10, -1), this.old.advance(5, i, this.reuseWalker));
  }
  getCompositionContext(e) {
    let t = [], i = null;
    for (let n = e.parentNode; ; n = n.parentNode) {
      let s = Me.get(n);
      if (n == this.view.contentDOM)
        break;
      s instanceof dt ? t.push(s) : s?.isLine() ? i = s : s instanceof li || (n.nodeName == "DIV" && !i && n != this.view.contentDOM ? i = new ur(n, Lu) : i || t.push(dt.of(new On({ tagName: n.nodeName.toLowerCase(), attributes: em(n) }), n)));
    }
    return { line: i, marks: t };
  }
}
function Wh(r, e) {
  let t = (i) => {
    for (let n of i.children)
      if ((e ? n.isText() : n.length) || t(n))
        return !0;
    return !1;
  };
  return t(r);
}
function $m(r) {
  let e = r.isReplace ? (r.startSide < 0 ? 64 : 0) | (r.endSide > 0 ? 128 : 0) : r.startSide > 0 ? 32 : 16;
  return r.block && (e |= 256), e;
}
const Lu = { class: "cm-line" };
function Pm(r, e) {
  let t = e.spec.attributes, i = e.spec.class;
  return !t && !i || (r || (r = { class: "cm-line" }), t && il(t, r), i && (r.class += " " + i)), r;
}
function Cm(r) {
  let e = [];
  for (let t = r.parents.length; t > 1; t--) {
    let i = t == r.parents.length ? r.tile : r.parents[t].tile;
    i instanceof dt && e.push(i.mark);
  }
  return e;
}
function co(r) {
  let e = Me.get(r);
  return e && e.setDOM(r.cloneNode()), r;
}
class dr extends Bt {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return !0;
  }
}
dr.inline = /* @__PURE__ */ new dr("span");
dr.block = /* @__PURE__ */ new dr("div");
const fo = /* @__PURE__ */ new class extends Bt {
  toDOM() {
    return document.createElement("br");
  }
  get isHidden() {
    return !0;
  }
  get editable() {
    return !0;
  }
}();
class Yh {
  constructor(e) {
    this.view = e, this.decorations = [], this.blockWrappers = [], this.dynamicDecorationMap = [!1], this.domChanged = null, this.hasComposition = null, this.editContextFormatting = ee.none, this.lastCompositionAfterCursor = !1, this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.updateDeco(), this.tile = new Es(e, e.contentDOM), this.updateInner([new $t(0, 0, 0, e.state.doc.length)], null);
  }
  // Update the document view to a given state.
  update(e) {
    var t;
    let i = e.changedRanges;
    this.minWidth > 0 && i.length && (i.every(({ fromA: u, toA: p }) => p < this.minWidthFrom || u > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.updateEditContextFormatting(e);
    let n = -1;
    this.view.inputState.composing >= 0 && !this.view.observer.editContext && (!((t = this.domChanged) === null || t === void 0) && t.newSel ? n = this.domChanged.newSel.head : !_m(e.changes, this.hasComposition) && !e.selectionSet && (n = e.state.selection.main.head));
    let s = n > -1 ? Am(this.view, e.changes, n) : null;
    if (this.domChanged = null, this.hasComposition) {
      let { from: u, to: p } = this.hasComposition;
      i = new $t(u, p, e.changes.mapPos(u, -1), e.changes.mapPos(p, 1)).addToSet(i.slice());
    }
    this.hasComposition = s ? { from: s.range.fromB, to: s.range.toB } : null, (V.ie || V.chrome) && !s && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let o = this.decorations, a = this.blockWrappers;
    this.updateDeco();
    let l = Zm(o, this.decorations, e.changes);
    l.length && (i = $t.extendWithRanges(i, l));
    let c = Lm(a, this.blockWrappers, e.changes);
    return c.length && (i = $t.extendWithRanges(i, c)), s && !i.some((u) => u.fromA <= s.range.fromA && u.toA >= s.range.toA) && (i = s.range.addToSet(i.slice())), this.tile.flags & 2 && i.length == 0 ? !1 : (this.updateInner(i, s), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  // Used by update and the constructor do perform the actual DOM
  // update
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0;
    let { observer: i } = this.view;
    i.ignore(() => {
      if (t || e.length) {
        let o = this.tile, a = new Qm(this.view, o, this.blockWrappers, this.decorations, this.dynamicDecorationMap);
        t && Me.get(t.text) && a.cache.reused.set(
          Me.get(t.text),
          2
          /* Reused.DOM */
        ), this.tile = a.run(e, t), ma(o, a.cache.reused);
      }
      this.tile.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px", this.tile.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let s = V.chrome || V.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.tile.sync(s), s && (s.written || i.selectionRange.focusNode != s.node || !this.tile.dom.contains(s.node)) && (this.forceSelection = !0), this.tile.dom.style.height = "";
    });
    let n = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let s of this.tile.children)
        s.isWidget() && s.widget instanceof uo && n.push(s.dom);
    i.updateGaps(n);
  }
  updateEditContextFormatting(e) {
    this.editContextFormatting = this.editContextFormatting.map(e.changes);
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(Tu) && (this.editContextFormatting = i.value);
  }
  // Sync the DOM selection to this.state.selection
  updateSelection(e = !1, t = !1) {
    (e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange();
    let { dom: i } = this.tile, n = this.view.root.activeElement, s = n == i, o = !s && !(this.view.state.facet(ai) || i.tabIndex > -1) && Dr(i, this.view.observer.selectionRange) && !(n && i.contains(n));
    if (!(s || t || o))
      return;
    let a = this.forceSelection;
    this.forceSelection = !1;
    let l = this.view.state.selection.main, c, u;
    if (l.empty ? u = c = this.inlineDOMNearPos(l.anchor, l.assoc || 1) : (u = this.inlineDOMNearPos(l.head, l.head == l.from ? 1 : -1), c = this.inlineDOMNearPos(l.anchor, l.anchor == l.from ? 1 : -1)), V.gecko && l.empty && !this.hasComposition && Tm(c)) {
      let m = document.createTextNode("");
      this.view.observer.ignore(() => c.node.insertBefore(m, c.node.childNodes[c.offset] || null)), c = u = new Lt(m, 0), a = !0;
    }
    let p = this.view.observer.selectionRange;
    (a || !p.focusNode || (!Vr(c.node, c.offset, p.anchorNode, p.anchorOffset) || !Vr(u.node, u.offset, p.focusNode, p.focusOffset)) && !this.suppressWidgetCursorChange(p, l)) && (this.view.observer.ignore(() => {
      V.android && V.chrome && i.contains(p.focusNode) && Em(p.focusNode, i) && (i.blur(), i.focus({ preventScroll: !0 }));
      let m = Jr(this.view.root);
      if (m) if (l.empty) {
        if (V.gecko) {
          let v = Mm(c.node, c.offset);
          if (v && v != 3) {
            let b = (v == 1 ? du : Ou)(c.node, c.offset);
            b && (c = new Lt(b.node, b.offset));
          }
        }
        m.collapse(c.node, c.offset), l.bidiLevel != null && m.caretBidiLevel !== void 0 && (m.caretBidiLevel = l.bidiLevel);
      } else if (m.extend) {
        m.collapse(c.node, c.offset);
        try {
          m.extend(u.node, u.offset);
        } catch {
        }
      } else {
        let v = document.createRange();
        l.anchor > l.head && ([c, u] = [u, c]), v.setEnd(u.node, u.offset), v.setStart(c.node, c.offset), m.removeAllRanges(), m.addRange(v);
      }
      o && this.view.root.activeElement == i && (i.blur(), n && n.focus());
    }), this.view.observer.setSelectionRange(c, u)), this.impreciseAnchor = c.precise ? null : new Lt(p.anchorNode, p.anchorOffset), this.impreciseHead = u.precise ? null : new Lt(p.focusNode, p.focusOffset);
  }
  // If a zero-length widget is inserted next to the cursor during
  // composition, avoid moving it across it and disrupting the
  // composition.
  suppressWidgetCursorChange(e, t) {
    return this.hasComposition && t.empty && Vr(e.focusNode, e.focusOffset, e.anchorNode, e.anchorOffset) && this.posFromDOM(e.focusNode, e.focusOffset) == t.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view: e } = this, t = e.state.selection.main, i = Jr(e.root), { anchorNode: n, anchorOffset: s } = e.observer.selectionRange;
    if (!i || !t.empty || !t.assoc || !i.modify)
      return;
    let o = this.lineAt(t.head, t.assoc);
    if (!o)
      return;
    let a = o.posAtStart;
    if (t.head == a || t.head == a + o.length)
      return;
    let l = this.coordsAt(t.head, -1), c = this.coordsAt(t.head, 1);
    if (!l || !c || l.bottom > c.top)
      return;
    let u = this.domAtPos(t.head + t.assoc, t.assoc);
    i.collapse(u.node, u.offset), i.modify("move", t.assoc < 0 ? "forward" : "backward", "lineboundary"), e.observer.readSelectionRange();
    let p = e.observer.selectionRange;
    e.docView.posFromDOM(p.anchorNode, p.anchorOffset) != t.from && i.collapse(n, s);
  }
  posFromDOM(e, t) {
    let i = this.tile.nearest(e);
    if (!i)
      return this.tile.dom.compareDocumentPosition(e) & 2 ? 0 : this.view.state.doc.length;
    let n = i.posAtStart;
    if (i.isComposite()) {
      let s;
      if (e == i.dom)
        s = i.dom.childNodes[t];
      else {
        let o = fi(e) == 0 ? 0 : t == 0 ? -1 : 1;
        for (; ; ) {
          let a = e.parentNode;
          if (a == i.dom)
            break;
          o == 0 && a.firstChild != a.lastChild && (e == a.firstChild ? o = -1 : o = 1), e = a;
        }
        o < 0 ? s = e : s = e.nextSibling;
      }
      if (s == i.dom.firstChild)
        return n;
      for (; s && !Me.get(s); )
        s = s.nextSibling;
      if (!s)
        return n + i.length;
      for (let o = 0, a = n; ; o++) {
        let l = i.children[o];
        if (l.dom == s)
          return a;
        a += l.length + l.breakAfter;
      }
    } else return i.isText() ? e == i.dom ? n + t : n + (t ? i.length : 0) : n;
  }
  domAtPos(e, t) {
    let { tile: i, offset: n } = this.tile.resolveBlock(e, t);
    return i.isWidget() ? i.domPosFor(n, t) : i.domIn(n, t);
  }
  inlineDOMNearPos(e, t) {
    let i, n = -1, s = !1, o, a = -1, l = !1;
    return this.tile.blockTiles((c, u) => {
      if (c.isWidget()) {
        if (c.flags & 32 && u >= e)
          return !0;
        c.flags & 16 && (s = !0);
      } else {
        let p = u + c.length;
        if (u <= e && (i = c, n = e - u, s = p < e), p >= e && !o && (o = c, a = e - u, l = u > e), u > e && o)
          return !0;
      }
    }), !i && !o ? this.domAtPos(e, t) : (s && o ? i = null : l && i && (o = null), i && t < 0 || !o ? i.domIn(n, t) : o.domIn(a, t));
  }
  // Get the coord of the element at the given side of the given
  // position. If rtl is given, flatten it using that text direction.
  coordsAt(e, t, i) {
    let { tile: n, offset: s } = this.tile.resolveBlock(e, t);
    return n.isWidget() ? n.widget instanceof uo ? null : n.coordsInWidget(s, t, !0) : n.coordsIn(s, t, i);
  }
  lineAt(e, t) {
    let { tile: i } = this.tile.resolveBlock(e, t);
    return i.isLine() ? i : null;
  }
  coordsForChar(e) {
    let { tile: t, offset: i } = this.tile.resolveBlock(e, 1);
    if (!t.isLine())
      return null;
    function n(s, o) {
      if (s.isComposite())
        for (let a of s.children) {
          if (a.length >= o) {
            let l = n(a, o);
            if (l)
              return l;
          }
          if (o -= a.length, o < 0)
            break;
        }
      else if (s.isText() && o < s.length) {
        let a = We(s.text, o);
        if (a == o)
          return null;
        let l = en(s.dom, o, a).getClientRects();
        for (let c = 0; c < l.length; c++) {
          let u = l[c];
          if (c == l.length - 1 || u.top < u.bottom && u.left < u.right)
            return u;
        }
      }
      return null;
    }
    return n(t, i);
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: n } = e, s = this.view.contentDOM.clientWidth, o = s > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, a = -1, l = this.view.textDirection == Ce.LTR, c = 0, u = (p, m, v) => {
      for (let b = 0; b < p.children.length && !(m > n); b++) {
        let w = p.children[b], C = m + w.length, A = w.dom.getBoundingClientRect(), { height: X } = A;
        if (v && !b && (c += A.top - v.top), w instanceof li)
          C > i && u(w, m, A);
        else if (m >= i && (c > 0 && t.push(-c), t.push(X + c), c = 0, o)) {
          let _ = w.dom.lastChild, H = _ ? Nn(_) : [];
          if (H.length) {
            let B = H[H.length - 1], Y = l ? B.right - A.left : A.right - B.left;
            Y > a && (a = Y, this.minWidth = s, this.minWidthFrom = m, this.minWidthTo = C);
          }
        }
        v && b == p.children.length - 1 && (c += v.bottom - A.bottom), m = C + w.breakAfter;
      }
    };
    return u(this.tile, 0, null), t;
  }
  textDirectionAt(e) {
    let { tile: t } = this.tile.resolveBlock(e, 1);
    return getComputedStyle(t.dom).direction == "rtl" ? Ce.RTL : Ce.LTR;
  }
  measureTextSize() {
    let e = this.tile.blockTiles((o) => {
      if (o.isLine() && o.children.length && o.length <= 20) {
        let a = 0, l;
        for (let c of o.children) {
          if (!c.isText() || /[^ -~]/.test(c.text))
            return;
          let u = Nn(c.dom);
          if (u.length != 1)
            return;
          a += u[0].width, l = u[0].height;
        }
        if (a)
          return {
            lineHeight: o.dom.getBoundingClientRect().height,
            charWidth: a / o.length,
            textHeight: l
          };
      }
    });
    if (e)
      return e;
    let t = document.createElement("div"), i, n, s;
    return t.className = "cm-line", t.style.width = "99999px", t.style.position = "absolute", t.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.tile.dom.appendChild(t);
      let o = Nn(t.firstChild)[0];
      i = t.getBoundingClientRect().height, n = o && o.width ? o.width / 27 : 7, s = o && o.height ? o.height : i, t.remove();
    }), { lineHeight: i, charWidth: n, textHeight: s };
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, n = 0; ; n++) {
      let s = n == t.viewports.length ? null : t.viewports[n], o = s ? s.from - 1 : this.view.state.doc.length;
      if (o > i) {
        let a = (t.lineBlockAt(o).bottom - t.lineBlockAt(i).top) / this.view.scaleY;
        e.push(ee.replace({
          widget: new uo(a),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!s)
        break;
      i = s.to + 1;
    }
    return ee.set(e);
  }
  updateDeco() {
    let e = 1, t = this.view.state.facet(Xs).map((s) => (this.dynamicDecorationMap[e++] = typeof s == "function") ? s(this.view) : s), i = !1, n = this.view.state.facet(ll).map((s, o) => {
      let a = typeof s == "function";
      return a && (i = !0), a ? s(this.view) : s;
    });
    for (n.length && (this.dynamicDecorationMap[e++] = i, t.push(pe.join(n))), this.decorations = [
      this.editContextFormatting,
      ...t,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ]; e < this.decorations.length; )
      this.dynamicDecorationMap[e++] = !1;
    this.blockWrappers = this.view.state.facet(Mu).map((s) => typeof s == "function" ? s(this.view) : s);
  }
  scrollIntoView(e) {
    if (e.isSnapshot) {
      let c = this.view.viewState.lineBlockAt(e.range.head);
      this.view.scrollDOM.scrollTop = c.top - e.yMargin, this.view.scrollDOM.scrollLeft = e.xMargin;
      return;
    }
    for (let c of this.view.state.facet(Cu))
      try {
        if (c(this.view, e.range, e))
          return !0;
      } catch (u) {
        Jt(this.view.state, u, "scroll handler");
      }
    let { range: t } = e, i = this.coordsAt(t.head, t.assoc || (t.head > t.anchor ? -1 : 1)), n;
    if (!i)
      return;
    !t.empty && (n = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, n.left),
      top: Math.min(i.top, n.top),
      right: Math.max(i.right, n.right),
      bottom: Math.max(i.bottom, n.bottom)
    });
    let s = Xu(this.view), o = {
      left: i.left - s.left,
      top: i.top - s.top,
      right: i.right + s.right,
      bottom: i.bottom + s.bottom
    }, { offsetWidth: a, offsetHeight: l } = this.view.scrollDOM;
    if (rm(this.view.scrollDOM, o, t.head < t.anchor ? -1 : 1, e.x, e.y, Math.max(Math.min(e.xMargin, a), -a), Math.max(Math.min(e.yMargin, l), -l), this.view.textDirection == Ce.LTR), window.visualViewport && window.innerHeight - window.visualViewport.height > 1 && (i.top > window.pageYOffset + window.visualViewport.offsetTop + window.visualViewport.height || i.bottom < window.pageYOffset + window.visualViewport.offsetTop)) {
      let c = this.view.docView.lineAt(t.head, 1);
      c && c.dom.scrollIntoView({ block: "nearest" });
    }
  }
  lineHasWidget(e) {
    let t = (i) => i.isWidget() || i.children.some(t);
    return t(this.tile.resolveBlock(e, 1).tile);
  }
  destroy() {
    ma(this.tile);
  }
}
function ma(r, e) {
  let t = e?.get(r);
  if (t != 1) {
    t == null && r.destroy();
    for (let i of r.children)
      ma(i, e);
  }
}
function Tm(r) {
  return r.node.nodeType == 1 && r.node.firstChild && (r.offset == 0 || r.node.childNodes[r.offset - 1].contentEditable == "false") && (r.offset == r.node.childNodes.length || r.node.childNodes[r.offset].contentEditable == "false");
}
function Eu(r, e) {
  let t = r.observer.selectionRange;
  if (!t.focusNode)
    return null;
  let i = du(t.focusNode, t.focusOffset), n = Ou(t.focusNode, t.focusOffset), s = i || n;
  if (n && i && n.node != i.node) {
    let a = Me.get(n.node);
    if (!a || a.isText() && a.text != n.node.nodeValue)
      s = n;
    else if (r.docView.lastCompositionAfterCursor) {
      let l = Me.get(i.node);
      !l || l.isText() && l.text != i.node.nodeValue || (s = n);
    }
  }
  if (r.docView.lastCompositionAfterCursor = s != i, !s)
    return null;
  let o = e - s.offset;
  return { from: o, to: o + s.node.nodeValue.length, node: s.node };
}
function Am(r, e, t) {
  let i = Eu(r, t);
  if (!i)
    return null;
  let { node: n, from: s, to: o } = i, a = n.nodeValue;
  if (/[\n\r]/.test(a) || r.state.doc.sliceString(i.from, i.to) != a)
    return null;
  let l = e.invertedDesc;
  return { range: new $t(l.mapPos(s), l.mapPos(o), s, o), text: n };
}
function Mm(r, e) {
  return r.nodeType != 1 ? 0 : (e && r.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < r.childNodes.length && r.childNodes[e].contentEditable == "false" ? 2 : 0);
}
let Rm = class {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    sr(e, t, this.changes);
  }
  comparePoint(e, t) {
    sr(e, t, this.changes);
  }
  boundChange(e) {
    sr(e, e, this.changes);
  }
};
function Zm(r, e, t) {
  let i = new Rm();
  return pe.compare(r, e, t, i), i.changes;
}
class Xm {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    sr(e, t, this.changes);
  }
  comparePoint() {
  }
  boundChange(e) {
    sr(e, e, this.changes);
  }
}
function Lm(r, e, t) {
  let i = new Xm();
  return pe.compare(r, e, t, i), i.changes;
}
function Em(r, e) {
  for (let t = r; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function _m(r, e) {
  let t = !1;
  return e && r.iterChangedRanges((i, n) => {
    i < e.to && n > e.from && (t = !0);
  }), t;
}
class uo extends Bt {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return e.className = "cm-gap", this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get editable() {
    return !0;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return !1;
  }
}
function Bm(r, e, t = 1) {
  let i = r.charCategorizer(e), n = r.doc.lineAt(e), s = e - n.from;
  if (n.length == 0)
    return L.cursor(e);
  s == 0 ? t = 1 : s == n.length && (t = -1);
  let o = s, a = s;
  t < 0 ? o = We(n.text, s, !1) : a = We(n.text, s);
  let l = i(n.text.slice(o, a));
  for (; o > 0; ) {
    let c = We(n.text, o, !1);
    if (i(n.text.slice(c, o)) != l)
      break;
    o = c;
  }
  for (; a < n.length; ) {
    let c = We(n.text, a);
    if (i(n.text.slice(a, c)) != l)
      break;
    a = c;
  }
  return L.undirectionalRange(o + n.from, a + n.from);
}
function jm(r, e, t, i, n) {
  let s = Math.round((i - e.left) * r.defaultCharacterWidth);
  if (r.lineWrapping && t.height > r.defaultLineHeight * 1.5) {
    let a = r.viewState.heightOracle.textHeight, l = Math.floor((n - t.top - (r.defaultLineHeight - a) * 0.5) / a);
    s += l * r.viewState.heightOracle.lineLength;
  }
  let o = r.state.sliceDoc(t.from, t.to);
  return t.from + Gg(o, s, r.state.tabSize);
}
function ya(r, e, t) {
  let i = r.lineBlockAt(e);
  if (Array.isArray(i.type)) {
    let n;
    for (let s of i.type) {
      if (s.from > e)
        break;
      if (!(s.to < e)) {
        if (s.from < e && s.to > e)
          return s;
        (!n || s.type == He.Text && (n.type != s.type || (t < 0 ? s.from < e : s.to > e))) && (n = s);
      }
    }
    return n || i;
  }
  return i;
}
function Im(r, e, t, i) {
  let n = ya(r, e.head, e.assoc || -1), s = !i || n.type != He.Text || !(r.lineWrapping || n.widgetLineBreaks) ? null : r.coordsAtPos(e.assoc < 0 && e.head > n.from ? e.head - 1 : e.head);
  if (s) {
    let o = r.dom.getBoundingClientRect(), a = r.textDirectionAt(n.from), l = r.posAtCoords({
      x: t == (a == Ce.LTR) ? o.right - 1 : o.left + 1,
      y: (s.top + s.bottom) / 2
    });
    if (l != null)
      return L.cursor(l, t ? -1 : 1);
  }
  return L.cursor(t ? n.to : n.from, t ? -1 : 1);
}
function zh(r, e, t, i) {
  let n = r.state.doc.lineAt(e.head), s = r.bidiSpans(n), o = r.textDirectionAt(n.from);
  for (let a = e, l = null; ; ) {
    let c = Om(n, s, o, a, t), u = vu;
    if (!c) {
      if (n.number == (t ? r.state.doc.lines : 1))
        return a;
      u = `
`, n = r.state.doc.line(n.number + (t ? 1 : -1)), s = r.bidiSpans(n), c = r.visualLineSide(n, !t);
    }
    if (l) {
      if (!l(u))
        return a;
    } else {
      if (!i)
        return c;
      l = i(u);
    }
    a = c;
  }
}
function Wm(r, e, t) {
  let i = r.state.charCategorizer(e), n = i(t);
  return (s) => {
    let o = i(s);
    return n == Fe.Space && (n = o), n == o;
  };
}
function Ym(r, e, t, i) {
  let n = e.head, s = t ? 1 : -1;
  if (n == (t ? r.state.doc.length : 0))
    return L.cursor(n, e.assoc);
  let o = e.goalColumn, a, l = r.contentDOM.getBoundingClientRect(), c = r.coordsAtPos(n, e.assoc || ((e.empty ? t : e.head == e.from) ? 1 : -1)), u = r.documentTop;
  if (c)
    o == null && (o = c.left - l.left), a = s < 0 ? c.top : c.bottom;
  else {
    let b = r.viewState.lineBlockAt(n);
    o == null && (o = Math.min(l.right - l.left, r.defaultCharacterWidth * (n - b.from))), a = (s < 0 ? b.top : b.bottom) + u;
  }
  let p = l.left + o, m = r.viewState.heightOracle.textHeight >> 1, v = i ?? m;
  for (let b = 0; ; b += m) {
    let w = a + (v + b) * s, C = va(r, { x: p, y: w }, !1, s);
    if (t ? w > l.bottom : w < l.top)
      return L.cursor(C.pos, C.assoc);
    let A = r.coordsAtPos(C.pos, C.assoc), X = A ? (A.top + A.bottom) / 2 : 0;
    if (!A || (t ? X > a : X < a))
      return L.cursor(C.pos, C.assoc, void 0, o);
  }
}
function Nr(r, e, t) {
  for (; ; ) {
    let i = 0;
    for (let n of r)
      n.between(e - 1, e + 1, (s, o, a) => {
        if (e > s && e < o) {
          let l = i || t || (e - s < o - e ? -1 : 1);
          e = l < 0 ? s : o, i = l;
        }
      });
    if (!i)
      return e;
  }
}
function _u(r, e) {
  let t = null;
  for (let i = 0; i < e.ranges.length; i++) {
    let n = e.ranges[i], s = null;
    if (n.empty) {
      let o = Nr(r, n.from, 0);
      o != n.from && (s = L.cursor(o, -1));
    } else {
      let o = Nr(r, n.from, -1), a = Nr(r, n.to, 1);
      (o != n.from || a != n.to) && (n.undirectional ? s = L.undirectionalRange(n.from, n.to) : s = L.range(n.from == n.anchor ? o : a, n.from == n.head ? o : a));
    }
    s && (t || (t = e.ranges.slice()), t[i] = s);
  }
  return t ? L.create(t, e.mainIndex) : e;
}
function Oo(r, e, t) {
  let i = Nr(r.state.facet(gn).map((n) => n(r)), t.from, e.head > t.from ? -1 : 1);
  return i == t.from ? t : L.cursor(i, i < t.from ? 1 : -1);
}
class Ht {
  constructor(e, t) {
    this.pos = e, this.assoc = t;
  }
}
function va(r, e, t, i) {
  let n = r.contentDOM.getBoundingClientRect(), s = n.top + r.viewState.paddingTop, { x: o, y: a } = e, l = a - s, c;
  for (; ; ) {
    if (l < 0)
      return new Ht(0, 1);
    if (l > r.viewState.docHeight)
      return new Ht(r.state.doc.length, -1);
    if (c = r.elementAtHeight(l), i == null)
      break;
    if (c.type == He.Text) {
      if (i < 0 ? c.to < r.viewport.from : c.from > r.viewport.to)
        break;
      let m = r.docView.coordsAt(i < 0 ? c.from : c.to, i > 0 ? -1 : 1);
      if (m && (i < 0 ? m.top <= l + s : m.bottom >= l + s))
        break;
    }
    let p = r.viewState.heightOracle.textHeight / 2;
    l = i > 0 ? c.bottom + p : c.top - p;
  }
  if (r.viewport.from >= c.to || r.viewport.to <= c.from) {
    if (t)
      return null;
    if (c.type == He.Text) {
      let p = jm(r, n, c, o, a);
      return new Ht(p, p == c.from ? 1 : -1);
    }
  }
  if (c.type != He.Text)
    return l < (c.top + c.bottom) / 2 ? new Ht(c.from, 1) : new Ht(c.to, -1);
  let u = r.docView.lineAt(c.from, 2);
  return (!u || u.length != c.length) && (u = r.docView.lineAt(c.from, -2)), new zm(r, o, a, r.textDirectionAt(c.from)).scanTile(u, c.from);
}
class zm {
  constructor(e, t, i, n) {
    this.view = e, this.x = t, this.y = i, this.baseDir = n, this.line = null, this.spans = null;
  }
  bidiSpansAt(e) {
    return (!this.line || this.line.from > e || this.line.to < e) && (this.line = this.view.state.doc.lineAt(e), this.spans = this.view.bidiSpans(this.line)), this;
  }
  baseDirAt(e, t) {
    let { line: i, spans: n } = this.bidiSpansAt(e);
    return n[Kt.find(n, e - i.from, -1, t)].level == this.baseDir;
  }
  dirAt(e, t) {
    let { line: i, spans: n } = this.bidiSpansAt(e);
    return n[Kt.find(n, e - i.from, -1, t)].dir;
  }
  // Used to short-circuit bidi tests for content with a uniform direction
  bidiIn(e, t) {
    let { spans: i, line: n } = this.bidiSpansAt(e);
    return i.length > 1 || i.length && (i[0].level != this.baseDir || i[0].to + n.from < t);
  }
  // Scan through the rectangles for the content of a tile with inline
  // content, looking for one that overlaps the queried position
  // vertically and is closest horizontally. The caller is responsible
  // for dividing its content into N pieces, and pass an array with
  // N+1 positions (including the position after the last piece). For
  // a text tile, these will be character clusters, for a composite
  // tile, these will be child tiles.
  scan(e, t, i = !1) {
    let n = 0, s = e.length - 1, o = /* @__PURE__ */ new Set(), a = this.bidiIn(e[0], e[s]), l, c, u = -1, p = 1e9, m;
    e: for (; n < s; ) {
      let b = s - n, w = n + s >> 1;
      t: if (o.has(w)) {
        let A = n + Math.floor(Math.random() * b);
        for (let X = 0; X < b; X++) {
          if (!o.has(A)) {
            w = A;
            break t;
          }
          A++, A == s && (A = n);
        }
        break e;
      }
      o.add(w);
      let C = t(w);
      if (C)
        for (let A = 0; A < C.length; A++) {
          let X = C[A], _ = 0;
          if (!(X.width == 0 && C.length > 1)) {
            if (X.bottom < this.y)
              (!l || l.bottom < X.bottom) && (l = X), _ = 1;
            else if (X.top > this.y)
              (!c || c.top > X.top) && (c = X), _ = -1;
            else {
              let H = X.left > this.x ? this.x - X.left : X.right < this.x ? this.x - X.right : 0, B = Math.abs(H);
              B < p && (u = w, p = B, m = X), H && (_ = H < 0 == (this.baseDir == Ce.LTR) ? -1 : 1);
            }
            _ == -1 && (!a || this.baseDirAt(e[w], 1)) ? s = w : _ == 1 && (!a || this.baseDirAt(e[w + 1], -1)) && (n = w + 1);
          }
        }
    }
    if (!m) {
      if (!c && !l)
        return { i: e[0], after: !1 };
      let b = l && (!c || this.y - l.bottom < c.top - this.y) ? l : c;
      return this.y = (b.top + b.bottom) / 2, this.scan(e, t, !0);
    }
    if (p && !i) {
      let { top: b, bottom: w } = m;
      if (l && l.bottom > (b + b + w) / 3)
        return this.y = l.bottom - 1, this.scan(e, t, !0);
      if (c && c.top < (b + w + w) / 3)
        return this.y = c.top + 1, this.scan(e, t, !0);
    }
    let v = (a ? this.dirAt(e[u], 1) : this.baseDir) == Ce.LTR;
    return {
      i: u,
      // Test whether x is closes to the start or end of this element
      after: this.x > (m.left + m.right) / 2 == v
    };
  }
  scanText(e, t) {
    let i = [];
    for (let s = 0; s < e.length; s = We(e.text, s))
      i.push(t + s);
    i.push(t + e.length);
    let n = this.scan(i, (s) => {
      let o = i[s] - t, a = i[s + 1] - t;
      return en(e.dom, o, a).getClientRects();
    });
    return n.after ? new Ht(i[n.i + 1], -1) : new Ht(i[n.i], 1);
  }
  scanTile(e, t) {
    if (!e.length)
      return new Ht(t, 1);
    if (e.children.length == 1) {
      let a = e.children[0];
      if (a.isText())
        return this.scanText(a, t);
      if (a.isComposite())
        return this.scanTile(a, t);
    }
    let i = [t];
    for (let a = 0, l = t; a < e.children.length; a++)
      i.push(l += e.children[a].length);
    let n = this.scan(i, (a) => {
      let l = e.children[a];
      return l.flags & 48 ? null : (l.dom.nodeType == 1 ? l.dom : en(l.dom, 0, l.length)).getClientRects();
    }), s = e.children[n.i], o = i[n.i];
    return s.isText() ? this.scanText(s, o) : s.isComposite() ? this.scanTile(s, o) : n.after ? new Ht(i[n.i + 1], -1) : new Ht(o, 1);
  }
}
const Ji = "￿";
class Dm {
  constructor(e, t) {
    this.points = e, this.view = t, this.text = "", this.lineSeparator = t.state.facet(ge.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += Ji;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let n = e; ; ) {
      this.findPointBefore(i, n);
      let s = this.text.length;
      this.readNode(n);
      let o = Me.get(n), a = n.nextSibling;
      if (a == t) {
        o?.breakAfter && !a && i != this.view.contentDOM && this.lineBreak();
        break;
      }
      let l = Me.get(a);
      (o && l ? o.breakAfter : (o ? o.breakAfter : os(n)) || os(a) && (n.nodeName != "BR" || o?.isWidget()) && this.text.length > s) && !Nm(a, t) && this.lineBreak(), n = a;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, n = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let s = -1, o = 1, a;
      if (this.lineSeparator ? (s = t.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (a = n.exec(t)) && (s = a.index, o = a[0].length), this.append(t.slice(i, s < 0 ? t.length : s)), s < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let l of this.points)
          l.node == e && l.pos > this.text.length && (l.pos -= o - 1);
      i = s + o;
    }
  }
  readNode(e) {
    let t = Me.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let n = i.iter(); !n.next().done; )
        n.lineBreak ? this.lineBreak() : this.append(n.value);
    } else e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let i of this.points)
      i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let i of this.points)
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + (Vm(e, i.node, i.offset) ? t : 0));
  }
}
function Vm(r, e, t) {
  for (; ; ) {
    if (!e || t < fi(e))
      return !1;
    if (e == r)
      return !0;
    t = $i(e) + 1, e = e.parentNode;
  }
}
function Nm(r, e) {
  let t;
  for (; !(r == e || !r); r = r.nextSibling) {
    let i = Me.get(r);
    if (!i?.isWidget())
      return !1;
    i && (t || (t = [])).push(i);
  }
  if (t)
    for (let i of t) {
      let n = i.overrideDOMText;
      if (n?.length)
        return !1;
    }
  return !0;
}
class Dh {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class qm {
  constructor(e, t, i, n) {
    this.typeOver = n, this.bounds = null, this.text = "", this.domChanged = t > -1;
    let { impreciseHead: s, impreciseAnchor: o } = e.docView, a = e.state.selection;
    if (e.state.readOnly && t > -1)
      this.newSel = null;
    else if (t > -1 && (this.bounds = Bu(e.docView.tile, t, i, 0))) {
      let l = s || o ? [] : Um(e), c = new Dm(l, e);
      c.readRange(this.bounds.startDOM, this.bounds.endDOM), this.text = c.text, this.newSel = Fm(l, this.bounds.from);
    } else {
      let l = e.observer.selectionRange, c = s && s.node == l.focusNode && s.offset == l.focusOffset || !ua(e.contentDOM, l.focusNode) ? a.main.head : e.docView.posFromDOM(l.focusNode, l.focusOffset), u = o && o.node == l.anchorNode && o.offset == l.anchorOffset || !ua(e.contentDOM, l.anchorNode) ? a.main.anchor : e.docView.posFromDOM(l.anchorNode, l.anchorOffset), p = e.viewport;
      if ((V.ios || V.chrome) && c != u && Math.min(c, u) <= a.main.from && Math.max(c, u) >= a.main.to && (p.from > 0 || p.to < e.state.doc.length)) {
        let m = Math.min(c, u), v = Math.max(c, u), b = p.from - m, w = p.to - v;
        (b == 0 || b == 1 || m == 0) && (w == 0 || w == -1 || v == e.state.doc.length) && (c = 0, u = e.state.doc.length);
      }
      if (e.inputState.composing > -1 && a.ranges.length > 1)
        this.newSel = a.replaceRange(L.range(u, c));
      else if (e.lineWrapping && u == c && !(a.main.empty && a.main.head == c) && e.inputState.lastTouchTime > Date.now() - 100) {
        let m = e.coordsAtPos(c, -1), v = 0;
        m && (v = e.inputState.lastTouchY <= m.bottom ? -1 : 1), this.newSel = L.create([L.cursor(c, v)]);
      } else
        this.newSel = L.single(u, c);
    }
  }
}
function Bu(r, e, t, i) {
  if (r.isComposite()) {
    let n = -1, s = -1, o = -1, a = -1;
    for (let l = 0, c = i, u = i; l < r.children.length; l++) {
      let p = r.children[l], m = c + p.length;
      if (c < e && m > t)
        return Bu(p, e, t, c);
      if (m >= e && n == -1 && (n = l, s = c), c > t && p.dom.parentNode == r.dom) {
        o = l, a = u;
        break;
      }
      u = m, c = m + p.breakAfter;
    }
    return {
      from: s,
      to: a < 0 ? i + r.length : a,
      startDOM: (n ? r.children[n - 1].dom.nextSibling : null) || r.dom.firstChild,
      endDOM: o < r.children.length && o >= 0 ? r.children[o].dom : null
    };
  } else return r.isText() ? { from: i, to: i + r.length, startDOM: r.dom, endDOM: r.dom.nextSibling } : null;
}
function ju(r, e) {
  let t, { newSel: i } = e, { state: n } = r, s = n.selection.main, o = r.inputState.lastKeyTime > Date.now() - 100 ? r.inputState.lastKeyCode : -1;
  if (e.bounds) {
    let { from: a, to: l } = e.bounds, c = s.from, u = null;
    (o === 8 || V.android && e.text.length < l - a) && (c = s.to, u = "end");
    let p = n.doc.sliceString(a, l, Ji), m, v;
    !s.empty && s.from >= a && s.to <= l && (e.typeOver || p != e.text) && p.slice(0, s.from - a) == e.text.slice(0, s.from - a) && p.slice(s.to - a) == e.text.slice(m = e.text.length - (p.length - (s.to - a))) ? t = {
      from: s.from,
      to: s.to,
      insert: me.of(e.text.slice(s.from - a, m).split(Ji))
    } : (v = Iu(p, e.text, c - a, u)) && (V.chrome && o == 13 && v.toB == v.from + 2 && e.text.slice(v.from, v.toB) == Ji + Ji && v.toB--, t = {
      from: a + v.from,
      to: a + v.toA,
      insert: me.of(e.text.slice(v.from, v.toB).split(Ji))
    });
  } else i && (!r.hasFocus && n.facet(ai) || fs(i, s)) && (i = null);
  if (!t && !i)
    return !1;
  if ((V.mac || V.android) && t && t.from == t.to && t.from == s.head - 1 && /^\. ?$/.test(t.insert.toString()) && r.contentDOM.getAttribute("autocorrect") == "off" ? (i && t.insert.length == 2 && (i = L.single(i.main.anchor - 1, i.main.head - 1)), t = { from: t.from, to: t.to, insert: me.of([t.insert.toString().replace(".", " ")]) }) : n.doc.lineAt(s.from).to < s.to && r.docView.lineHasWidget(s.to) && r.inputState.insertingTextAt > Date.now() - 50 ? t = {
    from: s.from,
    to: s.to,
    insert: n.toText(r.inputState.insertingText)
  } : V.chrome && t && t.from == t.to && t.from == s.head && t.insert.toString() == `
 ` && r.lineWrapping && (i && (i = L.single(i.main.anchor - 1, i.main.head - 1)), t = { from: s.from, to: s.to, insert: me.of([" "]) }), t)
    return hl(r, t, i, o);
  if (i && !fs(i, s)) {
    let a = !1, l = "select";
    return r.inputState.lastSelectionTime > Date.now() - 50 && (r.inputState.lastSelectionOrigin == "select" && (a = !0), l = r.inputState.lastSelectionOrigin, l == "select.pointer" && (i = _u(n.facet(gn).map((c) => c(r)), i))), r.dispatch({ selection: i, scrollIntoView: a, userEvent: l }), !0;
  } else
    return !1;
}
function hl(r, e, t, i = -1) {
  if (V.ios && r.inputState.flushIOSKey(e))
    return !0;
  let n = r.state.selection.main;
  if (V.android && (e.to == n.to && // GBoard will sometimes remove a space it just inserted
  // after a completion when you press enter
  (e.from == n.from || e.from == n.from - 1 && r.state.sliceDoc(e.from, n.from) == " ") && e.insert.length == 1 && e.insert.lines == 2 && or(r.contentDOM, "Enter", 13) || (e.from == n.from - 1 && e.to == n.to && e.insert.length == 0 || i == 8 && e.insert.length < e.to - e.from && e.to > n.head) && or(r.contentDOM, "Backspace", 8) || e.from == n.from && e.to == n.to + 1 && e.insert.length == 0 && or(r.contentDOM, "Delete", 46)))
    return !0;
  let s = e.insert.toString();
  r.inputState.composing >= 0 && r.inputState.composing++;
  let o, a = () => o || (o = Gm(r, e, t));
  return r.state.facet(wu).some((l) => l(r, e.from, e.to, s, a)) || r.dispatch(a()), !0;
}
function Gm(r, e, t) {
  let i, n = r.state, s = n.selection.main, o = -1;
  if (e.from == e.to && e.from < s.from || e.from > s.to) {
    let l = e.from < s.from ? -1 : 1, c = l < 0 ? s.from : s.to, u = Nr(n.facet(gn).map((p) => p(r)), c, l);
    e.from == u && (o = u);
  }
  if (o > -1)
    i = {
      changes: e,
      selection: L.cursor(e.from + e.insert.length, -1)
    };
  else if (e.from >= s.from && e.to <= s.to && e.to - e.from >= (s.to - s.from) / 3 && (!t || t.main.empty && t.main.from == e.from + e.insert.length) && r.inputState.composing < 0) {
    let l = s.from < e.from ? n.sliceDoc(s.from, e.from) : "", c = s.to > e.to ? n.sliceDoc(e.to, s.to) : "";
    i = n.replaceSelection(r.state.toText(l + e.insert.sliceString(0, void 0, r.state.lineBreak) + c));
  } else {
    let l = n.changes(e), c = t && t.main.to <= l.newLength ? t.main : void 0;
    if (n.selection.ranges.length > 1 && (r.inputState.composing >= 0 || r.inputState.compositionPendingChange) && e.to <= s.to + 10 && e.to >= s.to - 10) {
      let u = r.state.sliceDoc(e.from, e.to), p, m = t && Eu(r, t.main.head);
      if (m) {
        let b = e.insert.length - (e.to - e.from);
        p = { from: m.from, to: m.to - b };
      } else
        p = r.state.doc.lineAt(s.head);
      let v = s.to - e.to;
      i = n.changeByRange((b) => {
        if (b.from == s.from && b.to == s.to)
          return { changes: l, range: c || b.map(l) };
        let w = b.to - v, C = w - u.length;
        if (r.state.sliceDoc(C, w) != u || // Unfortunately, there's no way to make multiple
        // changes in the same node work without aborting
        // composition, so cursors in the composition range are
        // ignored.
        w >= p.from && C <= p.to)
          return { range: b };
        let A = n.changes({ from: C, to: w, insert: e.insert }), X = b.to - s.to;
        return {
          changes: A,
          range: c ? L.range(Math.max(0, c.anchor + X), Math.max(0, c.head + X)) : b.map(A)
        };
      });
    } else
      i = {
        changes: l,
        selection: c && n.selection.replaceRange(c)
      };
  }
  let a = "input.type";
  return (r.composing || r.inputState.compositionPendingChange && r.inputState.compositionEndedAt > Date.now() - 50) && (r.inputState.compositionPendingChange = !1, a += ".compose", r.inputState.compositionFirstChange && (a += ".start", r.inputState.compositionFirstChange = !1)), n.update(i, { userEvent: a, scrollIntoView: !0 });
}
function Iu(r, e, t, i) {
  let n = Math.min(r.length, e.length), s = 0;
  for (; s < n && r.charCodeAt(s) == e.charCodeAt(s); )
    s++;
  if (s == n && r.length == e.length)
    return null;
  let o = r.length, a = e.length;
  for (; o > 0 && a > 0 && r.charCodeAt(o - 1) == e.charCodeAt(a - 1); )
    o--, a--;
  if (i == "end") {
    let l = Math.max(0, s - Math.min(o, a));
    t -= o + l - s;
  }
  if (o < s && r.length < e.length) {
    let l = t <= s && t >= o ? s - t : 0;
    s -= l, a = s + (a - o), o = s;
  } else if (a < s) {
    let l = t <= s && t >= a ? s - t : 0;
    s -= l, o = s + (o - a), a = s;
  }
  return { from: s, toA: o, toB: a };
}
function Um(r) {
  let e = [];
  if (r.root.activeElement != r.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: n, focusOffset: s } = r.observer.selectionRange;
  return t && (e.push(new Dh(t, i)), (n != t || s != i) && e.push(new Dh(n, s))), e;
}
function Fm(r, e) {
  if (r.length == 0)
    return null;
  let t = r[0].pos, i = r.length == 2 ? r[1].pos : t;
  return t > -1 && i > -1 ? L.single(t + e, i + e) : null;
}
function fs(r, e) {
  return e.head == r.main.head && e.anchor == r.main.anchor;
}
class Hm {
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  constructor(e) {
    this.view = e, this.lastKeyCode = 0, this.lastKeyTime = 0, this.touchActive = !1, this.lastTouchTime = 0, this.lastTouchX = 0, this.lastTouchY = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.lastWheelEvent = 0, this.pendingIOSKey = void 0, this.lastIOSMomentumScroll = 0, this.tabFocusMode = -1, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.handlers = /* @__PURE__ */ Object.create(null), this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.compositionPendingKey = !1, this.compositionPendingChange = !1, this.insertingText = "", this.insertingTextAt = 0, this.mouseSelection = null, this.draggedContent = null, this.handleEvent = this.handleEvent.bind(this), this.notifiedFocused = e.hasFocus, V.safari && e.contentDOM.addEventListener("input", () => null), V.gecko && d0(e.contentDOM.ownerDocument);
  }
  handleEvent(e) {
    !o0(this.view, e) || this.ignoreDuringComposition(e) || e.type == "keydown" && this.keydown(e) || (this.view.updateState != 0 ? Promise.resolve().then(() => this.runHandlers(e.type, e)) : this.runHandlers(e.type, e));
  }
  runHandlers(e, t) {
    let i = this.handlers[e];
    if (i) {
      for (let n of i.observers)
        n(this.view, t);
      for (let n of i.handlers) {
        if (t.defaultPrevented)
          break;
        if (n(this.view, t)) {
          t.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(e) {
    let t = Jm(e), i = this.handlers, n = this.view.contentDOM;
    for (let s in t)
      if (s != "scroll") {
        let o = !t[s].handlers.length, a = i[s];
        a && o != !a.handlers.length && (n.removeEventListener(s, this.handleEvent), a = null), a || n.addEventListener(s, this.handleEvent, { passive: o });
      }
    for (let s in i)
      s != "scroll" && !t[s] && n.removeEventListener(s, this.handleEvent);
    this.handlers = t;
  }
  keydown(e) {
    if (this.lastKeyCode = e.keyCode, this.lastKeyTime = Date.now(), e.keyCode == 9 && this.tabFocusMode > -1 && (!this.tabFocusMode || Date.now() <= this.tabFocusMode))
      return !0;
    if (this.tabFocusMode > 0 && e.keyCode != 27 && Yu.indexOf(e.keyCode) < 0 && (this.tabFocusMode = -1), V.android && V.chrome && !e.synthetic && (e.keyCode == 13 || e.keyCode == 8))
      return this.view.observer.delayAndroidKey(e.key, e.keyCode), !0;
    if (V.ios && !e.synthetic && !e.altKey && !e.metaKey && (Wu.some((t) => t.keyCode == e.keyCode) && !e.ctrlKey || e0.indexOf(e.key) > -1 && e.ctrlKey)) {
      let t = { ctrlKey: e.ctrlKey, altKey: e.altKey, metaKey: e.metaKey, shiftKey: e.shiftKey };
      return t.shiftKey && V.ios && !/^(off|none)$/.test(this.view.contentDOM.autocapitalize) && Km(this.view.win) && (t.shiftKey = !1), this.pendingIOSKey = { key: e.key, keyCode: e.keyCode, mods: t }, setTimeout(() => this.flushIOSKey(), 250), !0;
    }
    return e.keyCode != 229 && this.view.observer.forceFlush(), !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return !t || t.key == "Enter" && e && e.from < e.to && /^\S+$/.test(e.insert.toString()) ? !1 : (this.pendingIOSKey = void 0, or(this.view.contentDOM, t.key, t.keyCode, t.mods));
  }
  ignoreDuringComposition(e) {
    return !/^key/.test(e.type) || e.synthetic ? !1 : this.composing > 0 ? !0 : V.safari && !V.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100 ? (this.compositionPendingKey = !1, !0) : !1;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.view.observer.update(e), this.mouseSelection && this.mouseSelection.update(e), this.draggedContent && e.docChanged && (this.draggedContent = this.draggedContent.map(e.changes)), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
function Km(r) {
  return r.visualViewport ? r.visualViewport.height * r.visualViewport.scale / r.document.documentElement.clientHeight < 0.85 : !1;
}
function Vh(r, e) {
  return (t, i) => {
    try {
      return e.call(r, i, t);
    } catch (n) {
      Jt(t.state, n);
    }
  };
}
function Jm(r) {
  let e = /* @__PURE__ */ Object.create(null);
  function t(i) {
    return e[i] || (e[i] = { observers: [], handlers: [] });
  }
  for (let i of r) {
    let n = i.spec, s = n && n.plugin.domEventHandlers, o = n && n.plugin.domEventObservers;
    if (s)
      for (let a in s) {
        let l = s[a];
        l && t(a).handlers.push(Vh(i.value, l));
      }
    if (o)
      for (let a in o) {
        let l = o[a];
        l && t(a).observers.push(Vh(i.value, l));
      }
  }
  for (let i in _t)
    t(i).handlers.push(_t[i]);
  for (let i in ht)
    t(i).observers.push(ht[i]);
  return e;
}
const Wu = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], e0 = "dthko", Yu = [16, 17, 18, 20, 91, 92, 224, 225], Tn = 6;
function An(r) {
  return Math.max(0, r) * 0.7 + 8;
}
function t0(r, e) {
  return Math.max(Math.abs(r.clientX - e.clientX), Math.abs(r.clientY - e.clientY));
}
class i0 {
  constructor(e, t, i, n) {
    this.view = e, this.startEvent = t, this.style = i, this.mustSelect = n, this.scrollSpeed = { x: 0, y: 0 }, this.scrolling = -1, this.lastEvent = t, this.scrollParents = cu(e.contentDOM), this.atoms = e.state.facet(gn).map((o) => o(e));
    let s = e.contentDOM.ownerDocument;
    s.addEventListener("mousemove", this.move = this.move.bind(this)), s.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(ge.allowMultipleSelections) && r0(e, t), this.dragging = s0(e, t) && Vu(t) == 1 ? null : !1;
  }
  start(e) {
    this.dragging === !1 && this.select(e);
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && t0(this.startEvent, e) < 10)
      return;
    this.select(this.lastEvent = e);
    let t = 0, i = 0, n = 0, s = 0, o = this.view.win.innerWidth, a = this.view.win.innerHeight;
    this.scrollParents.x && ({ left: n, right: o } = this.scrollParents.x.getBoundingClientRect()), this.scrollParents.y && ({ top: s, bottom: a } = this.scrollParents.y.getBoundingClientRect());
    let l = Xu(this.view);
    e.clientX - l.left <= n + Tn ? t = -An(n - e.clientX) : e.clientX + l.right >= o - Tn && (t = An(e.clientX - o)), e.clientY - l.top <= s + Tn ? i = -An(s - e.clientY) : e.clientY + l.bottom >= a - Tn && (i = An(e.clientY - a)), this.setScrollSpeed(t, i);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(e, t) {
    this.scrollSpeed = { x: e, y: t }, e || t ? this.scrolling < 0 && (this.scrolling = setInterval(() => this.scroll(), 50)) : this.scrolling > -1 && (clearInterval(this.scrolling), this.scrolling = -1);
  }
  scroll() {
    let { x: e, y: t } = this.scrollSpeed;
    e && this.scrollParents.x && (this.scrollParents.x.scrollLeft += e, e = 0), t && this.scrollParents.y && (this.scrollParents.y.scrollTop += t, t = 0), (e || t) && this.view.win.scrollBy(e, t), this.dragging === !1 && this.select(this.lastEvent);
  }
  select(e) {
    let { view: t } = this, i = _u(this.atoms, this.style.get(e, this.extend, this.multiple));
    (this.mustSelect || !i.eq(t.state.selection, this.dragging === !1)) && this.view.dispatch({
      selection: i,
      userEvent: "select.pointer"
    }), this.mustSelect = !1;
  }
  update(e) {
    e.transactions.some((t) => t.isUserEvent("input.type")) ? this.destroy() : this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function r0(r, e) {
  let t = r.state.facet(Su);
  return t.length ? t[0](e) : V.mac ? e.metaKey : e.ctrlKey;
}
function n0(r, e) {
  let t = r.state.facet(bu);
  return t.length ? t[0](e) : V.mac ? !e.altKey : !e.ctrlKey;
}
function s0(r, e) {
  let { main: t } = r.state.selection;
  if (t.empty)
    return !1;
  let i = Jr(r.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let n = i.getRangeAt(0).getClientRects();
  for (let s = 0; s < n.length; s++) {
    let o = n[s];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function o0(r, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != r.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = Me.get(t)) && i.isWidget() && !i.isHidden && i.widget.ignoreEvent(e))
      return !1;
  return !0;
}
const _t = /* @__PURE__ */ Object.create(null), ht = /* @__PURE__ */ Object.create(null), zu = V.ie && V.ie_version < 15 || V.ios && V.webkit_version < 604;
function a0(r) {
  let e = r.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    r.focus(), t.remove(), Du(r, t.value);
  }, 50);
}
function _s(r, e, t) {
  for (let i of r.facet(e))
    t = i(t, r);
  return t;
}
function Du(r, e) {
  e = _s(r.state, sl, e);
  let { state: t } = r, i, n = 1, s = t.toText(e), o = s.lines == t.selection.ranges.length;
  if (Sa != null && t.selection.ranges.every((l) => l.empty) && Sa == s.toString()) {
    let l = -1;
    i = t.changeByRange((c) => {
      let u = t.doc.lineAt(c.from);
      if (u.from == l)
        return { range: c };
      l = u.from;
      let p = t.toText((o ? s.line(n++).text : e) + t.lineBreak);
      return {
        changes: { from: u.from, insert: p },
        range: L.cursor(c.from + p.length)
      };
    });
  } else o ? i = t.changeByRange((l) => {
    let c = s.line(n++);
    return {
      changes: { from: l.from, to: l.to, insert: c.text },
      range: L.cursor(l.from + c.length)
    };
  }) : i = t.replaceSelection(s);
  r.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
ht.scroll = (r) => {
  let e = r.inputState;
  e.lastScrollTop = r.scrollDOM.scrollTop, e.lastScrollLeft = r.scrollDOM.scrollLeft, V.ios && !e.touchActive && (e.lastIOSMomentumScroll = Date.now());
};
ht.wheel = ht.mousewheel = (r) => {
  r.inputState.lastWheelEvent = Date.now();
};
_t.keydown = (r, e) => (r.inputState.setSelectionOrigin("select"), e.keyCode == 27 && r.inputState.tabFocusMode != 0 && (r.inputState.tabFocusMode = Date.now() + 2e3), !1);
ht.touchstart = (r, e) => {
  let t = r.inputState, i = e.targetTouches[0];
  t.touchActive = !0, t.lastTouchTime = Date.now(), i && (t.lastTouchX = i.clientX, t.lastTouchY = i.clientY), t.setSelectionOrigin("select.pointer");
};
ht.touchmove = (r) => {
  r.inputState.setSelectionOrigin("select.pointer");
};
ht.touchend = (r, e) => {
  r.inputState.touchActive = !1;
};
_t.mousedown = (r, e) => {
  if (r.observer.flush(), r.inputState.lastTouchTime > Date.now() - 2e3)
    return !1;
  let t = null;
  for (let i of r.state.facet(ku))
    if (t = i(r, e), t)
      break;
  if (!t && e.button == 0 && (t = h0(r, e)), t) {
    let i = !r.hasFocus;
    r.inputState.startMouseSelection(new i0(r, e, t, i)), i && r.observer.ignore(() => {
      fu(r.contentDOM);
      let s = r.root.activeElement;
      s && !s.contains(r.contentDOM) && s.blur();
    });
    let n = r.inputState.mouseSelection;
    if (n)
      return n.start(e), n.dragging === !1;
  } else
    r.inputState.setSelectionOrigin("select.pointer");
  return !1;
};
function Nh(r, e, t, i) {
  if (i == 1)
    return L.cursor(e, t);
  if (i == 2)
    return Bm(r.state, e, t);
  {
    let n = r.docView.lineAt(e, t), s = r.state.doc.lineAt(n ? n.posAtEnd : e), o = n ? n.posAtStart : s.from, a = n ? n.posAtEnd : s.to;
    return a < r.state.doc.length && a == s.to && a++, L.undirectionalRange(o, a);
  }
}
const l0 = V.ie && V.ie_version <= 11;
let qh = null, Gh = 0, Uh = 0;
function Vu(r) {
  if (!l0)
    return r.detail;
  let e = qh, t = Uh;
  return qh = r, Uh = Date.now(), Gh = !e || t > Date.now() - 400 && Math.abs(e.clientX - r.clientX) < 2 && Math.abs(e.clientY - r.clientY) < 2 ? (Gh + 1) % 3 : 1;
}
function h0(r, e) {
  let t = r.posAndSideAtCoords({ x: e.clientX, y: e.clientY }, !1), i = Vu(e), n = r.state.selection;
  return {
    update(s) {
      s.docChanged && (t.pos = s.changes.mapPos(t.pos), n = n.map(s.changes));
    },
    get(s, o, a) {
      let l = r.posAndSideAtCoords({ x: s.clientX, y: s.clientY }, !1), c, u = Nh(r, l.pos, l.assoc, i);
      if (t.pos != l.pos && !o) {
        let p = Nh(r, t.pos, t.assoc, i), m = Math.min(p.from, u.from), v = Math.max(p.to, u.to);
        u = m < u.from ? L.range(m, v, u.assoc) : L.range(v, m, u.assoc);
      }
      return o ? n.replaceRange(n.main.extend(u.from, u.to, u.assoc)) : a && i == 1 && n.ranges.length > 1 && (c = c0(n, l.pos)) ? c : a ? n.addRange(u) : L.create([u]);
    }
  };
}
function c0(r, e) {
  for (let t = 0; t < r.ranges.length; t++) {
    let { from: i, to: n } = r.ranges[t];
    if (i <= e && n >= e)
      return L.create(r.ranges.slice(0, t).concat(r.ranges.slice(t + 1)), r.mainIndex == t ? 0 : r.mainIndex - (r.mainIndex > t ? 1 : 0));
  }
  return null;
}
_t.dragstart = (r, e) => {
  let { selection: { main: t } } = r.state;
  if (e.target.draggable) {
    let n = r.docView.tile.nearest(e.target);
    if (n && n.isWidget()) {
      let s = n.posAtStart, o = s + n.length;
      (s >= t.to || o <= t.from) && (t = L.undirectionalRange(s, o));
    }
  }
  let { inputState: i } = r;
  return i.mouseSelection && (i.mouseSelection.dragging = !0), i.draggedContent = t, e.dataTransfer && (e.dataTransfer.setData("Text", _s(r.state, ol, r.state.sliceDoc(t.from, t.to))), e.dataTransfer.effectAllowed = "copyMove"), !1;
};
_t.dragend = (r) => (r.inputState.draggedContent = null, !1);
function Fh(r, e, t, i) {
  if (t = _s(r.state, sl, t), !t)
    return;
  let n = r.posAtCoords({ x: e.clientX, y: e.clientY }, !1), { draggedContent: s } = r.inputState, o = i && s && n0(r, e) ? { from: s.from, to: s.to } : null, a = { from: n, insert: t }, l = r.state.changes(o ? [o, a] : a);
  r.focus(), r.dispatch({
    changes: l,
    selection: { anchor: l.mapPos(n, -1), head: l.mapPos(n, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  }), r.inputState.draggedContent = null;
}
_t.drop = (r, e) => {
  if (!e.dataTransfer)
    return !1;
  if (r.state.readOnly)
    return !0;
  let t = e.dataTransfer.files;
  if (t && t.length) {
    let i = Array(t.length), n = 0, s = () => {
      ++n == t.length && Fh(r, e, i.filter((o) => o != null).join(r.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let a = new FileReader();
      a.onerror = s, a.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(a.result) || (i[o] = a.result), s();
      }, a.readAsText(t[o]);
    }
    return !0;
  } else {
    let i = e.dataTransfer.getData("Text");
    if (i)
      return Fh(r, e, i, !0), !0;
  }
  return !1;
};
_t.paste = (r, e) => {
  if (r.state.readOnly)
    return !0;
  r.observer.flush();
  let t = zu ? null : e.clipboardData;
  return t ? (Du(r, t.getData("text/plain") || t.getData("text/uri-list")), !0) : (a0(r), !1);
};
function f0(r, e) {
  let t = r.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), r.focus();
  }, 50);
}
function u0(r) {
  let e = [], t = [], i = !1;
  for (let n of r.selection.ranges)
    n.empty || (e.push(r.sliceDoc(n.from, n.to)), t.push(n));
  if (!e.length) {
    let n = -1;
    for (let { from: s } of r.selection.ranges) {
      let o = r.doc.lineAt(s);
      o.number > n && (e.push(o.text), t.push({ from: o.from, to: Math.min(r.doc.length, o.to + 1) })), n = o.number;
    }
    i = !0;
  }
  return { text: _s(r, ol, e.join(r.lineBreak)), ranges: t, linewise: i };
}
let Sa = null;
_t.copy = _t.cut = (r, e) => {
  if (!Dr(r.contentDOM, r.observer.selectionRange))
    return !1;
  let { text: t, ranges: i, linewise: n } = u0(r.state);
  if (!t && !n)
    return !1;
  Sa = n ? t : null, e.type == "cut" && !r.state.readOnly && r.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
  let s = zu ? null : e.clipboardData;
  return s ? (s.clearData(), s.setData("text/plain", t), !0) : (f0(r, t), !1);
};
const Nu = /* @__PURE__ */ ui.define();
function qu(r, e) {
  let t = [];
  for (let i of r.facet(Qu)) {
    let n = i(r, e);
    n && t.push(n);
  }
  return t.length ? r.update({ effects: t, annotations: Nu.of(!0) }) : null;
}
function Gu(r) {
  setTimeout(() => {
    let e = r.hasFocus;
    if (e != r.inputState.notifiedFocused) {
      let t = qu(r.state, e);
      t ? r.dispatch(t) : r.update([]);
    }
  }, 10);
}
ht.focus = (r) => {
  r.inputState.lastFocusTime = Date.now(), !r.scrollDOM.scrollTop && (r.inputState.lastScrollTop || r.inputState.lastScrollLeft) && (r.scrollDOM.scrollTop = r.inputState.lastScrollTop, r.scrollDOM.scrollLeft = r.inputState.lastScrollLeft), Gu(r);
};
ht.blur = (r) => {
  r.observer.clearSelectionRange(), Gu(r);
};
ht.compositionstart = ht.compositionupdate = (r) => {
  r.observer.editContext || (r.inputState.compositionFirstChange == null && (r.inputState.compositionFirstChange = !0), r.inputState.composing < 0 && (r.inputState.composing = 0));
};
ht.compositionend = (r) => {
  r.observer.editContext || (r.inputState.composing = -1, r.inputState.compositionEndedAt = Date.now(), r.inputState.compositionPendingKey = !0, r.inputState.compositionPendingChange = r.observer.pendingRecords().length > 0, r.inputState.compositionFirstChange = null, V.chrome && V.android ? r.observer.flushSoon() : r.inputState.compositionPendingChange ? Promise.resolve().then(() => r.observer.flush()) : setTimeout(() => {
    r.inputState.composing < 0 && r.docView.hasComposition && r.update([]);
  }, 50));
};
ht.contextmenu = (r) => {
  r.inputState.lastContextMenu = Date.now();
};
_t.beforeinput = (r, e) => {
  var t, i;
  if ((e.inputType == "insertText" || e.inputType == "insertCompositionText") && (r.inputState.insertingText = e.data, r.inputState.insertingTextAt = Date.now()), e.inputType == "insertReplacementText" && r.observer.editContext) {
    let s = (t = e.dataTransfer) === null || t === void 0 ? void 0 : t.getData("text/plain"), o = e.getTargetRanges();
    if (s && o.length) {
      let a = o[0], l = r.posAtDOM(a.startContainer, a.startOffset), c = r.posAtDOM(a.endContainer, a.endOffset);
      return hl(r, { from: l, to: c, insert: r.state.toText(s) }, null), !0;
    }
  }
  let n;
  if (V.chrome && V.android && (n = Wu.find((s) => s.inputType == e.inputType)) && (r.observer.delayAndroidKey(n.key, n.keyCode), n.key == "Backspace" || n.key == "Delete")) {
    let s = ((i = window.visualViewport) === null || i === void 0 ? void 0 : i.height) || 0;
    setTimeout(() => {
      var o;
      (((o = window.visualViewport) === null || o === void 0 ? void 0 : o.height) || 0) > s + 10 && r.hasFocus && (r.contentDOM.blur(), r.focus());
    }, 100);
  }
  return V.ios && e.inputType == "deleteContentForward" && r.observer.flushSoon(), V.safari && e.inputType == "insertText" && r.inputState.composing >= 0 && setTimeout(() => ht.compositionend(r, e), 20), !1;
};
const Hh = /* @__PURE__ */ new Set();
function d0(r) {
  Hh.has(r) || (Hh.add(r), r.addEventListener("copy", () => {
  }), r.addEventListener("cut", () => {
  }));
}
const Kh = ["pre-wrap", "normal", "pre-line", "break-spaces"];
let Or = !1;
function Jh() {
  Or = !1;
}
class O0 {
  constructor(e) {
    this.lineWrapping = e, this.doc = me.empty, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.textHeight = 14, this.lineLength = 30;
  }
  heightForGap(e, t) {
    let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (i += Math.max(0, Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength))), this.lineHeight * i;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / Math.max(1, this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Kh.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let n = e[i];
      n < 0 ? i++ : this.heightSamples[Math.floor(n * 10)] || (t = !0, this.heightSamples[Math.floor(n * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, n, s, o) {
    let a = Kh.indexOf(e) > -1, l = Math.abs(t - this.lineHeight) > 0.3 || this.lineWrapping != a;
    if (this.lineWrapping = a, this.lineHeight = t, this.charWidth = i, this.textHeight = n, this.lineLength = s, l) {
      this.heightSamples = {};
      for (let c = 0; c < o.length; c++) {
        let u = o[c];
        u < 0 ? c++ : this.heightSamples[Math.floor(u * 10)] = !0;
      }
    }
    return l;
  }
}
class p0 {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class Xt {
  /**
  @internal
  */
  constructor(e, t, i, n, s) {
    this.from = e, this.length = t, this.top = i, this.height = n, this._content = s;
  }
  /**
  The type of element this is. When querying lines, this may be
  an array of all the blocks that make up the line.
  */
  get type() {
    return typeof this._content == "number" ? He.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  /**
  The end of the element as a document position.
  */
  get to() {
    return this.from + this.length;
  }
  /**
  The bottom position of the element.
  */
  get bottom() {
    return this.top + this.height;
  }
  /**
  If this is a widget block, this will return the widget
  associated with it.
  */
  get widget() {
    return this._content instanceof Wi ? this._content.widget : null;
  }
  /**
  If this is a textblock, this holds the number of line breaks
  that appear in widgets inside the block.
  */
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  /**
  @internal
  */
  join(e) {
    let t = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(e._content) ? e._content : [e]);
    return new Xt(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var Qe = /* @__PURE__ */ (function(r) {
  return r[r.ByPos = 0] = "ByPos", r[r.ByHeight = 1] = "ByHeight", r[r.ByPosNoHeight = 2] = "ByPosNoHeight", r;
})(Qe || (Qe = {}));
const qn = 1e-3;
class lt {
  constructor(e, t, i = 2) {
    this.length = e, this.height = t, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e) {
    this.height != e && (Math.abs(this.height - e) > qn && (Or = !0), this.height = e);
  }
  // Base case is to replace a leaf node, which simply builds a tree
  // from the new nodes and returns that (HeightMapBranch and
  // HeightMapGap override this to actually use from/to)
  replace(e, t, i) {
    return lt.of(i);
  }
  // Again, these are base cases, and are overridden for branch and gap nodes.
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, n) {
    let s = this, o = i.doc;
    for (let a = n.length - 1; a >= 0; a--) {
      let { fromA: l, toA: c, fromB: u, toB: p } = n[a], m = s.lineAt(l, Qe.ByPosNoHeight, i.setDoc(t), 0, 0), v = m.to >= c ? m : s.lineAt(c, Qe.ByPosNoHeight, i, 0, 0);
      for (p += v.to - c, c = v.to; a > 0 && m.from <= n[a - 1].toA; )
        l = n[a - 1].fromA, u = n[a - 1].fromB, a--, l < m.from && (m = s.lineAt(l, Qe.ByPosNoHeight, i, 0, 0));
      u += m.from - l, l = m.from;
      let b = cl.build(i.setDoc(o), e, u, p);
      s = us(s, s.replace(l, c, b));
    }
    return s.updateHeight(i, 0);
  }
  static empty() {
    return new yt(0, 0, 0);
  }
  // nodes uses null values to indicate the position of line breaks.
  // There are never line breaks at the start or end of the array, or
  // two line breaks next to each other, and the array isn't allowed
  // to be empty (same restrictions as return value from the builder).
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, n = 0, s = 0;
    for (; ; )
      if (t == i)
        if (n > s * 2) {
          let a = e[t - 1];
          a.break ? e.splice(--t, 1, a.left, null, a.right) : e.splice(--t, 1, a.left, a.right), i += 1 + a.break, n -= a.size;
        } else if (s > n * 2) {
          let a = e[i];
          a.break ? e.splice(i, 1, a.left, null, a.right) : e.splice(i, 1, a.left, a.right), i += 2 + a.break, s -= a.size;
        } else
          break;
      else if (n < s) {
        let a = e[t++];
        a && (n += a.size);
      } else {
        let a = e[--i];
        a && (s += a.size);
      }
    let o = 0;
    return e[t - 1] == null ? (o = 1, t--) : e[t] == null && (o = 1, i++), new m0(lt.of(e.slice(0, t)), o, lt.of(e.slice(i)));
  }
}
function us(r, e) {
  return r == e ? r : (r.constructor != e.constructor && (Or = !0), e);
}
lt.prototype.size = 1;
const g0 = /* @__PURE__ */ ee.replace({});
class Uu extends lt {
  constructor(e, t, i) {
    super(e, t), this.deco = i, this.spaceAbove = 0;
  }
  mainBlock(e, t) {
    return new Xt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.deco || 0);
  }
  blockAt(e, t, i, n) {
    return this.spaceAbove && e < i + this.spaceAbove ? new Xt(n, 0, i, this.spaceAbove, g0) : this.mainBlock(i, n);
  }
  lineAt(e, t, i, n, s) {
    let o = this.mainBlock(n, s);
    return this.spaceAbove ? this.blockAt(0, i, n, s).join(o) : o;
  }
  forEachLine(e, t, i, n, s, o) {
    e <= s + this.length && t >= s && o(this.lineAt(0, Qe.ByPos, i, n, s));
  }
  setMeasuredHeight(e) {
    let t = e.heights[e.index++];
    t < 0 ? (this.spaceAbove = -t, t = e.heights[e.index++]) : this.spaceAbove = 0, this.setHeight(t);
  }
  updateHeight(e, t = 0, i = !1, n) {
    return n && n.from <= t && n.more && this.setMeasuredHeight(n), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class yt extends Uu {
  constructor(e, t, i) {
    super(e, t, null), this.collapsed = 0, this.widgetHeight = 0, this.breaks = 0, this.spaceAbove = i;
  }
  mainBlock(e, t) {
    return new Xt(t, this.length, e + this.spaceAbove, this.height - this.spaceAbove, this.breaks);
  }
  replace(e, t, i) {
    let n = i[0];
    return i.length == 1 && (n instanceof yt || n instanceof qe && n.flags & 4) && Math.abs(this.length - n.length) < 10 ? (n instanceof qe ? n = new yt(n.length, this.height, this.spaceAbove) : n.height = this.height, this.outdated || (n.outdated = !1), n) : lt.of(i);
  }
  updateHeight(e, t = 0, i = !1, n) {
    return n && n.from <= t && n.more ? this.setMeasuredHeight(n) : (i || this.outdated) && (this.spaceAbove = 0, this.setHeight(Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed)) + this.breaks * e.lineHeight)), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class qe extends lt {
  constructor(e) {
    super(e, 0);
  }
  heightMetrics(e, t) {
    let i = e.doc.lineAt(t).number, n = e.doc.lineAt(t + this.length).number, s = n - i + 1, o, a = 0;
    if (e.lineWrapping) {
      let l = Math.min(this.height, e.lineHeight * s);
      o = l / s, this.length > s + 1 && (a = (this.height - l) / (this.length - s - 1));
    } else
      o = this.height / s;
    return { firstLine: i, lastLine: n, perLine: o, perChar: a };
  }
  blockAt(e, t, i, n) {
    let { firstLine: s, lastLine: o, perLine: a, perChar: l } = this.heightMetrics(t, n);
    if (t.lineWrapping) {
      let c = n + (e < t.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (e - i) / this.height)) * this.length)), u = t.doc.lineAt(c), p = a + u.length * l, m = Math.max(i, e - p / 2);
      return new Xt(u.from, u.length, m, p, 0);
    } else {
      let c = Math.max(0, Math.min(o - s, Math.floor((e - i) / a))), { from: u, length: p } = t.doc.line(s + c);
      return new Xt(u, p, i + a * c, a, 0);
    }
  }
  lineAt(e, t, i, n, s) {
    if (t == Qe.ByHeight)
      return this.blockAt(e, i, n, s);
    if (t == Qe.ByPosNoHeight) {
      let { from: v, to: b } = i.doc.lineAt(e);
      return new Xt(v, b - v, 0, 0, 0);
    }
    let { firstLine: o, perLine: a, perChar: l } = this.heightMetrics(i, s), c = i.doc.lineAt(e), u = a + c.length * l, p = c.number - o, m = n + a * p + l * (c.from - s - p);
    return new Xt(c.from, c.length, Math.max(n, Math.min(m, n + this.height - u)), u, 0);
  }
  forEachLine(e, t, i, n, s, o) {
    e = Math.max(e, s), t = Math.min(t, s + this.length);
    let { firstLine: a, perLine: l, perChar: c } = this.heightMetrics(i, s);
    for (let u = e, p = n; u <= t; ) {
      let m = i.doc.lineAt(u);
      if (u == e) {
        let b = m.number - a;
        p += l * b + c * (e - s - b);
      }
      let v = l + c * m.length;
      o(new Xt(m.from, m.length, p, v, 0)), p += v, u = m.to + 1;
    }
  }
  replace(e, t, i) {
    let n = this.length - t;
    if (n > 0) {
      let s = i[i.length - 1];
      s instanceof qe ? i[i.length - 1] = new qe(s.length + n) : i.push(null, new qe(n - 1));
    }
    if (e > 0) {
      let s = i[0];
      s instanceof qe ? i[0] = new qe(e + s.length) : i.unshift(new qe(e - 1), null);
    }
    return lt.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new qe(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new qe(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, n) {
    let s = t + this.length;
    if (n && n.from <= t + this.length && n.more) {
      let o = [], a = Math.max(t, n.from), l = -1;
      for (n.from > t && o.push(new qe(n.from - t - 1).updateHeight(e, t)); a <= s && n.more; ) {
        let u = e.doc.lineAt(a).length;
        o.length && o.push(null);
        let p = n.heights[n.index++], m = 0;
        p < 0 && (m = -p, p = n.heights[n.index++]), l == -1 ? l = p : Math.abs(p - l) >= qn && (l = -2);
        let v = new yt(u, p, m);
        v.outdated = !1, o.push(v), a += u + 1;
      }
      a <= s && o.push(null, new qe(s - a).updateHeight(e, a));
      let c = lt.of(o);
      return (l < 0 || Math.abs(c.height - this.height) >= qn || Math.abs(l - this.heightMetrics(e, t).perLine) >= qn) && (Or = !0), us(this, c);
    } else (i || this.outdated) && (this.setHeight(e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class m0 extends lt {
  constructor(e, t, i) {
    super(e.length + t + i.length, e.height + i.height, t | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, n) {
    let s = i + this.left.height;
    return e < s ? this.left.blockAt(e, t, i, n) : this.right.blockAt(e, t, s, n + this.left.length + this.break);
  }
  lineAt(e, t, i, n, s) {
    let o = n + this.left.height, a = s + this.left.length + this.break, l = t == Qe.ByHeight ? e < o : e < a, c = l ? this.left.lineAt(e, t, i, n, s) : this.right.lineAt(e, t, i, o, a);
    if (this.break || (l ? c.to < a : c.from > a))
      return c;
    let u = t == Qe.ByPosNoHeight ? Qe.ByPosNoHeight : Qe.ByPos;
    return l ? c.join(this.right.lineAt(a, u, i, o, a)) : this.left.lineAt(a, u, i, n, s).join(c);
  }
  forEachLine(e, t, i, n, s, o) {
    let a = n + this.left.height, l = s + this.left.length + this.break;
    if (this.break)
      e < l && this.left.forEachLine(e, t, i, n, s, o), t >= l && this.right.forEachLine(e, t, i, a, l, o);
    else {
      let c = this.lineAt(l, Qe.ByPos, i, n, s);
      e < c.from && this.left.forEachLine(e, c.from - 1, i, n, s, o), c.to >= e && c.from <= t && o(c), t > c.to && this.right.forEachLine(c.to + 1, t, i, a, l, o);
    }
  }
  replace(e, t, i) {
    let n = this.left.length + this.break;
    if (t < n)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - n, t - n, i));
    let s = [];
    e > 0 && this.decomposeLeft(e, s);
    let o = s.length;
    for (let a of i)
      s.push(a);
    if (e > 0 && ec(s, o - 1), t < this.length) {
      let a = s.length;
      this.decomposeRight(t, s), ec(s, a);
    }
    return lt.of(s);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, n = i + this.break;
    if (e >= n)
      return this.right.decomposeRight(e - n, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < n && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? lt.of(this.break ? [e, null, t] : [e, t]) : (this.left = us(this.left, e), this.right = us(this.right, t), this.setHeight(e.height + t.height), this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, n) {
    let { left: s, right: o } = this, a = t + s.length + this.break, l = null;
    return n && n.from <= t + s.length && n.more ? l = s = s.updateHeight(e, t, i, n) : s.updateHeight(e, t, i), n && n.from <= a + o.length && n.more ? l = o = o.updateHeight(e, a, i, n) : o.updateHeight(e, a, i), l ? this.balanced(s, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function ec(r, e) {
  let t, i;
  r[e] == null && (t = r[e - 1]) instanceof qe && (i = r[e + 1]) instanceof qe && r.splice(e - 1, 3, new qe(t.length + 1 + i.length));
}
const y0 = 5;
class cl {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), n = this.nodes[this.nodes.length - 1];
      n instanceof yt ? n.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new yt(i - this.pos, -1, 0)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let n = i.widget ? i.widget.estimatedHeight : 0, s = i.widget ? i.widget.lineBreaks : 0;
      n < 0 && (n = this.oracle.lineHeight);
      let o = t - e;
      i.block ? this.addBlock(new Uu(o, n, i)) : (o || s || n >= y0) && this.addLineDeco(n, s, o);
    } else t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new yt(this.pos - e, -1, 0)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new qe(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof yt)
      return e;
    let t = new yt(0, -1, 0);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine();
    let t = e.deco;
    t && t.startSide > 0 && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, t && t.endSide > 0 && (this.covering = e);
  }
  addLineDeco(e, t, i) {
    let n = this.ensureLine();
    n.length += i, n.collapsed += i, n.widgetHeight = Math.max(n.widgetHeight, e), n.breaks += t, this.writtenTo = this.pos = this.pos + i;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof yt) && !this.isCovered ? this.nodes.push(new yt(0, -1, 0)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let n of this.nodes)
      n instanceof yt && n.updateHeight(this.oracle, i), i += n ? n.length : 1;
    return this.nodes;
  }
  // Always called with a region that on both sides either stretches
  // to a line break or the end of the document.
  // The returned array uses null to indicate line breaks, but never
  // starts or ends in a line break, or has multiple line breaks next
  // to each other.
  static build(e, t, i, n) {
    let s = new cl(i, e);
    return pe.spans(t, i, n, s, 0), s.finish(i);
  }
}
function v0(r, e, t) {
  let i = new S0();
  return pe.compare(r, e, t, i, 0), i.changes;
}
class S0 {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, n) {
    (e < t || i && i.heightRelevant || n && n.heightRelevant) && sr(e, t, this.changes, 5);
  }
}
function b0(r, e) {
  let t = r.getBoundingClientRect(), i = r.ownerDocument, n = i.defaultView || window, s = Math.max(0, t.left), o = Math.min(n.innerWidth, t.right), a = Math.max(0, t.top), l = Math.min(n.innerHeight, t.bottom);
  for (let c = r.parentNode; c && c != i.body; )
    if (c.nodeType == 1) {
      let u = c, p = window.getComputedStyle(u);
      if ((u.scrollHeight > u.clientHeight || u.scrollWidth > u.clientWidth) && p.overflow != "visible") {
        let m = u.getBoundingClientRect();
        s = Math.max(s, m.left), o = Math.min(o, m.right), a = Math.max(a, m.top), l = Math.min(c == r.parentNode ? n.innerHeight : l, m.bottom);
      }
      c = p.position == "absolute" || p.position == "fixed" ? u.offsetParent : u.parentNode;
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
  return {
    left: s - t.left,
    right: Math.max(s, o) - t.left,
    top: a - (t.top + e),
    bottom: Math.max(a, l) - (t.top + e)
  };
}
function k0(r) {
  let e = r.getBoundingClientRect(), t = r.ownerDocument.defaultView || window;
  return e.left < t.innerWidth && e.right > 0 && e.top < t.innerHeight && e.bottom > 0;
}
function x0(r, e) {
  let t = r.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class po {
  constructor(e, t, i, n) {
    this.from = e, this.to = t, this.size = i, this.displaySize = n;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let n = e[i], s = t[i];
      if (n.from != s.from || n.to != s.to || n.size != s.size)
        return !1;
    }
    return !0;
  }
  draw(e, t) {
    return ee.replace({
      widget: new w0(this.displaySize * (t ? e.scaleY : e.scaleX), t)
    }).range(this.from, this.to);
  }
}
class w0 extends Bt {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class tc {
  constructor(e, t) {
    this.view = e, this.state = t, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.scaleX = 1, this.scaleY = 1, this.scrollOffset = 0, this.scrolledToBottom = !1, this.scrollAnchorPos = 0, this.scrollAnchorHeight = -1, this.scaler = ic, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = Ce.LTR, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1;
    let i = t.facet(al).some((n) => typeof n != "function" && n.class == "cm-lineWrapping");
    this.heightOracle = new O0(i), this.stateDeco = rc(t), this.heightMap = lt.empty().applyChanges(this.stateDeco, me.empty, this.heightOracle.setDoc(t.doc), [new $t(0, 0, 0, t.doc.length)]);
    for (let n = 0; n < 2 && (this.viewport = this.getViewport(0, null), !!this.updateForViewport()); n++)
      ;
    this.updateViewportLines(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = ee.set(this.lineGaps.map((n) => n.draw(this, !1))), this.scrollParent = e.scrollDOM, this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let n = i ? t.head : t.anchor;
      if (!e.some(({ from: s, to: o }) => n >= s && n <= o)) {
        let { from: s, to: o } = this.lineBlockAt(n);
        e.push(new Mn(s, o));
      }
    }
    return this.viewports = e.sort((i, n) => i.from - n.from), this.updateScaler();
  }
  updateScaler() {
    let e = this.scaler;
    return this.scaler = this.heightMap.height <= 7e6 ? ic : new fl(this.heightOracle, this.heightMap, this.viewports), e.eq(this.scaler) ? 0 : 2;
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (e) => {
      this.viewportLines.push(jr(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = rc(this.state);
    let n = e.changedRanges, s = $t.extendWithRanges(n, v0(i, this.stateDeco, e ? e.changes : Be.empty(this.state.doc.length))), o = this.heightMap.height, a = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollOffset);
    Jh(), this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), s), (this.heightMap.height != o || Or) && (e.flags |= 2), a ? (this.scrollAnchorPos = e.changes.mapPos(a.from, -1), this.scrollAnchorHeight = a.top) : (this.scrollAnchorPos = -1, this.scrollAnchorHeight = o);
    let l = s.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < l.from || t.range.head > l.to) || !this.viewportIsAppropriate(l)) && (l = this.getViewport(0, t));
    let c = l.from != this.viewport.from || l.to != this.viewport.to;
    this.viewport = l, e.flags |= this.updateForViewport(), (c || !e.changes.empty || e.flags & 2) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(e.changes), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && (e.selectionSet || e.focusChanged) && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && !e.state.facet(Pu) && (this.mustEnforceCursorAssoc = !0);
  }
  measure() {
    let { view: e } = this, t = e.contentDOM, i = window.getComputedStyle(t), n = this.heightOracle, s = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? Ce.RTL : Ce.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(s) || this.mustMeasureContent === "refresh", a = t.getBoundingClientRect(), l = o || this.mustMeasureContent || this.contentDOMHeight != a.height;
    this.contentDOMHeight = a.height, this.mustMeasureContent = !1;
    let c = 0, u = 0;
    if (a.width && a.height) {
      let { scaleX: B, scaleY: Y } = hu(t, a);
      (B > 5e-3 && Math.abs(this.scaleX - B) > 5e-3 || Y > 5e-3 && Math.abs(this.scaleY - Y) > 5e-3) && (this.scaleX = B, this.scaleY = Y, c |= 16, o = l = !0);
    }
    let p = (parseInt(i.paddingTop) || 0) * this.scaleY, m = (parseInt(i.paddingBottom) || 0) * this.scaleY;
    (this.paddingTop != p || this.paddingBottom != m) && (this.paddingTop = p, this.paddingBottom = m, c |= 18), this.editorWidth != e.scrollDOM.clientWidth && (n.lineWrapping && (l = !0), this.editorWidth = e.scrollDOM.clientWidth, c |= 16);
    let v = cu(this.view.contentDOM, !1).y;
    v != this.scrollParent && (this.scrollParent = v, this.scrollAnchorHeight = -1, this.scrollOffset = 0);
    let b = this.getScrollOffset();
    this.scrollOffset != b && (this.scrollAnchorHeight = -1, this.scrollOffset = b), this.scrolledToBottom = uu(this.scrollParent || e.win);
    let w = (this.printing ? x0 : b0)(t, this.paddingTop), C = w.top - this.pixelViewport.top, A = w.bottom - this.pixelViewport.bottom;
    this.pixelViewport = w;
    let X = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (X != this.inView && (this.inView = X, X && (l = !0)), !this.inView && !this.scrollTarget && !k0(e.dom))
      return 0;
    let _ = a.width;
    if ((this.contentDOMWidth != _ || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = a.width, this.editorHeight = e.scrollDOM.clientHeight, c |= 16), l) {
      let B = e.docView.measureVisibleLineHeights(this.viewport);
      if (n.mustRefreshForHeights(B) && (o = !0), o || n.lineWrapping && Math.abs(_ - this.contentDOMWidth) > n.charWidth) {
        let { lineHeight: Y, charWidth: j, textHeight: le } = e.docView.measureTextSize();
        o = Y > 0 && n.refresh(s, Y, j, le, Math.max(5, _ / j), B), o && (e.docView.minWidth = 0, c |= 16);
      }
      C > 0 && A > 0 ? u = Math.max(C, A) : C < 0 && A < 0 && (u = Math.min(C, A)), Jh();
      for (let Y of this.viewports) {
        let j = Y.from == this.viewport.from ? B : e.docView.measureVisibleLineHeights(Y);
        this.heightMap = (o ? lt.empty().applyChanges(this.stateDeco, me.empty, this.heightOracle, [new $t(0, 0, 0, e.state.doc.length)]) : this.heightMap).updateHeight(n, 0, o, new p0(Y.from, j));
      }
      Or && (c |= 2);
    }
    let H = !this.viewportIsAppropriate(this.viewport, u) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return H && (c & 2 && (c |= this.updateScaler()), this.viewport = this.getViewport(u, this.scrollTarget), c |= this.updateForViewport()), (c & 2 || H) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps, e)), c |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), c;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), n = this.heightMap, s = this.heightOracle, { visibleTop: o, visibleBottom: a } = this, l = new Mn(n.lineAt(o - i * 1e3, Qe.ByHeight, s, 0, 0).from, n.lineAt(a + (1 - i) * 1e3, Qe.ByHeight, s, 0, 0).to);
    if (t) {
      let { head: c } = t.range;
      if (c < l.from || c > l.to) {
        let u = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), p = n.lineAt(c, Qe.ByPos, s, 0, 0), m;
        t.y == "center" ? m = (p.top + p.bottom) / 2 - u / 2 : t.y == "start" || t.y == "nearest" && c < l.from ? m = p.top : m = p.bottom - u, l = new Mn(n.lineAt(m - 1e3 / 2, Qe.ByHeight, s, 0, 0).from, n.lineAt(m + u + 1e3 / 2, Qe.ByHeight, s, 0, 0).to);
      }
    }
    return l;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), n = t.mapPos(e.to, 1);
    return new Mn(this.heightMap.lineAt(i, Qe.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(n, Qe.ByPos, this.heightOracle, 0, 0).to);
  }
  // Checks if a given viewport covers the visible part of the
  // document and not too much beyond that.
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: n } = this.heightMap.lineAt(e, Qe.ByPos, this.heightOracle, 0, 0), { bottom: s } = this.heightMap.lineAt(t, Qe.ByPos, this.heightOracle, 0, 0), { visibleTop: o, visibleBottom: a } = this;
    return (e == 0 || n <= o - Math.max(10, Math.min(
      -i,
      250
      /* VP.MaxCoverMargin */
    ))) && (t == this.state.doc.length || s >= a + Math.max(10, Math.min(
      i,
      250
      /* VP.MaxCoverMargin */
    ))) && n > o - 2 * 1e3 && s < a + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let n of e)
      t.touchesRange(n.from, n.to) || i.push(new po(t.mapPos(n.from), t.mapPos(n.to), n.size, n.displaySize));
    return i;
  }
  // Computes positions in the viewport where the start or end of a
  // line should be hidden, trying to reuse existing line gaps when
  // appropriate to avoid unneccesary redraws.
  // Uses crude character-counting for the positioning and sizing,
  // since actual DOM coordinates aren't always available and
  // predictable. Relies on generous margins (see LG.Margin) to hide
  // the artifacts this might produce from the user.
  ensureLineGaps(e, t) {
    let i = this.heightOracle.lineWrapping, n = i ? 1e4 : 2e3, s = n >> 1, o = n << 1;
    if (this.defaultTextDirection != Ce.LTR && !i)
      return [];
    let a = [], l = (u, p, m, v) => {
      if (p - u < s)
        return;
      let b = this.state.selection.main, w = [b.from];
      b.empty || w.push(b.to);
      for (let A of w)
        if (A > u && A < p) {
          l(u, A - 10, m, v), l(A + 10, p, m, v);
          return;
        }
      let C = $0(e, (A) => A.from >= m.from && A.to <= m.to && Math.abs(A.from - u) < s && Math.abs(A.to - p) < s && !w.some((X) => A.from < X && A.to > X));
      if (!C) {
        if (p < m.to && t && i && t.visibleRanges.some((_) => _.from <= p && _.to >= p)) {
          let _ = t.moveToLineBoundary(L.cursor(p), !1, !0).head;
          _ > u && (p = _);
        }
        let A = this.gapSize(m, u, p, v), X = i || A < 2e6 ? A : 2e6;
        C = new po(u, p, A, X);
      }
      a.push(C);
    }, c = (u) => {
      if (u.length < o || u.type != He.Text)
        return;
      let p = Q0(u.from, u.to, this.stateDeco);
      if (p.total < o)
        return;
      let m = this.scrollTarget ? this.scrollTarget.range.head : null, v, b;
      if (i) {
        let w = n / this.heightOracle.lineLength * this.heightOracle.lineHeight, C, A;
        if (m != null) {
          let X = Zn(p, m), _ = ((this.visibleBottom - this.visibleTop) / 2 + w) / u.height;
          C = X - _, A = X + _;
        } else
          C = (this.visibleTop - u.top - w) / u.height, A = (this.visibleBottom - u.top + w) / u.height;
        v = Rn(p, C), b = Rn(p, A);
      } else {
        let w = p.total * this.heightOracle.charWidth, C = n * this.heightOracle.charWidth, A = 0;
        if (w > 2e6)
          for (let Y of e)
            Y.from >= u.from && Y.from < u.to && Y.size != Y.displaySize && Y.from * this.heightOracle.charWidth + A < this.pixelViewport.left && (A = Y.size - Y.displaySize);
        let X = this.pixelViewport.left + A, _ = this.pixelViewport.right + A, H, B;
        if (m != null) {
          let Y = Zn(p, m), j = ((_ - X) / 2 + C) / w;
          H = Y - j, B = Y + j;
        } else
          H = (X - C) / w, B = (_ + C) / w;
        v = Rn(p, H), b = Rn(p, B);
      }
      v > u.from && l(u.from, v, u, p), b < u.to && l(b, u.to, u, p);
    };
    for (let u of this.viewportLines)
      Array.isArray(u.type) ? u.type.forEach(c) : c(u);
    return a;
  }
  gapSize(e, t, i, n) {
    let s = Zn(n, i) - Zn(n, t);
    return this.heightOracle.lineWrapping ? e.height * s : n.total * this.heightOracle.charWidth * s;
  }
  updateLineGaps(e) {
    po.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = ee.set(e.map((t) => t.draw(this, this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges(e) {
    let t = this.stateDeco;
    this.lineGaps.length && (t = t.concat(this.lineGapDeco));
    let i = [];
    pe.spans(t, this.viewport.from, this.viewport.to, {
      span(s, o) {
        i.push({ from: s, to: o });
      },
      point() {
      }
    }, 20);
    let n = 0;
    if (i.length != this.visibleRanges.length)
      n = 12;
    else
      for (let s = 0; s < i.length && !(n & 8); s++) {
        let o = this.visibleRanges[s], a = i[s];
        (o.from != a.from || o.to != a.to) && (n |= 4, e && e.mapPos(o.from, -1) == a.from && e.mapPos(o.to, 1) == a.to || (n |= 8));
      }
    return this.visibleRanges = i, n;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || jr(this.heightMap.lineAt(e, Qe.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return e >= this.viewportLines[0].top && e <= this.viewportLines[this.viewportLines.length - 1].bottom && this.viewportLines.find((t) => t.top <= e && t.bottom >= e) || jr(this.heightMap.lineAt(this.scaler.fromDOM(e), Qe.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  getScrollOffset() {
    return (this.scrollParent == this.view.scrollDOM ? this.scrollParent.scrollTop : (this.scrollParent ? this.scrollParent.getBoundingClientRect().top : 0) - this.view.contentDOM.getBoundingClientRect().top) * this.scaleY;
  }
  scrollAnchorAt(e) {
    let t = this.lineBlockAtHeight(e + 8);
    return t.from >= this.viewport.from || this.viewportLines[0].top - e > 200 ? t : this.viewportLines[0];
  }
  elementAtHeight(e) {
    return jr(this.heightMap.blockAt(this.scaler.fromDOM(e), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Mn {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Q0(r, e, t) {
  let i = [], n = r, s = 0;
  return pe.spans(t, r, e, {
    span() {
    },
    point(o, a) {
      o > n && (i.push({ from: n, to: o }), s += o - n), n = a;
    }
  }, 20), n < e && (i.push({ from: n, to: e }), s += e - n), { total: s, ranges: i };
}
function Rn({ total: r, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(r * t);
  for (let n = 0; ; n++) {
    let { from: s, to: o } = e[n], a = o - s;
    if (i <= a)
      return s + i;
    i -= a;
  }
}
function Zn(r, e) {
  let t = 0;
  for (let { from: i, to: n } of r.ranges) {
    if (e <= n) {
      t += e - i;
      break;
    }
    t += n - i;
  }
  return t / r.total;
}
function $0(r, e) {
  for (let t of r)
    if (e(t))
      return t;
}
const ic = {
  toDOM(r) {
    return r;
  },
  fromDOM(r) {
    return r;
  },
  scale: 1,
  eq(r) {
    return r == this;
  }
};
function rc(r) {
  let e = r.facet(Xs).filter((i) => typeof i != "function"), t = r.facet(ll).filter((i) => typeof i != "function");
  return t.length && e.push(pe.join(t)), e;
}
class fl {
  constructor(e, t, i) {
    let n = 0, s = 0, o = 0;
    this.viewports = i.map(({ from: a, to: l }) => {
      let c = t.lineAt(a, Qe.ByPos, e, 0, 0).top, u = t.lineAt(l, Qe.ByPos, e, 0, 0).bottom;
      return n += u - c, { from: a, to: l, top: c, bottom: u, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - n) / (t.height - n);
    for (let a of this.viewports)
      a.domTop = o + (a.top - s) * this.scale, o = a.domBottom = a.domTop + (a.bottom - a.top), s = a.bottom;
  }
  toDOM(e) {
    for (let t = 0, i = 0, n = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.top)
        return n + (e - i) * this.scale;
      if (e <= s.bottom)
        return s.domTop + (e - s.top);
      i = s.bottom, n = s.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, n = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.domTop)
        return i + (e - n) / this.scale;
      if (e <= s.domBottom)
        return s.top + (e - s.domTop);
      i = s.bottom, n = s.domBottom;
    }
  }
  eq(e) {
    return e instanceof fl ? this.scale == e.scale && this.viewports.length == e.viewports.length && this.viewports.every((t, i) => t.from == e.viewports[i].from && t.to == e.viewports[i].to) : !1;
  }
}
function jr(r, e) {
  if (e.scale == 1)
    return r;
  let t = e.toDOM(r.top), i = e.toDOM(r.bottom);
  return new Xt(r.from, r.length, t, i - t, Array.isArray(r._content) ? r._content.map((n) => jr(n, e)) : r._content);
}
const Xn = /* @__PURE__ */ q.define({ combine: (r) => r.join(" ") }), ba = /* @__PURE__ */ q.define({ combine: (r) => r.indexOf(!0) > -1 }), ka = /* @__PURE__ */ wi.newName(), Fu = /* @__PURE__ */ wi.newName(), Hu = /* @__PURE__ */ wi.newName(), Ku = { "&light": "." + Fu, "&dark": "." + Hu };
function xa(r, e, t) {
  return new wi(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (n) => {
        if (n == "&")
          return r;
        if (!t || !t[n])
          throw new RangeError(`Unsupported selector: ${n}`);
        return t[n];
      }) : r + " " + i;
    }
  });
}
const P0 = /* @__PURE__ */ xa("." + ka, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      // Provide a simple default outline to make sure a focused
      // editor is visually distinct. Can't leave the default behavior
      // because that will apply to the content element, which is
      // inside the scrollable container and doesn't include the
      // gutters. We also can't use an 'auto' outline, since those
      // are, for some reason, drawn behind the element content, which
      // will cause things like the active line background to cover
      // the outline (#297).
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0,
    overflowAnchor: "none"
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    // Issue #456
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    // For IE
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    // For Safari, which doesn't support overflow-wrap: anywhere
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    userSelect: "none",
    // #1708
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  // Two animations defined so that we can switch between them to
  // restart the animation without forcing another style
  // recomputation.
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#ddd"
  },
  ".cm-selectionHandle": {
    backgroundColor: "currentColor",
    width: "1.5px"
  },
  ".cm-selectionHandle-start::before, .cm-selectionHandle-end::before": {
    content: '""',
    backgroundColor: "inherit",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    position: "absolute",
    left: "-3.25px"
  },
  ".cm-selectionHandle-start::before": { top: "-8px" },
  ".cm-selectionHandle-end::before": { bottom: "-8px" },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    zIndex: 200
  },
  ".cm-gutters-before": { insetInlineStart: 0 },
  ".cm-gutters-after": { insetInlineEnd: 0 },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    border: "0px solid #ddd",
    "&.cm-gutters-before": { borderRightWidth: "1px" },
    "&.cm-gutters-after": { borderLeftWidth: "1px" }
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    // Necessary -- prevents margin collapsing
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0,
    zIndex: 300
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-dialog": {
    padding: "2px 19px 4px 6px",
    position: "relative",
    "& label": { fontSize: "80%" }
  },
  ".cm-dialog-close": {
    position: "absolute",
    top: "3px",
    right: "4px",
    backgroundColor: "inherit",
    border: "none",
    font: "inherit",
    fontSize: "14px",
    padding: "0"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top",
    userSelect: "none"
  },
  ".cm-highlightSpace": {
    backgroundImage: "radial-gradient(circle at 50% 55%, #aaa 20%, transparent 5%)",
    backgroundPosition: "center"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, Ku), C0 = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, go = V.ie && V.ie_version <= 11;
class T0 {
  constructor(e) {
    this.view = e, this.active = !1, this.editContext = null, this.selectionRange = new nm(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.flushingAndroidKey = -1, this.lastChange = 0, this.scrollTargets = [], this.intersection = null, this.resizeScroll = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.printQuery = null, this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((t) => {
      for (let i of t)
        this.queue.push(i);
      (V.ie && V.ie_version <= 11 || V.ios && e.composing) && t.some((i) => i.type == "childList" && i.removedNodes.length || i.type == "characterData" && i.oldValue.length > i.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), window.EditContext && V.android && e.constructor.EDIT_CONTEXT !== !1 && // Chrome <126 doesn't support inverted selections in edit context (#1392)
    !(V.chrome && V.chrome_version < 126) && (this.editContext = new M0(e), e.state.facet(ai) && (e.contentDOM.editContext = this.editContext.editContext)), go && (this.onCharData = (t) => {
      this.queue.push({
        target: t.target,
        type: "characterData",
        oldValue: t.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), this.onResize = this.onResize.bind(this), this.onPrint = this.onPrint.bind(this), this.onScroll = this.onScroll.bind(this), window.matchMedia && (this.printQuery = window.matchMedia("print")), typeof ResizeObserver == "function" && (this.resizeScroll = new ResizeObserver(() => {
      var t;
      ((t = this.view.docView) === null || t === void 0 ? void 0 : t.lastUpdate) < Date.now() - 75 && this.onResize();
    }), this.resizeScroll.observe(e.scrollDOM)), this.addWindowListeners(this.win = e.win), this.start(), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((t) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), t.length > 0 && t[t.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, { threshold: [0, 1e-3] }), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((t) => {
      t.length > 0 && t[t.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e), this.intersecting && this.view.measure();
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.editContext && this.view.requestMeasure(this.editContext.measureReq), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint(e) {
    (e.type == "change" || !e.type) && !e.matches || (this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500));
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    let t = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: i } = this, n = this.selectionRange;
    if (i.state.facet(ai) ? i.root.activeElement != this.dom : !Dr(this.dom, n))
      return;
    let s = n.anchorNode && i.docView.tile.nearest(n.anchorNode);
    if (s && s.isWidget() && s.widget.ignoreEvent(e)) {
      t || (this.selectionChanged = !1);
      return;
    }
    (V.ie && V.ie_version <= 11 || V.android && V.chrome) && !i.state.selection.main.empty && // (Selection.isCollapsed isn't reliable on IE)
    n.focusNode && Vr(n.focusNode, n.focusOffset, n.anchorNode, n.anchorOffset) ? this.flushSoon() : this.flush(!1);
  }
  readSelectionRange() {
    let { view: e } = this, t = Jr(e.root);
    if (!t)
      return !1;
    let i = V.safari && e.root.nodeType == 11 && e.root.activeElement == this.dom && A0(this.view, t) || t;
    if (!i || this.selectionRange.eq(i))
      return !1;
    let n = Dr(this.dom, i);
    return n && !this.selectionChanged && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && om(this.dom, i) ? (this.view.inputState.lastFocusTime = 0, e.docView.updateSelection(), !1) : (this.selectionRange.setRange(i), n && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == i ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = t)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, C0), go && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    this.active && (this.active = !1, this.observer.disconnect(), go && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  // Throw away any pending changes
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  // Chrome Android, especially in combination with GBoard, not only
  // doesn't reliably fire regular key events, but also often
  // surrounds the effect of enter or backspace with a bunch of
  // composition events that, when interrupted, cause text duplication
  // or other kinds of corruption. This hack makes the editor back off
  // from handling DOM changes for a moment when such a key is
  // detected (via beforeinput or keydown), and then tries to flush
  // them or, if that has no effect, dispatches the given key.
  delayAndroidKey(e, t) {
    var i;
    if (!this.delayedAndroidKey) {
      let n = () => {
        let s = this.delayedAndroidKey;
        s && (this.clearDelayedAndroidKey(), this.view.inputState.lastKeyCode = s.keyCode, this.view.inputState.lastKeyTime = Date.now(), !this.flush() && s.force && or(this.dom, s.key, s.keyCode));
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(n);
    }
    (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = {
      key: e,
      keyCode: t,
      // Only run the key handler when no changes are detected if
      // this isn't coming right after another change, in which case
      // it is probably part of a weird chain of updates, and should
      // be ignored if it returns the DOM to its previous state.
      force: this.lastChange < Date.now() - 50 || !!(!((i = this.delayedAndroidKey) === null || i === void 0) && i.force)
    });
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey), this.delayedAndroidKey = null, this.flushingAndroidKey = -1;
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = this.view.win.requestAnimationFrame(() => {
      this.delayedFlush = -1, this.flush();
    }));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (this.view.win.cancelAnimationFrame(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  pendingRecords() {
    for (let e of this.observer.takeRecords())
      this.queue.push(e);
    return this.queue;
  }
  processRecords() {
    let e = this.pendingRecords();
    e.length && (this.queue = []);
    let t = -1, i = -1, n = !1;
    for (let s of e) {
      let o = this.readMutation(s);
      o && (o.typeOver && (n = !0), t == -1 ? { from: t, to: i } = o : (t = Math.min(o.from, t), i = Math.max(o.to, i)));
    }
    return { from: t, to: i, typeOver: n };
  }
  readChange() {
    let { from: e, to: t, typeOver: i } = this.processRecords(), n = this.selectionChanged && Dr(this.dom, this.selectionRange);
    if (e < 0 && !n)
      return null;
    e > -1 && (this.lastChange = Date.now()), this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let s = new qm(this.view, e, t, i);
    return this.view.docView.domChanged = { newSel: s.newSel ? s.newSel.main : null }, s;
  }
  // Apply pending changes, if any
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return !1;
    e && this.readSelectionRange();
    let t = this.readChange();
    if (!t)
      return this.view.requestMeasure(), !1;
    let i = this.view.state, n = ju(this.view, t);
    return this.view.state == i && (t.domChanged || t.newSel && !fs(this.view.state.selection, t.newSel.main)) && this.view.update([]), n;
  }
  readMutation(e) {
    let t = this.view.docView.tile.nearest(e.target);
    if (!t || t.isWidget())
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "childList") {
      let i = nc(t, e.previousSibling || e.target.previousSibling, -1), n = nc(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
        to: n ? t.posBefore(n) : t.posAtEnd,
        typeOver: !1
      };
    } else return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  setWindow(e) {
    e != this.win && (this.removeWindowListeners(this.win), this.win = e, this.addWindowListeners(this.win));
  }
  addWindowListeners(e) {
    e.addEventListener("resize", this.onResize), this.printQuery ? this.printQuery.addEventListener ? this.printQuery.addEventListener("change", this.onPrint) : this.printQuery.addListener(this.onPrint) : e.addEventListener("beforeprint", this.onPrint), e.addEventListener("scroll", this.onScroll), e.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(e) {
    e.removeEventListener("scroll", this.onScroll), e.removeEventListener("resize", this.onResize), this.printQuery ? this.printQuery.removeEventListener ? this.printQuery.removeEventListener("change", this.onPrint) : this.printQuery.removeListener(this.onPrint) : e.removeEventListener("beforeprint", this.onPrint), e.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  update(e) {
    this.editContext && (this.editContext.update(e), e.startState.facet(ai) != e.state.facet(ai) && (e.view.contentDOM.editContext = e.state.facet(ai) ? this.editContext.editContext : null));
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resizeScroll) === null || i === void 0 || i.disconnect();
    for (let n of this.scrollTargets)
      n.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout), this.win.cancelAnimationFrame(this.delayedFlush), this.win.cancelAnimationFrame(this.flushingAndroidKey), this.editContext && (this.view.contentDOM.editContext = null, this.editContext.destroy());
  }
}
function nc(r, e, t) {
  for (; e; ) {
    let i = Me.get(e);
    if (i && i.parent == r)
      return i;
    let n = e.parentNode;
    e = n != r.dom ? n : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function sc(r, e) {
  let t = e.startContainer, i = e.startOffset, n = e.endContainer, s = e.endOffset, o = r.docView.domAtPos(r.state.selection.main.anchor, 1);
  return Vr(o.node, o.offset, n, s) && ([t, i, n, s] = [n, s, t, i]), { anchorNode: t, anchorOffset: i, focusNode: n, focusOffset: s };
}
function A0(r, e) {
  if (e.getComposedRanges) {
    let n = e.getComposedRanges(r.root)[0];
    if (n)
      return sc(r, n);
  }
  let t = null;
  function i(n) {
    n.preventDefault(), n.stopImmediatePropagation(), t = n.getTargetRanges()[0];
  }
  return r.contentDOM.addEventListener("beforeinput", i, !0), r.dom.ownerDocument.execCommand("indent"), r.contentDOM.removeEventListener("beforeinput", i, !0), t ? sc(r, t) : null;
}
class M0 {
  constructor(e) {
    this.from = 0, this.to = 0, this.pendingContextChange = null, this.handlers = /* @__PURE__ */ Object.create(null), this.composing = null, this.resetRange(e.state);
    let t = this.editContext = new window.EditContext({
      text: e.state.doc.sliceString(this.from, this.to),
      selectionStart: this.toContextPos(Math.max(this.from, Math.min(this.to, e.state.selection.main.anchor))),
      selectionEnd: this.toContextPos(e.state.selection.main.head)
    });
    this.handlers.textupdate = (i) => {
      let n = e.state.selection.main, { anchor: s, head: o } = n, a = this.toEditorPos(i.updateRangeStart), l = this.toEditorPos(i.updateRangeEnd);
      e.inputState.composing >= 0 && !this.composing && (this.composing = { contextBase: i.updateRangeStart, editorBase: a, drifted: !1 });
      let c = l - a > i.text.length;
      a == this.from && s < this.from ? a = s : l == this.to && s > this.to && (l = s);
      let u = Iu(e.state.sliceDoc(a, l), i.text, (c ? n.from : n.to) - a, c ? "end" : null);
      if (!u) {
        let m = L.single(this.toEditorPos(i.selectionStart), this.toEditorPos(i.selectionEnd));
        fs(m, n) || e.dispatch({ selection: m, userEvent: "select" });
        return;
      }
      let p = {
        from: u.from + a,
        to: u.toA + a,
        insert: me.of(i.text.slice(u.from, u.toB).split(`
`))
      };
      if ((V.mac || V.android) && p.from == o - 1 && /^\. ?$/.test(i.text) && e.contentDOM.getAttribute("autocorrect") == "off" && (p = { from: a, to: l, insert: me.of([i.text.replace(".", " ")]) }), this.pendingContextChange = p, !e.state.readOnly) {
        let m = this.to - this.from + (p.to - p.from + p.insert.length);
        hl(e, p, L.single(this.toEditorPos(i.selectionStart, m), this.toEditorPos(i.selectionEnd, m)));
      }
      this.pendingContextChange && (this.revertPending(e.state), this.setSelection(e.state)), p.from < p.to && !p.insert.length && e.inputState.composing >= 0 && !/[\\p{Alphabetic}\\p{Number}_]/.test(t.text.slice(Math.max(0, i.updateRangeStart - 1), Math.min(t.text.length, i.updateRangeStart + 1))) && this.handlers.compositionend(i);
    }, this.handlers.characterboundsupdate = (i) => {
      let n = [], s = null;
      for (let o = this.toEditorPos(i.rangeStart), a = this.toEditorPos(i.rangeEnd); o < a; o++) {
        let l = e.coordsForChar(o);
        s = l && new DOMRect(l.left, l.top, l.right - l.left, l.bottom - l.top) || s || new DOMRect(), n.push(s);
      }
      t.updateCharacterBounds(i.rangeStart, n);
    }, this.handlers.textformatupdate = (i) => {
      let n = [];
      for (let s of i.getTextFormats()) {
        let o = s.underlineStyle, a = s.underlineThickness;
        if (!/none/i.test(o) && !/none/i.test(a)) {
          let l = this.toEditorPos(s.rangeStart), c = this.toEditorPos(s.rangeEnd);
          if (l < c) {
            let u = `text-decoration: underline ${/^[a-z]/.test(o) ? o + " " : o == "Dashed" ? "dashed " : o == "Squiggle" ? "wavy " : ""}${/thin/i.test(a) ? 1 : 2}px`;
            n.push(ee.mark({ attributes: { style: u } }).range(l, c));
          }
        }
      }
      e.dispatch({ effects: Tu.of(ee.set(n)) });
    }, this.handlers.compositionstart = () => {
      e.inputState.composing < 0 && (e.inputState.composing = 0, e.inputState.compositionFirstChange = !0);
    }, this.handlers.compositionend = () => {
      if (e.inputState.composing = -1, e.inputState.compositionFirstChange = null, this.composing) {
        let { drifted: i } = this.composing;
        this.composing = null, i && this.reset(e.state);
      }
    };
    for (let i in this.handlers)
      t.addEventListener(i, this.handlers[i]);
    this.measureReq = { read: (i) => {
      let n = Jr(i.root);
      n && n.rangeCount && this.editContext.updateSelectionBounds(n.getRangeAt(0).getBoundingClientRect());
    } };
  }
  applyEdits(e) {
    let t = 0, i = !1, n = this.pendingContextChange;
    return e.changes.iterChanges((s, o, a, l, c) => {
      if (i)
        return;
      let u = c.length - (o - s);
      if (n && o >= n.to)
        if (n.from == s && n.to == o && n.insert.eq(c)) {
          n = this.pendingContextChange = null, t += u, this.to += u;
          return;
        } else
          n = null, this.revertPending(e.state);
      if (s += t, o += t, o <= this.from)
        this.from += u, this.to += u;
      else if (s < this.to) {
        if (s < this.from || o > this.to || this.to - this.from + c.length > 3e4) {
          i = !0;
          return;
        }
        this.editContext.updateText(this.toContextPos(s), this.toContextPos(o), c.toString()), this.to += u;
      }
      t += u;
    }), n && !i && this.revertPending(e.state), !i;
  }
  update(e) {
    let t = this.pendingContextChange, i = e.startState.selection.main;
    this.composing && (this.composing.drifted || !e.changes.touchesRange(i.from, i.to) && e.transactions.some((n) => !n.isUserEvent("input.type") && n.changes.touchesRange(this.from, this.to))) ? (this.composing.drifted = !0, this.composing.editorBase = e.changes.mapPos(this.composing.editorBase)) : !this.applyEdits(e) || !this.rangeIsValid(e.state) ? (this.pendingContextChange = null, this.reset(e.state)) : (e.docChanged || e.selectionSet || t) && this.setSelection(e.state), (e.geometryChanged || e.docChanged || e.selectionSet) && e.view.requestMeasure(this.measureReq);
  }
  resetRange(e) {
    let { head: t } = e.selection.main;
    this.from = Math.max(
      0,
      t - 1e4
      /* CxVp.Margin */
    ), this.to = Math.min(
      e.doc.length,
      t + 1e4
      /* CxVp.Margin */
    );
  }
  reset(e) {
    this.resetRange(e), this.editContext.updateText(0, this.editContext.text.length, e.doc.sliceString(this.from, this.to)), this.setSelection(e);
  }
  revertPending(e) {
    let t = this.pendingContextChange;
    this.pendingContextChange = null, this.editContext.updateText(this.toContextPos(t.from), this.toContextPos(t.from + t.insert.length), e.doc.sliceString(t.from, t.to));
  }
  setSelection(e) {
    let { main: t } = e.selection, i = this.toContextPos(Math.max(this.from, Math.min(this.to, t.anchor))), n = this.toContextPos(t.head);
    (this.editContext.selectionStart != i || this.editContext.selectionEnd != n) && this.editContext.updateSelection(i, n);
  }
  rangeIsValid(e) {
    let { head: t } = e.selection.main;
    return !(this.from > 0 && t - this.from < 500 || this.to < e.doc.length && this.to - t < 500 || this.to - this.from > 1e4 * 3);
  }
  toEditorPos(e, t = this.to - this.from) {
    e = Math.min(e, t);
    let i = this.composing;
    return i && i.drifted ? i.editorBase + (e - i.contextBase) : e + this.from;
  }
  toContextPos(e) {
    let t = this.composing;
    return t && t.drifted ? t.contextBase + (e - t.editorBase) : e - this.from;
  }
  destroy() {
    for (let e in this.handlers)
      this.editContext.removeEventListener(e, this.handlers[e]);
  }
}
class N {
  /**
  The current editor state.
  */
  get state() {
    return this.viewState.state;
  }
  /**
  To be able to display large documents without consuming too much
  memory or overloading the browser, CodeMirror only draws the
  code that is visible (plus a margin around it) to the DOM. This
  property tells you the extent of the current drawn viewport, in
  document positions.
  */
  get viewport() {
    return this.viewState.viewport;
  }
  /**
  When there are, for example, large collapsed ranges in the
  viewport, its size can be a lot bigger than the actual visible
  content. Thus, if you are doing something like styling the
  content in the viewport, it is preferable to only do so for
  these ranges, which are the subset of the viewport that is
  actually drawn.
  */
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  /**
  Returns false when the editor is entirely scrolled out of view
  or otherwise hidden.
  */
  get inView() {
    return this.viewState.inView;
  }
  /**
  Indicates whether the user is currently composing text via
  [IME](https://en.wikipedia.org/wiki/Input_method), and at least
  one change has been made in the current composition.
  */
  get composing() {
    return !!this.inputState && this.inputState.composing > 0;
  }
  /**
  Indicates whether the user is currently in composing state. Note
  that on some platforms, like Android, this will be the case a
  lot, since just putting the cursor on a word starts a
  composition there.
  */
  get compositionStarted() {
    return !!this.inputState && this.inputState.composing >= 0;
  }
  /**
  The document or shadow root that the view lives in.
  */
  get root() {
    return this._root;
  }
  /**
  @internal
  */
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  /**
  Construct a new view. You'll want to either provide a `parent`
  option, or put `view.dom` into your document after creating a
  view, so that the user can see the editor.
  */
  constructor(e = {}) {
    var t;
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.className = "cm-announced", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), e.parent && e.parent.appendChild(this.dom);
    let { dispatch: i } = e;
    this.dispatchTransactions = e.dispatchTransactions || i && ((n) => n.forEach((s) => i(s, this))) || ((n) => this.update(n)), this.dispatch = this.dispatch.bind(this), this._root = e.root || sm(e.parent) || document, this.viewState = new tc(this, e.state || ge.create(e)), e.scrollTo && e.scrollTo.is(Cn) && (this.viewState.scrollTarget = e.scrollTo.value.clip(this.viewState.state)), this.plugins = this.state.facet(ir).map((n) => new ho(n));
    for (let n of this.plugins)
      n.update(this);
    this.observer = new T0(this), this.inputState = new Hm(this), this.inputState.ensureHandlers(this.plugins), this.docView = new Yh(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), !((t = document.fonts) === null || t === void 0) && t.ready && document.fonts.ready.then(() => {
      this.viewState.mustMeasureContent = "refresh", this.requestMeasure();
    });
  }
  dispatch(...e) {
    let t = e.length == 1 && e[0] instanceof _e ? e : e.length == 1 && Array.isArray(e[0]) ? e[0] : [this.state.update(...e)];
    this.dispatchTransactions(t, this);
  }
  /**
  Update the view for the given array of transactions. This will
  update the visible document and selection to match the state
  produced by the transactions, and notify view plugins of the
  change. You should usually call
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead, which uses this
  as a primitive.
  */
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, i = !1, n, s = this.state;
    for (let m of e) {
      if (m.startState != s)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      s = m.state;
    }
    if (this.destroyed) {
      this.viewState.state = s;
      return;
    }
    let o = this.hasFocus, a = 0, l = null;
    e.some((m) => m.annotation(Nu)) ? (this.inputState.notifiedFocused = o, a = 1) : o != this.inputState.notifiedFocused && (this.inputState.notifiedFocused = o, l = qu(s, o), l || (a = 1));
    let c = this.observer.delayedAndroidKey, u = null;
    if (c ? (this.observer.clearDelayedAndroidKey(), u = this.observer.readChange(), (u && !this.state.doc.eq(s.doc) || !this.state.selection.eq(s.selection)) && (u = null)) : this.observer.clear(), s.facet(ge.phrases) != this.state.facet(ge.phrases))
      return this.setState(s);
    n = ls.create(this, s, e), n.flags |= a;
    let p = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let m of e) {
        if (p && (p = p.map(m.changes)), m.scrollIntoView) {
          let { main: v } = m.state.selection, { x: b, y: w } = this.state.facet(N.cursorScrollMargin);
          p = new ar(v.empty ? v : L.cursor(v.head, v.head > v.anchor ? -1 : 1), "nearest", "nearest", w, b);
        }
        for (let v of m.effects)
          v.is(Cn) && (p = v.value.clip(this.state));
      }
      this.viewState.update(n, p), this.bidiCache = ds.update(this.bidiCache, n.changes), n.empty || (this.updatePlugins(n), this.inputState.update(n)), t = this.docView.update(n), this.state.facet(Br) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((m) => m.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (n.startState.facet(Xn) != n.state.facet(Xn) && (this.viewState.mustMeasureContent = !0), (t || i || p || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), t && this.docViewUpdate(), !n.empty)
      for (let m of this.state.facet(ga))
        try {
          m(n);
        } catch (v) {
          Jt(this.state, v, "update listener");
        }
    (l || u) && Promise.resolve().then(() => {
      l && this.state == l.startState && this.dispatch(l), u && !ju(this, u) && c.force && or(this.contentDOM, c.key, c.keyCode);
    });
  }
  /**
  Reset the view to the given state. (This will cause the entire
  document to be redrawn and all view plugins to be reinitialized,
  so you should probably only use it when the new state isn't
  derived from the old state. Otherwise, use
  [`dispatch`](https://codemirror.net/6/docs/ref/#view.EditorView.dispatch) instead.)
  */
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new tc(this, e), this.plugins = e.facet(ir).map((i) => new ho(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView.destroy(), this.docView = new Yh(this), this.inputState.ensureHandlers(this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(ir), i = e.state.facet(ir);
    if (t != i) {
      let n = [];
      for (let s of i) {
        let o = t.indexOf(s);
        if (o < 0)
          n.push(new ho(s));
        else {
          let a = this.plugins[o];
          a.mustUpdate = e, n.push(a);
        }
      }
      for (let s of this.plugins)
        s.mustUpdate != e && s.destroy(this);
      this.plugins = n, this.pluginMap.clear();
    } else
      for (let n of this.plugins)
        n.mustUpdate = e;
    for (let n = 0; n < this.plugins.length; n++)
      this.plugins[n].update(this);
    t != i && this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let e of this.plugins) {
      let t = e.value;
      if (t && t.docViewUpdate)
        try {
          t.docViewUpdate(this);
        } catch (i) {
          Jt(this.state, i, "doc view update listener");
        }
    }
  }
  /**
  @internal
  */
  measure(e = !0) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.observer.delayedAndroidKey) {
      this.measureScheduled = -1, this.requestMeasure();
      return;
    }
    this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null, i = this.viewState.scrollParent, n = this.viewState.getScrollOffset(), { scrollAnchorPos: s, scrollAnchorHeight: o } = this.viewState;
    Math.abs(n - this.viewState.scrollOffset) > 1 && (o = -1), this.viewState.scrollAnchorHeight = -1;
    try {
      for (let a = 0; ; a++) {
        if (o < 0)
          if (uu(i || this.win))
            s = -1, o = this.viewState.heightMap.height;
          else {
            let v = this.viewState.scrollAnchorAt(n);
            s = v.from, o = v.top;
          }
        this.updateState = 1;
        let l = this.viewState.measure();
        if (!l && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (a > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let c = [];
        l & 4 || ([this.measureRequests, c] = [c, this.measureRequests]);
        let u = c.map((v) => {
          try {
            return v.read(this);
          } catch (b) {
            return Jt(this.state, b), oc;
          }
        }), p = ls.create(this, this.state, []), m = !1;
        p.flags |= l, t ? t.flags |= l : t = p, this.updateState = 2, p.empty || (this.updatePlugins(p), this.inputState.update(p), this.updateAttrs(), m = this.docView.update(p), m && this.docViewUpdate());
        for (let v = 0; v < c.length; v++)
          if (u[v] != oc)
            try {
              let b = c[v];
              b.write && b.write(u[v], this);
            } catch (b) {
              Jt(this.state, b);
            }
        if (m && this.docView.updateSelection(!0), !p.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight)
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, o = -1;
              continue;
            } else {
              let b = ((s < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(s).top) - o) / this.scaleY;
              if ((b > 1 || b < -1) && !(V.ios && this.inputState.lastIOSMomentumScroll > Date.now() - 100) && (i == this.scrollDOM || this.hasFocus || Math.max(this.inputState.lastWheelEvent, this.inputState.lastTouchTime) > Date.now() - 100)) {
                n = n + b, i ? i.scrollTop += b : this.win.scrollBy(0, b), o = -1;
                continue;
              }
            }
          break;
        }
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let a of this.state.facet(ga))
        a(t);
  }
  /**
  Get the CSS classes for the currently active editor themes.
  */
  get themeClasses() {
    return ka + " " + (this.state.facet(ba) ? Hu : Fu) + " " + this.state.facet(Xn);
  }
  updateAttrs() {
    let e = ac(this, Au, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      writingsuggestions: "false",
      translate: "no",
      contenteditable: this.state.facet(ai) ? "true" : "false",
      class: "cm-content",
      style: `${V.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), ac(this, al, t);
    let i = this.observer.ignore(() => {
      let n = Eh(this.contentDOM, this.contentAttrs, t), s = Eh(this.dom, this.editorAttrs, e);
      return n || s;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let n of i.effects)
        if (n.is(N.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let s = this.announceDOM.appendChild(document.createElement("div"));
          s.textContent = n.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Br);
    let e = this.state.facet(N.cspNonce);
    wi.mount(this.root, this.styleModules.concat(P0).reverse(), e ? { nonce: e } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  /**
  Schedule a layout measurement, optionally providing callbacks to
  do custom DOM measuring followed by a DOM write phase. Using
  this is preferable reading DOM layout directly from, for
  example, an event handler, because it'll make sure measuring and
  drawing done by other components is synchronized, avoiding
  unnecessary DOM layout computations.
  */
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = this.win.requestAnimationFrame(() => this.measure())), e) {
      if (this.measureRequests.indexOf(e) > -1)
        return;
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  /**
  Get the value of a specific plugin, if present. Note that
  plugins that crash can be dropped from a view, so even when you
  know you registered a given plugin, it is recommended to check
  the return value of this method.
  */
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.plugin != e) && this.pluginMap.set(e, t = this.plugins.find((i) => i.plugin == e) || null), t && t.update(this).value;
  }
  /**
  The top position of the document, in screen coordinates. This
  may be negative when the editor is scrolled down. Points
  directly to the top of the first line, not above the padding.
  */
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  /**
  Reports the padding above and below the document.
  */
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  /**
  If the editor is transformed with CSS, this provides the scale
  along the X axis. Otherwise, it will just be 1. Note that
  transforms other than translation and scaling are not supported.
  */
  get scaleX() {
    return this.viewState.scaleX;
  }
  /**
  Provide the CSS transformed scale along the Y axis.
  */
  get scaleY() {
    return this.viewState.scaleY;
  }
  /**
  Find the text line or block widget at the given vertical
  position (which is interpreted as relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop)).
  */
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  /**
  Find the line block (see
  [`lineBlockAt`](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt)) at the given
  height, again interpreted relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop).
  */
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  /**
  Get the extent and vertical position of all [line
  blocks](https://codemirror.net/6/docs/ref/#view.EditorView.lineBlockAt) in the viewport. Positions
  are relative to the [top of the
  document](https://codemirror.net/6/docs/ref/#view.EditorView.documentTop);
  */
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  /**
  Find the line block around the given document position. A line
  block is a range delimited on both sides by either a
  non-[hidden](https://codemirror.net/6/docs/ref/#view.Decoration^replace) line break, or the
  start/end of the document. It will usually just hold a line of
  text, but may be broken into multiple textblocks by block
  widgets.
  */
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  /**
  The editor's total content height.
  */
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  /**
  Move a cursor position by [grapheme
  cluster](https://codemirror.net/6/docs/ref/#state.findClusterBreak). `forward` determines whether
  the motion is away from the line start, or towards it. In
  bidirectional text, the line is traversed in visual order, using
  the editor's [text direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection).
  When the start position was the last one on the line, the
  returned position will be across the line break. If there is no
  further line, the original position is returned.
  
  By default, this method moves over a single cluster. The
  optional `by` argument can be used to move across more. It will
  be called with the first cluster as argument, and should return
  a predicate that determines, for each subsequent cluster,
  whether it should also be moved over.
  */
  moveByChar(e, t, i) {
    return Oo(this, e, zh(this, e, t, i));
  }
  /**
  Move a cursor position across the next group of either
  [letters](https://codemirror.net/6/docs/ref/#state.EditorState.charCategorizer) or non-letter
  non-whitespace characters.
  */
  moveByGroup(e, t) {
    return Oo(this, e, zh(this, e, t, (i) => Wm(this, e.head, i)));
  }
  /**
  Get the cursor position visually at the start or end of a line.
  Note that this may differ from the _logical_ position at its
  start or end (which is simply at `line.from`/`line.to`) if text
  at the start or end goes against the line's base text direction.
  */
  visualLineSide(e, t) {
    let i = this.bidiSpans(e), n = this.textDirectionAt(e.from), s = i[t ? i.length - 1 : 0];
    return L.cursor(s.side(t, n) + e.from, s.forward(!t, n) ? 1 : -1);
  }
  /**
  Move to the next line boundary in the given direction. If
  `includeWrap` is true, line wrapping is on, and there is a
  further wrap point on the current line, the wrap point will be
  returned. Otherwise this function will return the start or end
  of the line.
  */
  moveToLineBoundary(e, t, i = !0) {
    return Im(this, e, t, i);
  }
  /**
  Move a cursor position vertically. When `distance` isn't given,
  it defaults to moving to the next line (including wrapped
  lines). Otherwise, `distance` should provide a positive distance
  in pixels.
  
  When `start` has a
  [`goalColumn`](https://codemirror.net/6/docs/ref/#state.SelectionRange.goalColumn), the vertical
  motion will use that as a target horizontal position. Otherwise,
  the cursor's own horizontal position is used. The returned
  cursor will have its goal column set to whichever column was
  used.
  */
  moveVertically(e, t, i) {
    return Oo(this, e, Ym(this, e, t, i));
  }
  /**
  Find the DOM parent node and offset (child offset if `node` is
  an element, character offset when it is a text node) at the
  given document position.
  
  Note that for positions that aren't currently in
  `visibleRanges`, the resulting DOM position isn't necessarily
  meaningful (it may just point before or after a placeholder
  element).
  */
  domAtPos(e, t = 1) {
    return this.docView.domAtPos(e, t);
  }
  /**
  Find the document position at the given DOM node. Can be useful
  for associating positions with DOM events. Will raise an error
  when `node` isn't part of the editor content.
  */
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    this.readMeasured();
    let i = va(this, e, t);
    return i && i.pos;
  }
  posAndSideAtCoords(e, t = !0) {
    return this.readMeasured(), va(this, e, t);
  }
  /**
  Get the screen coordinates at the given document position.
  `side` determines whether the coordinates are based on the
  element before (-1) or after (1) the position (if no element is
  available on the given side, the method will transparently use
  another strategy to get reasonable coordinates).
  */
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let i = this.state.doc.lineAt(e), n = this.bidiSpans(i), s = n[Kt.find(n, e - i.from, -1, t)];
    return this.docView.coordsAt(e, t, s.dir == Ce.RTL);
  }
  /**
  Return the rectangle around a given character. If `pos` does not
  point in front of a character that is in the viewport and
  rendered (i.e. not replaced, not a line break), this will return
  null. For space characters that are a line wrap point, this will
  return the position before the line break.
  */
  coordsForChar(e) {
    return this.readMeasured(), this.docView.coordsForChar(e);
  }
  /**
  The default width of a character in the editor. May not
  accurately reflect the width of all characters (given variable
  width fonts or styling of invididual ranges).
  */
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  /**
  The default height of a line in the editor. May not be accurate
  for all lines.
  */
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  /**
  The text direction
  ([`direction`](https://developer.mozilla.org/en-US/docs/Web/CSS/direction)
  CSS property) of the editor's content element.
  */
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  /**
  Find the text direction of the block at the given position, as
  assigned by CSS. If
  [`perLineTextDirection`](https://codemirror.net/6/docs/ref/#view.EditorView^perLineTextDirection)
  isn't enabled, or the given position is outside of the viewport,
  this will always return the same as
  [`textDirection`](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection). Note that
  this may trigger a DOM layout.
  */
  textDirectionAt(e) {
    return !this.state.facet($u) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  /**
  Whether this editor [wraps lines](https://codemirror.net/6/docs/ref/#view.EditorView.lineWrapping)
  (as determined by the
  [`white-space`](https://developer.mozilla.org/en-US/docs/Web/CSS/white-space)
  CSS property of its content element).
  */
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  /**
  Returns the bidirectional text structure of the given line
  (which should be in the current document) as an array of span
  objects. The order of these spans matches the [text
  direction](https://codemirror.net/6/docs/ref/#view.EditorView.textDirection)—if that is
  left-to-right, the leftmost spans come first, otherwise the
  rightmost spans come first.
  */
  bidiSpans(e) {
    if (e.length > R0)
      return yu(e.length);
    let t = this.textDirectionAt(e.from), i;
    for (let s of this.bidiCache)
      if (s.from == e.from && s.dir == t && (s.fresh || mu(s.isolates, i = jh(this, e))))
        return s.order;
    i || (i = jh(this, e));
    let n = dm(e.text, t, i);
    return this.bidiCache.push(new ds(e.from, e.to, t, i, !0, n)), n;
  }
  /**
  Check whether the editor has focus.
  */
  get hasFocus() {
    var e;
    return (this.dom.ownerDocument.hasFocus() || V.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  /**
  Put focus on the editor.
  */
  focus() {
    this.observer.ignore(() => {
      fu(this.contentDOM), this.docView.updateSelection();
    });
  }
  /**
  Update the [root](https://codemirror.net/6/docs/ref/##view.EditorViewConfig.root) in which the editor lives. This is only
  necessary when moving the editor's existing DOM to a new window or shadow root.
  */
  setRoot(e) {
    this._root != e && (this._root = e, this.observer.setWindow((e.nodeType == 9 ? e : e.ownerDocument).defaultView || window), this.mountStyles());
  }
  /**
  Clean up this editor view, removing its element from the
  document, unregistering event handlers, and notifying
  plugins. The view instance can no longer be used after
  calling this.
  */
  destroy() {
    this.root.activeElement == this.contentDOM && this.contentDOM.blur();
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.docView.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && this.win.cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  /**
  Returns an effect that can be
  [added](https://codemirror.net/6/docs/ref/#state.TransactionSpec.effects) to a transaction to
  cause it to scroll the given position or range into view.
  */
  static scrollIntoView(e, t = {}) {
    var i, n, s, o;
    return Cn.of(new ar(typeof e == "number" ? L.cursor(e) : e, (i = t.y) !== null && i !== void 0 ? i : "nearest", (n = t.x) !== null && n !== void 0 ? n : "nearest", (s = t.yMargin) !== null && s !== void 0 ? s : 5, (o = t.xMargin) !== null && o !== void 0 ? o : 5));
  }
  /**
  Return an effect that resets the editor to its current (at the
  time this method was called) scroll position. Note that this
  only affects the editor's own scrollable element, not parents.
  See also
  [`EditorViewConfig.scrollTo`](https://codemirror.net/6/docs/ref/#view.EditorViewConfig.scrollTo).
  
  The effect should be used with a document identical to the one
  it was created for. Failing to do so is not an error, but may
  not scroll to the expected position. You can
  [map](https://codemirror.net/6/docs/ref/#state.StateEffect.map) the effect to account for changes.
  */
  scrollSnapshot() {
    let { scrollTop: e, scrollLeft: t } = this.scrollDOM, i = this.viewState.scrollAnchorAt(e);
    return Cn.of(new ar(L.cursor(i.from), "start", "start", i.top - e, t, !0));
  }
  /**
  Enable or disable tab-focus mode, which disables key bindings
  for Tab and Shift-Tab, letting the browser's default
  focus-changing behavior go through instead. This is useful to
  prevent trapping keyboard users in your editor.
  
  Without argument, this toggles the mode. With a boolean, it
  enables (true) or disables it (false). Given a number, it
  temporarily enables the mode until that number of milliseconds
  have passed or another non-Tab key is pressed.
  */
  setTabFocusMode(e) {
    e == null ? this.inputState.tabFocusMode = this.inputState.tabFocusMode < 0 ? 0 : -1 : typeof e == "boolean" ? this.inputState.tabFocusMode = e ? 0 : -1 : this.inputState.tabFocusMode != 0 && (this.inputState.tabFocusMode = Date.now() + e);
  }
  /**
  Returns an extension that can be used to add DOM event handlers.
  The value should be an object mapping event names to handler
  functions. For any given event, such functions are ordered by
  extension precedence, and the first handler to return true will
  be assumed to have handled that event, and no other handlers or
  built-in behavior will be activated for it. These are registered
  on the [content element](https://codemirror.net/6/docs/ref/#view.EditorView.contentDOM), except
  for `scroll` handlers, which will be called any time the
  editor's [scroll element](https://codemirror.net/6/docs/ref/#view.EditorView.scrollDOM) or one of
  its parent nodes is scrolled.
  */
  static domEventHandlers(e) {
    return Tt.define(() => ({}), { eventHandlers: e });
  }
  /**
  Create an extension that registers DOM event observers. Contrary
  to event [handlers](https://codemirror.net/6/docs/ref/#view.EditorView^domEventHandlers),
  observers can't be prevented from running by a higher-precedence
  handler returning true. They also don't prevent other handlers
  and observers from running when they return true, and should not
  call `preventDefault`.
  */
  static domEventObservers(e) {
    return Tt.define(() => ({}), { eventObservers: e });
  }
  /**
  Create a theme extension. The first argument can be a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)
  style spec providing the styles for the theme. These will be
  prefixed with a generated class for the style.
  
  Because the selectors will be prefixed with a scope class, rule
  that directly match the editor's [wrapper
  element](https://codemirror.net/6/docs/ref/#view.EditorView.dom)—to which the scope class will be
  added—need to be explicitly differentiated by adding an `&` to
  the selector for that element—for example
  `&.cm-focused`.
  
  When `dark` is set to true, the theme will be marked as dark,
  which will cause the `&dark` rules from [base
  themes](https://codemirror.net/6/docs/ref/#view.EditorView^baseTheme) to be used (as opposed to
  `&light` when a light theme is active).
  */
  static theme(e, t) {
    let i = wi.newName(), n = [Xn.of(i), Br.of(xa(`.${i}`, e))];
    return t && t.dark && n.push(ba.of(!0)), n;
  }
  /**
  Create an extension that adds styles to the base theme. Like
  with [`theme`](https://codemirror.net/6/docs/ref/#view.EditorView^theme), use `&` to indicate the
  place of the editor wrapper element when directly targeting
  that. You can also use `&dark` or `&light` instead to only
  target editors with a dark or light theme.
  */
  static baseTheme(e) {
    return qi.lowest(Br.of(xa("." + ka, e, Ku)));
  }
  /**
  Retrieve an editor view instance from the view's DOM
  representation.
  */
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), n = i && Me.get(i) || Me.get(e);
    return ((t = n?.root) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
N.styleModule = Br;
N.inputHandler = wu;
N.clipboardInputFilter = sl;
N.clipboardOutputFilter = ol;
N.scrollHandler = Cu;
N.focusChangeEffect = Qu;
N.perLineTextDirection = $u;
N.exceptionSink = xu;
N.updateListener = ga;
N.editable = ai;
N.mouseSelectionStyle = ku;
N.dragMovesSelection = bu;
N.clickAddsSelectionRange = Su;
N.decorations = Xs;
N.blockWrappers = Mu;
N.outerDecorations = ll;
N.atomicRanges = gn;
N.bidiIsolatedRanges = Ru;
N.cursorScrollMargin = /* @__PURE__ */ q.define({
  combine: (r) => {
    let e = 5, t = 5;
    for (let i of r)
      typeof i == "number" ? e = t = i : { x: e, y: t } = i;
    return { x: e, y: t };
  }
});
N.scrollMargins = Zu;
N.darkTheme = ba;
N.cspNonce = /* @__PURE__ */ q.define({ combine: (r) => r.length ? r[0] : "" });
N.contentAttributes = al;
N.editorAttributes = Au;
N.lineWrapping = /* @__PURE__ */ N.contentAttributes.of({ class: "cm-lineWrapping" });
N.announce = /* @__PURE__ */ be.define();
const R0 = 4096, oc = {};
class ds {
  constructor(e, t, i, n, s, o) {
    this.from = e, this.to = t, this.dir = i, this.isolates = n, this.fresh = s, this.order = o;
  }
  static update(e, t) {
    if (t.empty && !e.some((s) => s.fresh))
      return e;
    let i = [], n = e.length ? e[e.length - 1].dir : Ce.LTR;
    for (let s = Math.max(0, e.length - 10); s < e.length; s++) {
      let o = e[s];
      o.dir == n && !t.touchesRange(o.from, o.to) && i.push(new ds(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.isolates, !1, o.order));
    }
    return i;
  }
}
function ac(r, e, t) {
  for (let i = r.state.facet(e), n = i.length - 1; n >= 0; n--) {
    let s = i[n], o = typeof s == "function" ? s(r) : s;
    o && il(o, t);
  }
  return t;
}
const Z0 = V.mac ? "mac" : V.windows ? "win" : V.linux ? "linux" : "key";
function X0(r, e) {
  const t = r.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
  let n, s, o, a;
  for (let l = 0; l < t.length - 1; ++l) {
    const c = t[l];
    if (/^(cmd|meta|m)$/i.test(c))
      a = !0;
    else if (/^a(lt)?$/i.test(c))
      n = !0;
    else if (/^(c|ctrl|control)$/i.test(c))
      s = !0;
    else if (/^s(hift)?$/i.test(c))
      o = !0;
    else if (/^mod$/i.test(c))
      e == "mac" ? a = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + c);
  }
  return n && (i = "Alt-" + i), s && (i = "Ctrl-" + i), a && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function Ln(r, e, t) {
  return e.altKey && (r = "Alt-" + r), e.ctrlKey && (r = "Ctrl-" + r), e.metaKey && (r = "Meta-" + r), t !== !1 && e.shiftKey && (r = "Shift-" + r), r;
}
const L0 = /* @__PURE__ */ qi.default(/* @__PURE__ */ N.domEventHandlers({
  keydown(r, e) {
    return ed(Ju(e.state), r, e, "editor");
  }
})), Bs = /* @__PURE__ */ q.define({ enables: L0 }), lc = /* @__PURE__ */ new WeakMap();
function Ju(r) {
  let e = r.facet(Bs), t = lc.get(e);
  return t || lc.set(e, t = _0(e.reduce((i, n) => i.concat(n), []))), t;
}
function Ki(r, e, t) {
  return ed(Ju(r.state), e, r, t);
}
let Si = null;
const E0 = 4e3;
function _0(r, e = Z0) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), n = (o, a) => {
    let l = i[o];
    if (l == null)
      i[o] = a;
    else if (l != a)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, s = (o, a, l, c, u) => {
    var p, m;
    let v = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), b = a.split(/ (?!$)/).map((A) => X0(A, e));
    for (let A = 1; A < b.length; A++) {
      let X = b.slice(0, A).join(" ");
      n(X, !0), v[X] || (v[X] = {
        preventDefault: !0,
        stopPropagation: !1,
        run: [(_) => {
          let H = Si = { view: _, prefix: X, scope: o };
          return setTimeout(() => {
            Si == H && (Si = null);
          }, E0), !0;
        }]
      });
    }
    let w = b.join(" ");
    n(w, !1);
    let C = v[w] || (v[w] = {
      preventDefault: !1,
      stopPropagation: !1,
      run: ((m = (p = v._any) === null || p === void 0 ? void 0 : p.run) === null || m === void 0 ? void 0 : m.slice()) || []
    });
    l && C.run.push(l), c && (C.preventDefault = !0), u && (C.stopPropagation = !0);
  };
  for (let o of r) {
    let a = o.scope ? o.scope.split(" ") : ["editor"];
    if (o.any)
      for (let c of a) {
        let u = t[c] || (t[c] = /* @__PURE__ */ Object.create(null));
        u._any || (u._any = { preventDefault: !1, stopPropagation: !1, run: [] });
        let { any: p } = o;
        for (let m in u)
          u[m].run.push((v) => p(v, wa));
      }
    let l = o[e] || o.key;
    if (l)
      for (let c of a)
        s(c, l, o.run, o.preventDefault, o.stopPropagation), o.shift && s(c, "Shift-" + l, o.shift, o.preventDefault, o.stopPropagation);
  }
  return t;
}
let wa = null;
function ed(r, e, t, i) {
  wa = e;
  let n = Kg(e), s = Ha(n, 0), o = qf(s) == n.length && n != " ", a = "", l = !1, c = !1, u = !1;
  Si && Si.view == t && Si.scope == i && (a = Si.prefix + " ", Yu.indexOf(e.keyCode) < 0 && (c = !0, Si = null));
  let p = /* @__PURE__ */ new Set(), m = (C) => {
    if (C) {
      for (let A of C.run)
        if (!p.has(A) && (p.add(A), A(t)))
          return C.stopPropagation && (u = !0), !0;
      C.preventDefault && (C.stopPropagation && (u = !0), c = !0);
    }
    return !1;
  }, v = r[i], b, w;
  return v && (m(v[a + Ln(n, e, !o)]) ? l = !0 : o && (e.altKey || e.metaKey || e.ctrlKey) && // Ctrl-Alt may be used for AltGr on Windows
  !(V.windows && e.ctrlKey && e.altKey) && // Alt-combinations on macOS tend to be typed characters
  !(V.mac && e.altKey && !(e.ctrlKey || e.metaKey)) && (b = Qi[e.keyCode]) && b != n ? (m(v[a + Ln(b, e, !0)]) || e.shiftKey && (w = Hr[e.keyCode]) != n && w != b && m(v[a + Ln(w, e, !1)])) && (l = !0) : o && e.shiftKey && m(v[a + Ln(n, e, !0)]) && (l = !0), !l && m(v._any) && (l = !0)), c && (l = !0), l && u && e.stopPropagation(), wa = null, l;
}
class ji {
  /**
  Create a marker with the given class and dimensions. If `width`
  is null, the DOM element will get no width style.
  */
  constructor(e, t, i, n, s) {
    this.className = e, this.left = t, this.top = i, this.width = n, this.height = s;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  update(e, t) {
    return t.className != this.className ? !1 : (this.adjust(e), !0);
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", this.width != null && (e.style.width = this.width + "px"), e.style.height = this.height + "px";
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.width == e.width && this.height == e.height && this.className == e.className;
  }
  /**
  Create a set of rectangles for the given selection range,
  assigning them theclass`className`. Will create a single
  rectangle for empty ranges, and a set of selection-style
  rectangles covering the range's content (in a bidi-aware
  way) for non-empty ones.
  */
  static forRange(e, t, i) {
    if (i.empty) {
      let n = e.coordsAtPos(i.head, i.assoc || 1);
      if (!n)
        return [];
      let s = td(e);
      return [new ji(t, n.left - s.left, n.top - s.top, null, n.bottom - n.top)];
    } else
      return B0(e, t, i);
  }
}
function td(r) {
  let e = r.scrollDOM.getBoundingClientRect();
  return { left: (r.textDirection == Ce.LTR ? e.left : e.right - r.scrollDOM.clientWidth * r.scaleX) - r.scrollDOM.scrollLeft * r.scaleX, top: e.top - r.scrollDOM.scrollTop * r.scaleY };
}
function hc(r, e, t, i) {
  let n = r.coordsAtPos(e, t * 2);
  if (!n)
    return i;
  let s = r.dom.getBoundingClientRect(), o = (n.top + n.bottom) / 2, a = r.posAtCoords({ x: s.left + 1, y: o }), l = r.posAtCoords({ x: s.right - 1, y: o });
  return a == null || l == null ? i : { from: Math.max(i.from, Math.min(a, l)), to: Math.min(i.to, Math.max(a, l)) };
}
function B0(r, e, t) {
  if (t.to <= r.viewport.from || t.from >= r.viewport.to)
    return [];
  let i = Math.max(t.from, r.viewport.from), n = Math.min(t.to, r.viewport.to), s = r.textDirection == Ce.LTR, o = r.contentDOM, a = o.getBoundingClientRect(), l = td(r), c = o.querySelector(".cm-line"), u = c && window.getComputedStyle(c), p = a.left + (u ? parseInt(u.paddingLeft) + Math.min(0, parseInt(u.textIndent)) : 0), m = a.right - (u ? parseInt(u.paddingRight) : 0), v = ya(r, i, 1), b = ya(r, n, -1), w = v.type == He.Text ? v : null, C = b.type == He.Text ? b : null;
  if (w && (r.lineWrapping || v.widgetLineBreaks) && (w = hc(r, i, 1, w)), C && (r.lineWrapping || b.widgetLineBreaks) && (C = hc(r, n, -1, C)), w && C && w.from == C.from && w.to == C.to)
    return X(_(t.from, t.to, w));
  {
    let B = w ? _(t.from, null, w) : H(v, !1), Y = C ? _(null, t.to, C) : H(b, !0), j = [];
    return (w || v).to < (C || b).from - (w && C ? 1 : 0) || v.widgetLineBreaks > 1 && B.bottom + r.defaultLineHeight / 2 < Y.top ? j.push(A(p, B.bottom, m, Y.top)) : B.bottom < Y.top && r.elementAtHeight((B.bottom + Y.top) / 2).type == He.Text && (B.bottom = Y.top = (B.bottom + Y.top) / 2), X(B).concat(j).concat(X(Y));
  }
  function A(B, Y, j, le) {
    return new ji(e, B - l.left, Y - l.top, Math.max(0, j - B), le - Y);
  }
  function X({ top: B, bottom: Y, horizontal: j }) {
    let le = [];
    for (let he = 0; he < j.length; he += 2)
      le.push(A(j[he], B, j[he + 1], Y));
    return le;
  }
  function _(B, Y, j) {
    let le = 1e9, he = -1e9, fe = [];
    function re(Oe, Se, Ye, Le, D) {
      let Ee = r.coordsAtPos(Oe, Oe == j.to ? -2 : 2), Je = r.coordsAtPos(Ye, Ye == j.from ? 2 : -2);
      !Ee || !Je || (le = Math.min(Ee.top, Je.top, le), he = Math.max(Ee.bottom, Je.bottom, he), D == Ce.LTR ? fe.push(s && Se ? p : Ee.left, s && Le ? m : Je.right) : fe.push(!s && Le ? p : Je.left, !s && Se ? m : Ee.right));
    }
    let J = B ?? j.from, ne = Y ?? j.to;
    for (let Oe of r.visibleRanges)
      if (Oe.to > J && Oe.from < ne)
        for (let Se = Math.max(Oe.from, J), Ye = Math.min(Oe.to, ne); ; ) {
          let Le = r.state.doc.lineAt(Se);
          for (let D of r.bidiSpans(Le)) {
            let Ee = D.from + Le.from, Je = D.to + Le.from;
            if (Ee >= Ye)
              break;
            Je > Se && re(Math.max(Ee, Se), B == null && Ee <= J, Math.min(Je, Ye), Y == null && Je >= ne, D.dir);
          }
          if (Se = Le.to + 1, Se >= Ye)
            break;
        }
    return fe.length == 0 && re(J, B == null, ne, Y == null, r.textDirection), { top: le, bottom: he, horizontal: fe };
  }
  function H(B, Y) {
    let j = a.top + (Y ? B.top : B.bottom);
    return { top: j, bottom: j, horizontal: [] };
  }
}
function j0(r, e) {
  return r.constructor == e.constructor && r.eq(e);
}
class I0 {
  constructor(e, t) {
    this.view = e, this.layer = t, this.drawn = [], this.scaleX = 1, this.scaleY = 1, this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) }, this.dom = e.scrollDOM.appendChild(document.createElement("div")), this.dom.classList.add("cm-layer"), t.above && this.dom.classList.add("cm-layer-above"), t.class && this.dom.classList.add(t.class), this.scale(), this.dom.setAttribute("aria-hidden", "true"), this.setOrder(e.state), e.requestMeasure(this.measureReq), t.mount && t.mount(this.dom, e);
  }
  update(e) {
    e.startState.facet(Gn) != e.state.facet(Gn) && this.setOrder(e.state), (this.layer.update(e, this.dom) || e.geometryChanged) && (this.scale(), e.view.requestMeasure(this.measureReq));
  }
  docViewUpdate(e) {
    this.layer.updateOnDocViewUpdate !== !1 && e.requestMeasure(this.measureReq);
  }
  setOrder(e) {
    let t = 0, i = e.facet(Gn);
    for (; t < i.length && i[t] != this.layer; )
      t++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - t);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX: e, scaleY: t } = this.view;
    (e != this.scaleX || t != this.scaleY) && (this.scaleX = e, this.scaleY = t, this.dom.style.transform = `scale(${1 / e}, ${1 / t})`);
  }
  draw(e) {
    if (e.length != this.drawn.length || e.some((t, i) => !j0(t, this.drawn[i]))) {
      let t = this.dom.firstChild, i = 0;
      for (let n of e)
        n.update && t && n.constructor && this.drawn[i].constructor && n.update(t, this.drawn[i]) ? (t = t.nextSibling, i++) : this.dom.insertBefore(n.draw(), t);
      for (; t; ) {
        let n = t.nextSibling;
        t.remove(), t = n;
      }
      this.drawn = e, V.webkit && (this.dom.style.display = this.dom.firstChild ? "" : "none");
    }
  }
  destroy() {
    this.layer.destroy && this.layer.destroy(this.dom, this.view), this.dom.remove();
  }
}
const Gn = /* @__PURE__ */ q.define();
function id(r) {
  return [
    Tt.define((e) => new I0(e, r)),
    Gn.of(r)
  ];
}
const Di = /* @__PURE__ */ q.define({
  combine(r) {
    return dn(r, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0,
      iosSelectionHandles: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function W0(r = {}) {
  return [
    Di.of(r),
    z0,
    D0,
    V0,
    Pu.of(!0)
  ];
}
function Y0(r) {
  return r.facet(Di);
}
function rd(r) {
  return r.startState.facet(Di) != r.state.facet(Di);
}
const z0 = /* @__PURE__ */ id({
  above: !0,
  markers(r) {
    let { state: e } = r, t = e.facet(Di), i = [];
    for (let n of e.selection.ranges) {
      let s = n == e.selection.main;
      if (n.empty || t.drawRangeCursor && !(s && V.ios && t.iosSelectionHandles)) {
        let o = s ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary", a = n.empty ? n : L.cursor(n.head, n.assoc);
        for (let l of ji.forRange(r, o, a))
          i.push(l);
      }
    }
    return i;
  },
  update(r, e) {
    r.transactions.some((i) => i.selection) && (e.style.animationName = e.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink");
    let t = rd(r);
    return t && cc(r.state, e), r.docChanged || r.selectionSet || t;
  },
  mount(r, e) {
    cc(e.state, r);
  },
  class: "cm-cursorLayer"
});
function cc(r, e) {
  e.style.animationDuration = r.facet(Di).cursorBlinkRate + "ms";
}
const D0 = /* @__PURE__ */ id({
  above: !1,
  markers(r) {
    let e = [], { main: t, ranges: i } = r.state.selection;
    for (let n of i)
      if (!n.empty)
        for (let s of ji.forRange(r, "cm-selectionBackground", n))
          e.push(s);
    if (V.ios && !t.empty && r.state.facet(Di).iosSelectionHandles) {
      for (let n of ji.forRange(r, "cm-selectionHandle cm-selectionHandle-start", L.cursor(t.from, 1)))
        e.push(n);
      for (let n of ji.forRange(r, "cm-selectionHandle cm-selectionHandle-end", L.cursor(t.to, 1)))
        e.push(n);
    }
    return e;
  },
  update(r, e) {
    return r.docChanged || r.selectionSet || r.viewportChanged || rd(r);
  },
  class: "cm-selectionLayer"
}), V0 = /* @__PURE__ */ qi.highest(/* @__PURE__ */ N.theme({
  ".cm-line": {
    "& ::selection, &::selection": { backgroundColor: "transparent !important" },
    caretColor: "transparent !important"
  },
  ".cm-content": {
    caretColor: "transparent !important",
    "& :focus": {
      caretColor: "initial !important",
      "&::selection, & ::selection": {
        backgroundColor: "Highlight !important"
      }
    }
  }
}));
function fc(r, e, t, i, n) {
  e.lastIndex = 0;
  for (let s = r.iterRange(t, i), o = t, a; !s.next().done; o += s.value.length)
    if (!s.lineBreak)
      for (; a = e.exec(s.value); )
        n(o + a.index, a);
}
function N0(r, e) {
  let t = r.visibleRanges;
  if (t.length == 1 && t[0].from == r.viewport.from && t[0].to == r.viewport.to)
    return t;
  let i = [];
  for (let { from: n, to: s } of t)
    n = Math.max(r.state.doc.lineAt(n).from, n - e), s = Math.min(r.state.doc.lineAt(s).to, s + e), i.length && i[i.length - 1].to >= n ? i[i.length - 1].to = s : i.push({ from: n, to: s });
  return i;
}
class q0 {
  /**
  Create a decorator.
  */
  constructor(e) {
    const { regexp: t, decoration: i, decorate: n, boundary: s, maxLength: o = 1e3 } = e;
    if (!t.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = t, n)
      this.addMatch = (a, l, c, u) => n(u, c, c + a[0].length, a, l);
    else if (typeof i == "function")
      this.addMatch = (a, l, c, u) => {
        let p = i(a, l, c);
        p && u(c, c + a[0].length, p);
      };
    else if (i)
      this.addMatch = (a, l, c, u) => u(c, c + a[0].length, i);
    else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = s, this.maxLength = o;
  }
  /**
  Compute the full set of decorations for matches in the given
  view's viewport. You'll want to call this when initializing your
  plugin.
  */
  createDeco(e) {
    let t = new Ii(), i = t.add.bind(t);
    for (let { from: n, to: s } of N0(e, this.maxLength))
      fc(e.state.doc, this.regexp, n, s, (o, a) => this.addMatch(a, e, o, i));
    return t.finish();
  }
  /**
  Update a set of decorations for a view update. `deco` _must_ be
  the set of decorations produced by _this_ `MatchDecorator` for
  the view state before the update.
  */
  updateDeco(e, t) {
    let i = 1e9, n = -1;
    return e.docChanged && e.changes.iterChanges((s, o, a, l) => {
      l >= e.view.viewport.from && a <= e.view.viewport.to && (i = Math.min(a, i), n = Math.max(l, n));
    }), e.viewportMoved || n - i > 1e3 ? this.createDeco(e.view) : n > -1 ? this.updateRange(e.view, t.map(e.changes), i, n) : t;
  }
  updateRange(e, t, i, n) {
    for (let s of e.visibleRanges) {
      let o = Math.max(s.from, i), a = Math.min(s.to, n);
      if (a >= o) {
        let l = e.state.doc.lineAt(o), c = l.to < a ? e.state.doc.lineAt(a) : l, u = Math.max(s.from, l.from), p = Math.min(s.to, c.to);
        if (this.boundary) {
          for (; o > l.from; o--)
            if (this.boundary.test(l.text[o - 1 - l.from])) {
              u = o;
              break;
            }
          for (; a < c.to; a++)
            if (this.boundary.test(c.text[a - c.from])) {
              p = a;
              break;
            }
        }
        let m = [], v, b = (w, C, A) => m.push(A.range(w, C));
        if (l == c)
          for (this.regexp.lastIndex = u - l.from; (v = this.regexp.exec(l.text)) && v.index < p - l.from; )
            this.addMatch(v, e, v.index + l.from, b);
        else
          fc(e.state.doc, this.regexp, u, p, (w, C) => this.addMatch(C, e, w, b));
        t = t.update({ filterFrom: u, filterTo: p, filter: (w, C) => w < u || C > p, add: m });
      }
    }
    return t;
  }
}
const Qa = /x/.unicode != null ? "gu" : "g", G0 = /* @__PURE__ */ new RegExp(`[\0-\b
--­؜​‎‏\u2028\u2029‭‮⁦⁧⁩\uFEFF￹-￼]`, Qa), U0 = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let mo = null;
function F0() {
  var r;
  if (mo == null && typeof document < "u" && document.body) {
    let e = document.body.style;
    mo = ((r = e.tabSize) !== null && r !== void 0 ? r : e.MozTabSize) != null;
  }
  return mo || !1;
}
const Un = /* @__PURE__ */ q.define({
  combine(r) {
    let e = dn(r, {
      render: null,
      specialChars: G0,
      addSpecialChars: null
    });
    return (e.replaceTabs = !F0()) && (e.specialChars = new RegExp("	|" + e.specialChars.source, Qa)), e.addSpecialChars && (e.specialChars = new RegExp(e.specialChars.source + "|" + e.addSpecialChars.source, Qa)), e;
  }
});
function H0(r = {}) {
  return [Un.of(r), K0()];
}
let uc = null;
function K0() {
  return uc || (uc = Tt.fromClass(class {
    constructor(r) {
      this.view = r, this.decorations = ee.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(r.state.facet(Un)), this.decorations = this.decorator.createDeco(r);
    }
    makeDecorator(r) {
      return new q0({
        regexp: r.specialChars,
        decoration: (e, t, i) => {
          let { doc: n } = t.state, s = Ha(e[0], 0);
          if (s == 9) {
            let o = n.lineAt(i), a = t.state.tabSize, l = ri(o.text, a, i - o.from);
            return ee.replace({
              widget: new iy((a - l % a) * this.view.defaultCharacterWidth / this.view.scaleX)
            });
          }
          return this.decorationCache[s] || (this.decorationCache[s] = ee.replace({ widget: new ty(r, s) }));
        },
        boundary: r.replaceTabs ? void 0 : /[^]/
      });
    }
    update(r) {
      let e = r.state.facet(Un);
      r.startState.facet(Un) != e ? (this.decorator = this.makeDecorator(e), this.decorations = this.decorator.createDeco(r.view)) : this.decorations = this.decorator.updateDeco(r, this.decorations);
    }
  }, {
    decorations: (r) => r.decorations
  }));
}
const J0 = "•";
function ey(r) {
  return r >= 32 ? J0 : r == 10 ? "␤" : String.fromCharCode(9216 + r);
}
class ty extends Bt {
  constructor(e, t) {
    super(), this.options = e, this.code = t;
  }
  eq(e) {
    return e.code == this.code;
  }
  toDOM(e) {
    let t = ey(this.code), i = e.state.phrase("Control character") + " " + (U0[this.code] || "0x" + this.code.toString(16)), n = this.options.render && this.options.render(this.code, i, t);
    if (n)
      return n;
    let s = document.createElement("span");
    return s.textContent = t, s.title = i, s.setAttribute("aria-label", i), s.className = "cm-specialChar", s;
  }
  ignoreEvent() {
    return !1;
  }
}
class iy extends Bt {
  constructor(e) {
    super(), this.width = e;
  }
  eq(e) {
    return e.width == this.width;
  }
  toDOM() {
    let e = document.createElement("span");
    return e.textContent = "	", e.className = "cm-tab", e.style.width = this.width + "px", e;
  }
  ignoreEvent() {
    return !1;
  }
}
const dc = /* @__PURE__ */ q.define({
  combine(r) {
    let e, t;
    for (let i of r)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
}), ry = /* @__PURE__ */ Tt.fromClass(class {
  constructor(r) {
    this.input = r.state.facet(tn), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(r));
    let e = r.state.facet(dc);
    this.top = new En(r, !0, e.topContainer), this.bottom = new En(r, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(r) {
    let e = r.state.facet(dc);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new En(r.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new En(r.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = r.state.facet(tn);
    if (t != this.input) {
      let i = t.filter((l) => l), n = [], s = [], o = [], a = [];
      for (let l of i) {
        let c = this.specs.indexOf(l), u;
        c < 0 ? (u = l(r.view), a.push(u)) : (u = this.panels[c], u.update && u.update(r)), n.push(u), (u.top ? s : o).push(u);
      }
      this.specs = i, this.panels = n, this.top.sync(s), this.bottom.sync(o);
      for (let l of a)
        l.dom.classList.add("cm-panel"), l.mount && l.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(r);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (r) => N.scrollMargins.of((e) => {
    let t = e.plugin(r);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class En {
  constructor(e, t, i) {
    this.view = e, this.top = t, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = Oc(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Oc(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function Oc(r) {
  let e = r.nextSibling;
  return r.remove(), e;
}
const tn = /* @__PURE__ */ q.define({
  enables: ry
});
class Vi extends xi {
  /**
  @internal
  */
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  /**
  Compare this marker to another marker of the same type.
  */
  eq(e) {
    return !1;
  }
  /**
  Called if the marker has a `toDOM` method and its representation
  was removed from a gutter.
  */
  destroy(e) {
  }
}
Vi.prototype.elementClass = "";
Vi.prototype.toDOM = void 0;
Vi.prototype.mapMode = Ue.TrackBefore;
Vi.prototype.startSide = Vi.prototype.endSide = -1;
Vi.prototype.point = !0;
const yo = /* @__PURE__ */ q.define(), ny = /* @__PURE__ */ q.define(), Fn = /* @__PURE__ */ q.define(), pc = /* @__PURE__ */ q.define({
  combine: (r) => r.some((e) => e)
});
function sy(r) {
  return [
    oy
  ];
}
const oy = /* @__PURE__ */ Tt.fromClass(class {
  constructor(r) {
    this.view = r, this.domAfter = null, this.prevViewport = r.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters cm-gutters-before", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.gutters = r.state.facet(Fn).map((e) => new mc(r, e)), this.fixed = !r.state.facet(pc);
    for (let e of this.gutters)
      e.config.side == "after" ? this.getDOMAfter().appendChild(e.dom) : this.dom.appendChild(e.dom);
    this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), r.scrollDOM.insertBefore(this.dom, r.contentDOM);
  }
  getDOMAfter() {
    return this.domAfter || (this.domAfter = document.createElement("div"), this.domAfter.className = "cm-gutters cm-gutters-after", this.domAfter.setAttribute("aria-hidden", "true"), this.domAfter.style.minHeight = this.view.contentHeight / this.view.scaleY + "px", this.domAfter.style.position = this.fixed ? "sticky" : "", this.view.scrollDOM.appendChild(this.domAfter)), this.domAfter;
  }
  update(r) {
    if (this.updateGutters(r)) {
      let e = this.prevViewport, t = r.view.viewport, i = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(i < (t.to - t.from) * 0.8);
    }
    if (r.geometryChanged) {
      let e = this.view.contentHeight / this.view.scaleY + "px";
      this.dom.style.minHeight = e, this.domAfter && (this.domAfter.style.minHeight = e);
    }
    this.view.state.facet(pc) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : "", this.domAfter && (this.domAfter.style.position = this.fixed ? "sticky" : "")), this.prevViewport = r.view.viewport;
  }
  syncGutters(r) {
    let e = this.dom.nextSibling;
    r && (this.dom.remove(), this.domAfter && this.domAfter.remove());
    let t = pe.iter(this.view.state.facet(yo), this.view.viewport.from), i = [], n = this.gutters.map((s) => new ay(s, this.view.viewport, -this.view.documentPadding.top));
    for (let s of this.view.viewportLineBlocks)
      if (i.length && (i = []), Array.isArray(s.type)) {
        let o = !0;
        for (let a of s.type)
          if (a.type == He.Text && o) {
            $a(t, i, a.from);
            for (let l of n)
              l.line(this.view, a, i);
            o = !1;
          } else if (a.widget)
            for (let l of n)
              l.widget(this.view, a);
      } else if (s.type == He.Text) {
        $a(t, i, s.from);
        for (let o of n)
          o.line(this.view, s, i);
      } else if (s.widget)
        for (let o of n)
          o.widget(this.view, s);
    for (let s of n)
      s.finish();
    r && (this.view.scrollDOM.insertBefore(this.dom, e), this.domAfter && this.view.scrollDOM.appendChild(this.domAfter));
  }
  updateGutters(r) {
    let e = r.startState.facet(Fn), t = r.state.facet(Fn), i = r.docChanged || r.heightChanged || r.viewportChanged || !pe.eq(r.startState.facet(yo), r.state.facet(yo), r.view.viewport.from, r.view.viewport.to);
    if (e == t)
      for (let n of this.gutters)
        n.update(r) && (i = !0);
    else {
      i = !0;
      let n = [];
      for (let s of t) {
        let o = e.indexOf(s);
        o < 0 ? n.push(new mc(this.view, s)) : (this.gutters[o].update(r), n.push(this.gutters[o]));
      }
      for (let s of this.gutters)
        s.dom.remove(), n.indexOf(s) < 0 && s.destroy();
      for (let s of n)
        s.config.side == "after" ? this.getDOMAfter().appendChild(s.dom) : this.dom.appendChild(s.dom);
      this.gutters = n;
    }
    return i;
  }
  destroy() {
    for (let r of this.gutters)
      r.destroy();
    this.dom.remove(), this.domAfter && this.domAfter.remove();
  }
}, {
  provide: (r) => N.scrollMargins.of((e) => {
    let t = e.plugin(r);
    if (!t || t.gutters.length == 0 || !t.fixed)
      return null;
    let i = t.dom.offsetWidth * e.scaleX, n = t.domAfter ? t.domAfter.offsetWidth * e.scaleX : 0;
    return e.textDirection == Ce.LTR ? { left: i, right: n } : { right: i, left: n };
  })
});
function gc(r) {
  return Array.isArray(r) ? r : [r];
}
function $a(r, e, t) {
  for (; r.value && r.from <= t; )
    r.from == t && e.push(r.value), r.next();
}
class ay {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.i = 0, this.cursor = pe.iter(e.markers, t.from);
  }
  addElement(e, t, i) {
    let { gutter: n } = this, s = (t.top - this.height) / e.scaleY, o = t.height / e.scaleY;
    if (this.i == n.elements.length) {
      let a = new nd(e, o, s, i);
      n.elements.push(a), n.dom.appendChild(a.dom);
    } else
      n.elements[this.i].update(e, o, s, i);
    this.height = t.bottom, this.i++;
  }
  line(e, t, i) {
    let n = [];
    $a(this.cursor, n, t.from), i.length && (n = n.concat(i));
    let s = this.gutter.config.lineMarker(e, t, n);
    s && n.unshift(s);
    let o = this.gutter;
    n.length == 0 && !o.config.renderEmptyElements || this.addElement(e, t, n);
  }
  widget(e, t) {
    let i = this.gutter.config.widgetMarker(e, t.widget, t), n = i ? [i] : null;
    for (let s of e.state.facet(ny)) {
      let o = s(e, t.widget, t);
      o && (n || (n = [])).push(o);
    }
    n && this.addElement(e, t, n);
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class mc {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in t.domEventHandlers)
      this.dom.addEventListener(i, (n) => {
        let s = n.target, o;
        if (s != this.dom && this.dom.contains(s)) {
          for (; s.parentNode != this.dom; )
            s = s.parentNode;
          let l = s.getBoundingClientRect();
          o = (l.top + l.bottom) / 2;
        } else
          o = n.clientY;
        let a = e.lineBlockAtHeight(o - e.documentTop);
        t.domEventHandlers[i](e, a, n) && n.preventDefault();
      });
    this.markers = gc(t.markers(e)), t.initialSpacer && (this.spacer = new nd(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = gc(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let n = this.config.updateSpacer(this.spacer.markers[0], e);
      n != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [n]);
    }
    let i = e.view.viewport;
    return !pe.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class nd {
  constructor(e, t, i, n) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, n);
  }
  update(e, t, i, n) {
    this.height != t && (this.height = t, this.dom.style.height = t + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), ly(this.markers, n) || this.setMarkers(e, n);
  }
  setMarkers(e, t) {
    let i = "cm-gutterElement", n = this.dom.firstChild;
    for (let s = 0, o = 0; ; ) {
      let a = o, l = s < t.length ? t[s++] : null, c = !1;
      if (l) {
        let u = l.elementClass;
        u && (i += " " + u);
        for (let p = o; p < this.markers.length; p++)
          if (this.markers[p].compare(l)) {
            a = p, c = !0;
            break;
          }
      } else
        a = this.markers.length;
      for (; o < a; ) {
        let u = this.markers[o++];
        if (u.toDOM) {
          u.destroy(n);
          let p = n.nextSibling;
          n.remove(), n = p;
        }
      }
      if (!l)
        break;
      l.toDOM && (c ? n = n.nextSibling : this.dom.insertBefore(l.toDOM(e), n)), c && o++;
    }
    this.dom.className = i, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function ly(r, e) {
  if (r.length != e.length)
    return !1;
  for (let t = 0; t < r.length; t++)
    if (!r[t].compare(e[t]))
      return !1;
  return !0;
}
const hy = /* @__PURE__ */ q.define(), cy = /* @__PURE__ */ q.define(), rr = /* @__PURE__ */ q.define({
  combine(r) {
    return dn(r, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let i = Object.assign({}, e);
        for (let n in t) {
          let s = i[n], o = t[n];
          i[n] = s ? (a, l, c) => s(a, l, c) || o(a, l, c) : o;
        }
        return i;
      }
    });
  }
});
class vo extends Vi {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function So(r, e) {
  return r.state.facet(rr).formatNumber(e, r.state);
}
const fy = /* @__PURE__ */ Fn.compute([rr], (r) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(hy);
  },
  lineMarker(e, t, i) {
    return i.some((n) => n.toDOM) ? null : new vo(So(e, e.state.doc.lineAt(t.from).number));
  },
  widgetMarker: (e, t, i) => {
    for (let n of e.state.facet(cy)) {
      let s = n(e, t, i);
      if (s)
        return s;
    }
    return null;
  },
  lineMarkerChange: (e) => e.startState.facet(rr) != e.state.facet(rr),
  initialSpacer(e) {
    return new vo(So(e, yc(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = So(t.view, yc(t.view.state.doc.lines));
    return i == e.number ? e : new vo(i);
  },
  domEventHandlers: r.facet(rr).domEventHandlers,
  side: "before"
}));
function uy(r = {}) {
  return [
    rr.of(r),
    sy(),
    fy
  ];
}
function yc(r) {
  let e = 9;
  for (; e < r; )
    e = e * 10 + 9;
  return e;
}
const sd = 1024;
let dy = 0;
class Pt {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class te {
  /**
  Create a new node prop type.
  */
  constructor(e = {}) {
    this.id = dy++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    }), this.combine = e.combine || null;
  }
  /**
  This is meant to be used with
  [`NodeSet.extend`](#common.NodeSet.extend) or
  [`LRParser.configure`](#lr.ParserConfig.props) to compute
  prop values for each node type in the set. Takes a [match
  object](#common.NodeType^match) or function that returns undefined
  if the node type doesn't get this prop, and the prop's value if
  it does.
  */
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = je.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
te.closedBy = new te({ deserialize: (r) => r.split(" ") });
te.openedBy = new te({ deserialize: (r) => r.split(" ") });
te.group = new te({ deserialize: (r) => r.split(" ") });
te.isolate = new te({ deserialize: (r) => {
  if (r && r != "rtl" && r != "ltr" && r != "auto")
    throw new RangeError("Invalid value for isolate: " + r);
  return r || "auto";
} });
te.contextHash = new te({ perNode: !0 });
te.lookAhead = new te({ perNode: !0 });
te.mounted = new te({ perNode: !0 });
class lr {
  constructor(e, t, i, n = !1) {
    this.tree = e, this.overlay = t, this.parser = i, this.bracketed = n;
  }
  /**
  @internal
  */
  static get(e) {
    return e && e.props && e.props[te.mounted.id];
  }
}
const Oy = /* @__PURE__ */ Object.create(null);
class je {
  /**
  @internal
  */
  constructor(e, t, i, n = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = n;
  }
  /**
  Define a node type.
  */
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Oy, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), n = new je(e.name || "", t, e.id, i);
    if (e.props) {
      for (let s of e.props)
        if (Array.isArray(s) || (s = s(n)), s) {
          if (s[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[s[0].id] = s[1];
        }
    }
    return n;
  }
  /**
  Retrieves a node prop for this type. Will return `undefined` if
  the prop isn't present on this node.
  */
  prop(e) {
    return this.props[e.id];
  }
  /**
  True when this is the top node of a grammar.
  */
  get isTop() {
    return (this.flags & 1) > 0;
  }
  /**
  True when this node is produced by a skip rule.
  */
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  /**
  Indicates whether this is an error node.
  */
  get isError() {
    return (this.flags & 4) > 0;
  }
  /**
  When true, this node type doesn't correspond to a user-declared
  named node, for example because it is used to cache repetition.
  */
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  /**
  Returns true when this node's name or one of its
  [groups](#common.NodeProp^group) matches the given string.
  */
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(te.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  /**
  Create a function from node types to arbitrary values by
  specifying an object whose property names are node or
  [group](#common.NodeProp^group) names. Often useful with
  [`NodeProp.add`](#common.NodeProp.add). You can put multiple
  names, separated by spaces, in a single property name to map
  multiple node names to a single value.
  */
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e)
      for (let n of i.split(" "))
        t[n] = e[i];
    return (i) => {
      for (let n = i.prop(te.group), s = -1; s < (n ? n.length : 0); s++) {
        let o = t[s < 0 ? i.name : n[s]];
        if (o)
          return o;
      }
    };
  }
}
je.none = new je(
  "",
  /* @__PURE__ */ Object.create(null),
  0,
  8
  /* NodeFlag.Anonymous */
);
class mn {
  /**
  Create a set with the given types. The `id` property of each
  type should correspond to its position within the array.
  */
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  /**
  Create a copy of this set with some node properties added. The
  arguments to this method can be created with
  [`NodeProp.add`](#common.NodeProp.add).
  */
  extend(...e) {
    let t = [];
    for (let i of this.types) {
      let n = null;
      for (let s of e) {
        let o = s(i);
        if (o) {
          n || (n = Object.assign({}, i.props));
          let a = o[1], l = o[0];
          l.combine && l.id in n && (a = l.combine(n[l.id], a)), n[l.id] = a;
        }
      }
      t.push(n ? new je(i.name, n, i.id, i.flags) : i);
    }
    return new mn(t);
  }
}
const _n = /* @__PURE__ */ new WeakMap(), vc = /* @__PURE__ */ new WeakMap();
var ve;
(function(r) {
  r[r.ExcludeBuffers = 1] = "ExcludeBuffers", r[r.IncludeAnonymous = 2] = "IncludeAnonymous", r[r.IgnoreMounts = 4] = "IgnoreMounts", r[r.IgnoreOverlays = 8] = "IgnoreOverlays", r[r.EnterBracketed = 16] = "EnterBracketed";
})(ve || (ve = {}));
class ye {
  /**
  Construct a new tree. See also [`Tree.build`](#common.Tree^build).
  */
  constructor(e, t, i, n, s) {
    if (this.type = e, this.children = t, this.positions = i, this.length = n, this.props = null, s && s.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, a] of s)
        this.props[typeof o == "number" ? o : o.id] = a;
    }
  }
  /**
  @internal
  */
  toString() {
    let e = lr.get(this);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let n = i.toString();
      n && (t && (t += ","), t += n);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  /**
  Get a [tree cursor](#common.TreeCursor) positioned at the top of
  the tree. Mode can be used to [control](#common.IterMode) which
  nodes the cursor visits.
  */
  cursor(e = 0) {
    return new Os(this.topNode, e);
  }
  /**
  Get a [tree cursor](#common.TreeCursor) pointing into this tree
  at the given position and side (see
  [`moveTo`](#common.TreeCursor.moveTo).
  */
  cursorAt(e, t = 0, i = 0) {
    let n = _n.get(this) || this.topNode, s = new Os(n);
    return s.moveTo(e, t), _n.set(this, s._tree), s;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) object for the top of the
  tree.
  */
  get topNode() {
    return new it(this, 0, 0, null);
  }
  /**
  Get the [syntax node](#common.SyntaxNode) at the given position.
  If `side` is -1, this will move into nodes that end at the
  position. If 1, it'll move into nodes that start at the
  position. With 0, it'll only enter nodes that cover the position
  from both sides.
  
  Note that this will not enter
  [overlays](#common.MountedTree.overlay), and you often want
  [`resolveInner`](#common.Tree.resolveInner) instead.
  */
  resolve(e, t = 0) {
    let i = rn(_n.get(this) || this.topNode, e, t, !1);
    return _n.set(this, i), i;
  }
  /**
  Like [`resolve`](#common.Tree.resolve), but will enter
  [overlaid](#common.MountedTree.overlay) nodes, producing a syntax node
  pointing into the innermost overlaid tree at the given position
  (with parent links going through all parent structure, including
  the host trees).
  */
  resolveInner(e, t = 0) {
    let i = rn(vc.get(this) || this.topNode, e, t, !0);
    return vc.set(this, i), i;
  }
  /**
  In some situations, it can be useful to iterate through all
  nodes around a position, including those in overlays that don't
  directly cover the position. This method gives you an iterator
  that will produce all nodes, from small to big, around the given
  position.
  */
  resolveStack(e, t = 0) {
    return my(this, e, t);
  }
  /**
  Iterate over the tree and its children, calling `enter` for any
  node that touches the `from`/`to` region (if given) before
  running over such a node's children, and `leave` (if given) when
  leaving the node. When `enter` returns `false`, that node will
  not have its children iterated over (or `leave` called).
  */
  iterate(e) {
    let { enter: t, leave: i, from: n = 0, to: s = this.length } = e, o = e.mode || 0, a = (o & ve.IncludeAnonymous) > 0;
    for (let l = this.cursor(o | ve.IncludeAnonymous); ; ) {
      let c = !1;
      if (l.from <= s && l.to >= n && (!a && l.type.isAnonymous || t(l) !== !1)) {
        if (l.firstChild())
          continue;
        c = !0;
      }
      for (; c && i && (a || !l.type.isAnonymous) && i(l), !l.nextSibling(); ) {
        if (!l.parent())
          return;
        c = !0;
      }
    }
  }
  /**
  Get the value of the given [node prop](#common.NodeProp) for this
  node. Works with both per-node and per-type props.
  */
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  /**
  Returns the node's [per-node props](#common.NodeProp.perNode) in a
  format that can be passed to the [`Tree`](#common.Tree)
  constructor.
  */
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  /**
  Balance the direct children of this tree, producing a copy of
  which may have children grouped into subtrees with type
  [`NodeType.none`](#common.NodeType^none).
  */
  balance(e = {}) {
    return this.children.length <= 8 ? this : Ol(je.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, n) => new ye(this.type, t, i, n, this.propValues), e.makeTree || ((t, i, n) => new ye(je.none, t, i, n)));
  }
  /**
  Build a tree from a postfix-ordered buffer of node information,
  or a cursor over such a buffer.
  */
  static build(e) {
    return yy(e);
  }
}
ye.empty = new ye(je.none, [], [], 0);
class ul {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new ul(this.buffer, this.index);
  }
}
class Pi {
  /**
  Create a tree buffer.
  */
  constructor(e, t, i) {
    this.buffer = e, this.length = t, this.set = i;
  }
  /**
  @internal
  */
  get type() {
    return je.none;
  }
  /**
  @internal
  */
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  /**
  @internal
  */
  childString(e) {
    let t = this.buffer[e], i = this.buffer[e + 3], n = this.set.types[t], s = n.name;
    if (/\W/.test(s) && !n.isError && (s = JSON.stringify(s)), e += 4, i == e)
      return s;
    let o = [];
    for (; e < i; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return s + "(" + o.join(",") + ")";
  }
  /**
  @internal
  */
  findChild(e, t, i, n, s) {
    let { buffer: o } = this, a = -1;
    for (let l = e; l != t && !(od(s, n, o[l + 1], o[l + 2]) && (a = l, i > 0)); l = o[l + 3])
      ;
    return a;
  }
  /**
  @internal
  */
  slice(e, t, i) {
    let n = this.buffer, s = new Uint16Array(t - e), o = 0;
    for (let a = e, l = 0; a < t; ) {
      s[l++] = n[a++], s[l++] = n[a++] - i;
      let c = s[l++] = n[a++] - i;
      s[l++] = n[a++] - e, o = Math.max(o, c);
    }
    return new Pi(s, o, this.set);
  }
}
function od(r, e, t, i) {
  switch (r) {
    case -2:
      return t < e;
    case -1:
      return i >= e && t < e;
    case 0:
      return t < e && i > e;
    case 1:
      return t <= e && i > e;
    case 2:
      return i > e;
    case 4:
      return !0;
  }
}
function rn(r, e, t, i) {
  for (var n; r.from == r.to || (t < 1 ? r.from >= e : r.from > e) || (t > -1 ? r.to <= e : r.to < e); ) {
    let o = !i && r instanceof it && r.index < 0 ? null : r.parent;
    if (!o)
      return r;
    r = o;
  }
  let s = i ? 0 : ve.IgnoreOverlays;
  if (i)
    for (let o = r, a = o.parent; a; o = a, a = o.parent)
      o instanceof it && o.index < 0 && ((n = a.enter(e, t, s)) === null || n === void 0 ? void 0 : n.from) != o.from && (r = a);
  for (; ; ) {
    let o = r.enter(e, t, s);
    if (!o)
      return r;
    r = o;
  }
}
class ad {
  cursor(e = 0) {
    return new Os(this, e);
  }
  getChild(e, t = null, i = null) {
    let n = Sc(this, e, t, i);
    return n.length ? n[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return Sc(this, e, t, i);
  }
  resolve(e, t = 0) {
    return rn(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return rn(this, e, t, !0);
  }
  matchContext(e) {
    return Pa(this.parent, e);
  }
  enterUnfinishedNodesBefore(e) {
    let t = this.childBefore(e), i = this;
    for (; t; ) {
      let n = t.lastChild;
      if (!n || n.to != t.to)
        break;
      n.type.isError && n.from == n.to ? (i = t, t = n.prevSibling) : t = n;
    }
    return i;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
}
class it extends ad {
  constructor(e, t, i, n) {
    super(), this._tree = e, this.from = t, this.index = i, this._parent = n;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, i, n, s = 0) {
    for (let o = this; ; ) {
      for (let { children: a, positions: l } = o._tree, c = t > 0 ? a.length : -1; e != c; e += t) {
        let u = a[e], p = l[e] + o.from, m;
        if (!(!(s & ve.EnterBracketed && u instanceof ye && (m = lr.get(u)) && !m.overlay && m.bracketed && i >= p && i <= p + u.length) && !od(n, i, p, p + u.length))) {
          if (u instanceof Pi) {
            if (s & ve.ExcludeBuffers)
              continue;
            let v = u.findChild(0, u.buffer.length, t, i - p, n);
            if (v > -1)
              return new ei(new py(o, u, e, p), null, v);
          } else if (s & ve.IncludeAnonymous || !u.type.isAnonymous || dl(u)) {
            let v;
            if (!(s & ve.IgnoreMounts) && (v = lr.get(u)) && !v.overlay)
              return new it(v.tree, p, e, o);
            let b = new it(u, p, e, o);
            return s & ve.IncludeAnonymous || !b.type.isAnonymous ? b : b.nextChild(t < 0 ? u.children.length - 1 : 0, t, i, n, s);
          }
        }
      }
      if (s & ve.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + t : e = t < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(
      0,
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.nextChild(
      0,
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.nextChild(
      this._tree.children.length - 1,
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this._tree.prop(e);
  }
  enter(e, t, i = 0) {
    let n;
    if (!(i & ve.IgnoreOverlays) && (n = lr.get(this._tree)) && n.overlay) {
      let s = e - this.from, o = i & ve.EnterBracketed && n.bracketed;
      for (let { from: a, to: l } of n.overlay)
        if ((t > 0 || o ? a <= s : a < s) && (t < 0 || o ? l >= s : l > s))
          return new it(n.tree, n.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, i);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index + 1,
      1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(
      this.index - 1,
      -1,
      0,
      4
      /* Side.DontCare */
    ) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  /**
  @internal
  */
  toString() {
    return this._tree.toString();
  }
}
function Sc(r, e, t, i) {
  let n = r.cursor(), s = [];
  if (!n.firstChild())
    return s;
  if (t != null) {
    for (let o = !1; !o; )
      if (o = n.type.is(t), !n.nextSibling())
        return s;
  }
  for (; ; ) {
    if (i != null && n.type.is(i))
      return s;
    if (n.type.is(e) && s.push(n.node), !n.nextSibling())
      return i == null ? s : [];
  }
}
function Pa(r, e, t = e.length - 1) {
  for (let i = r; t >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (e[t] && e[t] != i.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class py {
  constructor(e, t, i, n) {
    this.parent = e, this.buffer = t, this.index = i, this.start = n;
  }
}
class ei extends ad {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(e, t, i) {
    super(), this.context = e, this._parent = t, this.index = i, this.type = e.buffer.set.types[e.buffer.buffer[i]];
  }
  child(e, t, i) {
    let { buffer: n } = this.context, s = n.findChild(this.index + 4, n.buffer[this.index + 3], e, t - this.context.start, i);
    return s < 0 ? null : new ei(this.context, this, s);
  }
  get firstChild() {
    return this.child(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  get lastChild() {
    return this.child(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  childAfter(e) {
    return this.child(
      1,
      e,
      2
      /* Side.After */
    );
  }
  childBefore(e) {
    return this.child(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  prop(e) {
    return this.type.prop(e);
  }
  enter(e, t, i = 0) {
    if (i & ve.ExcludeBuffers)
      return null;
    let { buffer: n } = this.context, s = n.findChild(this.index + 4, n.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return s < 0 ? null : new ei(this.context, this, s);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(
      this.context.index + e,
      e,
      0,
      4
      /* Side.DontCare */
    );
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new ei(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new ei(this.context, this._parent, e.findChild(
      t,
      this.index,
      -1,
      0,
      4
      /* Side.DontCare */
    ));
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: i } = this.context, n = this.index + 4, s = i.buffer[this.index + 3];
    if (s > n) {
      let o = i.buffer[this.index + 1];
      e.push(i.slice(n, s, o)), t.push(0);
    }
    return new ye(this.type, e, t, this.to - this.from);
  }
  /**
  @internal
  */
  toString() {
    return this.context.buffer.childString(this.index);
  }
}
function ld(r) {
  if (!r.length)
    return null;
  let e = 0, t = r[0];
  for (let s = 1; s < r.length; s++) {
    let o = r[s];
    (o.from > t.from || o.to < t.to) && (t = o, e = s);
  }
  let i = t instanceof it && t.index < 0 ? null : t.parent, n = r.slice();
  return i ? n[e] = i : n.splice(e, 1), new gy(n, t);
}
class gy {
  constructor(e, t) {
    this.heads = e, this.node = t;
  }
  get next() {
    return ld(this.heads);
  }
}
function my(r, e, t) {
  let i = r.resolveInner(e, t), n = null;
  for (let s = i instanceof it ? i : i.context.parent; s; s = s.parent)
    if (s.index < 0) {
      let o = s.parent;
      (n || (n = [i])).push(o.resolve(e, t)), s = o;
    } else {
      let o = lr.get(s.tree);
      if (o && o.overlay && o.overlay[0].from <= e && o.overlay[o.overlay.length - 1].to >= e) {
        let a = new it(o.tree, o.overlay[0].from + s.from, -1, s);
        (n || (n = [i])).push(rn(a, e, t, !1));
      }
    }
  return n ? ld(n) : i;
}
class Os {
  /**
  Shorthand for `.type.name`.
  */
  get name() {
    return this.type.name;
  }
  /**
  @internal
  */
  constructor(e, t = 0) {
    if (this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, this.mode = t & ~ve.EnterBracketed, e instanceof it)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let i = e._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: i, buffer: n } = this.buffer;
    return this.type = t || n.set.types[n.buffer[e]], this.from = i + n.buffer[e + 1], this.to = i + n.buffer[e + 2], !0;
  }
  /**
  @internal
  */
  yield(e) {
    return e ? e instanceof it ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  /**
  @internal
  */
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  /**
  @internal
  */
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: n } = this.buffer, s = n.findChild(this.index + 4, n.buffer[this.index + 3], e, t - this.buffer.start, i);
    return s < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(s));
  }
  /**
  Move the cursor to this node's first child. When this returns
  false, the node has no child, and the cursor has not been moved.
  */
  firstChild() {
    return this.enterChild(
      1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to this node's last child.
  */
  lastChild() {
    return this.enterChild(
      -1,
      0,
      4
      /* Side.DontCare */
    );
  }
  /**
  Move the cursor to the first child that ends after `pos`.
  */
  childAfter(e) {
    return this.enterChild(
      1,
      e,
      2
      /* Side.After */
    );
  }
  /**
  Move to the last child that starts before `pos`.
  */
  childBefore(e) {
    return this.enterChild(
      -1,
      e,
      -2
      /* Side.Before */
    );
  }
  /**
  Move the cursor to the child around `pos`. If side is -1 the
  child may end at that position, when 1 it may start there. This
  will also enter [overlaid](#common.MountedTree.overlay)
  [mounted](#common.NodeProp^mounted) trees unless `overlays` is
  set to false.
  */
  enter(e, t, i = this.mode) {
    return this.buffer ? i & ve.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  /**
  Move to the node's parent node, if this isn't the top node.
  */
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & ve.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & ve.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  /**
  @internal
  */
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let n = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != n)
        return this.yieldBuf(t.findChild(
          n,
          this.index,
          -1,
          0,
          4
          /* Side.DontCare */
        ));
    } else {
      let n = t.buffer[this.index + 3];
      if (n < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(n);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  /**
  Move to this node's next sibling, if any.
  */
  nextSibling() {
    return this.sibling(1);
  }
  /**
  Move to this node's previous sibling, if any.
  */
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, i, { buffer: n } = this;
    if (n) {
      if (e > 0) {
        if (this.index < n.buffer.buffer.length)
          return !1;
      } else
        for (let s = 0; s < this.index; s++)
          if (n.buffer.buffer[s + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = n);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let s = t + e, o = e < 0 ? -1 : i._tree.children.length; s != o; s += e) {
          let a = i._tree.children[s];
          if (this.mode & ve.IncludeAnonymous || a instanceof Pi || !a.type.isAnonymous || dl(a))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(
      e,
      0,
      4
      /* Side.DontCare */
    ))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  /**
  Move to the next node in a
  [pre-order](https://en.wikipedia.org/wiki/Tree_traversal#Pre-order,_NLR)
  traversal, going from a node to its first child or, if the
  current node is empty or `enter` is false, its next sibling or
  the next sibling of the first parent node that has one.
  */
  next(e = !0) {
    return this.move(1, e);
  }
  /**
  Move to the next node in a last-to-first pre-order traversal. A
  node is followed by its last child or, if it has none, its
  previous sibling or the previous sibling of the first parent
  node that has one.
  */
  prev(e = !0) {
    return this.move(-1, e);
  }
  /**
  Move the cursor to the innermost node that covers `pos`. If
  `side` is -1, it will enter nodes that end at `pos`. If it is 1,
  it will enter nodes that start at `pos`.
  */
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  /**
  Get a [syntax node](#common.SyntaxNode) at the cursor's current
  position.
  */
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, i = 0;
    if (e && e.context == this.buffer)
      e: for (let n = this.index, s = this.stack.length; s >= 0; ) {
        for (let o = e; o; o = o._parent)
          if (o.index == n) {
            if (n == this.index)
              return o;
            t = o, i = s + 1;
            break e;
          }
        n = this.stack[--s];
      }
    for (let n = i; n < this.stack.length; n++)
      t = new ei(this.buffer, t, this.stack[n]);
    return this.bufferNode = new ei(this.buffer, t, this.index);
  }
  /**
  Get the [tree](#common.Tree) that represents the current node, if
  any. Will return null when the node is in a [tree
  buffer](#common.TreeBuffer).
  */
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  /**
  Iterate over the current node and all its descendants, calling
  `enter` when entering a node and `leave`, if given, when leaving
  one. When `enter` returns `false`, any children of that node are
  skipped, and `leave` isn't called for it.
  */
  iterate(e, t) {
    for (let i = 0; ; ) {
      let n = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (n = !0);
      }
      for (; ; ) {
        if (n && t && t(this), n = this.type.isAnonymous, !i)
          return;
        if (this.nextSibling())
          break;
        this.parent(), i--, n = !0;
      }
    }
  }
  /**
  Test whether the current node matches a given context—a sequence
  of direct parent node names. Empty strings in the context array
  are treated as wildcards.
  */
  matchContext(e) {
    if (!this.buffer)
      return Pa(this.node.parent, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let n = e.length - 1, s = this.stack.length - 1; n >= 0; s--) {
      if (s < 0)
        return Pa(this._tree, e, n);
      let o = i[t.buffer[this.stack[s]]];
      if (!o.isAnonymous) {
        if (e[n] && e[n] != o.name)
          return !1;
        n--;
      }
    }
    return !0;
  }
}
function dl(r) {
  return r.children.some((e) => e instanceof Pi || !e.type.isAnonymous || dl(e));
}
function yy(r) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: n = sd, reused: s = [], minRepeatType: o = i.types.length } = r, a = Array.isArray(t) ? new ul(t, t.length) : t, l = i.types, c = 0, u = 0;
  function p(B, Y, j, le, he, fe) {
    let { id: re, start: J, end: ne, size: Oe } = a, Se = u, Ye = c;
    if (Oe < 0)
      if (a.next(), Oe == -1) {
        let nt = s[re];
        j.push(nt), le.push(J - B);
        return;
      } else if (Oe == -3) {
        c = re;
        return;
      } else if (Oe == -4) {
        u = re;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${Oe}`);
    let Le = l[re], D, Ee, Je = J - B;
    if (ne - J <= n && (Ee = C(a.pos - Y, he))) {
      let nt = new Uint16Array(Ee.size - Ee.skip), we = a.pos - Ee.size, ze = nt.length;
      for (; a.pos > we; )
        ze = A(Ee.start, nt, ze);
      D = new Pi(nt, ne - Ee.start, i), Je = Ee.start - B;
    } else {
      let nt = a.pos - Oe;
      a.next();
      let we = [], ze = [], xt = re >= o ? re : -1, ke = 0, Gi = ne;
      for (; a.pos > nt; )
        xt >= 0 && a.id == xt && a.size >= 0 ? (a.end <= Gi - n && (b(we, ze, J, ke, a.end, Gi, xt, Se, Ye), ke = we.length, Gi = a.end), a.next()) : fe > 2500 ? m(J, nt, we, ze) : p(J, nt, we, ze, xt, fe + 1);
      if (xt >= 0 && ke > 0 && ke < we.length && b(we, ze, J, ke, J, Gi, xt, Se, Ye), we.reverse(), ze.reverse(), xt > -1 && ke > 0) {
        let di = v(Le, Ye);
        D = Ol(Le, we, ze, 0, we.length, 0, ne - J, di, di);
      } else
        D = w(Le, we, ze, ne - J, Se - ne, Ye);
    }
    j.push(D), le.push(Je);
  }
  function m(B, Y, j, le) {
    let he = [], fe = 0, re = -1;
    for (; a.pos > Y; ) {
      let { id: J, start: ne, end: Oe, size: Se } = a;
      if (Se > 4)
        a.next();
      else {
        if (re > -1 && ne < re)
          break;
        re < 0 && (re = Oe - n), he.push(J, ne, Oe), fe++, a.next();
      }
    }
    if (fe) {
      let J = new Uint16Array(fe * 4), ne = he[he.length - 2];
      for (let Oe = he.length - 3, Se = 0; Oe >= 0; Oe -= 3)
        J[Se++] = he[Oe], J[Se++] = he[Oe + 1] - ne, J[Se++] = he[Oe + 2] - ne, J[Se++] = Se;
      j.push(new Pi(J, he[2] - ne, i)), le.push(ne - B);
    }
  }
  function v(B, Y) {
    return (j, le, he) => {
      let fe = 0, re = j.length - 1, J, ne;
      if (re >= 0 && (J = j[re]) instanceof ye) {
        if (!re && J.type == B && J.length == he)
          return J;
        (ne = J.prop(te.lookAhead)) && (fe = le[re] + J.length + ne);
      }
      return w(B, j, le, he, fe, Y);
    };
  }
  function b(B, Y, j, le, he, fe, re, J, ne) {
    let Oe = [], Se = [];
    for (; B.length > le; )
      Oe.push(B.pop()), Se.push(Y.pop() + j - he);
    B.push(w(i.types[re], Oe, Se, fe - he, J - fe, ne)), Y.push(he - j);
  }
  function w(B, Y, j, le, he, fe, re) {
    if (fe) {
      let J = [te.contextHash, fe];
      re = re ? [J].concat(re) : [J];
    }
    if (he > 25) {
      let J = [te.lookAhead, he];
      re = re ? [J].concat(re) : [J];
    }
    return new ye(B, Y, j, le, re);
  }
  function C(B, Y) {
    let j = a.fork(), le = 0, he = 0, fe = 0, re = j.end - n, J = { size: 0, start: 0, skip: 0 };
    e: for (let ne = j.pos - B; j.pos > ne; ) {
      let Oe = j.size;
      if (j.id == Y && Oe >= 0) {
        J.size = le, J.start = he, J.skip = fe, fe += 4, le += 4, j.next();
        continue;
      }
      let Se = j.pos - Oe;
      if (Oe < 0 || Se < ne || j.start < re)
        break;
      let Ye = j.id >= o ? 4 : 0, Le = j.start;
      for (j.next(); j.pos > Se; ) {
        if (j.size < 0)
          if (j.size == -3 || j.size == -4)
            Ye += 4;
          else
            break e;
        else j.id >= o && (Ye += 4);
        j.next();
      }
      he = Le, le += Oe, fe += Ye;
    }
    return (Y < 0 || le == B) && (J.size = le, J.start = he, J.skip = fe), J.size > 4 ? J : void 0;
  }
  function A(B, Y, j) {
    let { id: le, start: he, end: fe, size: re } = a;
    if (a.next(), re >= 0 && le < o) {
      let J = j;
      if (re > 4) {
        let ne = a.pos - (re - 4);
        for (; a.pos > ne; )
          j = A(B, Y, j);
      }
      Y[--j] = J, Y[--j] = fe - B, Y[--j] = he - B, Y[--j] = le;
    } else re == -3 ? c = le : re == -4 && (u = le);
    return j;
  }
  let X = [], _ = [];
  for (; a.pos > 0; )
    p(r.start || 0, r.bufferStart || 0, X, _, -1, 0);
  let H = (e = r.length) !== null && e !== void 0 ? e : X.length ? _[0] + X[0].length : 0;
  return new ye(l[r.topID], X.reverse(), _.reverse(), H);
}
const bc = /* @__PURE__ */ new WeakMap();
function Hn(r, e) {
  if (!r.isAnonymous || e instanceof Pi || e.type != r)
    return 1;
  let t = bc.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != r || !(i instanceof ye)) {
        t = 1;
        break;
      }
      t += Hn(r, i);
    }
    bc.set(e, t);
  }
  return t;
}
function Ol(r, e, t, i, n, s, o, a, l) {
  let c = 0;
  for (let b = i; b < n; b++)
    c += Hn(r, e[b]);
  let u = Math.ceil(
    c * 1.5 / 8
    /* Balance.BranchFactor */
  ), p = [], m = [];
  function v(b, w, C, A, X) {
    for (let _ = C; _ < A; ) {
      let H = _, B = w[_], Y = Hn(r, b[_]);
      for (_++; _ < A; _++) {
        let j = Hn(r, b[_]);
        if (Y + j >= u)
          break;
        Y += j;
      }
      if (_ == H + 1) {
        if (Y > u) {
          let j = b[H];
          v(j.children, j.positions, 0, j.children.length, w[H] + X);
          continue;
        }
        p.push(b[H]);
      } else {
        let j = w[_ - 1] + b[_ - 1].length - B;
        p.push(Ol(r, b, w, H, _, B, j, null, l));
      }
      m.push(B + X - s);
    }
  }
  return v(e, t, i, n, 0), (a || l)(p, m, o);
}
class hd {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(e, t, i) {
    let n = this.map.get(e);
    n || this.map.set(e, n = /* @__PURE__ */ new Map()), n.set(t, i);
  }
  getBuffer(e, t) {
    let i = this.map.get(e);
    return i && i.get(t);
  }
  /**
  Set the value for this syntax node.
  */
  set(e, t) {
    e instanceof ei ? this.setBuffer(e.context.buffer, e.index, t) : e instanceof it && this.map.set(e.tree, t);
  }
  /**
  Retrieve value for this syntax node, if it exists in the map.
  */
  get(e) {
    return e instanceof ei ? this.getBuffer(e.context.buffer, e.index) : e instanceof it ? this.map.get(e.tree) : void 0;
  }
  /**
  Set the value for the node that a cursor currently points to.
  */
  cursorSet(e, t) {
    e.buffer ? this.setBuffer(e.buffer.buffer, e.index, t) : this.map.set(e.tree, t);
  }
  /**
  Retrieve the value for the node that a cursor currently points
  to.
  */
  cursorGet(e) {
    return e.buffer ? this.getBuffer(e.buffer.buffer, e.index) : this.map.get(e.tree);
  }
}
class hi {
  /**
  Construct a tree fragment. You'll usually want to use
  [`addTree`](#common.TreeFragment^addTree) and
  [`applyChanges`](#common.TreeFragment^applyChanges) instead of
  calling this directly.
  */
  constructor(e, t, i, n, s = !1, o = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = n, this.open = (s ? 1 : 0) | (o ? 2 : 0);
  }
  /**
  Whether the start of the fragment represents the start of a
  parse, or the end of a change. (In the second case, it may not
  be safe to reuse some nodes at the start, depending on the
  parsing algorithm.)
  */
  get openStart() {
    return (this.open & 1) > 0;
  }
  /**
  Whether the end of the fragment represents the end of a
  full-document parse, or the start of a change.
  */
  get openEnd() {
    return (this.open & 2) > 0;
  }
  /**
  Create a set of fragments from a freshly parsed tree, or update
  an existing set of fragments by replacing the ones that overlap
  with a tree with content from the new tree. When `partial` is
  true, the parse is treated as incomplete, and the resulting
  fragment has [`openEnd`](#common.TreeFragment.openEnd) set to
  true.
  */
  static addTree(e, t = [], i = !1) {
    let n = [new hi(0, e.length, e, 0, !1, i)];
    for (let s of t)
      s.to > e.length && n.push(s);
    return n;
  }
  /**
  Apply a set of edits to an array of fragments, removing or
  splitting fragments as necessary to remove edited ranges, and
  adjusting offsets for fragments that moved.
  */
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let n = [], s = 1, o = e.length ? e[0] : null;
    for (let a = 0, l = 0, c = 0; ; a++) {
      let u = a < t.length ? t[a] : null, p = u ? u.fromA : 1e9;
      if (p - l >= i)
        for (; o && o.from < p; ) {
          let m = o;
          if (l >= m.from || p <= m.to || c) {
            let v = Math.max(m.from, l) - c, b = Math.min(m.to, p) - c;
            m = v >= b ? null : new hi(v, b, m.tree, m.offset + c, a > 0, !!u);
          }
          if (m && n.push(m), o.to > p)
            break;
          o = s < e.length ? e[s++] : null;
        }
      if (!u)
        break;
      l = u.toA, c = u.toA - u.toB;
    }
    return n;
  }
}
class pl {
  /**
  Start a parse, returning a [partial parse](#common.PartialParse)
  object. [`fragments`](#common.TreeFragment) can be passed in to
  make the parse incremental.
  
  By default, the entire input is parsed. You can pass `ranges`,
  which should be a sorted array of non-empty, non-overlapping
  ranges, to parse only those ranges. The tree returned in that
  case will start at `ranges[0].from`.
  */
  startParse(e, t, i) {
    return typeof e == "string" && (e = new vy(e)), i = i ? i.length ? i.map((n) => new Pt(n.from, n.to)) : [new Pt(0, 0)] : [new Pt(0, e.length)], this.createParse(e, t || [], i);
  }
  /**
  Run a full parse, returning the resulting tree.
  */
  parse(e, t, i) {
    let n = this.startParse(e, t, i);
    for (; ; ) {
      let s = n.advance();
      if (s)
        return s;
    }
  }
}
class vy {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
function cd(r) {
  return (e, t, i, n) => new by(e, r, t, i, n);
}
class kc {
  constructor(e, t, i, n, s, o) {
    this.parser = e, this.parse = t, this.overlay = i, this.bracketed = n, this.target = s, this.from = o;
  }
}
function xc(r) {
  if (!r.length || r.some((e) => e.from >= e.to))
    throw new RangeError("Invalid inner parse ranges given: " + JSON.stringify(r));
}
class Sy {
  constructor(e, t, i, n, s, o, a, l) {
    this.parser = e, this.predicate = t, this.mounts = i, this.index = n, this.start = s, this.bracketed = o, this.target = a, this.prev = l, this.depth = 0, this.ranges = [];
  }
}
const Ca = new te({ perNode: !0 });
class by {
  constructor(e, t, i, n, s) {
    this.nest = t, this.input = i, this.fragments = n, this.ranges = s, this.inner = [], this.innerDone = 0, this.baseTree = null, this.stoppedAt = null, this.baseParse = e;
  }
  advance() {
    if (this.baseParse) {
      let i = this.baseParse.advance();
      if (!i)
        return null;
      if (this.baseParse = null, this.baseTree = i, this.startInner(), this.stoppedAt != null)
        for (let n of this.inner)
          n.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let i = this.baseTree;
      return this.stoppedAt != null && (i = new ye(i.type, i.children, i.positions, i.length, i.propValues.concat([[Ca, this.stoppedAt]]))), i;
    }
    let e = this.inner[this.innerDone], t = e.parse.advance();
    if (t) {
      this.innerDone++;
      let i = Object.assign(/* @__PURE__ */ Object.create(null), e.target.props);
      i[te.mounted.id] = new lr(t, e.overlay, e.parser, e.bracketed), e.target.props = i;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let e = this.input.length;
    for (let t = this.innerDone; t < this.inner.length; t++)
      this.inner[t].from < e && (e = Math.min(e, this.inner[t].parse.parsedPos));
    return e;
  }
  stopAt(e) {
    if (this.stoppedAt = e, this.baseParse)
      this.baseParse.stopAt(e);
    else
      for (let t = this.innerDone; t < this.inner.length; t++)
        this.inner[t].parse.stopAt(e);
  }
  startInner() {
    let e = new wy(this.fragments), t = null, i = null, n = new Os(new it(this.baseTree, this.ranges[0].from, 0, null), ve.IncludeAnonymous | ve.IgnoreMounts);
    e: for (let s, o; ; ) {
      let a = !0, l;
      if (this.stoppedAt != null && n.from >= this.stoppedAt)
        a = !1;
      else if (e.hasNode(n)) {
        if (t) {
          let c = t.mounts.find((u) => u.frag.from <= n.from && u.frag.to >= n.to && u.mount.overlay);
          if (c)
            for (let u of c.mount.overlay) {
              let p = u.from + c.pos, m = u.to + c.pos;
              p >= n.from && m <= n.to && !t.ranges.some((v) => v.from < m && v.to > p) && t.ranges.push({ from: p, to: m });
            }
        }
        a = !1;
      } else if (i && (o = ky(i.ranges, n.from, n.to)))
        a = o != 2;
      else if (!n.type.isAnonymous && (s = this.nest(n, this.input)) && (n.from < n.to || !s.overlay)) {
        n.tree || (xy(n), t && t.depth++, i && i.depth++);
        let c = e.findMounts(n.from, s.parser);
        if (typeof s.overlay == "function")
          t = new Sy(s.parser, s.overlay, c, this.inner.length, n.from, !!s.bracketed, n.tree, t);
        else {
          let u = $c(this.ranges, s.overlay || (n.from < n.to ? [new Pt(n.from, n.to)] : []));
          u.length && xc(u), (u.length || !s.overlay) && this.inner.push(new kc(s.parser, u.length ? s.parser.startParse(this.input, Pc(c, u), u) : s.parser.startParse(""), s.overlay ? s.overlay.map((p) => new Pt(p.from - n.from, p.to - n.from)) : null, !!s.bracketed, n.tree, u.length ? u[0].from : n.from)), s.overlay ? u.length && (i = { ranges: u, depth: 0, prev: i }) : a = !1;
        }
      } else if (t && (l = t.predicate(n)) && (l === !0 && (l = new Pt(n.from, n.to)), l.from < l.to)) {
        let c = t.ranges.length - 1;
        c >= 0 && t.ranges[c].to == l.from ? t.ranges[c] = { from: t.ranges[c].from, to: l.to } : t.ranges.push(l);
      }
      if (a && n.firstChild())
        t && t.depth++, i && i.depth++;
      else
        for (; !n.nextSibling(); ) {
          if (!n.parent())
            break e;
          if (t && !--t.depth) {
            let c = $c(this.ranges, t.ranges);
            c.length && (xc(c), this.inner.splice(t.index, 0, new kc(t.parser, t.parser.startParse(this.input, Pc(t.mounts, c), c), t.ranges.map((u) => new Pt(u.from - t.start, u.to - t.start)), t.bracketed, t.target, c[0].from))), t = t.prev;
          }
          i && !--i.depth && (i = i.prev);
        }
    }
  }
}
function ky(r, e, t) {
  for (let i of r) {
    if (i.from >= t)
      break;
    if (i.to > e)
      return i.from <= e && i.to >= t ? 2 : 1;
  }
  return 0;
}
function wc(r, e, t, i, n, s) {
  if (e < t) {
    let o = r.buffer[e + 1];
    i.push(r.slice(e, t, o)), n.push(o - s);
  }
}
function xy(r) {
  let { node: e } = r, t = [], i = e.context.buffer;
  do
    t.push(r.index), r.parent();
  while (!r.tree);
  let n = r.tree, s = n.children.indexOf(i), o = n.children[s], a = o.buffer, l = [s];
  function c(u, p, m, v, b, w) {
    let C = t[w], A = [], X = [];
    wc(o, u, C, A, X, v);
    let _ = a[C + 1], H = a[C + 2];
    l.push(A.length);
    let B = w ? c(C + 4, a[C + 3], o.set.types[a[C]], _, H - _, w - 1) : e.toTree();
    return A.push(B), X.push(_ - v), wc(o, a[C + 3], p, A, X, v), new ye(m, A, X, b);
  }
  n.children[s] = c(0, a.length, je.none, 0, o.length, t.length - 1);
  for (let u of l) {
    let p = r.tree.children[u], m = r.tree.positions[u];
    r.yield(new it(p, m + r.from, u, r._tree));
  }
}
class Qc {
  constructor(e, t) {
    this.offset = t, this.done = !1, this.cursor = e.cursor(ve.IncludeAnonymous | ve.IgnoreMounts);
  }
  // Move to the first node (in pre-order) that starts at or after `pos`.
  moveTo(e) {
    let { cursor: t } = this, i = e - this.offset;
    for (; !this.done && t.from < i; )
      if (!(t.to >= e && t.enter(i, 1, ve.IgnoreOverlays | ve.ExcludeBuffers))) if (t.to <= e)
        t.next(!1) || (this.done = !0);
      else
        break;
  }
  hasNode(e) {
    if (this.moveTo(e.from), !this.done && this.cursor.from + this.offset == e.from && this.cursor.tree)
      for (let t = this.cursor.tree; ; ) {
        if (t == e.tree)
          return !0;
        if (t.children.length && t.positions[0] == 0 && t.children[0] instanceof ye)
          t = t.children[0];
        else
          break;
      }
    return !1;
  }
}
let wy = class {
  constructor(e) {
    var t;
    if (this.fragments = e, this.curTo = 0, this.fragI = 0, e.length) {
      let i = this.curFrag = e[0];
      this.curTo = (t = i.tree.prop(Ca)) !== null && t !== void 0 ? t : i.to, this.inner = new Qc(i.tree, -i.offset);
    } else
      this.curFrag = this.inner = null;
  }
  hasNode(e) {
    for (; this.curFrag && e.from >= this.curTo; )
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= e.from && this.curTo >= e.to && this.inner.hasNode(e);
  }
  nextFrag() {
    var e;
    if (this.fragI++, this.fragI == this.fragments.length)
      this.curFrag = this.inner = null;
    else {
      let t = this.curFrag = this.fragments[this.fragI];
      this.curTo = (e = t.tree.prop(Ca)) !== null && e !== void 0 ? e : t.to, this.inner = new Qc(t.tree, -t.offset);
    }
  }
  findMounts(e, t) {
    var i;
    let n = [];
    if (this.inner) {
      this.inner.cursor.moveTo(e, 1);
      for (let s = this.inner.cursor.node; s; s = s.parent) {
        let o = (i = s.tree) === null || i === void 0 ? void 0 : i.prop(te.mounted);
        if (o && o.parser == t)
          for (let a = this.fragI; a < this.fragments.length; a++) {
            let l = this.fragments[a];
            if (l.from >= s.to)
              break;
            l.tree == this.curFrag.tree && n.push({
              frag: l,
              pos: s.from - l.offset,
              mount: o
            });
          }
      }
    }
    return n;
  }
};
function $c(r, e) {
  let t = null, i = e;
  for (let n = 1, s = 0; n < r.length; n++) {
    let o = r[n - 1].to, a = r[n].from;
    for (; s < i.length; s++) {
      let l = i[s];
      if (l.from >= a)
        break;
      l.to <= o || (t || (i = t = e.slice()), l.from < o ? (t[s] = new Pt(l.from, o), l.to > a && t.splice(s + 1, 0, new Pt(a, l.to))) : l.to > a ? t[s--] = new Pt(a, l.to) : t.splice(s--, 1));
    }
  }
  return i;
}
function Qy(r, e, t, i) {
  let n = 0, s = 0, o = !1, a = !1, l = -1e9, c = [];
  for (; ; ) {
    let u = n == r.length ? 1e9 : o ? r[n].to : r[n].from, p = s == e.length ? 1e9 : a ? e[s].to : e[s].from;
    if (o != a) {
      let m = Math.max(l, t), v = Math.min(u, p, i);
      m < v && c.push(new Pt(m, v));
    }
    if (l = Math.min(u, p), l == 1e9)
      break;
    u == l && (o ? (o = !1, n++) : o = !0), p == l && (a ? (a = !1, s++) : a = !0);
  }
  return c;
}
function Pc(r, e) {
  let t = [];
  for (let { pos: i, mount: n, frag: s } of r) {
    let o = i + (n.overlay ? n.overlay[0].from : 0), a = o + n.tree.length, l = Math.max(s.from, o), c = Math.min(s.to, a);
    if (n.overlay) {
      let u = n.overlay.map((m) => new Pt(m.from + i, m.to + i)), p = Qy(e, u, l, c);
      for (let m = 0, v = l; ; m++) {
        let b = m == p.length, w = b ? c : p[m].from;
        if (w > v && t.push(new hi(v, w, n.tree, -o, s.from >= v || s.openStart, s.to <= w || s.openEnd)), b)
          break;
        v = p[m].to;
      }
    } else
      t.push(new hi(l, c, n.tree, -o, s.from >= o || s.openStart, s.to <= a || s.openEnd));
  }
  return t;
}
let $y = 0;
class St {
  /**
  @internal
  */
  constructor(e, t, i, n) {
    this.name = e, this.set = t, this.base = i, this.modified = n, this.id = $y++;
  }
  toString() {
    let { name: e } = this;
    for (let t of this.modified)
      t.name && (e = `${t.name}(${e})`);
    return e;
  }
  static define(e, t) {
    let i = typeof e == "string" ? e : "?";
    if (e instanceof St && (t = e), t?.base)
      throw new Error("Can not derive from a modified tag");
    let n = new St(i, [], null, []);
    if (n.set.push(n), t)
      for (let s of t.set)
        n.set.push(s);
    return n;
  }
  /**
  Define a tag _modifier_, which is a function that, given a tag,
  will return a tag that is a subtag of the original. Applying the
  same modifier to a twice tag will return the same value (`m1(t1)
  == m1(t1)`) and applying multiple modifiers will, regardless or
  order, produce the same tag (`m1(m2(t1)) == m2(m1(t1))`).
  
  When multiple modifiers are applied to a given base tag, each
  smaller set of modifiers is registered as a parent, so that for
  example `m1(m2(m3(t1)))` is a subtype of `m1(m2(t1))`,
  `m1(m3(t1)`, and so on.
  */
  static defineModifier(e) {
    let t = new ps(e);
    return (i) => i.modified.indexOf(t) > -1 ? i : ps.get(i.base || i, i.modified.concat(t).sort((n, s) => n.id - s.id));
  }
}
let Py = 0;
class ps {
  constructor(e) {
    this.name = e, this.instances = [], this.id = Py++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((a) => a.base == e && Cy(t, a.modified));
    if (i)
      return i;
    let n = [], s = new St(e.name, n, e, t);
    for (let a of t)
      a.instances.push(s);
    let o = Ty(t);
    for (let a of e.set)
      if (!a.modified.length)
        for (let l of o)
          n.push(ps.get(a, l));
    return s;
  }
}
function Cy(r, e) {
  return r.length == e.length && r.every((t, i) => t == e[i]);
}
function Ty(r) {
  let e = [[]];
  for (let t = 0; t < r.length; t++)
    for (let i = 0, n = e.length; i < n; i++)
      e.push(e[i].concat(r[t]));
  return e.sort((t, i) => i.length - t.length);
}
function xr(r) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in r) {
    let i = r[t];
    Array.isArray(i) || (i = [i]);
    for (let n of t.split(" "))
      if (n) {
        let s = [], o = 2, a = n;
        for (let p = 0; ; ) {
          if (a == "..." && p > 0 && p + 3 == n.length) {
            o = 1;
            break;
          }
          let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(a);
          if (!m)
            throw new RangeError("Invalid path: " + n);
          if (s.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]), p += m[0].length, p == n.length)
            break;
          let v = n[p++];
          if (p == n.length && v == "!") {
            o = 0;
            break;
          }
          if (v != "/")
            throw new RangeError("Invalid path: " + n);
          a = n.slice(p);
        }
        let l = s.length - 1, c = s[l];
        if (!c)
          throw new RangeError("Invalid path: " + n);
        let u = new nn(i, o, l > 0 ? s.slice(0, l) : null);
        e[c] = u.sort(e[c]);
      }
  }
  return fd.add(e);
}
const fd = new te({
  combine(r, e) {
    let t, i, n;
    for (; r || e; ) {
      if (!r || e && r.depth >= e.depth ? (n = e, e = e.next) : (n = r, r = r.next), t && t.mode == n.mode && !n.context && !t.context)
        continue;
      let s = new nn(n.tags, n.mode, n.context);
      t ? t.next = s : i = s, t = s;
    }
    return i;
  }
});
class nn {
  constructor(e, t, i, n) {
    this.tags = e, this.mode = t, this.context = i, this.next = n;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
nn.empty = new nn([], 2, null);
function ud(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of r)
    if (!Array.isArray(s.tag))
      t[s.tag.id] = s.class;
    else
      for (let o of s.tag)
        t[o.id] = s.class;
  let { scope: i, all: n = null } = e || {};
  return {
    style: (s) => {
      let o = n;
      for (let a of s)
        for (let l of a.set) {
          let c = t[l.id];
          if (c) {
            o = o ? o + " " + c : c;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
function Ay(r, e) {
  let t = null;
  for (let i of r) {
    let n = i.style(e);
    n && (t = t ? t + " " + n : n);
  }
  return t;
}
function My(r, e, t, i = 0, n = r.length) {
  let s = new Ry(i, Array.isArray(e) ? e : [e], t);
  s.highlightRange(r.cursor(), i, n, "", s.highlighters), s.flush(n);
}
class Ry {
  constructor(e, t, i) {
    this.at = e, this.highlighters = t, this.span = i, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, i, n, s) {
    let { type: o, from: a, to: l } = e;
    if (a >= i || l <= t)
      return;
    o.isTop && (s = this.highlighters.filter((v) => !v.scope || v.scope(o)));
    let c = n, u = Zy(e) || nn.empty, p = Ay(s, u.tags);
    if (p && (c && (c += " "), c += p, u.mode == 1 && (n += (n ? " " : "") + p)), this.startSpan(Math.max(t, a), c), u.opaque)
      return;
    let m = e.tree && e.tree.prop(te.mounted);
    if (m && m.overlay) {
      let v = e.node.enter(m.overlay[0].from + a, 1), b = this.highlighters.filter((C) => !C.scope || C.scope(m.tree.type)), w = e.firstChild();
      for (let C = 0, A = a; ; C++) {
        let X = C < m.overlay.length ? m.overlay[C] : null, _ = X ? X.from + a : l, H = Math.max(t, A), B = Math.min(i, _);
        if (H < B && w)
          for (; e.from < B && (this.highlightRange(e, H, B, n, s), this.startSpan(Math.min(B, e.to), c), !(e.to >= _ || !e.nextSibling())); )
            ;
        if (!X || _ > i)
          break;
        A = X.to + a, A > t && (this.highlightRange(v.cursor(), Math.max(t, X.from + a), Math.min(i, A), "", b), this.startSpan(Math.min(i, A), c));
      }
      w && e.parent();
    } else if (e.firstChild()) {
      m && (n = "");
      do
        if (!(e.to <= t)) {
          if (e.from >= i)
            break;
          this.highlightRange(e, t, i, n, s), this.startSpan(Math.min(i, e.to), c);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
function Zy(r) {
  let e = r.type.prop(fd);
  for (; e && e.context && !r.matchContext(e.context); )
    e = e.next;
  return e || null;
}
const z = St.define, Bn = z(), mi = z(), Cc = z(mi), Tc = z(mi), yi = z(), jn = z(yi), bo = z(yi), Gt = z(), Ri = z(Gt), Nt = z(), qt = z(), Ta = z(), Rr = z(Ta), In = z(), Q = {
  /**
  A comment.
  */
  comment: Bn,
  /**
  A line [comment](#highlight.tags.comment).
  */
  lineComment: z(Bn),
  /**
  A block [comment](#highlight.tags.comment).
  */
  blockComment: z(Bn),
  /**
  A documentation [comment](#highlight.tags.comment).
  */
  docComment: z(Bn),
  /**
  Any kind of identifier.
  */
  name: mi,
  /**
  The [name](#highlight.tags.name) of a variable.
  */
  variableName: z(mi),
  /**
  A type [name](#highlight.tags.name).
  */
  typeName: Cc,
  /**
  A tag name (subtag of [`typeName`](#highlight.tags.typeName)).
  */
  tagName: z(Cc),
  /**
  A property or field [name](#highlight.tags.name).
  */
  propertyName: Tc,
  /**
  An attribute name (subtag of [`propertyName`](#highlight.tags.propertyName)).
  */
  attributeName: z(Tc),
  /**
  The [name](#highlight.tags.name) of a class.
  */
  className: z(mi),
  /**
  A label [name](#highlight.tags.name).
  */
  labelName: z(mi),
  /**
  A namespace [name](#highlight.tags.name).
  */
  namespace: z(mi),
  /**
  The [name](#highlight.tags.name) of a macro.
  */
  macroName: z(mi),
  /**
  A literal value.
  */
  literal: yi,
  /**
  A string [literal](#highlight.tags.literal).
  */
  string: jn,
  /**
  A documentation [string](#highlight.tags.string).
  */
  docString: z(jn),
  /**
  A character literal (subtag of [string](#highlight.tags.string)).
  */
  character: z(jn),
  /**
  An attribute value (subtag of [string](#highlight.tags.string)).
  */
  attributeValue: z(jn),
  /**
  A number [literal](#highlight.tags.literal).
  */
  number: bo,
  /**
  An integer [number](#highlight.tags.number) literal.
  */
  integer: z(bo),
  /**
  A floating-point [number](#highlight.tags.number) literal.
  */
  float: z(bo),
  /**
  A boolean [literal](#highlight.tags.literal).
  */
  bool: z(yi),
  /**
  Regular expression [literal](#highlight.tags.literal).
  */
  regexp: z(yi),
  /**
  An escape [literal](#highlight.tags.literal), for example a
  backslash escape in a string.
  */
  escape: z(yi),
  /**
  A color [literal](#highlight.tags.literal).
  */
  color: z(yi),
  /**
  A URL [literal](#highlight.tags.literal).
  */
  url: z(yi),
  /**
  A language keyword.
  */
  keyword: Nt,
  /**
  The [keyword](#highlight.tags.keyword) for the self or this
  object.
  */
  self: z(Nt),
  /**
  The [keyword](#highlight.tags.keyword) for null.
  */
  null: z(Nt),
  /**
  A [keyword](#highlight.tags.keyword) denoting some atomic value.
  */
  atom: z(Nt),
  /**
  A [keyword](#highlight.tags.keyword) that represents a unit.
  */
  unit: z(Nt),
  /**
  A modifier [keyword](#highlight.tags.keyword).
  */
  modifier: z(Nt),
  /**
  A [keyword](#highlight.tags.keyword) that acts as an operator.
  */
  operatorKeyword: z(Nt),
  /**
  A control-flow related [keyword](#highlight.tags.keyword).
  */
  controlKeyword: z(Nt),
  /**
  A [keyword](#highlight.tags.keyword) that defines something.
  */
  definitionKeyword: z(Nt),
  /**
  A [keyword](#highlight.tags.keyword) related to defining or
  interfacing with modules.
  */
  moduleKeyword: z(Nt),
  /**
  An operator.
  */
  operator: qt,
  /**
  An [operator](#highlight.tags.operator) that dereferences something.
  */
  derefOperator: z(qt),
  /**
  Arithmetic-related [operator](#highlight.tags.operator).
  */
  arithmeticOperator: z(qt),
  /**
  Logical [operator](#highlight.tags.operator).
  */
  logicOperator: z(qt),
  /**
  Bit [operator](#highlight.tags.operator).
  */
  bitwiseOperator: z(qt),
  /**
  Comparison [operator](#highlight.tags.operator).
  */
  compareOperator: z(qt),
  /**
  [Operator](#highlight.tags.operator) that updates its operand.
  */
  updateOperator: z(qt),
  /**
  [Operator](#highlight.tags.operator) that defines something.
  */
  definitionOperator: z(qt),
  /**
  Type-related [operator](#highlight.tags.operator).
  */
  typeOperator: z(qt),
  /**
  Control-flow [operator](#highlight.tags.operator).
  */
  controlOperator: z(qt),
  /**
  Program or markup punctuation.
  */
  punctuation: Ta,
  /**
  [Punctuation](#highlight.tags.punctuation) that separates
  things.
  */
  separator: z(Ta),
  /**
  Bracket-style [punctuation](#highlight.tags.punctuation).
  */
  bracket: Rr,
  /**
  Angle [brackets](#highlight.tags.bracket) (usually `<` and `>`
  tokens).
  */
  angleBracket: z(Rr),
  /**
  Square [brackets](#highlight.tags.bracket) (usually `[` and `]`
  tokens).
  */
  squareBracket: z(Rr),
  /**
  Parentheses (usually `(` and `)` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  paren: z(Rr),
  /**
  Braces (usually `{` and `}` tokens). Subtag of
  [bracket](#highlight.tags.bracket).
  */
  brace: z(Rr),
  /**
  Content, for example plain text in XML or markup documents.
  */
  content: Gt,
  /**
  [Content](#highlight.tags.content) that represents a heading.
  */
  heading: Ri,
  /**
  A level 1 [heading](#highlight.tags.heading).
  */
  heading1: z(Ri),
  /**
  A level 2 [heading](#highlight.tags.heading).
  */
  heading2: z(Ri),
  /**
  A level 3 [heading](#highlight.tags.heading).
  */
  heading3: z(Ri),
  /**
  A level 4 [heading](#highlight.tags.heading).
  */
  heading4: z(Ri),
  /**
  A level 5 [heading](#highlight.tags.heading).
  */
  heading5: z(Ri),
  /**
  A level 6 [heading](#highlight.tags.heading).
  */
  heading6: z(Ri),
  /**
  A prose [content](#highlight.tags.content) separator (such as a horizontal rule).
  */
  contentSeparator: z(Gt),
  /**
  [Content](#highlight.tags.content) that represents a list.
  */
  list: z(Gt),
  /**
  [Content](#highlight.tags.content) that represents a quote.
  */
  quote: z(Gt),
  /**
  [Content](#highlight.tags.content) that is emphasized.
  */
  emphasis: z(Gt),
  /**
  [Content](#highlight.tags.content) that is styled strong.
  */
  strong: z(Gt),
  /**
  [Content](#highlight.tags.content) that is part of a link.
  */
  link: z(Gt),
  /**
  [Content](#highlight.tags.content) that is styled as code or
  monospace.
  */
  monospace: z(Gt),
  /**
  [Content](#highlight.tags.content) that has a strike-through
  style.
  */
  strikethrough: z(Gt),
  /**
  Inserted text in a change-tracking format.
  */
  inserted: z(),
  /**
  Deleted text.
  */
  deleted: z(),
  /**
  Changed text.
  */
  changed: z(),
  /**
  An invalid or unsyntactic element.
  */
  invalid: z(),
  /**
  Metadata or meta-instruction.
  */
  meta: In,
  /**
  [Metadata](#highlight.tags.meta) that applies to the entire
  document.
  */
  documentMeta: z(In),
  /**
  [Metadata](#highlight.tags.meta) that annotates or adds
  attributes to a given syntactic element.
  */
  annotation: z(In),
  /**
  Processing instruction or preprocessor directive. Subtag of
  [meta](#highlight.tags.meta).
  */
  processingInstruction: z(In),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that a
  given element is being defined. Expected to be used with the
  various [name](#highlight.tags.name) tags.
  */
  definition: St.defineModifier("definition"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates that
  something is constant. Mostly expected to be used with
  [variable names](#highlight.tags.variableName).
  */
  constant: St.defineModifier("constant"),
  /**
  [Modifier](#highlight.Tag^defineModifier) used to indicate that
  a [variable](#highlight.tags.variableName) or [property
  name](#highlight.tags.propertyName) is being called or defined
  as a function.
  */
  function: St.defineModifier("function"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that can be applied to
  [names](#highlight.tags.name) to indicate that they belong to
  the language's standard environment.
  */
  standard: St.defineModifier("standard"),
  /**
  [Modifier](#highlight.Tag^defineModifier) that indicates a given
  [names](#highlight.tags.name) is local to some scope.
  */
  local: St.defineModifier("local"),
  /**
  A generic variant [modifier](#highlight.Tag^defineModifier) that
  can be used to tag language-specific alternative variants of
  some common tag. It is recommended for themes to define special
  forms of at least the [string](#highlight.tags.string) and
  [variable name](#highlight.tags.variableName) tags, since those
  come up a lot.
  */
  special: St.defineModifier("special")
};
for (let r in Q) {
  let e = Q[r];
  e instanceof St && (e.name = r);
}
ud([
  { tag: Q.link, class: "tok-link" },
  { tag: Q.heading, class: "tok-heading" },
  { tag: Q.emphasis, class: "tok-emphasis" },
  { tag: Q.strong, class: "tok-strong" },
  { tag: Q.keyword, class: "tok-keyword" },
  { tag: Q.atom, class: "tok-atom" },
  { tag: Q.bool, class: "tok-bool" },
  { tag: Q.url, class: "tok-url" },
  { tag: Q.labelName, class: "tok-labelName" },
  { tag: Q.inserted, class: "tok-inserted" },
  { tag: Q.deleted, class: "tok-deleted" },
  { tag: Q.literal, class: "tok-literal" },
  { tag: Q.string, class: "tok-string" },
  { tag: Q.number, class: "tok-number" },
  { tag: [Q.regexp, Q.escape, Q.special(Q.string)], class: "tok-string2" },
  { tag: Q.variableName, class: "tok-variableName" },
  { tag: Q.local(Q.variableName), class: "tok-variableName tok-local" },
  { tag: Q.definition(Q.variableName), class: "tok-variableName tok-definition" },
  { tag: Q.special(Q.variableName), class: "tok-variableName2" },
  { tag: Q.definition(Q.propertyName), class: "tok-propertyName tok-definition" },
  { tag: Q.typeName, class: "tok-typeName" },
  { tag: Q.namespace, class: "tok-namespace" },
  { tag: Q.className, class: "tok-className" },
  { tag: Q.macroName, class: "tok-macroName" },
  { tag: Q.propertyName, class: "tok-propertyName" },
  { tag: Q.operator, class: "tok-operator" },
  { tag: Q.comment, class: "tok-comment" },
  { tag: Q.meta, class: "tok-meta" },
  { tag: Q.invalid, class: "tok-invalid" },
  { tag: Q.punctuation, class: "tok-punctuation" }
]);
var ko;
const Bi = /* @__PURE__ */ new te();
function gl(r) {
  return q.define({
    combine: r ? (e) => e.concat(r) : void 0
  });
}
const ml = /* @__PURE__ */ new te();
class bt {
  /**
  Construct a language object. If you need to invoke this
  directly, first define a data facet with
  [`defineLanguageFacet`](https://codemirror.net/6/docs/ref/#language.defineLanguageFacet), and then
  configure your parser to [attach](https://codemirror.net/6/docs/ref/#language.languageDataProp) it
  to the language's outer syntax node.
  */
  constructor(e, t, i = [], n = "") {
    this.data = e, this.name = n, ge.prototype.hasOwnProperty("tree") || Object.defineProperty(ge.prototype, "tree", { get() {
      return Te(this);
    } }), this.parser = t, this.extension = [
      mr.of(this),
      ge.languageData.of((s, o, a) => {
        let l = Ac(s, o, a), c = l.type.prop(Bi);
        if (!c)
          return [];
        let u = s.facet(c), p = l.type.prop(ml);
        if (p) {
          let m = l.resolve(o - l.from, a);
          for (let v of p)
            if (v.test(m, s)) {
              let b = s.facet(v.facet);
              return v.type == "replace" ? b : b.concat(u);
            }
        }
        return u;
      })
    ].concat(i);
  }
  /**
  Query whether this language is active at the given position.
  */
  isActiveAt(e, t, i = -1) {
    return Ac(e, t, i).type.prop(Bi) == this.data;
  }
  /**
  Find the document regions that were parsed using this language.
  The returned regions will _include_ any nested languages rooted
  in this language, when those exist.
  */
  findRegions(e) {
    let t = e.facet(mr);
    if (t?.data == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], n = (s, o) => {
      if (s.prop(Bi) == this.data) {
        i.push({ from: o, to: o + s.length });
        return;
      }
      let a = s.prop(te.mounted);
      if (a) {
        if (a.tree.prop(Bi) == this.data) {
          if (a.overlay)
            for (let l of a.overlay)
              i.push({ from: l.from + o, to: l.to + o });
          else
            i.push({ from: o, to: o + s.length });
          return;
        } else if (a.overlay) {
          let l = i.length;
          if (n(a.tree, a.overlay[0].from + o), i.length > l)
            return;
        }
      }
      for (let l = 0; l < s.children.length; l++) {
        let c = s.children[l];
        c instanceof ye && n(c, s.positions[l] + o);
      }
    };
    return n(Te(e), 0), i;
  }
  /**
  Indicates whether this language allows nested languages. The
  default implementation returns true.
  */
  get allowsNesting() {
    return !0;
  }
}
bt.setState = /* @__PURE__ */ be.define();
function Ac(r, e, t) {
  let i = r.facet(mr), n = Te(r).topNode;
  if (!i || i.allowsNesting)
    for (let s = n; s; s = s.enter(e, t, ve.ExcludeBuffers | ve.EnterBracketed))
      s.type.isTop && (n = s);
  return n;
}
class pr extends bt {
  constructor(e, t, i) {
    super(e, t, [], i), this.parser = t;
  }
  /**
  Define a language from a parser.
  */
  static define(e) {
    let t = gl(e.languageData);
    return new pr(t, e.parser.configure({
      props: [Bi.add((i) => i.isTop ? t : void 0)]
    }), e.name);
  }
  /**
  Create a new instance of this language with a reconfigured
  version of its parser and optionally a new name.
  */
  configure(e, t) {
    return new pr(this.data, this.parser.configure(e), t || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function Te(r) {
  let e = r.field(bt.state, !1);
  return e ? e.tree : ye.empty;
}
function dd(r, e, t = 50) {
  var i;
  let n = (i = r.field(bt.state, !1)) === null || i === void 0 ? void 0 : i.context;
  if (!n)
    return null;
  let s = n.viewport;
  n.updateViewport({ from: 0, to: e });
  let o = n.isDone(e) || n.work(t, e) ? n.tree : null;
  return n.updateViewport(s), o;
}
class Xy {
  /**
  Create an input object for the given document.
  */
  constructor(e) {
    this.doc = e, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let i = this.cursorPos - this.string.length;
    return e < i || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - i, t - i);
  }
}
let Zr = null;
class sn {
  constructor(e, t, i = [], n, s, o, a, l) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = n, this.treeLen = s, this.viewport = o, this.skipped = a, this.scheduleOn = l, this.parse = null, this.tempSkipped = [];
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new sn(e, t, [], ye.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new Xy(this.state.doc), this.fragments);
  }
  /**
  @internal
  */
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != ye.empty && this.isDone(t ?? this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let n = Date.now() + e;
        e = () => Date.now() > n;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let n = this.parse.advance();
        if (n)
          if (this.fragments = this.withoutTempSkipped(hi.addTree(n, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = n, this.parse = null, this.treeLen < (t ?? this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  /**
  @internal
  */
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(hi.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Zr;
    Zr = this;
    try {
      return e();
    } finally {
      Zr = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Mc(e, t.from, t.to);
    return e;
  }
  /**
  @internal
  */
  changes(e, t) {
    let { fragments: i, tree: n, treeLen: s, viewport: o, skipped: a } = this;
    if (this.takeTree(), !e.empty) {
      let l = [];
      if (e.iterChangedRanges((c, u, p, m) => l.push({ fromA: c, toA: u, fromB: p, toB: m })), i = hi.applyChanges(i, l), n = ye.empty, s = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        a = [];
        for (let c of this.skipped) {
          let u = e.mapPos(c.from, 1), p = e.mapPos(c.to, -1);
          u < p && a.push({ from: u, to: p });
        }
      }
    }
    return new sn(this.parser, t, i, n, s, o, a, this.scheduleOn);
  }
  /**
  @internal
  */
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: n, to: s } = this.skipped[i];
      n < e.to && s > e.from && (this.fragments = Mc(this.fragments, n, s), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  /**
  @internal
  */
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  /**
  Notify the parse scheduler that the given region was skipped
  because it wasn't in view, and the parse should be restarted
  when it comes into view.
  */
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  /**
  Returns a parser intended to be used as placeholder when
  asynchronously loading a nested parser. It'll skip its input and
  mark it as not-really-parsed, so that the next update will parse
  it again.
  
  When `until` is given, a reparse will be scheduled when that
  promise resolves.
  */
  static getSkippingParser(e) {
    return new class extends pl {
      createParse(t, i, n) {
        let s = n[0].from, o = n[n.length - 1].to;
        return {
          parsedPos: s,
          advance() {
            let l = Zr;
            if (l) {
              for (let c of n)
                l.tempSkipped.push(c);
              e && (l.scheduleOn = l.scheduleOn ? Promise.all([l.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new ye(je.none, [], [], o - s);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  /**
  @internal
  */
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  /**
  Get the context for the current parse, or `null` if no editor
  parse is in progress.
  */
  static get() {
    return Zr;
  }
}
function Mc(r, e, t) {
  return hi.applyChanges(r, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class gr {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new gr(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = sn.create(e.facet(mr).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new gr(i);
  }
}
bt.state = /* @__PURE__ */ Ke.define({
  create: gr.init,
  update(r, e) {
    for (let t of e.effects)
      if (t.is(bt.setState))
        return t.value;
    return e.startState.facet(mr) != e.state.facet(mr) ? gr.init(e.state) : r.apply(e);
  }
});
let Od = (r) => {
  let e = setTimeout(
    () => r(),
    500
    /* Work.MaxPause */
  );
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Od = (r) => {
  let e = -1, t = setTimeout(
    () => {
      e = requestIdleCallback(r, {
        timeout: 400
        /* Work.MinPause */
      });
    },
    100
    /* Work.MinPause */
  );
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const xo = typeof navigator < "u" && (!((ko = navigator.scheduling) === null || ko === void 0) && ko.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Ly = /* @__PURE__ */ Tt.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(bt.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), (e.docChanged || e.selectionSet) && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(bt.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Od(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: n } } = this.view, s = i.field(bt.state);
    if (s.tree == s.context.tree && s.context.isDone(
      n + 1e5
      /* Work.MaxParseAhead */
    ))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !xo ? Math.max(25, e.timeRemaining() - 5) : 1e9), a = s.context.treeLen < n && i.doc.length > n + 1e3, l = s.context.work(() => xo && xo() || Date.now() > o, n + (a ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (l || this.chunkBudget <= 0) && (s.context.takeTree(), this.view.dispatch({ effects: bt.setState.of(new gr(s.context)) })), this.chunkBudget > 0 && !(l && !a) && this.scheduleWork(), this.checkAsyncSchedule(s.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Jt(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), mr = /* @__PURE__ */ q.define({
  combine(r) {
    return r.length ? r[0] : null;
  },
  enables: (r) => [
    bt.state,
    Ly,
    N.contentAttributes.compute([r], (e) => {
      let t = e.facet(r);
      return t && t.name ? { "data-language": t.name } : {};
    })
  ]
});
class on {
  /**
  Create a language support object.
  */
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
class gs {
  constructor(e, t, i, n, s, o = void 0) {
    this.name = e, this.alias = t, this.extensions = i, this.filename = n, this.loadFunc = s, this.support = o, this.loading = null;
  }
  /**
  Start loading the the language. Will return a promise that
  resolves to a [`LanguageSupport`](https://codemirror.net/6/docs/ref/#language.LanguageSupport)
  object when the language successfully loads.
  */
  load() {
    return this.loading || (this.loading = this.loadFunc().then((e) => this.support = e, (e) => {
      throw this.loading = null, e;
    }));
  }
  /**
  Create a language description.
  */
  static of(e) {
    let { load: t, support: i } = e;
    if (!t) {
      if (!i)
        throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
      t = () => Promise.resolve(i);
    }
    return new gs(e.name, (e.alias || []).concat(e.name).map((n) => n.toLowerCase()), e.extensions || [], e.filename, t, i);
  }
  /**
  Look for a language in the given array of descriptions that
  matches the filename. Will first match
  [`filename`](https://codemirror.net/6/docs/ref/#language.LanguageDescription.filename) patterns,
  and then [extensions](https://codemirror.net/6/docs/ref/#language.LanguageDescription.extensions),
  and return the first language that matches.
  */
  static matchFilename(e, t) {
    for (let n of e)
      if (n.filename && n.filename.test(t))
        return n;
    let i = /\.([^.]+)$/.exec(t);
    if (i) {
      for (let n of e)
        if (n.extensions.indexOf(i[1]) > -1)
          return n;
    }
    return null;
  }
  /**
  Look for a language whose name or alias matches the the given
  name (case-insensitively). If `fuzzy` is true, and no direct
  matchs is found, this'll also search for a language whose name
  or alias occurs in the string (for names shorter than three
  characters, only when surrounded by non-word characters).
  */
  static matchLanguageName(e, t, i = !0) {
    t = t.toLowerCase();
    for (let n of e)
      if (n.alias.some((s) => s == t))
        return n;
    if (i)
      for (let n of e)
        for (let s of n.alias) {
          let o = t.indexOf(s);
          if (o > -1 && (s.length > 2 || !/\w/.test(t[o - 1]) && !/\w/.test(t[o + s.length])))
            return n;
        }
    return null;
  }
}
const Ey = /* @__PURE__ */ q.define(), Ni = /* @__PURE__ */ q.define({
  combine: (r) => {
    if (!r.length)
      return "  ";
    let e = r[0];
    if (!e || /\S/.test(e) || Array.from(e).some((t) => t != e[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(r[0]));
    return e;
  }
});
function ms(r) {
  let e = r.facet(Ni);
  return e.charCodeAt(0) == 9 ? r.tabSize * e.length : e.length;
}
function ys(r, e) {
  let t = "", i = r.tabSize, n = r.facet(Ni)[0];
  if (n == "	") {
    for (; e >= i; )
      t += "	", e -= i;
    n = " ";
  }
  for (let s = 0; s < e; s++)
    t += n;
  return t;
}
function pd(r, e) {
  r instanceof ge && (r = new js(r));
  for (let i of r.state.facet(Ey)) {
    let n = i(r, e);
    if (n !== void 0)
      return n;
  }
  let t = Te(r.state);
  return t.length >= e ? _y(r, t, e) : null;
}
class js {
  /**
  Create an indent context.
  */
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = ms(e);
  }
  /**
  Get a description of the line at the given position, taking
  [simulated line
  breaks](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  into account. If there is such a break at `pos`, the `bias`
  argument determines whether the part of the line line before or
  after the break is used.
  */
  lineAt(e, t = 1) {
    let i = this.state.doc.lineAt(e), { simulateBreak: n, simulateDoubleBreak: s } = this.options;
    return n != null && n >= i.from && n <= i.to ? s && n == e ? { text: "", from: e } : (t < 0 ? n < e : n <= e) ? { text: i.text.slice(n - i.from), from: n } : { text: i.text.slice(0, n - i.from), from: i.from } : i;
  }
  /**
  Get the text directly after `pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: n } = this.lineAt(e, t);
    return i.slice(e - n, Math.min(i.length, e + 100 - n));
  }
  /**
  Find the column for the given position.
  */
  column(e, t = 1) {
    let { text: i, from: n } = this.lineAt(e, t), s = this.countColumn(i, e - n), o = this.options.overrideIndentation ? this.options.overrideIndentation(n) : -1;
    return o > -1 && (s += o - this.countColumn(i, i.search(/\S|$/))), s;
  }
  /**
  Find the column position (taking tabs into account) of the given
  position in the given string.
  */
  countColumn(e, t = e.length) {
    return ri(e, this.state.tabSize, t);
  }
  /**
  Find the indentation column of the line at the given point.
  */
  lineIndent(e, t = 1) {
    let { text: i, from: n } = this.lineAt(e, t), s = this.options.overrideIndentation;
    if (s) {
      let o = s(n);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  /**
  Returns the [simulated line
  break](https://codemirror.net/6/docs/ref/#language.IndentContext.constructor^options.simulateBreak)
  for this context, if any.
  */
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const yn = /* @__PURE__ */ new te();
function _y(r, e, t) {
  let i = e.resolveStack(t), n = e.resolveInner(t, -1).resolve(t, 0).enterUnfinishedNodesBefore(t);
  if (n != i.node) {
    let s = [];
    for (let o = n; o && !(o.from < i.node.from || o.to > i.node.to || o.from == i.node.from && o.type == i.node.type); o = o.parent)
      s.push(o);
    for (let o = s.length - 1; o >= 0; o--)
      i = { node: s[o], next: i };
  }
  return gd(i, r, t);
}
function gd(r, e, t) {
  for (let i = r; i; i = i.next) {
    let n = jy(i.node);
    if (n)
      return n(yl.create(e, t, i));
  }
  return 0;
}
function By(r) {
  return r.pos == r.options.simulateBreak && r.options.simulateDoubleBreak;
}
function jy(r) {
  let e = r.type.prop(yn);
  if (e)
    return e;
  let t = r.firstChild, i;
  if (t && (i = t.type.prop(te.closedBy))) {
    let n = r.lastChild, s = n && i.indexOf(n.name) > -1;
    return (o) => md(o, !0, 1, void 0, s && !By(o) ? n.from : void 0);
  }
  return r.parent == null ? Iy : null;
}
function Iy() {
  return 0;
}
class yl extends js {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.context = i;
  }
  /**
  The syntax tree node to which the indentation strategy
  applies.
  */
  get node() {
    return this.context.node;
  }
  /**
  @internal
  */
  static create(e, t, i) {
    return new yl(e, t, i);
  }
  /**
  Get the text directly after `this.pos`, either the entire line
  or the next 100 characters, whichever is shorter.
  */
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  /**
  Get the indentation at the reference line for `this.node`, which
  is the line on which it starts, unless there is a node that is
  _not_ a parent of this node covering the start of that line. If
  so, the line at the start of that node is tried, again skipping
  on if it is covered by another such node.
  */
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  /**
  Get the indentation for the reference line of the given node
  (see [`baseIndent`](https://codemirror.net/6/docs/ref/#language.TreeIndentContext.baseIndent)).
  */
  baseIndentFor(e) {
    let t = this.state.doc.lineAt(e.from);
    for (; ; ) {
      let i = e.resolve(t.from);
      for (; i.parent && i.parent.from == i.from; )
        i = i.parent;
      if (Wy(i, e))
        break;
      t = this.state.doc.lineAt(i.from);
    }
    return this.lineIndent(t.from);
  }
  /**
  Continue looking for indentations in the node's parent nodes,
  and return the result of that.
  */
  continue() {
    return gd(this.context.next, this.base, this.pos);
  }
}
function Wy(r, e) {
  for (let t = e; t; t = t.parent)
    if (r == t)
      return !0;
  return !1;
}
function Yy(r) {
  let e = r.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let n = r.options.simulateBreak, s = r.state.doc.lineAt(t.from), o = n == null || n <= s.from ? s.to : Math.min(s.to, n);
  for (let a = t.to; ; ) {
    let l = e.childAfter(a);
    if (!l || l == i)
      return null;
    if (!l.type.isSkipped) {
      if (l.from >= o)
        return null;
      let c = /^ */.exec(s.text.slice(t.to - s.from))[0].length;
      return { from: t.from, to: t.to + c };
    }
    a = l.to;
  }
}
function zy({ closing: r, align: e = !0, units: t = 1 }) {
  return (i) => md(i, e, t, r);
}
function md(r, e, t, i, n) {
  let s = r.textAfter, o = s.match(/^\s*/)[0].length, a = i && s.slice(o, o + i.length) == i || n == r.pos + o, l = e ? Yy(r) : null;
  return l ? a ? r.column(l.from) : r.column(l.to) : r.baseIndent + (a ? 0 : r.unit * t);
}
const Dy = (r) => r.baseIndent;
function Kn({ except: r, units: e = 1 } = {}) {
  return (t) => {
    let i = r && r.test(t.textAfter);
    return t.baseIndent + (i ? 0 : e * t.unit);
  };
}
const yd = /* @__PURE__ */ q.define(), wr = /* @__PURE__ */ new te();
function vd(r) {
  let e = r.firstChild, t = r.lastChild;
  return e && e.to < t.from ? { from: e.to, to: t.type.isError ? r.to : t.from } : null;
}
function Vy(r, e, t) {
  let i = Te(r);
  if (i.length < t)
    return null;
  let n = i.resolveStack(t, 1), s = null;
  for (let o = n; o; o = o.next) {
    let a = o.node;
    if (a.to <= t || a.from > t)
      continue;
    if (s && a.from < e)
      break;
    let l = a.type.prop(wr);
    if (l && (a.to < i.length - 50 || i.length == r.doc.length || !Ny(a))) {
      let c = l(a, r);
      c && c.from <= t && c.from >= e && c.to > t && (s = c);
    }
  }
  return s;
}
function Ny(r) {
  let e = r.lastChild;
  return e && e.to == r.to && e.type.isError;
}
function qy(r, e, t) {
  for (let i of r.facet(yd)) {
    let n = i(r, e, t);
    if (n)
      return n;
  }
  return Vy(r, e, t);
}
function Sd(r, e) {
  let t = e.mapPos(r.from, 1), i = e.mapPos(r.to, -1);
  return t >= i ? void 0 : { from: t, to: i };
}
const bd = /* @__PURE__ */ be.define({ map: Sd }), kd = /* @__PURE__ */ be.define({ map: Sd });
function Gy(r) {
  let e = [];
  for (let { head: t } of r.state.selection.ranges)
    e.some((i) => i.from <= t && i.to >= t) || e.push(r.lineBlockAt(t));
  return e;
}
const vl = /* @__PURE__ */ Ke.define({
  create() {
    return ee.none;
  },
  update(r, e) {
    e.isUserEvent("delete") && e.changes.iterChangedRanges((i, n) => r = Rc(r, i, n)), r = r.map(e.changes);
    let t = [];
    for (let i of e.effects)
      i.is(bd) && !Fy(r, i.value.from, i.value.to) ? t.push(i.value) : i.is(kd) && (r = r.update({
        filter: (n, s) => i.value.from != n || i.value.to != s,
        filterFrom: i.value.from,
        filterTo: i.value.to
      }));
    if (t.length) {
      let { preparePlaceholder: i } = e.state.facet(xd), n = t.map((s) => (i ? ee.replace({ widget: new iv(i(e.state, s)) }) : Zc).range(s.from, s.to));
      r = r.update({ add: n });
    }
    return e.selection && (r = Rc(r, e.selection.main.head)), r;
  },
  provide: (r) => N.decorations.from(r),
  toJSON(r, e) {
    let t = [];
    return r.between(0, e.doc.length, (i, n) => {
      t.push(i, n);
    }), t;
  },
  fromJSON(r) {
    if (!Array.isArray(r) || r.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < r.length; ) {
      let i = r[t++], n = r[t++];
      if (typeof i != "number" || typeof n != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(Zc.range(i, n));
    }
    return ee.set(e, !0);
  }
});
function Rc(r, e, t = e) {
  let i = !1;
  return r.between(e, t, (n, s) => {
    n < t && s > e && (i = !0);
  }), i ? r.update({
    filterFrom: e,
    filterTo: t,
    filter: (n, s) => n >= t || s <= e
  }) : r;
}
function Uy(r, e, t) {
  var i;
  let n = null;
  return (i = r.field(vl, !1)) === null || i === void 0 || i.between(e, t, (s, o) => {
    (!n || n.from > s) && (n = { from: s, to: o });
  }), n;
}
function Fy(r, e, t) {
  let i = !1;
  return r.between(e, e, (n, s) => {
    n == e && s == t && (i = !0);
  }), i;
}
function Hy(r, e) {
  return r.field(vl, !1) ? e : e.concat(be.appendConfig.of(tv()));
}
const Ky = (r) => {
  for (let e of Gy(r)) {
    let t = qy(r.state, e.from, e.to);
    if (t)
      return r.dispatch({ effects: Hy(r.state, [bd.of(t), Jy(r, t)]) }), !0;
  }
  return !1;
};
function Jy(r, e, t = !0) {
  let i = r.state.doc.lineAt(e.from).number, n = r.state.doc.lineAt(e.to).number;
  return N.announce.of(`${r.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${i} ${r.state.phrase("to")} ${n}.`);
}
const ev = {
  placeholderDOM: null,
  preparePlaceholder: null,
  placeholderText: "…"
}, xd = /* @__PURE__ */ q.define({
  combine(r) {
    return dn(r, ev);
  }
});
function tv(r) {
  return [vl, rv];
}
function wd(r, e) {
  let { state: t } = r, i = t.facet(xd), n = (o) => {
    let a = r.lineBlockAt(r.posAtDOM(o.target)), l = Uy(r.state, a.from, a.to);
    l && r.dispatch({ effects: kd.of(l) }), o.preventDefault();
  };
  if (i.placeholderDOM)
    return i.placeholderDOM(r, n, e);
  let s = document.createElement("span");
  return s.textContent = i.placeholderText, s.setAttribute("aria-label", t.phrase("folded code")), s.title = t.phrase("unfold"), s.className = "cm-foldPlaceholder", s.onclick = n, s;
}
const Zc = /* @__PURE__ */ ee.replace({ widget: /* @__PURE__ */ new class extends Bt {
  toDOM(r) {
    return wd(r, null);
  }
}() });
class iv extends Bt {
  constructor(e) {
    super(), this.value = e;
  }
  eq(e) {
    return this.value == e.value;
  }
  toDOM(e) {
    return wd(e, this.value);
  }
}
const rv = /* @__PURE__ */ N.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class vn {
  constructor(e, t) {
    this.specs = e;
    let i;
    function n(a) {
      let l = wi.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + l] = a, l;
    }
    const s = typeof t.all == "string" ? t.all : t.all ? n(t.all) : void 0, o = t.scope;
    this.scope = o instanceof bt ? (a) => a.prop(Bi) == o.data : o ? (a) => a == o : void 0, this.style = ud(e.map((a) => ({
      tag: a.tag,
      class: a.class || n(Object.assign({}, a, { tag: null }))
    })), {
      all: s
    }).style, this.module = i ? new wi(i) : null, this.themeType = t.themeType;
  }
  /**
  Create a highlighter style that associates the given styles to
  the given tags. The specs must be objects that hold a style tag
  or array of tags in their `tag` property, and either a single
  `class` property providing a static CSS class (for highlighter
  that rely on external styling), or a
  [`style-mod`](https://code.haverbeke.berlin/marijn/style-mod#documentation)-style
  set of CSS properties (which define the styling for those tags).
  
  The CSS rules created for a highlighter will be emitted in the
  order of the spec's properties. That means that for elements that
  have multiple tags associated with them, styles defined further
  down in the list will have a higher CSS precedence than styles
  defined earlier.
  */
  static define(e, t) {
    return new vn(e, t || {});
  }
}
const Aa = /* @__PURE__ */ q.define(), Qd = /* @__PURE__ */ q.define({
  combine(r) {
    return r.length ? [r[0]] : null;
  }
});
function wo(r) {
  let e = r.facet(Aa);
  return e.length ? e : r.facet(Qd);
}
function Ma(r, e) {
  let t = [sv], i;
  return r instanceof vn && (r.module && t.push(N.styleModule.of(r.module)), i = r.themeType), e?.fallback ? t.push(Qd.of(r)) : i ? t.push(Aa.computeN([N.darkTheme], (n) => n.facet(N.darkTheme) == (i == "dark") ? [r] : [])) : t.push(Aa.of(r)), t;
}
class nv {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Te(e.state), this.decorations = this.buildDeco(e, wo(e.state)), this.decoratedTo = e.viewport.to;
  }
  update(e) {
    let t = Te(e.state), i = wo(e.state), n = i != wo(e.startState), { viewport: s } = e.view, o = e.changes.mapPos(this.decoratedTo, 1);
    t.length < s.to && !n && t.type == this.tree.type && o >= s.to ? (this.decorations = this.decorations.map(e.changes), this.decoratedTo = o) : (t != this.tree || e.viewportChanged || n) && (this.tree = t, this.decorations = this.buildDeco(e.view, i), this.decoratedTo = s.to);
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return ee.none;
    let i = new Ii();
    for (let { from: n, to: s } of e.visibleRanges)
      My(this.tree, t, (o, a, l) => {
        i.add(o, a, this.markCache[l] || (this.markCache[l] = ee.mark({ class: l })));
      }, n, s);
    return i.finish();
  }
}
const sv = /* @__PURE__ */ qi.high(/* @__PURE__ */ Tt.fromClass(nv, {
  decorations: (r) => r.decorations
})), $d = /* @__PURE__ */ vn.define([
  {
    tag: Q.meta,
    color: "#404740"
  },
  {
    tag: Q.link,
    textDecoration: "underline"
  },
  {
    tag: Q.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: Q.emphasis,
    fontStyle: "italic"
  },
  {
    tag: Q.strong,
    fontWeight: "bold"
  },
  {
    tag: Q.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: Q.keyword,
    color: "#708"
  },
  {
    tag: [Q.atom, Q.bool, Q.url, Q.contentSeparator, Q.labelName],
    color: "#219"
  },
  {
    tag: [Q.literal, Q.inserted],
    color: "#164"
  },
  {
    tag: [Q.string, Q.deleted],
    color: "#a11"
  },
  {
    tag: [Q.regexp, Q.escape, /* @__PURE__ */ Q.special(Q.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ Q.definition(Q.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ Q.local(Q.variableName),
    color: "#30a"
  },
  {
    tag: [Q.typeName, Q.namespace],
    color: "#085"
  },
  {
    tag: Q.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ Q.special(Q.variableName), Q.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ Q.definition(Q.propertyName),
    color: "#00c"
  },
  {
    tag: Q.comment,
    color: "#940"
  },
  {
    tag: Q.invalid,
    color: "#f00"
  }
]), ov = 1e4, av = "()[]{}", Pd = /* @__PURE__ */ new te();
function Ra(r, e, t) {
  let i = r.prop(e < 0 ? te.openedBy : te.closedBy);
  if (i)
    return i;
  if (r.name.length == 1) {
    let n = t.indexOf(r.name);
    if (n > -1 && n % 2 == (e < 0 ? 1 : 0))
      return [t[n + e]];
  }
  return null;
}
function Za(r) {
  let e = r.type.prop(Pd);
  return e ? e(r.node) : r;
}
function ki(r, e, t, i = {}) {
  let n = i.maxScanDistance || ov, s = i.brackets || av, o = Te(r), a = o.resolveInner(e, t);
  for (let l = a; l; l = l.parent) {
    let c = Ra(l.type, t, s);
    if (c && l.from < l.to) {
      let u = Za(l);
      if (u && (t > 0 ? e >= u.from && e < u.to : e > u.from && e <= u.to))
        return lv(r, e, t, l, u, c, s);
    }
  }
  return hv(r, e, t, o, a.type, n, s);
}
function lv(r, e, t, i, n, s, o) {
  let a = i.parent, l = { from: n.from, to: n.to }, c = 0, u = a?.cursor();
  if (u && (t < 0 ? u.childBefore(i.from) : u.childAfter(i.to)))
    do
      if (t < 0 ? u.to <= i.from : u.from >= i.to) {
        if (c == 0 && s.indexOf(u.type.name) > -1 && u.from < u.to) {
          let p = Za(u);
          return { start: l, end: p ? { from: p.from, to: p.to } : void 0, matched: !0 };
        } else if (Ra(u.type, t, o))
          c++;
        else if (Ra(u.type, -t, o)) {
          if (c == 0) {
            let p = Za(u);
            return {
              start: l,
              end: p && p.from < p.to ? { from: p.from, to: p.to } : void 0,
              matched: !1
            };
          }
          c--;
        }
      }
    while (t < 0 ? u.prevSibling() : u.nextSibling());
  return { start: l, matched: !1 };
}
function hv(r, e, t, i, n, s, o) {
  if (t < 0 ? !e : e == r.doc.length)
    return null;
  let a = t < 0 ? r.sliceDoc(e - 1, e) : r.sliceDoc(e, e + 1), l = o.indexOf(a);
  if (l < 0 || l % 2 == 0 != t > 0)
    return null;
  let c = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, u = r.doc.iterRange(e, t > 0 ? r.doc.length : 0), p = 0;
  for (let m = 0; !u.next().done && m <= s; ) {
    let v = u.value;
    t < 0 && (m += v.length);
    let b = e + m * t;
    for (let w = t > 0 ? 0 : v.length - 1, C = t > 0 ? v.length : -1; w != C; w += t) {
      let A = o.indexOf(v[w]);
      if (!(A < 0 || i.resolveInner(b + w, 1).type != n))
        if (A % 2 == 0 == t > 0)
          p++;
        else {
          if (p == 1)
            return { start: c, end: { from: b + w, to: b + w + 1 }, matched: A >> 1 == l >> 1 };
          p--;
        }
    }
    t > 0 && (m += v.length);
  }
  return u.done ? { start: c, matched: !1 } : null;
}
function Xc(r, e, t, i = 0, n = 0) {
  e == null && (e = r.search(/[^\s\u00a0]/), e == -1 && (e = r.length));
  let s = n;
  for (let o = i; o < e; o++)
    r.charCodeAt(o) == 9 ? s += t - s % t : s++;
  return s;
}
class cv {
  /**
  Create a stream.
  */
  constructor(e, t, i, n) {
    this.string = e, this.tabSize = t, this.indentUnit = i, this.overrideIndent = n, this.pos = 0, this.start = 0, this.lastColumnPos = 0, this.lastColumnValue = 0;
  }
  /**
  True if we are at the end of the line.
  */
  eol() {
    return this.pos >= this.string.length;
  }
  /**
  True if we are at the start of the line.
  */
  sol() {
    return this.pos == 0;
  }
  /**
  Get the next code unit after the current position, or undefined
  if we're at the end of the line.
  */
  peek() {
    return this.string.charAt(this.pos) || void 0;
  }
  /**
  Read the next code unit and advance `this.pos`.
  */
  next() {
    if (this.pos < this.string.length)
      return this.string.charAt(this.pos++);
  }
  /**
  Match the next character against the given string, regular
  expression, or predicate. Consume and return it if it matches.
  */
  eat(e) {
    let t = this.string.charAt(this.pos), i;
    if (typeof e == "string" ? i = t == e : i = t && (e instanceof RegExp ? e.test(t) : e(t)), i)
      return ++this.pos, t;
  }
  /**
  Continue matching characters that match the given string,
  regular expression, or predicate function. Return true if any
  characters were consumed.
  */
  eatWhile(e) {
    let t = this.pos;
    for (; this.eat(e); )
      ;
    return this.pos > t;
  }
  /**
  Consume whitespace ahead of `this.pos`. Return true if any was
  found.
  */
  eatSpace() {
    let e = this.pos;
    for (; /[\s\u00a0]/.test(this.string.charAt(this.pos)); )
      ++this.pos;
    return this.pos > e;
  }
  /**
  Move to the end of the line.
  */
  skipToEnd() {
    this.pos = this.string.length;
  }
  /**
  Move to directly before the given character, if found on the
  current line.
  */
  skipTo(e) {
    let t = this.string.indexOf(e, this.pos);
    if (t > -1)
      return this.pos = t, !0;
  }
  /**
  Move back `n` characters.
  */
  backUp(e) {
    this.pos -= e;
  }
  /**
  Get the column position at `this.pos`.
  */
  column() {
    return this.lastColumnPos < this.start && (this.lastColumnValue = Xc(this.string, this.start, this.tabSize, this.lastColumnPos, this.lastColumnValue), this.lastColumnPos = this.start), this.lastColumnValue;
  }
  /**
  Get the indentation column of the current line.
  */
  indentation() {
    var e;
    return (e = this.overrideIndent) !== null && e !== void 0 ? e : Xc(this.string, null, this.tabSize);
  }
  /**
  Match the input against the given string or regular expression
  (which should start with a `^`). Return true or the regexp match
  if it matches.
  
  Unless `consume` is set to `false`, this will move `this.pos`
  past the matched text.
  
  When matching a string `caseInsensitive` can be set to true to
  make the match case-insensitive.
  */
  match(e, t, i) {
    if (typeof e == "string") {
      let n = (o) => i ? o.toLowerCase() : o, s = this.string.substr(this.pos, e.length);
      return n(s) == n(e) ? (t !== !1 && (this.pos += e.length), !0) : null;
    } else {
      let n = this.string.slice(this.pos).match(e);
      return n && n.index > 0 ? null : (n && t !== !1 && (this.pos += n[0].length), n);
    }
  }
  /**
  Get the current token.
  */
  current() {
    return this.string.slice(this.start, this.pos);
  }
}
const fv = /* @__PURE__ */ Object.create(null), Lc = [je.none], Ec = [], _c = /* @__PURE__ */ Object.create(null), uv = /* @__PURE__ */ Object.create(null);
for (let [r, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  uv[r] = /* @__PURE__ */ dv(fv, e);
function Qo(r, e) {
  Ec.indexOf(r) > -1 || (Ec.push(r), console.warn(e));
}
function dv(r, e) {
  let t = [];
  for (let a of e.split(" ")) {
    let l = [];
    for (let c of a.split(".")) {
      let u = r[c] || Q[c];
      u ? typeof u == "function" ? l.length ? l = l.map(u) : Qo(c, `Modifier ${c} used at start of tag`) : l.length ? Qo(c, `Tag ${c} used as modifier`) : l = Array.isArray(u) ? u : [u] : Qo(c, `Unknown highlighting tag ${c}`);
    }
    for (let c of l)
      t.push(c);
  }
  if (!t.length)
    return 0;
  let i = e.replace(/ /g, "_"), n = i + " " + t.map((a) => a.id), s = _c[n];
  if (s)
    return s.id;
  let o = _c[n] = je.define({
    id: Lc.length,
    name: i,
    props: [xr({ [i]: t })]
  });
  return Lc.push(o), o.id;
}
Ce.RTL, Ce.LTR;
const Ov = (r) => {
  let { state: e } = r, t = e.doc.lineAt(e.selection.main.from), i = bl(r.state, t.from);
  return i.line ? Cd(r) : i.block ? gv(r) : !1;
};
function Sl(r, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let n = r(e, t);
    return n ? (i(t.update(n)), !0) : !1;
  };
}
const Cd = /* @__PURE__ */ Sl(
  vv,
  0
  /* CommentOption.Toggle */
), pv = /* @__PURE__ */ Sl(
  Td,
  0
  /* CommentOption.Toggle */
), gv = /* @__PURE__ */ Sl(
  (r, e) => Td(r, e, yv(e)),
  0
  /* CommentOption.Toggle */
);
function bl(r, e) {
  let t = r.languageDataAt("commentTokens", e, 1);
  return t.length ? t[0] : {};
}
const Xr = 50;
function mv(r, { open: e, close: t }, i, n) {
  let s = r.sliceDoc(i - Xr, i), o = r.sliceDoc(n, n + Xr), a = /\s*$/.exec(s)[0].length, l = /^\s*/.exec(o)[0].length, c = s.length - a;
  if (s.slice(c - e.length, c) == e && o.slice(l, l + t.length) == t)
    return {
      open: { pos: i - a, margin: a && 1 },
      close: { pos: n + l, margin: l && 1 }
    };
  let u, p;
  n - i <= 2 * Xr ? u = p = r.sliceDoc(i, n) : (u = r.sliceDoc(i, i + Xr), p = r.sliceDoc(n - Xr, n));
  let m = /^\s*/.exec(u)[0].length, v = /\s*$/.exec(p)[0].length, b = p.length - v - t.length;
  return u.slice(m, m + e.length) == e && p.slice(b, b + t.length) == t ? {
    open: {
      pos: i + m + e.length,
      margin: /\s/.test(u.charAt(m + e.length)) ? 1 : 0
    },
    close: {
      pos: n - v - t.length,
      margin: /\s/.test(p.charAt(b - 1)) ? 1 : 0
    }
  } : null;
}
function yv(r) {
  let e = [];
  for (let t of r.selection.ranges) {
    let i = r.doc.lineAt(t.from), n = t.to <= i.to ? i : r.doc.lineAt(t.to);
    n.from > i.from && n.from == t.to && (n = t.to == i.to + 1 ? i : r.doc.lineAt(t.to - 1));
    let s = e.length - 1;
    s >= 0 && e[s].to > i.from ? e[s].to = n.to : e.push({ from: i.from + /^\s*/.exec(i.text)[0].length, to: n.to });
  }
  return e;
}
function Td(r, e, t = e.selection.ranges) {
  let i = t.map((s) => bl(e, s.from).block);
  if (!i.every((s) => s))
    return null;
  let n = t.map((s, o) => mv(e, i[o], s.from, s.to));
  if (r != 2 && !n.every((s) => s))
    return { changes: e.changes(t.map((s, o) => n[o] ? [] : [{ from: s.from, insert: i[o].open + " " }, { from: s.to, insert: " " + i[o].close }])) };
  if (r != 1 && n.some((s) => s)) {
    let s = [];
    for (let o = 0, a; o < n.length; o++)
      if (a = n[o]) {
        let l = i[o], { open: c, close: u } = a;
        s.push({ from: c.pos - l.open.length, to: c.pos + c.margin }, { from: u.pos - u.margin, to: u.pos + l.close.length });
      }
    return { changes: s };
  }
  return null;
}
function vv(r, e, t = e.selection.ranges) {
  let i = [], n = -1;
  e: for (let { from: s, to: o } of t) {
    let a = i.length, l = 1e9, c;
    for (let u = s; u <= o; ) {
      let p = e.doc.lineAt(u);
      if (c == null && (c = bl(e, p.from).line, !c))
        continue e;
      if (p.from > n && (s == o || o > p.from)) {
        n = p.from;
        let m = /^\s*/.exec(p.text)[0].length, v = m == p.length, b = p.text.slice(m, m + c.length) == c ? m : -1;
        m < p.text.length && m < l && (l = m), i.push({ line: p, comment: b, token: c, indent: m, empty: v, single: !1 });
      }
      u = p.to + 1;
    }
    if (l < 1e9)
      for (let u = a; u < i.length; u++)
        i[u].indent < i[u].line.text.length && (i[u].indent = l);
    i.length == a + 1 && (i[a].single = !0);
  }
  if (r != 2 && i.some((s) => s.comment < 0 && (!s.empty || s.single))) {
    let s = [];
    for (let { line: a, token: l, indent: c, empty: u, single: p } of i)
      (p || !u) && s.push({ from: a.from + c, insert: l + " " });
    let o = e.changes(s);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (r != 1 && i.some((s) => s.comment >= 0)) {
    let s = [];
    for (let { line: o, comment: a, token: l } of i)
      if (a >= 0) {
        let c = o.from + a, u = c + l.length;
        o.text[u - o.from] == " " && u++, s.push({ from: c, to: u });
      }
    return { changes: s };
  }
  return null;
}
const Xa = /* @__PURE__ */ ui.define(), Sv = /* @__PURE__ */ ui.define(), bv = /* @__PURE__ */ q.define(), Ad = /* @__PURE__ */ q.define({
  combine(r) {
    return dn(r, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (e, t) => t
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (e, t) => (i, n) => e(i, n) || t(i, n)
    });
  }
}), Md = /* @__PURE__ */ Ke.define({
  create() {
    return ti.empty;
  },
  update(r, e) {
    let t = e.state.facet(Ad), i = e.annotation(Xa);
    if (i) {
      let l = Ot.fromTransaction(e, i.selection), c = i.side, u = c == 0 ? r.undone : r.done;
      return l ? u = Ss(u, u.length, t.minDepth, l) : u = Zd(u, e.startState.selection), new ti(c == 0 ? i.rest : u, c == 0 ? u : i.rest);
    }
    let n = e.annotation(Sv);
    if ((n == "full" || n == "before") && (r = r.isolate()), e.annotation(_e.addToHistory) === !1)
      return e.changes.empty ? r : r.addMapping(e.changes.desc);
    let s = Ot.fromTransaction(e), o = e.annotation(_e.time), a = e.annotation(_e.userEvent);
    return s ? r = r.addChanges(s, o, a, t, e) : e.selection && (r = r.addSelection(e.startState.selection, o, a, t.newGroupDelay)), (n == "full" || n == "after") && (r = r.isolate()), r;
  },
  toJSON(r) {
    return { done: r.done.map((e) => e.toJSON()), undone: r.undone.map((e) => e.toJSON()) };
  },
  fromJSON(r) {
    return new ti(r.done.map(Ot.fromJSON), r.undone.map(Ot.fromJSON));
  }
});
function kv(r = {}) {
  return [
    Md,
    Ad.of(r),
    N.domEventHandlers({
      beforeinput(e, t) {
        let i = e.inputType == "historyUndo" ? kl : e.inputType == "historyRedo" ? vs : null;
        return i ? (e.preventDefault(), i(t)) : !1;
      }
    })
  ];
}
function Is(r, e) {
  return function({ state: t, dispatch: i }) {
    if (!e && t.readOnly)
      return !1;
    let n = t.field(Md, !1);
    if (!n)
      return !1;
    let s = n.pop(r, t, e);
    return s ? (i(s), !0) : !1;
  };
}
const kl = /* @__PURE__ */ Is(0, !1), vs = /* @__PURE__ */ Is(1, !1), xv = /* @__PURE__ */ Is(0, !0), wv = /* @__PURE__ */ Is(1, !0);
class Ot {
  constructor(e, t, i, n, s) {
    this.changes = e, this.effects = t, this.mapped = i, this.startSelection = n, this.selectionsAfter = s;
  }
  setSelAfter(e) {
    return new Ot(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, i;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((n) => n.toJSON())
    };
  }
  static fromJSON(e) {
    return new Ot(e.changes && Be.fromJSON(e.changes), [], e.mapped && ii.fromJSON(e.mapped), e.startSelection && L.fromJSON(e.startSelection), e.selectionsAfter.map(L.fromJSON));
  }
  // This does not check `addToHistory` and such, it assumes the
  // transaction needs to be converted to an item. Returns null when
  // there are no changes or effects in the transaction.
  static fromTransaction(e, t) {
    let i = Ct;
    for (let n of e.startState.facet(bv)) {
      let s = n(e);
      s.length && (i = i.concat(s));
    }
    return !i.length && e.changes.empty ? null : new Ot(e.changes.invert(e.startState.doc), i, void 0, t || e.startState.selection, Ct);
  }
  static selection(e) {
    return new Ot(void 0, Ct, void 0, void 0, e);
  }
}
function Ss(r, e, t, i) {
  let n = e + 1 > t + 20 ? e - t - 1 : 0, s = r.slice(n, e);
  return s.push(i), s;
}
function Qv(r, e) {
  let t = [], i = !1;
  return r.iterChangedRanges((n, s) => t.push(n, s)), e.iterChangedRanges((n, s, o, a) => {
    for (let l = 0; l < t.length; ) {
      let c = t[l++], u = t[l++];
      a >= c && o <= u && (i = !0);
    }
  }), i;
}
function $v(r, e) {
  return r.ranges.length == e.ranges.length && r.ranges.filter((t, i) => t.empty != e.ranges[i].empty).length === 0;
}
function Rd(r, e) {
  return r.length ? e.length ? r.concat(e) : r : e;
}
const Ct = [], Pv = 200;
function Zd(r, e) {
  if (r.length) {
    let t = r[r.length - 1], i = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - Pv));
    return i.length && i[i.length - 1].eq(e) ? r : (i.push(e), Ss(r, r.length - 1, 1e9, t.setSelAfter(i)));
  } else
    return [Ot.selection([e])];
}
function Cv(r) {
  let e = r[r.length - 1], t = r.slice();
  return t[r.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function $o(r, e) {
  if (!r.length)
    return r;
  let t = r.length, i = Ct;
  for (; t; ) {
    let n = Tv(r[t - 1], e, i);
    if (n.changes && !n.changes.empty || n.effects.length) {
      let s = r.slice(0, t);
      return s[t - 1] = n, s;
    } else
      e = n.mapped, t--, i = n.selectionsAfter;
  }
  return i.length ? [Ot.selection(i)] : Ct;
}
function Tv(r, e, t) {
  let i = Rd(r.selectionsAfter.length ? r.selectionsAfter.map((a) => a.map(e)) : Ct, t);
  if (!r.changes)
    return Ot.selection(i);
  let n = r.changes.map(e), s = e.mapDesc(r.changes, !0), o = r.mapped ? r.mapped.composeDesc(s) : s;
  return new Ot(n, be.mapEffects(r.effects, e), o, r.startSelection.map(s), i);
}
const Av = /^(input\.type|delete)($|\.)/;
class ti {
  constructor(e, t, i = 0, n = void 0) {
    this.done = e, this.undone = t, this.prevTime = i, this.prevUserEvent = n;
  }
  isolate() {
    return this.prevTime ? new ti(this.done, this.undone) : this;
  }
  addChanges(e, t, i, n, s) {
    let o = this.done, a = o[o.length - 1];
    return a && a.changes && !a.changes.empty && e.changes && (!i || Av.test(i)) && (!a.selectionsAfter.length && t - this.prevTime < n.newGroupDelay && n.joinToEvent(s, Qv(a.changes, e.changes)) || // For compose (but not compose.start) events, always join with previous event
    i == "input.type.compose") ? o = Ss(o, o.length - 1, n.minDepth, new Ot(e.changes.compose(a.changes), Rd(be.mapEffects(e.effects, a.changes), a.effects), a.mapped, a.startSelection, Ct)) : o = Ss(o, o.length, n.minDepth, e), new ti(o, Ct, t, i);
  }
  addSelection(e, t, i, n) {
    let s = this.done.length ? this.done[this.done.length - 1].selectionsAfter : Ct;
    return s.length > 0 && t - this.prevTime < n && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && $v(s[s.length - 1], e) ? this : new ti(Zd(this.done, e), this.undone, t, i);
  }
  addMapping(e) {
    return new ti($o(this.done, e), $o(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, i) {
    let n = e == 0 ? this.done : this.undone;
    if (n.length == 0)
      return null;
    let s = n[n.length - 1], o = s.selectionsAfter[0] || (s.startSelection ? s.startSelection.map(s.changes.invertedDesc, 1) : t.selection);
    if (i && s.selectionsAfter.length)
      return t.update({
        selection: s.selectionsAfter[s.selectionsAfter.length - 1],
        annotations: Xa.of({ side: e, rest: Cv(n), selection: o }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (s.changes) {
      let a = n.length == 1 ? Ct : n.slice(0, n.length - 1);
      return s.mapped && (a = $o(a, s.mapped)), t.update({
        changes: s.changes,
        selection: s.startSelection,
        effects: s.effects,
        annotations: Xa.of({ side: e, rest: a, selection: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
ti.empty = /* @__PURE__ */ new ti(Ct, Ct);
const Mv = [
  { key: "Mod-z", run: kl, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: vs, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: vs, preventDefault: !0 },
  { key: "Mod-u", run: xv, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: wv, preventDefault: !0 }
];
function Qr(r, e) {
  return L.create(r.ranges.map(e), r.mainIndex);
}
function jt(r, e) {
  return r.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function It({ state: r, dispatch: e }, t) {
  let i = Qr(r.selection, t);
  return i.eq(r.selection, !0) ? !1 : (e(jt(r, i)), !0);
}
function Ws(r, e) {
  return L.cursor(e ? r.to : r.from);
}
function xl(r, e) {
  return It(r, (t) => t.empty ? r.moveByChar(t, e) : Ws(t, e));
}
function rt(r) {
  return r.textDirectionAt(r.state.selection.main.head) == Ce.LTR;
}
const wl = (r) => xl(r, !rt(r)), Xd = (r) => xl(r, rt(r)), Rv = (r) => xl(r, !1);
function Ld(r, e) {
  return It(r, (t) => t.empty ? r.moveByGroup(t, e) : Ws(t, e));
}
const Zv = (r) => Ld(r, !rt(r)), Xv = (r) => Ld(r, rt(r));
function Lv(r, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(r.sliceDoc(e.from, e.to))) || e.firstChild;
}
function Ys(r, e, t) {
  let i = Te(r).resolveInner(e.head), n = t ? te.closedBy : te.openedBy;
  for (let l = e.head; ; ) {
    let c = t ? i.childAfter(l) : i.childBefore(l);
    if (!c)
      break;
    Lv(r, c, n) ? i = c : l = t ? c.to : c.from;
  }
  let s = i.type.prop(n), o, a;
  return s && (o = t ? ki(r, i.from, 1) : ki(r, i.to, -1)) && o.matched ? a = t ? o.end.to : o.end.from : a = t ? i.to : i.from, L.cursor(a, t ? -1 : 1);
}
const Ev = (r) => It(r, (e) => Ys(r.state, e, !rt(r))), _v = (r) => It(r, (e) => Ys(r.state, e, rt(r)));
function Ed(r, e) {
  return It(r, (t) => {
    if (!t.empty)
      return Ws(t, e);
    let i = r.moveVertically(t, e);
    return i.head != t.head ? i : r.moveToLineBoundary(t, e);
  });
}
const _d = (r) => Ed(r, !1), Bd = (r) => Ed(r, !0);
function jd(r) {
  let e = r.scrollDOM.clientHeight < r.scrollDOM.scrollHeight - 2, t = 0, i = 0, n;
  if (e) {
    for (let s of r.state.facet(N.scrollMargins)) {
      let o = s(r);
      o?.top && (t = Math.max(o?.top, t)), o?.bottom && (i = Math.max(o?.bottom, i));
    }
    n = r.scrollDOM.clientHeight - t - i;
  } else
    n = (r.dom.ownerDocument.defaultView || window).innerHeight;
  return {
    marginTop: t,
    marginBottom: i,
    selfScroll: e,
    height: Math.max(r.defaultLineHeight, n - 5)
  };
}
function Id(r, e) {
  let t = jd(r), { state: i } = r, n = Qr(i.selection, (o) => o.empty ? r.moveVertically(o, e, t.height) : Ws(o, e));
  if (n.eq(i.selection))
    return !1;
  let s;
  if (t.selfScroll) {
    let o = r.coordsAtPos(i.selection.main.head), a = r.scrollDOM.getBoundingClientRect(), l = a.top + t.marginTop, c = a.bottom - t.marginBottom;
    o && o.top > l && o.bottom < c && (s = N.scrollIntoView(n.main.head, { y: "start", yMargin: o.top - l }));
  }
  return r.dispatch(jt(i, n), { effects: s }), !0;
}
const Bc = (r) => Id(r, !1), La = (r) => Id(r, !0);
function Ci(r, e, t) {
  let i = r.lineBlockAt(e.head), n = r.moveToLineBoundary(e, t);
  if (n.head == e.head && n.head != (t ? i.to : i.from) && (n = r.moveToLineBoundary(e, t, !1)), !t && n.head == i.from && i.length) {
    let s = /^\s*/.exec(r.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    s && e.head != i.from + s && (n = L.cursor(i.from + s));
  }
  return n;
}
const Wd = (r) => It(r, (e) => Ci(r, e, !0)), Yd = (r) => It(r, (e) => Ci(r, e, !1)), Bv = (r) => It(r, (e) => Ci(r, e, !rt(r))), jv = (r) => It(r, (e) => Ci(r, e, rt(r))), Iv = (r) => It(r, (e) => L.cursor(r.lineBlockAt(e.head).from, 1)), Wv = (r) => It(r, (e) => L.cursor(r.lineBlockAt(e.head).to, -1));
function Yv(r, e, t) {
  let i = !1, n = Qr(r.selection, (s) => {
    let o = ki(r, s.head, -1) || ki(r, s.head, 1) || s.head > 0 && ki(r, s.head - 1, 1) || s.head < r.doc.length && ki(r, s.head + 1, -1);
    if (!o || !o.end)
      return s;
    i = !0;
    let a = o.start.from == s.head ? o.end.to : o.end.from;
    return L.cursor(a);
  });
  return i ? (e(jt(r, n)), !0) : !1;
}
const zv = ({ state: r, dispatch: e }) => Yv(r, e);
function At(r, e, t) {
  let i = Qr(r.state.selection, (n) => {
    n.undirectional && n.head >= n.anchor != e && (n = L.range(n.head, n.anchor));
    let s = t(n);
    return L.range(n.anchor, s.head, s.goalColumn, s.bidiLevel || void 0, s.assoc);
  });
  return i.eq(r.state.selection) ? !1 : (r.dispatch(jt(r.state, i)), !0);
}
function zd(r, e) {
  return At(r, e, (t) => r.moveByChar(t, e));
}
const Dd = (r) => zd(r, !rt(r)), Vd = (r) => zd(r, rt(r));
function Nd(r, e) {
  return At(r, e, (t) => r.moveByGroup(t, e));
}
const Dv = (r) => Nd(r, !rt(r)), Vv = (r) => Nd(r, rt(r)), Nv = (r) => {
  let e = !rt(r);
  return At(r, e, (t) => Ys(r.state, t, e));
}, qv = (r) => {
  let e = rt(r);
  return At(r, e, (t) => Ys(r.state, t, e));
};
function qd(r, e) {
  return At(r, e, (t) => r.moveVertically(t, e));
}
const Gd = (r) => qd(r, !1), Ud = (r) => qd(r, !0);
function Fd(r, e) {
  return At(r, e, (t) => r.moveVertically(t, e, jd(r).height));
}
const jc = (r) => Fd(r, !1), Ic = (r) => Fd(r, !0), Gv = (r) => At(r, !0, (e) => Ci(r, e, !0)), Uv = (r) => At(r, !1, (e) => Ci(r, e, !1)), Fv = (r) => {
  let e = !rt(r);
  return At(r, e, (t) => Ci(r, t, e));
}, Hv = (r) => {
  let e = rt(r);
  return At(r, e, (t) => Ci(r, t, e));
}, Kv = (r) => At(r, !1, (e) => L.cursor(r.lineBlockAt(e.head).from)), Jv = (r) => At(r, !0, (e) => L.cursor(r.lineBlockAt(e.head).to)), Wc = ({ state: r, dispatch: e }) => (e(jt(r, { anchor: 0 })), !0), Yc = ({ state: r, dispatch: e }) => (e(jt(r, { anchor: r.doc.length })), !0), zc = ({ state: r, dispatch: e }) => (e(jt(r, { anchor: r.selection.main.anchor, head: 0 })), !0), Dc = ({ state: r, dispatch: e }) => (e(jt(r, { anchor: r.selection.main.anchor, head: r.doc.length })), !0), e1 = ({ state: r, dispatch: e }) => (e(r.update({ selection: { anchor: 0, head: r.doc.length }, userEvent: "select" })), !0), t1 = ({ state: r, dispatch: e }) => {
  let t = zs(r).map(({ from: i, to: n }) => L.range(i, Math.min(n + 1, r.doc.length)));
  return e(r.update({ selection: L.create(t), userEvent: "select" })), !0;
}, i1 = ({ state: r, dispatch: e }) => {
  let t = Qr(r.selection, (i) => {
    let n = Te(r), s = n.resolveStack(i.from, 1);
    if (i.empty) {
      let o = n.resolveStack(i.from, -1);
      o.node.from >= s.node.from && o.node.to <= s.node.to && (s = o);
    }
    for (let o = s; o; o = o.next) {
      let { node: a } = o;
      if ((a.from < i.from && a.to >= i.to || a.to > i.to && a.from <= i.from) && o.next)
        return L.range(a.to, a.from);
    }
    return i;
  });
  return t.eq(r.selection) ? !1 : (e(jt(r, t)), !0);
};
function Hd(r, e) {
  let { state: t } = r, i = t.selection, n = t.selection.ranges.slice();
  for (let s of t.selection.ranges) {
    let o = t.doc.lineAt(s.head);
    if (e ? o.to < r.state.doc.length : o.from > 0)
      for (let a = s; ; ) {
        let l = r.moveVertically(a, e);
        if (l.head < o.from || l.head > o.to) {
          n.some((c) => c.head == l.head) || n.push(l);
          break;
        } else {
          if (l.head == a.head)
            break;
          a = l;
        }
      }
  }
  return n.length == i.ranges.length ? !1 : (r.dispatch(jt(t, L.create(n, n.length - 1))), !0);
}
const r1 = (r) => Hd(r, !1), n1 = (r) => Hd(r, !0), s1 = ({ state: r, dispatch: e }) => {
  let t = r.selection, i = null;
  return t.ranges.length > 1 ? i = L.create([t.main]) : t.main.empty || (i = L.create([L.cursor(t.main.head)])), i ? (e(jt(r, i)), !0) : !1;
};
function Sn(r, e) {
  if (r.state.readOnly)
    return !1;
  let t = "delete.selection", { state: i } = r, n = i.changeByRange((s) => {
    let { from: o, to: a } = s;
    if (o == a) {
      let l = e(s);
      l < o ? (t = "delete.backward", l = Wn(r, l, !1)) : l > o && (t = "delete.forward", l = Wn(r, l, !0)), o = Math.min(o, l), a = Math.max(a, l);
    } else
      o = Wn(r, o, !1), a = Wn(r, a, !0);
    return o == a ? { range: s } : { changes: { from: o, to: a }, range: L.cursor(o, o < s.head ? -1 : 1) };
  });
  return n.changes.empty ? !1 : (r.dispatch(i.update(n, {
    scrollIntoView: !0,
    userEvent: t,
    effects: t == "delete.selection" ? N.announce.of(i.phrase("Selection deleted")) : void 0
  })), !0);
}
function Wn(r, e, t) {
  if (r instanceof N)
    for (let i of r.state.facet(N.atomicRanges).map((n) => n(r)))
      i.between(e, e, (n, s) => {
        n < e && s > e && (e = t ? s : n);
      });
  return e;
}
const Kd = (r, e, t) => Sn(r, (i) => {
  let n = i.from, { state: s } = r, o = s.doc.lineAt(n), a, l;
  if (t && !e && n > o.from && n < o.from + 200 && !/[^ \t]/.test(a = o.text.slice(0, n - o.from))) {
    if (a[a.length - 1] == "	")
      return n - 1;
    let c = ri(a, s.tabSize), u = c % ms(s) || ms(s);
    for (let p = 0; p < u && a[a.length - 1 - p] == " "; p++)
      n--;
    l = n;
  } else
    l = We(o.text, n - o.from, e, e) + o.from, l == n && o.number != (e ? s.doc.lines : 1) ? l += e ? 1 : -1 : !e && /[\ufe00-\ufe0f]/.test(o.text.slice(l - o.from, n - o.from)) && (l = We(o.text, l - o.from, !1, !1) + o.from);
  return l;
}), Ea = (r) => Kd(r, !1, !0), Jd = (r) => Kd(r, !0, !1), eO = (r, e) => Sn(r, (t) => {
  let i = t.head, { state: n } = r, s = n.doc.lineAt(i), o = n.charCategorizer(i);
  for (let a = null; ; ) {
    if (i == (e ? s.to : s.from)) {
      i == t.head && s.number != (e ? n.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let l = We(s.text, i - s.from, e) + s.from, c = s.text.slice(Math.min(i, l) - s.from, Math.max(i, l) - s.from), u = o(c);
    if (a != null && u != a)
      break;
    (c != " " || i != t.head) && (a = u), i = l;
  }
  return i;
}), tO = (r) => eO(r, !1), o1 = (r) => eO(r, !0), a1 = (r) => Sn(r, (e) => {
  let t = r.lineBlockAt(e.head).to;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), l1 = (r) => Sn(r, (e) => {
  let t = r.moveToLineBoundary(e, !1).head;
  return e.head > t ? t : Math.max(0, e.head - 1);
}), h1 = (r) => Sn(r, (e) => {
  let t = r.moveToLineBoundary(e, !0).head;
  return e.head < t ? t : Math.min(r.state.doc.length, e.head + 1);
}), c1 = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: me.of(["", ""]) },
    range: L.cursor(i.from)
  }));
  return e(r.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, f1 = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = r.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == r.doc.length)
      return { range: i };
    let n = i.from, s = r.doc.lineAt(n), o = n == s.from ? n - 1 : We(s.text, n - s.from, !1) + s.from, a = n == s.to ? n + 1 : We(s.text, n - s.from, !0) + s.from;
    return {
      changes: { from: o, to: a, insert: r.doc.slice(n, a).append(r.doc.slice(o, n)) },
      range: L.cursor(a)
    };
  });
  return t.changes.empty ? !1 : (e(r.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function zs(r) {
  let e = [], t = -1;
  for (let i of r.selection.ranges) {
    let n = r.doc.lineAt(i.from), s = r.doc.lineAt(i.to);
    if (!i.empty && i.to == s.from && (s = r.doc.lineAt(i.to - 1)), t >= n.number) {
      let o = e[e.length - 1];
      o.to = s.to, o.ranges.push(i);
    } else
      e.push({ from: n.from, to: s.to, ranges: [i] });
    t = s.number + 1;
  }
  return e;
}
function iO(r, e, t) {
  if (r.readOnly)
    return !1;
  let i = [], n = [];
  for (let s of zs(r)) {
    if (t ? s.to == r.doc.length : s.from == 0)
      continue;
    let o = r.doc.lineAt(t ? s.to + 1 : s.from - 1), a = o.length + 1;
    if (t) {
      i.push({ from: s.to, to: o.to }, { from: s.from, insert: o.text + r.lineBreak });
      for (let l of s.ranges)
        n.push(L.range(Math.min(r.doc.length, l.anchor + a), Math.min(r.doc.length, l.head + a)));
    } else {
      i.push({ from: o.from, to: s.from }, { from: s.to, insert: r.lineBreak + o.text });
      for (let l of s.ranges)
        n.push(L.range(l.anchor - a, l.head - a));
    }
  }
  return i.length ? (e(r.update({
    changes: i,
    scrollIntoView: !0,
    selection: L.create(n, r.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const u1 = ({ state: r, dispatch: e }) => iO(r, e, !1), d1 = ({ state: r, dispatch: e }) => iO(r, e, !0);
function rO(r, e, t) {
  if (r.readOnly)
    return !1;
  let i = [];
  for (let s of zs(r))
    t ? i.push({ from: s.from, insert: r.doc.slice(s.from, s.to) + r.lineBreak }) : i.push({ from: s.to, insert: r.lineBreak + r.doc.slice(s.from, s.to) });
  let n = r.changes(i);
  return e(r.update({
    changes: n,
    selection: r.selection.map(n, t ? 1 : -1),
    scrollIntoView: !0,
    userEvent: "input.copyline"
  })), !0;
}
const O1 = ({ state: r, dispatch: e }) => rO(r, e, !1), p1 = ({ state: r, dispatch: e }) => rO(r, e, !0), g1 = (r) => {
  if (r.state.readOnly)
    return !1;
  let { state: e } = r, t = e.changes(zs(e).map(({ from: n, to: s }) => (n > 0 ? n-- : s < e.doc.length && s++, { from: n, to: s }))), i = Qr(e.selection, (n) => {
    let s;
    if (r.lineWrapping) {
      let o = r.lineBlockAt(n.head), a = r.coordsAtPos(n.head, n.assoc || 1);
      a && (s = o.bottom + r.documentTop - a.bottom + r.defaultLineHeight / 2);
    }
    return r.moveVertically(n, !0, s);
  }).map(t);
  return r.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function m1(r, e) {
  if (/\(\)|\[\]|\{\}/.test(r.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Te(r).resolveInner(e), i = t.childBefore(e), n = t.childAfter(e), s;
  return i && n && i.to <= e && n.from >= e && (s = i.type.prop(te.closedBy)) && s.indexOf(n.name) > -1 && r.doc.lineAt(i.to).from == r.doc.lineAt(n.from).from && !/\S/.test(r.sliceDoc(i.to, n.from)) ? { from: i.to, to: n.from } : null;
}
const _a = /* @__PURE__ */ nO(!1), y1 = /* @__PURE__ */ nO(!0);
function nO(r) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((n) => {
      let { from: s, to: o } = n, a = e.doc.lineAt(s), l = !r && s == o && m1(e, s);
      r && (s = o = (o <= a.to ? a : e.doc.lineAt(o)).to);
      let c = new js(e, { simulateBreak: s, simulateDoubleBreak: !!l }), u = pd(c, s);
      for (u == null && (u = ri(/^\s*/.exec(e.doc.lineAt(s).text)[0], e.tabSize)); o < a.to && /\s/.test(a.text[o - a.from]); )
        o++;
      l ? { from: s, to: o } = l : s > a.from && s < a.from + 100 && !/\S/.test(a.text.slice(0, s)) && (s = a.from);
      let p = ["", ys(e, u)];
      return l && p.push(ys(e, c.lineIndent(a.from, -1))), {
        changes: { from: s, to: o, insert: me.of(p) },
        range: L.cursor(s + 1 + p[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Ql(r, e) {
  let t = -1;
  return r.changeByRange((i) => {
    let n = [];
    for (let o = i.from; o <= i.to; ) {
      let a = r.doc.lineAt(o);
      a.number > t && (i.empty || i.to > a.from) && (e(a, n, i), t = a.number), o = a.to + 1;
    }
    let s = r.changes(n);
    return {
      changes: n,
      range: L.range(s.mapPos(i.anchor, 1), s.mapPos(i.head, 1))
    };
  });
}
const sO = ({ state: r, dispatch: e }) => {
  if (r.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new js(r, { overrideIndentation: (s) => {
    let o = t[s];
    return o ?? -1;
  } }), n = Ql(r, (s, o, a) => {
    let l = pd(i, s.from);
    if (l == null)
      return;
    /\S/.test(s.text) || (l = 0);
    let c = /^\s*/.exec(s.text)[0], u = ys(r, l);
    (c != u || a.from < s.from + c.length) && (t[s.from] = l, o.push({ from: s.from, to: s.from + c.length, insert: u }));
  });
  return n.changes.empty || e(r.update(n, { userEvent: "indent" })), !0;
}, oO = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Ql(r, (t, i) => {
  i.push({ from: t.from, insert: r.facet(Ni) });
}), { userEvent: "input.indent" })), !0), aO = ({ state: r, dispatch: e }) => r.readOnly ? !1 : (e(r.update(Ql(r, (t, i) => {
  let n = /^\s*/.exec(t.text)[0];
  if (!n)
    return;
  let s = ri(n, r.tabSize), o = 0, a = ys(r, Math.max(0, s - ms(r)));
  for (; o < n.length && o < a.length && n.charCodeAt(o) == a.charCodeAt(o); )
    o++;
  i.push({ from: t.from + o, to: t.from + n.length, insert: a.slice(o) });
}), { userEvent: "delete.dedent" })), !0), v1 = (r) => (r.setTabFocusMode(), !0), S1 = [
  { key: "Ctrl-b", run: wl, shift: Dd, preventDefault: !0 },
  { key: "Ctrl-f", run: Xd, shift: Vd },
  { key: "Ctrl-p", run: _d, shift: Gd },
  { key: "Ctrl-n", run: Bd, shift: Ud },
  { key: "Ctrl-a", run: Iv, shift: Kv },
  { key: "Ctrl-e", run: Wv, shift: Jv },
  { key: "Ctrl-d", run: Jd },
  { key: "Ctrl-h", run: Ea },
  { key: "Ctrl-k", run: a1 },
  { key: "Ctrl-Alt-h", run: tO },
  { key: "Ctrl-o", run: c1 },
  { key: "Ctrl-t", run: f1 },
  { key: "Ctrl-v", run: La }
], b1 = /* @__PURE__ */ [
  { key: "ArrowLeft", run: wl, shift: Dd, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: Zv, shift: Dv, preventDefault: !0 },
  { mac: "Cmd-ArrowLeft", run: Bv, shift: Fv, preventDefault: !0 },
  { key: "ArrowRight", run: Xd, shift: Vd, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: Xv, shift: Vv, preventDefault: !0 },
  { mac: "Cmd-ArrowRight", run: jv, shift: Hv, preventDefault: !0 },
  { key: "ArrowUp", run: _d, shift: Gd, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Wc, shift: zc },
  { mac: "Ctrl-ArrowUp", run: Bc, shift: jc },
  { key: "ArrowDown", run: Bd, shift: Ud, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Yc, shift: Dc },
  { mac: "Ctrl-ArrowDown", run: La, shift: Ic },
  { key: "PageUp", run: Bc, shift: jc },
  { key: "PageDown", run: La, shift: Ic },
  { key: "Home", run: Yd, shift: Uv, preventDefault: !0 },
  { key: "Mod-Home", run: Wc, shift: zc },
  { key: "End", run: Wd, shift: Gv, preventDefault: !0 },
  { key: "Mod-End", run: Yc, shift: Dc },
  { key: "Enter", run: _a, shift: _a },
  { key: "Mod-a", run: e1 },
  { key: "Backspace", run: Ea, shift: Ea, preventDefault: !0 },
  { key: "Delete", run: Jd, preventDefault: !0 },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: tO, preventDefault: !0 },
  { key: "Mod-Delete", mac: "Alt-Delete", run: o1, preventDefault: !0 },
  { mac: "Mod-Backspace", run: l1, preventDefault: !0 },
  { mac: "Mod-Delete", run: h1, preventDefault: !0 }
].concat(/* @__PURE__ */ S1.map((r) => ({ mac: r.key, run: r.run, shift: r.shift }))), k1 = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: Ev, shift: Nv },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: _v, shift: qv },
  { key: "Alt-ArrowUp", run: u1 },
  { key: "Shift-Alt-ArrowUp", run: O1 },
  { key: "Alt-ArrowDown", run: d1 },
  { key: "Shift-Alt-ArrowDown", run: p1 },
  { key: "Mod-Alt-ArrowUp", run: r1 },
  { key: "Mod-Alt-ArrowDown", run: n1 },
  { key: "Escape", run: s1 },
  { key: "Mod-Enter", run: y1 },
  { key: "Alt-l", mac: "Ctrl-l", run: t1 },
  { key: "Mod-i", run: i1, preventDefault: !0 },
  { key: "Mod-[", run: aO },
  { key: "Mod-]", run: oO },
  { key: "Mod-Alt-\\", run: sO },
  { key: "Shift-Mod-k", run: g1 },
  { key: "Shift-Mod-\\", run: zv },
  { key: "Mod-/", run: Ov },
  { key: "Alt-A", run: pv },
  { key: "Ctrl-m", mac: "Shift-Alt-m", run: v1 }
].concat(b1), Vc = typeof String.prototype.normalize == "function" ? (r) => r.normalize("NFKD") : (r) => r;
class lO {
  /**
  Create a text cursor. The query is the search string, `from` to
  `to` provides the region to search.
  
  When `normalize` is given, it will be called, on both the query
  string and the content it is matched against, before comparing.
  You can, for example, create a case-insensitive search by
  passing `s => s.toLowerCase()`.
  
  Text is always normalized with
  [`.normalize("NFKD")`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize)
  (when supported).
  */
  constructor(e, t, i = 0, n = e.length, s, o) {
    this.test = o, this.value = { from: 0, to: 0, precise: !1 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = e.iterRange(i, n), this.bufferStart = i, this.normalize = s ? (a) => s(Vc(a)) : Vc, this.query = this.normalize(t);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return Ha(this.buffer, this.bufferPos);
  }
  /**
  Look for the next match. Updates the iterator's
  [`value`](https://codemirror.net/6/docs/ref/#search.SearchCursor.value) and
  [`done`](https://codemirror.net/6/docs/ref/#search.SearchCursor.done) properties. Should be called
  at least once before using the cursor.
  */
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  /**
  The `next` method will ignore matches that partially overlap a
  previous match. This method behaves like `next`, but includes
  such matches.
  */
  nextOverlapping() {
    for (; ; ) {
      let e = this.peek();
      if (e < 0)
        return this.done = !0, this;
      let t = Lg(e), i = this.bufferStart + this.bufferPos;
      this.bufferPos += qf(e);
      let n = this.normalize(t);
      if (n.length)
        for (let s = 0, o = i, a = !0; ; s++) {
          let l = n.charCodeAt(s), c = this.match(l, o, a, this.bufferPos + this.bufferStart, s == n.length - 1);
          if (c)
            return this.value = c, this;
          if (s == n.length - 1)
            break;
          a && s < t.length && t.charCodeAt(s) == l ? o++ : a = !1;
        }
    }
  }
  match(e, t, i, n, s) {
    let o = null;
    for (let a = 0; a < this.matches.length; ) {
      let l = this.matches[a], c = !1;
      this.query.charCodeAt(l.index) == e && (l.index == this.query.length - 1 ? o = { from: l.from, to: n, precise: s && l.precise } : (l.index++, c = !0)), c ? a++ : this.matches.splice(a, 1);
    }
    return this.query.charCodeAt(0) == e && (this.query.length == 1 ? o = { from: t, to: n, precise: i && s } : this.matches.push({ from: t, index: 1, precise: i })), o && this.test && !this.test(o.from, o.to, this.buffer, this.bufferStart) && (o = null), o;
  }
}
typeof Symbol < "u" && (lO.prototype[Symbol.iterator] = function() {
  return this;
});
const hO = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec(""), precise: !0 }, $l = "gm" + (/x/.unicode == null ? "" : "u");
class Pl {
  /**
  Create a cursor that will search the given range in the given
  document. `query` should be the raw pattern (as you'd pass it to
  `new RegExp`).
  */
  constructor(e, t, i, n = 0, s = e.length) {
    if (this.text = e, this.to = s, this.curLine = "", this.done = !1, this.value = hO, /\\[sWDnr]|\n|\r|\[\^/.test(t))
      return new cO(e, t, i, n, s);
    this.re = new RegExp(t, $l + (i?.ignoreCase ? "i" : "")), this.test = i?.test, this.iter = e.iter();
    let o = e.lineAt(n);
    this.curLineStart = o.from, this.matchPos = bs(e, n), this.getLine(this.curLineStart);
  }
  getLine(e) {
    this.iter.next(e), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  /**
  Move to the next match, if there is one.
  */
  next() {
    for (let e = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = e;
      let t = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (t) {
        let i = this.curLineStart + t.index, n = i + t[0].length;
        if (this.matchPos = bs(this.text, n + (i == n ? 1 : 0)), i == this.curLineStart + this.curLine.length && this.nextLine(), (i < n || i > this.value.to) && (!this.test || this.test(i, n, t)))
          return this.value = { from: i, to: n, precise: !0, match: t }, this;
        e = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), e = 0;
      else
        return this.done = !0, this;
    }
  }
}
const Po = /* @__PURE__ */ new WeakMap();
class hr {
  constructor(e, t) {
    this.from = e, this.text = t;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(e, t, i) {
    let n = Po.get(e);
    if (!n || n.from >= i || n.to <= t) {
      let a = new hr(t, e.sliceString(t, i));
      return Po.set(e, a), a;
    }
    if (n.from == t && n.to == i)
      return n;
    let { text: s, from: o } = n;
    return o > t && (s = e.sliceString(t, o) + s, o = t), n.to < i && (s += e.sliceString(n.to, i)), Po.set(e, new hr(o, s)), new hr(t, s.slice(t - o, i - o));
  }
}
class cO {
  constructor(e, t, i, n, s) {
    this.text = e, this.to = s, this.done = !1, this.value = hO, this.matchPos = bs(e, n), this.re = new RegExp(t, $l + (i?.ignoreCase ? "i" : "")), this.test = i?.test, this.flat = hr.get(e, n, this.chunkEnd(
      n + 5e3
      /* Chunk.Base */
    ));
  }
  chunkEnd(e) {
    return e >= this.to ? this.to : this.text.lineAt(e).to;
  }
  next() {
    for (; ; ) {
      let e = this.re.lastIndex = this.matchPos - this.flat.from, t = this.re.exec(this.flat.text);
      if (t && !t[0] && t.index == e && (this.re.lastIndex = e + 1, t = this.re.exec(this.flat.text)), t) {
        let i = this.flat.from + t.index, n = i + t[0].length;
        if ((this.flat.to >= this.to || t.index + t[0].length <= this.flat.text.length - 10) && (!this.test || this.test(i, n, t)))
          return this.value = { from: i, to: n, precise: !0, match: t }, this.matchPos = bs(this.text, n + (i == n ? 1 : 0)), this;
      }
      if (this.flat.to == this.to)
        return this.done = !0, this;
      this.flat = hr.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
    }
  }
}
typeof Symbol < "u" && (Pl.prototype[Symbol.iterator] = cO.prototype[Symbol.iterator] = function() {
  return this;
});
function x1(r) {
  try {
    return new RegExp(r, $l), !0;
  } catch {
    return !1;
  }
}
function bs(r, e) {
  if (e >= r.length)
    return e;
  let t = r.lineAt(e), i;
  for (; e < t.to && (i = t.text.charCodeAt(e - t.from)) >= 56320 && i < 57344; )
    e++;
  return e;
}
class w1 {
  /**
  Create a query object.
  */
  constructor(e) {
    this.search = e.search, this.caseSensitive = !!e.caseSensitive, this.literal = !!e.literal, this.regexp = !!e.regexp, this.replace = e.replace || "", this.valid = !!this.search && (!this.regexp || x1(this.search)), this.unquoted = this.unquote(this.search), this.wholeWord = !!e.wholeWord, this.test = e.test;
  }
  /**
  @internal
  */
  unquote(e) {
    return this.literal ? e : e.replace(/\\([nrt\\])/g, (t, i) => i == "n" ? `
` : i == "r" ? "\r" : i == "t" ? "	" : "\\");
  }
  /**
  Compare this query to another query.
  */
  eq(e) {
    return this.search == e.search && this.replace == e.replace && this.caseSensitive == e.caseSensitive && this.regexp == e.regexp && this.wholeWord == e.wholeWord && this.test == e.test;
  }
  /**
  @internal
  */
  create() {
    return this.regexp ? new A1(this) : new P1(this);
  }
  /**
  Get a search cursor for this query, searching through the given
  range in the given state.
  */
  getCursor(e, t = 0, i) {
    let n = e.doc ? e : ge.create({ doc: e });
    return i == null && (i = n.doc.length), this.regexp ? tr(this, n, t, i) : er(this, n, t, i);
  }
}
class fO {
  constructor(e) {
    this.spec = e;
  }
}
function Q1(r, e, t) {
  return (i, n, s, o) => {
    if (t && !t(i, n, s, o))
      return !1;
    let a = i >= o && n <= o + s.length ? s.slice(i - o, n - o) : e.doc.sliceString(i, n);
    return r(a, e, i, n);
  };
}
function er(r, e, t, i) {
  let n;
  return r.wholeWord && (n = $1(e.doc, e.charCategorizer(e.selection.main.head))), r.test && (n = Q1(r.test, e, n)), new lO(e.doc, r.unquoted, t, i, r.caseSensitive ? void 0 : (s) => s.toLowerCase(), n);
}
function $1(r, e) {
  return (t, i, n, s) => ((s > t || s + n.length < i) && (s = Math.max(0, t - 2), n = r.sliceString(s, Math.min(r.length, i + 2))), (e(ks(n, t - s)) != Fe.Word || e(xs(n, t - s)) != Fe.Word) && (e(xs(n, i - s)) != Fe.Word || e(ks(n, i - s)) != Fe.Word));
}
class P1 extends fO {
  constructor(e) {
    super(e);
  }
  nextMatch(e, t, i) {
    let n = er(this.spec, e, i, e.doc.length).nextOverlapping();
    if (n.done) {
      let s = Math.min(e.doc.length, t + this.spec.unquoted.length);
      n = er(this.spec, e, 0, s).nextOverlapping();
    }
    return n.done || n.value.from == t && n.value.to == i ? null : n.value;
  }
  // Searching in reverse is, rather than implementing an inverted search
  // cursor, done by scanning chunk after chunk forward.
  prevMatchInRange(e, t, i) {
    for (let n = i; ; ) {
      let s = Math.max(t, n - 1e4 - this.spec.unquoted.length), o = er(this.spec, e, s, n), a = null;
      for (; !o.nextOverlapping().done; )
        a = o.value;
      if (a)
        return a;
      if (s == t)
        return null;
      n -= 1e4;
    }
  }
  prevMatch(e, t, i) {
    let n = this.prevMatchInRange(e, 0, t);
    return n || (n = this.prevMatchInRange(e, Math.max(0, i - this.spec.unquoted.length), e.doc.length)), n && (n.from != t || n.to != i) ? n : null;
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace);
  }
  matchAll(e, t) {
    let i = er(this.spec, e, 0, e.doc.length), n = [];
    for (; !i.next().done; ) {
      if (n.length >= t)
        return null;
      n.push(i.value);
    }
    return n;
  }
  highlight(e, t, i, n) {
    let s = er(this.spec, e, Math.max(0, t - this.spec.unquoted.length), Math.min(i + this.spec.unquoted.length, e.doc.length));
    for (; !s.next().done; )
      n(s.value.from, s.value.to);
  }
}
function C1(r, e, t) {
  return (i, n, s) => (!t || t(i, n, s)) && r(s[0], e, i, n);
}
function tr(r, e, t, i) {
  let n;
  return r.wholeWord && (n = T1(e.charCategorizer(e.selection.main.head))), r.test && (n = C1(r.test, e, n)), new Pl(e.doc, r.search, { ignoreCase: !r.caseSensitive, test: n }, t, i);
}
function ks(r, e) {
  return r.slice(We(r, e, !1), e);
}
function xs(r, e) {
  return r.slice(e, We(r, e));
}
function T1(r) {
  return (e, t, i) => !i[0].length || (r(ks(i.input, i.index)) != Fe.Word || r(xs(i.input, i.index)) != Fe.Word) && (r(xs(i.input, i.index + i[0].length)) != Fe.Word || r(ks(i.input, i.index + i[0].length)) != Fe.Word);
}
class A1 extends fO {
  nextMatch(e, t, i) {
    let n = tr(this.spec, e, i, e.doc.length).next();
    return n.done && (n = tr(this.spec, e, 0, t).next()), n.done ? null : n.value;
  }
  prevMatchInRange(e, t, i) {
    for (let n = 1; ; n++) {
      let s = Math.max(
        t,
        i - n * 1e4
        /* FindPrev.ChunkSize */
      ), o = tr(this.spec, e, s, i), a = null;
      for (; !o.next().done; )
        a = o.value;
      if (a && (s == t || a.from > s + 10))
        return a;
      if (s == t)
        return null;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.doc.length);
  }
  getReplacement(e) {
    return this.spec.unquote(this.spec.replace).replace(/\$([$&]|\d+)/g, (t, i) => {
      if (i == "&")
        return e.match[0];
      if (i == "$")
        return "$";
      for (let n = i.length; n > 0; n--) {
        let s = +i.slice(0, n);
        if (s > 0 && s < e.match.length)
          return e.match[s] + i.slice(n);
      }
      return t;
    });
  }
  matchAll(e, t) {
    let i = tr(this.spec, e, 0, e.doc.length), n = [];
    for (; !i.next().done; ) {
      if (n.length >= t)
        return null;
      n.push(i.value);
    }
    return n;
  }
  highlight(e, t, i, n) {
    let s = tr(this.spec, e, Math.max(
      0,
      t - 250
      /* RegExp.HighlightMargin */
    ), Math.min(i + 250, e.doc.length));
    for (; !s.next().done; )
      n(s.value.from, s.value.to);
  }
}
const Ba = /* @__PURE__ */ be.define();
class M1 {
  /**
  Create a new completion context. (Mostly useful for testing
  completion sources—in the editor, the extension will create
  these for you.)
  */
  constructor(e, t, i, n) {
    this.state = e, this.pos = t, this.explicit = i, this.view = n, this.abortListeners = [], this.abortOnDocChange = !1;
  }
  /**
  Get the extent, content, and (if there is a token) type of the
  token before `this.pos`.
  */
  tokenBefore(e) {
    let t = Te(this.state).resolveInner(this.pos, -1);
    for (; t && e.indexOf(t.name) < 0; )
      t = t.parent;
    return t ? {
      from: t.from,
      to: this.pos,
      text: this.state.sliceDoc(t.from, this.pos),
      type: t.type
    } : null;
  }
  /**
  Get the match of the given expression directly before the
  cursor.
  */
  matchBefore(e) {
    let t = this.state.doc.lineAt(this.pos), i = Math.max(t.from, this.pos - 250), n = t.text.slice(i - t.from, this.pos - t.from), s = n.search(L1(e));
    return s < 0 ? null : { from: i + s, to: this.pos, text: n.slice(s) };
  }
  /**
  Yields true when the query has been aborted. Can be useful in
  asynchronous queries to avoid doing work that will be ignored.
  */
  get aborted() {
    return this.abortListeners == null;
  }
  /**
  Allows you to register abort handlers, which will be called when
  the query is
  [aborted](https://codemirror.net/6/docs/ref/#autocomplete.CompletionContext.aborted).
  
  By default, running queries will not be aborted for regular
  typing or backspacing, on the assumption that they are likely to
  return a result with a
  [`validFor`](https://codemirror.net/6/docs/ref/#autocomplete.CompletionResult.validFor) field that
  allows the result to be used after all. Passing `onDocChange:
  true` will cause this query to be aborted for any document
  change.
  */
  addEventListener(e, t, i) {
    e == "abort" && this.abortListeners && (this.abortListeners.push(t), i && i.onDocChange && (this.abortOnDocChange = !0));
  }
}
function Nc(r) {
  let e = Object.keys(r).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function R1(r) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: n } of r) {
    e[n[0]] = !0;
    for (let s = 1; s < n.length; s++)
      t[n[s]] = !0;
  }
  let i = Nc(e) + Nc(t) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function Z1(r) {
  let e = r.map((n) => typeof n == "string" ? { label: n } : n), [t, i] = e.every((n) => /^\w+$/.test(n.label)) ? [/\w*$/, /\w+$/] : R1(e);
  return (n) => {
    let s = n.matchBefore(i);
    return s || n.explicit ? { from: s ? s.from : n.pos, options: e, validFor: t } : null;
  };
}
function X1(r, e) {
  return (t) => {
    for (let i = Te(t.state).resolveInner(t.pos, -1); i; i = i.parent) {
      if (r.indexOf(i.name) > -1)
        return null;
      if (i.type.isTop)
        break;
    }
    return e(t);
  };
}
function L1(r, e) {
  var t;
  let { source: i } = r, n = i[i.length - 1] != "$";
  return n ? new RegExp(`(?:${i})${n ? "$" : ""}`, (t = r.flags) !== null && t !== void 0 ? t : r.ignoreCase ? "i" : "") : r;
}
const E1 = /* @__PURE__ */ ui.define(), _1 = /* @__PURE__ */ N.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"···"',
    opacity: 0.5,
    display: "block",
    textAlign: "center",
    cursor: "pointer"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
    boxSizing: "border-box",
    whiteSpace: "pre-line"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: "30px" },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: "30px" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'ƒ'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'○'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'◌'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'𝑥'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'𝐶'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'𝑡'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'∪'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'□'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'🔑︎'" }
    // Disable emoji rendering
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'▢'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class B1 {
  constructor(e, t, i, n) {
    this.field = e, this.line = t, this.from = i, this.to = n;
  }
}
class Cl {
  constructor(e, t, i) {
    this.field = e, this.from = t, this.to = i;
  }
  map(e) {
    let t = e.mapPos(this.from, -1, Ue.TrackDel), i = e.mapPos(this.to, 1, Ue.TrackDel);
    return t == null || i == null ? null : new Cl(this.field, t, i);
  }
}
class Tl {
  constructor(e, t) {
    this.lines = e, this.fieldPositions = t;
  }
  instantiate(e, t) {
    let i = [], n = [t], s = e.doc.lineAt(t), o = /^\s*/.exec(s.text)[0];
    for (let l of this.lines) {
      if (i.length) {
        let c = o, u = /^\t*/.exec(l)[0].length;
        for (let p = 0; p < u; p++)
          c += e.facet(Ni);
        n.push(t + c.length - u), l = c + l.slice(u);
      }
      i.push(l), t += l.length + 1;
    }
    let a = this.fieldPositions.map((l) => new Cl(l.field, n[l.line] + l.from, n[l.line] + l.to));
    return { text: i, ranges: a };
  }
  static parse(e) {
    let t = [], i = [], n = [], s;
    for (let o of e.split(/\r\n?|\n/)) {
      for (; s = /[#$]\{(?:(\d+)(?::([^{}]*))?|((?:\\[{}]|[^{}])*))\}/.exec(o); ) {
        let a = s[1] ? +s[1] : null, l = s[2] || s[3] || "", c = -1;
        a === 0 && (a = 1e9);
        let u = l.replace(/\\[{}]/g, (p) => p[1]);
        for (let p = 0; p < t.length; p++)
          (a != null ? t[p].seq == a : u && t[p].name == u) && (c = p);
        if (c < 0) {
          let p = 0;
          for (; p < t.length && (a == null || t[p].seq != null && t[p].seq < a); )
            p++;
          t.splice(p, 0, { seq: a, name: u }), c = p;
          for (let m of n)
            m.field >= c && m.field++;
        }
        for (let p of n)
          if (p.line == i.length && p.from > s.index) {
            let m = s[2] ? 3 + (s[1] || "").length : 2;
            p.from -= m, p.to -= m;
          }
        n.push(new B1(c, i.length, s.index, s.index + u.length)), o = o.slice(0, s.index) + l + o.slice(s.index + s[0].length);
      }
      o = o.replace(/\\([{}])/g, (a, l, c) => {
        for (let u of n)
          u.line == i.length && u.from > c && (u.from--, u.to--);
        return l;
      }), i.push(o);
    }
    return new Tl(i, n);
  }
}
let j1 = /* @__PURE__ */ ee.widget({ widget: /* @__PURE__ */ new class extends Bt {
  toDOM() {
    let r = document.createElement("span");
    return r.className = "cm-snippetFieldPosition", r;
  }
  ignoreEvent() {
    return !1;
  }
}() }), I1 = /* @__PURE__ */ ee.mark({ class: "cm-snippetField" });
class $r {
  constructor(e, t) {
    this.ranges = e, this.active = t, this.deco = ee.set(e.map((i) => (i.from == i.to ? j1 : I1).range(i.from, i.to)), !0);
  }
  map(e) {
    let t = [];
    for (let i of this.ranges) {
      let n = i.map(e);
      if (!n)
        return null;
      t.push(n);
    }
    return new $r(t, this.active);
  }
  selectionInsideField(e) {
    return e.ranges.every((t) => this.ranges.some((i) => i.field == this.active && i.from <= t.from && i.to >= t.to));
  }
}
const bn = /* @__PURE__ */ be.define({
  map(r, e) {
    return r && r.map(e);
  }
}), W1 = /* @__PURE__ */ be.define(), an = /* @__PURE__ */ Ke.define({
  create() {
    return null;
  },
  update(r, e) {
    for (let t of e.effects) {
      if (t.is(bn))
        return t.value;
      if (t.is(W1) && r)
        return new $r(r.ranges, t.value);
    }
    return r && e.docChanged && (r = r.map(e.changes)), r && e.selection && !r.selectionInsideField(e.selection) && (r = null), r;
  },
  provide: (r) => N.decorations.from(r, (e) => e ? e.deco : ee.none)
});
function Al(r, e) {
  return L.create(r.filter((t) => t.field == e).map((t) => L.range(t.from, t.to)));
}
function Y1(r) {
  let e = Tl.parse(r);
  return (t, i, n, s) => {
    let { text: o, ranges: a } = e.instantiate(t.state, n), { main: l } = t.state.selection, c = {
      changes: { from: n, to: s == l.from ? l.to : s, insert: me.of(o) },
      scrollIntoView: !0,
      annotations: i ? [E1.of(i), _e.userEvent.of("input.complete")] : void 0
    };
    if (a.length && (c.selection = Al(a, 0)), a.some((u) => u.field > 0)) {
      let u = new $r(a, 0), p = c.effects = [bn.of(u)];
      t.state.field(an, !1) === void 0 && p.push(be.appendConfig.of([an, q1, G1, _1]));
    }
    t.dispatch(t.state.update(c));
  };
}
function uO(r) {
  return ({ state: e, dispatch: t }) => {
    let i = e.field(an, !1);
    if (!i || r < 0 && i.active == 0)
      return !1;
    let n = i.active + r, s = r > 0 && !i.ranges.some((o) => o.field == n + r);
    return t(e.update({
      selection: Al(i.ranges, n),
      effects: bn.of(s ? null : new $r(i.ranges, n)),
      scrollIntoView: !0
    })), !0;
  };
}
const z1 = ({ state: r, dispatch: e }) => r.field(an, !1) ? (e(r.update({ effects: bn.of(null) })), !0) : !1, D1 = /* @__PURE__ */ uO(1), V1 = /* @__PURE__ */ uO(-1), N1 = [
  { key: "Tab", run: D1, shift: V1 },
  { key: "Escape", run: z1 }
], qc = /* @__PURE__ */ q.define({
  combine(r) {
    return r.length ? r[0] : N1;
  }
}), q1 = /* @__PURE__ */ qi.highest(/* @__PURE__ */ Bs.compute([qc], (r) => r.facet(qc)));
function ut(r, e) {
  return { ...e, apply: Y1(r) };
}
const G1 = /* @__PURE__ */ N.domEventHandlers({
  mousedown(r, e) {
    let t = e.state.field(an, !1), i;
    if (!t || (i = e.posAtCoords({ x: r.clientX, y: r.clientY })) == null)
      return !1;
    let n = t.ranges.find((s) => s.from <= i && s.to >= i);
    return !n || n.field == t.active ? !1 : (e.dispatch({
      selection: Al(t.ranges, n.field),
      effects: bn.of(t.ranges.some((s) => s.field > n.field) ? new $r(t.ranges, n.field) : null),
      scrollIntoView: !0
    }), !0);
  }
}), dO = /* @__PURE__ */ new class extends xi {
}();
dO.startSide = 1;
dO.endSide = -1;
const U1 = [
  H0(),
  kv(),
  W0(),
  Ma($d, { fallback: !0 }),
  Bs.of([
    ...k1,
    ...Mv
  ])
];
class ws {
  /**
  @internal
  */
  constructor(e, t, i, n, s, o, a, l, c, u = 0, p) {
    this.p = e, this.stack = t, this.state = i, this.reducePos = n, this.pos = s, this.score = o, this.buffer = a, this.bufferBase = l, this.curContext = c, this.lookAhead = u, this.parent = p;
  }
  /**
  @internal
  */
  toString() {
    return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /**
  @internal
  */
  static start(e, t, i = 0) {
    let n = e.parser.context;
    return new ws(e, [], t, i, i, 0, [], 0, n ? new Gc(n, n.start) : null, 0, null);
  }
  /**
  The stack's current [context](#lr.ContextTracker) value, if
  any. Its type will depend on the context tracker's type
  parameter, or it will be `null` if there is no context
  tracker.
  */
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /**
  @internal
  */
  pushState(e, t) {
    this.stack.push(this.state, t, this.bufferBase + this.buffer.length), this.state = e;
  }
  // Apply a reduce action
  /**
  @internal
  */
  reduce(e) {
    var t;
    let i = e >> 19, n = e & 65535, { parser: s } = this.p, o = this.reducePos < this.pos - 25 && this.setLookAhead(this.pos), a = s.dynamicPrecedence(n);
    if (a && (this.score += a), i == 0) {
      n < s.minRepeatTerm && this.reducePos < this.pos && (this.reducePos = this.pos), this.pushState(s.getGoto(this.state, n, !0), this.reducePos), n < s.minRepeatTerm && this.storeNode(n, this.reducePos, this.reducePos, o ? 8 : 4, !0), this.reduceContext(n, this.reducePos);
      return;
    }
    let l = this.stack.length - (i - 1) * 3 - (e & 262144 ? 6 : 0), c = l ? this.stack[l - 2] : this.p.ranges[0].from;
    n < s.minRepeatTerm && c == this.reducePos && this.reducePos < this.pos && (this.reducePos = this.pos);
    let u = this.reducePos - c;
    u >= 2e3 && !(!((t = this.p.parser.nodeSet.types[n]) === null || t === void 0) && t.isAnonymous) && (c == this.p.lastBigReductionStart ? (this.p.bigReductionCount++, this.p.lastBigReductionSize = u) : this.p.lastBigReductionSize < u && (this.p.bigReductionCount = 1, this.p.lastBigReductionStart = c, this.p.lastBigReductionSize = u));
    let p = l ? this.stack[l - 1] : 0, m = this.bufferBase + this.buffer.length - p;
    if (n < s.minRepeatTerm || e & 131072) {
      let v = s.stateFlag(
        this.state,
        1
        /* StateFlag.Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(n, c, v, m + 4, !0);
    }
    if (e & 262144)
      this.state = this.stack[l];
    else {
      let v = this.stack[l - 3];
      this.state = s.getGoto(v, n, !0);
    }
    for (; this.stack.length > l; )
      this.stack.pop();
    this.reduceContext(n, c);
  }
  // Shift a value into the buffer
  /**
  @internal
  */
  storeNode(e, t, i, n = 4, s = !1) {
    if (e == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let o = this.buffer.length;
      if (o > 0 && this.buffer[o - 4] == 0 && this.buffer[o - 1] > -1) {
        if (t == i)
          return;
        if (this.buffer[o - 2] >= t) {
          this.buffer[o - 2] = i;
          return;
        }
      }
    }
    if (!s || this.pos == i)
      this.buffer.push(e, t, i, n);
    else {
      let o = this.buffer.length;
      if (o > 0 && (this.buffer[o - 4] != 0 || this.buffer[o - 1] < 0)) {
        let a = !1;
        for (let l = o; l > 0 && this.buffer[l - 2] > i; l -= 4)
          if (this.buffer[l - 1] >= 0) {
            a = !0;
            break;
          }
        if (a)
          for (; o > 0 && this.buffer[o - 2] > i; )
            this.buffer[o] = this.buffer[o - 4], this.buffer[o + 1] = this.buffer[o - 3], this.buffer[o + 2] = this.buffer[o - 2], this.buffer[o + 3] = this.buffer[o - 1], o -= 4, n > 4 && (n -= 4);
      }
      this.buffer[o] = e, this.buffer[o + 1] = t, this.buffer[o + 2] = i, this.buffer[o + 3] = n;
    }
  }
  // Apply a shift action
  /**
  @internal
  */
  shift(e, t, i, n) {
    if (e & 131072)
      this.pushState(e & 65535, this.pos);
    else if ((e & 262144) == 0) {
      let s = e, { parser: o } = this.p;
      this.pos = n;
      let a = o.stateFlag(
        s,
        1
        /* StateFlag.Skipped */
      );
      !a && (n > i || t <= o.maxNode) && (this.reducePos = n), this.pushState(s, a ? i : Math.min(i, this.reducePos)), this.shiftContext(t, i), t <= o.maxNode && this.buffer.push(t, i, n, 4);
    } else
      this.pos = n, this.shiftContext(t, i), t <= this.p.parser.maxNode && this.buffer.push(t, i, n, 4);
  }
  // Apply an action
  /**
  @internal
  */
  apply(e, t, i, n) {
    e & 65536 ? this.reduce(e) : this.shift(e, t, i, n);
  }
  // Add a prebuilt (reused) node into the buffer.
  /**
  @internal
  */
  useNode(e, t) {
    let i = this.p.reused.length - 1;
    (i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
    let n = this.pos;
    this.reducePos = this.pos = n + e.length, this.pushState(t, n), this.buffer.push(
      i,
      n,
      this.reducePos,
      -1
      /* size == -1 means this is a reused value */
    ), this.curContext && this.updateContext(this.curContext.tracker.reuse(this.curContext.context, e, this, this.p.stream.reset(this.pos - e.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /**
  @internal
  */
  split() {
    let e = this, t = e.buffer.length;
    for (t && e.buffer[t - 4] == 0 && (t -= 4); t > 0 && e.buffer[t - 2] > e.reducePos; )
      t -= 4;
    let i = e.buffer.slice(t), n = e.bufferBase + t;
    for (; e && n == e.bufferBase; )
      e = e.parent;
    return new ws(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, i, n, this.curContext, this.lookAhead, e);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /**
  @internal
  */
  recoverByDelete(e, t) {
    let i = e <= this.p.parser.maxNode;
    i && this.storeNode(e, this.pos, t, 4), this.storeNode(0, this.pos, t, i ? 8 : 4), this.pos = this.reducePos = t, this.score -= 190;
  }
  /**
  Check if the given term would be able to be shifted (optionally
  after some reductions) on this stack. This can be useful for
  external tokenizers that want to make sure they only provide a
  given token when it applies.
  */
  canShift(e) {
    for (let t = new F1(this); ; ) {
      let i = this.p.parser.stateSlot(
        t.state,
        4
        /* ParseState.DefaultReduce */
      ) || this.p.parser.hasAction(t.state, e);
      if (i == 0)
        return !1;
      if ((i & 65536) == 0)
        return !0;
      t.reduce(i);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /**
  @internal
  */
  recoverByInsert(e) {
    if (this.stack.length >= 300)
      return [];
    let t = this.p.parser.nextStates(this.state);
    if (t.length > 8 || this.stack.length >= 120) {
      let n = [];
      for (let s = 0, o; s < t.length; s += 2)
        (o = t[s + 1]) != this.state && this.p.parser.hasAction(o, e) && n.push(t[s], o);
      if (this.stack.length < 120)
        for (let s = 0; n.length < 8 && s < t.length; s += 2) {
          let o = t[s + 1];
          n.some((a, l) => l & 1 && a == o) || n.push(t[s], o);
        }
      t = n;
    }
    let i = [];
    for (let n = 0; n < t.length && i.length < 4; n += 2) {
      let s = t[n + 1];
      if (s == this.state)
        continue;
      let o = this.split();
      o.pushState(s, this.pos), o.storeNode(0, o.pos, o.pos, 4, !0), o.shiftContext(t[n], this.pos), o.reducePos = this.pos, o.score -= 200, i.push(o);
    }
    return i;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /**
  @internal
  */
  forceReduce() {
    let { parser: e } = this.p, t = e.stateSlot(
      this.state,
      5
      /* ParseState.ForcedReduce */
    );
    if ((t & 65536) == 0)
      return !1;
    if (!e.validAction(this.state, t)) {
      let i = t >> 19, n = t & 65535, s = this.stack.length - i * 3;
      if (s < 0 || e.getGoto(this.stack[s], n, !1) < 0) {
        let o = this.findForcedReduction();
        if (o == null)
          return !1;
        t = o;
      }
      this.storeNode(0, this.pos, this.pos, 4, !0), this.score -= 100;
    }
    return this.reducePos = this.pos, this.reduce(t), !0;
  }
  /**
  Try to scan through the automaton to find some kind of reduction
  that can be applied. Used when the regular ForcedReduce field
  isn't a valid action. @internal
  */
  findForcedReduction() {
    let { parser: e } = this.p, t = [], i = (n, s) => {
      if (!t.includes(n))
        return t.push(n), e.allActions(n, (o) => {
          if (!(o & 393216)) if (o & 65536) {
            let a = (o >> 19) - s;
            if (a > 1) {
              let l = o & 65535, c = this.stack.length - a * 3;
              if (c >= 0 && e.getGoto(this.stack[c], l, !1) >= 0)
                return a << 19 | 65536 | l;
            }
          } else {
            let a = i(o, s + 1);
            if (a != null)
              return a;
          }
        });
    };
    return i(this.state, 0);
  }
  /**
  @internal
  */
  forceAll() {
    for (; !this.p.parser.stateFlag(
      this.state,
      2
      /* StateFlag.Accepting */
    ); )
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, !0);
        break;
      }
    return this;
  }
  /**
  Check whether this state has no further actions (assumed to be a direct descendant of the
  top state, since any other states must be able to continue
  somehow). @internal
  */
  get deadEnd() {
    if (this.stack.length != 3)
      return !1;
    let { parser: e } = this.p;
    return e.data[e.stateSlot(
      this.state,
      1
      /* ParseState.Actions */
    )] == 65535 && !e.stateSlot(
      this.state,
      4
      /* ParseState.DefaultReduce */
    );
  }
  /**
  Restart the stack (put it back in its start state). Only safe
  when this.stack.length == 3 (state is directly below the top
  state). @internal
  */
  restart() {
    this.storeNode(0, this.pos, this.pos, 4, !0), this.state = this.stack[0], this.stack.length = 0;
  }
  /**
  @internal
  */
  sameState(e) {
    if (this.state != e.state || this.stack.length != e.stack.length)
      return !1;
    for (let t = 0; t < this.stack.length; t += 3)
      if (this.stack[t] != e.stack[t])
        return !1;
    return !0;
  }
  /**
  Get the parser used by this stack.
  */
  get parser() {
    return this.p.parser;
  }
  /**
  Test whether a given dialect (by numeric ID, as exported from
  the terms file) is enabled.
  */
  dialectEnabled(e) {
    return this.p.parser.dialect.flags[e];
  }
  shiftContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.shift(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  reduceContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.reduce(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  /**
  @internal
  */
  emitContext() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -3) && this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
  }
  /**
  @internal
  */
  emitLookAhead() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -4) && this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
  }
  updateContext(e) {
    if (e != this.curContext.context) {
      let t = new Gc(this.curContext.tracker, e);
      t.hash != this.curContext.hash && this.emitContext(), this.curContext = t;
    }
  }
  /**
  @internal
  */
  setLookAhead(e) {
    return e <= this.lookAhead ? !1 : (this.emitLookAhead(), this.lookAhead = e, !0);
  }
  /**
  @internal
  */
  close() {
    this.curContext && this.curContext.tracker.strict && this.emitContext(), this.lookAhead > 0 && this.emitLookAhead();
  }
}
class Gc {
  constructor(e, t) {
    this.tracker = e, this.context = t, this.hash = e.strict ? e.hash(t) : 0;
  }
}
class F1 {
  constructor(e) {
    this.start = e, this.state = e.state, this.stack = e.stack, this.base = this.stack.length;
  }
  reduce(e) {
    let t = e & 65535, i = e >> 19;
    i == 0 ? (this.stack == this.start.stack && (this.stack = this.stack.slice()), this.stack.push(this.state, 0, 0), this.base += 3) : this.base -= (i - 1) * 3;
    let n = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
    this.state = n;
  }
}
class Qs {
  constructor(e, t, i) {
    this.stack = e, this.pos = t, this.index = i, this.buffer = e.buffer, this.index == 0 && this.maybeNext();
  }
  static create(e, t = e.bufferBase + e.buffer.length) {
    return new Qs(e, t, t - e.bufferBase);
  }
  maybeNext() {
    let e = this.stack.parent;
    e != null && (this.index = this.stack.bufferBase - e.bufferBase, this.stack = e, this.buffer = e.buffer);
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4, this.pos -= 4, this.index == 0 && this.maybeNext();
  }
  fork() {
    return new Qs(this.stack, this.pos, this.index);
  }
}
function Ir(r, e = Uint16Array) {
  if (typeof r != "string")
    return r;
  let t = null;
  for (let i = 0, n = 0; i < r.length; ) {
    let s = 0;
    for (; ; ) {
      let o = r.charCodeAt(i++), a = !1;
      if (o == 126) {
        s = 65535;
        break;
      }
      o >= 92 && o--, o >= 34 && o--;
      let l = o - 32;
      if (l >= 46 && (l -= 46, a = !0), s += l, a)
        break;
      s *= 46;
    }
    t ? t[n++] = s : t = new e(s);
  }
  return t;
}
class Jn {
  constructor() {
    this.start = -1, this.value = -1, this.end = -1, this.extended = -1, this.lookAhead = 0, this.mask = 0, this.context = 0;
  }
}
const Uc = new Jn();
class H1 {
  /**
  @internal
  */
  constructor(e, t) {
    this.input = e, this.ranges = t, this.chunk = "", this.chunkOff = 0, this.chunk2 = "", this.chunk2Pos = 0, this.next = -1, this.token = Uc, this.rangeIndex = 0, this.pos = this.chunkPos = t[0].from, this.range = t[0], this.end = t[t.length - 1].to, this.readNext();
  }
  /**
  @internal
  */
  resolveOffset(e, t) {
    let i = this.range, n = this.rangeIndex, s = this.pos + e;
    for (; s < i.from; ) {
      if (!n)
        return null;
      let o = this.ranges[--n];
      s -= i.from - o.to, i = o;
    }
    for (; t < 0 ? s > i.to : s >= i.to; ) {
      if (n == this.ranges.length - 1)
        return null;
      let o = this.ranges[++n];
      s += o.from - i.to, i = o;
    }
    return s;
  }
  /**
  @internal
  */
  clipPos(e) {
    if (e >= this.range.from && e < this.range.to)
      return e;
    for (let t of this.ranges)
      if (t.to > e)
        return Math.max(e, t.from);
    return this.end;
  }
  /**
  Look at a code unit near the stream position. `.peek(0)` equals
  `.next`, `.peek(-1)` gives you the previous character, and so
  on.
  
  Note that looking around during tokenizing creates dependencies
  on potentially far-away content, which may reduce the
  effectiveness incremental parsing—when looking forward—or even
  cause invalid reparses when looking backward more than 25 code
  units, since the library does not track lookbehind.
  */
  peek(e) {
    let t = this.chunkOff + e, i, n;
    if (t >= 0 && t < this.chunk.length)
      i = this.pos + e, n = this.chunk.charCodeAt(t);
    else {
      let s = this.resolveOffset(e, 1);
      if (s == null)
        return -1;
      if (i = s, i >= this.chunk2Pos && i < this.chunk2Pos + this.chunk2.length)
        n = this.chunk2.charCodeAt(i - this.chunk2Pos);
      else {
        let o = this.rangeIndex, a = this.range;
        for (; a.to <= i; )
          a = this.ranges[++o];
        this.chunk2 = this.input.chunk(this.chunk2Pos = i), i + this.chunk2.length > a.to && (this.chunk2 = this.chunk2.slice(0, a.to - i)), n = this.chunk2.charCodeAt(0);
      }
    }
    return i >= this.token.lookAhead && (this.token.lookAhead = i + 1), n;
  }
  /**
  Accept a token. By default, the end of the token is set to the
  current stream position, but you can pass an offset (relative to
  the stream position) to change that.
  */
  acceptToken(e, t = 0) {
    let i = t ? this.resolveOffset(t, -1) : this.pos;
    if (i == null || i < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = e, this.token.end = i;
  }
  /**
  Accept a token ending at a specific given position.
  */
  acceptTokenTo(e, t) {
    this.token.value = e, this.token.end = t;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk: e, chunkPos: t } = this;
      this.chunk = this.chunk2, this.chunkPos = this.chunk2Pos, this.chunk2 = e, this.chunk2Pos = t, this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk, this.chunk2Pos = this.chunkPos;
      let e = this.input.chunk(this.pos), t = this.pos + e.length;
      this.chunk = t > this.range.to ? e.slice(0, this.range.to - this.pos) : e, this.chunkPos = this.pos, this.chunkOff = 0;
    }
  }
  readNext() {
    return this.chunkOff >= this.chunk.length && (this.getChunk(), this.chunkOff == this.chunk.length) ? this.next = -1 : this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /**
  Move the stream forward N (defaults to 1) code units. Returns
  the new value of [`next`](#lr.InputStream.next).
  */
  advance(e = 1) {
    for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      e -= this.range.to - this.pos, this.range = this.ranges[++this.rangeIndex], this.pos = this.range.from;
    }
    return this.pos += e, this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1), this.readNext();
  }
  setDone() {
    return this.pos = this.chunkPos = this.end, this.range = this.ranges[this.rangeIndex = this.ranges.length - 1], this.chunk = "", this.next = -1;
  }
  /**
  @internal
  */
  reset(e, t) {
    if (t ? (this.token = t, t.start = e, t.lookAhead = e + 1, t.value = t.extended = -1) : this.token = Uc, this.pos != e) {
      if (this.pos = e, e == this.end)
        return this.setDone(), this;
      for (; e < this.range.from; )
        this.range = this.ranges[--this.rangeIndex];
      for (; e >= this.range.to; )
        this.range = this.ranges[++this.rangeIndex];
      e >= this.chunkPos && e < this.chunkPos + this.chunk.length ? this.chunkOff = e - this.chunkPos : (this.chunk = "", this.chunkOff = 0), this.readNext();
    }
    return this;
  }
  /**
  @internal
  */
  read(e, t) {
    if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
    if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
    if (e >= this.range.from && t <= this.range.to)
      return this.input.read(e, t);
    let i = "";
    for (let n of this.ranges) {
      if (n.from >= t)
        break;
      n.to > e && (i += this.input.read(Math.max(n.from, e), Math.min(n.to, t)));
    }
    return i;
  }
}
class cr {
  constructor(e, t) {
    this.data = e, this.id = t;
  }
  token(e, t) {
    let { parser: i } = t.p;
    OO(this.data, e, t, this.id, i.data, i.tokenPrecTable);
  }
}
cr.prototype.contextual = cr.prototype.fallback = cr.prototype.extend = !1;
class $s {
  constructor(e, t, i) {
    this.precTable = t, this.elseToken = i, this.data = typeof e == "string" ? Ir(e) : e;
  }
  token(e, t) {
    let i = e.pos, n = 0;
    for (; ; ) {
      let s = e.next < 0, o = e.resolveOffset(1, 1);
      if (OO(this.data, e, t, 0, this.data, this.precTable), e.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (s || n++, o == null)
        break;
      e.reset(o, e.token);
    }
    n && (e.reset(i, e.token), e.acceptToken(this.elseToken, n));
  }
}
$s.prototype.contextual = cr.prototype.fallback = cr.prototype.extend = !1;
class kt {
  /**
  Create a tokenizer. The first argument is the function that,
  given an input stream, scans for the types of tokens it
  recognizes at the stream's position, and calls
  [`acceptToken`](#lr.InputStream.acceptToken) when it finds
  one.
  */
  constructor(e, t = {}) {
    this.token = e, this.contextual = !!t.contextual, this.fallback = !!t.fallback, this.extend = !!t.extend;
  }
}
function OO(r, e, t, i, n, s) {
  let o = 0, a = 1 << i, { dialect: l } = t.p.parser;
  e: for (; (a & r[o]) != 0; ) {
    let c = r[o + 1];
    for (let v = o + 3; v < c; v += 2)
      if ((r[v + 1] & a) > 0) {
        let b = r[v];
        if (l.allows(b) && (e.token.value == -1 || e.token.value == b || K1(b, e.token.value, n, s))) {
          e.acceptToken(b);
          break;
        }
      }
    let u = e.next, p = 0, m = r[o + 2];
    if (e.next < 0 && m > p && r[c + m * 3 - 3] == 65535) {
      o = r[c + m * 3 - 1];
      continue e;
    }
    for (; p < m; ) {
      let v = p + m >> 1, b = c + v + (v << 1), w = r[b], C = r[b + 1] || 65536;
      if (u < w)
        m = v;
      else if (u >= C)
        p = v + 1;
      else {
        o = r[b + 2], e.advance();
        continue e;
      }
    }
    break;
  }
}
function Fc(r, e, t) {
  for (let i = e, n; (n = r[i]) != 65535; i++)
    if (n == t)
      return i - e;
  return -1;
}
function K1(r, e, t, i) {
  let n = Fc(t, i, e);
  return n < 0 || Fc(t, i, r) < n;
}
const pt = typeof process < "u" && process.env && /\bparse\b/.test(process.env.LOG);
let Co = null;
function Hc(r, e, t) {
  let i = r.cursor(ve.IncludeAnonymous);
  for (i.moveTo(e); ; )
    if (!(t < 0 ? i.childBefore(e) : i.childAfter(e)))
      for (; ; ) {
        if ((t < 0 ? i.to < e : i.from > e) && !i.type.isError)
          return t < 0 ? Math.max(0, Math.min(
            i.to - 1,
            e - 25
            /* Lookahead.Margin */
          )) : Math.min(r.length, Math.max(
            i.from + 1,
            e + 25
            /* Lookahead.Margin */
          ));
        if (t < 0 ? i.prevSibling() : i.nextSibling())
          break;
        if (!i.parent())
          return t < 0 ? 0 : r.length;
      }
}
let J1 = class {
  constructor(e, t) {
    this.fragments = e, this.nodeSet = t, this.i = 0, this.fragment = null, this.safeFrom = -1, this.safeTo = -1, this.trees = [], this.start = [], this.index = [], this.nextFragment();
  }
  nextFragment() {
    let e = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (e) {
      for (this.safeFrom = e.openStart ? Hc(e.tree, e.from + e.offset, 1) - e.offset : e.from, this.safeTo = e.openEnd ? Hc(e.tree, e.to + e.offset, -1) - e.offset : e.to; this.trees.length; )
        this.trees.pop(), this.start.pop(), this.index.pop();
      this.trees.push(e.tree), this.start.push(-e.offset), this.index.push(0), this.nextStart = this.safeFrom;
    } else
      this.nextStart = 1e9;
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(e) {
    if (e < this.nextStart)
      return null;
    for (; this.fragment && this.safeTo <= e; )
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let t = this.trees.length - 1;
      if (t < 0)
        return this.nextFragment(), null;
      let i = this.trees[t], n = this.index[t];
      if (n == i.children.length) {
        this.trees.pop(), this.start.pop(), this.index.pop();
        continue;
      }
      let s = i.children[n], o = this.start[t] + i.positions[n];
      if (o > e)
        return this.nextStart = o, null;
      if (s instanceof ye) {
        if (o == e) {
          if (o < this.safeFrom)
            return null;
          let a = o + s.length;
          if (a <= this.safeTo) {
            let l = s.prop(te.lookAhead);
            if (!l || a + l < this.fragment.to)
              return s;
          }
        }
        this.index[t]++, o + s.length >= Math.max(this.safeFrom, e) && (this.trees.push(s), this.start.push(o), this.index.push(0));
      } else
        this.index[t]++, this.nextStart = o + s.length;
    }
  }
};
class eS {
  constructor(e, t) {
    this.stream = t, this.tokens = [], this.mainToken = null, this.actions = [], this.tokens = e.tokenizers.map((i) => new Jn());
  }
  getActions(e) {
    let t = 0, i = null, { parser: n } = e.p, { tokenizers: s } = n, o = n.stateSlot(
      e.state,
      3
      /* ParseState.TokenizerMask */
    ), a = e.curContext ? e.curContext.hash : 0, l = 0;
    for (let c = 0; c < s.length; c++) {
      if ((1 << c & o) == 0)
        continue;
      let u = s[c], p = this.tokens[c];
      if (!(i && !u.fallback) && ((u.contextual || p.start != e.pos || p.mask != o || p.context != a) && (this.updateCachedToken(p, u, e), p.mask = o, p.context = a), p.lookAhead > p.end + 25 && (l = Math.max(p.lookAhead, l)), p.value != 0)) {
        let m = t;
        if (p.extended > -1 && (t = this.addActions(e, p.extended, p.end, t)), t = this.addActions(e, p.value, p.end, t), !u.extend && (i = p, t > m))
          break;
      }
    }
    for (; this.actions.length > t; )
      this.actions.pop();
    return l && e.setLookAhead(l), !i && e.pos == this.stream.end && (i = new Jn(), i.value = e.p.parser.eofTerm, i.start = i.end = e.pos, t = this.addActions(e, i.value, i.end, t)), this.mainToken = i, this.actions;
  }
  getMainToken(e) {
    if (this.mainToken)
      return this.mainToken;
    let t = new Jn(), { pos: i, p: n } = e;
    return t.start = i, t.end = Math.min(i + 1, n.stream.end), t.value = i == n.stream.end ? n.parser.eofTerm : 0, t;
  }
  updateCachedToken(e, t, i) {
    let n = this.stream.clipPos(i.pos);
    if (t.token(this.stream.reset(n, e), i), e.value > -1) {
      let { parser: s } = i.p;
      for (let o = 0; o < s.specialized.length; o++)
        if (s.specialized[o] == e.value) {
          let a = s.specializers[o](this.stream.read(e.start, e.end), i);
          if (a >= 0 && i.p.parser.dialect.allows(a >> 1)) {
            (a & 1) == 0 ? e.value = a >> 1 : e.extended = a >> 1;
            break;
          }
        }
    } else
      e.value = 0, e.end = this.stream.clipPos(n + 1);
  }
  putAction(e, t, i, n) {
    for (let s = 0; s < n; s += 3)
      if (this.actions[s] == e)
        return n;
    return this.actions[n++] = e, this.actions[n++] = t, this.actions[n++] = i, n;
  }
  addActions(e, t, i, n) {
    let { state: s } = e, { parser: o } = e.p, { data: a } = o;
    for (let l = 0; l < 2; l++)
      for (let c = o.stateSlot(
        s,
        l ? 2 : 1
        /* ParseState.Actions */
      ); ; c += 3) {
        if (a[c] == 65535)
          if (a[c + 1] == 1)
            c = oi(a, c + 2);
          else {
            n == 0 && a[c + 1] == 2 && (n = this.putAction(oi(a, c + 2), t, i, n));
            break;
          }
        a[c] == t && (n = this.putAction(oi(a, c + 1), t, i, n));
      }
    return n;
  }
}
class tS {
  constructor(e, t, i, n) {
    this.parser = e, this.input = t, this.ranges = n, this.recovering = 0, this.nextStackID = 9812, this.minStackPos = 0, this.reused = [], this.stoppedAt = null, this.lastBigReductionStart = -1, this.lastBigReductionSize = 0, this.bigReductionCount = 0, this.stream = new H1(t, n), this.tokens = new eS(e, this.stream), this.topTerm = e.top[1];
    let { from: s } = n[0];
    this.stacks = [ws.start(this, e.top[0], s)], this.fragments = i.length && this.stream.end - s > e.bufferLength * 4 ? new J1(i, e.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let e = this.stacks, t = this.minStackPos, i = this.stacks = [], n, s;
    if (this.bigReductionCount > 300 && e.length == 1) {
      let [o] = e;
      for (; o.forceReduce() && o.stack.length && o.stack[o.stack.length - 2] >= this.lastBigReductionStart; )
        ;
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let o = 0; o < e.length; o++) {
      let a = e[o];
      for (; ; ) {
        if (this.tokens.mainToken = null, a.pos > t)
          i.push(a);
        else {
          if (this.advanceStack(a, i, e))
            continue;
          {
            n || (n = [], s = []), n.push(a);
            let l = this.tokens.getMainToken(a);
            s.push(l.value, l.end);
          }
        }
        break;
      }
    }
    if (!i.length) {
      let o = n && rS(n);
      if (o)
        return pt && console.log("Finish with " + this.stackID(o)), this.stackToTree(o);
      if (this.parser.strict)
        throw pt && n && console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none")), new SyntaxError("No parse at " + t);
      this.recovering || (this.recovering = 5);
    }
    if (this.recovering && n) {
      let o = this.stoppedAt != null && n[0].pos > this.stoppedAt ? n[0] : this.runRecovery(n, s, i);
      if (o)
        return pt && console.log("Force-finish " + this.stackID(o)), this.stackToTree(o.forceAll());
    }
    if (this.recovering) {
      let o = this.recovering == 1 ? 1 : this.recovering * 3;
      if (i.length > o)
        for (i.sort((a, l) => l.score - a.score); i.length > o; )
          i.pop();
      i.some((a) => a.reducePos > t) && this.recovering--;
    } else if (i.length > 1) {
      e: for (let o = 0; o < i.length - 1; o++) {
        let a = i[o];
        for (let l = o + 1; l < i.length; l++) {
          let c = i[l];
          if (a.sameState(c) || a.buffer.length > 500 && c.buffer.length > 500)
            if ((a.score - c.score || a.buffer.length - c.buffer.length) > 0)
              i.splice(l--, 1);
            else {
              i.splice(o--, 1);
              continue e;
            }
        }
      }
      i.length > 12 && (i.sort((o, a) => a.score - o.score), i.splice(
        12,
        i.length - 12
        /* Rec.MaxStackCount */
      ));
    }
    this.minStackPos = i[0].pos;
    for (let o = 1; o < i.length; o++)
      i[o].pos < this.minStackPos && (this.minStackPos = i[o].pos);
    return null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(e, t, i) {
    let n = e.pos, { parser: s } = this, o = pt ? this.stackID(e) + " -> " : "";
    if (this.stoppedAt != null && n > this.stoppedAt)
      return e.forceReduce() ? e : null;
    if (this.fragments) {
      let c = e.curContext && e.curContext.tracker.strict, u = c ? e.curContext.hash : 0;
      for (let p = this.fragments.nodeAt(n); p; ) {
        let m = this.parser.nodeSet.types[p.type.id] == p.type ? s.getGoto(e.state, p.type.id) : -1;
        if (m > -1 && p.length && (!c || (p.prop(te.contextHash) || 0) == u))
          return e.useNode(p, m), pt && console.log(o + this.stackID(e) + ` (via reuse of ${s.getName(p.type.id)})`), !0;
        if (!(p instanceof ye) || p.children.length == 0 || p.positions[0] > 0)
          break;
        let v = p.children[0];
        if (v instanceof ye && p.positions[0] == 0)
          p = v;
        else
          break;
      }
    }
    let a = s.stateSlot(
      e.state,
      4
      /* ParseState.DefaultReduce */
    );
    if (a > 0)
      return e.reduce(a), pt && console.log(o + this.stackID(e) + ` (via always-reduce ${s.getName(
        a & 65535
        /* Action.ValueMask */
      )})`), !0;
    if (e.stack.length >= 8400)
      for (; e.stack.length > 6e3 && e.forceReduce(); )
        ;
    let l = this.tokens.getActions(e);
    for (let c = 0; c < l.length; ) {
      let u = l[c++], p = l[c++], m = l[c++], v = c == l.length || !i, b = v ? e : e.split(), w = this.tokens.mainToken;
      if (b.apply(u, p, w ? w.start : b.pos, m), pt && console.log(o + this.stackID(b) + ` (via ${(u & 65536) == 0 ? "shift" : `reduce of ${s.getName(
        u & 65535
        /* Action.ValueMask */
      )}`} for ${s.getName(p)} @ ${n}${b == e ? "" : ", split"})`), v)
        return !0;
      b.pos > n ? t.push(b) : i.push(b);
    }
    return !1;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(e, t) {
    let i = e.pos;
    for (; ; ) {
      if (!this.advanceStack(e, null, null))
        return !1;
      if (e.pos > i)
        return Kc(e, t), !0;
    }
  }
  runRecovery(e, t, i) {
    let n = null, s = !1;
    for (let o = 0; o < e.length; o++) {
      let a = e[o], l = t[o << 1], c = t[(o << 1) + 1], u = pt ? this.stackID(a) + " -> " : "";
      if (a.deadEnd && (s || (s = !0, a.restart(), pt && console.log(u + this.stackID(a) + " (restarted)"), this.advanceFully(a, i))))
        continue;
      let p = a.split(), m = u;
      for (let v = 0; v < 10 && p.forceReduce() && (pt && console.log(m + this.stackID(p) + " (via force-reduce)"), !this.advanceFully(p, i)); v++)
        pt && (m = this.stackID(p) + " -> ");
      for (let v of a.recoverByInsert(l))
        pt && console.log(u + this.stackID(v) + " (via recover-insert)"), this.advanceFully(v, i);
      this.stream.end > a.pos ? (c == a.pos && (c++, l = 0), a.recoverByDelete(l, c), pt && console.log(u + this.stackID(a) + ` (via recover-delete ${this.parser.getName(l)})`), Kc(a, i)) : (!n || n.score < p.score) && (n = p);
    }
    return n;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(e) {
    return e.close(), ye.build({
      buffer: Qs.create(e),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: e.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(e) {
    let t = (Co || (Co = /* @__PURE__ */ new WeakMap())).get(e);
    return t || Co.set(e, t = String.fromCodePoint(this.nextStackID++)), t + e;
  }
}
function Kc(r, e) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    if (i.pos == r.pos && i.sameState(r)) {
      e[t].score < r.score && (e[t] = r);
      return;
    }
  }
  e.push(r);
}
class iS {
  constructor(e, t, i) {
    this.source = e, this.flags = t, this.disabled = i;
  }
  allows(e) {
    return !this.disabled || this.disabled[e] == 0;
  }
}
const To = (r) => r;
class pO {
  /**
  Define a context tracker.
  */
  constructor(e) {
    this.start = e.start, this.shift = e.shift || To, this.reduce = e.reduce || To, this.reuse = e.reuse || To, this.hash = e.hash || (() => 0), this.strict = e.strict !== !1;
  }
}
class yr extends pl {
  /**
  @internal
  */
  constructor(e) {
    if (super(), this.wrappers = [], e.version != 14)
      throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (14)`);
    let t = e.nodeNames.split(" ");
    this.minRepeatTerm = t.length;
    for (let a = 0; a < e.repeatNodeCount; a++)
      t.push("");
    let i = Object.keys(e.topRules).map((a) => e.topRules[a][1]), n = [];
    for (let a = 0; a < t.length; a++)
      n.push([]);
    function s(a, l, c) {
      n[a].push([l, l.deserialize(String(c))]);
    }
    if (e.nodeProps)
      for (let a of e.nodeProps) {
        let l = a[0];
        typeof l == "string" && (l = te[l]);
        for (let c = 1; c < a.length; ) {
          let u = a[c++];
          if (u >= 0)
            s(u, l, a[c++]);
          else {
            let p = a[c + -u];
            for (let m = -u; m > 0; m--)
              s(a[c++], l, p);
            c++;
          }
        }
      }
    this.nodeSet = new mn(t.map((a, l) => je.define({
      name: l >= this.minRepeatTerm ? void 0 : a,
      id: l,
      props: n[l],
      top: i.indexOf(l) > -1,
      error: l == 0,
      skipped: e.skippedNodes && e.skippedNodes.indexOf(l) > -1
    }))), e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)), this.strict = !1, this.bufferLength = sd;
    let o = Ir(e.tokenData);
    this.context = e.context, this.specializerSpecs = e.specialized || [], this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let a = 0; a < this.specializerSpecs.length; a++)
      this.specialized[a] = this.specializerSpecs[a].term;
    this.specializers = this.specializerSpecs.map(Jc), this.states = Ir(e.states, Uint32Array), this.data = Ir(e.stateData), this.goto = Ir(e.goto), this.maxTerm = e.maxTerm, this.tokenizers = e.tokenizers.map((a) => typeof a == "number" ? new cr(o, a) : a), this.topRules = e.topRules, this.dialects = e.dialects || {}, this.dynamicPrecedences = e.dynamicPrecedences || null, this.tokenPrecTable = e.tokenPrec, this.termNames = e.termNames || null, this.maxNode = this.nodeSet.types.length - 1, this.dialect = this.parseDialect(), this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(e, t, i) {
    let n = new tS(this, e, t, i);
    for (let s of this.wrappers)
      n = s(n, e, t, i);
    return n;
  }
  /**
  Get a goto table entry @internal
  */
  getGoto(e, t, i = !1) {
    let n = this.goto;
    if (t >= n[0])
      return -1;
    for (let s = n[t + 1]; ; ) {
      let o = n[s++], a = o & 1, l = n[s++];
      if (a && i)
        return l;
      for (let c = s + (o >> 1); s < c; s++)
        if (n[s] == e)
          return l;
      if (a)
        return -1;
    }
  }
  /**
  Check if this state has an action for a given terminal @internal
  */
  hasAction(e, t) {
    let i = this.data;
    for (let n = 0; n < 2; n++)
      for (let s = this.stateSlot(
        e,
        n ? 2 : 1
        /* ParseState.Actions */
      ), o; ; s += 3) {
        if ((o = i[s]) == 65535)
          if (i[s + 1] == 1)
            o = i[s = oi(i, s + 2)];
          else {
            if (i[s + 1] == 2)
              return oi(i, s + 2);
            break;
          }
        if (o == t || o == 0)
          return oi(i, s + 1);
      }
    return 0;
  }
  /**
  @internal
  */
  stateSlot(e, t) {
    return this.states[e * 6 + t];
  }
  /**
  @internal
  */
  stateFlag(e, t) {
    return (this.stateSlot(
      e,
      0
      /* ParseState.Flags */
    ) & t) > 0;
  }
  /**
  @internal
  */
  validAction(e, t) {
    return !!this.allActions(e, (i) => i == t ? !0 : null);
  }
  /**
  @internal
  */
  allActions(e, t) {
    let i = this.stateSlot(
      e,
      4
      /* ParseState.DefaultReduce */
    ), n = i ? t(i) : void 0;
    for (let s = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); n == null; s += 3) {
      if (this.data[s] == 65535)
        if (this.data[s + 1] == 1)
          s = oi(this.data, s + 2);
        else
          break;
      n = t(oi(this.data, s + 1));
    }
    return n;
  }
  /**
  Get the states that can follow this one through shift actions or
  goto jumps. @internal
  */
  nextStates(e) {
    let t = [];
    for (let i = this.stateSlot(
      e,
      1
      /* ParseState.Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = oi(this.data, i + 2);
        else
          break;
      if ((this.data[i + 2] & 1) == 0) {
        let n = this.data[i + 1];
        t.some((s, o) => o & 1 && s == n) || t.push(this.data[i], n);
      }
    }
    return t;
  }
  /**
  Configure the parser. Returns a new parser instance that has the
  given settings modified. Settings not provided in `config` are
  kept from the original parser.
  */
  configure(e) {
    let t = Object.assign(Object.create(yr.prototype), this);
    if (e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top) {
      let i = this.topRules[e.top];
      if (!i)
        throw new RangeError(`Invalid top rule name ${e.top}`);
      t.top = i;
    }
    return e.tokenizers && (t.tokenizers = this.tokenizers.map((i) => {
      let n = e.tokenizers.find((s) => s.from == i);
      return n ? n.to : i;
    })), e.specializers && (t.specializers = this.specializers.slice(), t.specializerSpecs = this.specializerSpecs.map((i, n) => {
      let s = e.specializers.find((a) => a.from == i.external);
      if (!s)
        return i;
      let o = Object.assign(Object.assign({}, i), { external: s.to });
      return t.specializers[n] = Jc(o), o;
    })), e.contextTracker && (t.context = e.contextTracker), e.dialect && (t.dialect = this.parseDialect(e.dialect)), e.strict != null && (t.strict = e.strict), e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)), e.bufferLength != null && (t.bufferLength = e.bufferLength), t;
  }
  /**
  Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  are registered for this parser.
  */
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /**
  Returns the name associated with a given term. This will only
  work for all terms when the parser was generated with the
  `--names` option. By default, only the names of tagged terms are
  stored.
  */
  getName(e) {
    return this.termNames ? this.termNames[e] : String(e <= this.maxNode && this.nodeSet.types[e].name || e);
  }
  /**
  The eof term id is always allocated directly after the node
  types. @internal
  */
  get eofTerm() {
    return this.maxNode + 1;
  }
  /**
  The type of top node produced by the parser.
  */
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /**
  @internal
  */
  dynamicPrecedence(e) {
    let t = this.dynamicPrecedences;
    return t == null ? 0 : t[e] || 0;
  }
  /**
  @internal
  */
  parseDialect(e) {
    let t = Object.keys(this.dialects), i = t.map(() => !1);
    if (e)
      for (let s of e.split(" ")) {
        let o = t.indexOf(s);
        o >= 0 && (i[o] = !0);
      }
    let n = null;
    for (let s = 0; s < t.length; s++)
      if (!i[s])
        for (let o = this.dialects[t[s]], a; (a = this.data[o++]) != 65535; )
          (n || (n = new Uint8Array(this.maxTerm + 1)))[a] = 1;
    return new iS(e, i, n);
  }
  /**
  Used by the output of the parser generator. Not available to
  user code. @hide
  */
  static deserialize(e) {
    return new yr(e);
  }
}
function oi(r, e) {
  return r[e] | r[e + 1] << 16;
}
function rS(r) {
  let e = null;
  for (let t of r) {
    let i = t.p.stoppedAt;
    (t.pos == t.p.stream.end || i != null && t.pos > i) && t.p.parser.stateFlag(
      t.state,
      2
      /* StateFlag.Accepting */
    ) && (!e || e.score < t.score) && (e = t);
  }
  return e;
}
function Jc(r) {
  if (r.external) {
    let e = r.extend ? 1 : 0;
    return (t, i) => r.external(t, i) << 1 | e;
  }
  return r.get;
}
const nS = 316, sS = 317, ef = 1, oS = 2, aS = 3, lS = 4, hS = 318, cS = 320, fS = 321, uS = 5, dS = 6, OS = 0, ja = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], gO = 125, pS = 59, Ia = 47, gS = 42, mS = 43, yS = 45, vS = 60, SS = 44, bS = 63, kS = 46, xS = 91, wS = new pO({
  start: !1,
  shift(r, e) {
    return e == uS || e == dS || e == cS ? r : e == fS;
  },
  strict: !1
}), QS = new kt((r, e) => {
  let { next: t } = r;
  (t == gO || t == -1 || e.context) && r.acceptToken(hS);
}, { contextual: !0, fallback: !0 }), $S = new kt((r, e) => {
  let { next: t } = r, i;
  ja.indexOf(t) > -1 || t == Ia && ((i = r.peek(1)) == Ia || i == gS) || t != gO && t != pS && t != -1 && !e.context && r.acceptToken(nS);
}, { contextual: !0 }), PS = new kt((r, e) => {
  r.next == xS && !e.context && r.acceptToken(sS);
}, { contextual: !0 }), CS = new kt((r, e) => {
  let { next: t } = r;
  if (t == mS || t == yS) {
    if (r.advance(), t == r.next) {
      r.advance();
      let i = !e.context && e.canShift(ef);
      r.acceptToken(i ? ef : oS);
    }
  } else t == bS && r.peek(1) == kS && (r.advance(), r.advance(), (r.next < 48 || r.next > 57) && r.acceptToken(aS));
}, { contextual: !0 });
function Ao(r, e) {
  return r >= 65 && r <= 90 || r >= 97 && r <= 122 || r == 95 || r >= 192 || !e && r >= 48 && r <= 57;
}
const TS = new kt((r, e) => {
  if (r.next != vS || !e.dialectEnabled(OS) || (r.advance(), r.next == Ia)) return;
  let t = 0;
  for (; ja.indexOf(r.next) > -1; )
    r.advance(), t++;
  if (Ao(r.next, !0)) {
    for (r.advance(), t++; Ao(r.next, !1); )
      r.advance(), t++;
    for (; ja.indexOf(r.next) > -1; )
      r.advance(), t++;
    if (r.next == SS) return;
    for (let i = 0; ; i++) {
      if (i == 7) {
        if (!Ao(r.next, !0)) return;
        break;
      }
      if (r.next != "extends".charCodeAt(i)) break;
      r.advance(), t++;
    }
  }
  r.acceptToken(lS, -t);
}), AS = xr({
  "get set async static": Q.modifier,
  "for while do if else switch try catch finally return throw break continue default case defer": Q.controlKeyword,
  "in of await yield void typeof delete instanceof as satisfies": Q.operatorKeyword,
  "let var const using function class extends": Q.definitionKeyword,
  "import export from": Q.moduleKeyword,
  "with debugger new": Q.keyword,
  TemplateString: Q.special(Q.string),
  super: Q.atom,
  BooleanLiteral: Q.bool,
  this: Q.self,
  null: Q.null,
  Star: Q.modifier,
  VariableName: Q.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": Q.function(Q.variableName),
  VariableDefinition: Q.definition(Q.variableName),
  Label: Q.labelName,
  PropertyName: Q.propertyName,
  PrivatePropertyName: Q.special(Q.propertyName),
  "CallExpression/MemberExpression/PropertyName": Q.function(Q.propertyName),
  "FunctionDeclaration/VariableDefinition": Q.function(Q.definition(Q.variableName)),
  "ClassDeclaration/VariableDefinition": Q.definition(Q.className),
  "NewExpression/VariableName": Q.className,
  PropertyDefinition: Q.definition(Q.propertyName),
  PrivatePropertyDefinition: Q.definition(Q.special(Q.propertyName)),
  UpdateOp: Q.updateOperator,
  "LineComment Hashbang": Q.lineComment,
  BlockComment: Q.blockComment,
  Number: Q.number,
  String: Q.string,
  Escape: Q.escape,
  ArithOp: Q.arithmeticOperator,
  LogicOp: Q.logicOperator,
  BitOp: Q.bitwiseOperator,
  CompareOp: Q.compareOperator,
  RegExp: Q.regexp,
  Equals: Q.definitionOperator,
  Arrow: Q.function(Q.punctuation),
  ": Spread": Q.punctuation,
  "( )": Q.paren,
  "[ ]": Q.squareBracket,
  "{ }": Q.brace,
  "InterpolationStart InterpolationEnd": Q.special(Q.brace),
  ".": Q.derefOperator,
  ", ;": Q.separator,
  "@": Q.meta,
  TypeName: Q.typeName,
  TypeDefinition: Q.definition(Q.typeName),
  "type enum interface implements namespace module declare": Q.definitionKeyword,
  "abstract global Privacy readonly override": Q.modifier,
  "is keyof unique infer asserts": Q.operatorKeyword,
  JSXAttributeValue: Q.attributeValue,
  JSXText: Q.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": Q.angleBracket,
  "JSXIdentifier JSXNameSpacedName": Q.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": Q.attributeName,
  "JSXBuiltin/JSXIdentifier": Q.standard(Q.tagName)
}), MS = { __proto__: null, export: 20, as: 25, from: 33, default: 36, async: 41, function: 42, in: 52, out: 55, const: 56, extends: 60, this: 64, true: 72, false: 72, null: 84, void: 88, typeof: 92, super: 108, new: 142, delete: 154, yield: 163, await: 167, class: 172, public: 235, private: 235, protected: 235, readonly: 237, instanceof: 256, satisfies: 259, import: 292, keyof: 349, unique: 353, infer: 359, asserts: 395, is: 397, abstract: 417, implements: 419, type: 421, let: 424, var: 426, using: 429, interface: 435, enum: 439, namespace: 445, module: 447, declare: 451, global: 455, defer: 471, for: 476, of: 485, while: 488, with: 492, do: 496, if: 500, else: 502, switch: 506, case: 512, try: 518, catch: 522, finally: 526, return: 530, throw: 534, break: 538, continue: 542, debugger: 546 }, RS = { __proto__: null, async: 129, get: 131, set: 133, declare: 195, public: 197, private: 197, protected: 197, static: 199, abstract: 201, override: 203, readonly: 209, accessor: 211, new: 401 }, ZS = { __proto__: null, "<": 193 }, XS = yr.deserialize({
  version: 14,
  states: "$F|Q%TQlOOO%[QlOOO'_QpOOP(lO`OOO*zQ!0MxO'#CiO+RO#tO'#CjO+aO&jO'#CjO+oO#@ItO'#DaO.QQlO'#DgO.bQlO'#DrO%[QlO'#DzO0fQlO'#ESOOQ!0Lf'#E['#E[O1PQ`O'#EXOOQO'#Ep'#EpOOQO'#Il'#IlO1XQ`O'#GsO1dQ`O'#EoO1iQ`O'#EoO3hQ!0MxO'#JrO6[Q!0MxO'#JsO6uQ`O'#F]O6zQ,UO'#FtOOQ!0Lf'#Ff'#FfO7VO7dO'#FfO9XQMhO'#F|O9`Q`O'#F{OOQ!0Lf'#Js'#JsOOQ!0Lb'#Jr'#JrO9eQ`O'#GwOOQ['#K_'#K_O9pQ`O'#IYO9uQ!0LrO'#IZOOQ['#J`'#J`OOQ['#I_'#I_Q`QlOOQ`QlOOO9}Q!L^O'#DvO:UQlO'#EOO:]QlO'#EQO9kQ`O'#GsO:dQMhO'#CoO:rQ`O'#EnO:}Q`O'#EyO;hQMhO'#FeO;xQ`O'#GsOOQO'#K`'#K`O;}Q`O'#K`O<]Q`O'#G{O<]Q`O'#G|O<]Q`O'#HOO9kQ`O'#HRO=SQ`O'#HUO>kQ`O'#CeO>{Q`O'#HcO?TQ`O'#HiO?TQ`O'#HkO`QlO'#HmO?TQ`O'#HoO?TQ`O'#HrO?YQ`O'#HxO?_Q!0LsO'#IOO%[QlO'#IQO?jQ!0LsO'#ISO?uQ!0LsO'#IUO9uQ!0LrO'#IWO@QQ!0MxO'#CiOASQpO'#DlQOQ`OOO%[QlO'#EQOAjQ`O'#ETO:dQMhO'#EnOAuQ`O'#EnOBQQ!bO'#FeOOQ['#Cg'#CgOOQ!0Lb'#Dq'#DqOOQ!0Lb'#Jv'#JvO%[QlO'#JvOOQO'#Jy'#JyOOQO'#Ih'#IhOCQQpO'#EgOOQ!0Lb'#Ef'#EfOOQ!0Lb'#J}'#J}OC|Q!0MSO'#EgODWQpO'#EWOOQO'#Jx'#JxODlQpO'#JyOEyQpO'#EWODWQpO'#EgPFWO&2DjO'#CbPOOO)CD})CD}OOOO'#I`'#I`OFcO#tO,59UOOQ!0Lh,59U,59UOOOO'#Ia'#IaOFqO&jO,59UOGPQ!L^O'#DcOOOO'#Ic'#IcOGWO#@ItO,59{OOQ!0Lf,59{,59{OGfQlO'#IdOGyQ`O'#JtOIxQ!fO'#JtO+}QlO'#JtOJPQ`O,5:ROJgQ`O'#EpOJtQ`O'#KTOKPQ`O'#KSOKPQ`O'#KSOKXQ`O,5;^OK^Q`O'#KROOQ!0Ln,5:^,5:^OKeQlO,5:^OMcQ!0MxO,5:fONSQ`O,5:nONmQ!0LrO'#KQONtQ`O'#KPO9eQ`O'#KPO! YQ`O'#KPO! bQ`O,5;]O! gQ`O'#KPO!#lQ!fO'#JsOOQ!0Lh'#Ci'#CiO%[QlO'#ESO!$[Q!fO,5:sOOQS'#Jz'#JzOOQO-E<j-E<jO9kQ`O,5=_O!$rQ`O,5=_O!$wQlO,5;ZO!&zQMhO'#EkO!(eQ`O,5;ZO!(jQlO'#DyO!(tQpO,5;dO!(|QpO,5;dO%[QlO,5;dOOQ['#FT'#FTOOQ['#FV'#FVO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eO%[QlO,5;eOOQ['#FZ'#FZO!)[QlO,5;tOOQ!0Lf,5;y,5;yOOQ!0Lf,5;z,5;zOOQ!0Lf,5;|,5;|O%[QlO'#IpO!+_Q!0LrO,5<iO%[QlO,5;eO!&zQMhO,5;eO!+|QMhO,5;eO!-nQMhO'#E^O%[QlO,5;wOOQ!0Lf,5;{,5;{O!-uQ,UO'#FjO!.rQ,UO'#KXO!.^Q,UO'#KXO!.yQ,UO'#KXOOQO'#KX'#KXO!/_Q,UO,5<SOOOW,5<`,5<`O!/pQlO'#FvOOOW'#Io'#IoO7VO7dO,5<QO!/wQ,UO'#FxOOQ!0Lf,5<Q,5<QO!0hQ$IUO'#CyOOQ!0Lh'#C}'#C}O!0{O#@ItO'#DRO!1iQMjO,5<eO!1pQ`O,5<hO!3YQ(CWO'#GXO!3jQ`O'#GYO!3oQ`O'#GYO!5_Q(CWO'#G^O!6dQpO'#GbOOQO'#Gn'#GnO!,TQMhO'#GmOOQO'#Gp'#GpO!,TQMhO'#GoO!7VQ$IUO'#JlOOQ!0Lh'#Jl'#JlO!7aQ`O'#JkO!7oQ`O'#JjO!7wQ`O'#CuOOQ!0Lh'#C{'#C{O!8YQ`O'#C}OOQ!0Lh'#DV'#DVOOQ!0Lh'#DX'#DXO!8_Q`O,5<eO1SQ`O'#DZO!,TQMhO'#GPO!,TQMhO'#GRO!8gQ`O'#GTO!8lQ`O'#GUO!3oQ`O'#G[O!,TQMhO'#GaO<]Q`O'#JkO!8qQ`O'#EqO!9`Q`O,5<gOOQ!0Lb'#Cr'#CrO!9hQ`O'#ErO!:bQpO'#EsOOQ!0Lb'#KR'#KRO!:iQ!0LrO'#KaO9uQ!0LrO,5=cO`QlO,5>tOOQ['#Jh'#JhOOQ[,5>u,5>uOOQ[-E<]-E<]O!<hQ!0MxO,5:bO!:]QpO,5:`O!?RQ!0MxO,5:jO%[QlO,5:jO!AiQ!0MxO,5:lOOQO,5@z,5@zO!BYQMhO,5=_O!BhQ!0LrO'#JiO9`Q`O'#JiO!ByQ!0LrO,59ZO!CUQpO,59ZO!C^QMhO,59ZO:dQMhO,59ZO!CiQ`O,5;ZO!CqQ`O'#HbO!DVQ`O'#KdO%[QlO,5;}O!:]QpO,5<PO!D_Q`O,5=zO!DdQ`O,5=zO!DiQ`O,5=zO!DwQ`O,5=zO9uQ!0LrO,5=zO<]Q`O,5=jOOQO'#Cy'#CyO!EOQpO,5=gO!EWQMhO,5=hO!EcQ`O,5=jO!EhQ!bO,5=mO!EpQ`O'#K`O?YQ`O'#HWO9kQ`O'#HYO!EuQ`O'#HYO:dQMhO'#H[O!EzQ`O'#H[OOQ[,5=p,5=pO!FPQ`O'#H]O!FbQ`O'#CoO!FgQ`O,59PO!FqQ`O,59PO!HvQlO,59POOQ[,59P,59PO!IWQ!0LrO,59PO%[QlO,59PO!KcQlO'#HeOOQ['#Hf'#HfOOQ['#Hg'#HgO`QlO,5=}O!KyQ`O,5=}O`QlO,5>TO`QlO,5>VO!LOQ`O,5>XO`QlO,5>ZO!LTQ`O,5>^O!LYQlO,5>dOOQ[,5>j,5>jO%[QlO,5>jO9uQ!0LrO,5>lOOQ[,5>n,5>nO#!dQ`O,5>nOOQ[,5>p,5>pO#!dQ`O,5>pOOQ[,5>r,5>rO##QQpO'#D_O%[QlO'#JvO##sQpO'#JvO##}QpO'#DmO#$`QpO'#DmO#&qQlO'#DmO#&xQ`O'#JuO#'QQ`O,5:WO#'VQ`O'#EtO#'eQ`O'#KUO#'mQ`O,5;_O#'rQpO'#DmO#(PQpO'#EVOOQ!0Lf,5:o,5:oO%[QlO,5:oO#(WQ`O,5:oO?YQ`O,5;YO!CUQpO,5;YO!C^QMhO,5;YO:dQMhO,5;YO#(`Q`O,5@bO#(eQ07dO,5:sOOQO-E<f-E<fO#)kQ!0MSO,5;RODWQpO,5:rO#)uQpO,5:rODWQpO,5;RO!ByQ!0LrO,5:rOOQ!0Lb'#Ej'#EjOOQO,5;R,5;RO%[QlO,5;RO#*SQ!0LrO,5;RO#*_Q!0LrO,5;RO!CUQpO,5:rOOQO,5;X,5;XO#*mQ!0LrO,5;RPOOO'#I^'#I^P#+RO&2DjO,58|POOO,58|,58|OOOO-E<^-E<^OOQ!0Lh1G.p1G.pOOOO-E<_-E<_OOOO,59},59}O#+^Q!bO,59}OOOO-E<a-E<aOOQ!0Lf1G/g1G/gO#+cQ!fO,5?OO+}QlO,5?OOOQO,5?U,5?UO#+mQlO'#IdOOQO-E<b-E<bO#+zQ`O,5@`O#,SQ!fO,5@`O#,ZQ`O,5@nOOQ!0Lf1G/m1G/mO%[QlO,5@oO#,cQ`O'#IjOOQO-E<h-E<hO#,ZQ`O,5@nOOQ!0Lb1G0x1G0xOOQ!0Ln1G/x1G/xOOQ!0Ln1G0Y1G0YO%[QlO,5@lO#,wQ!0LrO,5@lO#-YQ!0LrO,5@lO#-aQ`O,5@kO9eQ`O,5@kO#-iQ`O,5@kO#-wQ`O'#ImO#-aQ`O,5@kOOQ!0Lb1G0w1G0wO!(tQpO,5:uO!)PQpO,5:uOOQS,5:w,5:wO#.iQdO,5:wO#.qQMhO1G2yO9kQ`O1G2yOOQ!0Lf1G0u1G0uO#/PQ!0MxO1G0uO#0UQ!0MvO,5;VOOQ!0Lh'#GW'#GWO#0rQ!0MzO'#JlO!$wQlO1G0uO#2}Q!fO'#JwO%[QlO'#JwO#3XQ`O,5:eOOQ!0Lh'#D_'#D_OOQ!0Lf1G1O1G1OO%[QlO1G1OOOQ!0Lf1G1f1G1fO#3^Q`O1G1OO#5rQ!0MxO1G1PO#5yQ!0MxO1G1PO#8aQ!0MxO1G1PO#8hQ!0MxO1G1PO#;OQ!0MxO1G1PO#=fQ!0MxO1G1PO#=mQ!0MxO1G1PO#=tQ!0MxO1G1PO#@[Q!0MxO1G1PO#@cQ!0MxO1G1PO#BpQ?MtO'#CiO#DkQ?MtO1G1`O#DrQ?MtO'#JsO#EVQ!0MxO,5?[OOQ!0Lb-E<n-E<nO#GdQ!0MxO1G1PO#HaQ!0MzO1G1POOQ!0Lf1G1P1G1PO#IdQMjO'#J|O#InQ`O,5:xO#IsQ!0MxO1G1cO#JgQ,UO,5<WO#JoQ,UO,5<XO#JwQ,UO'#FoO#K`Q`O'#FnOOQO'#KY'#KYOOQO'#In'#InO#KeQ,UO1G1nOOQ!0Lf1G1n1G1nOOOW1G1y1G1yO#KvQ?MtO'#JrO#LQQ`O,5<bO!)[QlO,5<bOOOW-E<m-E<mOOQ!0Lf1G1l1G1lO#LVQpO'#KXOOQ!0Lf,5<d,5<dO#L_QpO,5<dO#LdQMhO'#DTOOOO'#Ib'#IbO#LkO#@ItO,59mOOQ!0Lh,59m,59mO%[QlO1G2PO!8lQ`O'#IrO#LvQ`O,5<zOOQ!0Lh,5<w,5<wO!,TQMhO'#IuO#MdQMjO,5=XO!,TQMhO'#IwO#NVQMjO,5=ZO!&zQMhO,5=]OOQO1G2S1G2SO#NaQ!dO'#CrO#NtQ(CWO'#ErO$ |QpO'#GbO$!dQ!dO,5<sO$!kQ`O'#K[O9eQ`O'#K[O$!yQ`O,5<uO$#aQ!dO'#C{O!,TQMhO,5<tO$#kQ`O'#GZO$$PQ`O,5<tO$$UQ!dO'#GWO$$cQ!dO'#K]O$$mQ`O'#K]O!&zQMhO'#K]O$$rQ`O,5<xO$$wQlO'#JvO$%RQpO'#GcO#$`QpO'#GcO$%dQ`O'#GgO!3oQ`O'#GkO$%iQ!0LrO'#ItO$%tQpO,5<|OOQ!0Lp,5<|,5<|O$%{QpO'#GcO$&YQpO'#GdO$&kQpO'#GdO$&pQMjO,5=XO$'QQMjO,5=ZOOQ!0Lh,5=^,5=^O!,TQMhO,5@VO!,TQMhO,5@VO$'bQ`O'#IyO$'vQ`O,5@UO$(OQ`O,59aOOQ!0Lh,59i,59iO$(TQ`O,5@VO$)TQ$IYO,59uOOQ!0Lh'#Jp'#JpO$)vQMjO,5<kO$*iQMjO,5<mO@zQ`O,5<oOOQ!0Lh,5<p,5<pO$*sQ`O,5<vO$*xQMjO,5<{O$+YQ`O'#KPO!$wQlO1G2RO$+_Q`O1G2RO9eQ`O'#KSO9eQ`O'#EtO%[QlO'#EtO9eQ`O'#I{O$+dQ!0LrO,5@{OOQ[1G2}1G2}OOQ[1G4`1G4`OOQ!0Lf1G/|1G/|OOQ!0Lf1G/z1G/zO$-fQ!0MxO1G0UOOQ[1G2y1G2yO!&zQMhO1G2yO%[QlO1G2yO#.tQ`O1G2yO$/jQMhO'#EkOOQ!0Lb,5@T,5@TO$/wQ!0LrO,5@TOOQ[1G.u1G.uO!ByQ!0LrO1G.uO!CUQpO1G.uO!C^QMhO1G.uO$0YQ`O1G0uO$0_Q`O'#CiO$0jQ`O'#KeO$0rQ`O,5=|O$0wQ`O'#KeO$0|Q`O'#KeO$1[Q`O'#JRO$1jQ`O,5AOO$1rQ!fO1G1iOOQ!0Lf1G1k1G1kO9kQ`O1G3fO@zQ`O1G3fO$1yQ`O1G3fO$2OQ`O1G3fO!DiQ`O1G3fO9uQ!0LrO1G3fOOQ[1G3f1G3fO!EcQ`O1G3UO!&zQMhO1G3RO$2TQ`O1G3ROOQ[1G3S1G3SO!&zQMhO1G3SO$2YQ`O1G3SO$2bQpO'#HQOOQ[1G3U1G3UO!6_QpO'#I}O!EhQ!bO1G3XOOQ[1G3X1G3XOOQ[,5=r,5=rO$2jQMhO,5=tO9kQ`O,5=tO$%dQ`O,5=vO9`Q`O,5=vO!CUQpO,5=vO!C^QMhO,5=vO:dQMhO,5=vO$2xQ`O'#KcO$3TQ`O,5=wOOQ[1G.k1G.kO$3YQ!0LrO1G.kO@zQ`O1G.kO$3eQ`O1G.kO9uQ!0LrO1G.kO$5mQ!fO,5AQO$5zQ`O,5AQO9eQ`O,5AQO$6VQlO,5>PO$6^Q`O,5>POOQ[1G3i1G3iO`QlO1G3iOOQ[1G3o1G3oOOQ[1G3q1G3qO?TQ`O1G3sO$6cQlO1G3uO$:gQlO'#HtOOQ[1G3x1G3xO$:tQ`O'#HzO?YQ`O'#H|OOQ[1G4O1G4OO$:|QlO1G4OO9uQ!0LrO1G4UOOQ[1G4W1G4WOOQ!0Lb'#G_'#G_O9uQ!0LrO1G4YO9uQ!0LrO1G4[O$?TQ`O,5@bO!)[QlO,5;`O9eQ`O,5;`O?YQ`O,5:XO!)[QlO,5:XO!CUQpO,5:XO$?YQ?MtO,5:XOOQO,5;`,5;`O$?dQpO'#IeO$?zQ`O,5@aOOQ!0Lf1G/r1G/rO$@SQpO'#IkO$@^Q`O,5@pOOQ!0Lb1G0y1G0yO#$`QpO,5:XOOQO'#Ig'#IgO$@fQpO,5:qOOQ!0Ln,5:q,5:qO#(ZQ`O1G0ZOOQ!0Lf1G0Z1G0ZO%[QlO1G0ZOOQ!0Lf1G0t1G0tO?YQ`O1G0tO!CUQpO1G0tO!C^QMhO1G0tOOQ!0Lb1G5|1G5|O!ByQ!0LrO1G0^OOQO1G0m1G0mO%[QlO1G0mO$@mQ!0LrO1G0mO$@xQ!0LrO1G0mO!CUQpO1G0^ODWQpO1G0^O$AWQ!0LrO1G0mOOQO1G0^1G0^O$AlQ!0MxO1G0mPOOO-E<[-E<[POOO1G.h1G.hOOOO1G/i1G/iO$AvQ!bO,5<iO$BOQ!fO1G4jOOQO1G4p1G4pO%[QlO,5?OO$BYQ`O1G5zO$BbQ`O1G6YO$BjQ!fO1G6ZO9eQ`O,5?UO$BtQ!0MxO1G6WO%[QlO1G6WO$CUQ!0LrO1G6WO$CgQ`O1G6VO$CgQ`O1G6VO9eQ`O1G6VO$CoQ`O,5?XO9eQ`O,5?XOOQO,5?X,5?XO$DTQ`O,5?XO$+YQ`O,5?XOOQO-E<k-E<kOOQS1G0a1G0aOOQS1G0c1G0cO#.lQ`O1G0cOOQ[7+(e7+(eO!&zQMhO7+(eO%[QlO7+(eO$DcQ`O7+(eO$DnQMhO7+(eO$D|Q!0MzO,5=XO$GXQ!0MzO,5=ZO$IdQ!0MzO,5=XO$KuQ!0MzO,5=ZO$NWQ!0MzO,59uO%!]Q!0MzO,5<kO%$hQ!0MzO,5<mO%&sQ!0MzO,5<{OOQ!0Lf7+&a7+&aO%)UQ!0MxO7+&aO%)xQlO'#IfO%*VQ`O,5@cO%*_Q!fO,5@cOOQ!0Lf1G0P1G0PO%*iQ`O7+&jOOQ!0Lf7+&j7+&jO%*nQ?MtO,5:fO%[QlO7+&zO%*xQ?MtO,5:bO%+VQ?MtO,5:jO%+aQ?MtO,5:lO%+kQMhO'#IiO%+uQ`O,5@hOOQ!0Lh1G0d1G0dOOQO1G1r1G1rOOQO1G1s1G1sO%+}Q!jO,5<ZO!)[QlO,5<YOOQO-E<l-E<lOOQ!0Lf7+'Y7+'YOOOW7+'e7+'eOOOW1G1|1G1|O%,YQ`O1G1|OOQ!0Lf1G2O1G2OOOOO,59o,59oO%,_Q!dO,59oOOOO-E<`-E<`OOQ!0Lh1G/X1G/XO%,fQ!0MxO7+'kOOQ!0Lh,5?^,5?^O%-YQMhO1G2fP%-aQ`O'#IrPOQ!0Lh-E<p-E<pO%-}QMjO,5?aOOQ!0Lh-E<s-E<sO%.pQMjO,5?cOOQ!0Lh-E<u-E<uO%.zQ!dO1G2wO%/RQ!dO'#CrO%/iQMhO'#KSO$$wQlO'#JvOOQ!0Lh1G2_1G2_O%/sQ`O'#IqO%0[Q`O,5@vO%0[Q`O,5@vO%0dQ`O,5@vO%0oQ`O,5@vOOQO1G2a1G2aO%0}QMjO1G2`O$+YQ`O'#K[O!,TQMhO1G2`O%1_Q(CWO'#IsO%1lQ`O,5@wO!&zQMhO,5@wO%1tQ!dO,5@wOOQ!0Lh1G2d1G2dO%4UQ!fO'#CiO%4`Q`O,5=POOQ!0Lb,5<},5<}O%4hQpO,5<}OOQ!0Lb,5=O,5=OOCwQ`O,5<}O%4sQpO,5<}OOQ!0Lb,5=R,5=RO$+YQ`O,5=VOOQO,5?`,5?`OOQO-E<r-E<rOOQ!0Lp1G2h1G2hO#$`QpO,5<}O$$wQlO,5=PO%5RQ`O,5=OO%5^QpO,5=OO!,TQMhO'#IuO%6WQMjO1G2sO!,TQMhO'#IwO%6yQMjO1G2uO%7TQMjO1G5qO%7_QMjO1G5qOOQO,5?e,5?eOOQO-E<w-E<wOOQO1G.{1G.{O!,TQMhO1G5qO!,TQMhO1G5qO!:]QpO,59wO%[QlO,59wOOQ!0Lh,5<j,5<jO%7lQ`O1G2ZO!,TQMhO1G2bO%7qQ!0MxO7+'mOOQ!0Lf7+'m7+'mO!$wQlO7+'mO%8eQ`O,5;`OOQ!0Lb,5?g,5?gOOQ!0Lb-E<y-E<yO%8jQ!dO'#K^O#(ZQ`O7+(eO4UQ!fO7+(eO$DfQ`O7+(eO%8tQ!0MvO'#CiO%9XQ!0MvO,5=SO%9lQ`O,5=SO%9tQ`O,5=SOOQ!0Lb1G5o1G5oOOQ[7+$a7+$aO!ByQ!0LrO7+$aO!CUQpO7+$aO!$wQlO7+&aO%9yQ`O'#JQO%:bQ`O,5APOOQO1G3h1G3hO9kQ`O,5APO%:bQ`O,5APO%:jQ`O,5APOOQO,5?m,5?mOOQO-E=P-E=POOQ!0Lf7+'T7+'TO%:oQ`O7+)QO9uQ!0LrO7+)QO9kQ`O7+)QO@zQ`O7+)QO%:tQ`O7+)QOOQ[7+)Q7+)QOOQ[7+(p7+(pO%:yQ!0MvO7+(mO!&zQMhO7+(mO!E^Q`O7+(nOOQ[7+(n7+(nO!&zQMhO7+(nO%;TQ`O'#KbO%;`Q`O,5=lOOQO,5?i,5?iOOQO-E<{-E<{OOQ[7+(s7+(sO%<rQpO'#HZOOQ[1G3`1G3`O!&zQMhO1G3`O%[QlO1G3`O%<yQ`O1G3`O%=UQMhO1G3`O9uQ!0LrO1G3bO$%dQ`O1G3bO9`Q`O1G3bO!CUQpO1G3bO!C^QMhO1G3bO%=dQ`O'#JPO%=xQ`O,5@}O%>QQpO,5@}OOQ!0Lb1G3c1G3cOOQ[7+$V7+$VO@zQ`O7+$VO9uQ!0LrO7+$VO%>]Q`O7+$VO%[QlO1G6lO%[QlO1G6mO%>bQ!0LrO1G6lO%>lQlO1G3kO%>sQ`O1G3kO%>xQlO1G3kOOQ[7+)T7+)TO9uQ!0LrO7+)_O`QlO7+)aOOQ['#Kh'#KhOOQ['#JS'#JSO%?PQlO,5>`OOQ[,5>`,5>`O%[QlO'#HuO%?^Q`O'#HwOOQ[,5>f,5>fO9eQ`O,5>fOOQ[,5>h,5>hOOQ[7+)j7+)jOOQ[7+)p7+)pOOQ[7+)t7+)tOOQ[7+)v7+)vO%?cQpO1G5|O%?}Q?MtO1G0zO%@XQ`O1G0zOOQO1G/s1G/sO%@dQ?MtO1G/sO?YQ`O1G/sO!)[QlO'#DmOOQO,5?P,5?POOQO-E<c-E<cOOQO,5?V,5?VOOQO-E<i-E<iO!CUQpO1G/sOOQO-E<e-E<eOOQ!0Ln1G0]1G0]OOQ!0Lf7+%u7+%uO#(ZQ`O7+%uOOQ!0Lf7+&`7+&`O?YQ`O7+&`O!CUQpO7+&`OOQO7+%x7+%xO$AlQ!0MxO7+&XOOQO7+&X7+&XO%[QlO7+&XO%@nQ!0LrO7+&XO!ByQ!0LrO7+%xO!CUQpO7+%xO%@yQ!0LrO7+&XO%AXQ!0MxO7++rO%[QlO7++rO%AiQ`O7++qO%AiQ`O7++qOOQO1G4s1G4sO9eQ`O1G4sO%AqQ`O1G4sOOQS7+%}7+%}O#(ZQ`O<<LPO4UQ!fO<<LPO%BPQ`O<<LPOOQ[<<LP<<LPO!&zQMhO<<LPO%[QlO<<LPO%BXQ`O<<LPO%BdQ!0MzO,5?aO%DoQ!0MzO,5?cO%FzQ!0MzO1G2`O%I]Q!0MzO1G2sO%KhQ!0MzO1G2uO%MsQ!fO,5?QO%[QlO,5?QOOQO-E<d-E<dO%M}Q`O1G5}OOQ!0Lf<<JU<<JUO%NVQ?MtO1G0uO&!^Q?MtO1G1PO&!eQ?MtO1G1PO&$fQ?MtO1G1PO&$mQ?MtO1G1PO&&nQ?MtO1G1PO&(oQ?MtO1G1PO&(vQ?MtO1G1PO&(}Q?MtO1G1PO&+OQ?MtO1G1PO&+VQ?MtO1G1PO&+^Q!0MxO<<JfO&-UQ?MtO1G1PO&.RQ?MvO1G1PO&/UQ?MvO'#JlO&1[Q?MtO1G1cO&1iQ?MtO1G0UO&1sQMjO,5?TOOQO-E<g-E<gO!)[QlO'#FqOOQO'#KZ'#KZOOQO1G1u1G1uO&1}Q`O1G1tO&2SQ?MtO,5?[OOOW7+'h7+'hOOOO1G/Z1G/ZO&2^Q!dO1G4xOOQ!0Lh7+(Q7+(QP!&zQMhO,5?^O!,TQMhO7+(cO&2eQ`O,5?]O9eQ`O,5?]O$+YQ`O,5?]OOQO-E<o-E<oO&2sQ`O1G6bO&2sQ`O1G6bO&2{Q`O1G6bO&3WQMjO7+'zO&3hQ!dO,5?_O&3rQ`O,5?_O!&zQMhO,5?_OOQO-E<q-E<qO&3wQ!dO1G6cO&4RQ`O1G6cO&4ZQ`O1G2kO!&zQMhO1G2kOOQ!0Lb1G2i1G2iOOQ!0Lb1G2j1G2jO%4hQpO1G2iO!CUQpO1G2iOCwQ`O1G2iOOQ!0Lb1G2q1G2qO&4`QpO1G2iO&4nQ`O1G2kO$+YQ`O1G2jOCwQ`O1G2jO$$wQlO1G2kO&4vQ`O1G2jO&5jQMjO,5?aOOQ!0Lh-E<t-E<tO&6]QMjO,5?cOOQ!0Lh-E<v-E<vO!,TQMhO7++]O&6gQMjO7++]O&6qQMjO7++]OOQ!0Lh1G/c1G/cO&7OQ`O1G/cOOQ!0Lh7+'u7+'uO&7TQMjO7+'|O&7eQ!0MxO<<KXOOQ!0Lf<<KX<<KXO&8XQ`O1G0zO!&zQMhO'#IzO&8^Q`O,5@xO&:`Q!fO<<LPO!&zQMhO1G2nO&:gQ!0LrO1G2nOOQ[<<G{<<G{O!ByQ!0LrO<<G{O&:xQ!0MxO<<I{OOQ!0Lf<<I{<<I{OOQO,5?l,5?lO&;lQ`O,5?lO&;qQ`O,5?lOOQO-E=O-E=OO&<PQ`O1G6kO&<PQ`O1G6kO9kQ`O1G6kO@zQ`O<<LlOOQ[<<Ll<<LlO&<XQ`O<<LlO9uQ!0LrO<<LlO9kQ`O<<LlOOQ[<<LX<<LXO%:yQ!0MvO<<LXOOQ[<<LY<<LYO!E^Q`O<<LYO&<^QpO'#I|O&<iQ`O,5@|O!)[QlO,5@|OOQ[1G3W1G3WOOQO'#JO'#JOO9uQ!0LrO'#JOO&<qQpO,5=uOOQ[,5=u,5=uO&<xQpO'#EgO&=PQpO'#GeO&=UQ`O7+(zO&=ZQ`O7+(zOOQ[7+(z7+(zO!&zQMhO7+(zO%[QlO7+(zO&=cQ`O7+(zOOQ[7+(|7+(|O9uQ!0LrO7+(|O$%dQ`O7+(|O9`Q`O7+(|O!CUQpO7+(|O&=nQ`O,5?kOOQO-E<}-E<}OOQO'#H^'#H^O&=yQ`O1G6iO9uQ!0LrO<<GqOOQ[<<Gq<<GqO@zQ`O<<GqO&>RQ`O7+,WO&>WQ`O7+,XO%[QlO7+,WO%[QlO7+,XOOQ[7+)V7+)VO&>]Q`O7+)VO&>bQlO7+)VO&>iQ`O7+)VOOQ[<<Ly<<LyOOQ[<<L{<<L{OOQ[-E=Q-E=QOOQ[1G3z1G3zO&>nQ`O,5>aOOQ[,5>c,5>cO&>sQ`O1G4QO9eQ`O7+&fO!)[QlO7+&fOOQO7+%_7+%_O&>xQ?MtO1G6ZO?YQ`O7+%_OOQ!0Lf<<Ia<<IaOOQ!0Lf<<Iz<<IzO?YQ`O<<IzOOQO<<Is<<IsO$AlQ!0MxO<<IsO%[QlO<<IsOOQO<<Id<<IdO!ByQ!0LrO<<IdO&?SQ!0LrO<<IsO&?_Q!0MxO<= ^O&?oQ`O<= ]OOQO7+*_7+*_O9eQ`O7+*_OOQ[ANAkANAkO&?wQ!fOANAkO!&zQMhOANAkO#(ZQ`OANAkO4UQ!fOANAkO&@OQ`OANAkO%[QlOANAkO&@WQ!0MzO7+'zO&BiQ!0MzO,5?aO&DtQ!0MzO,5?cO&GPQ!0MzO7+'|O&IbQ!fO1G4lO&IlQ?MtO7+&aO&KpQ?MvO,5=XO&MwQ?MvO,5=ZO&NXQ?MvO,5=XO&NiQ?MvO,5=ZO&NyQ?MvO,59uO'#PQ?MvO,5<kO'%SQ?MvO,5<mO''hQ?MvO,5<{O')^Q?MtO7+'kO')kQ?MtO7+'mO')xQ`O,5<]OOQO7+'`7+'`OOQ!0Lh7+*d7+*dO')}QMjO<<K}OOQO1G4w1G4wO'*UQ`O1G4wO'*aQ`O1G4wO'*oQ`O7++|O'*oQ`O7++|O!&zQMhO1G4yO'*wQ!dO1G4yO'+RQ`O7++}O'+ZQ`O7+(VO'+fQ!dO7+(VOOQ!0Lb7+(T7+(TOOQ!0Lb7+(U7+(UO!CUQpO7+(TOCwQ`O7+(TO'+pQ`O7+(VO!&zQMhO7+(VO$+YQ`O7+(UO'+uQ`O7+(VOCwQ`O7+(UO'+}QMjO<<NwO!,TQMhO<<NwOOQ!0Lh7+$}7+$}O',XQ!dO,5?fOOQO-E<x-E<xO',cQ!0MvO7+(YO!&zQMhO7+(YOOQ[AN=gAN=gO9kQ`O1G5WOOQO1G5W1G5WO',sQ`O1G5WO',xQ`O7+,VO',xQ`O7+,VO9uQ!0LrOANBWO@zQ`OANBWOOQ[ANBWANBWO'-QQ`OANBWOOQ[ANAsANAsOOQ[ANAtANAtO'-VQ`O,5?hOOQO-E<z-E<zO'-bQ?MtO1G6hOOQO,5?j,5?jOOQO-E<|-E<|OOQ[1G3a1G3aO'-lQ`O,5=POOQ[<<Lf<<LfO!&zQMhO<<LfO&=UQ`O<<LfO'-qQ`O<<LfO%[QlO<<LfOOQ[<<Lh<<LhO9uQ!0LrO<<LhO$%dQ`O<<LhO9`Q`O<<LhO'-yQpO1G5VO'.UQ`O7+,TOOQ[AN=]AN=]O9uQ!0LrOAN=]OOQ[<= r<= rOOQ[<= s<= sO'.^Q`O<= rO'.cQ`O<= sOOQ[<<Lq<<LqO'.hQ`O<<LqO'.mQlO<<LqOOQ[1G3{1G3{O?YQ`O7+)lO'.tQ`O<<JQO'/PQ?MtO<<JQOOQO<<Hy<<HyOOQ!0LfAN?fAN?fOOQOAN?_AN?_O$AlQ!0MxOAN?_OOQOAN?OAN?OO%[QlOAN?_OOQO<<My<<MyOOQ[G27VG27VO!&zQMhOG27VO#(ZQ`OG27VO'/ZQ!fOG27VO4UQ!fOG27VO'/bQ`OG27VO'/jQ?MtO<<JfO'/wQ?MvO1G2`O'1mQ?MvO,5?aO'3pQ?MvO,5?cO'5sQ?MvO1G2sO'7vQ?MvO1G2uO'9yQ?MtO<<KXO':WQ?MtO<<I{OOQO1G1w1G1wO!,TQMhOANAiOOQO7+*c7+*cO':eQ`O7+*cO':pQ`O<= hO':xQ!dO7+*eOOQ!0Lb<<Kq<<KqO$+YQ`O<<KqOCwQ`O<<KqO';SQ`O<<KqO!&zQMhO<<KqOOQ!0Lb<<Ko<<KoO!CUQpO<<KoO';_Q!dO<<KqOOQ!0Lb<<Kp<<KpO';iQ`O<<KqO!&zQMhO<<KqO$+YQ`O<<KpO';nQMjOANDcO';xQ!0MvO<<KtOOQO7+*r7+*rO9kQ`O7+*rO'<YQ`O<= qOOQ[G27rG27rO9uQ!0LrOG27rO@zQ`OG27rO!)[QlO1G5SO'<bQ`O7+,SO'<jQ`O1G2kO&=UQ`OANBQOOQ[ANBQANBQO!&zQMhOANBQO'<oQ`OANBQOOQ[ANBSANBSO9uQ!0LrOANBSO$%dQ`OANBSOOQO'#H_'#H_OOQO7+*q7+*qOOQ[G22wG22wOOQ[ANE^ANE^OOQ[ANE_ANE_OOQ[ANB]ANB]O'<wQ`OANB]OOQ[<<MW<<MWO!)[QlOAN?lOOQOG24yG24yO$AlQ!0MxOG24yO#(ZQ`OLD,qOOQ[LD,qLD,qO!&zQMhOLD,qO'<|Q!fOLD,qO'=TQ?MvO7+'zO'>yQ?MvO,5?aO'@|Q?MvO,5?cO'CPQ?MvO7+'|O'DuQMjOG27TOOQO<<M}<<M}OOQ!0LbANA]ANA]O$+YQ`OANA]OCwQ`OANA]O'EVQ!dOANA]OOQ!0LbANAZANAZO'E^Q`OANA]O!&zQMhOANA]O'EiQ!dOANA]OOQ!0LbANA[ANA[OOQO<<N^<<N^OOQ[LD-^LD-^O9uQ!0LrOLD-^O'EsQ?MtO7+*nOOQO'#Gf'#GfOOQ[G27lG27lO&=UQ`OG27lO!&zQMhOG27lOOQ[G27nG27nO9uQ!0LrOG27nOOQ[G27wG27wO'E}Q?MtOG25WOOQOLD*eLD*eOOQ[!$(!]!$(!]O#(ZQ`O!$(!]O!&zQMhO!$(!]O'FXQ!0MzOG27TOOQ!0LbG26wG26wO$+YQ`OG26wO'HjQ`OG26wOCwQ`OG26wO'HuQ!dOG26wO!&zQMhOG26wOOQ[!$(!x!$(!xOOQ[LD-WLD-WO&=UQ`OLD-WOOQ[LD-YLD-YOOQ[!)9Ew!)9EwO#(ZQ`O!)9EwOOQ!0LbLD,cLD,cO$+YQ`OLD,cOCwQ`OLD,cO'H|Q`OLD,cO'IXQ!dOLD,cOOQ[!$(!r!$(!rOOQ[!.K;c!.K;cO'I`Q?MvOG27TOOQ!0Lb!$( }!$( }O$+YQ`O!$( }OCwQ`O!$( }O'KUQ`O!$( }OOQ!0Lb!)9Ei!)9EiO$+YQ`O!)9EiOCwQ`O!)9EiOOQ!0Lb!.K;T!.K;TO$+YQ`O!.K;TOOQ!0Lb!4/0o!4/0oO!)[QlO'#DzO1PQ`O'#EXO'KaQ!fO'#JrO'KhQ!L^O'#DvO'KoQlO'#EOO'KvQ!fO'#CiO'N^Q!fO'#CiO!)[QlO'#EQO'NnQlO,5;ZO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO,5;eO!)[QlO'#IpO(!qQ`O,5<iO!)[QlO,5;eO(!yQMhO,5;eO($dQMhO,5;eO!)[QlO,5;wO!&zQMhO'#GmO(!yQMhO'#GmO!&zQMhO'#GoO(!yQMhO'#GoO1SQ`O'#DZO1SQ`O'#DZO!&zQMhO'#GPO(!yQMhO'#GPO!&zQMhO'#GRO(!yQMhO'#GRO!&zQMhO'#GaO(!yQMhO'#GaO!)[QlO,5:jO($kQpO'#D_O($uQpO'#JvO!)[QlO,5@oO'NnQlO1G0uO(%PQ?MtO'#CiO!)[QlO1G2PO!&zQMhO'#IuO(!yQMhO'#IuO!&zQMhO'#IwO(!yQMhO'#IwO(%ZQ!dO'#CrO!&zQMhO,5<tO(!yQMhO,5<tO'NnQlO1G2RO!)[QlO7+&zO!&zQMhO1G2`O(!yQMhO1G2`O!&zQMhO'#IuO(!yQMhO'#IuO!&zQMhO'#IwO(!yQMhO'#IwO!&zQMhO1G2bO(!yQMhO1G2bO'NnQlO7+'mO'NnQlO7+&aO!&zQMhOANAiO(!yQMhOANAiO(%nQ`O'#EoO(%sQ`O'#EoO(%{Q`O'#F]O(&QQ`O'#EyO(&VQ`O'#KTO(&bQ`O'#KRO(&mQ`O,5;ZO(&rQMjO,5<eO(&yQ`O'#GYO('OQ`O'#GYO('TQ`O,5<eO(']Q`O,5<gO('eQ`O,5;ZO('mQ?MtO1G1`O('tQ`O,5<tO('yQ`O,5<tO((OQ`O,5<vO((TQ`O,5<vO((YQ`O1G2RO((_Q`O1G0uO((dQMjO<<K}O((kQMjO<<K}O((rQMhO'#F|O9`Q`O'#F{OAuQ`O'#EnO!)[QlO,5;tO!3oQ`O'#GYO!3oQ`O'#GYO!3oQ`O'#G[O!3oQ`O'#G[O!,TQMhO7+(cO!,TQMhO7+(cO%.zQ!dO1G2wO%.zQ!dO1G2wO!&zQMhO,5=]O!&zQMhO,5=]",
  stateData: "()x~O'|OS'}OSTOS(ORQ~OPYOQYOSfOY!VOaqOdzOeyOl!POpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!uwO!xxO!|]O$W|O$niO%h}O%j!QO%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO%y!UO&W!WO&^!XO&`!YO&b!ZO&d![O&g!]O&m!^O&s!_O&u!`O&w!aO&y!bO&{!cO(TSO(VTO(YUO(aVO(o[O~OWtO~P`OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oa!wOs!nO!S!oO!b!yO!c!vO!d!vO!|<VO#T!pO#U!pO#V!xO#W!pO#X!pO#[!zO#]!zO(U!lO(VTO(YUO(e!mO(o!sO~O(O!{O~OP]XR]X[]Xa]Xj]Xr]X!Q]X!S]X!]]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X'z]X(a]X(r]X(y]X(z]X~O!g%RX~P(qO_!}O(V#PO(W!}O(X#PO~O_#QO(X#PO(Y#PO(Z#QO~Ox#SO!U#TO(b#TO(c#VO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T<ZO(VTO(YUO(aVO(o[O~O![#ZO!]#WO!Y(hP!Y(vP~P+}O!^#cO~P`OPYOQYOSfOd!jOe!iOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(VTO(YUO(aVO(o[O~Op#mO![#iO!|]O#i#lO#j#iO(T<[O!k(sP~P.iO!l#oO(T#nO~O!x#sO!|]O%h#tO~O#k#uO~O!g#vO#k#uO~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!]$_O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~Oa(fX'z(fX'w(fX!k(fX!Y(fX!_(fX%i(fX!g(fX~P1qO#S$dO#`$eO$Q$eOP(gXR(gX[(gXj(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX!_(gX%i(gX~Oa(gX'z(gX'w(gX!Y(gX!k(gXv(gX!g(gX~P4UO#`$eO~O$]$hO$_$gO$f$mO~OSfO!_$nO$i$oO$k$qO~Oh%VOj%dOk%dOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#j%cO$W%`O$t%^O$v%_O$y%aO(T$sO(VTO(YUO(a$uO(y$}O(z%POg(^P~Ol%[O~P7eO!l%eO~O!S%hO!_%iO(T%gO~O!g%mO~Oa%nO'z%nO~O!Q%rO~P%[O(U!lO~P%[O%n%vO~P%[Oh%VO!l%eO(T%gO(U!lO~Oe%}O!l%eO(T%gO~Oj$RO~O!_&PO(T%gO(U!lO(VTO(YUO`)WP~O!Q&SO!l&RO%j&VO&T&WO~P;SO!x#sO~O%s&YO!S)SX!_)SX(T)SX~O(T&ZO~Ol!PO!u&`O%j!QO%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO~Od&eOe&dO!x&bO%h&cO%{&aO~P<bOd&hOeyOl!PO!_&gO!u&`O!xxO!|]O%h}O%l!OO%m!OO%n!OO%q!RO%s!SO%v!TO%w!TO%y!UO~Ob&kO#`&nO%j&iO(U!lO~P=gO!l&oO!u&sO~O!l#oO~O!_XO~Oa%nO'x&{O'z%nO~Oa%nO'x'OO'z%nO~Oa%nO'x'QO'z%nO~O'w]X!Y]Xv]X!k]X&[]X!_]X%i]X!g]X~P(qO!b'_O!c'WO!d'WO(U!lO(VTO(YUO~Os'UO!S'TO!['XO(e'SO!^(iP!^(xP~P@nOn'bO!_'`O(T%gO~Oe'gO!l%eO(T%gO~O!Q&SO!l&RO~Os!nO!S!oO!|<VO#T!pO#U!pO#W!pO#X!pO(U!lO(VTO(YUO(e!mO(o!sO~O!b'mO!c'lO!d'lO#V!pO#['nO#]'nO~PBYOa%nOh%VO!g#vO!l%eO'z%nO(r'pO~O!p'tO#`'rO~PChOs!nO!S!oO(VTO(YUO(e!mO(o!sO~O!_XOs(mX!S(mX!b(mX!c(mX!d(mX!|(mX#T(mX#U(mX#V(mX#W(mX#X(mX#[(mX#](mX(U(mX(V(mX(Y(mX(e(mX(o(mX~O!c'lO!d'lO(U!lO~PDWO(P'xO(Q'xO(R'zO~O_!}O(V'|O(W!}O(X'|O~O_#QO(X'|O(Y'|O(Z#QO~Ov(OO~P%[Ox#SO!U#TO(b#TO(c(RO~O![(TO!Y'WX!Y'^X!]'WX!]'^X~P+}O!](VO!Y(hX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!](VO!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~O!Y(hX~PHRO!Y([O~O!Y(uX!](uX!g(uX!k(uX(r(uX~O#`(uX#k#dX!^(uX~PJUO#`(]O!Y(wX!](wX~O!](^O!Y(vX~O!Y(aO~O#`$eO~PJUO!^(bO~P`OR#zO!Q#yO!S#{O!l#xO(aVOP!na[!naj!nar!na!]!na!p!na#R!na#n!na#o!na#p!na#q!na#r!na#s!na#t!na#u!na#v!na#x!na#z!na#{!na(r!na(y!na(z!na~Oa!na'z!na'w!na!Y!na!k!nav!na!_!na%i!na!g!na~PKlO!k(cO~O!g#vO#`(dO(r'pO!](tXa(tX'z(tX~O!k(tX~PNXO!S%hO!_%iO!|]O#i(iO#j(hO(T%gO~O!](jO!k(sX~O!k(lO~O!S%hO!_%iO#j(hO(T%gO~OP(gXR(gX[(gXj(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX~O!g#vO!k(gX~P! uOR(nO!Q(mO!l#xO#S$dO!|!{a!S!{a~O!x!{a%h!{a!_!{a#i!{a#j!{a(T!{a~P!#vO!x(rO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_XO!iuO!lZO!oYO!pYO!qYO!svO!u!gO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~O#k(xO~O![(zO!k(kP~P%[O(e(|O(o[O~O!S)OO!l#xO(e(|O(o[O~OP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_!eO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(T)]O(VTO(YUO(aVO(o[O~O!]$_Oa$qa'z$qa'w$qa!k$qa!Y$qa!_$qa%i$qa!g$qa~Ol)dO~P!&zOh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O%]O!S${O!_$|O!i%bO!l$xO#j%cO$W%`O$t%^O$v%_O$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~Og(pP~P!,TO!Q)iO!g)hO!_$^X$Z$^X$]$^X$_$^X$f$^X~O!g)hO!_({X$Z({X$]({X$_({X$f({X~O!Q)iO~P!.^O!Q)iO!_({X$Z({X$]({X$_({X$f({X~O!_)kO$Z)oO$])jO$_)jO$f)pO~O![)sO~P!)[O$]$hO$_$gO$f)wO~On$zX!Q$zX#S$zX'y$zX(y$zX(z$zX~OgmXg$zXnmX!]mX#`mX~P!0SOx)yO(b)zO(c)|O~On*VO!Q*OO'y*PO(y$}O(z%PO~Og)}O~P!1WOg*WO~Oh%VOr%XOs$tOt$tOz%YO|%ZO!O<sO!S*YO!_*ZO!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(VTO(YUO(a$uO(y$}O(z%PO~Op*`O![*^O(T*XO!k)OP~P!1uO#k*aO~O!l*bO~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(T*dO(VTO(YUO(a$uO(y$}O(z%PO~O![*gO!Y)PP~P!3tOr*sOs!nO!S*iO!b*qO!c*kO!d*kO!l*bO#[*rO%`*mO(U!lO(VTO(YUO(e!mO~O!^*pO~P!5iO#S$dOn(`X!Q(`X'y(`X(y(`X(z(`X!](`X#`(`X~Og(`X$O(`X~P!6kOn*xO#`*wOg(_X!](_X~O!]*yOg(^X~Oj%dOk%dOl%dO(T&ZOg(^P~Os*|O~Og)}O(T&ZO~O!l+SO~O(T(vO~Op+WO!S%hO![#iO!_%iO!|]O#i#lO#j#iO(T%gO!k(sP~O!g#vO#k+XO~O!S%hO![+ZO!](^O!_%iO(T%gO!Y(vP~Os'[O!S+]O![+[O(VTO(YUO(e(|O~O!^(xP~P!9|O!]+^Oa)TX'z)TX~OP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO#z$WO#{$XO(aVO(r$YO(y#|O(z#}O~Oa!ja!]!ja'z!ja'w!ja!Y!ja!k!jav!ja!_!ja%i!ja!g!ja~P!:tOR#zO!Q#yO!S#{O!l#xO(aVOP!ra[!raj!rar!ra!]!ra!p!ra#R!ra#n!ra#o!ra#p!ra#q!ra#r!ra#s!ra#t!ra#u!ra#v!ra#x!ra#z!ra#{!ra(r!ra(y!ra(z!ra~Oa!ra'z!ra'w!ra!Y!ra!k!rav!ra!_!ra%i!ra!g!ra~P!=[OR#zO!Q#yO!S#{O!l#xO(aVOP!ta[!taj!tar!ta!]!ta!p!ta#R!ta#n!ta#o!ta#p!ta#q!ta#r!ta#s!ta#t!ta#u!ta#v!ta#x!ta#z!ta#{!ta(r!ta(y!ta(z!ta~Oa!ta'z!ta'w!ta!Y!ta!k!tav!ta!_!ta%i!ta!g!ta~P!?rOh%VOn+gO!_'`O%i+fO~O!g+iOa(]X!_(]X'z(]X!](]X~Oa%nO!_XO'z%nO~Oh%VO!l%eO~Oh%VO!l%eO(T%gO~O!g#vO#k(xO~Ob+tO%j+uO(T+qO(VTO(YUO!^)XP~O!]+vO`)WX~O[+zO~O`+{O~O!_&PO(T%gO(U!lO`)WP~O%j,OO~P;SOh%VO#`,SO~Oh%VOn,VO!_$|O~O!_,XO~O!Q,ZO!_XO~O%n%vO~O!x,`O~Oe,eO~Ob,fO(T#nO(VTO(YUO!^)VP~Oe%}O~O%j!QO(T&ZO~P=gO[,kO`,jO~OPYOQYOSfOdzOeyOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!iuO!lZO!oYO!pYO!qYO!svO!xxO!|]O$niO%h}O(VTO(YUO(aVO(o[O~O!_!eO!u!gO$W!kO(T!dO~P!FyO`,jOa%nO'z%nO~OPYOQYOSfOd!jOe!iOpkOrYOskOtkOzkO|YO!OYO!SWO!WkO!XkO!_!eO!iuO!lZO!oYO!pYO!qYO!svO!x!hO$W!kO$niO(T!dO(VTO(YUO(aVO(o[O~Oa,pOl!OO!uwO%l!OO%m!OO%n!OO~P!IcO!l&oO~O&^,vO~O!_,xO~O&o,zO&q,{OP&laQ&laS&laY&laa&lad&lae&lal&lap&lar&las&lat&laz&la|&la!O&la!S&la!W&la!X&la!_&la!i&la!l&la!o&la!p&la!q&la!s&la!u&la!x&la!|&la$W&la$n&la%h&la%j&la%l&la%m&la%n&la%q&la%s&la%v&la%w&la%y&la&W&la&^&la&`&la&b&la&d&la&g&la&m&la&s&la&u&la&w&la&y&la&{&la'w&la(T&la(V&la(Y&la(a&la(o&la!^&la&e&lab&la&j&la~O(T-QO~Oh!eX!]!RX!^!RX!g!RX!g!eX!l!eX#`!RX~O!]!eX!^!eX~P#!iO!g-VO#`-UOh(jX!]#hX!^#hX!g(jX!l(jX~O!](jX!^(jX~P##[Oh%VO!g-XO!l%eO!]!aX!^!aX~Os!nO!S!oO(VTO(YUO(e!mO~OP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_!eO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(VTO(YUO(aVO(o[O~O(T=QO~P#$qO!]-]O!^(iX~O!^-_O~O!g-VO#`-UO!]#hX!^#hX~O!]-`O!^(xX~O!^-bO~O!c-cO!d-cO(U!lO~P#$`O!^-fO~P'_On-iO!_'`O~O!Y-nO~Os!{a!b!{a!c!{a!d!{a#T!{a#U!{a#V!{a#W!{a#X!{a#[!{a#]!{a(U!{a(V!{a(Y!{a(e!{a(o!{a~P!#vO!p-sO#`-qO~PChO!c-uO!d-uO(U!lO~PDWOa%nO#`-qO'z%nO~Oa%nO!g#vO#`-qO'z%nO~Oa%nO!g#vO!p-sO#`-qO'z%nO(r'pO~O(P'xO(Q'xO(R-zO~Ov-{O~O!Y'Wa!]'Wa~P!:tO![.PO!Y'WX!]'WX~P%[O!](VO!Y(ha~O!Y(ha~PHRO!](^O!Y(va~O!S%hO![.TO!_%iO(T%gO!Y'^X!]'^X~O#`.VO!](ta!k(taa(ta'z(ta~O!g#vO~P#,wO!](jO!k(sa~O!S%hO!_%iO#j.ZO(T%gO~Op.`O!S%hO![.]O!_%iO!|]O#i._O#j.]O(T%gO!]'aX!k'aX~OR.dO!l#xO~Oh%VOn.gO!_'`O%i.fO~Oa#ci!]#ci'z#ci'w#ci!Y#ci!k#civ#ci!_#ci%i#ci!g#ci~P!:tOn>]O!Q*OO'y*PO(y$}O(z%PO~O#k#_aa#_a#`#_a'z#_a!]#_a!k#_a!_#_a!Y#_a~P#/sO#k(`XP(`XR(`X[(`Xa(`Xj(`Xr(`X!S(`X!l(`X!p(`X#R(`X#n(`X#o(`X#p(`X#q(`X#r(`X#s(`X#t(`X#u(`X#v(`X#x(`X#z(`X#{(`X'z(`X(a(`X(r(`X!k(`X!Y(`X'w(`Xv(`X!_(`X%i(`X!g(`X~P!6kO!].tO!k(kX~P!:tO!k.wO~O!Y.yO~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(aVO[#mia#mij#mir#mi!]#mi#R#mi#o#mi#p#mi#q#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#n#mi~P#3cO#n$OO~P#3cOP$[OR#zOr$aO!Q#yO!S#{O!l#xO!p$[O#n$OO#o$PO#p$PO#q$PO(aVO[#mia#mij#mi!]#mi#R#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#r#mi~P#6QO#r$QO~P#6QOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO(aVOa#mi!]#mi#x#mi#z#mi#{#mi'z#mi(r#mi(y#mi(z#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#v#mi~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO(aVO(z#}Oa#mi!]#mi#z#mi#{#mi'z#mi(r#mi(y#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#x$UO~P#;VO#x#mi~P#;VO#v$SO~P#8oOP$[OR#zO[$cOj$ROr$aO!Q#yO!S#{O!l#xO!p$[O#R$RO#n$OO#o$PO#p$PO#q$PO#r$QO#s$RO#t$RO#u$bO#v$SO#x$UO(aVO(y#|O(z#}Oa#mi!]#mi#{#mi'z#mi(r#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~O#z#mi~P#={O#z$WO~P#={OP]XR]X[]Xj]Xr]X!Q]X!S]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X!]]X!^]X~O$O]X~P#@jOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO#x<eO#z<gO#{<hO(aVO(r$YO(y#|O(z#}O~O$O.{O~P#BwO#S$dO#`<nO$Q<nO$O(gX!^(gX~P! uOa'da!]'da'z'da'w'da!k'da!Y'dav'da!_'da%i'da!g'da~P!:tO[#mia#mij#mir#mi!]#mi#R#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi'z#mi(r#mi'w#mi!Y#mi!k#miv#mi!_#mi%i#mi!g#mi~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#n$OO#o$PO#p$PO#q$PO(aVO(y#mi(z#mi~P#EyOn>]O!Q*OO'y*PO(y$}O(z%POP#miR#mi!S#mi!l#mi!p#mi#n#mi#o#mi#p#mi#q#mi(a#mi~P#EyO!]/POg(pX~P!1WOg/RO~Oa$Pi!]$Pi'z$Pi'w$Pi!Y$Pi!k$Piv$Pi!_$Pi%i$Pi!g$Pi~P!:tO$]/SO$_/SO~O$]/TO$_/TO~O!g)hO#`/UO!_$cX$Z$cX$]$cX$_$cX$f$cX~O![/VO~O!_)kO$Z/XO$])jO$_)jO$f/YO~O!]<iO!^(fX~P#BwO!^/ZO~O!g)hO$f({X~O$f/]O~Ov/^O~P!&zOx)yO(b)zO(c/aO~O!S/dO~O(y$}On%aa!Q%aa'y%aa(z%aa!]%aa#`%aa~Og%aa$O%aa~P#L{O(z%POn%ca!Q%ca'y%ca(y%ca!]%ca#`%ca~Og%ca$O%ca~P#MnO!]fX!gfX!kfX!k$zX(rfX~P!0SOp%WO![/mO!](^O(T/lO!Y(vP!Y)PP~P!1uOr*sO!b*qO!c*kO!d*kO!l*bO#[*rO%`*mO(U!lO(VTO(YUO~Os<}O!S/nO![+[O!^*pO(e<|O!^(xP~P$ [O!k/oO~P#/sO!]/pO!g#vO(r'pO!k)OX~O!k/uO~OnoX!QoX'yoX(yoX(zoX~O!g#vO!koX~P$#OOp/wO!S%hO![*^O!_%iO(T%gO!k)OP~O#k/xO~O!Y$zX!]$zX!g%RX~P!0SO!]/yO!Y)PX~P#/sO!g/{O~O!Y/}O~OpkO(T0OO~P.iOh%VOr0TO!g#vO!l%eO(r'pO~O!g+iO~Oa%nO!]0XO'z%nO~O!^0ZO~P!5iO!c0[O!d0[O(U!lO~P#$`Os!nO!S0]O(VTO(YUO(e!mO~O#[0_O~Og%aa!]%aa#`%aa$O%aa~P!1WOg%ca!]%ca#`%ca$O%ca~P!1WOj%dOk%dOl%dO(T&ZOg'mX!]'mX~O!]*yOg(^a~Og0hO~On0jO#`0iOg(_a!](_a~OR0kO!Q0kO!S0lO#S$dOn}a'y}a(y}a(z}a!]}a#`}a~Og}a$O}a~P$(cO!Q*OO'y*POn$sa(y$sa(z$sa!]$sa#`$sa~Og$sa$O$sa~P$)_O!Q*OO'y*POn$ua(y$ua(z$ua!]$ua#`$ua~Og$ua$O$ua~P$*QO#k0oO~Og%Ta!]%Ta#`%Ta$O%Ta~P!1WO!g#vO~O#k0rO~O!]+^Oa)Ta'z)Ta~OR#zO!Q#yO!S#{O!l#xO(aVOP!ri[!rij!rir!ri!]!ri!p!ri#R!ri#n!ri#o!ri#p!ri#q!ri#r!ri#s!ri#t!ri#u!ri#v!ri#x!ri#z!ri#{!ri(r!ri(y!ri(z!ri~Oa!ri'z!ri'w!ri!Y!ri!k!riv!ri!_!ri%i!ri!g!ri~P$+oOh%VOr%XOs$tOt$tOz%YO|%ZO!O<sO!S${O!_$|O!i>VO!l$xO#j<yO$W%`O$t<uO$v<wO$y%aO(VTO(YUO(a$uO(y$}O(z%PO~Op0{O%]0|O(T0zO~P$.VO!g+iOa(]a!_(]a'z(]a!](]a~O#k1SO~O[]X!]fX!^fX~O!]1TO!^)XX~O!^1VO~O[1WO~Ob1YO(T+qO(VTO(YUO~O!_&PO(T%gO`'uX!]'uX~O!]+vO`)Wa~O!k1]O~P!:tO[1`O~O`1aO~O#`1fO~On1iO!_$|O~O(e(|O!^)UP~Oh%VOn1rO!_1oO%i1qO~O[1|O!]1zO!^)VX~O!^1}O~O`2POa%nO'z%nO~O(T#nO(VTO(YUO~O#S$dO#`$eO$Q$eOP(gXR(gX[(gXr(gX!Q(gX!S(gX!](gX!l(gX!p(gX#R(gX#n(gX#o(gX#p(gX#q(gX#r(gX#s(gX#t(gX#u(gX#v(gX#x(gX#z(gX#{(gX(a(gX(r(gX(y(gX(z(gX~Oj2SO&[2TOa(gX~P$3pOj2SO#`$eO&[2TO~Oa2VO~P%[Oa2XO~O&e2[OP&ciQ&ciS&ciY&cia&cid&cie&cil&cip&cir&cis&cit&ciz&ci|&ci!O&ci!S&ci!W&ci!X&ci!_&ci!i&ci!l&ci!o&ci!p&ci!q&ci!s&ci!u&ci!x&ci!|&ci$W&ci$n&ci%h&ci%j&ci%l&ci%m&ci%n&ci%q&ci%s&ci%v&ci%w&ci%y&ci&W&ci&^&ci&`&ci&b&ci&d&ci&g&ci&m&ci&s&ci&u&ci&w&ci&y&ci&{&ci'w&ci(T&ci(V&ci(Y&ci(a&ci(o&ci!^&cib&ci&j&ci~Ob2bO!^2`O&j2aO~P`O!_XO!l2dO~O&q,{OP&liQ&liS&liY&lia&lid&lie&lil&lip&lir&lis&lit&liz&li|&li!O&li!S&li!W&li!X&li!_&li!i&li!l&li!o&li!p&li!q&li!s&li!u&li!x&li!|&li$W&li$n&li%h&li%j&li%l&li%m&li%n&li%q&li%s&li%v&li%w&li%y&li&W&li&^&li&`&li&b&li&d&li&g&li&m&li&s&li&u&li&w&li&y&li&{&li'w&li(T&li(V&li(Y&li(a&li(o&li!^&li&e&lib&li&j&li~O!Y2jO~O!]!aa!^!aa~P#BwOs!nO!S!oO![2pO(e!mO!]'XX!^'XX~P@nO!]-]O!^(ia~O!]'_X!^'_X~P!9|O!]-`O!^(xa~O!^2wO~P'_Oa%nO#`3QO'z%nO~Oa%nO!g#vO#`3QO'z%nO~Oa%nO!g#vO!p3UO#`3QO'z%nO(r'pO~Oa%nO'z%nO~P!:tO!]$_Ov$qa~O!Y'Wi!]'Wi~P!:tO!](VO!Y(hi~O!](^O!Y(vi~O!Y(wi!](wi~P!:tO!](ti!k(tia(ti'z(ti~P!:tO#`3WO!](ti!k(tia(ti'z(ti~O!](jO!k(si~O!S%hO!_%iO!|]O#i3]O#j3[O(T%gO~O!S%hO!_%iO#j3[O(T%gO~On3dO!_'`O%i3cO~Oh%VOn3dO!_'`O%i3cO~O#k%aaP%aaR%aa[%aaa%aaj%aar%aa!S%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa'z%aa(a%aa(r%aa!k%aa!Y%aa'w%aav%aa!_%aa%i%aa!g%aa~P#L{O#k%caP%caR%ca[%caa%caj%car%ca!S%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca'z%ca(a%ca(r%ca!k%ca!Y%ca'w%cav%ca!_%ca%i%ca!g%ca~P#MnO#k%aaP%aaR%aa[%aaa%aaj%aar%aa!S%aa!]%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa'z%aa(a%aa(r%aa!k%aa!Y%aa'w%aa#`%aav%aa!_%aa%i%aa!g%aa~P#/sO#k%caP%caR%ca[%caa%caj%car%ca!S%ca!]%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca'z%ca(a%ca(r%ca!k%ca!Y%ca'w%ca#`%cav%ca!_%ca%i%ca!g%ca~P#/sO#k}aP}a[}aa}aj}ar}a!l}a!p}a#R}a#n}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#x}a#z}a#{}a'z}a(a}a(r}a!k}a!Y}a'w}av}a!_}a%i}a!g}a~P$(cO#k$saP$saR$sa[$saa$saj$sar$sa!S$sa!l$sa!p$sa#R$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#t$sa#u$sa#v$sa#x$sa#z$sa#{$sa'z$sa(a$sa(r$sa!k$sa!Y$sa'w$sav$sa!_$sa%i$sa!g$sa~P$)_O#k$uaP$uaR$ua[$uaa$uaj$uar$ua!S$ua!l$ua!p$ua#R$ua#n$ua#o$ua#p$ua#q$ua#r$ua#s$ua#t$ua#u$ua#v$ua#x$ua#z$ua#{$ua'z$ua(a$ua(r$ua!k$ua!Y$ua'w$uav$ua!_$ua%i$ua!g$ua~P$*QO#k%TaP%TaR%Ta[%Taa%Taj%Tar%Ta!S%Ta!]%Ta!l%Ta!p%Ta#R%Ta#n%Ta#o%Ta#p%Ta#q%Ta#r%Ta#s%Ta#t%Ta#u%Ta#v%Ta#x%Ta#z%Ta#{%Ta'z%Ta(a%Ta(r%Ta!k%Ta!Y%Ta'w%Ta#`%Tav%Ta!_%Ta%i%Ta!g%Ta~P#/sOa#cq!]#cq'z#cq'w#cq!Y#cq!k#cqv#cq!_#cq%i#cq!g#cq~P!:tO![3lO!]'YX!k'YX~P%[O!].tO!k(ka~O!].tO!k(ka~P!:tO!Y3oO~O$O!na!^!na~PKlO$O!ja!]!ja!^!ja~P#BwO$O!ra!^!ra~P!=[O$O!ta!^!ta~P!?rOg']X!]']X~P!,TO!]/POg(pa~OSfO!_4TO$d4UO~O!^4YO~Ov4ZO~P#/sOa$mq!]$mq'z$mq'w$mq!Y$mq!k$mqv$mq!_$mq%i$mq!g$mq~P!:tO!Y4]O~P!&zO!S4^O~O!Q*OO'y*PO(z%POn'ia(y'ia!]'ia#`'ia~Og'ia$O'ia~P%-fO!Q*OO'y*POn'ka(y'ka(z'ka!]'ka#`'ka~Og'ka$O'ka~P%.XO(r$YO~P#/sO!YfX!Y$zX!]fX!]$zX!g%RX#`fX~P!0SOp%WO(T=WO~P!1uOp4bO!S%hO![4aO!_%iO(T%gO!]'eX!k'eX~O!]/pO!k)Oa~O!]/pO!g#vO!k)Oa~O!]/pO!g#vO(r'pO!k)Oa~Og$|i!]$|i#`$|i$O$|i~P!1WO![4jO!Y'gX!]'gX~P!3tO!]/yO!Y)Pa~O!]/yO!Y)Pa~P#/sOP]XR]X[]Xj]Xr]X!Q]X!S]X!Y]X!]]X!l]X!p]X#R]X#S]X#`]X#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X~Oj%YX!g%YX~P%2OOj4oO!g#vO~Oh%VO!g#vO!l%eO~Oh%VOr4tO!l%eO(r'pO~Or4yO!g#vO(r'pO~Os!nO!S4zO(VTO(YUO(e!mO~O(y$}On%ai!Q%ai'y%ai(z%ai!]%ai#`%ai~Og%ai$O%ai~P%5oO(z%POn%ci!Q%ci'y%ci(y%ci!]%ci#`%ci~Og%ci$O%ci~P%6bOg(_i!](_i~P!1WO#`5QOg(_i!](_i~P!1WO!k5VO~Oa$oq!]$oq'z$oq'w$oq!Y$oq!k$oqv$oq!_$oq%i$oq!g$oq~P!:tO!Y5ZO~O!]5[O!_)QX~P#/sOa$zX!_$zX%^]X'z$zX!]$zX~P!0SO%^5_OaoX!_oX'zoX!]oX~P$#OOp5`O(T#nO~O%^5_O~Ob5fO%j5gO(T+qO(VTO(YUO!]'tX!^'tX~O!]1TO!^)Xa~O[5kO~O`5lO~O[5pO~Oa%nO'z%nO~P#/sO!]5uO#`5wO!^)UX~O!^5xO~Or6OOs!nO!S*iO!b!yO!c!vO!d!vO!|<VO#T!pO#U!pO#V!pO#W!pO#X!pO#[5}O#]!zO(U!lO(VTO(YUO(e!mO(o!sO~O!^5|O~P%;eOn6TO!_1oO%i6SO~Oh%VOn6TO!_1oO%i6SO~Ob6[O(T#nO(VTO(YUO!]'sX!^'sX~O!]1zO!^)Va~O(VTO(YUO(e6^O~O`6bO~Oj6eO&[6fO~PNXO!k6gO~P%[Oa6iO~Oa6iO~P%[Ob2bO!^6nO&j2aO~P`O!g6pO~O!g6rOh(ji!](ji!^(ji!g(ji!l(jir(ji(r(ji~O!]#hi!^#hi~P#BwO#`6sO!]#hi!^#hi~O!]!ai!^!ai~P#BwOa%nO#`6|O'z%nO~Oa%nO!g#vO#`6|O'z%nO~O!](tq!k(tqa(tq'z(tq~P!:tO!](jO!k(sq~O!S%hO!_%iO#j7TO(T%gO~O!_'`O%i7WO~On7[O!_'`O%i7WO~O#k'iaP'iaR'ia['iaa'iaj'iar'ia!S'ia!l'ia!p'ia#R'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#v'ia#x'ia#z'ia#{'ia'z'ia(a'ia(r'ia!k'ia!Y'ia'w'iav'ia!_'ia%i'ia!g'ia~P%-fO#k'kaP'kaR'ka['kaa'kaj'kar'ka!S'ka!l'ka!p'ka#R'ka#n'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#x'ka#z'ka#{'ka'z'ka(a'ka(r'ka!k'ka!Y'ka'w'kav'ka!_'ka%i'ka!g'ka~P%.XO#k$|iP$|iR$|i[$|ia$|ij$|ir$|i!S$|i!]$|i!l$|i!p$|i#R$|i#n$|i#o$|i#p$|i#q$|i#r$|i#s$|i#t$|i#u$|i#v$|i#x$|i#z$|i#{$|i'z$|i(a$|i(r$|i!k$|i!Y$|i'w$|i#`$|iv$|i!_$|i%i$|i!g$|i~P#/sO#k%aiP%aiR%ai[%aia%aij%air%ai!S%ai!l%ai!p%ai#R%ai#n%ai#o%ai#p%ai#q%ai#r%ai#s%ai#t%ai#u%ai#v%ai#x%ai#z%ai#{%ai'z%ai(a%ai(r%ai!k%ai!Y%ai'w%aiv%ai!_%ai%i%ai!g%ai~P%5oO#k%ciP%ciR%ci[%cia%cij%cir%ci!S%ci!l%ci!p%ci#R%ci#n%ci#o%ci#p%ci#q%ci#r%ci#s%ci#t%ci#u%ci#v%ci#x%ci#z%ci#{%ci'z%ci(a%ci(r%ci!k%ci!Y%ci'w%civ%ci!_%ci%i%ci!g%ci~P%6bO!]'Ya!k'Ya~P!:tO!].tO!k(ki~O$O#ci!]#ci!^#ci~P#BwOP$[OR#zO!Q#yO!S#{O!l#xO!p$[O(aVO[#mij#mir#mi#R#mi#o#mi#p#mi#q#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#n#mi~P%NdO#n<_O~P%NdOP$[OR#zOr<kO!Q#yO!S#{O!l#xO!p$[O#n<_O#o<`O#p<`O#q<`O(aVO[#mij#mi#R#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#r#mi~P&!lO#r<aO~P&!lOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO(aVO#x#mi#z#mi#{#mi$O#mi(r#mi(y#mi(z#mi!]#mi!^#mi~O#v#mi~P&$tOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO(aVO(z#}O#z#mi#{#mi$O#mi(r#mi(y#mi!]#mi!^#mi~O#x<eO~P&&uO#x#mi~P&&uO#v<cO~P&$tOP$[OR#zO[<mOj<bOr<kO!Q#yO!S#{O!l#xO!p$[O#R<bO#n<_O#o<`O#p<`O#q<`O#r<aO#s<bO#t<bO#u<lO#v<cO#x<eO(aVO(y#|O(z#}O#{#mi$O#mi(r#mi!]#mi!^#mi~O#z#mi~P&)UO#z<gO~P&)UOa#|y!]#|y'z#|y'w#|y!Y#|y!k#|yv#|y!_#|y%i#|y!g#|y~P!:tO[#mij#mir#mi#R#mi#r#mi#s#mi#t#mi#u#mi#v#mi#x#mi#z#mi#{#mi$O#mi(r#mi!]#mi!^#mi~OP$[OR#zO!Q#yO!S#{O!l#xO!p$[O#n<_O#o<`O#p<`O#q<`O(aVO(y#mi(z#mi~P&,QOn>^O!Q*OO'y*PO(y$}O(z%POP#miR#mi!S#mi!l#mi!p#mi#n#mi#o#mi#p#mi#q#mi(a#mi~P&,QO#S$dOP(`XR(`X[(`Xj(`Xn(`Xr(`X!Q(`X!S(`X!l(`X!p(`X#R(`X#n(`X#o(`X#p(`X#q(`X#r(`X#s(`X#t(`X#u(`X#v(`X#x(`X#z(`X#{(`X$O(`X'y(`X(a(`X(r(`X(y(`X(z(`X!](`X!^(`X~O$O$Pi!]$Pi!^$Pi~P#BwO$O!ri!^!ri~P$+oOg']a!]']a~P!1WO!^7nO~O!]'da!^'da~P#BwO!Y7oO~P#/sO!g#vO(r'pO!]'ea!k'ea~O!]/pO!k)Oi~O!]/pO!g#vO!k)Oi~Og$|q!]$|q#`$|q$O$|q~P!1WO!Y'ga!]'ga~P#/sO!g7vO~O!]/yO!Y)Pi~P#/sO!]/yO!Y)Pi~O!Y7yO~Oh%VOr8OO!l%eO(r'pO~Oj8QO!g#vO~Or8TO!g#vO(r'pO~O!Q*OO'y*PO(z%POn'ja(y'ja!]'ja#`'ja~Og'ja$O'ja~P&5RO!Q*OO'y*POn'la(y'la(z'la!]'la#`'la~Og'la$O'la~P&5tOg(_q!](_q~P!1WO#`8VOg(_q!](_q~P!1WO!Y8WO~Og%Oq!]%Oq#`%Oq$O%Oq~P!1WOa$oy!]$oy'z$oy'w$oy!Y$oy!k$oyv$oy!_$oy%i$oy!g$oy~P!:tO!g6rO~O!]5[O!_)Qa~O!_'`OP$TaR$Ta[$Taj$Tar$Ta!Q$Ta!S$Ta!]$Ta!l$Ta!p$Ta#R$Ta#n$Ta#o$Ta#p$Ta#q$Ta#r$Ta#s$Ta#t$Ta#u$Ta#v$Ta#x$Ta#z$Ta#{$Ta(a$Ta(r$Ta(y$Ta(z$Ta~O%i7WO~P&8fO%^8[Oa%[i!_%[i'z%[i!]%[i~Oa#cy!]#cy'z#cy'w#cy!Y#cy!k#cyv#cy!_#cy%i#cy!g#cy~P!:tO[8^O~Ob8`O(T+qO(VTO(YUO~O!]1TO!^)Xi~O`8dO~O(e(|O!]'pX!^'pX~O!]5uO!^)Ua~O!^8nO~P%;eO(o!sO~P$&YO#[8oO~O!_1oO~O!_1oO%i8qO~On8tO!_1oO%i8qO~O[8yO!]'sa!^'sa~O!]1zO!^)Vi~O!k8}O~O!k9OO~O!k9RO~O!k9RO~P%[Oa9TO~O!g9UO~O!k9VO~O!](wi!^(wi~P#BwOa%nO#`9_O'z%nO~O!](ty!k(tya(ty'z(ty~P!:tO!](jO!k(sy~O%i9bO~P&8fO!_'`O%i9bO~O#k$|qP$|qR$|q[$|qa$|qj$|qr$|q!S$|q!]$|q!l$|q!p$|q#R$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#t$|q#u$|q#v$|q#x$|q#z$|q#{$|q'z$|q(a$|q(r$|q!k$|q!Y$|q'w$|q#`$|qv$|q!_$|q%i$|q!g$|q~P#/sO#k'jaP'jaR'ja['jaa'jaj'jar'ja!S'ja!l'ja!p'ja#R'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#x'ja#z'ja#{'ja'z'ja(a'ja(r'ja!k'ja!Y'ja'w'jav'ja!_'ja%i'ja!g'ja~P&5RO#k'laP'laR'la['laa'laj'lar'la!S'la!l'la!p'la#R'la#n'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#x'la#z'la#{'la'z'la(a'la(r'la!k'la!Y'la'w'lav'la!_'la%i'la!g'la~P&5tO#k%OqP%OqR%Oq[%Oqa%Oqj%Oqr%Oq!S%Oq!]%Oq!l%Oq!p%Oq#R%Oq#n%Oq#o%Oq#p%Oq#q%Oq#r%Oq#s%Oq#t%Oq#u%Oq#v%Oq#x%Oq#z%Oq#{%Oq'z%Oq(a%Oq(r%Oq!k%Oq!Y%Oq'w%Oq#`%Oqv%Oq!_%Oq%i%Oq!g%Oq~P#/sO!]'Yi!k'Yi~P!:tO$O#cq!]#cq!^#cq~P#BwO(y$}OP%aaR%aa[%aaj%aar%aa!S%aa!l%aa!p%aa#R%aa#n%aa#o%aa#p%aa#q%aa#r%aa#s%aa#t%aa#u%aa#v%aa#x%aa#z%aa#{%aa$O%aa(a%aa(r%aa!]%aa!^%aa~On%aa!Q%aa'y%aa(z%aa~P&IyO(z%POP%caR%ca[%caj%car%ca!S%ca!l%ca!p%ca#R%ca#n%ca#o%ca#p%ca#q%ca#r%ca#s%ca#t%ca#u%ca#v%ca#x%ca#z%ca#{%ca$O%ca(a%ca(r%ca!]%ca!^%ca~On%ca!Q%ca'y%ca(y%ca~P&LQOn>^O!Q*OO'y*PO(z%PO~P&IyOn>^O!Q*OO'y*PO(y$}O~P&LQOR0kO!Q0kO!S0lO#S$dOP}a[}aj}an}ar}a!l}a!p}a#R}a#n}a#o}a#p}a#q}a#r}a#s}a#t}a#u}a#v}a#x}a#z}a#{}a$O}a'y}a(a}a(r}a(y}a(z}a!]}a!^}a~O!Q*OO'y*POP$saR$sa[$saj$san$sar$sa!S$sa!l$sa!p$sa#R$sa#n$sa#o$sa#p$sa#q$sa#r$sa#s$sa#t$sa#u$sa#v$sa#x$sa#z$sa#{$sa$O$sa(a$sa(r$sa(y$sa(z$sa!]$sa!^$sa~O!Q*OO'y*POP$uaR$ua[$uaj$uan$uar$ua!S$ua!l$ua!p$ua#R$ua#n$ua#o$ua#p$ua#q$ua#r$ua#s$ua#t$ua#u$ua#v$ua#x$ua#z$ua#{$ua$O$ua(a$ua(r$ua(y$ua(z$ua!]$ua!^$ua~On>^O!Q*OO'y*PO(y$}O(z%PO~OP%TaR%Ta[%Taj%Tar%Ta!S%Ta!l%Ta!p%Ta#R%Ta#n%Ta#o%Ta#p%Ta#q%Ta#r%Ta#s%Ta#t%Ta#u%Ta#v%Ta#x%Ta#z%Ta#{%Ta$O%Ta(a%Ta(r%Ta!]%Ta!^%Ta~P''VO$O$mq!]$mq!^$mq~P#BwO$O$oq!]$oq!^$oq~P#BwO!^9oO~O$O9pO~P!1WO!g#vO!]'ei!k'ei~O!g#vO(r'pO!]'ei!k'ei~O!]/pO!k)Oq~O!Y'gi!]'gi~P#/sO!]/yO!Y)Pq~Or9wO!g#vO(r'pO~O[9yO!Y9xO~P#/sO!Y9xO~Oj:PO!g#vO~Og(_y!](_y~P!1WO!]'na!_'na~P#/sOa%[q!_%[q'z%[q!]%[q~P#/sO[:UO~O!]1TO!^)Xq~O`:YO~O#`:ZO!]'pa!^'pa~O!]5uO!^)Ui~P#BwO!S:]O~O!_1oO%i:`O~O(VTO(YUO(e:eO~O!]1zO!^)Vq~O!k:hO~O!k:iO~O!k:jO~O!k:jO~P%[O#`:mO!]#hy!^#hy~O!]#hy!^#hy~P#BwO%i:rO~P&8fO!_'`O%i:rO~O$O#|y!]#|y!^#|y~P#BwOP$|iR$|i[$|ij$|ir$|i!S$|i!l$|i!p$|i#R$|i#n$|i#o$|i#p$|i#q$|i#r$|i#s$|i#t$|i#u$|i#v$|i#x$|i#z$|i#{$|i$O$|i(a$|i(r$|i!]$|i!^$|i~P''VO!Q*OO'y*PO(z%POP'iaR'ia['iaj'ian'iar'ia!S'ia!l'ia!p'ia#R'ia#n'ia#o'ia#p'ia#q'ia#r'ia#s'ia#t'ia#u'ia#v'ia#x'ia#z'ia#{'ia$O'ia(a'ia(r'ia(y'ia!]'ia!^'ia~O!Q*OO'y*POP'kaR'ka['kaj'kan'kar'ka!S'ka!l'ka!p'ka#R'ka#n'ka#o'ka#p'ka#q'ka#r'ka#s'ka#t'ka#u'ka#v'ka#x'ka#z'ka#{'ka$O'ka(a'ka(r'ka(y'ka(z'ka!]'ka!^'ka~O(y$}OP%aiR%ai[%aij%ain%air%ai!Q%ai!S%ai!l%ai!p%ai#R%ai#n%ai#o%ai#p%ai#q%ai#r%ai#s%ai#t%ai#u%ai#v%ai#x%ai#z%ai#{%ai$O%ai'y%ai(a%ai(r%ai(z%ai!]%ai!^%ai~O(z%POP%ciR%ci[%cij%cin%cir%ci!Q%ci!S%ci!l%ci!p%ci#R%ci#n%ci#o%ci#p%ci#q%ci#r%ci#s%ci#t%ci#u%ci#v%ci#x%ci#z%ci#{%ci$O%ci'y%ci(a%ci(r%ci(y%ci!]%ci!^%ci~O$O$oy!]$oy!^$oy~P#BwO$O#cy!]#cy!^#cy~P#BwO!g#vO!]'eq!k'eq~O!]/pO!k)Oy~O!Y'gq!]'gq~P#/sOr:|O!g#vO(r'pO~O[;QO!Y;PO~P#/sO!Y;PO~Og(_!R!](_!R~P!1WOa%[y!_%[y'z%[y!]%[y~P#/sO!]1TO!^)Xy~O!]5uO!^)Uq~O(T;XO~O!_1oO%i;[O~O!k;_O~O%i;dO~P&8fOP$|qR$|q[$|qj$|qr$|q!S$|q!l$|q!p$|q#R$|q#n$|q#o$|q#p$|q#q$|q#r$|q#s$|q#t$|q#u$|q#v$|q#x$|q#z$|q#{$|q$O$|q(a$|q(r$|q!]$|q!^$|q~P''VO!Q*OO'y*PO(z%POP'jaR'ja['jaj'jan'jar'ja!S'ja!l'ja!p'ja#R'ja#n'ja#o'ja#p'ja#q'ja#r'ja#s'ja#t'ja#u'ja#v'ja#x'ja#z'ja#{'ja$O'ja(a'ja(r'ja(y'ja!]'ja!^'ja~O!Q*OO'y*POP'laR'la['laj'lan'lar'la!S'la!l'la!p'la#R'la#n'la#o'la#p'la#q'la#r'la#s'la#t'la#u'la#v'la#x'la#z'la#{'la$O'la(a'la(r'la(y'la(z'la!]'la!^'la~OP%OqR%Oq[%Oqj%Oqr%Oq!S%Oq!l%Oq!p%Oq#R%Oq#n%Oq#o%Oq#p%Oq#q%Oq#r%Oq#s%Oq#t%Oq#u%Oq#v%Oq#x%Oq#z%Oq#{%Oq$O%Oq(a%Oq(r%Oq!]%Oq!^%Oq~P''VOg%e!Z!]%e!Z#`%e!Z$O%e!Z~P!1WO!Y;hO~P#/sOr;iO!g#vO(r'pO~O[;kO!Y;hO~P#/sO!]'pq!^'pq~P#BwO!]#h!Z!^#h!Z~P#BwO#k%e!ZP%e!ZR%e!Z[%e!Za%e!Zj%e!Zr%e!Z!S%e!Z!]%e!Z!l%e!Z!p%e!Z#R%e!Z#n%e!Z#o%e!Z#p%e!Z#q%e!Z#r%e!Z#s%e!Z#t%e!Z#u%e!Z#v%e!Z#x%e!Z#z%e!Z#{%e!Z'z%e!Z(a%e!Z(r%e!Z!k%e!Z!Y%e!Z'w%e!Z#`%e!Zv%e!Z!_%e!Z%i%e!Z!g%e!Z~P#/sOr;tO!g#vO(r'pO~O!Y;uO~P#/sOr;|O!g#vO(r'pO~O!Y;}O~P#/sOP%e!ZR%e!Z[%e!Zj%e!Zr%e!Z!S%e!Z!l%e!Z!p%e!Z#R%e!Z#n%e!Z#o%e!Z#p%e!Z#q%e!Z#r%e!Z#s%e!Z#t%e!Z#u%e!Z#v%e!Z#x%e!Z#z%e!Z#{%e!Z$O%e!Z(a%e!Z(r%e!Z!]%e!Z!^%e!Z~P''VOr<QO!g#vO(r'pO~Ov(fX~P1qO!Q%rO~P!)[O(U!lO~P!)[O!YfX!]fX#`fX~P%2OOP]XR]X[]Xj]Xr]X!Q]X!S]X!]]X!]fX!l]X!p]X#R]X#S]X#`]X#`fX#kfX#n]X#o]X#p]X#q]X#r]X#s]X#t]X#u]X#v]X#x]X#z]X#{]X$Q]X(a]X(r]X(y]X(z]X~O!gfX!k]X!kfX(rfX~P'LTOP<UOQ<UOSfOd>ROe!iOpkOr<UOskOtkOzkO|<UO!O<UO!SWO!WkO!XkO!_XO!i<XO!lZO!o<UO!p<UO!q<UO!s<YO!u<]O!x!hO$W!kO$n>PO(T)]O(VTO(YUO(aVO(o[O~O!]<iO!^$qa~Oh%VOp%WOr%XOs$tOt$tOz%YO|%ZO!O<tO!S${O!_$|O!i>WO!l$xO#j<zO$W%`O$t<vO$v<xO$y%aO(T(vO(VTO(YUO(a$uO(y$}O(z%PO~Ol)dO~P(!yOr!eX(r!eX~P#!iOr(jX(r(jX~P##[O!^]X!^fX~P'LTO!YfX!Y$zX!]fX!]$zX#`fX~P!0SO#k<^O~O!g#vO#k<^O~O#`<nO~Oj<bO~O#`=OO!](wX!^(wX~O#`<nO!](uX!^(uX~O#k=PO~Og=RO~P!1WO#k=XO~O#k=YO~Og=RO(T&ZO~O!g#vO#k=ZO~O!g#vO#k=PO~O$O=[O~P#BwO#k=]O~O#k=^O~O#k=cO~O#k=dO~O#k=eO~O#k=fO~O$O=gO~P!1WO$O=hO~P!1WOl=sO~P7eOk#S#T#U#W#X#[#i#j#u$n$t$v$y%]%^%h%i%j%q%s%v%w%y%{~(OT#o!X'|(U#ps#n#qr!Q'}$]'}(T$_(e~",
  goto: "$9Y)]PPPPPP)^PP)aP)rP+W/]PPPP6mPP7TPP=QPPP@tPA^PA^PPPA^PCfPA^PA^PA^PCjPCoPD^PIWPPPI[PPPPI[L_PPPLeMVPI[PI[PP! eI[PPPI[PI[P!#lI[P!'S!(X!(bP!)U!)Y!)U!,gPPPPPPP!-W!(XPP!-h!/YP!2iI[I[!2n!5z!:h!:h!>gPPP!>oI[PPPPPPPPP!BOP!C]PPI[!DnPI[PI[I[I[I[I[PI[!FQP!I[P!LbP!Lf!Lp!Lt!LtP!IXP!Lx!LxP#!OP#!SI[PI[#!Y#%_CjA^PA^PA^A^P#&lA^A^#)OA^#+vA^#.SA^A^#.r#1W#1W#1]#1f#1W#1qPP#1WPA^#2ZA^#6YA^A^6mPPP#:_PPP#:x#:xP#:xP#;`#:xPP#;fP#;]P#;]#;y#;]#<e#<k#<n)aP#<q)aP#<z#<z#<zP)aP)aP)aP)aPP)aP#=Q#=TP#=T)aP#=XP#=[P)aP)aP)aP)aP)aP)a)aPP#=b#=h#=s#=y#>P#>V#>]#>k#>q#>{#?R#?]#?c#?s#?y#@k#@}#AT#AZ#Ai#BO#Cs#DR#DY#Et#FS#Gt#HS#HY#H`#Hf#Hp#Hv#H|#IW#Ij#IpPPPPPPPPPPP#IvPPPPPPP#Jk#Mx$ b$ i$ qPPP$']P$'f$*_$0x$0{$1O$1}$2Q$2X$2aP$2g$2jP$3W$3[$4S$5b$5g$5}PP$6S$6Y$6^$6a$6e$6i$7e$7|$8e$8i$8l$8o$8y$8|$9Q$9UR!|RoqOXst!Z#d%m&r&t&u&w,s,x2[2_Y!vQ'`-e1o5{Q%tvQ%|yQ&T|Q&j!VS'W!e-]Q'f!iS'l!r!yU*k$|*Z*oQ+o%}S+|&V&WQ,d&dQ-c'_Q-m'gQ-u'mQ0[*qQ1b,OQ1y,eR<{<Y%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+],p,s,x-i-q.P.V.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3l4z6T6e6f6i6|8t9T9_S#q]<V!r)_$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SU+P%]<s<tQ+t&PQ,f&gQ,m&oQ0x+gQ0}+iQ1Y+uQ2R,kQ3`.gQ5`0|Q5f1TQ6[1zQ7Y3dQ8`5gR9e7['QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S!S!nQ!r!v!y!z$|'W'_'`'l'm'n*k*o*q*r-]-c-e-u0[0_1o5{5}%[$ti#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^Q&X|Q'U!eS'[%i-`Q+t&PQ,P&WQ,f&gQ0n+SQ1Y+uQ1_+{Q2Q,jQ2R,kQ5f1TQ5o1aQ6[1zQ6_1|Q6`2PQ8`5gQ8c5lQ8|6bQ:X8dQ:f8yQ;V:YR<}*ZrnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_R,h&k&z^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'b'r(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>R>S[#]WZ#W#Z'X(T!b%jm#h#i#l$x%e%h(^(h(i(j*Y*^*b+Z+[+^,o-V.T.Z.[.]._/m/p2d3[3]4a6r7TQ%wxQ%{yW&Q|&V&W,OQ&_!TQ'c!hQ'e!iQ(q#sS+n%|%}Q+r&PQ,_&bQ,c&dS-l'f'gQ.i(rQ1R+oQ1X+uQ1Z+vQ1^+zQ1t,`S1x,d,eQ2|-mQ5e1TQ5i1WQ5n1`Q6Z1yQ8_5gQ8b5kQ8f5pQ:T8^R;T:U!U$zi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y!^%yy!i!u%{%|%}'V'e'f'g'k'u*j+n+o-Y-l-m-t0R0U1R2u2|3T4r4s4v7}9{Q+h%wQ,T&[Q,W&]Q,b&dQ.h(qQ1s,_U1w,c,d,eQ3e.iQ6U1tS6Y1x1yQ8x6Z#f>T#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^o>U<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hW%Ti%V*y>PS&[!Q&iQ&]!RQ&^!SU*}%[%d=sR,R&Y%]%Si#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^T)z$u){V+P%]<s<tW'[!e%i*Z-`S(}#y#zQ+c%rQ+y&SS.b(m(nQ1j,XQ5T0kR8i5u'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S$i$^c#Y#e%q%s%u(S(Y(t(y)R)S)T)U)V)W)X)Y)Z)[)^)`)b)g)q+d+x-Z-x-}.S.U.s.v.z.|.}/O/b0p2k2n3O3V3k3p3q3r3s3t3u3v3w3x3y3z3{3|4P4Q4X5X5c6u6{7Q7a7b7k7l8k9X9]9g9m9n:o;W;`<W=vT#TV#U'RkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ'Y!eR2q-]!W!nQ!e!r!v!y!z$|'W'_'`'l'm'n*Z*k*o*q*r-]-c-e-u0[0_1o5{5}R1l,ZnqOXst!Z#d%m&r&t&u&w,s,x2[2_Q&y!^Q'v!xS(s#u<^Q+l%zQ,]&_Q,^&aQ-j'dQ-w'oS.r(x=PS0q+X=ZQ1P+mQ1n,[Q2c,zQ2e,{Q2m-WQ2z-kQ2}-oS5Y0r=eQ5a1QS5d1S=fQ6t2oQ6x2{Q6}3SQ8]5bQ9Y6vQ9Z6yQ9^7OR:l9V$d$]c#Y#e%s%u(S(Y(t(y)R)S)T)U)V)W)X)Y)Z)[)^)`)b)g)q+d+x-Z-x-}.S.U.s.v.z.}/O/b0p2k2n3O3V3k3p3q3r3s3t3u3v3w3x3y3z3{3|4P4Q4X5X5c6u6{7Q7a7b7k7l8k9X9]9g9m9n:o;W;`<W=vS(o#p'iQ)P#zS+b%q.|S.c(n(pR3^.d'QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SS#q]<VQ&t!XQ&u!YQ&w![Q&x!]R2Z,vQ'a!hQ+e%wQ-h'cS.e(q+hQ2x-gW3b.h.i0w0yQ6w2yW7U3_3a3e5^U9a7V7X7ZU:q9c9d9fS;b:p:sQ;p;cR;x;qU!wQ'`-eT5y1o5{!Q_OXZ`st!V!Z#d#h%e%m&i&k&r&t&u&w(j,s,x.[2[2_]!pQ!r'`-e1o5{T#q]<V%^{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_S(}#y#zS.b(m(n!s=l$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SU$fd)_,mS(p#p'iU*v%R(w4OU0m+O.n7gQ5^0xQ7V3`Q9d7YR:s9em!tQ!r!v!y!z'`'l'm'n-e-u1o5{5}Q't!uS(f#g2US-s'k'wQ/s*]Q0R*jQ3U-vQ4f/tQ4r0TQ4s0UQ4x0^Q7r4`S7}4t4vS8R4y4{Q9r7sQ9v7yQ9{8OQ:Q8TS:{9w9xS;g:|;PS;s;h;iS;{;t;uS<P;|;}R<S<QQ#wbQ's!uS(e#g2US(g#m+WQ+Y%fQ+j%xQ+p&OU-r'k't'wQ.W(fU/r*]*`/wQ0S*jQ0V*lQ1O+kQ1u,aS3R-s-vQ3Z.`S4e/s/tQ4n0PS4q0R0^Q4u0WQ6W1vQ7P3US7q4`4bQ7u4fU7|4r4x4{Q8P4wQ8v6XS9q7r7sQ9u7yQ9}8RQ:O8SQ:c8wQ:y9rS:z9v9xQ;S:QQ;^:dS;f:{;PS;r;g;hS;z;s;uS<O;{;}Q<R<PQ<T<SQ=o=jQ={=tR=|=uV!wQ'`-e%^aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_S#wz!j!r=i$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SR=o>R%^bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_Q%fj!^%xy!i!u%{%|%}'V'e'f'g'k'u*j+n+o-Y-l-m-t0R0U1R2u2|3T4r4s4v7}9{S&Oz!jQ+k%yQ,a&dW1v,b,c,d,eU6X1w1x1yS8w6Y6ZQ:d8x!r=j$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ=t>QR=u>R%QeOPXYstuvw!Z!`!g!o#S#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_Y#bWZ#W#Z(T!b%jm#h#i#l$x%e%h(^(h(i(j*Y*^*b+Z+[+^,o-V.T.Z.[.]._/m/p2d3[3]4a6r7TQ,n&o!p=k$Z$n)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SR=n'XU']!e%i*ZR2s-`%SdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+],p,s,x-i-q.P.V.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3l4z6T6e6f6i6|8t9T9_!r)_$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SQ,m&oQ0x+gQ3`.gQ7Y3dR9e7[!b$Tc#Y%q(S(Y(t(y)Z)[)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<W!P<d)^)q-Z.|2k2n3p3y3z4P4X6u7b7k7l8k9X9g9m9n;W;`=v!f$Vc#Y%q(S(Y(t(y)W)X)Z)[)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<W!T<f)^)q-Z.|2k2n3p3v3w3y3z4P4X6u7b7k7l8k9X9g9m9n;W;`=v!^$Zc#Y%q(S(Y(t(y)`)g+x-x-}.S.U.s.v/b0p3O3V3k3{5X5c6{7Q7a9]:o<WQ4_/kz>S)^)q-Z.|2k2n3p4P4X6u7b7k7l8k9X9g9m9n;W;`=vQ>X>ZR>Y>['QkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>SS$oh$pR4U/U'XgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/U/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>ST$kf$qQ$ifS)j$l)nR)v$qT$jf$qT)l$l)n'XhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$Z$_$a$e$n$p%m%t&R&k&n&o&r&t&u&w&{'T'X'b'r(T(V(](d(x(z)O)s)}*i+X+]+g,p,s,x-U-X-i-q.P.V.g.t.{/U/V/n0]0l0r1S1r2S2T2V2X2[2_2a2p3Q3W3d3l4T4z5w6T6e6f6i6s6|7[8t9T9_:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>ST$oh$pQ$rhR)u$p%^jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#x#{$O$P$Q$R$S$T$U$V$W$X$_$a$e%m%t&R&k&n&o&r&t&u&w&{'T'b'r(T(V(](d(x(z)O)}*i+X+]+g,p,s,x-i-q.P.V.g.t.{/n0]0l0r1S1r2S2T2V2X2[2_2a3Q3W3d3l4z6T6e6f6i6|7[8t9T9_!s>Q$Z$n'X)s-U-X/V2p4T5w6s:Z:m<U<X<Y<]<^<_<`<a<b<c<d<e<f<g<h<i<k<n<{=O=P=R=Z=[=e=f>S#glOPXZst!Z!`!o#S#d#o#{$n%m&k&n&o&r&t&u&w&{'T'b)O)s*i+]+g,p,s,x-i.g/V/n0]0l1r2S2T2V2X2[2_2a3d4T4z6T6e6f6i7[8t9T!U%Ri$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y#f(w#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^Q+T%aQ/c*Oo4O<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!U$yi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>YQ*c$zU*l$|*Z*oQ+U%bQ0W*m#f=q#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n=r<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hQ=w>TQ=x>UQ=y>VR=z>W!U%Ri$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y#f(w#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^o4O<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=hnoOXst!Z#d%m&r&t&u&w,s,x2[2_S*f${*YQ-R'OQ-S'QR4i/y%[%Si#v$b$c$d$x${%O%Q%^%_%c)y*R*T*V*Y*a*g*w*x+f+i,S,V.f/P/d/m/x/y/{0`0b0i0j0o1f1i1q3c4^4_4j4o5Q5[5_6S7W7v8Q8V8[8q9b9p9y:P:`:r;Q;[;d;k<l<m<o<p<q<r<u<v<w<x<y<z=S=T=U=V=X=Y=]=^=_=`=a=b=c=d=g=h>P>X>Y>]>^Q,U&]Q1h,WQ5s1gR8h5tV*n$|*Z*oU*n$|*Z*oT5z1o5{S0P*i/nQ4w0]T8S4z:]Q+j%xQ0V*lQ1O+kQ1u,aQ6W1vQ8v6XQ:c8wR;^:d!U%Oi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Yx*R$v)e*S*u+V/v0d0e4R4g5R5S5W7p8U:R:x=p=}>OS0`*t0a#f<o#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n<p<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!d=S(u)c*[*e.j.m.q/_/k/|0v1e3h4[4h4l5r7]7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[`=T3}7c7f7j9h:t:w;yS=_.l3iT=`7e9k!U%Qi$d%O%Q%^%_%c*R*T*a*w*x/P/x0`0b0i0j0o4_5Q8V9p>P>X>Y|*T$v)e*U*t+V/g/v0d0e4R4g4|5R5S5W7p8U:R:x=p=}>OS0b*u0c#f<q#v$b$c$x${)y*V*Y*g+f+i,S,V.f/d/m/y/{1f1i1q3c4^4j4o5[5_6S7W7v8Q8[8q9b9y:P:`:r;Q;[;d;k<o<q<u<w<y=S=U=X=]=_=a=c=g>]>^n<r<l<m<p<r<v<x<z=T=V=Y=^=`=b=d=h!h=U(u)c*[*e.k.l.q/_/k/|0v1e3f3h4[4h4l5r7]7^7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[d=V3}7d7e7j9h9i:t:u:w;yS=a.m3jT=b7f9lrnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_Q&f!UR,p&ornOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_R&f!UQ,Y&^R1d,RsnOXst!V!Z#d%m&i&r&t&u&w,s,x2[2_Q1p,_S6R1s1tU8p6P6Q6US:_8r8sS;Y:^:aQ;m;ZR;w;nQ&m!VR,i&iR6_1|R:f8yW&Q|&V&W,OR1Z+vQ&r!WR,s&sR,y&xT2],x2_R,}&yQ,|&yR2f,}Q'y!{R-y'ySsOtQ#dXT%ps#dQ#OTR'{#OQ#RUR'}#RQ){$uR/`){Q#UVR(Q#UQ#XWU(W#X(X.QQ(X#YR.Q(YQ-^'YR2r-^Q.u(yS3m.u3nR3n.vQ-e'`R2v-eY!rQ'`-e1o5{R'j!rQ/Q)eR4S/QU#_W%h*YU(_#_(`.RQ(`#`R.R(ZQ-a']R2t-at`OXst!V!Z#d%m&i&k&r&t&u&w,s,x2[2_S#hZ%eU#r`#h.[R.[(jQ(k#jQ.X(gW.a(k.X3X7RQ3X.YR7R3YQ)n$lR/W)nQ$phR)t$pQ$`cU)a$`-|<jQ-|<WR<j)qQ/q*]W4c/q4d7t9sU4d/r/s/tS7t4e4fR9s7u$e*Q$v(u)c)e*[*e*t*u+Q+R+V.l.m.o.p.q/_/g/i/k/v/|0d0e0v1e3f3g3h3}4R4[4g4h4l4|5O5R5S5W5r7]7^7_7`7e7f7h7i7j7p7w7z8U8X8Z9h9i9j9t9|:R:S:t:u:v:w:x:};R;e;j;v;y=p=}>O>Z>[Q/z*eU4k/z4m7xQ4m/|R7x4lS*o$|*ZR0Y*ox*S$v)e*t*u+V/v0d0e4R4g5R5S5W7p8U:R:x=p=}>O!d.j(u)c*[*e.l.m.q/_/k/|0v1e3h4[4h4l5r7]7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[U/h*S.j7ca7c3}7e7f7j9h:t:w;yQ0a*tQ3i.lU4}0a3i9kR9k7e|*U$v)e*t*u+V/g/v0d0e4R4g4|5R5S5W7p8U:R:x=p=}>O!h.k(u)c*[*e.l.m.q/_/k/|0v1e3f3h4[4h4l5r7]7^7`7w7z8X8Z9t9|:S:};R;e;j;v>Z>[U/j*U.k7de7d3}7e7f7j9h9i:t:u:w;yQ0c*uQ3j.mU5P0c3j9lR9l7fQ*z%UR0g*zQ5]0vR8Y5]Q+_%kR0u+_Q5v1jS8j5v:[R:[8kQ,[&_R1m,[Q5{1oR8m5{Q1{,fS6]1{8zR8z6_Q1U+rW5h1U5j8a:VQ5j1XQ8a5iR:V8bQ+w&QR1[+wQ2_,xR6m2_YrOXst#dQ&v!ZQ+a%mQ,r&rQ,t&tQ,u&uQ,w&wQ2Y,sS2],x2_R6l2[Q%opQ&z!_Q&}!aQ'P!bQ'R!cQ'q!uQ+`%lQ+l%zQ,Q&XQ,h&mQ-P&|W-p'k's't'wQ-w'oQ0X*nQ1P+mQ1c,PS2O,i,lQ2g-OQ2h-RQ2i-SQ2}-oW3P-r-s-v-xQ5a1QQ5m1_Q5q1eQ6V1uQ6a2QQ6k2ZU6z3O3R3UQ6}3SQ8]5bQ8e5oQ8g5rQ8l5zQ8u6WQ8{6`S9[6{7PQ9^7OQ:W8cQ:b8vQ:g8|Q:n9]Q;U:XQ;]:cQ;a:oQ;l;VR;o;^Q%zyQ'd!iQ'o!uU+m%{%|%}Q-W'VU-k'e'f'gS-o'k'uQ0Q*jS1Q+n+oQ2o-YS2{-l-mQ3S-tS4p0R0UQ5b1RQ6v2uQ6y2|Q7O3TU7{4r4s4vQ9z7}R;O9{S$wi>PR*{%VU%Ui%V>PR0f*yQ$viS(u#v+iS)c$b$cQ)e$dQ*[$xS*e${*YQ*t%OQ*u%QQ+Q%^Q+R%_Q+V%cQ.l<oQ.m<qQ.o<uQ.p<wQ.q<yQ/_)yQ/g*RQ/i*TQ/k*VQ/v*aS/|*g/mQ0d*wQ0e*xl0v+f,V.f1i1q3c6S7W8q9b:`:r;[;dQ1e,SQ3f=SQ3g=UQ3h=XS3}<l<mQ4R/PS4[/d4^Q4g/xQ4h/yQ4l/{Q4|0`Q5O0bQ5R0iQ5S0jQ5W0oQ5r1fQ7]=]Q7^=_Q7_=aQ7`=cQ7e<pQ7f<rQ7h<vQ7i<xQ7j<zQ7p4_Q7w4jQ7z4oQ8U5QQ8X5[Q8Z5_Q9h=YQ9i=TQ9j=VQ9t7vQ9|8QQ:R8VQ:S8[Q:t=^Q:u=`Q:v=bQ:w=dQ:x9pQ:}9yQ;R:PQ;e=gQ;j;QQ;v;kQ;y=hQ=p>PQ=}>XQ>O>YQ>Z>]R>[>^Q+O%]Q.n<sR7g<tnpOXst!Z#d%m&r&t&u&w,s,x2[2_Q!fPS#fZ#oQ&|!`W'h!o*i0]4zQ(P#SQ)Q#{Q)r$nS,l&k&nQ,q&oQ-O&{S-T'T/nQ-g'bQ.x)OQ/[)sQ0s+]Q0y+gQ2W,pQ2y-iQ3a.gQ4W/VQ5U0lQ6Q1rQ6c2SQ6d2TQ6h2VQ6j2XQ6o2aQ7Z3dQ7m4TQ8s6TQ9P6eQ9Q6fQ9S6iQ9f7[Q:a8tR:k9T#[cOPXZst!Z!`!o#d#o#{%m&k&n&o&r&t&u&w&{'T'b)O*i+]+g,p,s,x-i.g/n0]0l1r2S2T2V2X2[2_2a3d4z6T6e6f6i7[8t9TQ#YWQ#eYQ%quQ%svS%uw!gS(S#W(VQ(Y#ZQ(t#uQ(y#xQ)R$OQ)S$PQ)T$QQ)U$RQ)V$SQ)W$TQ)X$UQ)Y$VQ)Z$WQ)[$XQ)^$ZQ)`$_Q)b$aQ)g$eW)q$n)s/V4TQ+d%tQ+x&RS-Z'X2pQ-x'rS-}(T.PQ.S(]Q.U(dQ.s(xQ.v(zQ.z<UQ.|<XQ.}<YQ/O<]Q/b)}Q0p+XQ2k-UQ2n-XQ3O-qQ3V.VQ3k.tQ3p<^Q3q<_Q3r<`Q3s<aQ3t<bQ3u<cQ3v<dQ3w<eQ3x<fQ3y<gQ3z<hQ3{.{Q3|<kQ4P<nQ4Q<{Q4X<iQ5X0rQ5c1SQ6u=OQ6{3QQ7Q3WQ7a3lQ7b=PQ7k=RQ7l=ZQ8k5wQ9X6sQ9]6|Q9g=[Q9m=eQ9n=fQ:o9_Q;W:ZQ;`:mQ<W#SR=v>SR#[WR'Z!el!tQ!r!v!y!z'`'l'm'n-e-u1o5{5}S'V!e-]U*j$|*Z*oS-Y'W'_S0U*k*qQ0^*rQ2u-cQ4v0[R4{0_R({#xQ!fQT-d'`-e]!qQ!r'`-e1o5{Q#p]R'i<VR)f$dY!uQ'`-e1o5{Q'k!rS'u!v!yS'w!z5}S-t'l'mQ-v'nR3T-uT#kZ%eS#jZ%eS%km,oU(g#h#i#lS.Y(h(iQ.^(jQ0t+^Q3Y.ZU3Z.[.]._S7S3[3]R9`7Td#^W#W#Z%h(T(^*Y+Z.T/mr#gZm#h#i#l%e(h(i(j+^.Z.[.]._3[3]7TS*]$x*bQ/t*^Q2U,oQ2l-VQ4`/pQ6q2dQ7s4aQ9W6rT=m'X+[V#aW%h*YU#`W%h*YS(U#W(^U(Z#Z+Z/mS-['X+[T.O(T.TV'^!e%i*ZQ$lfR)x$qT)m$l)nR4V/UT*_$x*bT*h${*YQ0w+fQ1g,VQ3_.fQ5t1iQ6P1qQ7X3cQ8r6SQ9c7WQ:^8qQ:p9bQ;Z:`Q;c:rQ;n;[R;q;dnqOXst!Z#d%m&r&t&u&w,s,x2[2_Q&l!VR,h&itmOXst!U!V!Z#d%m&i&r&t&u&w,s,x2[2_R,o&oT%lm,oR1k,XR,g&gQ&U|S+}&V&WR1^,OR+s&PT&p!W&sT&q!W&sT2^,x2_",
  nodeNames: "⚠ ArithOp ArithOp ?. JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList in out const TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewTarget new NewExpression ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression TypeArgList CompareOp < declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression InstantiationExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast < ArrowFunction TypeParamList SequenceExpression InstantiationExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate asserts is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration defer ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 380,
  context: wS,
  nodeProps: [
    ["isolate", -8, 5, 6, 14, 37, 39, 51, 53, 55, ""],
    ["group", -26, 9, 17, 19, 68, 207, 211, 215, 216, 218, 221, 224, 234, 237, 243, 245, 247, 249, 252, 258, 264, 266, 268, 270, 272, 274, 275, "Statement", -34, 13, 14, 32, 35, 36, 42, 51, 54, 55, 57, 62, 70, 72, 76, 80, 82, 84, 85, 110, 111, 120, 121, 136, 139, 141, 142, 143, 144, 145, 147, 148, 167, 169, 171, "Expression", -23, 31, 33, 37, 41, 43, 45, 173, 175, 177, 178, 180, 181, 182, 184, 185, 186, 188, 189, 190, 201, 203, 205, 206, "Type", -3, 88, 103, 109, "ClassItem"],
    ["openedBy", 23, "<", 38, "InterpolationStart", 56, "[", 60, "{", 73, "(", 160, "JSXStartCloseTag"],
    ["closedBy", -2, 24, 168, ">", 40, "InterpolationEnd", 50, "]", 61, "}", 74, ")", 165, "JSXEndTag"]
  ],
  propSources: [AS],
  skippedNodes: [0, 5, 6, 278],
  repeatNodeCount: 37,
  tokenData: "$Fq07[R!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$,r!c!}Er!}#O$-|#O#P$/W#P#Q$4o#Q#R$5y#R#SEr#S#T$7W#T#o$8b#o#p$<r#p#q$=h#q#r$>x#r#s$@U#s$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$I|Er$I|$I}$Dk$I}$JO$Dk$JO$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr(n%d_$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$i&j(Z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU(Z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$i&j(WpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(WpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z07[+rq$i&j(Wp(Z!b'|0/lOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z07[.ST(X#S$i&j'}0/lO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c07[.n_$i&j(Wp(Z!b'}0/lOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)3p/x`$i&j!p),Q(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW1V`#v(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW2d_#v(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At3l_(V':f$i&j(Z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$i&j(Z!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$i&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$d`$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$d``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$d`$i&j(Z!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ(Z!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$d`(Z!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k%9[:hh$i&j(Wp(Z!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__WS$i&j(Wp(Z!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]WS$i&j(Z!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXWS$i&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSWSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWWS(Z!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]WS$i&j(WpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWWS(WpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYWS(Wp(Z!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S%9[C}i$i&j(o%1l(Wp(Z!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr%9[EoP;=`<%lCr07[FRk$i&j(Wp(Z!b$]#t(T,2j(e$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$i&j(Wp(Z!b$]#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv07[JPP;=`<%lEr(KWJ_`$i&j(Wp(Z!b#p(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWKl_$i&j$Q(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,#xLva(z+JY$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KWNW`$i&j#z(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'At! c_(Y';W$i&j(WpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$i&j(WpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$i&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$d`$i&j(WpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(WpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$d`(WpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b/5|!'t_!l/.^$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&U!)O_!k!Lf$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z-!n!*[b$i&j(Wp(Z!b(U%&f#q(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW!+o`$i&j(Wp(Z!b#n(ChOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;x!,|`$i&j(Wp(Z!br+4YOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z,$U!.Z_!]+Jf$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!/ec$i&j(Wp(Z!b!Q.2^OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!0ya$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#%|!2Z_![!L^$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!3eg$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!5Vg$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!6wc$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad!8_c$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[!9uf$i&j(Wp(Z!b#o(ChOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z?O!;fb$i&j(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z>^!<w`$i&j(Z!b!X7`OY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n<z!>Q^$i&j!X7`OY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!?Td$i&j!X7`O!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&c7`!@hX!X7`OY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@c7`!AYW!X7`#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!AT7`!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!Ar7`!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!Ar7`!BnP;=`<%l!Ar7`!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@c7`!CTP;=`<%l!@c<z!C][$i&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DWX$i&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW<z!DvP;=`<%l!CW<z!EOX$i&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y<z!EnP;=`<%l!=y>^!Ezl$i&j(Z!b!X7`OY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}8r!GyZ(Z!b!X7`OY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr8r!Hse(Z!b!X7`OY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}8r!JZX(Z!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU8r!JyP;=`<%l!JU8r!KPP;=`<%l!Gr>^!KZ^$i&j(Z!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS>^!LYP;=`<%l!KS>^!L`P;=`<%l!<n=l!Ll`$i&j(Wp!X7`OY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc=l!Mwl$i&j(Wp!X7`OY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r8Q# vZ(Wp!X7`OY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# o8Q#!pe(Wp!X7`OY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)r8Q#$WX(WpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$R8Q#$vP;=`<%l#$R8Q#$|P;=`<%l# o=l#%W^$i&j(WpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P=l#&VP;=`<%l#%P=l#&]P;=`<%l!Lc?O#&kn$i&j(Wp(Z!b!X7`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z9d#(r](Wp(Z!b!X7`OY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i9d#)th(Wp(Z!b!X7`OY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g9d#+gZ(Wp(Z!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`9d#,]P;=`<%l#+`9d#,cP;=`<%l#(i?O#,o`$i&j(Wp(Z!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f?O#-tP;=`<%l#,f?O#-zP;=`<%l!;Z07[#.[b$i&j(Wp(Z!b(O0/l!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z07[#/o_$i&j(Wp(Z!bT0/lOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d06j#0w]$i&j(Z!bT0/lOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n05W#1wX$i&jT0/lOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p0/l#2iST0/lOY#2dZ;'S#2d;'S;=`#2u<%lO#2d0/l#2xP;=`<%l#2d05W#3OP;=`<%l#1p01O#3YW(Z!bT0/lOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R01O#3uP;=`<%l#3R06j#3{P;=`<%l#0n05x#4X]$i&j(WpT0/lOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O00^#5XW(WpT0/lOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q00^#5tP;=`<%l#5Q05x#5zP;=`<%l#4O01p#6WY(Wp(Z!bT0/lOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}01p#6yP;=`<%l#5}07[#7PP;=`<%l#/d)3h#7ab$i&j$Q(Ch(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;ZAt#8vb$Z#t$i&j(Wp(Z!b!X7`OY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z'Ad#:Zp$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#<jk$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#>j_$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#?rd$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#A]f$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Bzc$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Dbe$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#E|g$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'Ad#Gpi$i&j(Wp(Z!bs'9tOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x#Il_!g$b$i&j$O)Lv(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_al$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f#LS^h#)`#R-<U(Wp(Z!b$n7`OY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$k&j(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El#M}Z#r(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g(El#NyX$Q(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g(El$ oX#s(Ch(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g*)x$!ga#`*!Y$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(K[$#w_#k(Cl$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z*)x$%Vag!*r#s(Ch$f#|$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$&g_#s(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$'qa#r(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$)R`#r(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(Kd$*`a(r(Ct$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!a%Z!a!b$+e!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$+p`$i&j#{(Ch(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`$,}_!|$Ip$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z04f$.X_!S0,v$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$/]Z$i&jO!^$0O!^!_$0f!_#i$0O#i#j$0k#j#l$0O#l#m$2^#m#o$0O#o#p$0f#p;'S$0O;'S;=`$4i<%lO$0O(n$0VT_#S$i&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$0kO_#S(n$0p[$i&jO!Q&c!Q![$1f![!^&c!_!c&c!c!i$1f!i#T&c#T#Z$1f#Z#o&c#o#p$3|#p;'S&c;'S;=`&w<%lO&c(n$1kZ$i&jO!Q&c!Q![$2^![!^&c!_!c&c!c!i$2^!i#T&c#T#Z$2^#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$2cZ$i&jO!Q&c!Q![$3U![!^&c!_!c&c!c!i$3U!i#T&c#T#Z$3U#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3ZZ$i&jO!Q&c!Q![$0O![!^&c!_!c&c!c!i$0O!i#T&c#T#Z$0O#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$4PR!Q![$4Y!c!i$4Y#T#Z$4Y#S$4]S!Q![$4Y!c!i$4Y#T#Z$4Y#q#r$0f(n$4lP;=`<%l$0O#1[$4z_!Y#)l$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(KW$6U`#x(Ch$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z+;p$7c_$i&j(Wp(Z!b(a+4QOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$8qk$i&j(Wp(Z!b(T,2j$_#t(e$I[OY%ZYZ&cZr%Zrs&}st%Ztu$8buw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$8b![!^%Z!^!_*g!_!c%Z!c!}$8b!}#O%Z#O#P&c#P#R%Z#R#S$8b#S#T%Z#T#o$8b#o#p*g#p$g%Z$g;'S$8b;'S;=`$<l<%lO$8b+d$:qk$i&j(Wp(Z!b$_#tOY%ZYZ&cZr%Zrs&}st%Ztu$:fuw%Zwx(rx}%Z}!O$:f!O!Q%Z!Q![$:f![!^%Z!^!_*g!_!c%Z!c!}$:f!}#O%Z#O#P&c#P#R%Z#R#S$:f#S#T%Z#T#o$:f#o#p*g#p$g%Z$g;'S$:f;'S;=`$<f<%lO$:f+d$<iP;=`<%l$:f07[$<oP;=`<%l$8b#Jf$<{X!_#Hb(Wp(Z!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g,#x$=sa(y+JY$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$+e#q;'S%Z;'S;=`+a<%lO%Z)>v$?V_!^(CdvBr$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z?O$@a_!q7`$i&j(Wp(Z!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z07[$Aq|$i&j(Wp(Z!b'|0/l$]#t(T,2j(e$I[OX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$A`#BZ$ISEr$IS$I_$A`$I_$JTEr$JT$JU$A`$JU$KVEr$KV$KW$A`$KW&FUEr&FU&FV$A`&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$A`?HUOEr07[$D|k$i&j(Wp(Z!b'}0/l$]#t(T,2j(e$I[OY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
  tokenizers: [$S, PS, CS, TS, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, QS, new $s("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOx~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!U~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(c~~", 141, 340), new $s("j~RQYZXz{^~^O(Q~~aP!P!Qd~iO(R~~", 25, 323)],
  topRules: { Script: [0, 7], SingleExpression: [1, 276], SingleClassItem: [2, 277] },
  dialects: { jsx: 0, ts: 15175 },
  dynamicPrecedences: { 80: 1, 82: 1, 94: 1, 169: 1, 199: 1 },
  specialized: [{ term: 327, get: (r) => MS[r] || -1 }, { term: 343, get: (r) => RS[r] || -1 }, { term: 95, get: (r) => ZS[r] || -1 }],
  tokenPrec: 15201
}), mO = [
  /* @__PURE__ */ ut("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ ut(`try {
	\${}
} catch (\${error}) {
	\${}
}`, {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ ut(`if (\${}) {
	\${}
} else {
	\${}
}`, {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ ut(`class \${name} {
	constructor(\${params}) {
		\${}
	}
}`, {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ ut('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ ut('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
], LS = /* @__PURE__ */ mO.concat([
  /* @__PURE__ */ ut("interface ${name} {\n	${}\n}", {
    label: "interface",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("type ${name} = ${type}", {
    label: "type",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ ut("enum ${name} {\n	${}\n}", {
    label: "enum",
    detail: "definition",
    type: "keyword"
  })
]), tf = /* @__PURE__ */ new hd(), yO = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function Lr(r) {
  return (e, t) => {
    let i = e.node.getChild("VariableDefinition");
    return i && t(i, r), !0;
  };
}
const ES = ["FunctionDeclaration"], _S = {
  FunctionDeclaration: /* @__PURE__ */ Lr("function"),
  ClassDeclaration: /* @__PURE__ */ Lr("class"),
  ClassExpression: () => !0,
  EnumDeclaration: /* @__PURE__ */ Lr("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ Lr("type"),
  NamespaceDeclaration: /* @__PURE__ */ Lr("namespace"),
  VariableDefinition(r, e) {
    r.matchContext(ES) || e(r, "variable");
  },
  TypeDefinition(r, e) {
    e(r, "type");
  },
  __proto__: null
};
function vO(r, e) {
  let t = tf.get(e);
  if (t)
    return t;
  let i = [], n = !0;
  function s(o, a) {
    let l = r.sliceString(o.from, o.to);
    i.push({ label: l, type: a });
  }
  return e.cursor(ve.IncludeAnonymous).iterate((o) => {
    if (n)
      n = !1;
    else if (o.name) {
      let a = _S[o.name];
      if (a && a(o, s) || yO.has(o.name))
        return !1;
    } else if (o.to - o.from > 8192) {
      for (let a of vO(r, o.node))
        i.push(a);
      return !1;
    }
  }), tf.set(e, i), i;
}
const rf = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/, SO = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName",
  "JSXText",
  "JSXAttributeValue",
  "JSXOpenTag",
  "JSXCloseTag",
  "JSXSelfClosingTag",
  ".",
  "?."
];
function BS(r) {
  let e = Te(r.state).resolveInner(r.pos, -1);
  if (SO.indexOf(e.name) > -1)
    return null;
  let t = e.name == "VariableName" || e.to - e.from < 20 && rf.test(r.state.sliceDoc(e.from, e.to));
  if (!t && !r.explicit)
    return null;
  let i = [];
  for (let n = e; n; n = n.parent)
    yO.has(n.name) && (i = i.concat(vO(r.state.doc, n)));
  return {
    options: i,
    from: t ? e.from : r.pos,
    validFor: rf
  };
}
const Et = /* @__PURE__ */ pr.define({
  name: "javascript",
  parser: /* @__PURE__ */ XS.configure({
    props: [
      /* @__PURE__ */ yn.add({
        IfStatement: /* @__PURE__ */ Kn({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ Kn({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: Dy,
        SwitchBody: (r) => {
          let e = r.textAfter, t = /^\s*\}/.test(e), i = /^\s*(case|default)\b/.test(e);
          return r.baseIndent + (t ? 0 : i ? 1 : 2) * r.unit;
        },
        Block: /* @__PURE__ */ zy({ closing: "}" }),
        ArrowFunction: (r) => r.baseIndent + r.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ Kn({ except: /^\s*{/ }),
        JSXElement(r) {
          let e = /^\s*<\//.test(r.textAfter);
          return r.lineIndent(r.node.from) + (e ? 0 : r.unit);
        },
        JSXEscape(r) {
          let e = /\s*\}/.test(r.textAfter);
          return r.lineIndent(r.node.from) + (e ? 0 : r.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(r) {
          return r.column(r.node.from) + r.unit;
        }
      }),
      /* @__PURE__ */ wr.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": vd,
        BlockComment(r) {
          return { from: r.from + 2, to: r.to - 2 };
        },
        JSXElement(r) {
          let e = r.firstChild;
          if (!e || e.name == "JSXSelfClosingTag")
            return null;
          let t = r.lastChild;
          return { from: e.to, to: t.type.isError ? r.to : t.from };
        },
        "JSXSelfClosingTag JSXOpenTag"(r) {
          var e;
          let t = (e = r.firstChild) === null || e === void 0 ? void 0 : e.nextSibling, i = r.lastChild;
          return !t || t.type.isError ? null : { from: t.to, to: i.type.isError ? r.to : i.from };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
}), bO = {
  test: (r) => /^JSX/.test(r.name),
  facet: /* @__PURE__ */ gl({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
}, kO = /* @__PURE__ */ Et.configure({ dialect: "ts" }, "typescript"), xO = /* @__PURE__ */ Et.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ ml.add((r) => r.isTop ? [bO] : void 0)]
}), wO = /* @__PURE__ */ Et.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ ml.add((r) => r.isTop ? [bO] : void 0)]
}, "typescript");
let QO = (r) => ({ label: r, type: "keyword" });
const $O = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(QO), jS = /* @__PURE__ */ $O.concat(/* @__PURE__ */ ["declare", "implements", "private", "protected", "public"].map(QO));
function IS(r = {}) {
  let e = r.jsx ? r.typescript ? wO : xO : r.typescript ? kO : Et, t = r.typescript ? LS.concat(jS) : mO.concat($O);
  return new on(e, [
    Et.data.of({
      autocomplete: X1(SO, Z1(t))
    }),
    Et.data.of({
      autocomplete: BS
    }),
    r.jsx ? zS : []
  ]);
}
function WS(r) {
  for (; ; ) {
    if (r.name == "JSXOpenTag" || r.name == "JSXSelfClosingTag" || r.name == "JSXFragmentTag")
      return r;
    if (r.name == "JSXEscape" || !r.parent)
      return null;
    r = r.parent;
  }
}
function nf(r, e, t = r.length) {
  for (let i = e?.firstChild; i; i = i.nextSibling)
    if (i.name == "JSXIdentifier" || i.name == "JSXBuiltin" || i.name == "JSXNamespacedName" || i.name == "JSXMemberExpression")
      return r.sliceString(i.from, Math.min(i.to, t));
  return "";
}
const YS = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), zS = /* @__PURE__ */ N.inputHandler.of((r, e, t, i, n) => {
  if ((YS ? r.composing : r.compositionStarted) || r.state.readOnly || e != t || i != ">" && i != "/" || !Et.isActiveAt(r.state, e, -1))
    return !1;
  let s = n(), { state: o } = s, a = o.changeByRange((l) => {
    var c;
    let { head: u } = l, p = Te(o).resolveInner(u - 1, -1), m;
    if (p.name == "JSXStartTag" && (p = p.parent), !(o.doc.sliceString(u - 1, u) != i || p.name == "JSXAttributeValue" && p.to > u)) {
      if (i == ">" && p.name == "JSXFragmentTag")
        return { range: l, changes: { from: u, insert: "</>" } };
      if (i == "/" && p.name == "JSXStartCloseTag") {
        let v = p.parent, b = v.parent;
        if (b && v.from == u - 2 && ((m = nf(o.doc, b.firstChild, u)) || ((c = b.firstChild) === null || c === void 0 ? void 0 : c.name) == "JSXFragmentTag")) {
          let w = `${m}>`;
          return { range: L.cursor(u + w.length, -1), changes: { from: u, insert: w } };
        }
      } else if (i == ">") {
        let v = WS(p);
        if (v && v.name == "JSXOpenTag" && !/^\/?>|^<\//.test(o.doc.sliceString(u, u + 2)) && (m = nf(o.doc, v, u)))
          return { range: l, changes: { from: u, insert: `</${m}>` } };
      }
    }
    return { range: l };
  });
  return a.changes.empty ? !1 : (r.dispatch([
    s,
    o.update(a, { userEvent: "input.complete", scrollIntoView: !0 })
  ]), !0);
});
class Ps {
  static create(e, t, i, n, s) {
    let o = n + (n << 8) + e + (t << 4) | 0;
    return new Ps(e, t, i, o, s, [], []);
  }
  constructor(e, t, i, n, s, o, a) {
    this.type = e, this.value = t, this.from = i, this.hash = n, this.end = s, this.children = o, this.positions = a, this.hashProp = [[te.contextHash, n]];
  }
  addChild(e, t) {
    e.prop(te.contextHash) != this.hash && (e = new ye(e.type, e.children, e.positions, e.length, this.hashProp)), this.children.push(e), this.positions.push(t);
  }
  toTree(e, t = this.end) {
    let i = this.children.length - 1;
    return i >= 0 && (t = Math.max(t, this.positions[i] + this.children[i].length + this.from)), new ye(e.types[this.type], this.children, this.positions, t - this.from).balance({
      makeTree: (n, s, o) => new ye(je.none, n, s, o, this.hashProp)
    });
  }
}
var W;
(function(r) {
  r[r.Document = 1] = "Document", r[r.CodeBlock = 2] = "CodeBlock", r[r.FencedCode = 3] = "FencedCode", r[r.Blockquote = 4] = "Blockquote", r[r.HorizontalRule = 5] = "HorizontalRule", r[r.BulletList = 6] = "BulletList", r[r.OrderedList = 7] = "OrderedList", r[r.ListItem = 8] = "ListItem", r[r.ATXHeading1 = 9] = "ATXHeading1", r[r.ATXHeading2 = 10] = "ATXHeading2", r[r.ATXHeading3 = 11] = "ATXHeading3", r[r.ATXHeading4 = 12] = "ATXHeading4", r[r.ATXHeading5 = 13] = "ATXHeading5", r[r.ATXHeading6 = 14] = "ATXHeading6", r[r.SetextHeading1 = 15] = "SetextHeading1", r[r.SetextHeading2 = 16] = "SetextHeading2", r[r.HTMLBlock = 17] = "HTMLBlock", r[r.LinkReference = 18] = "LinkReference", r[r.Paragraph = 19] = "Paragraph", r[r.CommentBlock = 20] = "CommentBlock", r[r.ProcessingInstructionBlock = 21] = "ProcessingInstructionBlock", r[r.Escape = 22] = "Escape", r[r.Entity = 23] = "Entity", r[r.HardBreak = 24] = "HardBreak", r[r.Emphasis = 25] = "Emphasis", r[r.StrongEmphasis = 26] = "StrongEmphasis", r[r.Link = 27] = "Link", r[r.Image = 28] = "Image", r[r.InlineCode = 29] = "InlineCode", r[r.HTMLTag = 30] = "HTMLTag", r[r.Comment = 31] = "Comment", r[r.ProcessingInstruction = 32] = "ProcessingInstruction", r[r.Autolink = 33] = "Autolink", r[r.HeaderMark = 34] = "HeaderMark", r[r.QuoteMark = 35] = "QuoteMark", r[r.ListMark = 36] = "ListMark", r[r.LinkMark = 37] = "LinkMark", r[r.EmphasisMark = 38] = "EmphasisMark", r[r.CodeMark = 39] = "CodeMark", r[r.CodeText = 40] = "CodeText", r[r.CodeInfo = 41] = "CodeInfo", r[r.LinkTitle = 42] = "LinkTitle", r[r.LinkLabel = 43] = "LinkLabel", r[r.URL = 44] = "URL";
})(W || (W = {}));
class DS {
  /**
  @internal
  */
  constructor(e, t) {
    this.start = e, this.content = t, this.marks = [], this.parsers = [];
  }
}
class VS {
  constructor() {
    this.text = "", this.baseIndent = 0, this.basePos = 0, this.depth = 0, this.markers = [], this.pos = 0, this.indent = 0, this.next = -1;
  }
  /**
  @internal
  */
  forward() {
    this.basePos > this.pos && this.forwardInner();
  }
  /**
  @internal
  */
  forwardInner() {
    let e = this.skipSpace(this.basePos);
    this.indent = this.countIndent(e, this.pos, this.indent), this.pos = e, this.next = e == this.text.length ? -1 : this.text.charCodeAt(e);
  }
  /**
  Skip whitespace after the given position, return the position of
  the next non-space character or the end of the line if there's
  only space after `from`.
  */
  skipSpace(e) {
    return qr(this.text, e);
  }
  /**
  @internal
  */
  reset(e) {
    for (this.text = e, this.baseIndent = this.basePos = this.pos = this.indent = 0, this.forwardInner(), this.depth = 1; this.markers.length; )
      this.markers.pop();
  }
  /**
  Move the line's base position forward to the given position.
  This should only be called by composite [block
  parsers](#BlockParser.parse) or [markup skipping
  functions](#NodeSpec.composite).
  */
  moveBase(e) {
    this.basePos = e, this.baseIndent = this.countIndent(e, this.pos, this.indent);
  }
  /**
  Move the line's base position forward to the given _column_.
  */
  moveBaseColumn(e) {
    this.baseIndent = e, this.basePos = this.findColumn(e);
  }
  /**
  Store a composite-block-level marker. Should be called from
  [markup skipping functions](#NodeSpec.composite) when they
  consume any non-whitespace characters.
  */
  addMarker(e) {
    this.markers.push(e);
  }
  /**
  Find the column position at `to`, optionally starting at a given
  position and column.
  */
  countIndent(e, t = 0, i = 0) {
    for (let n = t; n < e; n++)
      i += this.text.charCodeAt(n) == 9 ? 4 - i % 4 : 1;
    return i;
  }
  /**
  Find the position corresponding to the given column.
  */
  findColumn(e) {
    let t = 0;
    for (let i = 0; t < this.text.length && i < e; t++)
      i += this.text.charCodeAt(t) == 9 ? 4 - i % 4 : 1;
    return t;
  }
  /**
  @internal
  */
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let e = "";
    for (let t = 0; t < this.basePos; t++)
      e += " ";
    return e + this.text.slice(this.basePos);
  }
}
function sf(r, e, t) {
  if (t.pos == t.text.length || r != e.block && t.indent >= e.stack[t.depth + 1].value + t.baseIndent)
    return !0;
  if (t.indent >= t.baseIndent + 4)
    return !1;
  let i = (r.type == W.OrderedList ? Zl : Rl)(t, e, !1);
  return i > 0 && (r.type != W.BulletList || Ml(t, e, !1) < 0) && t.text.charCodeAt(t.pos + i - 1) == r.value;
}
const PO = {
  [W.Blockquote](r, e, t) {
    return t.next != 62 ? !1 : (t.markers.push(de(W.QuoteMark, e.lineStart + t.pos, e.lineStart + t.pos + 1)), t.moveBase(t.pos + (Mt(t.text.charCodeAt(t.pos + 1)) ? 2 : 1)), r.end = e.lineStart + t.text.length, !0);
  },
  [W.ListItem](r, e, t) {
    return t.indent < t.baseIndent + r.value && t.next > -1 ? !1 : (t.moveBaseColumn(t.baseIndent + r.value), !0);
  },
  [W.OrderedList]: sf,
  [W.BulletList]: sf,
  [W.Document]() {
    return !0;
  }
};
function Mt(r) {
  return r == 32 || r == 9 || r == 10 || r == 13;
}
function qr(r, e = 0) {
  for (; e < r.length && Mt(r.charCodeAt(e)); )
    e++;
  return e;
}
function of(r, e, t) {
  for (; e > t && Mt(r.charCodeAt(e - 1)); )
    e--;
  return e;
}
function CO(r) {
  if (r.next != 96 && r.next != 126)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == r.next; )
    e++;
  if (e < r.pos + 3)
    return -1;
  if (r.next == 96) {
    for (let t = e; t < r.text.length; t++)
      if (r.text.charCodeAt(t) == 96)
        return -1;
  }
  return e;
}
function TO(r) {
  return r.next != 62 ? -1 : r.text.charCodeAt(r.pos + 1) == 32 ? 2 : 1;
}
function Ml(r, e, t) {
  if (r.next != 42 && r.next != 45 && r.next != 95)
    return -1;
  let i = 1;
  for (let n = r.pos + 1; n < r.text.length; n++) {
    let s = r.text.charCodeAt(n);
    if (s == r.next)
      i++;
    else if (!Mt(s))
      return -1;
  }
  return t && r.next == 45 && RO(r) > -1 && r.depth == e.stack.length && e.parser.leafBlockParsers.indexOf(EO.SetextHeading) > -1 || i < 3 ? -1 : 1;
}
function AO(r, e) {
  for (let t = r.stack.length - 1; t >= 0; t--)
    if (r.stack[t].type == e)
      return !0;
  return !1;
}
function Rl(r, e, t) {
  return (r.next == 45 || r.next == 43 || r.next == 42) && (r.pos == r.text.length - 1 || Mt(r.text.charCodeAt(r.pos + 1))) && (!t || AO(e, W.BulletList) || r.skipSpace(r.pos + 2) < r.text.length) ? 1 : -1;
}
function Zl(r, e, t) {
  let i = r.pos, n = r.next;
  for (; n >= 48 && n <= 57; ) {
    i++;
    if (i == r.text.length)
      return -1;
    n = r.text.charCodeAt(i);
  }
  return i == r.pos || i > r.pos + 9 || n != 46 && n != 41 || i < r.text.length - 1 && !Mt(r.text.charCodeAt(i + 1)) || t && !AO(e, W.OrderedList) && (r.skipSpace(i + 1) == r.text.length || i > r.pos + 1 || r.next != 49) ? -1 : i + 1 - r.pos;
}
function MO(r) {
  if (r.next != 35)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == 35; )
    e++;
  if (e < r.text.length && r.text.charCodeAt(e) != 32)
    return -1;
  let t = e - r.pos;
  return t > 6 ? -1 : t;
}
function RO(r) {
  if (r.next != 45 && r.next != 61 || r.indent >= r.baseIndent + 4)
    return -1;
  let e = r.pos + 1;
  for (; e < r.text.length && r.text.charCodeAt(e) == r.next; )
    e++;
  let t = e;
  for (; e < r.text.length && Mt(r.text.charCodeAt(e)); )
    e++;
  return e == r.text.length ? t : -1;
}
const Wa = /^[ \t]*$/, ZO = /-->/, XO = /\?>/, Ya = [
  [/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
  [/^\s*<!--/, ZO],
  [/^\s*<\?/, XO],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, Wa],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, Wa]
];
function LO(r, e, t) {
  if (r.next != 60)
    return -1;
  let i = r.text.slice(r.pos);
  for (let n = 0, s = Ya.length - (t ? 1 : 0); n < s; n++)
    if (Ya[n][0].test(i))
      return n;
  return -1;
}
function af(r, e) {
  let t = r.countIndent(e, r.pos, r.indent), i = r.countIndent(r.skipSpace(e), e, t);
  return i >= t + 5 ? t + 1 : i;
}
function gi(r, e, t) {
  let i = r.length - 1;
  i >= 0 && r[i].to == e && r[i].type == W.CodeText ? r[i].to = t : r.push(de(W.CodeText, e, t));
}
const Yn = {
  LinkReference: void 0,
  IndentedCode(r, e) {
    let t = e.baseIndent + 4;
    if (e.indent < t)
      return !1;
    let i = e.findColumn(t), n = r.lineStart + i, s = r.lineStart + e.text.length, o = [], a = [];
    for (gi(o, n, s); r.nextLine() && e.depth >= r.stack.length; )
      if (e.pos == e.text.length) {
        gi(a, r.lineStart - 1, r.lineStart);
        for (let l of e.markers)
          a.push(l);
      } else {
        if (e.indent < t)
          break;
        {
          if (a.length) {
            for (let c of a)
              c.type == W.CodeText ? gi(o, c.from, c.to) : o.push(c);
            a = [];
          }
          gi(o, r.lineStart - 1, r.lineStart);
          for (let c of e.markers)
            o.push(c);
          s = r.lineStart + e.text.length;
          let l = r.lineStart + e.findColumn(e.baseIndent + 4);
          l < s && gi(o, l, s);
        }
      }
    return a.length && (a = a.filter((l) => l.type != W.CodeText), a.length && (e.markers = a.concat(e.markers))), r.addNode(r.buffer.writeElements(o, -n).finish(W.CodeBlock, s - n), n), !0;
  },
  FencedCode(r, e) {
    let t = CO(e);
    if (t < 0)
      return !1;
    let i = r.lineStart + e.pos, n = e.next, s = t - e.pos, o = e.skipSpace(t), a = of(e.text, e.text.length, o), l = [de(W.CodeMark, i, i + s)];
    o < a && l.push(de(W.CodeInfo, r.lineStart + o, r.lineStart + a));
    for (let c = !0, u = !0, p = !1; r.nextLine() && e.depth >= r.stack.length; c = !1) {
      let m = e.pos;
      if (e.indent - e.baseIndent < 4)
        for (; m < e.text.length && e.text.charCodeAt(m) == n; )
          m++;
      if (m - e.pos >= s && e.skipSpace(m) == e.text.length) {
        for (let v of e.markers)
          l.push(v);
        u && p && gi(l, r.lineStart - 1, r.lineStart), l.push(de(W.CodeMark, r.lineStart + e.pos, r.lineStart + m)), r.nextLine();
        break;
      } else {
        p = !0, c || (gi(l, r.lineStart - 1, r.lineStart), u = !1);
        for (let w of e.markers)
          l.push(w);
        let v = r.lineStart + e.basePos, b = r.lineStart + e.text.length;
        v < b && (gi(l, v, b), u = !1);
      }
    }
    return r.addNode(r.buffer.writeElements(l, -i).finish(W.FencedCode, r.prevLineEnd() - i), i), !0;
  },
  Blockquote(r, e) {
    let t = TO(e);
    return t < 0 ? !1 : (r.startContext(W.Blockquote, e.pos), r.addNode(W.QuoteMark, r.lineStart + e.pos, r.lineStart + e.pos + 1), e.moveBase(e.pos + t), null);
  },
  HorizontalRule(r, e) {
    if (Ml(e, r, !1) < 0)
      return !1;
    let t = r.lineStart + e.pos;
    return r.nextLine(), r.addNode(W.HorizontalRule, t), !0;
  },
  BulletList(r, e) {
    let t = Rl(e, r, !1);
    if (t < 0)
      return !1;
    r.block.type != W.BulletList && r.startContext(W.BulletList, e.basePos, e.next);
    let i = af(e, e.pos + 1);
    return r.startContext(W.ListItem, e.basePos, i - e.baseIndent), r.addNode(W.ListMark, r.lineStart + e.pos, r.lineStart + e.pos + t), e.moveBaseColumn(i), null;
  },
  OrderedList(r, e) {
    let t = Zl(e, r, !1);
    if (t < 0)
      return !1;
    r.block.type != W.OrderedList && r.startContext(W.OrderedList, e.basePos, e.text.charCodeAt(e.pos + t - 1));
    let i = af(e, e.pos + t);
    return r.startContext(W.ListItem, e.basePos, i - e.baseIndent), r.addNode(W.ListMark, r.lineStart + e.pos, r.lineStart + e.pos + t), e.moveBaseColumn(i), null;
  },
  ATXHeading(r, e) {
    let t = MO(e);
    if (t < 0)
      return !1;
    let i = e.pos, n = r.lineStart + i, s = of(e.text, e.text.length, i), o = s;
    for (; o > i && e.text.charCodeAt(o - 1) == e.next; )
      o--;
    (o == s || o == i || !Mt(e.text.charCodeAt(o - 1))) && (o = e.text.length);
    let a = r.buffer.write(W.HeaderMark, 0, t).writeElements(r.parser.parseInline(e.text.slice(i + t + 1, o), n + t + 1), -n);
    o < e.text.length && a.write(W.HeaderMark, o - i, s - i);
    let l = a.finish(W.ATXHeading1 - 1 + t, e.text.length - i);
    return r.nextLine(), r.addNode(l, n), !0;
  },
  HTMLBlock(r, e) {
    let t = LO(e, r, !1);
    if (t < 0)
      return !1;
    let i = r.lineStart + e.pos, n = Ya[t][1], s = [], o = n != Wa;
    for (; !n.test(e.text) && r.nextLine(); ) {
      if (e.depth < r.stack.length) {
        o = !1;
        break;
      }
      for (let c of e.markers)
        s.push(c);
    }
    o && r.nextLine();
    let a = n == ZO ? W.CommentBlock : n == XO ? W.ProcessingInstructionBlock : W.HTMLBlock, l = r.prevLineEnd();
    return r.addNode(r.buffer.writeElements(s, -i).finish(a, l - i), i), !0;
  },
  SetextHeading: void 0
  // Specifies relative precedence for block-continue function
};
class NS {
  constructor(e) {
    this.stage = 0, this.elts = [], this.pos = 0, this.start = e.start, this.advance(e.content);
  }
  nextLine(e, t, i) {
    if (this.stage == -1)
      return !1;
    let n = i.content + `
` + t.scrub(), s = this.advance(n);
    return s > -1 && s < n.length ? this.complete(e, i, s) : !1;
  }
  finish(e, t) {
    return (this.stage == 2 || this.stage == 3) && qr(t.content, this.pos) == t.content.length ? this.complete(e, t, t.content.length) : !1;
  }
  complete(e, t, i) {
    return e.addLeafElement(t, de(W.LinkReference, this.start, this.start + i, this.elts)), !0;
  }
  nextStage(e) {
    return e ? (this.pos = e.to - this.start, this.elts.push(e), this.stage++, !0) : (e === !1 && (this.stage = -1), !1);
  }
  advance(e) {
    for (; ; ) {
      if (this.stage == -1)
        return -1;
      if (this.stage == 0) {
        if (!this.nextStage(VO(e, this.pos, this.start, !0)))
          return -1;
        if (e.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(de(W.LinkMark, this.pos + this.start, this.pos + this.start + 1)), this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(zO(e, qr(e, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let t = qr(e, this.pos), i = 0;
        if (t > this.pos) {
          let n = DO(e, t, this.start);
          if (n) {
            let s = Mo(e, n.to - this.start);
            s > 0 && (this.nextStage(n), i = s);
          }
        }
        return i || (i = Mo(e, this.pos)), i > 0 && i < e.length ? i : -1;
      } else
        return Mo(e, this.pos);
    }
  }
}
function Mo(r, e) {
  for (; e < r.length; e++) {
    let t = r.charCodeAt(e);
    if (t == 10)
      break;
    if (!Mt(t))
      return -1;
  }
  return e;
}
class qS {
  nextLine(e, t, i) {
    let n = t.depth < e.stack.length ? -1 : RO(t), s = t.next;
    if (n < 0)
      return !1;
    let o = de(W.HeaderMark, e.lineStart + t.pos, e.lineStart + n);
    return e.nextLine(), e.addLeafElement(i, de(s == 61 ? W.SetextHeading1 : W.SetextHeading2, i.start, e.prevLineEnd(), [
      ...e.parser.parseInline(i.content, i.start),
      o
    ])), !0;
  }
  finish() {
    return !1;
  }
}
const EO = {
  LinkReference(r, e) {
    return e.content.charCodeAt(0) == 91 ? new NS(e) : null;
  },
  SetextHeading() {
    return new qS();
  }
}, GS = [
  (r, e) => MO(e) >= 0,
  (r, e) => CO(e) >= 0,
  (r, e) => TO(e) >= 0,
  (r, e) => Rl(e, r, !0) >= 0,
  (r, e) => Zl(e, r, !0) >= 0,
  (r, e) => Ml(e, r, !0) >= 0,
  (r, e) => LO(e, r, !0) >= 0
], US = { text: "", end: 0 };
class FS {
  /**
  @internal
  */
  constructor(e, t, i, n) {
    this.parser = e, this.input = t, this.ranges = n, this.line = new VS(), this.atEnd = !1, this.reusePlaceholders = /* @__PURE__ */ new Map(), this.stoppedAt = null, this.rangeI = 0, this.to = n[n.length - 1].to, this.lineStart = this.absoluteLineStart = this.absoluteLineEnd = n[0].from, this.block = Ps.create(W.Document, 0, this.lineStart, 0, 0), this.stack = [this.block], this.fragments = i.length ? new JS(i, t) : null, this.readLine();
  }
  get parsedPos() {
    return this.absoluteLineStart;
  }
  advance() {
    if (this.stoppedAt != null && this.absoluteLineStart > this.stoppedAt)
      return this.finish();
    let { line: e } = this;
    for (; ; ) {
      for (let i = 0; ; ) {
        let n = e.depth < this.stack.length ? this.stack[this.stack.length - 1] : null;
        for (; i < e.markers.length && (!n || e.markers[i].from < n.end); ) {
          let s = e.markers[i++];
          this.addNode(s.type, s.from, s.to);
        }
        if (!n)
          break;
        this.finishContext();
      }
      if (e.pos < e.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(e.basePos))
      return null;
    e: for (; ; ) {
      for (let i of this.parser.blockParsers)
        if (i) {
          let n = i(this, e);
          if (n != !1) {
            if (n == !0)
              return null;
            e.forward();
            continue e;
          }
        }
      break;
    }
    let t = new DS(this.lineStart + e.pos, e.text.slice(e.pos));
    for (let i of this.parser.leafBlockParsers)
      if (i) {
        let n = i(this, t);
        n && t.parsers.push(n);
      }
    e: for (; this.nextLine() && e.pos != e.text.length; ) {
      if (e.indent < e.baseIndent + 4) {
        for (let i of this.parser.endLeafBlock)
          if (i(this, e, t))
            break e;
      }
      for (let i of t.parsers)
        if (i.nextLine(this, e, t))
          return null;
      t.content += `
` + e.scrub();
      for (let i of e.markers)
        t.marks.push(i);
    }
    return this.finishLeaf(t), null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  reuseFragment(e) {
    if (!this.fragments.moveTo(this.absoluteLineStart + e, this.absoluteLineStart) || !this.fragments.matches(this.block.hash))
      return !1;
    let t = this.fragments.takeNodes(this);
    return t ? (this.absoluteLineStart += t, this.lineStart = NO(this.absoluteLineStart, this.ranges), this.moveRangeI(), this.absoluteLineStart < this.to ? (this.lineStart++, this.absoluteLineStart++, this.readLine()) : (this.atEnd = !0, this.readLine()), !0) : !1;
  }
  /**
  The number of parent blocks surrounding the current block.
  */
  get depth() {
    return this.stack.length;
  }
  /**
  Get the type of the parent block at the given depth. When no
  depth is passed, return the type of the innermost parent.
  */
  parentType(e = this.depth - 1) {
    return this.parser.nodeSet.types[this.stack[e].type];
  }
  /**
  Move to the next input line. This should only be called by
  (non-composite) [block parsers](#BlockParser.parse) that consume
  the line directly, or leaf block parser
  [`nextLine`](#LeafBlockParser.nextLine) methods when they
  consume the current line (and return true).
  */
  nextLine() {
    return this.lineStart += this.line.text.length, this.absoluteLineEnd >= this.to ? (this.absoluteLineStart = this.absoluteLineEnd, this.atEnd = !0, this.readLine(), !1) : (this.lineStart++, this.absoluteLineStart = this.absoluteLineEnd + 1, this.moveRangeI(), this.readLine(), !0);
  }
  /**
  Retrieve the text of the line after the current one, without
  actually moving the context's current line forward.
  */
  peekLine() {
    return this.scanLine(this.absoluteLineEnd + 1).text;
  }
  moveRangeI() {
    for (; this.rangeI < this.ranges.length - 1 && this.absoluteLineStart >= this.ranges[this.rangeI].to; )
      this.rangeI++, this.absoluteLineStart = Math.max(this.absoluteLineStart, this.ranges[this.rangeI].from);
  }
  /**
  @internal
  Collect the text for the next line.
  */
  scanLine(e) {
    let t = US;
    if (t.end = e, e >= this.to)
      t.text = "";
    else if (t.text = this.lineChunkAt(e), t.end += t.text.length, this.ranges.length > 1) {
      let i = this.absoluteLineStart, n = this.rangeI;
      for (; this.ranges[n].to < t.end; ) {
        n++;
        let s = this.ranges[n].from, o = this.lineChunkAt(s);
        t.end = s + o.length, t.text = t.text.slice(0, this.ranges[n - 1].to - i) + o, i = t.end - t.text.length;
      }
    }
    return t;
  }
  /**
  @internal
  Populate this.line with the content of the next line. Skip
  leading characters covered by composite blocks.
  */
  readLine() {
    let { line: e } = this, { text: t, end: i } = this.scanLine(this.absoluteLineStart);
    for (this.absoluteLineEnd = i, e.reset(t); e.depth < this.stack.length; e.depth++) {
      let n = this.stack[e.depth], s = this.parser.skipContextMarkup[n.type];
      if (!s)
        throw new Error("Unhandled block context " + W[n.type]);
      let o = this.line.markers.length;
      if (!s(n, this, e)) {
        this.line.markers.length > o && (n.end = this.line.markers[this.line.markers.length - 1].to), e.forward();
        break;
      }
      e.forward();
    }
  }
  lineChunkAt(e) {
    let t = this.input.chunk(e), i;
    if (this.input.lineChunks)
      i = t == `
` ? "" : t;
    else {
      let n = t.indexOf(`
`);
      i = n < 0 ? t : t.slice(0, n);
    }
    return e + i.length > this.to ? i.slice(0, this.to - e) : i;
  }
  /**
  The end position of the previous line.
  */
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  /**
  @internal
  */
  startContext(e, t, i = 0) {
    this.block = Ps.create(e, i, this.lineStart + t, this.block.hash, this.lineStart + this.line.text.length), this.stack.push(this.block);
  }
  /**
  Start a composite block. Should only be called from [block
  parser functions](#BlockParser.parse) that return null.
  */
  startComposite(e, t, i = 0) {
    this.startContext(this.parser.getNodeType(e), t, i);
  }
  /**
  @internal
  */
  addNode(e, t, i) {
    typeof e == "number" && (e = new ye(this.parser.nodeSet.types[e], vr, vr, (i ?? this.prevLineEnd()) - t)), this.block.addChild(e, t - this.block.from);
  }
  /**
  Add a block element. Can be called by [block
  parsers](#BlockParser.parse).
  */
  addElement(e) {
    this.block.addChild(e.toTree(this.parser.nodeSet), e.from - this.block.from);
  }
  /**
  Add a block element from a [leaf parser](#LeafBlockParser). This
  makes sure any extra composite block markup (such as blockquote
  markers) inside the block are also added to the syntax tree.
  */
  addLeafElement(e, t) {
    this.addNode(this.buffer.writeElements(Da(t.children, e.marks), -t.from).finish(t.type, t.to - t.from), t.from);
  }
  /**
  @internal
  */
  finishContext() {
    let e = this.stack.pop(), t = this.stack[this.stack.length - 1];
    t.addChild(e.toTree(this.parser.nodeSet), e.from - t.from), this.block = t;
  }
  finish() {
    for (; this.stack.length > 1; )
      this.finishContext();
    return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
  }
  addGaps(e) {
    return this.ranges.length > 1 ? _O(this.ranges, 0, e.topNode, this.ranges[0].from, this.reusePlaceholders) : e;
  }
  /**
  @internal
  */
  finishLeaf(e) {
    for (let i of e.parsers)
      if (i.finish(this, e))
        return;
    let t = Da(this.parser.parseInline(e.content, e.start), e.marks);
    this.addNode(this.buffer.writeElements(t, -e.start).finish(W.Paragraph, e.content.length), e.start);
  }
  elt(e, t, i, n) {
    return typeof e == "string" ? de(this.parser.getNodeType(e), t, i, n) : new IO(e, t);
  }
  /**
  @internal
  */
  get buffer() {
    return new jO(this.parser.nodeSet);
  }
}
function _O(r, e, t, i, n) {
  let s = r[e].to, o = [], a = [], l = t.from + i;
  function c(u, p) {
    for (; p ? u >= s : u > s; ) {
      let m = r[e + 1].from - s;
      i += m, u += m, e++, s = r[e].to;
    }
  }
  for (let u = t.firstChild; u; u = u.nextSibling) {
    c(u.from + i, !0);
    let p = u.from + i, m, v = n.get(u.tree);
    v ? m = v : u.to + i > s ? (m = _O(r, e, u, i, n), c(u.to + i, !1)) : m = u.toTree(), o.push(m), a.push(p - l);
  }
  return c(t.to + i, !1), new ye(t.type, o, a, t.to + i - l, t.tree ? t.tree.propValues : void 0);
}
class Ds extends pl {
  /**
  @internal
  */
  constructor(e, t, i, n, s, o, a, l, c) {
    super(), this.nodeSet = e, this.blockParsers = t, this.leafBlockParsers = i, this.blockNames = n, this.endLeafBlock = s, this.skipContextMarkup = o, this.inlineParsers = a, this.inlineNames = l, this.wrappers = c, this.nodeTypes = /* @__PURE__ */ Object.create(null);
    for (let u of e.types)
      this.nodeTypes[u.name] = u.id;
  }
  createParse(e, t, i) {
    let n = new FS(this, e, t, i);
    for (let s of this.wrappers)
      n = s(n, e, t, i);
    return n;
  }
  /**
  Reconfigure the parser.
  */
  configure(e) {
    let t = za(e);
    if (!t)
      return this;
    let { nodeSet: i, skipContextMarkup: n } = this, s = this.blockParsers.slice(), o = this.leafBlockParsers.slice(), a = this.blockNames.slice(), l = this.inlineParsers.slice(), c = this.inlineNames.slice(), u = this.endLeafBlock.slice(), p = this.wrappers;
    if (Er(t.defineNodes)) {
      n = Object.assign({}, n);
      let m = i.types.slice(), v;
      for (let b of t.defineNodes) {
        let { name: w, block: C, composite: A, style: X } = typeof b == "string" ? { name: b } : b;
        if (m.some((B) => B.name == w))
          continue;
        A && (n[m.length] = (B, Y, j) => A(Y, j, B.value));
        let _ = m.length, H = A ? ["Block", "BlockContext"] : C ? _ >= W.ATXHeading1 && _ <= W.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"] : void 0;
        m.push(je.define({
          id: _,
          name: w,
          props: H && [[te.group, H]]
        })), X && (v || (v = {}), Array.isArray(X) || X instanceof St ? v[w] = X : Object.assign(v, X));
      }
      i = new mn(m), v && (i = i.extend(xr(v)));
    }
    if (Er(t.props) && (i = i.extend(...t.props)), Er(t.remove))
      for (let m of t.remove) {
        let v = this.blockNames.indexOf(m), b = this.inlineNames.indexOf(m);
        v > -1 && (s[v] = o[v] = void 0), b > -1 && (l[b] = void 0);
      }
    if (Er(t.parseBlock))
      for (let m of t.parseBlock) {
        let v = a.indexOf(m.name);
        if (v > -1)
          s[v] = m.parse, o[v] = m.leaf;
        else {
          let b = m.before ? zn(a, m.before) : m.after ? zn(a, m.after) + 1 : a.length - 1;
          s.splice(b, 0, m.parse), o.splice(b, 0, m.leaf), a.splice(b, 0, m.name);
        }
        m.endLeaf && u.push(m.endLeaf);
      }
    if (Er(t.parseInline))
      for (let m of t.parseInline) {
        let v = c.indexOf(m.name);
        if (v > -1)
          l[v] = m.parse;
        else {
          let b = m.before ? zn(c, m.before) : m.after ? zn(c, m.after) + 1 : c.length - 1;
          l.splice(b, 0, m.parse), c.splice(b, 0, m.name);
        }
      }
    return t.wrap && (p = p.concat(t.wrap)), new Ds(i, s, o, a, u, n, l, c, p);
  }
  /**
  @internal
  */
  getNodeType(e) {
    let t = this.nodeTypes[e];
    if (t == null)
      throw new RangeError(`Unknown node type '${e}'`);
    return t;
  }
  /**
  Parse the given piece of inline text at the given offset,
  returning an array of [`Element`](#Element) objects representing
  the inline content.
  */
  parseInline(e, t) {
    let i = new Xl(this, e, t);
    e: for (let n = t; n < i.end; ) {
      let s = i.char(n);
      for (let o of this.inlineParsers)
        if (o) {
          let a = o(i, s, n);
          if (a >= 0) {
            n = a;
            continue e;
          }
        }
      n++;
    }
    return i.resolveMarkers(0);
  }
}
function Er(r) {
  return r != null && r.length > 0;
}
function za(r) {
  if (!Array.isArray(r))
    return r;
  if (r.length == 0)
    return null;
  let e = za(r[0]);
  if (r.length == 1)
    return e;
  let t = za(r.slice(1));
  if (!t || !e)
    return e || t;
  let i = (o, a) => (o || vr).concat(a || vr), n = e.wrap, s = t.wrap;
  return {
    props: i(e.props, t.props),
    defineNodes: i(e.defineNodes, t.defineNodes),
    parseBlock: i(e.parseBlock, t.parseBlock),
    parseInline: i(e.parseInline, t.parseInline),
    remove: i(e.remove, t.remove),
    wrap: n ? s ? (o, a, l, c) => n(s(o, a, l, c), a, l, c) : n : s
  };
}
function zn(r, e) {
  let t = r.indexOf(e);
  if (t < 0)
    throw new RangeError(`Position specified relative to unknown parser ${e}`);
  return t;
}
let BO = [je.none];
for (let r = 1, e; e = W[r]; r++)
  BO[r] = je.define({
    id: r,
    name: e,
    props: r >= W.Escape ? [] : [[te.group, r in PO ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]],
    top: e == "Document"
  });
const vr = [];
class jO {
  constructor(e) {
    this.nodeSet = e, this.content = [], this.nodes = [];
  }
  write(e, t, i, n = 0) {
    return this.content.push(e, t, i, 4 + n * 4), this;
  }
  writeElements(e, t = 0) {
    for (let i of e)
      i.writeTo(this, t);
    return this;
  }
  finish(e, t) {
    return ye.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: e,
      length: t
    });
  }
}
let ln = class {
  /**
  @internal
  */
  constructor(e, t, i, n = vr) {
    this.type = e, this.from = t, this.to = i, this.children = n;
  }
  /**
  @internal
  */
  writeTo(e, t) {
    let i = e.content.length;
    e.writeElements(this.children, t), e.content.push(this.type, this.from + t, this.to + t, e.content.length + 4 - i);
  }
  /**
  @internal
  */
  toTree(e) {
    return new jO(e).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
};
class IO {
  constructor(e, t) {
    this.tree = e, this.from = t;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return vr;
  }
  writeTo(e, t) {
    e.nodes.push(this.tree), e.content.push(e.nodes.length - 1, this.from + t, this.to + t, -1);
  }
  toTree() {
    return this.tree;
  }
}
function de(r, e, t, i) {
  return new ln(r, e, t, i);
}
const WO = { resolve: "Emphasis", mark: "EmphasisMark" }, YO = { resolve: "Emphasis", mark: "EmphasisMark" }, Ei = {}, Cs = {};
class vt {
  constructor(e, t, i, n) {
    this.type = e, this.from = t, this.to = i, this.side = n;
  }
}
const lf = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
let hn = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  hn = new RegExp("[\\p{S}|\\p{P}]", "u");
} catch {
}
const Ro = {
  Escape(r, e, t) {
    if (e != 92 || t == r.end - 1)
      return -1;
    let i = r.char(t + 1);
    for (let n = 0; n < lf.length; n++)
      if (lf.charCodeAt(n) == i)
        return r.append(de(W.Escape, t, t + 2));
    return -1;
  },
  Entity(r, e, t) {
    if (e != 38)
      return -1;
    let i = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(r.slice(t + 1, t + 31));
    return i ? r.append(de(W.Entity, t, t + 1 + i[0].length)) : -1;
  },
  InlineCode(r, e, t) {
    if (e != 96 || t && r.char(t - 1) == 96)
      return -1;
    let i = t + 1;
    for (; i < r.end && r.char(i) == 96; )
      i++;
    let n = i - t, s = 0;
    for (; i < r.end; i++)
      if (r.char(i) == 96) {
        if (s++, s == n && r.char(i + 1) != 96)
          return r.append(de(W.InlineCode, t, i + 1, [
            de(W.CodeMark, t, t + n),
            de(W.CodeMark, i + 1 - n, i + 1)
          ]));
      } else
        s = 0;
    return -1;
  },
  HTMLTag(r, e, t) {
    if (e != 60 || t == r.end - 1)
      return -1;
    let i = r.slice(t + 1, r.end), n = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(i);
    if (n)
      return r.append(de(W.Autolink, t, t + 1 + n[0].length, [
        de(W.LinkMark, t, t + 1),
        // url[0] includes the closing bracket, so exclude it from this slice
        de(W.URL, t + 1, t + n[0].length),
        de(W.LinkMark, t + n[0].length, t + 1 + n[0].length)
      ]));
    let s = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(i);
    if (s)
      return r.append(de(W.Comment, t, t + 1 + s[0].length));
    let o = /^\?[^]*?\?>/.exec(i);
    if (o)
      return r.append(de(W.ProcessingInstruction, t, t + 1 + o[0].length));
    let a = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(i);
    return a ? r.append(de(W.HTMLTag, t, t + 1 + a[0].length)) : -1;
  },
  Emphasis(r, e, t) {
    if (e != 95 && e != 42)
      return -1;
    let i = t + 1;
    for (; r.char(i) == e; )
      i++;
    let n = r.slice(t - 1, t), s = r.slice(i, i + 1), o = hn.test(n), a = hn.test(s), l = /\s|^$/.test(n), c = /\s|^$/.test(s), u = !c && (!a || l || o), p = !l && (!o || c || a), m = u && (e == 42 || !p || o), v = p && (e == 42 || !u || a);
    return r.append(new vt(e == 95 ? WO : YO, t, i, (m ? 1 : 0) | (v ? 2 : 0)));
  },
  HardBreak(r, e, t) {
    if (e == 92 && r.char(t + 1) == 10)
      return r.append(de(W.HardBreak, t, t + 2));
    if (e == 32) {
      let i = t + 1;
      for (; r.char(i) == 32; )
        i++;
      if (r.char(i) == 10 && i >= t + 2)
        return r.append(de(W.HardBreak, t, i + 1));
    }
    return -1;
  },
  Link(r, e, t) {
    return e == 91 ? r.append(new vt(
      Ei,
      t,
      t + 1,
      1
      /* Mark.Open */
    )) : -1;
  },
  Image(r, e, t) {
    return e == 33 && r.char(t + 1) == 91 ? r.append(new vt(
      Cs,
      t,
      t + 2,
      1
      /* Mark.Open */
    )) : -1;
  },
  LinkEnd(r, e, t) {
    if (e != 93)
      return -1;
    for (let i = r.parts.length - 1; i >= 0; i--) {
      let n = r.parts[i];
      if (n instanceof vt && (n.type == Ei || n.type == Cs)) {
        if (!n.side || r.skipSpace(n.to) == t && !/[(\[]/.test(r.slice(t + 1, t + 2)))
          return r.parts[i] = null, -1;
        let s = r.takeContent(i), o = r.parts[i] = HS(r, s, n.type == Ei ? W.Link : W.Image, n.from, t + 1);
        if (n.type == Ei)
          for (let a = 0; a < i; a++) {
            let l = r.parts[a];
            l instanceof vt && l.type == Ei && (l.side = 0);
          }
        return o.to;
      }
    }
    return -1;
  }
};
function HS(r, e, t, i, n) {
  let { text: s } = r, o = r.char(n), a = n;
  if (e.unshift(de(W.LinkMark, i, i + (t == W.Image ? 2 : 1))), e.push(de(W.LinkMark, n - 1, n)), o == 40) {
    let l = r.skipSpace(n + 1), c = zO(s, l - r.offset, r.offset), u;
    c && (l = r.skipSpace(c.to), l != c.to && (u = DO(s, l - r.offset, r.offset), u && (l = r.skipSpace(u.to)))), r.char(l) == 41 && (e.push(de(W.LinkMark, n, n + 1)), a = l + 1, c && e.push(c), u && e.push(u), e.push(de(W.LinkMark, l, a)));
  } else if (o == 91) {
    let l = VO(s, n - r.offset, r.offset, !1);
    l && (e.push(l), a = l.to);
  }
  return de(t, i, a, e);
}
function zO(r, e, t) {
  if (r.charCodeAt(e) == 60) {
    for (let n = e + 1; n < r.length; n++) {
      let s = r.charCodeAt(n);
      if (s == 62)
        return de(W.URL, e + t, n + 1 + t);
      if (s == 60 || s == 10)
        return !1;
    }
    return null;
  } else {
    let n = 0, s = e;
    for (let o = !1; s < r.length; s++) {
      let a = r.charCodeAt(s);
      if (Mt(a))
        break;
      if (o)
        o = !1;
      else if (a == 40)
        n++;
      else if (a == 41) {
        if (!n)
          break;
        n--;
      } else a == 92 && (o = !0);
    }
    return s > e ? de(W.URL, e + t, s + t) : s == r.length ? null : !1;
  }
}
function DO(r, e, t) {
  let i = r.charCodeAt(e);
  if (i != 39 && i != 34 && i != 40)
    return !1;
  let n = i == 40 ? 41 : i;
  for (let s = e + 1, o = !1; s < r.length; s++) {
    let a = r.charCodeAt(s);
    if (o)
      o = !1;
    else {
      if (a == n)
        return de(W.LinkTitle, e + t, s + 1 + t);
      a == 92 && (o = !0);
    }
  }
  return null;
}
function VO(r, e, t, i) {
  for (let n = !1, s = e + 1, o = Math.min(r.length, s + 999); s < o; s++) {
    let a = r.charCodeAt(s);
    if (n)
      n = !1;
    else {
      if (a == 93)
        return i ? !1 : de(W.LinkLabel, e + t, s + 1 + t);
      if (i && !Mt(a) && (i = !1), a == 91)
        return !1;
      a == 92 && (n = !0);
    }
  }
  return null;
}
class Xl {
  /**
  @internal
  */
  constructor(e, t, i) {
    this.parser = e, this.text = t, this.offset = i, this.parts = [];
  }
  /**
  Get the character code at the given (document-relative)
  position.
  */
  char(e) {
    return e >= this.end ? -1 : this.text.charCodeAt(e - this.offset);
  }
  /**
  The position of the end of this inline section.
  */
  get end() {
    return this.offset + this.text.length;
  }
  /**
  Get a substring of this inline section. Again uses
  document-relative positions.
  */
  slice(e, t) {
    return this.text.slice(e - this.offset, t - this.offset);
  }
  /**
  @internal
  */
  append(e) {
    return this.parts.push(e), e.to;
  }
  /**
  Add a [delimiter](#DelimiterType) at this given position. `open`
  and `close` indicate whether this delimiter is opening, closing,
  or both. Returns the end of the delimiter, for convenient
  returning from [parse functions](#InlineParser.parse).
  */
  addDelimiter(e, t, i, n, s) {
    return this.append(new vt(e, t, i, (n ? 1 : 0) | (s ? 2 : 0)));
  }
  /**
  Returns true when there is an unmatched link or image opening
  token before the current position.
  */
  get hasOpenLink() {
    for (let e = this.parts.length - 1; e >= 0; e--) {
      let t = this.parts[e];
      if (t instanceof vt && (t.type == Ei || t.type == Cs))
        return !0;
    }
    return !1;
  }
  /**
  Add an inline element. Returns the end of the element.
  */
  addElement(e) {
    return this.append(e);
  }
  /**
  Resolve markers between this.parts.length and from, wrapping matched markers in the
  appropriate node and updating the content of this.parts. @internal
  */
  resolveMarkers(e) {
    for (let i = e; i < this.parts.length; i++) {
      let n = this.parts[i];
      if (!(n instanceof vt && n.type.resolve && n.side & 2))
        continue;
      let s = n.type == WO || n.type == YO, o = n.to - n.from, a, l = i - 1;
      for (; l >= e; l--) {
        let w = this.parts[l];
        if (w instanceof vt && w.side & 1 && w.type == n.type && // Ignore emphasis delimiters where the character count doesn't match
        !(s && (n.side & 1 || w.side & 2) && (w.to - w.from + o) % 3 == 0 && ((w.to - w.from) % 3 || o % 3))) {
          a = w;
          break;
        }
      }
      if (!a)
        continue;
      let c = n.type.resolve, u = [], p = a.from, m = n.to;
      if (s) {
        let w = Math.min(2, a.to - a.from, o);
        p = a.to - w, m = n.from + w, c = w == 1 ? "Emphasis" : "StrongEmphasis";
      }
      a.type.mark && u.push(this.elt(a.type.mark, p, a.to));
      for (let w = l + 1; w < i; w++)
        this.parts[w] instanceof ln && u.push(this.parts[w]), this.parts[w] = null;
      n.type.mark && u.push(this.elt(n.type.mark, n.from, m));
      let v = this.elt(c, p, m, u);
      this.parts[l] = s && a.from != p ? new vt(a.type, a.from, p, a.side) : null, (this.parts[i] = s && n.to != m ? new vt(n.type, m, n.to, n.side) : null) ? this.parts.splice(i, 0, v) : this.parts[i] = v;
    }
    let t = [];
    for (let i = e; i < this.parts.length; i++) {
      let n = this.parts[i];
      n instanceof ln && t.push(n);
    }
    return t;
  }
  /**
  Find an opening delimiter of the given type. Returns `null` if
  no delimiter is found, or an index that can be passed to
  [`takeContent`](#InlineContext.takeContent) otherwise.
  */
  findOpeningDelimiter(e) {
    for (let t = this.parts.length - 1; t >= 0; t--) {
      let i = this.parts[t];
      if (i instanceof vt && i.type == e && i.side & 1)
        return t;
    }
    return null;
  }
  /**
  Remove all inline elements and delimiters starting from the
  given index (which you should get from
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter),
  resolve delimiters inside of them, and return them as an array
  of elements.
  */
  takeContent(e) {
    let t = this.resolveMarkers(e);
    return this.parts.length = e, t;
  }
  /**
  Return the delimiter at the given index. Mostly useful to get
  additional info out of a delimiter index returned by
  [`findOpeningDelimiter`](#InlineContext.findOpeningDelimiter).
  Returns null if there is no delimiter at this index.
  */
  getDelimiterAt(e) {
    let t = this.parts[e];
    return t instanceof vt ? t : null;
  }
  /**
  Skip space after the given (document) position, returning either
  the position of the next non-space character or the end of the
  section.
  */
  skipSpace(e) {
    return qr(this.text, e - this.offset) + this.offset;
  }
  elt(e, t, i, n) {
    return typeof e == "string" ? de(this.parser.getNodeType(e), t, i, n) : new IO(e, t);
  }
}
Xl.linkStart = Ei;
Xl.imageStart = Cs;
function Da(r, e) {
  if (!e.length)
    return r;
  if (!r.length)
    return e;
  let t = r.slice(), i = 0;
  for (let n of e) {
    for (; i < t.length && t[i].to < n.to; )
      i++;
    if (i < t.length && t[i].from < n.from) {
      let s = t[i];
      s instanceof ln && (t[i] = new ln(s.type, s.from, s.to, Da(s.children, [n])));
    } else
      t.splice(i++, 0, n);
  }
  return t;
}
const KS = [W.CodeBlock, W.ListItem, W.OrderedList, W.BulletList];
class JS {
  constructor(e, t) {
    this.fragments = e, this.input = t, this.i = 0, this.fragment = null, this.fragmentEnd = -1, this.cursor = null, e.length && (this.fragment = e[this.i++]);
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null, this.cursor = null, this.fragmentEnd = -1;
  }
  moveTo(e, t) {
    for (; this.fragment && this.fragment.to <= e; )
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (e ? e - 1 : 0))
      return !1;
    if (this.fragmentEnd < 0) {
      let s = this.fragment.to;
      for (; s > 0 && this.input.read(s - 1, s) != `
`; )
        s--;
      this.fragmentEnd = s ? s - 1 : 0;
    }
    let i = this.cursor;
    i || (i = this.cursor = this.fragment.tree.cursor(), i.firstChild());
    let n = e + this.fragment.offset;
    for (; i.to <= n; )
      if (!i.parent())
        return !1;
    for (; ; ) {
      if (i.from >= n)
        return this.fragment.from <= t;
      if (!i.childAfter(n))
        return !1;
    }
  }
  matches(e) {
    let t = this.cursor.tree;
    return t && t.prop(te.contextHash) == e;
  }
  takeNodes(e) {
    let t = this.cursor, i = this.fragment.offset, n = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0), s = e.absoluteLineStart, o = s, a = e.block.children.length, l = o, c = a;
    for (; ; ) {
      if (t.to - i > n) {
        if (t.type.isAnonymous && t.firstChild())
          continue;
        break;
      }
      let u = NO(t.from - i, e.ranges);
      if (t.to - i <= e.ranges[e.rangeI].to)
        e.addNode(t.tree, u);
      else {
        let p = new ye(e.parser.nodeSet.types[W.Paragraph], [], [], 0, e.block.hashProp);
        e.reusePlaceholders.set(p, t.tree), e.addNode(p, u);
      }
      if (t.type.is("Block") && (KS.indexOf(t.type.id) < 0 ? (o = t.to - i, a = e.block.children.length) : (o = l, a = c), l = t.to - i, c = e.block.children.length), !t.nextSibling())
        break;
    }
    for (; e.block.children.length > a; )
      e.block.children.pop(), e.block.positions.pop();
    return o - s;
  }
}
function NO(r, e) {
  let t = r;
  for (let i = 1; i < e.length; i++) {
    let n = e[i - 1].to, s = e[i].from;
    n < r && (t -= s - n);
  }
  return t;
}
const eb = xr({
  "Blockquote/...": Q.quote,
  HorizontalRule: Q.contentSeparator,
  "ATXHeading1/... SetextHeading1/...": Q.heading1,
  "ATXHeading2/... SetextHeading2/...": Q.heading2,
  "ATXHeading3/...": Q.heading3,
  "ATXHeading4/...": Q.heading4,
  "ATXHeading5/...": Q.heading5,
  "ATXHeading6/...": Q.heading6,
  "Comment CommentBlock": Q.comment,
  Escape: Q.escape,
  Entity: Q.character,
  "Emphasis/...": Q.emphasis,
  "StrongEmphasis/...": Q.strong,
  "Link/... Image/...": Q.link,
  "OrderedList/... BulletList/...": Q.list,
  "BlockQuote/...": Q.quote,
  "InlineCode CodeText": Q.monospace,
  "URL Autolink": Q.url,
  "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": Q.processingInstruction,
  "CodeInfo LinkLabel": Q.labelName,
  LinkTitle: Q.string,
  Paragraph: Q.content
}), tb = new Ds(new mn(BO).extend(eb), Object.keys(Yn).map((r) => Yn[r]), Object.keys(Yn).map((r) => EO[r]), Object.keys(Yn), GS, PO, Object.keys(Ro).map((r) => Ro[r]), Object.keys(Ro), []);
function ib(r, e, t) {
  let i = [];
  for (let n = r.firstChild, s = e; ; n = n.nextSibling) {
    let o = n ? n.from : t;
    if (o > s && i.push({ from: s, to: o }), !n)
      break;
    s = n.to;
  }
  return i;
}
function rb(r) {
  let { codeParser: e, htmlParser: t } = r;
  return { wrap: cd((n, s) => {
    let o = n.type.id;
    if (e && (o == W.CodeBlock || o == W.FencedCode)) {
      let a = "";
      if (o == W.FencedCode) {
        let c = n.node.getChild(W.CodeInfo);
        c && (a = s.read(c.from, c.to));
      }
      let l = e(a);
      if (l)
        return { parser: l, overlay: (c) => c.type.id == W.CodeText, bracketed: o == W.FencedCode };
    } else if (t && (o == W.HTMLBlock || o == W.HTMLTag || o == W.CommentBlock))
      return { parser: t, overlay: ib(n.node, n.from, n.to) };
    return null;
  }) };
}
const nb = { resolve: "Strikethrough", mark: "StrikethroughMark" }, sb = {
  defineNodes: [{
    name: "Strikethrough",
    style: { "Strikethrough/...": Q.strikethrough }
  }, {
    name: "StrikethroughMark",
    style: Q.processingInstruction
  }],
  parseInline: [{
    name: "Strikethrough",
    parse(r, e, t) {
      if (e != 126 || r.char(t + 1) != 126 || r.char(t + 2) == 126)
        return -1;
      let i = r.slice(t - 1, t), n = r.slice(t + 2, t + 3), s = /\s|^$/.test(i), o = /\s|^$/.test(n), a = hn.test(i), l = hn.test(n);
      return r.addDelimiter(nb, t, t + 2, !o && (!l || s || a), !s && (!a || o || l));
    },
    after: "Emphasis"
  }]
};
function Gr(r, e, t = 0, i, n = 0) {
  let s = 0, o = !0, a = -1, l = -1, c = !1, u = () => {
    i.push(r.elt("TableCell", n + a, n + l, r.parser.parseInline(e.slice(a, l), n + a)));
  };
  for (let p = t; p < e.length; p++) {
    let m = e.charCodeAt(p);
    m == 124 && !c ? ((!o || a > -1) && s++, o = !1, i && (a > -1 && u(), i.push(r.elt("TableDelimiter", p + n, p + n + 1))), a = l = -1) : (c || m != 32 && m != 9) && (a < 0 && (a = p), l = p + 1), c = !c && m == 92;
  }
  return a > -1 && (s++, i && u()), s;
}
function hf(r, e) {
  for (let t = e; t < r.length; t++) {
    let i = r.charCodeAt(t);
    if (i == 124)
      return !0;
    i == 92 && t++;
  }
  return !1;
}
const qO = /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
class cf {
  constructor() {
    this.rows = null;
  }
  nextLine(e, t, i) {
    if (this.rows == null) {
      this.rows = !1;
      let n;
      if ((t.next == 45 || t.next == 58 || t.next == 124) && qO.test(n = t.text.slice(t.pos))) {
        let s = [];
        Gr(e, i.content, 0, s, i.start) == Gr(e, n, 0) && (this.rows = [
          e.elt("TableHeader", i.start, i.start + i.content.length, s),
          e.elt("TableDelimiter", e.lineStart + t.pos, e.lineStart + t.text.length)
        ]);
      }
    } else if (this.rows) {
      let n = [];
      Gr(e, t.text, t.pos, n, e.lineStart), this.rows.push(e.elt("TableRow", e.lineStart + t.pos, e.lineStart + t.text.length, n));
    }
    return !1;
  }
  finish(e, t) {
    return this.rows ? (e.addLeafElement(t, e.elt("Table", t.start, t.start + t.content.length, this.rows)), !0) : !1;
  }
}
const ob = {
  defineNodes: [
    { name: "Table", block: !0 },
    { name: "TableHeader", style: { "TableHeader/...": Q.heading } },
    "TableRow",
    { name: "TableCell", style: Q.content },
    { name: "TableDelimiter", style: Q.processingInstruction }
  ],
  parseBlock: [{
    name: "Table",
    leaf(r, e) {
      return hf(e.content, 0) ? new cf() : null;
    },
    endLeaf(r, e, t) {
      if (t.parsers.some((n) => n instanceof cf) || !hf(e.text, e.basePos))
        return !1;
      let i = r.peekLine();
      return qO.test(i) && Gr(r, e.text, e.basePos) == Gr(r, i, e.basePos);
    },
    before: "SetextHeading"
  }]
};
class ab {
  nextLine() {
    return !1;
  }
  finish(e, t) {
    return e.addLeafElement(t, e.elt("Task", t.start, t.start + t.content.length, [
      e.elt("TaskMarker", t.start, t.start + 3),
      ...e.parser.parseInline(t.content.slice(3), t.start + 3)
    ])), !0;
  }
}
const lb = {
  defineNodes: [
    { name: "Task", block: !0, style: Q.list },
    { name: "TaskMarker", style: Q.atom }
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(r, e) {
      return /^\[[ xX]\][ \t]/.test(e.content) && r.parentType().name == "ListItem" ? new ab() : null;
    },
    after: "SetextHeading"
  }]
}, ff = /(www\.)|(https?:\/\/)|([\w.+-]{1,100}@)|(mailto:|xmpp:)/gy, uf = /[\w-]+(\.[\w-]+)+(:\d+)?(\/[^\s<]*)?/gy, hb = /[\w-]+\.[\w-]+($|[/:])/, df = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy, Of = /\/[a-zA-Z\d@.]+/gy;
function pf(r, e, t, i) {
  let n = 0;
  for (let s = e; s < t; s++)
    r[s] == i && n++;
  return n;
}
function cb(r, e) {
  uf.lastIndex = e;
  let t = uf.exec(r);
  if (!t || hb.exec(t[0])[0].indexOf("_") > -1)
    return -1;
  let i = e + t[0].length;
  for (; ; ) {
    let n = r[i - 1], s;
    if (/[?!.,:*_~]/.test(n) || n == ")" && pf(r, e, i, ")") > pf(r, e, i, "("))
      i--;
    else if (n == ";" && (s = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(r.slice(e, i))))
      i = e + s.index;
    else
      break;
  }
  return i;
}
function gf(r, e) {
  df.lastIndex = e;
  let t = df.exec(r);
  if (!t)
    return -1;
  let i = t[0][t[0].length - 1];
  return i == "_" || i == "-" ? -1 : e + t[0].length - (i == "." ? 1 : 0);
}
const fb = {
  parseInline: [{
    name: "Autolink",
    parse(r, e, t) {
      let i = t - r.offset;
      if (i && /\w/.test(r.text[i - 1]))
        return -1;
      ff.lastIndex = i;
      let n = ff.exec(r.text), s = -1;
      if (!n)
        return -1;
      if (n[1] || n[2]) {
        if (s = cb(r.text, i + n[0].length), s > -1 && r.hasOpenLink) {
          let o = /([^\[\]]|\[[^\]]*\])*/.exec(r.text.slice(i, s));
          s = i + o[0].length;
        }
      } else n[3] ? s = gf(r.text, i) : (s = gf(r.text, i + n[0].length), s > -1 && n[0] == "xmpp:" && (Of.lastIndex = s, n = Of.exec(r.text), n && (s = n.index + n[0].length)));
      return s < 0 ? -1 : (r.addElement(r.elt("URL", t, s + r.offset)), s + r.offset);
    }
  }]
}, ub = [ob, lb, sb, fb];
function GO(r, e, t) {
  return (i, n, s) => {
    if (n != r || i.char(s + 1) == r)
      return -1;
    let o = [i.elt(t, s, s + 1)];
    for (let a = s + 1; a < i.end; a++) {
      let l = i.char(a);
      if (l == r)
        return i.addElement(i.elt(e, s, a + 1, o.concat(i.elt(t, a, a + 1))));
      if (l == 92 && o.push(i.elt("Escape", a, a++ + 2)), Mt(l))
        break;
    }
    return -1;
  };
}
const db = {
  defineNodes: [
    { name: "Superscript", style: Q.special(Q.content) },
    { name: "SuperscriptMark", style: Q.processingInstruction }
  ],
  parseInline: [{
    name: "Superscript",
    parse: GO(94, "Superscript", "SuperscriptMark")
  }]
}, Ob = {
  defineNodes: [
    { name: "Subscript", style: Q.special(Q.content) },
    { name: "SubscriptMark", style: Q.processingInstruction }
  ],
  parseInline: [{
    name: "Subscript",
    parse: GO(126, "Subscript", "SubscriptMark")
  }]
}, pb = {
  defineNodes: [{ name: "Emoji", style: Q.character }],
  parseInline: [{
    name: "Emoji",
    parse(r, e, t) {
      let i;
      return e != 58 || !(i = /^[a-zA-Z_0-9]+:/.exec(r.slice(t + 1, r.end))) ? -1 : r.addElement(r.elt("Emoji", t, t + 1 + i[0].length));
    }
  }]
}, gb = 55, mb = 1, yb = 56, vb = 2, Sb = 57, bb = 3, mf = 4, kb = 5, Ll = 6, UO = 7, FO = 8, HO = 9, KO = 10, xb = 11, wb = 12, Qb = 13, Zo = 58, $b = 14, Pb = 15, yf = 59, JO = 21, Cb = 23, ep = 24, Tb = 25, Va = 27, tp = 28, Ab = 29, Mb = 32, Rb = 35, Zb = 37, Xb = 38, Lb = 0, Eb = 1, _b = {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  command: !0,
  embed: !0,
  frame: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0,
  menuitem: !0
}, Bb = {
  dd: !0,
  li: !0,
  optgroup: !0,
  option: !0,
  p: !0,
  rp: !0,
  rt: !0,
  tbody: !0,
  td: !0,
  tfoot: !0,
  th: !0,
  tr: !0
}, vf = {
  dd: { dd: !0, dt: !0 },
  dt: { dd: !0, dt: !0 },
  li: { li: !0 },
  option: { option: !0, optgroup: !0 },
  optgroup: { optgroup: !0 },
  p: {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    dir: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    menu: !0,
    nav: !0,
    ol: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    ul: !0
  },
  rp: { rp: !0, rt: !0 },
  rt: { rp: !0, rt: !0 },
  tbody: { tbody: !0, tfoot: !0 },
  td: { td: !0, th: !0 },
  tfoot: { tbody: !0 },
  th: { td: !0, th: !0 },
  thead: { tbody: !0, tfoot: !0 },
  tr: { tr: !0 }
};
function jb(r) {
  return r == 45 || r == 46 || r == 58 || r >= 65 && r <= 90 || r == 95 || r >= 97 && r <= 122 || r >= 161;
}
let Sf = null, bf = null, kf = 0;
function Na(r, e) {
  let t = r.pos + e;
  if (kf == t && bf == r) return Sf;
  let i = r.peek(e), n = "";
  for (; jb(i); )
    n += String.fromCharCode(i), i = r.peek(++e);
  return bf = r, kf = t, Sf = n ? n.toLowerCase() : i == Ib || i == Wb ? void 0 : null;
}
const ip = 60, Ts = 62, El = 47, Ib = 63, Wb = 33, Yb = 45;
function xf(r, e) {
  this.name = r, this.parent = e;
}
const zb = [Ll, KO, UO, FO, HO], Db = new pO({
  start: null,
  shift(r, e, t, i) {
    return zb.indexOf(e) > -1 ? new xf(Na(i, 1) || "", r) : r;
  },
  reduce(r, e) {
    return e == JO && r ? r.parent : r;
  },
  reuse(r, e, t, i) {
    let n = e.type.id;
    return n == Ll || n == Zb ? new xf(Na(i, 1) || "", r) : r;
  },
  strict: !1
}), Vb = new kt((r, e) => {
  if (r.next != ip) {
    r.next < 0 && e.context && r.acceptToken(Zo);
    return;
  }
  r.advance();
  let t = r.next == El;
  t && r.advance();
  let i = Na(r, 0);
  if (i === void 0) return;
  if (!i) return r.acceptToken(t ? Pb : $b);
  let n = e.context ? e.context.name : null;
  if (t) {
    if (i == n) return r.acceptToken(xb);
    if (n && Bb[n]) return r.acceptToken(Zo, -2);
    if (e.dialectEnabled(Lb)) return r.acceptToken(wb);
    for (let s = e.context; s; s = s.parent) if (s.name == i) return;
    r.acceptToken(Qb);
  } else {
    if (i == "script") return r.acceptToken(UO);
    if (i == "style") return r.acceptToken(FO);
    if (i == "textarea") return r.acceptToken(HO);
    if (_b.hasOwnProperty(i)) return r.acceptToken(KO);
    n && vf[n] && vf[n][i] ? r.acceptToken(Zo, -1) : r.acceptToken(Ll);
  }
}, { contextual: !0 }), Nb = new kt((r) => {
  for (let e = 0, t = 0; ; t++) {
    if (r.next < 0) {
      t && r.acceptToken(yf);
      break;
    }
    if (r.next == Yb)
      e++;
    else if (r.next == Ts && e >= 2) {
      t >= 3 && r.acceptToken(yf, -2);
      break;
    } else
      e = 0;
    r.advance();
  }
});
function qb(r) {
  for (; r; r = r.parent)
    if (r.name == "svg" || r.name == "math") return !0;
  return !1;
}
const Gb = new kt((r, e) => {
  if (r.next == El && r.peek(1) == Ts) {
    let t = e.dialectEnabled(Eb) || qb(e.context);
    r.acceptToken(t ? kb : mf, 2);
  } else r.next == Ts && r.acceptToken(mf, 1);
});
function _l(r, e, t) {
  let i = 2 + r.length;
  return new kt((n) => {
    for (let s = 0, o = 0, a = 0; ; a++) {
      if (n.next < 0) {
        a && n.acceptToken(e);
        break;
      }
      if (s == 0 && n.next == ip || s == 1 && n.next == El || s >= 2 && s < i && n.next == r.charCodeAt(s - 2))
        s++, o++;
      else if (s == i && n.next == Ts) {
        a > o ? n.acceptToken(e, -o) : n.acceptToken(t, -(o - 2));
        break;
      } else if ((n.next == 10 || n.next == 13) && a) {
        n.acceptToken(e, 1);
        break;
      } else
        s = o = 0;
      n.advance();
    }
  });
}
const Ub = _l("script", gb, mb), Fb = _l("style", yb, vb), Hb = _l("textarea", Sb, bb), Kb = xr({
  "Text RawText IncompleteTag IncompleteCloseTag": Q.content,
  "StartTag StartCloseTag SelfClosingEndTag EndTag": Q.angleBracket,
  TagName: Q.tagName,
  "MismatchedCloseTag/TagName": [Q.tagName, Q.invalid],
  AttributeName: Q.attributeName,
  "AttributeValue UnquotedAttributeValue": Q.attributeValue,
  Is: Q.definitionOperator,
  "EntityReference CharacterReference": Q.character,
  Comment: Q.blockComment,
  ProcessingInst: Q.processingInstruction,
  DoctypeDecl: Q.documentMeta
}), Jb = yr.deserialize({
  version: 14,
  states: ",xOVO!rOOO!ZQ#tO'#CrO!`Q#tO'#C{O!eQ#tO'#DOO!jQ#tO'#DRO!oQ#tO'#DTO!tOaO'#CqO#PObO'#CqO#[OdO'#CqO$kO!rO'#CqOOO`'#Cq'#CqO$rO$fO'#DUO$zQ#tO'#DWO%PQ#tO'#DXOOO`'#Dl'#DlOOO`'#DZ'#DZQVO!rOOO%UQ&rO,59^O%aQ&rO,59gO%lQ&rO,59jO%wQ&rO,59mO&SQ&rO,59oOOOa'#D_'#D_O&_OaO'#CyO&jOaO,59]OOOb'#D`'#D`O&rObO'#C|O&}ObO,59]OOOd'#Da'#DaO'VOdO'#DPO'bOdO,59]OOO`'#Db'#DbO'jO!rO,59]O'qQ#tO'#DSOOO`,59],59]OOOp'#Dc'#DcO'vO$fO,59pOOO`,59p,59pO(OQ#|O,59rO(TQ#|O,59sOOO`-E7X-E7XO(YQ&rO'#CtOOQW'#D['#D[O(hQ&rO1G.xOOOa1G.x1G.xOOO`1G/Z1G/ZO(sQ&rO1G/ROOOb1G/R1G/RO)OQ&rO1G/UOOOd1G/U1G/UO)ZQ&rO1G/XOOO`1G/X1G/XO)fQ&rO1G/ZOOOa-E7]-E7]O)qQ#tO'#CzOOO`1G.w1G.wOOOb-E7^-E7^O)vQ#tO'#C}OOOd-E7_-E7_O){Q#tO'#DQOOO`-E7`-E7`O*QQ#|O,59nOOOp-E7a-E7aOOO`1G/[1G/[OOO`1G/^1G/^OOO`1G/_1G/_O*VQ,UO,59`OOQW-E7Y-E7YOOOa7+$d7+$dOOO`7+$u7+$uOOOb7+$m7+$mOOOd7+$p7+$pOOO`7+$s7+$sO*bQ#|O,59fO*gQ#|O,59iO*lQ#|O,59lOOO`1G/Y1G/YO*qO7[O'#CwO+SOMhO'#CwOOQW1G.z1G.zOOO`1G/Q1G/QOOO`1G/T1G/TOOO`1G/W1G/WOOOO'#D]'#D]O+eO7[O,59cOOQW,59c,59cOOOO'#D^'#D^O+vOMhO,59cOOOO-E7Z-E7ZOOQW1G.}1G.}OOOO-E7[-E7[",
  stateData: ",c~O!_OS~OUSOVPOWQOXROYTO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O|_O!eZO~OgaO~OgbO~OgcO~OgdO~OgeO~O!XfOPmP![mP~O!YiOQpP![pP~O!ZlORsP![sP~OUSOVPOWQOXROYTOZqO[]O][O^^O_^Oa^Ob^Oc^Od^Oy^O!eZO~O![rO~P#gO!]sO!fuO~OgvO~OgwO~OS|OT}OiyO~OS!POT}OiyO~OS!ROT}OiyO~OS!TOT}OiyO~OS}OT}OiyO~O!XfOPmX![mX~OP!WO![!XO~O!YiOQpX![pX~OQ!ZO![!XO~O!ZlORsX![sX~OR!]O![!XO~O![!XO~P#gOg!_O~O!]sO!f!aO~OS!bO~OS!cO~Oj!dOShXThXihX~OS!fOT!gOiyO~OS!hOT!gOiyO~OS!iOT!gOiyO~OS!jOT!gOiyO~OS!gOT!gOiyO~Og!kO~Og!lO~Og!mO~OS!nO~Ol!qO!a!oO!c!pO~OS!rO~OS!sO~OS!tO~Ob!uOc!uOd!uO!a!wO!b!uO~Ob!xOc!xOd!xO!c!wO!d!xO~Ob!uOc!uOd!uO!a!{O!b!uO~Ob!xOc!xOd!xO!c!{O!d!xO~OT~cbd!ey|!e~",
  goto: "%q!aPPPPPPPPPPPPPPPPPPPPP!b!hP!nPP!zP!}#Q#T#Z#^#a#g#j#m#s#y!bP!b!bP$P$V$m$s$y%P%V%]%cPPPPPPPP%iX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "⚠ StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 68,
  context: Db,
  nodeProps: [
    ["closedBy", -10, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, "EndTag", 6, "EndTag SelfClosingEndTag", -4, 22, 31, 34, 37, "CloseTag"],
    ["openedBy", 4, "StartTag StartCloseTag", 5, "StartTag", -4, 30, 33, 36, 38, "OpenTag"],
    ["group", -10, 14, 15, 18, 19, 20, 21, 40, 41, 42, 43, "Entity", 17, "Entity TextContent", -3, 29, 32, 35, "TextContent Entity"],
    ["isolate", -11, 22, 30, 31, 33, 34, 36, 37, 38, 39, 42, 43, "ltr", -3, 27, 28, 40, ""]
  ],
  propSources: [Kb],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|caPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bXaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UVaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pTaPOv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!dpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({WaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!b`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!b`!dpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYlWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]`aP!b`!dp!_^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebiSlWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXiSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vciSaP!b`!dpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!ahaP!dpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WiiSlWd!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zblWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOb!R!R7tP;=`<%l7S!Z8OYlWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{iiSlWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbiSlWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QciSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXiSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TalWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOc!R!RAwP;=`<%lAY!ZBRYlWc!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhiSlWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbiSlWc!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbiSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXiSc!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!cxaP!b`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYliSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_kiSaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_XaP!b`!dp!fQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZiSgQaPlW!b`!dpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!b`!dpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!b`!dpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!b`!dp!ePOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!b`!dpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!b`!dpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!b`!dpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!b`!dpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!b`!dpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!b`!dpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!b`!dpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!dpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO|PP!-nP;=`<%l!-Sq!-xS!dp|POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!b`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!b`|POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!b`!dp|POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!b`!dpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!b`!dpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!b`!dpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!b`!dpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!b`!dpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!b`!dpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!dpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOyPP!7TP;=`<%l!6Vq!7]V!dpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!dpyPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!b`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!b`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!b`yPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!b`!dpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!b`!dpyPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXjSaP!b`!dpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
  tokenizers: [Ub, Fb, Hb, Gb, Vb, Nb, 0, 1, 2, 3, 4, 5],
  topRules: { Document: [0, 16] },
  dialects: { noMatch: 0, selfClosing: 515 },
  tokenPrec: 517
});
function rp(r, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i of r.getChildren(ep)) {
    let n = i.getChild(Tb), s = i.getChild(Va) || i.getChild(tp);
    n && (t[e.read(n.from, n.to)] = s ? s.type.id == Va ? e.read(s.from + 1, s.to - 1) : e.read(s.from, s.to) : "");
  }
  return t;
}
function wf(r, e) {
  let t = r.getChild(Cb);
  return t ? e.read(t.from, t.to) : " ";
}
function Xo(r, e, t) {
  let i;
  for (let n of t)
    if (!n.attrs || n.attrs(i || (i = rp(r.node.parent.firstChild, e))))
      return { parser: n.parser, bracketed: !0 };
  return null;
}
function np(r = [], e = []) {
  let t = [], i = [], n = [], s = [];
  for (let a of r)
    (a.tag == "script" ? t : a.tag == "style" ? i : a.tag == "textarea" ? n : s).push(a);
  let o = e.length ? /* @__PURE__ */ Object.create(null) : null;
  for (let a of e) (o[a.name] || (o[a.name] = [])).push(a);
  return cd((a, l) => {
    let c = a.type.id;
    if (c == Ab) return Xo(a, l, t);
    if (c == Mb) return Xo(a, l, i);
    if (c == Rb) return Xo(a, l, n);
    if (c == JO && s.length) {
      let u = a.node, p = u.firstChild, m = p && wf(p, l), v;
      if (m) {
        for (let b of s)
          if (b.tag == m && (!b.attrs || b.attrs(v || (v = rp(p, l))))) {
            let w = u.lastChild, C = w.type.id == Xb ? w.from : u.to;
            if (C > p.to)
              return { parser: b.parser, overlay: [{ from: p.to, to: C }] };
          }
      }
    }
    if (o && c == ep) {
      let u = a.node, p;
      if (p = u.firstChild) {
        let m = o[l.read(p.from, p.to)];
        if (m) for (let v of m) {
          if (v.tagName && v.tagName != wf(u.parent, l)) continue;
          let b = u.lastChild;
          if (b.type.id == Va) {
            let w = b.from + 1, C = b.lastChild, A = b.to - (C && C.isError ? 0 : 1);
            if (A > w) return { parser: v.parser, overlay: [{ from: w, to: A }], bracketed: !0 };
          } else if (b.type.id == tp)
            return { parser: v.parser, overlay: [{ from: b.from, to: b.to }] };
        }
      }
    }
    return null;
  });
}
const ek = 145, Qf = 1, tk = 146, ik = 147, sp = 2, rk = 148, nk = 3, sk = 4, op = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], ok = 58, ak = 40, ap = 95, lk = 91, es = 45, hk = 46, ck = 35, fk = 37, uk = 38, dk = 92, Ok = 10, pk = 42;
function cn(r) {
  return r >= 65 && r <= 90 || r >= 97 && r <= 122 || r >= 161;
}
function Bl(r) {
  return r >= 48 && r <= 57;
}
function $f(r) {
  return Bl(r) || r >= 97 && r <= 102 || r >= 65 && r <= 70;
}
const lp = (r, e, t) => (i, n) => {
  for (let s = !1, o = 0, a = 0; ; a++) {
    let { next: l } = i;
    if (cn(l) || l == es || l == ap || s && Bl(l))
      !s && (l != es || a > 0) && (s = !0), o === a && l == es && o++, i.advance();
    else if (l == dk && i.peek(1) != Ok) {
      if (i.advance(), $f(i.next)) {
        do
          i.advance();
        while ($f(i.next));
        i.next == 32 && i.advance();
      } else i.next > -1 && i.advance();
      s = !0;
    } else {
      s && i.acceptToken(
        o == 2 && n.canShift(sp) ? e : l == ak ? t : r
      );
      break;
    }
  }
}, gk = new kt(
  lp(tk, sp, ik),
  { contextual: !0 }
), mk = new kt(
  lp(rk, nk, sk),
  { contextual: !0 }
), yk = new kt((r) => {
  if (op.includes(r.peek(-1))) {
    let { next: e } = r;
    (cn(e) || e == ap || e == ck || e == hk || e == pk || e == lk || e == ok && cn(r.peek(1)) || e == es || e == uk) && r.acceptToken(ek);
  }
}), vk = new kt((r) => {
  if (!op.includes(r.peek(-1))) {
    let { next: e } = r;
    if (e == fk && (r.advance(), r.acceptToken(Qf)), cn(e)) {
      do
        r.advance();
      while (cn(r.next) || Bl(r.next));
      r.acceptToken(Qf);
    }
  }
}), Sk = xr({
  "AtKeyword import charset namespace keyframes media supports font-feature-values": Q.definitionKeyword,
  "from to selector scope MatchFlag": Q.keyword,
  NamespaceName: Q.namespace,
  KeyframeName: Q.labelName,
  KeyframeRangeName: Q.operatorKeyword,
  TagName: Q.tagName,
  ClassName: Q.className,
  PseudoClassName: Q.constant(Q.className),
  IdName: Q.labelName,
  "FeatureName PropertyName": Q.propertyName,
  AttributeName: Q.attributeName,
  NumberLiteral: Q.number,
  KeywordQuery: Q.keyword,
  UnaryQueryOp: Q.operatorKeyword,
  "CallTag ValueName FontName": Q.atom,
  VariableName: Q.variableName,
  Callee: Q.operatorKeyword,
  Unit: Q.unit,
  "UniversalSelector NestingSelector": Q.definitionOperator,
  "MatchOp CompareOp": Q.compareOperator,
  "ChildOp SiblingOp, LogicOp": Q.logicOperator,
  BinOp: Q.arithmeticOperator,
  Important: Q.modifier,
  Comment: Q.blockComment,
  ColorLiteral: Q.color,
  "ParenthesizedContent StringLiteral": Q.string,
  ":": Q.punctuation,
  "PseudoOp #": Q.derefOperator,
  "; , |": Q.separator,
  "( )": Q.paren,
  "[ ]": Q.squareBracket,
  "{ }": Q.brace
}), bk = { __proto__: null, lang: 44, "nth-child": 44, "nth-last-child": 44, "nth-of-type": 44, "nth-last-of-type": 44, dir: 44, "host-context": 44, if: 90, url: 152, "url-prefix": 152, domain: 152, regexp: 152 }, kk = { __proto__: null, or: 104, and: 104, not: 112, only: 112, layer: 206 }, xk = { __proto__: null, selector: 118, style: 124, layer: 202 }, wk = { __proto__: null, "@import": 198, "@media": 210, "@charset": 214, "@namespace": 218, "@keyframes": 224, "@supports": 236, "@scope": 240, "@font-feature-values": 246 }, Qk = { __proto__: null, to: 243 }, $k = yr.deserialize({
  version: 14,
  states: "MlQYQdOOO#}QdOOP$UO`OOO%OQaO'#CfOOQP'#Ce'#CeO%VQdO'#CgO%[Q`O'#CgO%aQaO'#FnO&XQdO'#CkO&xQaO'#CcO'SQdO'#CnO'_QdO'#EOO'dQdO'#EQO'oQdO'#EXO'oQdO'#E[OOQP'#Fn'#FnO)RQhO'#E}OOQS'#Fm'#FmOOQS'#FQ'#FQQYQdOOO)YQdO'#EbO*iQhO'#EhO)YQdO'#EjO*pQdO'#ElO*{QdO'#EoO)}QhO'#EuO+TQdO'#EwO+`QdO'#EzO+eQaO'#CfO+lQ`O'#E_O+qQ`O'#F{O+|QdO'#F{QOQ`OOP,WO&jO'#CaPOOO)CA])CA]OOQP'#Ci'#CiOOQP,59R,59RO%VQdO,59ROOQP'#Cm'#CmOOQP,59V,59VO&XQdO,59VO,cQdO,59YO'_QdO,5:jO'dQdO,5:lO'oQdO,5:sO'oQdO,5:uO'oQdO,5:vO'oQdO'#FXO,nQ`O,58}O,vQdO'#E^OOQS,58},58}OOQP'#Cq'#CqOOQO'#D|'#D|OOQP,59Y,59YO,}Q`O,59YO-SQ`O,59YOOQP'#EP'#EPOOQP,5:j,5:jO-XQpO'#ERO-dQdO'#ESO-iQ`O'#ESO-nQpO,5:lO.XQaO,5:sO.oQaO,5:vOOQW'#D^'#D^O/nQhO'#DgO0RQhO,5;iO)}QhO'#DeO0`Q`O'#DnO0eQhO'#DxOOQW'#Ft'#FtOOQS,5;i,5;iO0jQ`O'#DhO0oQ`O'#DkOOQS-E9O-E9OOOQ['#Cv'#CvO0tQdO'#CwO1[QdO'#C}O1rQdO'#DQO2YQ!pO'#DSO4fQ!jO,5:|OOQO'#DX'#DXO-SQ`O'#DWO4vQ!nO'#FqO6|Q`O'#DYO7RQ`O'#DyOOQ['#Fq'#FqO7WQhO'#GOO7fQ`O,5;SO7kQ!bO,5;UOOQS'#En'#EnO7sQ`O,5;WO7xQdO,5;WOOQO'#Eq'#EqO8QQ`O,5;ZO8VQhO,5;aO'oQdO'#DjOOQS,5;c,5;cO0jQ`O,5;cO8_QdO,5;cOOQS'#F`'#F`O8gQdO'#E|O7fQ`O,5;fO8oQdO,5:yO9PQdO'#FZO9^Q`O,5<gO9^Q`O,5<gPOOO'#FP'#FPP9iO&jO,58{POOO,58{,58{OOQP1G.m1G.mOOQP1G.q1G.qOOQP1G.t1G.tO,}Q`O1G.tO-SQ`O1G.tOOQP1G0U1G0UO9tQpO1G0WO9|QaO1G0_O:dQaO1G0aO:zQaO1G0bO;bQaO,5;sOOQO-E9V-E9VOOQS1G.i1G.iO;lQ`O,5:xO;qQdO'#D}O;xQdO'#CuOOQO'#EU'#EUOOQO,5:n,5:nO-dQdO,5:nOOQP1G0W1G0WO)YQdO1G0WO<PQ!jO'#D^O<_Q!bO,59yO<gQhO,5:ROOQO'#Fu'#FuO<bQ!bO,59}O<oQhO'#FaO)}QhO,59{O)}QhO'#FaO=gQhO1G1TOOQS1G1T1G1TO=qQhO,5:PO>lQhO'#DoOOQW,5:Y,5:YOOQW,5:d,5:dOOQW,5:S,5:SO>vQhO,5:VO?bQ!fO'#FrOOQS'#Fr'#FrOOQS'#FS'#FSO@rQdO,59cOOQ[,59c,59cOAYQdO,59iOOQ[,59i,59iOApQdO,59lOOQ[,59l,59lOOQ[,59n,59nO)YQdO,59pOBWQhO'#EdOOQW'#Ed'#EdOBuQ`O1G0hO4oQhO1G0hOOQ[,59r,59rO)}QhO'#D[OOQ[,59t,59tOBzQ#tO,5:eOCVQhO'#F]OCdQ`O,5<jOOQS1G0n1G0nOOQS1G0p1G0pOOQS1G0r1G0rOCoQ`O1G0rOCtQdO'#ErOOQS1G0u1G0uOOQS1G0{1G0{ODPQaO,5:UO7fQ`O1G0}OOQS1G0}1G0}O0jQ`O1G0}OOQS-E9^-E9^OOQS1G1Q1G1QODWQ!fO1G0eODnQ`O'#EaOOQO1G0e1G0eOOQO,5;u,5;uODsQdO,5;uOOQO-E9X-E9XOEQQ`O1G2RPOOO-E8}-E8}POOO1G.g1G.gOOQP7+$`7+$`OOQP7+%r7+%rO)YQdO7+%rOOQS1G0d1G0dOE]QaO'#FzOEgQ`O,5:iOElQ!fO'#FROFjQdO'#FpOFtQ`O,59aOOQO1G0Y1G0YOFyQ!bO7+%rO)YQdO1G/eOGUQhO1G/iOOQW1G/m1G/mOOQW1G/g1G/gOGgQhO,5;{OOQW-E9_-E9_OOQS7+&o7+&oOH_QhO'#D^OHmQhO'#FxOHxQ`O'#FxOH}Q`O,5:ZOISQ!bO'#D`O>vQhO'#DmOI_QhO'#DqOIgQhO'#DsOIlQhO'#FwOOQO'#Fw'#FwOItQ!bO'#DwOOQO'#Fy'#FyOOQO'#Fv'#FvOIyQ`O1G/qOOQS-E9Q-E9QOOQ[1G.}1G.}OOQ[1G/T1G/TOOQ[1G/W1G/WOOQ[1G/[1G/[OJOQdO,5;OOOQS7+&S7+&SOJTQ`O7+&SOJYQhO'#D]OJbQ`O,59vO)}QhO,59vOOQ[1G0P1G0POJjQ`O1G0POJoQhO,5;wOOQO-E9Z-E9ZOOQS7+&^7+&^OJ}QbO'#DSOOQO'#Et'#EtOK]Q`O'#EsOOQO'#Es'#EsOKhQ`O'#F^OKpQdO,5;^OOQS,5;^,5;^OOQ[1G/p1G/pOOQS7+&i7+&iO7fQ`O7+&iOK{Q!fO'#FYO)YQdO'#FYOMSQdO7+&POOQO7+&P7+&POOQO,5:{,5:{OOQO1G1a1G1aOMgQ!bO<<I^OMrQdO'#FWOM|Q`O,5<fOOQP1G0T1G0TOOQS-E9P-E9PONUQdO'#FVON`Q`O,5<[OOQ]1G.{1G.{OOQP<<I^<<I^ONhQ`O<<I^ONmQdO7+%POOQO'#D`'#D`ONtQ!bO7+%TON|QhO'#FUO! ZQ`O,5<dO)YQdO,5<dOOQW1G/u1G/uO)YQdO,5:bO! cQ`O,5:XO>vQhO'#DrOOQO,5:],5:]O! hQhO,5:_OGUQhO,5:cOOQW7+%]7+%]OOQO'#Ef'#EfO! pQ`O1G0jOOQS<<In<<InO)YQdO,59wO!!dQhO1G/bOOQ[1G/b1G/bO!!kQ`O1G/bOOQW-E9R-E9ROOQ[7+%k7+%kOOQO,5;_,5;_OCwQdO'#F_OKhQ`O,5;xOOQS,5;x,5;xOOQS-E9[-E9[OOQS1G0x1G0xOOQS<<JT<<JTO!!sQ!fO,5;tOOQS-E9W-E9WOOQO<<Ik<<IkOOQPAN>xAN>xO!#zQ`OAN>xO!$PQaO,5;rOOQO-E9U-E9UO!$ZQdO,5;qOOQO-E9T-E9TOOQW<<Hk<<HkOOQW<<Ho<<HoO!$eQhO<<HoO!$vQhO,5;pO!%RQ`O,5;pOOQO-E9S-E9SO!%WQdO1G2OO!%bQdO1G/|O!%iQhO1G/sO!%qQ`O,5:^O>vQhO'#DuOOQO1G/y1G/yO!%vQ!bO1G/}OJOQdO'#F[O!&OQ`O7+&UOOQW7+&U7+&UO!&WQ!bO1G/cOOQ[7+$|7+$|O!&cQhO7+$|P!&jQ`O'#FTOOQO,5;y,5;yOOQO-E9]-E9]OOQS1G1d1G1dOOQPG24dG24dO!&oQ`OAN>ZO)YQdO1G1[O!&tQ`O7+'jOOQO1G/x1G/xO!&|Q`O,5:aO!$eQhO7+%iOOQO,5;v,5;vOOQO-E9Y-E9YOOQW<<Ip<<IpOOQ[<<Hh<<HhPOQW,5;o,5;oOOQWG23uG23uO!'RQdO7+&vOOQO1G/{1G/{OOQO<<IT<<IT",
  stateData: "!'f~O$[OS$]QQ~OWVO^_O`WOcYOdYOl`OmZOp[O!|]O#P^O#VdO#]eO#_fO#agO#dhO#jiO#ljO#okO$WRO$cTO~OQmOWVO^_O`WOcYOdYOl`OmZOp[O!|]O#P^O#VdO#]eO#_fO#agO#dhO#jiO#ljO#okO$WlO$cTO~O$U$oP~P!jO$]qO~O`YXcYXdYXmYXpYXsYX!dYX!|YX#PYX$VYX$c[X~OgYX~P$ZO$WsO~O$cuO~O$cuO`$bXc$bXd$bXm$bXp$bXs$bX!d$bX!|$bX#P$bX$V$bXg$bX~O$WvO~O`xOcyOdyOmzOp{O!||O#P!OO$V}O~Os!RO!d!PO~P&^Of!XO$W!TO$X!UO~O$W!YO~OW!^O$W![O$c!]O~OWVO^_O`WOcYOdYOmZOp[O!|]O#P^O$WRO$cTO~OS!fOc!gOd!gOh!cOs!RO!Y!eO!]!jO!`!kO$Y!bO~On!iO~P(dOQ!uOh!nOp!oOs!pOu!xOw!xO}!vO!n!wO$W!mO$X!sO$g!qO~OS!fOc!gOd!gOh!cO!Y!eO!]!jO!`!kO$Y!bO~Os$rP~P)}Ow!}O!n!wO$W!|O~Ow#PO$W#PO~Oh#SOs!RO#m#UO~O$W#WO~Oc#SX~P$ZOc#ZO~On#[O$U$oXr$oX~O$U$oXr$oX~P!jO$^#_O$_#_O$`#aO~Of#fO$W!TO$X!UO~Os!RO!d!PO~Or$oP~P!jOh#pO~Oh#qO~Oo!uX!y!uX$c!wX~O$W#rO~O$c#tO~Oo#uO!y#vO~O`xOcyOdyOmzOp{O~Os!{a!d!{a!|!{a#P!{a$V!{ag!{a~P-vOs#Oa!d#Oa!|#Oa#P#Oa$V#Oag#Oa~P-vOS!fOc!gOd!gOh!cO!Y!eO!]!jO!`!kO~OR#zOu#zOw#zO$Y#wO$g!qO~P/VOn$QO!U#}O!d$OO~P(dOh$SO~O$Y$UO~Oh#SO~Oh$WO~O`$YOc$YOg$]Ol$YOm$YOn$YO~P)YO`$YOc$YOl$YOm$YOn$YOo$_O~P)YO`$YOc$YOl$YOm$YOn$YOr$aO~P)YOP$bOSvXcvXdvXhvXnvXyvX!YvX!]vX!`vX#XvX#ZvX$YvX!WvXQvX`vXgvXlvXmvXpvXsvXuvXwvX}vX!nvX$WvX$XvX$gvXovXrvX!dvX$UvX$qvX!zvX~Oy$cO#X$dO#Z$eOn$rP~P)}Oh#qOS$eXc$eXd$eXn$eXy$eX!Y$eX!]$eX!`$eX#X$eX#Z$eX$Y$eXQ$eX`$eXg$eXl$eXm$eXp$eXs$eXu$eXw$eX}$eX!n$eX$W$eX$X$eX$g$eXo$eXr$eX!d$eX$U$eX$q$eX!z$eX~Oh$iO~Oh$kO~O!U#}O!d$lOs$rXn$rX~Os!RO~On$oOy$cO~On$pO~Ow$qO!n!wO~Os$rO~Os!RO!U#}O~Os!RO#m$xO~O$W#WOs#pX~O$q$|On#Ra$U#Rar#Ra~P)YOn#}X$U#}Xr#}X~P!jOn#[O$U$oar$oa~O$^#_O$_#_O$`%TO~Oo%VO!y%WO~Os!{i!d!{i!|!{i#P!{i$V!{ig!{i~P-vOs!}i!d!}i!|!}i#P!}i$V!}ig!}i~P-vOs#Oi!d#Oi!|#Oi#P#Oi$V#Oig#Oi~P-vOs#{a!d#{a~P&^Or%XO~Og$nP~P'oOg$dP~P)YOc!SXg!QX!U!QX!W!SX~Oc%aO!W%bO~Og%cO!U#}O~O!U#}OS$TXc$TXd$TXh$TXn$TXs$TX!Y$TX!]$TX!`$TX!d$TX$Y$TX~On%gO!d$OO~P(dO!U#}OS!Xac!Xad!Xah!Xan!Xas!Xa!Y!Xa!]!Xa!`!Xa!d!Xa$Y!Xag!Xa~O$Y%hOg$lP~P/VOR#zOS!fOh%mOu#zOw#zO!Y%nO$Y%lO$g!qO~Oy$cOQ$fX`$fXc$fXg$fXh$fXl$fXm$fXn$fXp$fXs$fXu$fXw$fX}$fX!n$fX$W$fX$X$fX$g$fXo$fXr$fX~O`$YOc$YOg%wOl$YOm$YOn$YO~P)YO`$YOc$YOl$YOm$YOn$YOo%xO~P)YO`$YOc$YOl$YOm$YOn$YOr%yO~P)YOh%{OS#WXc#WXd#WXn#WX!Y#WX!]#WX!`#WX$Y#WX~On%|O~Og&ROw&SO!o&SO~Os$PX!d$PXn$PX~P)}O!d$lOs$ran$ra~On&VO~Or&^O$W&XO$g&WO~Og&_O~P&^Oy$cO!d&cO$q$|On#Ri$U#Rir#Ri~P)YO$p&fO~On#}a$U#}ar#}a~P!jOn#[O$U$oir$oi~O!d&iOg$nX~P&^Og&kO~Oy$cOQ#uXg#uXh#uXp#uXs#uXu#uXw#uX}#uX!d#uX!n#uX$W#uX$X#uX$g#uX~O!d&mOg$dX~P)YOg&oO~Oo&pOy$cO!z&qO~OR#zOu#zOw#zO$Y&sO$g!qO~O!U#}OS$Tac$Tad$Tah$Tan$Tas$Ta!Y$Ta!]$Ta!`$Ta!d$Ta$Y$Ta~Oc!SXg!QX!U!QX!d!QX~O!U#}O!d&uOg$lX~Oc&wO~Og&xO~Oc&yOg!jX!W!SX~OS!fOh&{O~O!U&}O~O!U&}Og$kX~O!W'OO~Og'PO~O$W'QO~On'SO~Oc'TO!U#}O~Og'VOn'UO~Og'YO~O!U#}Os$Pa!d$Pan$Pa~OP$bOsvX!dvXgvX~O$g&WOs#gX!d#gX~Os!RO!d'[O~Or'`O$W&XO$g&WO~Oy$cOQ#|Xh#|Xn#|Xp#|Xs#|Xu#|Xw#|X}#|X!d#|X!n#|X$U#|X$W#|X$X#|X$g#|X$q#|Xr#|X~O!d&cO$q$|On#Rq$U#Rqr#Rq~P)YOo'eOy$cO!z'fO~Og#zX!d#zX~P'oO!d&iOg$na~Og#yX!d#yX~P)YO!d&mOg$da~Oo'eO~Og'kO~P)YOg'lO!W'mO~O$Y%hOg#xX!d#xX~P/VO!d&uOg$la~Og'sO~OS!fOh'uO~O`'xOg'zO~OS#wac#wad#wah#wa!Y#wa!]#wa!`#wa$Y#wa~Og'|O~P! xOg'|On'}O~Oy$cOQ#|ah#|an#|ap#|as#|au#|aw#|a}#|a!d#|a!n#|a$U#|a$W#|a$X#|a$g#|a$q#|ar#|a~Oo(SO~Og#za!d#za~P&^Og#ya!d#ya~P)YOR#zOu#zOw#zO$Y&sO$g&WO~O!U#}Og#xa!d#xa~Oc(UO~O!d&uOg$li~P)YOg!ji~P)YOg!ai!U!hi~Og(WO~O!W(YOg!ki~O`'xOg(]O~Oy$cOg!Pin!Pi~Og(^O~P! xOn(_O~Og(`O~O!d&uOg$lq~Og(bO~Og#xq!d#xq~P)YO$[!o$]$g`$gy#P~",
  goto: "7[$sPPPPP$tP$wP%Q%d%Q%v&YP%QP&`%QPP&fPPP&l&v&vPPPPP&vPP&vP'fP&vP&v(i&vP)X)[)b)b)t)bP)bP)bP)b)bP*a)bP*m*s+cP*m+f*m+i+`+o+o)b+uPP,k,q%Q,w%Q,},}-T-XPP%QP%Q%QP-_.Z.h.o$wP.xP.{P$wP$wP$wP/R$wP/U/X/[/c$wP$wPP$wP/h$wP/k/q0Q0l0z1Q1[1b1h1n1t2O2U2[2b2h2nPPPPPPPPPPP2t2}P3s3v4zP5S5|6c6o6u6o6x6{PP7RRrQ_aOPco!R#[%Pq_OP]^co|}!O!P!R#S#[#p%P&iqSOP]^co|}!O!P!R#S#[#p%P&iqUOP]^co|}!O!P!R#S#[#p%P&iQtTR#buQwWR#cxQ!VYR#dyQ#d!XS$h!t!uR%U#f!Z!xdf!n!o!p#Z#q#v$[$^$`$c${%W%]%a&c&d&m&r&w&y'T'i'q'r(U(a!Y!xdf!n!o!p#Z#q#v$[$^$`$c${%W%]%a&c&d&m&r&w&y'T'i'q'r(U(ab#z!c$W%b%m&{'O'm'u(YU&Z$r&]'[R'Z&Y!Z!tdf!n!o!p#Z#q#v$[$^$`$c${%W%]%a&c&d&m&r&w&y'T'i'q'r(U(aR$j!vQ&P$iR'W&Qq!h`ei!c!d!e!r#}$O$P$S$g$i$l&Q&uQ#x!cQ%j$SW%r$W%m&{'uQ&t%bQ'o&uQ'w'OQ(T'mR(c(YQ#VjQ$V!jQ$v#UR&a$xX%q$W%m&{'up!h`ei!c!d!e!r#}$O$P$S$g$i$l&Q&uW%p$W%m&{'uQ&|%nR'v&}R$T!fR&|%nX%o$W%m&{'uX%s$W%m&{'u!Y!xdf!n!o!p#Z#q#v$[$^$`$c${%W%]%a&c&d&m&r&w&y'T'i'q'r(U(aQ!}gR$q#OQ!WYR#eyQ#d!WR%U#eQ!ZZR#gzQ!_[R#h{T!^[{Q#s!]R%_#tQ!SXQ!i`Q#TjQ#n!QQ$Q!dQ$n!zQ$t#RQ$w#VQ$z#YQ%g$PQ&`$vQ'^&[Q'a&aR(R']SnP!RQ#^oQ%O#[R&g%PZmPo!R#[%PQ$}#ZQ&e${R'd&dR$g!rQ'R%{R(Z'xR#OgR#QhR$s#QS&[$r&]R(P'[V&Y$r&]'[R#YkQ#`qR%S#`QcOSoP!RU!lco%PR%P#[Q%]#q[&l%]&r'i'q'r(aQ&r%aQ'i&mQ'q&wQ'r&yR(a(UQ$[!nQ$^!oQ$`!pV%v$[$^$`Q&Q$iR'X&QQ&v%iS'p&v(VR(V'qQ&n%]R'j&nQ&j%YR'h&jQ!QXR#m!QQ&d${R'c&dQ#]nS%Q#]%RR%R#^Q'y'RR(['yQ$m!yR&U$mQ&]$rR'_&]Q']&[R(Q']Q#XkR$y#XQ$P!dR%f$P_bOPco!R#[%P^XOPco!R#[%PQ!`]Q!a^Q#i|Q#j}Q#k!OQ#l!PQ$u#SQ%Y#pR'g&iR%^#qQ!rdQ!{f[$X!n!o!p$[$^$`Q${#Zh%[#q%]%a&m&r&w&y'i'q'r(U(aQ%`#vQ%z$cS&b${&dQ&h%WQ'b&cR'{'T]$Z!n!o!p$[$^$`Q!d`U!ye!r$gQ#RiQ#y!cS#|!d$PQ$R!eQ%d#}Q%e$OQ%i$SS&O$i&QQ&T$lR'n&uQ#{!cW%r$W%m&{'uQ&t%bQ'w'OQ(T'mR(c(YQ%u$WQ&z%mQ't&{R(X'uX%t$W%m&{'uR%k$SR%Z#pQpPR#o!RQ!zeQ$f!rR%}$g",
  nodeNames: "⚠ Unit VariableName VariableName QueryCallee Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NamespacedTagSelector NamespaceName TagName NestingSelector ClassSelector . ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue AtKeyword # ; ] [ BracketedValue } { BracedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee IfExpression if ArgList IfBranch KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp ComparisonQuery CompareOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector ParenthesizedSelector StyleQuery style ParenthesedQuery CallQuery ArgList , UnaryQuery ParenthesedQuery BinaryQuery ParenthesedQuery ParenthesedQuery StyleFeature StyleRange PseudoQuery CallLiteral CallTag ParenthesizedContent PseudoClassName ArgList IdSelector IdName AttributeSelector AttributeName NamespacedAttribute NamespaceName AttributeName MatchOp MatchFlag ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp Block Declaration PropertyName Important ImportStatement import Layer layer LayerName layer MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports ScopeStatement scope to FontFeatureStatement font-feature-values FontName AtRule Styles",
  maxTerm: 172,
  nodeProps: [
    ["isolate", -2, 5, 39, ""],
    ["openedBy", 23, "(", 31, "[", 34, "{"],
    ["closedBy", 24, ")", 32, "]", 35, "}"]
  ],
  propSources: [Sk],
  skippedNodes: [0, 5, 127],
  repeatNodeCount: 17,
  tokenData: "K`~R!bOX%ZX^&R^p%Zpq&Rqr)ers)vst+jtu2Xuv%Zvw3Rwx3dxy5Ryz5dz{5i{|6S|}:u}!O;W!O!P;u!P!Q<^!Q![=V![!]>Q!]!^>|!^!_?_!_!`@Z!`!a@n!a!b%Z!b!cAo!c!k%Z!k!lC|!l!u%Z!u!vC|!v!}%Z!}#OD_#O#P%Z#P#QDp#Q#R2X#R#]%Z#]#^ER#^#g%Z#g#hC|#h#o%Z#o#pIf#p#qIw#q#rJ`#r#sJq#s#y%Z#y#z&R#z$f%Z$f$g&R$g#BY%Z#BY#BZ&R#BZ$IS%Z$IS$I_&R$I_$I|%Z$I|$JO&R$JO$JT%Z$JT$JU&R$JU$KV%Z$KV$KW&R$KW&FU%Z&FU&FV&R&FV;'S%Z;'S;=`KY<%lO%Z`%^SOy%jz;'S%j;'S;=`%{<%lO%j`%oS!o`Oy%jz;'S%j;'S;=`%{<%lO%j`&OP;=`<%l%j~&Wh$[~OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%j~'yh$[~!o`OX%jX^'r^p%jpq'rqy%jz#y%j#y#z'r#z$f%j$f$g'r$g#BY%j#BY#BZ'r#BZ$IS%j$IS$I_'r$I_$I|%j$I|$JO'r$JO$JT%j$JT$JU'r$JU$KV%j$KV$KW'r$KW&FU%j&FU&FV'r&FV;'S%j;'S;=`%{<%lO%jj)jS$qYOy%jz;'S%j;'S;=`%{<%lO%j~)yWOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d<%lO)v~*hOw~~*kRO;'S)v;'S;=`*t;=`O)v~*wXOY)vZr)vrs*cs#O)v#O#P*h#P;'S)v;'S;=`+d;=`<%l)v<%lO)v~+gP;=`<%l)vj+oYmYOy%jz!Q%j!Q![,_![!c%j!c!i,_!i#T%j#T#Z,_#Z;'S%j;'S;=`%{<%lO%jj,dY!o`Oy%jz!Q%j!Q![-S![!c%j!c!i-S!i#T%j#T#Z-S#Z;'S%j;'S;=`%{<%lO%jj-XY!o`Oy%jz!Q%j!Q![-w![!c%j!c!i-w!i#T%j#T#Z-w#Z;'S%j;'S;=`%{<%lO%jj.OYuY!o`Oy%jz!Q%j!Q![.n![!c%j!c!i.n!i#T%j#T#Z.n#Z;'S%j;'S;=`%{<%lO%jj.uYuY!o`Oy%jz!Q%j!Q![/e![!c%j!c!i/e!i#T%j#T#Z/e#Z;'S%j;'S;=`%{<%lO%jj/jY!o`Oy%jz!Q%j!Q![0Y![!c%j!c!i0Y!i#T%j#T#Z0Y#Z;'S%j;'S;=`%{<%lO%jj0aYuY!o`Oy%jz!Q%j!Q![1P![!c%j!c!i1P!i#T%j#T#Z1P#Z;'S%j;'S;=`%{<%lO%jj1UY!o`Oy%jz!Q%j!Q![1t![!c%j!c!i1t!i#T%j#T#Z1t#Z;'S%j;'S;=`%{<%lO%jj1{SuY!o`Oy%jz;'S%j;'S;=`%{<%lO%jd2[UOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jd2uS!yS!o`Oy%jz;'S%j;'S;=`%{<%lO%jb3WS^QOy%jz;'S%j;'S;=`%{<%lO%j~3gWOY3dZw3dwx*cx#O3d#O#P4P#P;'S3d;'S;=`4{<%lO3d~4SRO;'S3d;'S;=`4];=`O3d~4`XOY3dZw3dwx*cx#O3d#O#P4P#P;'S3d;'S;=`4{;=`<%l3d<%lO3d~5OP;=`<%l3dj5WShYOy%jz;'S%j;'S;=`%{<%lO%j~5iOg~n5pUWQyWOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jj6ZWyW#PQOy%jz!O%j!O!P6s!P!Q%j!Q![9x![;'S%j;'S;=`%{<%lO%jj6xU!o`Oy%jz!Q%j!Q![7[![;'S%j;'S;=`%{<%lO%jj7cY!o`$gYOy%jz!Q%j!Q![7[![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj8WY!o`Oy%jz{%j{|8v|}%j}!O8v!O!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj8{U!o`Oy%jz!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj9fU!o`$gYOy%jz!Q%j!Q![9_![;'S%j;'S;=`%{<%lO%jj:P[!o`$gYOy%jz!O%j!O!P7[!P!Q%j!Q![9x![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj:zS!dYOy%jz;'S%j;'S;=`%{<%lO%jj;]WyWOy%jz!O%j!O!P6s!P!Q%j!Q![9x![;'S%j;'S;=`%{<%lO%jj;zU`YOy%jz!Q%j!Q![7[![;'S%j;'S;=`%{<%lO%j~<cTyWOy%jz{<r{;'S%j;'S;=`%{<%lO%j~<yS!o`$]~Oy%jz;'S%j;'S;=`%{<%lO%jj=[[$gYOy%jz!O%j!O!P7[!P!Q%j!Q![9x![!g%j!g!h8R!h#X%j#X#Y8R#Y;'S%j;'S;=`%{<%lO%jj>VUcYOy%jz![%j![!]>i!];'S%j;'S;=`%{<%lO%jj>pSdY!o`Oy%jz;'S%j;'S;=`%{<%lO%jj?RSnYOy%jz;'S%j;'S;=`%{<%lO%jh?dU!WWOy%jz!_%j!_!`?v!`;'S%j;'S;=`%{<%lO%jh?}S!WW!o`Oy%jz;'S%j;'S;=`%{<%lO%jl@bS!WW!ySOy%jz;'S%j;'S;=`%{<%lO%jj@uV!|Q!WWOy%jz!_%j!_!`?v!`!aA[!a;'S%j;'S;=`%{<%lO%jbAcS!|Q!o`Oy%jz;'S%j;'S;=`%{<%lO%jjArYOy%jz}%j}!OBb!O!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jjBgW!o`Oy%jz!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jjCW[lY!o`Oy%jz}%j}!OCP!O!Q%j!Q![CP![!c%j!c!}CP!}#T%j#T#oCP#o;'S%j;'S;=`%{<%lO%jhDRS!zWOy%jz;'S%j;'S;=`%{<%lO%jjDdSpYOy%jz;'S%j;'S;=`%{<%lO%jnDuSo^Oy%jz;'S%j;'S;=`%{<%lO%jjEWU!zWOy%jz#a%j#a#bEj#b;'S%j;'S;=`%{<%lO%jbEoU!o`Oy%jz#d%j#d#eFR#e;'S%j;'S;=`%{<%lO%jbFWU!o`Oy%jz#c%j#c#dFj#d;'S%j;'S;=`%{<%lO%jbFoU!o`Oy%jz#f%j#f#gGR#g;'S%j;'S;=`%{<%lO%jbGWU!o`Oy%jz#h%j#h#iGj#i;'S%j;'S;=`%{<%lO%jbGoU!o`Oy%jz#T%j#T#UHR#U;'S%j;'S;=`%{<%lO%jbHWU!o`Oy%jz#b%j#b#cHj#c;'S%j;'S;=`%{<%lO%jbHoU!o`Oy%jz#h%j#h#iIR#i;'S%j;'S;=`%{<%lO%jbIYS$pQ!o`Oy%jz;'S%j;'S;=`%{<%lO%jjIkSsYOy%jz;'S%j;'S;=`%{<%lO%jfI|U$cUOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%jjJeSrYOy%jz;'S%j;'S;=`%{<%lO%jfJvU#PQOy%jz!_%j!_!`2n!`;'S%j;'S;=`%{<%lO%j`K]P;=`<%l%Z",
  tokenizers: [yk, vk, gk, mk, 1, 2, 3, 4, new $s("m~RRYZ[z{a~~g~aO$_~~dP!P!Qg~lO$`~~", 28, 152)],
  topRules: { StyleSheet: [0, 6], Styles: [1, 126] },
  dynamicPrecedences: { 94: 1 },
  specialized: [{ term: 147, get: (r) => bk[r] || -1 }, { term: 148, get: (r) => kk[r] || -1 }, { term: 4, get: (r) => xk[r] || -1 }, { term: 28, get: (r) => wk[r] || -1 }, { term: 146, get: (r) => Qk[r] || -1 }],
  tokenPrec: 2405
});
let Lo = null;
function Eo() {
  if (!Lo && typeof document == "object" && document.body) {
    let { style: r } = document.body, e = [], t = /* @__PURE__ */ new Set();
    for (let i in r)
      i != "cssText" && i != "cssFloat" && typeof r[i] == "string" && (/[A-Z]/.test(i) && (i = i.replace(/[A-Z]/g, (n) => "-" + n.toLowerCase())), t.has(i) || (e.push(i), t.add(i)));
    Lo = e.sort().map((i) => ({ type: "property", label: i, apply: i + ": " }));
  }
  return Lo || [];
}
const Pf = /* @__PURE__ */ [
  "active",
  "after",
  "any-link",
  "autofill",
  "backdrop",
  "before",
  "checked",
  "cue",
  "default",
  "defined",
  "disabled",
  "empty",
  "enabled",
  "file-selector-button",
  "first",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "marker",
  "modal",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "part",
  "placeholder",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "selection",
  "slotted",
  "target",
  "target-text",
  "valid",
  "visited",
  "where"
].map((r) => ({ type: "class", label: r })), Cf = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((r) => ({ type: "keyword", label: r })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((r) => ({ type: "constant", label: r }))), Pk = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((r) => ({ type: "type", label: r })), Ck = /* @__PURE__ */ [
  "@charset",
  "@color-profile",
  "@container",
  "@counter-style",
  "@font-face",
  "@font-feature-values",
  "@font-palette-values",
  "@import",
  "@keyframes",
  "@layer",
  "@media",
  "@namespace",
  "@page",
  "@position-try",
  "@property",
  "@scope",
  "@starting-style",
  "@supports",
  "@view-transition"
].map((r) => ({ type: "keyword", label: r })), si = /^(\w[\w-]*|-\w[\w-]*|)$/, Tk = /^-(-[\w-]*)?$/;
function Ak(r, e) {
  var t;
  if ((r.name == "(" || r.type.isError) && (r = r.parent || r), r.name != "ArgList")
    return !1;
  let i = (t = r.parent) === null || t === void 0 ? void 0 : t.firstChild;
  return i?.name != "Callee" ? !1 : e.sliceString(i.from, i.to) == "var";
}
const Tf = /* @__PURE__ */ new hd(), Mk = ["Declaration"];
function Rk(r) {
  for (let e = r; ; ) {
    if (e.type.isTop)
      return e;
    if (!(e = e.parent))
      return r;
  }
}
function hp(r, e, t) {
  if (e.to - e.from > 4096) {
    let i = Tf.get(e);
    if (i)
      return i;
    let n = [], s = /* @__PURE__ */ new Set(), o = e.cursor(ve.IncludeAnonymous);
    if (o.firstChild())
      do
        for (let a of hp(r, o.node, t))
          s.has(a.label) || (s.add(a.label), n.push(a));
      while (o.nextSibling());
    return Tf.set(e, n), n;
  } else {
    let i = [], n = /* @__PURE__ */ new Set();
    return e.cursor().iterate((s) => {
      var o;
      if (t(s) && s.matchContext(Mk) && ((o = s.node.nextSibling) === null || o === void 0 ? void 0 : o.name) == ":") {
        let a = r.sliceString(s.from, s.to);
        n.has(a) || (n.add(a), i.push({ label: a, type: "variable" }));
      }
    }), i;
  }
}
const Zk = (r) => (e) => {
  let { state: t, pos: i } = e, n = Te(t).resolveInner(i, -1), s = n.type.isError && n.from == n.to - 1 && t.doc.sliceString(n.from, n.to) == "-";
  if (n.name == "PropertyName" || (s || n.name == "TagName") && /^(Block|Styles)$/.test(n.resolve(n.to).name))
    return { from: n.from, options: Eo(), validFor: si };
  if (n.name == "ValueName")
    return { from: n.from, options: Cf, validFor: si };
  if (n.name == "PseudoClassName")
    return { from: n.from, options: Pf, validFor: si };
  if (r(n) || (e.explicit || s) && Ak(n, t.doc))
    return {
      from: r(n) || s ? n.from : i,
      options: hp(t.doc, Rk(n), r),
      validFor: Tk
    };
  if (n.name == "TagName") {
    for (let { parent: l } = n; l; l = l.parent)
      if (l.name == "Block")
        return { from: n.from, options: Eo(), validFor: si };
    return { from: n.from, options: Pk, validFor: si };
  }
  if (n.name == "AtKeyword")
    return { from: n.from, options: Ck, validFor: si };
  if (!e.explicit)
    return null;
  let o = n.resolve(i), a = o.childBefore(i);
  return a && a.name == ":" && o.name == "PseudoClassSelector" ? { from: i, options: Pf, validFor: si } : a && a.name == ":" && o.name == "Declaration" || o.name == "ArgList" ? { from: i, options: Cf, validFor: si } : o.name == "Block" || o.name == "Styles" ? { from: i, options: Eo(), validFor: si } : null;
}, Xk = /* @__PURE__ */ Zk((r) => r.name == "VariableName"), As = /* @__PURE__ */ pr.define({
  name: "css",
  parser: /* @__PURE__ */ $k.configure({
    props: [
      /* @__PURE__ */ yn.add({
        Declaration: /* @__PURE__ */ Kn()
      }),
      /* @__PURE__ */ wr.add({
        "Block KeyframeList": vd
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function Lk() {
  return new on(As, As.data.of({ autocomplete: Xk }));
}
const _r = ["_blank", "_self", "_top", "_parent"], _o = ["ascii", "utf-8", "utf-16", "latin1", "latin1"], Bo = ["get", "post", "put", "delete"], jo = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], gt = ["true", "false"], F = {}, Ek = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: _r,
      hreflang: null
    }
  },
  abbr: F,
  address: F,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: F,
  aside: F,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: F,
  base: { attrs: { href: null, target: _r } },
  bdi: F,
  bdo: F,
  blockquote: { attrs: { cite: null } },
  body: F,
  br: F,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: jo,
      formmethod: Bo,
      formnovalidate: ["novalidate"],
      formtarget: _r,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: F,
  center: F,
  cite: F,
  code: F,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: F,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: F,
  div: F,
  dl: F,
  dt: F,
  em: F,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: F,
  figure: F,
  footer: F,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": _o,
      autocomplete: ["on", "off"],
      enctype: jo,
      method: Bo,
      novalidate: ["novalidate"],
      target: _r
    }
  },
  h1: F,
  h2: F,
  h3: F,
  h4: F,
  h5: F,
  h6: F,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: F,
  hgroup: F,
  hr: F,
  html: {
    attrs: { manifest: null }
  },
  i: F,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: jo,
      formmethod: Bo,
      formnovalidate: ["novalidate"],
      formtarget: _r,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: F,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: F,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: F,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: _o,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: F,
  noscript: F,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: F,
  param: { attrs: { name: null, value: null } },
  pre: F,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: F,
  rt: F,
  ruby: F,
  samp: F,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: _o
    }
  },
  section: F,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: F,
  source: { attrs: { src: null, type: null, media: null } },
  span: F,
  strong: F,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: F,
  summary: F,
  sup: F,
  table: F,
  tbody: F,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: F,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: F,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: F,
  time: { attrs: { datetime: null } },
  title: F,
  tr: F,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: F,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: F
}, cp = {
  accesskey: null,
  class: null,
  contenteditable: gt,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: gt,
  autocorrect: gt,
  autocapitalize: gt,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": gt,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": gt,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": gt,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": gt,
  "aria-hidden": gt,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": gt,
  "aria-multiselectable": gt,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": gt,
  "aria-relevant": null,
  "aria-required": gt,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
}, fp = /* @__PURE__ */ "beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((r) => "on" + r);
for (let r of fp)
  cp[r] = null;
class fn {
  constructor(e, t) {
    this.tags = { ...Ek, ...e }, this.globalAttrs = { ...cp, ...t }, this.allTags = Object.keys(this.tags), this.globalAttrNames = Object.keys(this.globalAttrs);
  }
}
fn.default = /* @__PURE__ */ new fn();
function Sr(r, e, t = r.length) {
  if (!e)
    return "";
  let i = e.firstChild, n = i && i.getChild("TagName");
  return n ? r.sliceString(n.from, Math.min(n.to, t)) : "";
}
function br(r, e = !1) {
  for (; r; r = r.parent)
    if (r.name == "Element")
      if (e)
        e = !1;
      else
        return r;
  return null;
}
function up(r, e, t) {
  let i = t.tags[Sr(r, br(e))];
  return i?.children || t.allTags;
}
function jl(r, e) {
  let t = [];
  for (let i = br(e); i && !i.type.isTop; i = br(i.parent)) {
    let n = Sr(r, i);
    if (n && i.lastChild.name == "CloseTag")
      break;
    n && t.indexOf(n) < 0 && (e.name == "EndTag" || e.from >= i.firstChild.to) && t.push(n);
  }
  return t;
}
const dp = /^[:\-\.\w\u00b7-\uffff]*$/;
function Af(r, e, t, i, n) {
  let s = /\s*>/.test(r.sliceDoc(n, n + 5)) ? "" : ">", o = br(t, t.name == "StartTag" || t.name == "TagName");
  return {
    from: i,
    to: n,
    options: up(r.doc, o, e).map((a) => ({ label: a, type: "type" })).concat(jl(r.doc, t).map((a, l) => ({
      label: "/" + a,
      apply: "/" + a + s,
      type: "type",
      boost: 99 - l
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function Mf(r, e, t, i) {
  let n = /\s*>/.test(r.sliceDoc(i, i + 5)) ? "" : ">";
  return {
    from: t,
    to: i,
    options: jl(r.doc, e).map((s, o) => ({ label: s, apply: s + n, type: "type", boost: 99 - o })),
    validFor: dp
  };
}
function _k(r, e, t, i) {
  let n = [], s = 0;
  for (let o of up(r.doc, t, e))
    n.push({ label: "<" + o, type: "type" });
  for (let o of jl(r.doc, t))
    n.push({ label: "</" + o + ">", type: "type", boost: 99 - s++ });
  return { from: i, to: i, options: n, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function Bk(r, e, t, i, n) {
  let s = br(t), o = s ? e.tags[Sr(r.doc, s)] : null, a = o && o.attrs ? Object.keys(o.attrs) : [], l = o && o.globalAttrs === !1 ? a : a.length ? a.concat(e.globalAttrNames) : e.globalAttrNames;
  return {
    from: i,
    to: n,
    options: l.map((c) => ({ label: c, type: "property" })),
    validFor: dp
  };
}
function jk(r, e, t, i, n) {
  var s;
  let o = (s = t.parent) === null || s === void 0 ? void 0 : s.getChild("AttributeName"), a = [], l;
  if (o) {
    let c = r.sliceDoc(o.from, o.to), u = e.globalAttrs[c];
    if (!u) {
      let p = br(t), m = p ? e.tags[Sr(r.doc, p)] : null;
      u = m?.attrs && m.attrs[c];
    }
    if (u) {
      let p = r.sliceDoc(i, n).toLowerCase(), m = '"', v = '"';
      /^['"]/.test(p) ? (l = p[0] == '"' ? /^[^"]*$/ : /^[^']*$/, m = "", v = r.sliceDoc(n, n + 1) == p[0] ? "" : p[0], p = p.slice(1), i++) : l = /^[^\s<>='"]*$/;
      for (let b of u)
        a.push({ label: b, apply: m + b + v, type: "constant" });
    }
  }
  return { from: i, to: n, options: a, validFor: l };
}
function Op(r, e) {
  let { state: t, pos: i } = e, n = Te(t).resolveInner(i, -1), s = n.resolve(i);
  for (let o = i, a; s == n && (a = n.childBefore(o)); ) {
    let l = a.lastChild;
    if (!l || !l.type.isError || l.from < l.to)
      break;
    s = n = a, o = l.from;
  }
  return n.name == "TagName" ? n.parent && /CloseTag$/.test(n.parent.name) ? Mf(t, n, n.from, i) : Af(t, r, n, n.from, i) : n.name == "StartTag" || n.name == "IncompleteTag" ? Af(t, r, n, i, i) : n.name == "StartCloseTag" || n.name == "IncompleteCloseTag" ? Mf(t, n, i, i) : n.name == "OpenTag" || n.name == "SelfClosingTag" || n.name == "AttributeName" ? Bk(t, r, n, n.name == "AttributeName" ? n.from : i, i) : n.name == "Is" || n.name == "AttributeValue" || n.name == "UnquotedAttributeValue" ? jk(t, r, n, n.name == "Is" ? i : n.from, i) : e.explicit && (s.name == "Element" || s.name == "Text" || s.name == "Document") ? _k(t, r, n, i) : null;
}
function Ik(r) {
  return Op(fn.default, r);
}
function Wk(r) {
  let { extraTags: e, extraGlobalAttributes: t } = r, i = t || e ? new fn(e, t) : fn.default;
  return (n) => Op(i, n);
}
const Yk = /* @__PURE__ */ Et.parser.configure({ top: "SingleExpression" }), pp = [
  {
    tag: "script",
    attrs: (r) => r.type == "text/typescript" || r.lang == "ts",
    parser: kO.parser
  },
  {
    tag: "script",
    attrs: (r) => r.type == "text/babel" || r.type == "text/jsx",
    parser: xO.parser
  },
  {
    tag: "script",
    attrs: (r) => r.type == "text/typescript-jsx",
    parser: wO.parser
  },
  {
    tag: "script",
    attrs(r) {
      return /^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(r.type);
    },
    parser: Yk
  },
  {
    tag: "script",
    attrs(r) {
      return !r.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(r.type);
    },
    parser: Et.parser
  },
  {
    tag: "style",
    attrs(r) {
      return (!r.lang || r.lang == "css") && (!r.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(r.type));
    },
    parser: As.parser
  }
], gp = /* @__PURE__ */ [
  {
    name: "style",
    parser: /* @__PURE__ */ As.parser.configure({ top: "Styles" })
  }
].concat(/* @__PURE__ */ fp.map((r) => ({ name: r, parser: Et.parser }))), mp = /* @__PURE__ */ pr.define({
  name: "html",
  parser: /* @__PURE__ */ Jb.configure({
    props: [
      /* @__PURE__ */ yn.add({
        Element(r) {
          let e = /^(\s*)(<\/)?/.exec(r.textAfter);
          return r.node.to <= r.pos + e[0].length ? r.continue() : r.lineIndent(r.node.from) + (e[2] ? 0 : r.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(r) {
          return r.column(r.node.from) + r.unit;
        },
        Document(r) {
          if (r.pos + /\s*/.exec(r.textAfter)[0].length < r.node.to)
            return r.continue();
          let e = null, t;
          for (let i = r.node; ; ) {
            let n = i.lastChild;
            if (!n || n.name != "Element" || n.to != i.to)
              break;
            e = i = n;
          }
          return e && !((t = e.lastChild) && (t.name == "CloseTag" || t.name == "SelfClosingTag")) ? r.lineIndent(e.from) + r.unit : null;
        }
      }),
      /* @__PURE__ */ wr.add({
        Element(r) {
          let e = r.firstChild, t = r.lastChild;
          return !e || e.name != "OpenTag" ? null : { from: e.to, to: t.name == "CloseTag" ? t.from : r.to };
        }
      }),
      /* @__PURE__ */ Pd.add({
        "OpenTag CloseTag": (r) => r.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-_"
  }
}), ts = /* @__PURE__ */ mp.configure({
  wrap: /* @__PURE__ */ np(pp, gp)
});
function zk(r = {}) {
  let e = "", t;
  r.matchClosingTags === !1 && (e = "noMatch"), r.selfClosingTags === !0 && (e = (e ? e + " " : "") + "selfClosing"), (r.nestedLanguages && r.nestedLanguages.length || r.nestedAttributes && r.nestedAttributes.length) && (t = np((r.nestedLanguages || []).concat(pp), (r.nestedAttributes || []).concat(gp)));
  let i = t ? mp.configure({ wrap: t, dialect: e }) : e ? ts.configure({ dialect: e }) : ts;
  return new on(i, [
    ts.data.of({ autocomplete: Wk(r) }),
    r.autoCloseTags !== !1 ? Dk : [],
    IS().support,
    Lk().support
  ]);
}
const Rf = /* @__PURE__ */ new Set(/* @__PURE__ */ "area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" ")), Dk = /* @__PURE__ */ N.inputHandler.of((r, e, t, i, n) => {
  if (r.composing || r.state.readOnly || e != t || i != ">" && i != "/" || !ts.isActiveAt(r.state, e, -1))
    return !1;
  let s = n(), { state: o } = s, a = o.changeByRange((l) => {
    var c, u, p;
    let m = o.doc.sliceString(l.from - 1, l.to) == i, { head: v } = l, b = Te(o).resolveInner(v, -1), w;
    if (m && i == ">" && b.name == "EndTag") {
      let C = b.parent;
      if (((u = (c = C.parent) === null || c === void 0 ? void 0 : c.lastChild) === null || u === void 0 ? void 0 : u.name) != "CloseTag" && (w = Sr(o.doc, C.parent, v)) && !Rf.has(w)) {
        let A = v + (o.doc.sliceString(v, v + 1) === ">" ? 1 : 0), X = `</${w}>`;
        return { range: l, changes: { from: v, to: A, insert: X } };
      }
    } else if (m && i == "/" && b.name == "IncompleteCloseTag") {
      let C = b.parent;
      if (b.from == v - 2 && ((p = C.lastChild) === null || p === void 0 ? void 0 : p.name) != "CloseTag" && (w = Sr(o.doc, C, v)) && !Rf.has(w)) {
        let A = v + (o.doc.sliceString(v, v + 1) === ">" ? 1 : 0), X = `${w}>`;
        return {
          range: L.cursor(v + X.length, -1),
          changes: { from: v, to: A, insert: X }
        };
      }
    }
    return { range: l };
  });
  return a.changes.empty ? !1 : (r.dispatch([
    s,
    o.update(a, {
      userEvent: "input.complete",
      scrollIntoView: !0
    })
  ]), !0);
}), yp = /* @__PURE__ */ gl({ commentTokens: { block: { open: "<!--", close: "-->" } } }), vp = /* @__PURE__ */ new te(), Sp = /* @__PURE__ */ tb.configure({
  props: [
    /* @__PURE__ */ wr.add((r) => !r.is("Block") || r.is("Document") || qa(r) != null || Vk(r) ? void 0 : (e, t) => ({ from: t.doc.lineAt(e.from).to, to: e.to })),
    /* @__PURE__ */ vp.add(qa),
    /* @__PURE__ */ yn.add({
      Document: () => null
    }),
    /* @__PURE__ */ Bi.add({
      Document: yp
    })
  ]
});
function qa(r) {
  let e = /^(?:ATX|Setext)Heading(\d)$/.exec(r.name);
  return e ? +e[1] : void 0;
}
function Vk(r) {
  return r.name == "OrderedList" || r.name == "BulletList";
}
function Nk(r, e) {
  let t = r;
  for (; ; ) {
    let i = t.nextSibling, n;
    if (!i || (n = qa(i.type)) != null && n <= e)
      break;
    t = i;
  }
  return t.to;
}
const qk = /* @__PURE__ */ yd.of((r, e, t) => {
  for (let i = Te(r).resolveInner(t, -1); i && !(i.from < e); i = i.parent) {
    let n = i.type.prop(vp);
    if (n == null)
      continue;
    let s = Nk(i, n);
    if (s > t)
      return { from: t, to: s };
  }
  return null;
});
function Il(r) {
  return new bt(yp, r, [], "markdown");
}
const Gk = /* @__PURE__ */ Il(Sp), Uk = /* @__PURE__ */ Sp.configure([ub, Ob, db, pb, {
  props: [
    /* @__PURE__ */ wr.add({
      Table: (r, e) => ({ from: e.doc.lineAt(r.from).to, to: r.to })
    })
  ]
}]), Ms = /* @__PURE__ */ Il(Uk);
function Fk(r, e) {
  return (t) => {
    if (t && r) {
      let i = null;
      if (t = /\S*/.exec(t)[0], typeof r == "function" ? i = r(t) : i = gs.matchLanguageName(r, t, !0), i instanceof gs)
        return i.support ? i.support.language.parser : sn.getSkippingParser(i.load());
      if (i)
        return i.parser;
    }
    return e ? e.parser : null;
  };
}
class Io {
  constructor(e, t, i, n, s, o, a) {
    this.node = e, this.from = t, this.to = i, this.spaceBefore = n, this.spaceAfter = s, this.type = o, this.item = a;
  }
  blank(e, t = !0) {
    let i = this.spaceBefore + (this.node.name == "Blockquote" ? ">" : "");
    if (e != null) {
      for (; i.length < e; )
        i += " ";
      return i;
    } else {
      for (let n = this.to - this.from - i.length - this.spaceAfter.length; n > 0; n--)
        i += " ";
      return i + (t ? this.spaceAfter : "");
    }
  }
  marker(e, t) {
    let i = this.node.name == "OrderedList" ? String(+kp(this.item, e)[2] + t) : "";
    return this.spaceBefore + i + this.type + this.spaceAfter;
  }
}
function bp(r, e) {
  let t = [], i = [];
  for (let n = r; n; n = n.parent) {
    if (n.name == "FencedCode")
      return i;
    (n.name == "ListItem" || n.name == "Blockquote") && t.push(n);
  }
  for (let n = t.length - 1; n >= 0; n--) {
    let s = t[n], o, a = e.lineAt(s.from), l = s.from - a.from;
    if (s.name == "Blockquote" && (o = /^ *>( ?)/.exec(a.text.slice(l))))
      i.push(new Io(s, l, l + o[0].length, "", o[1], ">", null));
    else if (s.name == "ListItem" && s.parent.name == "OrderedList" && (o = /^( *)\d+([.)])( *)/.exec(a.text.slice(l)))) {
      let c = o[3], u = o[0].length;
      c.length >= 4 && (c = c.slice(0, c.length - 4), u -= 4), i.push(new Io(s.parent, l, l + u, o[1], c, o[2], s));
    } else if (s.name == "ListItem" && s.parent.name == "BulletList" && (o = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(a.text.slice(l)))) {
      let c = o[4], u = o[0].length;
      c.length > 4 && (c = c.slice(0, c.length - 4), u -= 4);
      let p = o[2];
      o[3] && (p += o[3].replace(/[xX]/, " ")), i.push(new Io(s.parent, l, l + u, o[1], c, p, s));
    }
  }
  return i;
}
function kp(r, e) {
  return /^(\s*)(\d+)(?=[.)])/.exec(e.sliceString(r.from, r.from + 10));
}
function Wo(r, e, t, i = 0) {
  for (let n = -1, s = r; ; ) {
    if (s.name == "ListItem") {
      let a = kp(s, e), l = +a[2];
      if (n >= 0) {
        if (l != n + 1)
          return;
        t.push({ from: s.from + a[1].length, to: s.from + a[0].length, insert: String(n + 2 + i) });
      }
      n = l;
    }
    let o = s.nextSibling;
    if (!o)
      break;
    s = o;
  }
}
function Wl(r, e) {
  let t = /^[ \t]*/.exec(r)[0].length;
  if (!t || e.facet(Ni) != "	")
    return r;
  let i = ri(r, 4, t), n = "";
  for (let s = i; s > 0; )
    s >= 4 ? (n += "	", s -= 4) : (n += " ", s--);
  return n + r.slice(t);
}
const Hk = (r = {}) => ({ state: e, dispatch: t }) => {
  let i = Te(e), { doc: n } = e, s = null, o = e.changeByRange((a) => {
    if (!a.empty || !Ms.isActiveAt(e, a.from, -1) && !Ms.isActiveAt(e, a.from, 1))
      return s = { range: a };
    let l = a.from, c = n.lineAt(l), u = bp(i.resolveInner(l, -1), n);
    for (; u.length && u[u.length - 1].from > l - c.from; )
      u.pop();
    if (!u.length)
      return s = { range: a };
    let p = u[u.length - 1];
    if (p.to - p.spaceAfter.length > l - c.from)
      return s = { range: a };
    let m = l >= p.to - p.spaceAfter.length && !/\S/.test(c.text.slice(p.to));
    if (p.item && m) {
      let A = p.node.firstChild, X = p.node.getChild("ListItem", "ListItem");
      if (A.to >= l || X && X.to < l || c.from > 0 && !/[^\s>]/.test(n.lineAt(c.from - 1).text) || r.nonTightLists === !1) {
        let _ = u.length > 1 ? u[u.length - 2] : null, H, B = "";
        _ && _.item ? (H = c.from + _.from, B = _.marker(n, 1)) : H = c.from + (_ ? _.to : 0);
        let Y = [{ from: H, to: l, insert: B }];
        return p.node.name == "OrderedList" && Wo(p.item, n, Y, -2), _ && _.node.name == "OrderedList" && Wo(_.item, n, Y), { range: L.cursor(H + B.length), changes: Y };
      } else {
        let _ = Xf(u, e, c);
        return {
          range: L.cursor(l + _.length + 1),
          changes: { from: c.from, insert: _ + e.lineBreak }
        };
      }
    }
    if (p.node.name == "Blockquote" && m && c.from) {
      let A = n.lineAt(c.from - 1), X = />\s*$/.exec(A.text);
      if (X && X.index == p.from) {
        let _ = e.changes([
          { from: A.from + X.index, to: A.to },
          { from: c.from + p.from, to: c.to }
        ]);
        return { range: a.map(_), changes: _ };
      }
    }
    let v = [];
    p.node.name == "OrderedList" && Wo(p.item, n, v);
    let b = p.item && p.item.from < c.from, w = "";
    if (!b || /^[\s\d.)\-+*>]*/.exec(c.text)[0].length >= p.to)
      for (let A = 0, X = u.length - 1; A <= X; A++)
        w += A == X && !b ? u[A].marker(n, 1) : u[A].blank(A < X ? ri(c.text, 4, u[A + 1].from) - w.length : null);
    let C = l;
    for (; C > c.from && /\s/.test(c.text.charAt(C - c.from - 1)); )
      C--;
    return w = Wl(w, e), Jk(p.node, e.doc) && (w = Xf(u, e, c) + e.lineBreak + w), v.push({ from: C, to: l, insert: e.lineBreak + w }), { range: L.cursor(C + w.length + 1), changes: v };
  });
  return s ? !1 : (t(e.update(o, { scrollIntoView: !0, userEvent: "input" })), !0);
}, Kk = /* @__PURE__ */ Hk();
function Zf(r) {
  return r.name == "QuoteMark" || r.name == "ListMark";
}
function Jk(r, e) {
  if (r.name != "OrderedList" && r.name != "BulletList")
    return !1;
  let t = r.firstChild, i = r.getChild("ListItem", "ListItem");
  if (!i)
    return !1;
  let n = e.lineAt(t.to), s = e.lineAt(i.from), o = /^[\s>]*$/.test(n.text);
  return n.number + (o ? 0 : 1) < s.number;
}
function Xf(r, e, t) {
  let i = "";
  for (let n = 0, s = r.length - 2; n <= s; n++)
    i += r[n].blank(n < s ? ri(t.text, 4, r[n + 1].from) - i.length : null, n < s);
  return Wl(i, e);
}
function ex(r, e) {
  let t = r.resolveInner(e, -1), i = e;
  Zf(t) && (i = t.from, t = t.parent);
  for (let n; n = t.childBefore(i); )
    if (Zf(n))
      i = n.from;
    else if (n.name == "OrderedList" || n.name == "BulletList")
      t = n.lastChild, i = t.to;
    else
      break;
  return t;
}
const tx = ({ state: r, dispatch: e }) => {
  let t = Te(r), i = null, n = r.changeByRange((s) => {
    let o = s.from, { doc: a } = r;
    if (s.empty && Ms.isActiveAt(r, s.from)) {
      let l = a.lineAt(o), c = bp(ex(t, o), a);
      if (c.length) {
        let u = c[c.length - 1], p = u.to - u.spaceAfter.length + (u.spaceAfter ? 1 : 0);
        if (o - l.from > p && !/\S/.test(l.text.slice(p, o - l.from)))
          return {
            range: L.cursor(l.from + p),
            changes: { from: l.from + p, to: o }
          };
        if (o - l.from == p && // Only apply this if we're on the line that has the
        // construct's syntax, or there's only indentation in the
        // target range
        (!u.item || l.from <= u.item.from || !/\S/.test(l.text.slice(0, u.to)))) {
          let m = l.from + u.from;
          if (u.item && u.node.from < u.item.from && /\S/.test(l.text.slice(u.from, u.to))) {
            let v = u.blank(ri(l.text, 4, u.to) - ri(l.text, 4, u.from));
            return m == l.from && (v = Wl(v, r)), {
              range: L.cursor(m + v.length),
              changes: { from: m, to: l.from + u.to, insert: v }
            };
          }
          if (m < o)
            return { range: L.cursor(m), changes: { from: m, to: o } };
        }
      }
    }
    return i = { range: s };
  });
  return i ? !1 : (e(r.update(n, { scrollIntoView: !0, userEvent: "delete" })), !0);
}, ix = [
  { key: "Enter", run: Kk },
  { key: "Backspace", run: tx }
], xp = /* @__PURE__ */ zk({ matchClosingTags: !1 });
function rx(r = {}) {
  let { codeLanguages: e, defaultCodeLanguage: t, addKeymap: i = !0, base: { parser: n } = Gk, completeHTMLTags: s = !0, pasteURLAsLink: o = !0, htmlTagLanguage: a = xp } = r;
  if (!(n instanceof Ds))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  let l = r.extensions ? [r.extensions] : [], c = [a.support, qk], u;
  o && c.push(ax), t instanceof on ? (c.push(t.support), u = t.language) : t && (u = t);
  let p = e || u ? Fk(e, u) : void 0;
  l.push(rb({ codeParser: p, htmlParser: a.language.parser })), i && c.push(qi.high(Bs.of(ix)));
  let m = Il(n.configure(l));
  return s && c.push(m.data.of({ autocomplete: nx })), new on(m, c);
}
function nx(r) {
  let { state: e, pos: t } = r, i = /<[:\-\.\w\u00b7-\uffff]*$/.exec(e.sliceDoc(t - 25, t));
  if (!i)
    return null;
  let n = Te(e).resolveInner(t, -1);
  for (; n && !n.type.isTop; ) {
    if (n.name == "CodeBlock" || n.name == "FencedCode" || n.name == "ProcessingInstructionBlock" || n.name == "CommentBlock" || n.name == "Link" || n.name == "Image")
      return null;
    n = n.parent;
  }
  return {
    from: t - i[0].length,
    to: t,
    options: sx(),
    validFor: /^<[:\-\.\w\u00b7-\uffff]*$/
  };
}
let Yo = null;
function sx() {
  if (Yo)
    return Yo;
  let r = Ik(new M1(ge.create({ extensions: xp }), 0, !0));
  return Yo = r ? r.options : [];
}
const ox = /code|horizontalrule|html|link|comment|processing|escape|entity|image|mark|url/i, ax = /* @__PURE__ */ N.domEventHandlers({
  paste: (r, e) => {
    var t;
    let { main: i } = e.state.selection;
    if (i.empty)
      return !1;
    let n = (t = r.clipboardData) === null || t === void 0 ? void 0 : t.getData("text/plain");
    if (!n || !/^(https?:\/\/|mailto:|xmpp:|www\.)/.test(n) || (/^www\./.test(n) && (n = "https://" + n), !Ms.isActiveAt(e.state, i.from, 1)))
      return !1;
    let s = Te(e.state), o = !1;
    return s.iterate({
      from: i.from,
      to: i.to,
      enter: (a) => {
        (a.from > i.from || ox.test(a.name)) && (o = !0);
      },
      leave: (a) => {
        a.to < i.to && (o = !0);
      }
    }), o ? !1 : (e.dispatch({
      changes: [{ from: i.from, insert: "[" }, { from: i.to, insert: `](${n})` }],
      userEvent: "input.paste",
      scrollIntoView: !0
    }), !0);
  }
});
function lx(r) {
  var e = r.Pos;
  function t(h, f, d) {
    if (f.line === d.line && f.ch >= d.ch - 1) {
      var O = h.getLine(f.line), g = O.charCodeAt(f.ch);
      55296 <= g && g <= 55551 && (d.ch += 1);
    }
    return { start: f, end: d };
  }
  var i = [
    // Key to key mapping. This goes first to make it possible to override
    // existing mappings.
    { keys: "<Left>", type: "keyToKey", toKeys: "h" },
    { keys: "<Right>", type: "keyToKey", toKeys: "l" },
    { keys: "<Up>", type: "keyToKey", toKeys: "k" },
    { keys: "<Down>", type: "keyToKey", toKeys: "j" },
    { keys: "g<Up>", type: "keyToKey", toKeys: "gk" },
    { keys: "g<Down>", type: "keyToKey", toKeys: "gj" },
    { keys: "<Space>", type: "keyToKey", toKeys: "l" },
    { keys: "<BS>", type: "keyToKey", toKeys: "h" },
    { keys: "<Del>", type: "keyToKey", toKeys: "x" },
    { keys: "<C-Space>", type: "keyToKey", toKeys: "W" },
    { keys: "<C-BS>", type: "keyToKey", toKeys: "B" },
    { keys: "<S-Space>", type: "keyToKey", toKeys: "w" },
    { keys: "<S-BS>", type: "keyToKey", toKeys: "b" },
    { keys: "<C-n>", type: "keyToKey", toKeys: "j" },
    { keys: "<C-p>", type: "keyToKey", toKeys: "k" },
    { keys: "<C-[>", type: "keyToKey", toKeys: "<Esc>" },
    { keys: "<C-c>", type: "keyToKey", toKeys: "<Esc>" },
    { keys: "<C-[>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "<C-c>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "<C-Esc>", type: "keyToKey", toKeys: "<Esc>" },
    // ipad keyboard sends C-Esc instead of C-[
    { keys: "<C-Esc>", type: "keyToKey", toKeys: "<Esc>", context: "insert" },
    { keys: "s", type: "keyToKey", toKeys: "cl", context: "normal" },
    { keys: "s", type: "keyToKey", toKeys: "c", context: "visual" },
    { keys: "S", type: "keyToKey", toKeys: "cc", context: "normal" },
    { keys: "S", type: "keyToKey", toKeys: "VdO", context: "visual" },
    { keys: "<Home>", type: "keyToKey", toKeys: "0" },
    { keys: "<End>", type: "keyToKey", toKeys: "$" },
    { keys: "<PageUp>", type: "keyToKey", toKeys: "<C-b>" },
    { keys: "<PageDown>", type: "keyToKey", toKeys: "<C-f>" },
    { keys: "<CR>", type: "keyToKey", toKeys: "j^", context: "normal" },
    { keys: "<Ins>", type: "keyToKey", toKeys: "i", context: "normal" },
    { keys: "<Ins>", type: "action", action: "toggleOverwrite", context: "insert" },
    // Motions
    { keys: "H", type: "motion", motion: "moveToTopLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "M", type: "motion", motion: "moveToMiddleLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "L", type: "motion", motion: "moveToBottomLine", motionArgs: { linewise: !0, toJumplist: !0 } },
    { keys: "h", type: "motion", motion: "moveByCharacters", motionArgs: { forward: !1 } },
    { keys: "l", type: "motion", motion: "moveByCharacters", motionArgs: { forward: !0 } },
    { keys: "j", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, linewise: !0 } },
    { keys: "k", type: "motion", motion: "moveByLines", motionArgs: { forward: !1, linewise: !0 } },
    { keys: "gj", type: "motion", motion: "moveByDisplayLines", motionArgs: { forward: !0 } },
    { keys: "gk", type: "motion", motion: "moveByDisplayLines", motionArgs: { forward: !1 } },
    { keys: "w", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !1 } },
    { keys: "W", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !1, bigWord: !0 } },
    { keys: "e", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !0, inclusive: !0 } },
    { keys: "E", type: "motion", motion: "moveByWords", motionArgs: { forward: !0, wordEnd: !0, bigWord: !0, inclusive: !0 } },
    { keys: "b", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1 } },
    { keys: "B", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1, bigWord: !0 } },
    { keys: "ge", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !0, inclusive: !0 } },
    { keys: "gE", type: "motion", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !0, bigWord: !0, inclusive: !0 } },
    { keys: "{", type: "motion", motion: "moveByParagraph", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "}", type: "motion", motion: "moveByParagraph", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "(", type: "motion", motion: "moveBySentence", motionArgs: { forward: !1 } },
    { keys: ")", type: "motion", motion: "moveBySentence", motionArgs: { forward: !0 } },
    { keys: "<C-f>", type: "motion", motion: "moveByPage", motionArgs: { forward: !0 } },
    { keys: "<C-b>", type: "motion", motion: "moveByPage", motionArgs: { forward: !1 } },
    { keys: "<C-d>", type: "motion", motion: "moveByScroll", motionArgs: { forward: !0, explicitRepeat: !0 } },
    { keys: "<C-u>", type: "motion", motion: "moveByScroll", motionArgs: { forward: !1, explicitRepeat: !0 } },
    { keys: "gg", type: "motion", motion: "moveToLineOrEdgeOfDocument", motionArgs: { forward: !1, explicitRepeat: !0, linewise: !0, toJumplist: !0 } },
    { keys: "G", type: "motion", motion: "moveToLineOrEdgeOfDocument", motionArgs: { forward: !0, explicitRepeat: !0, linewise: !0, toJumplist: !0 } },
    { keys: "g$", type: "motion", motion: "moveToEndOfDisplayLine" },
    { keys: "g^", type: "motion", motion: "moveToStartOfDisplayLine" },
    { keys: "g0", type: "motion", motion: "moveToStartOfDisplayLine" },
    { keys: "0", type: "motion", motion: "moveToStartOfLine" },
    { keys: "^", type: "motion", motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "+", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, toFirstChar: !0 } },
    { keys: "-", type: "motion", motion: "moveByLines", motionArgs: { forward: !1, toFirstChar: !0 } },
    { keys: "_", type: "motion", motion: "moveByLines", motionArgs: { forward: !0, toFirstChar: !0, repeatOffset: -1 } },
    { keys: "$", type: "motion", motion: "moveToEol", motionArgs: { inclusive: !0 } },
    { keys: "%", type: "motion", motion: "moveToMatchedSymbol", motionArgs: { inclusive: !0, toJumplist: !0 } },
    { keys: "f<character>", type: "motion", motion: "moveToCharacter", motionArgs: { forward: !0, inclusive: !0 } },
    { keys: "F<character>", type: "motion", motion: "moveToCharacter", motionArgs: { forward: !1 } },
    { keys: "t<character>", type: "motion", motion: "moveTillCharacter", motionArgs: { forward: !0, inclusive: !0 } },
    { keys: "T<character>", type: "motion", motion: "moveTillCharacter", motionArgs: { forward: !1 } },
    { keys: ";", type: "motion", motion: "repeatLastCharacterSearch", motionArgs: { forward: !0 } },
    { keys: ",", type: "motion", motion: "repeatLastCharacterSearch", motionArgs: { forward: !1 } },
    { keys: "'<register>", type: "motion", motion: "goToMark", motionArgs: { toJumplist: !0, linewise: !0 } },
    { keys: "`<register>", type: "motion", motion: "goToMark", motionArgs: { toJumplist: !0 } },
    { keys: "]`", type: "motion", motion: "jumpToMark", motionArgs: { forward: !0 } },
    { keys: "[`", type: "motion", motion: "jumpToMark", motionArgs: { forward: !1 } },
    { keys: "]'", type: "motion", motion: "jumpToMark", motionArgs: { forward: !0, linewise: !0 } },
    { keys: "['", type: "motion", motion: "jumpToMark", motionArgs: { forward: !1, linewise: !0 } },
    // the next two aren't motions but must come before more general motion declarations
    { keys: "]p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !0, isEdit: !0, matchIndent: !0 } },
    { keys: "[p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !1, isEdit: !0, matchIndent: !0 } },
    { keys: "]<character>", type: "motion", motion: "moveToSymbol", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "[<character>", type: "motion", motion: "moveToSymbol", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "|", type: "motion", motion: "moveToColumn" },
    { keys: "o", type: "motion", motion: "moveToOtherHighlightedEnd", context: "visual" },
    { keys: "O", type: "motion", motion: "moveToOtherHighlightedEnd", motionArgs: { sameLine: !0 }, context: "visual" },
    // Operators
    { keys: "d", type: "operator", operator: "delete" },
    { keys: "y", type: "operator", operator: "yank" },
    { keys: "c", type: "operator", operator: "change" },
    { keys: "=", type: "operator", operator: "indentAuto" },
    { keys: ">", type: "operator", operator: "indent", operatorArgs: { indentRight: !0 } },
    { keys: "<", type: "operator", operator: "indent", operatorArgs: { indentRight: !1 } },
    { keys: "g~", type: "operator", operator: "changeCase" },
    { keys: "gu", type: "operator", operator: "changeCase", operatorArgs: { toLower: !0 }, isEdit: !0 },
    { keys: "gU", type: "operator", operator: "changeCase", operatorArgs: { toLower: !1 }, isEdit: !0 },
    { keys: "gc", type: "operator", operator: "toggleComment", isEdit: !0 },
    { keys: "n", type: "motion", motion: "findNext", motionArgs: { forward: !0, toJumplist: !0 } },
    { keys: "N", type: "motion", motion: "findNext", motionArgs: { forward: !1, toJumplist: !0 } },
    { keys: "gn", type: "motion", motion: "findAndSelectNextInclusive", motionArgs: { forward: !0 } },
    { keys: "gN", type: "motion", motion: "findAndSelectNextInclusive", motionArgs: { forward: !1 } },
    { keys: "gq", type: "operator", operator: "hardWrap" },
    { keys: "gw", type: "operator", operator: "hardWrap", operatorArgs: { keepCursor: !0 } },
    { keys: "g?", type: "operator", operator: "rot13" },
    // Operator-Motion dual commands
    { keys: "x", type: "operatorMotion", operator: "delete", motion: "moveByCharacters", motionArgs: { forward: !0 }, operatorMotionArgs: { visualLine: !1 } },
    { keys: "X", type: "operatorMotion", operator: "delete", motion: "moveByCharacters", motionArgs: { forward: !1 }, operatorMotionArgs: { visualLine: !0 } },
    { keys: "D", type: "operatorMotion", operator: "delete", motion: "moveToEol", motionArgs: { inclusive: !0 }, context: "normal" },
    { keys: "D", type: "operator", operator: "delete", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "Y", type: "operatorMotion", operator: "yank", motion: "expandToLine", motionArgs: { linewise: !0 }, context: "normal" },
    { keys: "Y", type: "operator", operator: "yank", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "C", type: "operatorMotion", operator: "change", motion: "moveToEol", motionArgs: { inclusive: !0 }, context: "normal" },
    { keys: "C", type: "operator", operator: "change", operatorArgs: { linewise: !0 }, context: "visual" },
    { keys: "~", type: "operatorMotion", operator: "changeCase", motion: "moveByCharacters", motionArgs: { forward: !0 }, operatorArgs: { shouldMoveCursor: !0 }, context: "normal" },
    { keys: "~", type: "operator", operator: "changeCase", context: "visual" },
    { keys: "<C-u>", type: "operatorMotion", operator: "delete", motion: "moveToStartOfLine", context: "insert" },
    { keys: "<C-w>", type: "operatorMotion", operator: "delete", motion: "moveByWords", motionArgs: { forward: !1, wordEnd: !1 }, context: "insert" },
    //ignore C-w in normal mode
    { keys: "<C-w>", type: "idle", context: "normal" },
    // Actions
    { keys: "<C-i>", type: "action", action: "jumpListWalk", actionArgs: { forward: !0 } },
    { keys: "<C-o>", type: "action", action: "jumpListWalk", actionArgs: { forward: !1 } },
    { keys: "<C-e>", type: "action", action: "scroll", actionArgs: { forward: !0, linewise: !0 } },
    { keys: "<C-y>", type: "action", action: "scroll", actionArgs: { forward: !1, linewise: !0 } },
    { keys: "a", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "charAfter" }, context: "normal" },
    { keys: "A", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "eol" }, context: "normal" },
    { keys: "A", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "endOfSelectedArea" }, context: "visual" },
    { keys: "i", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "inplace" }, context: "normal" },
    { keys: "gi", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "lastEdit" }, context: "normal" },
    { keys: "I", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "firstNonBlank" }, context: "normal" },
    { keys: "gI", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "bol" }, context: "normal" },
    { keys: "I", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { insertAt: "startOfSelectedArea" }, context: "visual" },
    { keys: "o", type: "action", action: "newLineAndEnterInsertMode", isEdit: !0, interlaceInsertRepeat: !0, actionArgs: { after: !0 }, context: "normal" },
    { keys: "O", type: "action", action: "newLineAndEnterInsertMode", isEdit: !0, interlaceInsertRepeat: !0, actionArgs: { after: !1 }, context: "normal" },
    { keys: "v", type: "action", action: "toggleVisualMode" },
    { keys: "V", type: "action", action: "toggleVisualMode", actionArgs: { linewise: !0 } },
    { keys: "<C-v>", type: "action", action: "toggleVisualMode", actionArgs: { blockwise: !0 } },
    { keys: "<C-q>", type: "action", action: "toggleVisualMode", actionArgs: { blockwise: !0 } },
    { keys: "gv", type: "action", action: "reselectLastSelection" },
    { keys: "J", type: "action", action: "joinLines", isEdit: !0 },
    { keys: "gJ", type: "action", action: "joinLines", actionArgs: { keepSpaces: !0 }, isEdit: !0 },
    { keys: "p", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !0, isEdit: !0 } },
    { keys: "P", type: "action", action: "paste", isEdit: !0, actionArgs: { after: !1, isEdit: !0 } },
    { keys: "r<character>", type: "action", action: "replace", isEdit: !0 },
    { keys: "@<register>", type: "action", action: "replayMacro" },
    { keys: "q<register>", type: "action", action: "enterMacroRecordMode" },
    // Handle Replace-mode as a special case of insert mode.
    { keys: "R", type: "action", action: "enterInsertMode", isEdit: !0, actionArgs: { replace: !0 }, context: "normal" },
    { keys: "R", type: "operator", operator: "change", operatorArgs: { linewise: !0, fullLine: !0 }, context: "visual", exitVisualBlock: !0 },
    { keys: "u", type: "action", action: "undo", context: "normal" },
    { keys: "u", type: "operator", operator: "changeCase", operatorArgs: { toLower: !0 }, context: "visual", isEdit: !0 },
    { keys: "U", type: "operator", operator: "changeCase", operatorArgs: { toLower: !1 }, context: "visual", isEdit: !0 },
    { keys: "<C-r>", type: "action", action: "redo" },
    { keys: "m<register>", type: "action", action: "setMark" },
    { keys: '"<register>', type: "action", action: "setRegister" },
    { keys: "<C-r><register>", type: "action", action: "insertRegister", context: "insert", isEdit: !0 },
    { keys: "<C-o>", type: "action", action: "oneNormalCommand", context: "insert" },
    { keys: "zz", type: "action", action: "scrollToCursor", actionArgs: { position: "center" } },
    { keys: "z.", type: "action", action: "scrollToCursor", actionArgs: { position: "center" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "zt", type: "action", action: "scrollToCursor", actionArgs: { position: "top" } },
    { keys: "z<CR>", type: "action", action: "scrollToCursor", actionArgs: { position: "top" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: "zb", type: "action", action: "scrollToCursor", actionArgs: { position: "bottom" } },
    { keys: "z-", type: "action", action: "scrollToCursor", actionArgs: { position: "bottom" }, motion: "moveToFirstNonWhiteSpaceCharacter" },
    { keys: ".", type: "action", action: "repeatLastEdit" },
    { keys: "<C-a>", type: "action", action: "incrementNumberToken", isEdit: !0, actionArgs: { increase: !0, backtrack: !1 } },
    { keys: "<C-x>", type: "action", action: "incrementNumberToken", isEdit: !0, actionArgs: { increase: !1, backtrack: !1 } },
    { keys: "<C-t>", type: "action", action: "indent", actionArgs: { indentRight: !0 }, context: "insert" },
    { keys: "<C-d>", type: "action", action: "indent", actionArgs: { indentRight: !1 }, context: "insert" },
    // Text object motions
    { keys: "a<register>", type: "motion", motion: "textObjectManipulation" },
    { keys: "i<register>", type: "motion", motion: "textObjectManipulation", motionArgs: { textObjectInner: !0 } },
    // Search
    { keys: "/", type: "search", searchArgs: { forward: !0, querySrc: "prompt", toJumplist: !0 } },
    { keys: "?", type: "search", searchArgs: { forward: !1, querySrc: "prompt", toJumplist: !0 } },
    { keys: "*", type: "search", searchArgs: { forward: !0, querySrc: "wordUnderCursor", wholeWordOnly: !0, toJumplist: !0 } },
    { keys: "#", type: "search", searchArgs: { forward: !1, querySrc: "wordUnderCursor", wholeWordOnly: !0, toJumplist: !0 } },
    { keys: "g*", type: "search", searchArgs: { forward: !0, querySrc: "wordUnderCursor", toJumplist: !0 } },
    { keys: "g#", type: "search", searchArgs: { forward: !1, querySrc: "wordUnderCursor", toJumplist: !0 } },
    // Ex command
    { keys: ":", type: "ex" }
  ], n = /* @__PURE__ */ Object.create(null), s = i.length, o = [
    { name: "colorscheme", shortName: "colo" },
    { name: "map" },
    { name: "imap", shortName: "im" },
    { name: "nmap", shortName: "nm" },
    { name: "vmap", shortName: "vm" },
    { name: "omap", shortName: "om" },
    { name: "noremap", shortName: "no" },
    { name: "nnoremap", shortName: "nn" },
    { name: "vnoremap", shortName: "vn" },
    { name: "inoremap", shortName: "ino" },
    { name: "onoremap", shortName: "ono" },
    { name: "unmap" },
    { name: "mapclear", shortName: "mapc" },
    { name: "nmapclear", shortName: "nmapc" },
    { name: "vmapclear", shortName: "vmapc" },
    { name: "imapclear", shortName: "imapc" },
    { name: "omapclear", shortName: "omapc" },
    { name: "write", shortName: "w" },
    { name: "undo", shortName: "u" },
    { name: "redo", shortName: "red" },
    { name: "set", shortName: "se" },
    { name: "setlocal", shortName: "setl" },
    { name: "setglobal", shortName: "setg" },
    { name: "sort", shortName: "sor" },
    { name: "substitute", shortName: "s", possiblyAsync: !0 },
    { name: "startinsert", shortName: "start" },
    { name: "nohlsearch", shortName: "noh" },
    { name: "yank", shortName: "y" },
    { name: "put", shortName: "pu" },
    { name: "delmarks", shortName: "delm" },
    { name: "marks", excludeFromCommandHistory: !0 },
    { name: "registers", shortName: "reg", excludeFromCommandHistory: !0 },
    { name: "vglobal", shortName: "v" },
    { name: "delete", shortName: "d" },
    { name: "join", shortName: "j" },
    { name: "normal", shortName: "norm" },
    { name: "global", shortName: "g" }
  ], a = Dl("");
  function l(h) {
    h.setOption("disableInput", !0), h.setOption("showCursorWhenSelecting", !1), r.signal(h, "vim-mode-change", { mode: "normal" }), h.on("cursorActivity", gh), Le(h), r.on(h.getInputField(), "paste", u(h));
  }
  function c(h) {
    h.setOption("disableInput", !1), h.off("cursorActivity", gh), r.off(h.getInputField(), "paste", u(h)), h.state.vim = null, Tr && clearTimeout(Tr);
  }
  function u(h) {
    var f = h.state.vim;
    return f.onPasteFn || (f.onPasteFn = function() {
      f.insertMode || (h.setCursor(Re(h.getCursor(), 0, 1)), Ai.enterInsertMode(h, {}, f));
    }), f.onPasteFn;
  }
  var p = /[\d]/, m = [r.isWordChar, function(h) {
    return h && !r.isWordChar(h) && !/\s/.test(h);
  }], v = [function(h) {
    return /\S/.test(h);
  }], b = ["<", ">"], w = ["-", '"', ".", ":", "_", "/", "+"], C = /^\w$/, A = /^[A-Z]$/;
  try {
    A = new RegExp("^[\\p{Lu}]$", "u");
  } catch {
  }
  function X(h, f) {
    return f >= h.firstLine() && f <= h.lastLine();
  }
  function _(h) {
    return /^[a-z]$/.test(h);
  }
  function H(h) {
    return "()[]{}".indexOf(h) != -1;
  }
  function B(h) {
    return p.test(h);
  }
  function Y(h) {
    return A.test(h);
  }
  function j(h) {
    return /^\s*$/.test(h);
  }
  function le(h) {
    return ".?!".indexOf(h) != -1;
  }
  function he(h, f) {
    for (var d = 0; d < f.length; d++)
      if (f[d] == h)
        return !0;
    return !1;
  }
  var fe = {};
  function re(h, f, d, O, g) {
    if (f === void 0 && !g)
      throw Error("defaultValue is required unless callback is provided");
    if (d || (d = "string"), fe[h] = {
      type: d,
      defaultValue: f,
      callback: g
    }, O)
      for (var y = 0; y < O.length; y++)
        fe[O[y]] = fe[h];
    f && J(h, f);
  }
  function J(h, f, d, O) {
    var g = fe[h];
    O = O || {};
    var y = O.scope;
    if (!g)
      return new Error("Unknown option: " + h);
    if (g.type == "boolean") {
      if (f && f !== !0)
        return new Error("Invalid argument: " + h + "=" + f);
      f !== !1 && (f = !0);
    }
    g.callback ? (y !== "local" && g.callback(f, void 0), y !== "global" && d && g.callback(f, d)) : (y !== "local" && (g.value = g.type == "boolean" ? !!f : f), y !== "global" && d && (d.state.vim.options[h] = { value: f }));
  }
  function ne(h, f, d) {
    var O = fe[h];
    d = d || {};
    var g = d.scope;
    if (!O)
      return new Error("Unknown option: " + h);
    if (O.callback) {
      let y = f && O.callback(void 0, f);
      return g !== "global" && y !== void 0 ? y : g !== "local" ? O.callback() : void 0;
    } else
      return (g !== "global" && f && f.state.vim.options[h] || g !== "local" && O || {}).value;
  }
  re("filetype", void 0, "string", ["ft"], function(h, f) {
    if (f !== void 0)
      if (h === void 0) {
        let d = f.getOption("mode");
        return d == "null" ? "" : d;
      } else {
        let d = h == "" ? "null" : h;
        f.setOption("mode", d);
      }
  }), re("textwidth", 80, "number", ["tw"], function(h, f) {
    if (f !== void 0)
      if (h === void 0) {
        var d = f.getOption("textwidth");
        return d;
      } else {
        var O = Math.round(h);
        O > 1 && f.setOption("textwidth", O);
      }
  });
  var Oe = function() {
    var h = 100, f = -1, d = 0, O = 0, g = (
      /**@type {(Marker|undefined)[]} */
      new Array(h)
    );
    function y(x, $, P) {
      var M = f % h, R = g[M];
      function Z(E) {
        var I = ++f % h, K = g[I];
        K && K.clear(), g[I] = x.setBookmark(E);
      }
      if (R) {
        var T = R.find();
        T && !wt(T, $) && Z($);
      } else
        Z($);
      Z(P), d = f, O = f - h + 1, O < 0 && (O = 0);
    }
    function S(x, $) {
      f += $, f > d ? f = d : f < O && (f = O);
      var P = g[(h + f) % h];
      if (P && !P.find()) {
        var M = $ > 0 ? 1 : -1, R, Z = x.getCursor();
        do
          if (f += M, P = g[(h + f) % h], P && (R = P.find()) && !wt(Z, R))
            break;
        while (f < d && f > O);
      }
      return P;
    }
    function k(x, $) {
      var P = f, M = S(x, $);
      return f = P, M && M.find();
    }
    return {
      /**@type{Pos|undefined} */
      cachedCursor: void 0,
      //used for # and * jumps
      add: y,
      find: k,
      move: S
    };
  }, Se = function(h) {
    return h ? {
      changes: h.changes,
      expectCursorActivityForChange: h.expectCursorActivityForChange
    } : {
      // Change list
      changes: [],
      // Set to true on change, false on cursorActivity.
      expectCursorActivityForChange: !1
    };
  };
  class Ye {
    constructor() {
      this.latestRegister = void 0, this.isPlaying = !1, this.isRecording = !1, this.replaySearchQueries = [], this.onRecordingDone = void 0, this.lastInsertModeChanges = Se();
    }
    exitMacroRecordMode() {
      var f = D.macroModeState;
      f.onRecordingDone && f.onRecordingDone(), f.onRecordingDone = void 0, f.isRecording = !1;
    }
    /**
     * @arg {CodeMirror} cm
     * @arg {string} registerName
     */
    enterMacroRecordMode(f, d) {
      var O = D.registerController.getRegister(d);
      if (O) {
        if (O.clear(), this.latestRegister = d, f.openDialog) {
          var g = Zt("span", { class: "cm-vim-message" }, "recording @" + d);
          this.onRecordingDone = f.openDialog(g, function() {
          }, { bottom: !0 });
        }
        this.isRecording = !0;
      }
    }
  }
  function Le(h) {
    return h.state.vim || (h.state.vim = {
      inputState: new Vl(),
      // Vim's input state that triggered the last edit, used to repeat
      // motions and operators with '.'.
      lastEditInputState: void 0,
      // Vim's action command before the last edit, used to repeat actions
      // with '.' and insert mode repeat.
      lastEditActionCommand: void 0,
      // When using jk for navigation, if you move from a longer line to a
      // shorter line, the cursor may clip to the end of the shorter line.
      // If j is pressed again and cursor goes to the next line, the
      // cursor should go back to its horizontal position on the longer
      // line if it can. This is to keep track of the horizontal position.
      lastHPos: -1,
      // Doing the same with screen-position for gj/gk
      lastHSPos: -1,
      // The last motion command run. Cleared if a non-motion command gets
      // executed in between.
      lastMotion: null,
      marks: {},
      insertMode: !1,
      insertModeReturn: !1,
      // Repeat count for changes made in insert mode, triggered by key
      // sequences like 3,i. Only exists when insertMode is true.
      insertModeRepeat: void 0,
      visualMode: !1,
      // If we are in visual line mode. No effect if visualMode is false.
      visualLine: !1,
      visualBlock: !1,
      lastSelection: (
        /**@type{vimState["lastSelection"]}*/
        /**@type{unknown}*/
        null
      ),
      lastPastedText: void 0,
      sel: { anchor: new e(0, 0), head: new e(0, 0) },
      // Buffer-local/window-local values of vim options.
      options: {},
      // Whether the next character should be interpreted literally
      // Necassary for correct implementation of f<character>, r<character> etc.
      // in terms of langmaps.
      expectLiteralNext: !1,
      status: ""
    }), h.state.vim;
  }
  var D;
  function Ee() {
    D = {
      // The current search query.
      searchQuery: null,
      // Whether we are searching backwards.
      searchIsReversed: !1,
      // Replace part of the last substituted pattern
      lastSubstituteReplacePart: void 0,
      jumpList: Oe(),
      macroModeState: new Ye(),
      // Recording latest f, t, F or T motion command.
      lastCharacterSearch: { increment: 0, forward: !0, selectedCharacter: "" },
      registerController: new Bp({}),
      // search history buffer
      searchHistoryController: new Nl(),
      // ex Command history buffer
      exCommandHistoryController: new Nl()
    };
    for (var h in fe) {
      var f = fe[h];
      f.value = f.defaultValue;
    }
  }
  class Je {
    /**
     * Wrapper for special keys pressed in insert mode
     * @arg {string} keyName
     * @arg {KeyboardEvent} e
     * @returns
     */
    constructor(f, d) {
      this.keyName = f, this.key = d.key, this.ctrlKey = d.ctrlKey, this.altKey = d.altKey, this.metaKey = d.metaKey, this.shiftKey = d.shiftKey;
    }
  }
  var nt, we = {
    enterVimMode: l,
    leaveVimMode: c,
    buildKeyMap: function() {
    },
    // Testing hook, though it might be useful to expose the register
    // controller anyway.
    getRegisterController: function() {
      return D.registerController;
    },
    // Testing hook.
    resetVimGlobalState_: Ee,
    // Testing hook.
    getVimGlobalState_: function() {
      return D;
    },
    // Testing hook.
    maybeInitVimState_: Le,
    suppressErrorLogging: !1,
    InsertModeKey: Je,
    /**@type {(lhs: string, rhs: string, ctx: string) => void} */
    map: function(h, f, d) {
      ct.map(h, f, d);
    },
    /**@type {(lhs: string, ctx: string) => any} */
    unmap: function(h, f) {
      return ct.unmap(h, f);
    },
    // Non-recursive map function.
    // NOTE: This will not create mappings to key maps that aren't present
    // in the default key map. See TODO at bottom of function.
    /**@type {(lhs: string, rhs: string, ctx: string) => void} */
    noremap: function(h, f, d) {
      ct.map(h, f, d, !0);
    },
    // Remove all user-defined mappings for the provided context.
    /**@arg {string} [ctx]} */
    mapclear: function(h) {
      var f = i.length, d = s, O = i.slice(0, f - d);
      if (i = i.slice(f - d), h)
        for (var g = O.length - 1; g >= 0; g--) {
          var y = O[g];
          if (h !== y.context)
            if (y.context)
              this._mapCommand(y);
            else {
              var S = ["normal", "insert", "visual"];
              for (var k in S)
                if (S[k] !== h) {
                  var x = Object.assign({}, y);
                  x.context = S[k], this._mapCommand(x);
                }
            }
        }
    },
    langmap: zl,
    vimKeyFromEvent: Pr,
    // TODO: Expose setOption and getOption as instance methods. Need to decide how to namespace
    // them, or somehow make them work with the existing CodeMirror setOption/getOption API.
    setOption: J,
    getOption: ne,
    defineOption: re,
    /**@type {(name: string, prefix: string|undefined, func: ExFn) => void} */
    defineEx: function(h, f, d) {
      if (!f)
        f = h;
      else if (h.indexOf(f) !== 0)
        throw new Error('(Vim.defineEx) "' + f + '" is not a prefix of "' + h + '", command not registered');
      Oh[h] = d, ct.commandMap_[f] = { name: h, shortName: f, type: "api" };
    },
    /**@type {(cm: CodeMirror, key: string, origin: string) => undefined | boolean} */
    handleKey: function(h, f, d) {
      var O = this.findKey(h, f, d);
      if (typeof O == "function")
        return O();
    },
    multiSelectHandleKey: Pg,
    /**
     * This is the outermost function called by CodeMirror, after keys have
     * been mapped to their Vim equivalents.
     *
     * Finds a command based on the key (and cached keys if there is a
     * multi-key sequence). Returns `undefined` if no key is matched, a noop
     * function if a partial match is found (multi-key), and a function to
     * execute the bound command if a a key is matched. The function always
     * returns true.
     */
    /**@type {(cm_: CodeMirror, key: string, origin?: string| undefined) => (() => boolean|undefined) | undefined} */
    findKey: function(h, f, d) {
      var O = Le(h), g = (
        /**@type {CodeMirrorV}*/
        h
      );
      function y() {
        var P = D.macroModeState;
        if (P.isRecording) {
          if (f == "q")
            return P.exitMacroRecordMode(), Ie(g), !0;
          d != "mapping" && wg(P, f);
        }
      }
      function S() {
        if (f == "<Esc>") {
          if (O.visualMode)
            zt(g);
          else if (O.insertMode)
            pi(g);
          else
            return;
          return Ie(g), !0;
        }
      }
      function k() {
        if (S())
          return !0;
        O.inputState.keyBuffer.push(f);
        var P = O.inputState.keyBuffer.join(""), M = f.length == 1, R = Ti.matchCommand(P, i, O.inputState, "insert"), Z = O.inputState.changeQueue;
        if (R.type == "none")
          return Ie(g), !1;
        if (R.type == "partial") {
          if (R.expectLiteralNext && (O.expectLiteralNext = !0), nt && window.clearTimeout(nt), nt = M && window.setTimeout(
            function() {
              O.insertMode && O.inputState.keyBuffer.length && Ie(g);
            },
            ne("insertModeEscKeysTimeout")
          ), M) {
            var T = g.listSelections();
            (!Z || Z.removed.length != T.length) && (Z = O.inputState.changeQueue = new Ep()), Z.inserted += f;
            for (var E = 0; E < T.length; E++) {
              var I = ot(T[E].anchor, T[E].head), K = Oi(T[E].anchor, T[E].head), G = g.getRange(I, g.state.overwrite ? Re(K, 0, 1) : K);
              Z.removed[E] = (Z.removed[E] || "") + G;
            }
          }
          return !M;
        } else R.type == "full" && (O.inputState.keyBuffer.length = 0);
        if (O.expectLiteralNext = !1, nt && window.clearTimeout(nt), R.command && Z) {
          for (var T = g.listSelections(), E = 0; E < T.length; E++) {
            var U = T[E].head;
            g.replaceRange(
              Z.removed[E] || "",
              Re(U, 0, -Z.inserted.length),
              U,
              "+input"
            );
          }
          D.macroModeState.lastInsertModeChanges.changes.pop();
        }
        return R.command || Ie(g), R.command;
      }
      function x() {
        if (y() || S())
          return !0;
        O.inputState.keyBuffer.push(f);
        var P = O.inputState.keyBuffer.join("");
        if (/^[1-9]\d*$/.test(P))
          return !0;
        var M = /^(\d*)(.*)$/.exec(P);
        if (!M)
          return Ie(g), !1;
        var R = O.visualMode ? "visual" : "normal", Z = M[2] || M[1];
        O.inputState.operatorShortcut && O.inputState.operatorShortcut.slice(-1) == Z && (Z = O.inputState.operatorShortcut);
        var T = Ti.matchCommand(Z, i, O.inputState, R);
        return T.type == "none" ? (Ie(g), !1) : T.type == "partial" ? (T.expectLiteralNext && (O.expectLiteralNext = !0), !0) : T.type == "clear" ? (Ie(g), !0) : (O.expectLiteralNext = !1, O.inputState.keyBuffer.length = 0, M = /^(\d*)(.*)$/.exec(P), M && M[1] && M[1] != "0" && O.inputState.pushRepeatDigit(M[1]), T.command);
      }
      var $ = O.insertMode ? k() : x();
      if ($ === !1)
        return !O.insertMode && (f.length === 1 || r.isMac && /<A-.>/.test(f)) ? function() {
          return !0;
        } : void 0;
      if ($ === !0)
        return function() {
          return !0;
        };
      if ($)
        return function() {
          return g.operation(function() {
            g.curOp.isVimOp = !0;
            try {
              if (typeof $ != "object") return;
              $.type == "keyToKey" ? di(g, $.toKeys, $) : Ti.processCommand(g, O, $);
            } catch (P) {
              throw g.state.vim = void 0, Le(g), we.suppressErrorLogging || console.log(P), P;
            }
            return !0;
          });
        };
    },
    /**@type {(cm: CodeMirrorV, input: string)=>void} */
    handleEx: function(h, f) {
      ct.processCommand(h, f);
    },
    defineMotion: jp,
    defineAction: Wp,
    defineOperator: Ip,
    mapCommand: kg,
    _mapCommand: to,
    defineRegister: _p,
    exitVisualMode: zt,
    exitInsertMode: pi
  }, ze = [], xt = !1, ke;
  function Gi(h) {
    if (!ke) throw new Error("No prompt to send key to");
    if (h[0] == "<") {
      var f = h.toLowerCase().slice(1, -1), d = f.split("-");
      if (f = d.pop() || "", f == "lt") h = "<";
      else if (f == "space") h = " ";
      else if (f == "cr") h = `
`;
      else if (Ui[f]) {
        var O = ke.value || "", g = {
          key: Ui[f],
          target: {
            value: O,
            selectionEnd: O.length,
            selectionStart: O.length
          }
        };
        ke.onKeyDown && ke.onKeyDown(g, ke.value, S), ke && ke.onKeyUp && ke.onKeyUp(g, ke.value, S);
        return;
      }
    }
    if (h == `
`) {
      var y = ke;
      ke = null, y.onClose && y.onClose(y.value);
    } else
      ke.value = (ke.value || "") + h;
    function S(k) {
      ke && (typeof k == "string" ? ke.value = k : ke = null);
    }
  }
  function di(h, f, d) {
    var O = xt;
    if (d) {
      if (ze.indexOf(d) != -1) return;
      ze.push(d), xt = d.noremap != !1;
    }
    try {
      for (var g = Le(h), y = /<(?:[CSMA]-)*\w+>|./gi, S; S = y.exec(f); ) {
        var k = S[0], x = g.insertMode;
        if (ke) {
          Gi(k);
          continue;
        }
        var $ = we.handleKey(h, k, "mapping");
        if (!$ && x && g.insertMode) {
          if (k[0] == "<") {
            var P = k.toLowerCase().slice(1, -1), M = P.split("-");
            if (P = M.pop() || "", P == "lt") k = "<";
            else if (P == "space") k = " ";
            else if (P == "cr") k = `
`;
            else if (Ui.hasOwnProperty(P)) {
              k = Ui[P], Sh(h, k);
              continue;
            } else
              k = k[0], y.lastIndex = S.index + 1;
          }
          h.replaceSelection(k);
        }
      }
    } finally {
      if (ze.pop(), xt = ze.length ? O : !1, !ze.length && ke) {
        var R = ke;
        ke = null, xn(h, R);
      }
    }
  }
  var qs = {
    Return: "CR",
    Backspace: "BS",
    Delete: "Del",
    Escape: "Esc",
    Insert: "Ins",
    ArrowLeft: "Left",
    ArrowRight: "Right",
    ArrowUp: "Up",
    ArrowDown: "Down",
    Enter: "CR",
    " ": "Space"
  }, Lp = {
    Shift: 1,
    Alt: 1,
    Command: 1,
    Control: 1,
    CapsLock: 1,
    AltGraph: 1,
    Dead: 1,
    Unidentified: 1
  }, Ui = {};
  "Left|Right|Up|Down|End|Home".split("|").concat(Object.keys(qs)).forEach(function(h) {
    Ui[(qs[h] || "").toLowerCase()] = Ui[h.toLowerCase()] = h;
  });
  function Pr(h, f) {
    var d = h.key;
    if (!Lp[d]) {
      d.length > 1 && d[0] == "n" && (d = d.replace("Numpad", "")), d = qs[d] || d;
      var O = "";
      if (h.ctrlKey && (O += "C-"), h.altKey && (O += "A-"), h.metaKey && (O += "M-"), r.isMac && O == "A-" && d.length == 1 && (O = O.slice(2)), (O || d.length > 1) && h.shiftKey && (O += "S-"), f && !f.expectLiteralNext && d.length == 1) {
        if (a.keymap && d in a.keymap)
          (a.remapCtrl != !1 || !O) && (d = a.keymap[d]);
        else if (d.charCodeAt(0) > 128 && !n[d]) {
          var g = h.code?.slice(-1) || "";
          h.shiftKey || (g = g.toLowerCase()), g && (d = g, !O && h.altKey && (O = "A-"));
        }
      }
      return O += d, O.length > 1 && (O = "<" + O + ">"), O;
    }
  }
  function zl(h, f) {
    a.string !== h && (a = Dl(h)), a.remapCtrl = f;
  }
  function Dl(h) {
    let f = {};
    if (!h) return { keymap: f, string: "" };
    function d(O) {
      return O.split(/\\?(.)/).filter(Boolean);
    }
    return h.split(/((?:[^\\,]|\\.)+),/).map((O) => {
      if (!O) return;
      const g = O.split(/((?:[^\\;]|\\.)+);/);
      if (g.length == 3) {
        const y = d(g[1]), S = d(g[2]);
        if (y.length !== S.length) return;
        for (let k = 0; k < y.length; ++k) f[y[k]] = S[k];
      } else if (g.length == 1) {
        const y = d(O);
        if (y.length % 2 !== 0) return;
        for (let S = 0; S < y.length; S += 2) f[y[S]] = y[S + 1];
      }
    }), { keymap: f, string: h };
  }
  re("langmap", void 0, "string", ["lmap"], function(h, f) {
    if (h === void 0)
      return a.string;
    zl(h);
  });
  class Vl {
    constructor() {
      this.prefixRepeat = [], this.motionRepeat = [], this.operator = null, this.operatorArgs = null, this.motion = null, this.motionArgs = null, this.keyBuffer = [], this.registerName = void 0, this.changeQueue = null;
    }
    /** @param {string} n */
    pushRepeatDigit(f) {
      this.operator ? this.motionRepeat = this.motionRepeat.concat(f) : this.prefixRepeat = this.prefixRepeat.concat(f);
    }
    getRepeat() {
      var f = 0;
      return (this.prefixRepeat.length > 0 || this.motionRepeat.length > 0) && (f = 1, this.prefixRepeat.length > 0 && (f *= parseInt(this.prefixRepeat.join(""), 10)), this.motionRepeat.length > 0 && (f *= parseInt(this.motionRepeat.join(""), 10))), f;
    }
  }
  function Ie(h, f) {
    h.state.vim.inputState = new Vl(), h.state.vim.expectLiteralNext = !1, r.signal(h, "vim-command-done", f);
  }
  function Ep() {
    this.removed = [], this.inserted = "";
  }
  class Wt {
    /** @arg {string} [text] @arg {boolean} [linewise] @arg {boolean } [blockwise] */
    constructor(f, d, O) {
      this.clear(), this.keyBuffer = [f || ""], this.insertModeChanges = [], this.searchQueries = [], this.linewise = !!d, this.blockwise = !!O;
    }
    /** @arg {string} [text] @arg {boolean} [linewise] @arg {boolean } [blockwise] */
    setText(f, d, O) {
      this.keyBuffer = [f || ""], this.linewise = !!d, this.blockwise = !!O;
    }
    /** @arg {string} text @arg {boolean} [linewise] */
    pushText(f, d) {
      d && (this.linewise || this.keyBuffer.push(`
`), this.linewise = !0), this.keyBuffer.push(f);
    }
    /** @arg {InsertModeChanges} changes */
    pushInsertModeChanges(f) {
      this.insertModeChanges.push(Se(f));
    }
    /** @arg {string} query */
    pushSearchQuery(f) {
      this.searchQueries.push(f);
    }
    clear() {
      this.keyBuffer = [], this.insertModeChanges = [], this.searchQueries = [], this.linewise = !1;
    }
    toString() {
      return this.keyBuffer.join("");
    }
  }
  function _p(h, f) {
    var d = D.registerController.registers;
    if (!h || h.length != 1)
      throw Error("Register name must be 1 character");
    if (d[h])
      throw Error("Register already defined " + h);
    d[h] = f, w.push(h);
  }
  class Bp {
    /** @arg {Object<string, Register>} registers */
    constructor(f) {
      this.registers = f, this.unnamedRegister = f['"'] = new Wt(), f["."] = new Wt(), f[":"] = new Wt(), f["/"] = new Wt(), f["+"] = new Wt();
    }
    /**
     * @param {string | null | undefined} registerName
     * @param {string} operator
     * @param {string} text
     * @param {boolean} [linewise]
     * @param {boolean} [blockwise]
     */
    pushText(f, d, O, g, y) {
      if (f !== "_") {
        g && O.charAt(O.length - 1) !== `
` && (O += `
`);
        var S = this.isValidRegister(f) ? this.getRegister(f) : null;
        if (!S || !f) {
          switch (d) {
            case "yank":
              this.registers[0] = new Wt(O, g, y);
              break;
            case "delete":
            case "change":
              O.indexOf(`
`) == -1 ? this.registers["-"] = new Wt(O, g) : (this.shiftNumericRegisters_(), this.registers[1] = new Wt(O, g));
              break;
          }
          this.unnamedRegister.setText(O, g, y);
          return;
        }
        var k = Y(f);
        k ? S.pushText(O, g) : S.setText(O, g, y), f === "+" && navigator.clipboard.writeText(O), this.unnamedRegister.setText(S.toString(), g);
      }
    }
    /**
     * Gets the register named @name.  If one of @name doesn't already exist,
     * create it.  If @name is invalid, return the unnamedRegister.
     * @arg {string} [name]
     */
    getRegister(f) {
      return this.isValidRegister(f) ? (f = f.toLowerCase(), this.registers[f] || (this.registers[f] = new Wt()), this.registers[f]) : this.unnamedRegister;
    }
    /**@type {{(name: any): name is string}} */
    isValidRegister(f) {
      return f && (he(f, w) || C.test(f));
    }
    shiftNumericRegisters_() {
      for (var f = 9; f >= 2; f--)
        this.registers[f] = this.getRegister("" + (f - 1));
    }
  }
  class Nl {
    constructor() {
      this.historyBuffer = [], this.iterator = 0, this.initialPrefix = null;
    }
    /**
     * the input argument here acts a user entered prefix for a small time
     * until we start autocompletion in which case it is the autocompleted.
     * @arg {string} input
     * @arg {boolean} up
     */
    nextMatch(f, d) {
      var O = this.historyBuffer, g = d ? -1 : 1;
      this.initialPrefix === null && (this.initialPrefix = f);
      for (var y = this.iterator + g; d ? y >= 0 : y < O.length; y += g)
        for (var S = O[y], k = 0; k <= S.length; k++)
          if (this.initialPrefix == S.substring(0, k))
            return this.iterator = y, S;
      if (y >= O.length)
        return this.iterator = O.length, this.initialPrefix;
      if (y < 0) return f;
    }
    /** @arg {string} input */
    pushInput(f) {
      var d = this.historyBuffer.indexOf(f);
      d > -1 && this.historyBuffer.splice(d, 1), f.length && this.historyBuffer.push(f);
    }
    reset() {
      this.initialPrefix = null, this.iterator = this.historyBuffer.length;
    }
  }
  var Ti = {
    /**
     * @param {string} keys
     * @param {vimKey[]} keyMap
     * @param {InputStateInterface} inputState
     * @param {string} context
     */
    matchCommand: function(h, f, d, O) {
      var g = Yp(h, f, O, d), y = g.full[0];
      if (!y)
        return g.partial.length ? {
          type: "partial",
          expectLiteralNext: g.partial.length == 1 && g.partial[0].keys.slice(-11) == "<character>"
          // langmap literal logic
        } : { type: "none" };
      if (y.keys.slice(-11) == "<character>" || y.keys.slice(-10) == "<register>") {
        var S = Dp(h);
        if (!S || S.length > 1) return { type: "clear" };
        d.selectedCharacter = S;
      }
      return { type: "full", command: y };
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {vimKey} command
     */
    processCommand: function(h, f, d) {
      switch (f.inputState.repeatOverride = d.repeatOverride, d.type) {
        case "motion":
          this.processMotion(h, f, d);
          break;
        case "operator":
          this.processOperator(h, f, d);
          break;
        case "operatorMotion":
          this.processOperatorMotion(h, f, d);
          break;
        case "action":
          this.processAction(h, f, d);
          break;
        case "search":
          this.processSearch(h, f, d);
          break;
        case "ex":
        case "keyToEx":
          this.processEx(h, f, d);
          break;
      }
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").motionCommand|import("./types").operatorMotionCommand} command
     */
    processMotion: function(h, f, d) {
      f.inputState.motion = d.motion, f.inputState.motionArgs = /**@type {MotionArgs}*/
      kn(d.motionArgs), this.evalInput(h, f);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").operatorCommand|import("./types").operatorMotionCommand} command
     */
    processOperator: function(h, f, d) {
      var O = f.inputState;
      if (O.operator)
        if (O.operator == d.operator) {
          O.motion = "expandToLine", O.motionArgs = { linewise: !0, repeat: 1 }, this.evalInput(h, f);
          return;
        } else
          Ie(h);
      O.operator = d.operator, O.operatorArgs = kn(d.operatorArgs), d.keys.length > 1 && (O.operatorShortcut = d.keys), d.exitVisualBlock && (f.visualBlock = !1, Fi(h)), f.visualMode && this.evalInput(h, f);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").operatorMotionCommand} command
     */
    processOperatorMotion: function(h, f, d) {
      var O = f.visualMode, g = kn(d.operatorMotionArgs);
      g && O && g.visualLine && (f.visualLine = !0), this.processOperator(h, f, d), O || this.processMotion(h, f, d);
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").actionCommand} command
     */
    processAction: function(h, f, d) {
      var O = f.inputState, g = O.getRepeat(), y = !!g, S = (
        /**@type {ActionArgs}*/
        kn(d.actionArgs) || { repeat: 1 }
      );
      O.selectedCharacter && (S.selectedCharacter = O.selectedCharacter), d.operator && this.processOperator(h, f, d), d.motion && this.processMotion(h, f, d), (d.motion || d.operator) && this.evalInput(h, f), S.repeat = g || 1, S.repeatIsExplicit = y, S.registerName = O.registerName, Ie(h), f.lastMotion = null, d.isEdit && this.recordLastEdit(f, O, d), Ai[d.action](h, S, f);
    },
    /** @arg {CodeMirrorV} cm @arg {vimState} vim @arg {import("./types").searchCommand} command*/
    processSearch: function(h, f, d) {
      if (!h.getSearchCursor)
        return;
      var O = d.searchArgs.forward, g = d.searchArgs.wholeWordOnly;
      Rt(h).setReversed(!O);
      var y = O ? "/" : "?", S = Rt(h).getQuery(), k = h.getScrollInfo(), x = "";
      function $(G, U, ie) {
        D.searchHistoryController.pushInput(G), D.searchHistoryController.reset();
        try {
          Cr(h, G, U, ie);
        } catch {
          ue(h, "Invalid regex: " + G), Ie(h);
          return;
        }
        Ti.processMotion(h, f, {
          keys: "",
          type: "motion",
          motion: "findNext",
          motionArgs: { forward: !0, toJumplist: d.searchArgs.toJumplist }
        });
      }
      function P(G) {
        h.scrollTo(k.left, k.top), $(
          G,
          !0,
          !0
          /** smartCase */
        );
        var U = D.macroModeState;
        U.isRecording && $g(U, G);
      }
      function M() {
        return ne("pcre") ? "(JavaScript regexp: set pcre)" : "(Vim regexp: set nopcre)";
      }
      function R(G, U, ie) {
        var oe = Pr(G), Ze, Pe;
        oe == "<Up>" || oe == "<Down>" ? (Ze = oe == "<Up>", Pe = G.target ? G.target.selectionEnd : 0, U = D.searchHistoryController.nextMatch(U, Ze) || "", ie(U), Pe && G.target && (G.target.selectionEnd = G.target.selectionStart = Math.min(Pe, G.target.value.length))) : oe && oe != "<Left>" && oe != "<Right>" && D.searchHistoryController.reset(), x = U, Z();
      }
      function Z() {
        var G;
        try {
          G = Cr(
            h,
            x,
            !0,
            !0
            /** smartCase */
          );
        } catch {
        }
        G ? h.scrollIntoView(uh(h, !O, G), 30) : (Hi(h), h.scrollTo(k.left, k.top));
      }
      function T(G, U, ie) {
        var oe = Pr(G);
        oe == "<Esc>" || oe == "<C-c>" || oe == "<C-[>" || oe == "<BS>" && U == "" ? (D.searchHistoryController.pushInput(U), D.searchHistoryController.reset(), Cr(h, S?.source || ""), Hi(h), h.scrollTo(k.left, k.top), r.e_stop(G), Ie(h), ie(), h.focus()) : oe == "<Up>" || oe == "<Down>" ? r.e_stop(G) : oe == "<C-u>" && (r.e_stop(G), ie(""));
      }
      switch (d.searchArgs.querySrc) {
        case "prompt":
          var E = D.macroModeState;
          if (E.isPlaying) {
            let U = E.replaySearchQueries.shift();
            $(
              U || "",
              !0,
              !1
              /** smartCase */
            );
          } else
            xn(h, {
              onClose: P,
              prefix: y,
              desc: Zt(
                "span",
                {
                  $cursor: "pointer",
                  onmousedown: function(U) {
                    U.preventDefault(), J("pcre", !ne("pcre")), this.textContent = M(), Z();
                  }
                },
                M()
              ),
              onKeyUp: R,
              onKeyDown: T
            });
          break;
        case "wordUnderCursor":
          var I = Hs(h, { noSymbol: !0 }), K = !0;
          if (I || (I = Hs(h, { noSymbol: !1 }), K = !1), !I) {
            ue(h, "No word under cursor"), Ie(h);
            return;
          }
          let G = h.getLine(I.start.line).substring(
            I.start.ch,
            I.end.ch
          );
          K && g ? G = "\\b" + G + "\\b" : G = Vp(G), D.jumpList.cachedCursor = h.getCursor(), h.setCursor(I.start), $(
            G,
            !0,
            !1
            /** smartCase */
          );
          break;
      }
    },
    /**
     * @arg {CodeMirrorV} cm
     * @arg {vimState} vim
     * @arg {import("./types").exCommand | import("./types").keyToExCommand} command
     */
    processEx: function(h, f, d) {
      function O(x) {
        D.exCommandHistoryController.pushInput(x), D.exCommandHistoryController.reset(), ct.processCommand(h, x), h.state.vim && Ie(h), Hi(h);
      }
      function g(x, $, P) {
        var M = Pr(x), R, Z;
        (M == "<Esc>" || M == "<C-c>" || M == "<C-[>" || M == "<BS>" && $ == "") && (D.exCommandHistoryController.pushInput($), D.exCommandHistoryController.reset(), r.e_stop(x), Ie(h), Hi(h), P(), h.focus()), M == "<Up>" || M == "<Down>" ? (r.e_stop(x), R = M == "<Up>", Z = x.target ? x.target.selectionEnd : 0, $ = D.exCommandHistoryController.nextMatch($, R) || "", P($), Z && x.target && (x.target.selectionEnd = x.target.selectionStart = Math.min(Z, x.target.value.length))) : M == "<C-u>" ? (r.e_stop(x), P("")) : M && M != "<Left>" && M != "<Right>" && D.exCommandHistoryController.reset();
      }
      function y(x, $) {
        var P = new r.StringStream($), M = (
          /**@type{import("./types").exCommandArgs}*/
          {}
        );
        try {
          if (ct.parseInput_(h, P, M), M.commandName != "s") {
            Hi(h);
            return;
          }
          var R = ct.matchCommand_(M.commandName);
          if (!R || (ct.parseCommandArgs_(P, M, R), !M.argString)) return;
          var Z = fh(M.argString.slice(1), !0, !0);
          Z && Js(h, Z);
        } catch {
        }
      }
      if (d.type == "keyToEx")
        ct.processCommand(h, d.exArgs.input);
      else {
        var S = {
          onClose: O,
          onKeyDown: g,
          onKeyUp: y,
          prefix: ":"
        };
        if (f.visualMode)
          S.value = "'<,'>", S.selectValueOnOpen = !1;
        else {
          var k = f.inputState.getRepeat();
          k > 1 && (S.value = ".,.+" + (k - 1), S.selectValueOnOpen = !1);
        }
        xn(h, S);
      }
    },
    /**@arg {CodeMirrorV} cm   @arg {vimState} vim */
    evalInput: function(h, f) {
      var d = f.inputState, O = d.motion, g = d.motionArgs || { repeat: 1 }, y = d.operator, S = d.operatorArgs || {}, k = d.registerName, x = f.sel, $ = $e(f.visualMode ? st(h, x.head) : h.getCursor("head")), P = $e(f.visualMode ? st(h, x.anchor) : h.getCursor("anchor")), M = $e($), R = $e(P), Z, T, E;
      if (y && this.recordLastEdit(f, d), d.repeatOverride !== void 0 ? E = d.repeatOverride : E = d.getRepeat(), E > 0 && g.explicitRepeat ? g.repeatIsExplicit = !0 : (g.noRepeat || !g.explicitRepeat && E === 0) && (E = 1, g.repeatIsExplicit = !1), d.selectedCharacter && (g.selectedCharacter = S.selectedCharacter = d.selectedCharacter), g.repeat = E, Ie(h), O) {
        var I = Yt[O](h, $, g, f, d);
        if (f.lastMotion = Yt[O], !I)
          return;
        if (g.toJumplist) {
          var K = D.jumpList, G = K.cachedCursor;
          G ? (Jl(h, G, I), delete K.cachedCursor) : Jl(h, $, I);
        }
        I instanceof Array ? (T = I[0], Z = I[1]) : Z = I, Z || (Z = $e($)), f.visualMode ? (f.visualBlock && Z.ch === 1 / 0 || (Z = st(h, Z, M)), T && (T = st(h, T)), T = T || R, x.anchor = T, x.head = Z, Fi(h), ni(
          h,
          f,
          "<",
          Ae(T, Z) ? T : Z
        ), ni(
          h,
          f,
          ">",
          Ae(T, Z) ? Z : T
        )) : y || (Z = st(h, Z, M), h.setCursor(Z.line, Z.ch));
      }
      if (y) {
        if (S.lastSel) {
          T = R;
          var U = S.lastSel, ie = Math.abs(U.head.line - U.anchor.line), oe = Math.abs(U.head.ch - U.anchor.ch);
          U.visualLine ? Z = new e(R.line + ie, R.ch) : U.visualBlock ? Z = new e(R.line + ie, R.ch + oe) : U.head.line == U.anchor.line ? Z = new e(R.line, R.ch + oe) : Z = new e(R.line + ie, R.ch), f.visualMode = !0, f.visualLine = U.visualLine, f.visualBlock = U.visualBlock, x = f.sel = {
            anchor: T,
            head: Z
          }, Fi(h);
        } else f.visualMode && (S.lastSel = {
          anchor: $e(x.anchor),
          head: $e(x.head),
          visualBlock: f.visualBlock,
          visualLine: f.visualLine
        });
        var Ze, Pe, De, ce, se;
        if (f.visualMode) {
          Ze = ot(x.head, x.anchor), Pe = Oi(x.head, x.anchor), De = f.visualLine || S.linewise, ce = f.visualBlock ? "block" : De ? "line" : "char";
          var ft = t(h, Ze, Pe);
          if (se = Fs(h, {
            anchor: ft.start,
            head: ft.end
          }, ce), De) {
            var Ve = se.ranges;
            if (ce == "block")
              for (var Ne = 0; Ne < Ve.length; Ne++)
                Ve[Ne].head.ch = et(h, Ve[Ne].head.line);
            else ce == "line" && (Ve[0].head = new e(Ve[0].head.line + 1, 0));
          }
        } else {
          if (Ze = $e(T || R), Pe = $e(Z || M), Ae(Pe, Ze)) {
            var Mi = Ze;
            Ze = Pe, Pe = Mi;
          }
          De = g.linewise || S.linewise, De ? Kp(h, Ze, Pe) : g.forward && Hp(h, Ze, Pe), ce = "char";
          var ro = !g.inclusive || De, ft = t(h, Ze, Pe);
          se = Fs(h, {
            anchor: ft.start,
            head: ft.end
          }, ce, ro);
        }
        h.setSelections(se.ranges, se.primary), f.lastMotion = null, S.repeat = E, S.registerName = k, S.linewise = De;
        var no = Gs[y](
          h,
          S,
          se.ranges,
          R,
          Z
        );
        f.visualMode && zt(h, no != null), no && h.setCursor(no);
      }
    },
    /**@arg {vimState} vim  @arg {InputStateInterface} inputState, @arg {import("./types").actionCommand} [actionCommand] */
    recordLastEdit: function(h, f, d) {
      var O = D.macroModeState;
      O.isPlaying || (h.lastEditInputState = f, h.lastEditActionCommand = d, O.lastInsertModeChanges.changes = [], O.lastInsertModeChanges.expectCursorActivityForChange = !1, O.lastInsertModeChanges.visualBlock = h.visualBlock ? h.sel.head.line - h.sel.anchor.line : 0);
    }
  }, Yt = {
    moveToTopLine: function(h, f, d) {
      var O = eo(h).top + d.repeat - 1;
      return new e(O, Dt(h.getLine(O)));
    },
    moveToMiddleLine: function(h) {
      var f = eo(h), d = Math.floor((f.top + f.bottom) * 0.5);
      return new e(d, Dt(h.getLine(d)));
    },
    moveToBottomLine: function(h, f, d) {
      var O = eo(h).bottom - d.repeat + 1;
      return new e(O, Dt(h.getLine(O)));
    },
    expandToLine: function(h, f, d) {
      var O = f;
      return new e(O.line + d.repeat - 1, 1 / 0);
    },
    findNext: function(h, f, d) {
      var O = Rt(h), g = O.getQuery();
      if (g) {
        var y = !d.forward;
        y = O.isReversed() ? !y : y, Js(h, g);
        var S = uh(h, y, g, d.repeat);
        return S || ue(h, "No match found " + g + (ne("pcre") ? " (set nopcre to use Vim regexps)" : "")), S;
      }
    },
    /**
     * Find and select the next occurrence of the search query. If the cursor is currently
     * within a match, then find and select the current match. Otherwise, find the next occurrence in the
     * appropriate direction.
     *
     * This differs from `findNext` in the following ways:
     *
     * 1. Instead of only returning the "from", this returns a "from", "to" range.
     * 2. If the cursor is currently inside a search match, this selects the current match
     *    instead of the next match.
     * 3. If there is no associated operator, this will turn on visual mode.
     */
    findAndSelectNextInclusive: function(h, f, d, O, g) {
      var y = Rt(h), S = y.getQuery();
      if (S) {
        var k = !d.forward;
        k = y.isReversed() ? !k : k;
        var x = gg(h, k, S, d.repeat, O);
        if (x) {
          if (g.operator)
            return x;
          var $ = x[0], P = new e(x[1].line, x[1].ch - 1);
          if (O.visualMode) {
            (O.visualLine || O.visualBlock) && (O.visualLine = !1, O.visualBlock = !1, r.signal(h, "vim-mode-change", { mode: "visual", subMode: "" }));
            var M = O.sel.anchor;
            if (M)
              return y.isReversed() ? d.forward ? [M, $] : [M, P] : d.forward ? [M, P] : [M, $];
          } else
            O.visualMode = !0, O.visualLine = !1, O.visualBlock = !1, r.signal(h, "vim-mode-change", { mode: "visual", subMode: "" });
          return k ? [P, $] : [$, P];
        }
      }
    },
    goToMark: function(h, f, d, O) {
      var g = wn(h, O, d.selectedCharacter || "");
      return g ? d.linewise ? { line: g.line, ch: Dt(h.getLine(g.line)) } : g : null;
    },
    moveToOtherHighlightedEnd: function(h, f, d, O) {
      var g = O.sel;
      return O.visualBlock && d.sameLine ? [
        st(h, new e(g.anchor.line, g.head.ch)),
        st(h, new e(g.head.line, g.anchor.ch))
      ] : [g.head, g.anchor];
    },
    jumpToMark: function(h, f, d, O) {
      for (var g = f, y = 0; y < d.repeat; y++) {
        var S = g;
        for (var k in O.marks)
          if (_(k)) {
            var x = O.marks[k].find(), $ = d.forward ? (
              // @ts-ignore
              Ae(x, S)
            ) : Ae(S, x);
            if (!$ && !(d.linewise && x.line == S.line)) {
              var P = wt(S, g), M = d.forward ? (
                // @ts-ignore
                Ul(S, x, g)
              ) : (
                // @ts-ignore
                Ul(g, x, S)
              );
              (P || M) && (g = x);
            }
          }
      }
      return d.linewise && (g = new e(g.line, Dt(h.getLine(g.line)))), g;
    },
    moveByCharacters: function(h, f, d) {
      var O = f, g = d.repeat, y = d.forward ? O.ch + g : O.ch - g;
      return new e(O.line, y);
    },
    moveByLines: function(h, f, d, O) {
      var g = f, y = g.ch;
      switch (O.lastMotion) {
        case this.moveByLines:
        case this.moveByDisplayLines:
        case this.moveByScroll:
        case this.moveToColumn:
        case this.moveToEol:
          y = O.lastHPos;
          break;
        default:
          O.lastHPos = y;
      }
      var S = d.repeat + (d.repeatOffset || 0), k = d.forward ? g.line + S : g.line - S, x = h.firstLine(), $ = h.lastLine(), P = h.findPosV(g, d.forward ? S : -S, "line", O.lastHSPos), M = d.forward ? P.line > k : P.line < k;
      return M && (k = P.line, y = P.ch), k < x && g.line == x ? this.moveToStartOfLine(h, f, d, O) : k > $ && g.line == $ ? rh(h, f, d, O, !0) : (d.toFirstChar && (y = Dt(h.getLine(k)), O.lastHPos = y), O.lastHSPos = h.charCoords(new e(k, y), "div").left, new e(k, y));
    },
    moveByDisplayLines: function(h, f, d, O) {
      var g = f;
      switch (O.lastMotion) {
        case this.moveByDisplayLines:
        case this.moveByScroll:
        case this.moveByLines:
        case this.moveToColumn:
        case this.moveToEol:
          break;
        default:
          O.lastHSPos = h.charCoords(g, "div").left;
      }
      for (var y = Math.round(d.repeat), S = 0; S < y; S++) {
        var k = h.findPosV(g, d.forward ? 1 : -1, "line", O.lastHSPos);
        if (k.hitSide) break;
        g = k;
      }
      return g != f && (O.lastHPos = g.ch), g;
    },
    moveByPage: function(h, f, d) {
      var O = f, g = d.repeat;
      return h.findPosV(O, d.forward ? g : -g, "page");
    },
    moveByParagraph: function(h, f, d) {
      var O = d.forward ? 1 : -1;
      return nh(h, f, d.repeat, O).start;
    },
    moveBySentence: function(h, f, d) {
      var O = d.forward ? 1 : -1;
      return sg(h, f, d.repeat, O);
    },
    moveByScroll: function(h, f, d, O) {
      var g = h.getScrollInfo(), y = null, S = d.repeat;
      S || (S = g.clientHeight / (2 * h.defaultTextHeight()));
      var k = h.charCoords(f, "local");
      if (d.repeat = S, y = Yt.moveByDisplayLines(h, f, d, O), !y)
        return null;
      var x = h.charCoords(y, "local");
      return h.scrollTo(null, g.top + x.top - k.top), y;
    },
    moveByWords: function(h, f, d) {
      return ig(
        h,
        f,
        d.repeat,
        !!d.forward,
        !!d.wordEnd,
        !!d.bigWord
      );
    },
    moveTillCharacter: function(h, f, d) {
      var O = d.repeat, g = Ks(
        h,
        O,
        d.forward,
        d.selectedCharacter,
        f
      ), y = d.forward ? -1 : 1;
      return eh(y, d), g ? (g.ch += y, g) : null;
    },
    moveToCharacter: function(h, f, d) {
      var O = d.repeat;
      return eh(0, d), Ks(
        h,
        O,
        d.forward,
        d.selectedCharacter,
        f
      ) || f;
    },
    moveToSymbol: function(h, f, d) {
      var O = d.repeat;
      return d.selectedCharacter && tg(
        h,
        O,
        d.forward,
        d.selectedCharacter
      ) || f;
    },
    moveToColumn: function(h, f, d, O) {
      var g = d.repeat;
      return O.lastHPos = g - 1, O.lastHSPos = h.charCoords(f, "div").left, rg(h, g);
    },
    moveToEol: function(h, f, d, O) {
      return rh(h, f, d, O, !1);
    },
    moveToFirstNonWhiteSpaceCharacter: function(h, f) {
      var d = f;
      return new e(
        d.line,
        Dt(h.getLine(d.line))
      );
    },
    moveToMatchedSymbol: function(h, f) {
      for (var d = f, O = d.line, g = d.ch, y = h.getLine(O), S; g < y.length; g++)
        if (S = y.charAt(g), S && H(S)) {
          var k = h.getTokenTypeAt(new e(O, g + 1));
          if (k !== "string" && k !== "comment")
            break;
        }
      if (g < y.length) {
        var x = S === "<" || S === ">" ? /[(){}[\]<>]/ : /[(){}[\]]/, $ = h.findMatchingBracket(new e(O, g), { bracketRegex: x });
        return $.to;
      } else
        return d;
    },
    moveToStartOfLine: function(h, f) {
      return new e(f.line, 0);
    },
    moveToLineOrEdgeOfDocument: function(h, f, d) {
      var O = d.forward ? h.lastLine() : h.firstLine();
      return d.repeatIsExplicit && (O = d.repeat - h.getOption("firstLineNumber")), new e(
        O,
        Dt(h.getLine(O))
      );
    },
    moveToStartOfDisplayLine: function(h) {
      return h.execCommand("goLineLeft"), h.getCursor();
    },
    moveToEndOfDisplayLine: function(h) {
      h.execCommand("goLineRight");
      var f = h.getCursor();
      return f.sticky == "before" && f.ch--, f;
    },
    textObjectManipulation: function(h, f, d, O) {
      var g = {
        "(": ")",
        ")": "(",
        "{": "}",
        "}": "{",
        "[": "]",
        "]": "[",
        "<": ">",
        ">": "<"
      }, y = { "'": !0, '"': !0, "`": !0 }, S = d.selectedCharacter || "";
      S == "b" ? S = "(" : S == "B" && (S = "{");
      var k = !d.textObjectInner, x, $;
      if (g[S]) {
        if ($ = !0, x = oh(h, f, S, k), !x) {
          var P = h.getSearchCursor(new RegExp("\\" + S, "g"), f);
          P.find() && (x = oh(h, P.from(), S, k));
        }
      } else if (y[S])
        $ = !0, x = og(h, f, S, k);
      else if (S === "W" || S === "w")
        for (var M = d.repeat || 1; M-- > 0; ) {
          var R = Hs(h, {
            inclusive: k,
            innerWord: !k,
            bigWord: S === "W",
            noSymbol: S === "W",
            multiline: !0
          }, x && x.end);
          R && (x || (x = R), x.end = R.end);
        }
      else if (S === "p")
        if (x = nh(h, f, d.repeat, 0, k), d.linewise = !0, O.visualMode)
          O.visualLine || (O.visualLine = !0);
        else {
          var Z = O.inputState.operatorArgs;
          Z && (Z.linewise = !0), x.end.line--;
        }
      else if (S === "t")
        x = Jp(h, f, k);
      else if (S === "s") {
        var T = h.getLine(f.line);
        f.ch > 0 && le(T[f.ch]) && (f.ch -= 1);
        var E = sh(h, f, d.repeat, 1, k), I = sh(h, f, d.repeat, -1, k);
        j(h.getLine(I.line)[I.ch]) && j(h.getLine(E.line)[E.ch - 1]) && (I = { line: I.line, ch: I.ch + 1 }), x = { start: I, end: E };
      }
      return x ? h.state.vim.visualMode ? Up(h, x.start, x.end, $) : [x.start, x.end] : null;
    },
    repeatLastCharacterSearch: function(h, f, d) {
      var O = D.lastCharacterSearch, g = d.repeat, y = d.forward === O.forward, S = (O.increment ? 1 : 0) * (y ? -1 : 1);
      d.inclusive = !!y;
      var k = Ks(h, g, y, O.selectedCharacter, Re(f, 0, -S));
      return k ? (k.ch += S, k) : f;
    }
  };
  function jp(h, f) {
    Yt[h] = f;
  }
  function ql(h, f) {
    for (var d = [], O = 0; O < f; O++)
      d.push(h);
    return d;
  }
  var Gs = {
    change: function(h, f, d) {
      var O, g, y = h.state.vim, S = d[0].anchor, k = d[0].head;
      if (y.visualMode)
        if (f.fullLine)
          k.ch = Number.MAX_VALUE, k.line--, h.setSelection(S, k), g = h.getSelection(), h.replaceSelection(""), O = S;
        else {
          g = h.getSelection();
          var P = ql("", d.length);
          h.replaceSelections(P), O = ot(d[0].head, d[0].anchor);
        }
      else {
        g = h.getRange(S, k);
        var x = y.lastEditInputState;
        if (x?.motion == "moveByWords" && !j(g)) {
          var $ = /\s+$/.exec(g);
          $ && x.motionArgs && x.motionArgs.forward && (k = Re(k, 0, -$[0].length), g = g.slice(0, -$[0].length));
        }
        f.linewise && (S = new e(S.line, Dt(h.getLine(S.line))), k.line > S.line && (k = new e(k.line - 1, Number.MAX_VALUE))), h.replaceRange("", S, k), O = S;
      }
      D.registerController.pushText(
        f.registerName,
        "change",
        g,
        f.linewise,
        d.length > 1
      ), Ai.enterInsertMode(h, { head: O }, h.state.vim);
    },
    delete: function(h, f, d) {
      var O, g, y = h.state.vim;
      if (y.visualBlock) {
        g = h.getSelection();
        var x = ql("", d.length);
        h.replaceSelections(x), O = ot(d[0].head, d[0].anchor);
      } else {
        var S = d[0].anchor, k = d[0].head;
        f.linewise && k.line != h.firstLine() && S.line == h.lastLine() && S.line == k.line - 1 && (S.line == h.firstLine() ? S.ch = 0 : S = new e(S.line - 1, et(h, S.line - 1))), g = h.getRange(S, k), h.replaceRange("", S, k), O = S, f.linewise && (O = Yt.moveToFirstNonWhiteSpaceCharacter(h, S));
      }
      return D.registerController.pushText(
        f.registerName,
        "delete",
        g,
        f.linewise,
        y.visualBlock
      ), st(h, O);
    },
    indent: function(h, f, d) {
      var O = h.state.vim, g = O.visualMode && f.repeat || 1;
      if (O.visualBlock) {
        for (var y = h.getOption("tabSize"), S = h.getOption("indentWithTabs") ? "	" : " ".repeat(y), k, x = d.length - 1; x >= 0; x--)
          if (k = ot(d[x].anchor, d[x].head), f.indentRight)
            h.replaceRange(S.repeat(g), k, k);
          else {
            for (var $ = h.getLine(k.line), P = 0, M = 0; M < g; M++) {
              var R = $[k.ch + P];
              if (R == "	")
                P++;
              else if (R == " ") {
                P++;
                for (var Z = 1; Z < S.length && (R = $[k.ch + P], R === " "); Z++)
                  P++;
              } else
                break;
            }
            h.replaceRange("", k, Re(k, 0, P));
          }
        return k;
      } else if (h.indentMore)
        for (var M = 0; M < g; M++)
          f.indentRight ? h.indentMore() : h.indentLess();
      else {
        var T = d[0].anchor.line, E = O.visualBlock ? d[d.length - 1].anchor.line : d[0].head.line;
        f.linewise && E--;
        for (var x = T; x <= E; x++)
          for (var M = 0; M < g; M++)
            h.indentLine(x, f.indentRight);
      }
      return Yt.moveToFirstNonWhiteSpaceCharacter(h, d[0].anchor);
    },
    indentAuto: function(h, f, d) {
      return h.execCommand("indentAuto"), Yt.moveToFirstNonWhiteSpaceCharacter(h, d[0].anchor);
    },
    hardWrap: function(h, f, d, O) {
      if (h.hardWrap) {
        var g = d[0].anchor.line, y = d[0].head.line;
        f.linewise && y--;
        var S = h.hardWrap({ from: g, to: y });
        return S > g && f.linewise && S--, f.keepCursor ? O : new e(S, 0);
      }
    },
    toggleComment: function(h, f, d, O, g) {
      return h.execCommand("toggleLineComment"), g;
    },
    changeCase: function(h, f, d, O, g) {
      for (var y = h.getSelections(), S = [], k = f.toLower, x = 0; x < y.length; x++) {
        var $ = y[x], P = "";
        if (k === !0)
          P = $.toLowerCase();
        else if (k === !1)
          P = $.toUpperCase();
        else
          for (var M = 0; M < $.length; M++) {
            var R = $.charAt(M);
            P += Y(R) ? R.toLowerCase() : R.toUpperCase();
          }
        S.push(P);
      }
      return h.replaceSelections(S), f.shouldMoveCursor ? g : !h.state.vim.visualMode && f.linewise && d[0].anchor.line + 1 == d[0].head.line ? Yt.moveToFirstNonWhiteSpaceCharacter(h, O) : f.linewise ? O : ot(d[0].anchor, d[0].head);
    },
    yank: function(h, f, d, O) {
      var g = h.state.vim, y = h.getSelection(), S = g.visualMode ? ot(g.sel.anchor, g.sel.head, d[0].head, d[0].anchor) : O;
      D.registerController.pushText(
        f.registerName,
        "yank",
        y,
        f.linewise,
        g.visualBlock
      );
      var k = Math.abs(h.getCursor("end").line - h.getCursor("start").line) || 1;
      return ue(h, k + " lines yanked" + (f.registerName ? ' into "' + f.registerName : ""), !1, 1500), S;
    },
    rot13: function(h, f, d, O, g) {
      for (var y = h.getSelections(), S = [], k = 0; k < y.length; k++) {
        const x = y[k].split("").map(($) => {
          const P = $.charCodeAt(0);
          return P >= 65 && P <= 90 ? String.fromCharCode(65 + (P - 65 + 13) % 26) : P >= 97 && P <= 122 ? String.fromCharCode(97 + (P - 97 + 13) % 26) : $;
        }).join("");
        S.push(x);
      }
      return h.replaceSelections(S), f.shouldMoveCursor ? g : !h.state.vim.visualMode && f.linewise && d[0].anchor.line + 1 == d[0].head.line ? Yt.moveToFirstNonWhiteSpaceCharacter(h, O) : f.linewise ? O : ot(d[0].anchor, d[0].head);
    }
  };
  function Ip(h, f) {
    Gs[h] = f;
  }
  var Ai = {
    jumpListWalk: function(h, f, d) {
      if (!d.visualMode) {
        var O = f.repeat || 1, g = f.forward, y = D.jumpList, S = y.move(h, g ? O : -O), k = S ? S.find() : void 0;
        k = k || h.getCursor(), h.setCursor(k);
      }
    },
    scroll: function(h, f, d) {
      if (!d.visualMode) {
        var O = f.repeat || 1, g = h.defaultTextHeight(), y = h.getScrollInfo().top, S = g * O, k = f.forward ? y + S : y - S, x = $e(h.getCursor()), $ = h.charCoords(x, "local");
        if (f.forward)
          k > $.top ? (x.line += (k - $.top) / g, x.line = Math.ceil(x.line), h.setCursor(x), $ = h.charCoords(x, "local"), h.scrollTo(null, $.top)) : h.scrollTo(null, k);
        else {
          var P = k + h.getScrollInfo().clientHeight;
          P < $.bottom ? (x.line -= ($.bottom - P) / g, x.line = Math.floor(x.line), h.setCursor(x), $ = h.charCoords(x, "local"), h.scrollTo(
            null,
            $.bottom - h.getScrollInfo().clientHeight
          )) : h.scrollTo(null, k);
        }
      }
    },
    scrollToCursor: function(h, f) {
      var d = h.getCursor().line, O = h.charCoords(new e(d, 0), "local"), g = h.getScrollInfo().clientHeight, y = O.top;
      switch (f.position) {
        case "center":
          y = O.bottom - g / 2;
          break;
        case "bottom":
          var S = new e(d, h.getLine(d).length - 1), k = h.charCoords(S, "local"), x = k.bottom - y;
          y = y - g + x;
          break;
      }
      h.scrollTo(null, y);
    },
    replayMacro: function(h, f, d) {
      var O = f.selectedCharacter || "", g = f.repeat || 1, y = D.macroModeState;
      for (O == "@" ? O = y.latestRegister || "" : y.latestRegister = O; g--; )
        xg(h, d, y, O);
    },
    enterMacroRecordMode: function(h, f) {
      var d = D.macroModeState, O = f.selectedCharacter;
      D.registerController.isValidRegister(O) && d.enterMacroRecordMode(h, O);
    },
    toggleOverwrite: function(h) {
      h.state.overwrite ? (h.toggleOverwrite(!1), h.setOption("keyMap", "vim-insert"), r.signal(h, "vim-mode-change", { mode: "insert" })) : (h.toggleOverwrite(!0), h.setOption("keyMap", "vim-replace"), r.signal(h, "vim-mode-change", { mode: "replace" }));
    },
    enterInsertMode: function(h, f, d) {
      if (!h.getOption("readOnly")) {
        d.insertMode = !0, d.insertModeRepeat = f && f.repeat || 1;
        var O = f ? f.insertAt : null, g = d.sel, y = f.head || h.getCursor("head"), S = h.listSelections().length;
        if (O == "eol")
          y = new e(y.line, et(h, y.line));
        else if (O == "bol")
          y = new e(y.line, 0);
        else if (O == "charAfter") {
          var k = t(h, y, Re(y, 0, 1));
          y = k.end;
        } else if (O == "firstNonBlank") {
          var k = t(h, y, Yt.moveToFirstNonWhiteSpaceCharacter(h, y));
          y = k.end;
        } else if (O == "startOfSelectedArea") {
          if (!d.visualMode)
            return;
          d.visualBlock ? (y = new e(
            Math.min(g.head.line, g.anchor.line),
            Math.min(g.head.ch, g.anchor.ch)
          ), S = Math.abs(g.head.line - g.anchor.line) + 1) : g.head.line < g.anchor.line ? y = g.head : y = new e(g.anchor.line, 0);
        } else if (O == "endOfSelectedArea") {
          if (!d.visualMode)
            return;
          d.visualBlock ? (y = new e(
            Math.min(g.head.line, g.anchor.line),
            Math.max(g.head.ch, g.anchor.ch) + 1
          ), S = Math.abs(g.head.line - g.anchor.line) + 1) : g.head.line >= g.anchor.line ? y = Re(g.head, 0, 1) : y = new e(g.anchor.line, 0);
        } else if (O == "inplace") {
          if (d.visualMode)
            return;
        } else O == "lastEdit" && (y = dh(h) || y);
        h.setOption("disableInput", !1), f && f.replace ? (h.toggleOverwrite(!0), h.setOption("keyMap", "vim-replace"), r.signal(h, "vim-mode-change", { mode: "replace" })) : (h.toggleOverwrite(!1), h.setOption("keyMap", "vim-insert"), r.signal(h, "vim-mode-change", { mode: "insert" })), D.macroModeState.isPlaying || (h.on("change", ph), d.insertEnd && d.insertEnd.clear(), d.insertEnd = h.setBookmark(y, { insertLeft: !0 }), r.on(h.getInputField(), "keydown", yh)), d.visualMode && zt(h), Hl(h, y, S);
      }
    },
    toggleVisualMode: function(h, f, d) {
      var O = f.repeat, g = h.getCursor(), y;
      if (d.visualMode)
        d.visualLine != !!f.linewise || d.visualBlock != !!f.blockwise ? (d.visualLine = !!f.linewise, d.visualBlock = !!f.blockwise, r.signal(h, "vim-mode-change", { mode: "visual", subMode: d.visualLine ? "linewise" : d.visualBlock ? "blockwise" : "" }), Fi(h)) : zt(h);
      else {
        d.visualMode = !0, d.visualLine = !!f.linewise, d.visualBlock = !!f.blockwise, y = st(
          h,
          new e(g.line, g.ch + O - 1)
        );
        var S = t(h, g, y);
        d.sel = {
          anchor: S.start,
          head: S.end
        }, r.signal(h, "vim-mode-change", { mode: "visual", subMode: d.visualLine ? "linewise" : d.visualBlock ? "blockwise" : "" }), Fi(h), ni(h, d, "<", ot(g, y)), ni(h, d, ">", Oi(g, y));
      }
    },
    reselectLastSelection: function(h, f, d) {
      var O = d.lastSelection;
      if (d.visualMode && Kl(h, d), O) {
        var g = O.anchorMark.find(), y = O.headMark.find();
        if (!g || !y)
          return;
        d.sel = {
          anchor: g,
          head: y
        }, d.visualMode = !0, d.visualLine = O.visualLine, d.visualBlock = O.visualBlock, Fi(h), ni(h, d, "<", ot(g, y)), ni(h, d, ">", Oi(g, y)), r.signal(h, "vim-mode-change", {
          mode: "visual",
          subMode: d.visualLine ? "linewise" : d.visualBlock ? "blockwise" : ""
        });
      }
    },
    joinLines: function(h, f, d) {
      var O, g;
      if (d.visualMode) {
        if (O = h.getCursor("anchor"), g = h.getCursor("head"), Ae(g, O)) {
          var y = g;
          g = O, O = y;
        }
        g.ch = et(h, g.line) - 1;
      } else {
        var S = Math.max(f.repeat, 2);
        O = h.getCursor(), g = st(h, new e(
          O.line + S - 1,
          1 / 0
        ));
      }
      for (var k = 0, x = O.line; x < g.line; x++) {
        k = et(h, O.line);
        var $ = "", P = 0;
        if (!f.keepSpaces) {
          var M = h.getLine(O.line + 1);
          P = M.search(/\S/), P == -1 ? P = M.length : $ = " ";
        }
        h.replaceRange(
          $,
          new e(O.line, k),
          new e(O.line + 1, P)
        );
      }
      var R = st(h, new e(O.line, k));
      d.visualMode && zt(h, !1), h.setCursor(R);
    },
    newLineAndEnterInsertMode: function(h, f, d) {
      d.insertMode = !0;
      var O = $e(h.getCursor());
      if (O.line === h.firstLine() && !f.after)
        h.replaceRange(`
`, new e(h.firstLine(), 0)), h.setCursor(h.firstLine(), 0);
      else {
        O.line = f.after ? O.line : O.line - 1, O.ch = et(h, O.line), h.setCursor(O);
        var g = r.commands.newlineAndIndentContinueComment || r.commands.newlineAndIndent;
        g(h);
      }
      this.enterInsertMode(h, { repeat: f.repeat }, d);
    },
    paste: function(h, f, d) {
      var O = D.registerController.getRegister(
        f.registerName
      );
      if (f.registerName === "+")
        navigator.clipboard.readText().then((y) => {
          this.continuePaste(h, f, d, y, O);
        });
      else {
        var g = O.toString();
        this.continuePaste(h, f, d, g, O);
      }
    },
    continuePaste: function(h, f, d, O, g) {
      var y = $e(h.getCursor());
      if (O) {
        if (f.matchIndent) {
          var S = h.getOption("tabSize"), k = function(Ve) {
            var Ne = Ve.split("	").length - 1, Mi = Ve.split(" ").length - 1;
            return Ne * S + Mi * 1;
          }, x = h.getLine(h.getCursor().line), $ = k(x.match(/^\s*/)[0]), P = O.replace(/\n$/, ""), M = O !== P, R = k(O.match(/^\s*/)[0]), O = P.replace(/^\s*/gm, function(Ve) {
            var Ne = $ + (k(Ve) - R);
            if (Ne < 0)
              return "";
            if (h.getOption("indentWithTabs")) {
              var Mi = Math.floor(Ne / S);
              return Array(Mi + 1).join("	");
            } else
              return Array(Ne + 1).join(" ");
          });
          O += M ? `
` : "";
        }
        f.repeat > 1 && (O = Array(f.repeat + 1).join(O));
        var Z = f.linewise == null ? g.linewise : f.linewise, T = g.blockwise, E = T ? O.split(`
`) : void 0;
        if (E) {
          Z && E.pop();
          for (var I = 0; I < E.length; I++)
            E[I] = E[I] == "" ? " " : E[I];
          y.ch += f.after ? 1 : 0, y.ch = Math.min(et(h, y.line), y.ch);
        } else Z ? d.visualMode ? O = d.visualLine ? O.slice(0, -1) : `
` + O.slice(0, O.length - 1) + `
` : f.after ? (O = `
` + O.slice(0, O.length - 1), y.ch = et(h, y.line)) : y.ch = 0 : y.ch += f.after ? 1 : 0;
        var K;
        if (d.visualMode) {
          d.lastPastedText = O;
          var G, U = Gp(h), ie = U[0], oe = U[1], Ze = h.getSelection(), Pe = h.listSelections(), De = new Array(Pe.length).join("1").split("1");
          d.lastSelection && (G = d.lastSelection.headMark.find()), D.registerController.unnamedRegister.setText(Ze), T ? (h.replaceSelections(De), oe = new e(ie.line + O.length - 1, ie.ch), h.setCursor(ie), Fl(h, oe), h.replaceSelections(O), K = ie) : d.visualBlock ? (h.replaceSelections(De), h.setCursor(ie), h.replaceRange(O, ie, ie), K = ie) : (h.replaceRange(O, ie, oe), K = h.posFromIndex(h.indexFromPos(ie) + O.length - 1)), G && (d.lastSelection.headMark = h.setBookmark(G)), Z && (K.ch = 0);
        } else if (T && E) {
          h.setCursor(y);
          for (var I = 0; I < E.length; I++) {
            var ce = y.line + I;
            ce > h.lastLine() && h.replaceRange(`
`, new e(ce, 0));
            var se = et(h, ce);
            se < y.ch && Np(h, ce, y.ch);
          }
          h.setCursor(y), Fl(h, new e(y.line + E.length - 1, y.ch)), h.replaceSelections(E), K = y;
        } else if (h.replaceRange(O, y), Z) {
          var ce = f.after ? y.line + 1 : y.line;
          K = new e(ce, Dt(h.getLine(ce)));
        } else
          K = $e(y), /\n/.test(O) || (K.ch += O.length - (f.after ? 1 : 0));
        d.visualMode && zt(h, !1), h.setCursor(K);
      }
    },
    undo: function(h, f) {
      h.operation(function() {
        Gl(h, r.commands.undo, f.repeat)(), h.setCursor(st(h, h.getCursor("start")));
      });
    },
    redo: function(h, f) {
      Gl(h, r.commands.redo, f.repeat)();
    },
    setRegister: function(h, f, d) {
      d.inputState.registerName = f.selectedCharacter;
    },
    insertRegister: function(h, f, d) {
      var O = f.selectedCharacter, g = D.registerController.getRegister(O), y = g && g.toString();
      y && h.replaceSelection(y);
    },
    oneNormalCommand: function(h, f, d) {
      pi(h, !0), d.insertModeReturn = !0, r.on(h, "vim-command-done", function O() {
        d.visualMode || (d.insertModeReturn && (d.insertModeReturn = !1, d.insertMode || Ai.enterInsertMode(h, {}, d)), r.off(h, "vim-command-done", O));
      });
    },
    setMark: function(h, f, d) {
      var O = f.selectedCharacter;
      O && ni(h, d, O, h.getCursor());
    },
    replace: function(h, f, d) {
      var O = f.selectedCharacter || "", g = h.getCursor(), y, S, k = h.listSelections();
      if (d.visualMode)
        g = h.getCursor("start"), S = h.getCursor("end");
      else {
        var x = h.getLine(g.line);
        y = g.ch + f.repeat, y > x.length && (y = x.length), S = new e(g.line, y);
      }
      var $ = t(h, g, S);
      if (g = $.start, S = $.end, O == `
`)
        d.visualMode || h.replaceRange("", g, S), (r.commands.newlineAndIndentContinueComment || r.commands.newlineAndIndent)(h);
      else {
        var P = h.getRange(g, S);
        if (P = P.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, O), P = P.replace(/[^\n]/g, O), d.visualBlock) {
          var M = new Array(h.getOption("tabSize") + 1).join(" ");
          P = h.getSelection(), P = P.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, O);
          var R = P.replace(/\t/g, M).replace(/[^\n]/g, O).split(`
`);
          h.replaceSelections(R);
        } else
          h.replaceRange(P, g, S);
        d.visualMode ? (g = Ae(k[0].anchor, k[0].head) ? k[0].anchor : k[0].head, h.setCursor(g), zt(h, !1)) : h.setCursor(Re(S, 0, -1));
      }
    },
    incrementNumberToken: function(h, f) {
      for (var d = h.getCursor(), O = h.getLine(d.line), g = /(-?)(?:(0x)([\da-f]+)|(0b|0|)(\d+))/gi, y, S, k, x; (y = g.exec(O)) !== null && (S = y.index, k = S + y[0].length, !(d.ch < k)); )
        ;
      if (!(!f.backtrack && k <= d.ch)) {
        if (y) {
          var $ = y[2] || y[4], P = y[3] || y[5], M = f.increase ? 1 : -1, R = { "0b": 2, 0: 8, "": 10, "0x": 16 }[$.toLowerCase()], Z = parseInt(y[1] + P, R) + M * f.repeat;
          x = Z.toString(R);
          var T = $ ? new Array(P.length - x.length + 1 + y[1].length).join("0") : "";
          x.charAt(0) === "-" ? x = "-" + $ + T + x.substr(1) : x = $ + T + x;
          var E = new e(d.line, S), I = new e(d.line, k);
          h.replaceRange(x, E, I);
        } else
          return;
        h.setCursor(new e(d.line, S + x.length - 1));
      }
    },
    repeatLastEdit: function(h, f, d) {
      var O = d.lastEditInputState;
      if (O) {
        var g = f.repeat;
        g && f.repeatIsExplicit ? O.repeatOverride = g : g = O.repeatOverride || g, vh(
          h,
          d,
          g,
          !1
          /** repeatForInsert */
        );
      }
    },
    indent: function(h, f) {
      h.indentLine(h.getCursor().line, f.indentRight);
    },
    exitInsertMode: function(h, f) {
      pi(h);
    }
  };
  function Wp(h, f) {
    Ai[h] = f;
  }
  function st(h, f, d) {
    var O = h.state.vim, g = O.insertMode || O.visualMode, y = Math.min(Math.max(h.firstLine(), f.line), h.lastLine()), S = h.getLine(y), k = S.length - 1 + +!!g, x = Math.min(Math.max(0, f.ch), k), $ = S.charCodeAt(x);
    if (56320 <= $ && $ <= 57343) {
      var P = 1;
      d && d.line == y && d.ch > x && (P = -1), x += P, x > k && (x -= 2);
    }
    return new e(y, x);
  }
  function kn(h) {
    var f = (
      /**@type{typeof args}*/
      {}
    );
    for (var d in h)
      Object.prototype.hasOwnProperty.call(h, d) && (f[d] = h[d]);
    return (
      /**@type{typeof args}*/
      f
    );
  }
  function Re(h, f, d) {
    return typeof f == "object" && (d = f.ch, f = f.line), new e(h.line + f, h.ch + d);
  }
  function Yp(h, f, d, O) {
    O.operator && (d = "operatorPending");
    for (var g, y = [], S = [], k = xt ? f.length - s : 0, x = k; x < f.length; x++) {
      var $ = f[x];
      d == "insert" && $.context != "insert" || $.context && $.context != d || O.operator && $.type == "action" || !(g = zp(h, $.keys)) || (g == "partial" && y.push($), g == "full" && S.push($));
    }
    return {
      partial: y,
      full: S
    };
  }
  function zp(h, f) {
    const d = f.slice(-11) == "<character>", O = f.slice(-10) == "<register>";
    if (d || O) {
      var g = f.length - (d ? 11 : 10), y = h.slice(0, g), S = f.slice(0, g);
      return y == S && h.length > g ? "full" : S.indexOf(y) == 0 ? "partial" : !1;
    } else
      return h == f ? "full" : f.indexOf(h) == 0 ? "partial" : !1;
  }
  function Dp(h) {
    var f = /^.*(<[^>]+>)$/.exec(h), d = f ? f[1] : h.slice(-1);
    if (d.length > 1)
      switch (d) {
        case "<CR>":
        case "<S-CR>":
          d = `
`;
          break;
        case "<Space>":
        case "<S-Space>":
          d = " ";
          break;
        default:
          d = "";
          break;
      }
    return d;
  }
  function Gl(h, f, d) {
    return function() {
      for (var O = 0; O < d; O++)
        f(h);
    };
  }
  function $e(h) {
    return new e(h.line, h.ch);
  }
  function wt(h, f) {
    return h.ch == f.ch && h.line == f.line;
  }
  function Ae(h, f) {
    return h.line < f.line || h.line == f.line && h.ch < f.ch;
  }
  function ot(h, f) {
    return arguments.length > 2 && (f = ot.apply(void 0, Array.prototype.slice.call(arguments, 1))), Ae(h, f) ? h : f;
  }
  function Oi(h, f) {
    return arguments.length > 2 && (f = Oi.apply(void 0, Array.prototype.slice.call(arguments, 1))), Ae(h, f) ? f : h;
  }
  function Ul(h, f, d) {
    var O = Ae(h, f), g = Ae(f, d);
    return O && g;
  }
  function et(h, f) {
    return h.getLine(f).length;
  }
  function Us(h) {
    return h.trim ? h.trim() : h.replace(/^\s+|\s+$/g, "");
  }
  function Vp(h) {
    return h.replace(/([.?*+$\[\]\/\\(){}|\-])/g, "\\$1");
  }
  function Np(h, f, d) {
    var O = et(h, f), g = new Array(d - O + 1).join(" ");
    h.setCursor(new e(f, O)), h.replaceRange(g, h.getCursor());
  }
  function Fl(h, f) {
    var d = [], O = h.listSelections(), g = $e(h.clipPos(f)), y = !wt(f, g), S = h.getCursor("head"), k = qp(O, S), x = wt(O[k].head, O[k].anchor), $ = O.length - 1, P = $ - k > k ? $ : 0, M = O[P].anchor, R = Math.min(M.line, g.line), Z = Math.max(M.line, g.line), T = M.ch, E = g.ch, I = O[P].head.ch - T, K = E - T;
    I > 0 && K <= 0 ? (T++, y || E--) : I < 0 && K >= 0 ? (T--, x || E++) : I < 0 && K == -1 && (T--, E++);
    for (var G = R; G <= Z; G++) {
      var U = { anchor: new e(G, T), head: new e(G, E) };
      d.push(U);
    }
    return h.setSelections(d), f.ch = E, M.ch = T, M;
  }
  function Hl(h, f, d) {
    for (var O = [], g = 0; g < d; g++) {
      var y = Re(f, g, 0);
      O.push({ anchor: y, head: y });
    }
    h.setSelections(O, 0);
  }
  function qp(h, f, d) {
    for (var O = 0; O < h.length; O++) {
      var g = wt(h[O].anchor, f), y = wt(h[O].head, f);
      if (g || y)
        return O;
    }
    return -1;
  }
  function Gp(h, f) {
    var d = h.listSelections(), O = d[0], g = d[d.length - 1], y = Ae(O.anchor, O.head) ? O.anchor : O.head, S = Ae(g.anchor, g.head) ? g.head : g.anchor;
    return [y, S];
  }
  function Kl(h, f) {
    var d = f.sel.anchor, O = f.sel.head;
    f.lastPastedText && (O = h.posFromIndex(h.indexFromPos(d) + f.lastPastedText.length), f.lastPastedText = void 0), f.lastSelection = {
      anchorMark: h.setBookmark(d),
      headMark: h.setBookmark(O),
      anchor: $e(d),
      head: $e(O),
      visualMode: f.visualMode,
      visualLine: f.visualLine,
      visualBlock: f.visualBlock
    };
  }
  function Up(h, f, d, O) {
    var g = h.state.vim.sel, y = O ? f : g.head, S = O ? f : g.anchor, k;
    return Ae(d, f) && (k = d, d = f, f = k), Ae(y, S) ? (y = ot(f, y), S = Oi(S, d)) : (S = ot(f, S), y = Oi(y, d), y = Re(y, 0, -1), y.ch == -1 && y.line != h.firstLine() && (y = new e(y.line - 1, et(h, y.line - 1)))), [S, y];
  }
  function Fi(h, f, d) {
    var O = h.state.vim;
    f = f || O.sel, d || (d = O.visualLine ? "line" : O.visualBlock ? "block" : "char");
    var g = Fs(h, f, d);
    h.setSelections(g.ranges, g.primary);
  }
  function Fs(h, f, d, O) {
    var g = $e(f.head), y = $e(f.anchor);
    if (d == "char") {
      var S = !O && !Ae(f.head, f.anchor) ? 1 : 0, k = Ae(f.head, f.anchor) ? 1 : 0;
      return g = Re(f.head, 0, S), y = Re(f.anchor, 0, k), {
        ranges: [{ anchor: y, head: g }],
        primary: 0
      };
    } else if (d == "line") {
      if (Ae(f.head, f.anchor))
        g.ch = 0, y.ch = et(h, y.line);
      else {
        y.ch = 0;
        var x = h.lastLine();
        g.line > x && (g.line = x), g.ch = et(h, g.line);
      }
      return {
        ranges: [{ anchor: y, head: g }],
        primary: 0
      };
    } else if (d == "block") {
      var $ = Math.min(y.line, g.line), P = y.ch, M = Math.max(y.line, g.line), R = g.ch;
      P < R ? R += 1 : P += 1;
      for (var Z = M - $ + 1, T = g.line == $ ? 0 : Z - 1, E = [], I = 0; I < Z; I++)
        E.push({
          anchor: new e($ + I, P),
          head: new e($ + I, R)
        });
      return {
        ranges: E,
        primary: T
      };
    }
    throw "never happens";
  }
  function Fp(h) {
    var f = h.getCursor("head");
    return h.getSelection().length == 1 && (f = ot(f, h.getCursor("anchor"))), f;
  }
  function zt(h, f) {
    var d = h.state.vim;
    f !== !1 && h.setCursor(st(h, d.sel.head)), Kl(h, d), d.visualMode = !1, d.visualLine = !1, d.visualBlock = !1, d.insertMode || r.signal(h, "vim-mode-change", { mode: "normal" });
  }
  function Hp(h, f, d) {
    var O = h.getRange(f, d);
    if (/\n\s*$/.test(O)) {
      var g = O.split(`
`);
      g.pop();
      for (var y = g.pop(); g.length > 0 && y && j(y); y = g.pop())
        d.line--, d.ch = 0;
      y ? (d.line--, d.ch = et(h, d.line)) : d.ch = 0;
    }
  }
  function Kp(h, f, d) {
    f.ch = 0, d.ch = 0, d.line++;
  }
  function Dt(h) {
    if (!h)
      return 0;
    var f = h.search(/\S/);
    return f == -1 ? h.length : f;
  }
  function Hs(h, { inclusive: f, innerWord: d, bigWord: O, noSymbol: g, multiline: y }, S) {
    var k = S || Fp(h), x = h.getLine(k.line), $ = x, P = k.line, M = P, R = k.ch, Z, T = g ? m[0] : v[0];
    if (d && /\s/.test(x.charAt(R)))
      T = function(ie) {
        return /\s/.test(ie);
      };
    else {
      for (; !T(x.charAt(R)); )
        if (R++, R >= x.length) {
          if (!y) return null;
          R--, Z = ih(h, k, !0, O, !0);
          break;
        }
      O ? T = v[0] : (T = m[0], T(x.charAt(R)) || (T = m[1]));
    }
    for (var E = R, I = R; T(x.charAt(I)) && I >= 0; )
      I--;
    if (I++, Z)
      E = Z.to, M = Z.line, $ = h.getLine(M), !$ && E == 0 && E++;
    else
      for (; T(x.charAt(E)) && E < x.length; )
        E++;
    if (f) {
      var K = E, G = k.ch <= I && /\s/.test(x.charAt(k.ch));
      if (!G)
        for (; /\s/.test($.charAt(E)) && E < $.length; )
          E++;
      if (K == E || G) {
        for (var U = I; /\s/.test(x.charAt(I - 1)) && I > 0; )
          I--;
        !I && !G && (I = U);
      }
    }
    return { start: new e(P, I), end: new e(M, E) };
  }
  function Jp(h, f, d) {
    var O = f;
    if (!r.findMatchingTag || !r.findEnclosingTag)
      return { start: O, end: O };
    var g = r.findMatchingTag(h, f) || r.findEnclosingTag(h, f);
    return !g || !g.open || !g.close ? { start: O, end: O } : d ? { start: g.open.from, end: g.close.to } : { start: g.open.to, end: g.close.from };
  }
  function Jl(h, f, d) {
    wt(f, d) || D.jumpList.add(h, f, d);
  }
  function eh(h, f) {
    D.lastCharacterSearch.increment = h, D.lastCharacterSearch.forward = f.forward, D.lastCharacterSearch.selectedCharacter = f.selectedCharacter;
  }
  var eg = {
    "(": "bracket",
    ")": "bracket",
    "{": "bracket",
    "}": "bracket",
    "[": "section",
    "]": "section",
    "*": "comment",
    "/": "comment",
    m: "method",
    M: "method",
    "#": "preprocess"
  }, th = {
    bracket: {
      isComplete: function(h) {
        if (h.nextCh === h.symb) {
          if (h.depth++, h.depth >= 1) return !0;
        } else h.nextCh === h.reverseSymb && h.depth--;
        return !1;
      }
    },
    section: {
      init: function(h) {
        h.curMoveThrough = !0, h.symb = (h.forward ? "]" : "[") === h.symb ? "{" : "}";
      },
      isComplete: function(h) {
        return h.index === 0 && h.nextCh === h.symb;
      }
    },
    comment: {
      isComplete: function(h) {
        var f = h.lastCh === "*" && h.nextCh === "/";
        return h.lastCh = h.nextCh, f;
      }
    },
    // TODO: The original Vim implementation only operates on level 1 and 2.
    // The current implementation doesn't check for code block level and
    // therefore it operates on any levels.
    method: {
      init: function(h) {
        h.symb = h.symb === "m" ? "{" : "}", h.reverseSymb = h.symb === "{" ? "}" : "{";
      },
      isComplete: function(h) {
        return h.nextCh === h.symb;
      }
    },
    preprocess: {
      init: function(h) {
        h.index = 0;
      },
      isComplete: function(h) {
        if (h.nextCh === "#") {
          var f = h.lineText.match(/^#(\w+)/)?.[1];
          if (f === "endif") {
            if (h.forward && h.depth === 0)
              return !0;
            h.depth++;
          } else if (f === "if") {
            if (!h.forward && h.depth === 0)
              return !0;
            h.depth--;
          }
          if (f === "else" && h.depth === 0) return !0;
        }
        return !1;
      }
    }
  };
  function tg(h, f, d, O) {
    var g = $e(h.getCursor()), y = d ? 1 : -1, S = d ? h.lineCount() : -1, k = g.ch, x = g.line, $ = h.getLine(x), P = {
      lineText: $,
      nextCh: $.charAt(k),
      lastCh: null,
      index: k,
      symb: O,
      reverseSymb: (d ? { ")": "(", "}": "{" } : { "(": ")", "{": "}" })[O],
      forward: d,
      depth: 0,
      curMoveThrough: !1
    }, M = eg[O];
    if (!M) return g;
    var R = th[M].init, Z = th[M].isComplete;
    for (R && R(P); x !== S && f; ) {
      if (P.index += y, P.nextCh = P.lineText.charAt(P.index), !P.nextCh) {
        if (x += y, P.lineText = h.getLine(x) || "", y > 0)
          P.index = 0;
        else {
          var T = P.lineText.length;
          P.index = T > 0 ? T - 1 : 0;
        }
        P.nextCh = P.lineText.charAt(P.index);
      }
      Z(P) && (g.line = x, g.ch = P.index, f--);
    }
    return P.nextCh || P.curMoveThrough ? new e(x, P.index) : g;
  }
  function ih(h, f, d, O, g) {
    var y = f.line, S = f.ch, k = h.getLine(y), x = d ? 1 : -1, $ = O ? v : m;
    if (g && k == "") {
      if (y += x, k = h.getLine(y), !X(h, y))
        return null;
      S = d ? 0 : k.length;
    }
    for (; ; ) {
      if (g && k == "")
        return { from: 0, to: 0, line: y };
      for (var P = x > 0 ? k.length : -1, M = P, R = P; S != P; ) {
        for (var Z = !1, T = 0; T < $.length && !Z; ++T)
          if ($[T](k.charAt(S))) {
            for (M = S; S != P && $[T](k.charAt(S)); )
              S += x;
            if (R = S, Z = M != R, M == f.ch && y == f.line && R == M + x)
              continue;
            return {
              from: Math.min(M, R + 1),
              to: Math.max(M, R),
              line: y
            };
          }
        Z || (S += x);
      }
      if (y += x, !X(h, y))
        return null;
      k = h.getLine(y), S = x > 0 ? 0 : k.length;
    }
  }
  function ig(h, f, d, O, g, y) {
    var S = $e(f), k = [];
    (O && !g || !O && g) && d++;
    for (var x = !(O && g), $ = 0; $ < d; $++) {
      var P = ih(h, f, O, y, x);
      if (!P) {
        var M = et(h, h.lastLine());
        k.push(O ? { line: h.lastLine(), from: M, to: M } : { line: 0, from: 0, to: 0 });
        break;
      }
      k.push(P), f = new e(P.line, O ? P.to - 1 : P.from);
    }
    var R = k.length != d, Z = k[0], T = k.pop();
    return O && !g ? (!R && (Z.from != S.ch || Z.line != S.line) && (T = k.pop()), T && new e(T.line, T.from)) : O && g ? T && new e(T.line, T.to - 1) : !O && g ? (!R && (Z.to != S.ch || Z.line != S.line) && (T = k.pop()), T && new e(T.line, T.to)) : T && new e(T.line, T.from);
  }
  function rh(h, f, d, O, g) {
    var y = f, S = new e(y.line + d.repeat - 1, 1 / 0), k = h.clipPos(S);
    return k.ch--, g || (O.lastHPos = 1 / 0, O.lastHSPos = h.charCoords(k, "div").left), S;
  }
  function Ks(h, f, d, O, g) {
    if (O) {
      for (var y = g || h.getCursor(), S = y.ch, k, x = 0; x < f; x++) {
        var $ = h.getLine(y.line);
        if (k = ng(S, $, O, d), k == -1)
          return;
        S = k;
      }
      if (k != null)
        return new e(h.getCursor().line, k);
    }
  }
  function rg(h, f) {
    var d = h.getCursor().line;
    return st(h, new e(d, f - 1));
  }
  function ni(h, f, d, O) {
    !he(d, b) && !C.test(d) || (f.marks[d] && f.marks[d].clear(), f.marks[d] = h.setBookmark(O));
  }
  function ng(h, f, d, O, g) {
    var y;
    return O ? y = f.indexOf(d, h + 1) : y = f.lastIndexOf(d, h - 1), y;
  }
  function nh(h, f, d, O, g) {
    var y = f.line, S = h.firstLine(), k = h.lastLine(), x, $, P = y;
    function M(I) {
      return !h.getLine(I);
    }
    function R(I, K, G) {
      return G ? M(I) != M(I + K) : !M(I) && M(I + K);
    }
    if (O) {
      for (; S <= P && P <= k && d > 0; )
        R(P, O) && d--, P += O;
      return { start: new e(P, 0), end: f };
    }
    var Z = h.state.vim;
    if (Z.visualLine && R(y, 1, !0)) {
      var T = Z.sel.anchor;
      R(T.line, -1, !0) && (!g || T.line != y) && (y += 1);
    }
    var E = M(y);
    for (P = y; P <= k && d; P++)
      R(P, 1, !0) && (!g || M(P) != E) && d--;
    for ($ = new e(P, 0), P > k && !E ? E = !0 : g = !1, P = y; P > S && !((!g || M(P) == E || P == y) && R(P, -1, !0)); P--)
      ;
    return x = new e(P, 0), { start: x, end: $ };
  }
  function sh(h, f, d, O, g) {
    function y($) {
      $.line !== null && ($.pos + $.dir < 0 || $.pos + $.dir >= $.line.length ? $.line = null : $.pos += $.dir);
    }
    function S($, P, M, R) {
      var Z = $.getLine(P), T = {
        line: Z,
        ln: P,
        pos: M,
        dir: R
      };
      if (T.line === "")
        return { ln: T.ln, pos: T.pos };
      var E = T.pos;
      for (y(T); T.line !== null; ) {
        if (E = T.pos, le(T.line[T.pos]))
          if (g) {
            for (y(T); T.line !== null && j(T.line[T.pos]); )
              E = T.pos, y(T);
            return { ln: T.ln, pos: E + 1 };
          } else
            return { ln: T.ln, pos: T.pos + 1 };
        y(T);
      }
      return { ln: T.ln, pos: E + 1 };
    }
    function k($, P, M, R) {
      var Z = $.getLine(P), T = {
        line: Z,
        ln: P,
        pos: M,
        dir: R
      };
      if (T.line === "")
        return { ln: T.ln, pos: T.pos };
      var E = T.pos;
      for (y(T); T.line !== null; ) {
        if (!j(T.line[T.pos]) && !le(T.line[T.pos]))
          E = T.pos;
        else if (le(T.line[T.pos]))
          return g ? j(T.line[T.pos + 1]) ? { ln: T.ln, pos: T.pos + 1 } : { ln: T.ln, pos: E } : { ln: T.ln, pos: E };
        y(T);
      }
      return T.line = Z, g && j(T.line[T.pos]) ? { ln: T.ln, pos: T.pos } : { ln: T.ln, pos: E };
    }
    for (var x = {
      ln: f.line,
      pos: f.ch
    }; d > 0; )
      O < 0 ? x = k(h, x.ln, x.pos, O) : x = S(h, x.ln, x.pos, O), d--;
    return new e(x.ln, x.pos);
  }
  function sg(h, f, d, O) {
    function g(x, $) {
      if ($.line !== null)
        if ($.pos + $.dir < 0 || $.pos + $.dir >= $.line.length) {
          if ($.ln += $.dir, !X(x, $.ln)) {
            $.line = null;
            return;
          }
          $.line = x.getLine($.ln), $.pos = $.dir > 0 ? 0 : $.line.length - 1;
        } else
          $.pos += $.dir;
    }
    function y(x, $, P, M) {
      var I = x.getLine($), R = I === "", Z = {
        line: I,
        ln: $,
        pos: P,
        dir: M
      }, T = {
        ln: Z.ln,
        pos: Z.pos
      }, E = Z.line === "";
      for (g(x, Z); Z.line !== null; ) {
        if (T.ln = Z.ln, T.pos = Z.pos, Z.line === "" && !E)
          return { ln: Z.ln, pos: Z.pos };
        if (R && Z.line !== "" && !j(Z.line[Z.pos]))
          return { ln: Z.ln, pos: Z.pos };
        le(Z.line[Z.pos]) && !R && (Z.pos === Z.line.length - 1 || j(Z.line[Z.pos + 1])) && (R = !0), g(x, Z);
      }
      var I = x.getLine(T.ln);
      T.pos = 0;
      for (var K = I.length - 1; K >= 0; --K)
        if (!j(I[K])) {
          T.pos = K;
          break;
        }
      return T;
    }
    function S(x, $, P, M) {
      var I = x.getLine($), R = {
        line: I,
        ln: $,
        pos: P,
        dir: M
      }, Z = R.ln, T = null, E = R.line === "";
      for (g(x, R); R.line !== null; ) {
        if (R.line === "" && !E)
          return T !== null ? { ln: Z, pos: T } : { ln: R.ln, pos: R.pos };
        if (le(R.line[R.pos]) && T !== null && !(R.ln === Z && R.pos + 1 === T))
          return { ln: Z, pos: T };
        R.line !== "" && !j(R.line[R.pos]) && (E = !1, Z = R.ln, T = R.pos), g(x, R);
      }
      var I = x.getLine(Z);
      T = 0;
      for (var K = 0; K < I.length; ++K)
        if (!j(I[K])) {
          T = K;
          break;
        }
      return { ln: Z, pos: T };
    }
    for (var k = {
      ln: f.line,
      pos: f.ch
    }; d > 0; )
      O < 0 ? k = S(h, k.ln, k.pos, O) : k = y(h, k.ln, k.pos, O), d--;
    return new e(k.ln, k.pos);
  }
  function oh(h, f, d, O) {
    var g = f, y = {
      "(": /[()]/,
      ")": /[()]/,
      "[": /[[\]]/,
      "]": /[[\]]/,
      "{": /[{}]/,
      "}": /[{}]/,
      "<": /[<>]/,
      ">": /[<>]/
    }[d], S = {
      "(": "(",
      ")": "(",
      "[": "[",
      "]": "[",
      "{": "{",
      "}": "{",
      "<": "<",
      ">": "<"
    }[d], k = h.getLine(g.line).charAt(g.ch), x = k === S ? 1 : 0, $ = h.scanForBracket(new e(g.line, g.ch + x), -1, void 0, { bracketRegex: y }), P = h.scanForBracket(new e(g.line, g.ch + x), 1, void 0, { bracketRegex: y });
    if (!$ || !P) return null;
    var M = $.pos, R = P.pos;
    if (M.line == R.line && M.ch > R.ch || M.line > R.line) {
      var Z = M;
      M = R, R = Z;
    }
    return O ? R.ch += 1 : M.ch += 1, { start: M, end: R };
  }
  function og(h, f, d, O) {
    var g = $e(f), y = h.getLine(g.line), S = y.split(""), k, x, $, P, M = S.indexOf(d);
    if (g.ch < M)
      g.ch = M;
    else if (M < g.ch && S[g.ch] == d) {
      var R = /string/.test(h.getTokenTypeAt(Re(f, 0, 1))), Z = /string/.test(h.getTokenTypeAt(f)), T = R && !Z;
      T || (x = g.ch, --g.ch);
    }
    if (S[g.ch] == d && !x)
      k = g.ch + 1;
    else
      for ($ = g.ch; $ > -1 && !k; $--)
        S[$] == d && (k = $ + 1);
    if (k && !x)
      for ($ = k, P = S.length; $ < P && !x; $++)
        S[$] == d && (x = $);
    return !k || !x ? { start: g, end: g } : (O && (--k, ++x), {
      start: new e(g.line, k),
      end: new e(g.line, x)
    });
  }
  re("pcre", !0, "boolean");
  class ag {
    constructor() {
      this.highlightTimeout;
    }
    getQuery() {
      return D.query;
    }
    setQuery(f) {
      D.query = f;
    }
    getOverlay() {
      return this.searchOverlay;
    }
    setOverlay(f) {
      this.searchOverlay = f;
    }
    isReversed() {
      return D.isReversed;
    }
    setReversed(f) {
      D.isReversed = f;
    }
    getScrollbarAnnotate() {
      return this.annotate;
    }
    setScrollbarAnnotate(f) {
      this.annotate = f;
    }
  }
  function Rt(h) {
    var f = h.state.vim;
    return f.searchState_ || (f.searchState_ = new ag());
  }
  function lg(h) {
    return ah(h, "/");
  }
  function hg(h) {
    return lh(h, "/");
  }
  function ah(h, f) {
    var d = lh(h, f) || [];
    if (!d.length) return [];
    var O = [];
    if (d[0] === 0) {
      for (var g = 0; g < d.length; g++)
        typeof d[g] == "number" && O.push(h.substring(d[g] + 1, d[g + 1]));
      return O;
    }
  }
  function lh(h, f) {
    f || (f = "/");
    for (var d = !1, O = [], g = 0; g < h.length; g++) {
      var y = h.charAt(g);
      !d && y == f && O.push(g), d = !d && y == "\\";
    }
    return O;
  }
  function cg(h) {
    var f = {
      V: "|(){+?*.[$^",
      // verynomagic
      M: "|(){+?*.[",
      // nomagic
      m: "|(){+?",
      // magic
      v: "<>"
      // verymagic
    }, d = {
      ">": "(?<=[\\w])(?=[^\\w]|$)",
      "<": "(?<=[^\\w]|^)(?=[\\w])"
    }, O = f.m, g = h.replace(/\\.|[\[|(){+*?.$^<>]/g, function(S) {
      if (S[0] === "\\") {
        var k = S[1];
        return k === "}" || O.indexOf(k) != -1 ? k : k in f ? (O = f[k], "") : k in d ? d[k] : S;
      } else
        return O.indexOf(S) != -1 ? d[S] || "\\" + S : S;
    }), y = g.indexOf("\\zs");
    return y != -1 && (g = "(?<=" + g.slice(0, y) + ")" + g.slice(y + 3)), y = g.indexOf("\\ze"), y != -1 && (g = g.slice(0, y) + "(?=" + g.slice(y + 3) + ")"), g;
  }
  var hh = { "\\n": `
`, "\\r": "\r", "\\t": "	" };
  function fg(h) {
    for (var f = !1, d = [], O = -1; O < h.length; O++) {
      var g = h.charAt(O) || "", y = h.charAt(O + 1) || "";
      hh[g + y] ? (d.push(hh[g + y]), O++) : f ? (d.push(g), f = !1) : g === "\\" ? (f = !0, B(y) || y === "$" ? d.push("$") : y !== "/" && y !== "\\" && d.push("\\")) : (g === "$" && d.push("$"), d.push(g), y === "/" && d.push("\\"));
    }
    return d.join("");
  }
  var ch = { "\\/": "/", "\\\\": "\\", "\\n": `
`, "\\r": "\r", "\\t": "	", "\\&": "&" };
  function ug(h) {
    for (var f = new r.StringStream(h), d = []; !f.eol(); ) {
      for (; f.peek() && f.peek() != "\\"; )
        d.push(f.next());
      var O = !1;
      for (var g in ch)
        if (f.match(g, !0)) {
          O = !0, d.push(ch[g]);
          break;
        }
      O || d.push(f.next());
    }
    return d.join("");
  }
  function fh(h, f, d) {
    var O = D.registerController.getRegister("/");
    O.setText(h);
    var g = hg(h), y, S;
    if (!g.length)
      y = h;
    else {
      y = h.substring(0, g[0]);
      var k = h.substring(g[0]);
      S = k.indexOf("i") != -1;
    }
    if (!y)
      return null;
    ne("pcre") || (y = cg(y)), d && (f = /^[^A-Z]*$/.test(y));
    var x = new RegExp(
      y,
      f || S ? "im" : "m"
    );
    return x;
  }
  function Zt(h) {
    typeof h == "string" && (h = document.createElement(h));
    for (var f = 1; f < arguments.length; f++) {
      var d = arguments[f];
      if (d)
        if (typeof d != "object" && (d = document.createTextNode(d)), d.nodeType) h.appendChild(d);
        else for (var O in d)
          Object.prototype.hasOwnProperty.call(d, O) && (O[0] === "$" ? h.style[O.slice(1)] = d[O] : typeof d[O] == "function" ? h[O] = d[O] : h.setAttribute(O, d[O]));
    }
    return h;
  }
  function ue(h, f, d, O) {
    var g = Zt("div", { $color: "red", $whiteSpace: "pre", class: "cm-vim-message" }, f);
    h.openNotification ? d ? (g = Zt("div", {}, g, Zt("div", {}, "Press ENTER or type command to continue")), h.state.closeVimNotification && h.state.closeVimNotification(), h.state.closeVimNotification = h.openNotification(g, { bottom: !0, duration: 0 })) : h.openNotification(g, { bottom: !0, duration: O || 15e3 }) : O || alert(g.innerText);
  }
  function dg(h, f) {
    return Zt(
      "div",
      { $display: "flex", $flex: 1 },
      Zt(
        "span",
        { $fontFamily: "monospace", $whiteSpace: "pre", $flex: 1, $display: "flex" },
        h,
        Zt("input", {
          type: "text",
          autocorrect: "off",
          autocapitalize: "off",
          spellcheck: "false",
          $flex: 1
        })
      ),
      f && Zt("span", { $color: "#888" }, f)
    );
  }
  function xn(h, f) {
    if (ze.length) {
      f.value || (f.value = ""), ke = f;
      return;
    }
    var d = dg(f.prefix, f.desc);
    if (h.openDialog)
      h.openDialog(d, f.onClose, {
        onKeyDown: f.onKeyDown,
        onKeyUp: f.onKeyUp,
        bottom: !0,
        selectValueOnOpen: !1,
        value: f.value
      });
    else {
      var O = "";
      typeof f.prefix != "string" && f.prefix && (O += f.prefix.textContent), f.desc && (O += " " + f.desc), f.onClose?.(prompt(O, ""));
    }
  }
  function Og(h, f) {
    return h instanceof RegExp && f instanceof RegExp ? h.flags == f.flags && h.source == f.source : !1;
  }
  function Cr(h, f, d, O) {
    if (f) {
      var g = Rt(h), y = fh(f, !!d, !!O);
      if (y)
        return Js(h, y), Og(y, g.getQuery()) || g.setQuery(y), y;
    }
  }
  function pg(h) {
    if (h.source.charAt(0) == "^")
      var f = !0;
    return {
      token: function(d) {
        if (f && !d.sol()) {
          d.skipToEnd();
          return;
        }
        var O = d.match(h, !1);
        if (O)
          return O[0].length == 0 ? (d.next(), "searching") : !d.sol() && (d.backUp(1), !h.exec(d.next() + O[0])) ? (d.next(), null) : (d.match(h), "searching");
        for (; !d.eol() && (d.next(), !d.match(h, !1)); )
          ;
      },
      query: h
    };
  }
  var Tr = 0;
  function Js(h, f) {
    clearTimeout(Tr);
    var d = Rt(h);
    d.highlightTimeout = Tr, Tr = setTimeout(function() {
      if (h.state.vim) {
        var O = Rt(h);
        O.highlightTimeout = void 0;
        var g = O.getOverlay();
        (!g || f != g.query) && (g && h.removeOverlay(g), g = pg(f), h.addOverlay(g), h.showMatchesOnScrollbar && (O.getScrollbarAnnotate() && O.getScrollbarAnnotate().clear(), O.setScrollbarAnnotate(h.showMatchesOnScrollbar(f))), O.setOverlay(g));
      }
    }, 50);
  }
  function uh(h, f, d, O) {
    return h.operation(function() {
      O === void 0 && (O = 1);
      for (var g = h.getCursor(), y = h.getSearchCursor(d, g), S = 0; S < O; S++) {
        var k = y.find(f);
        if (S == 0 && k && wt(y.from(), g)) {
          var x = f ? y.from() : y.to();
          k = y.find(f), k && !k[0] && wt(y.from(), x) && h.getLine(x.line).length == x.ch && (k = y.find(f));
        }
        if (!k && (y = h.getSearchCursor(
          d,
          // @ts-ignore
          f ? new e(h.lastLine()) : new e(h.firstLine(), 0)
        ), !y.find(f)))
          return;
      }
      return y.from();
    });
  }
  function gg(h, f, d, O, g) {
    return h.operation(function() {
      O === void 0 && (O = 1);
      var y = h.getCursor(), S = h.getSearchCursor(d, y), k = S.find(!f);
      !g.visualMode && k && wt(S.from(), y) && S.find(!f);
      for (var x = 0; x < O; x++)
        if (k = S.find(f), !k && (S = h.getSearchCursor(
          d,
          // @ts-ignore
          f ? new e(h.lastLine()) : new e(h.firstLine(), 0)
        ), !S.find(f)))
          return;
      var $ = S.from(), P = S.to();
      return $ && P && [$, P];
    });
  }
  function Hi(h) {
    var f = Rt(h);
    f.highlightTimeout && (clearTimeout(f.highlightTimeout), f.highlightTimeout = void 0), h.removeOverlay(Rt(h).getOverlay()), f.setOverlay(null), f.getScrollbarAnnotate() && (f.getScrollbarAnnotate().clear(), f.setScrollbarAnnotate(null));
  }
  function mg(h, f, d) {
    return typeof h != "number" && (h = h.line), f instanceof Array ? he(h, f) : typeof d == "number" ? h >= f && h <= d : h == f;
  }
  function eo(h) {
    var f = h.getScrollInfo(), d = 6, O = 10, g = h.coordsChar({ left: 0, top: d + f.top }, "local"), y = f.clientHeight - O + f.top, S = h.coordsChar({ left: 0, top: y }, "local");
    return { top: g.line, bottom: S.line };
  }
  function wn(h, f, d) {
    if (d == "'" || d == "`")
      return D.jumpList.find(h, -1) || new e(0, 0);
    if (d == ".")
      return dh(h);
    var O = f.marks[d];
    return O && O.find();
  }
  function dh(h) {
    if (h.getLastEditEnd)
      return h.getLastEditEnd();
    for (var f = (
      /**@type{any}*/
      h.doc.history.done
    ), d = f.length; d--; )
      if (f[d].changes)
        return $e(f[d].changes[0].to);
  }
  class yg {
    constructor() {
      this.commandMap_, this.buildCommandMap_();
    }
    /**
     * @arg {CodeMirrorV} cm
     * @arg {string} input
     * @arg {{ callback: () => void; } | undefined} [opt_params]
     */
    processCommand(f, d, O) {
      var g = this;
      f.operation(function() {
        f.curOp && (f.curOp.isVimOp = !0), g._processCommand(f, d, O);
      });
    }
    /**
     * @arg {CodeMirrorV} cm
     * @arg {string} input
     * @arg {{ callback?: () => void; input?: string, line?: string, commandName?: string  } } [opt_params]
     */
    _processCommand(f, d, O) {
      var g = f.state.vim, y = D.registerController.getRegister(":"), S = y.toString(), k = new r.StringStream(d);
      y.setText(d);
      var x = O || {};
      x.input = d;
      try {
        this.parseInput_(f, k, x);
      } catch (M) {
        ue(f, M + "");
        return;
      }
      g.visualMode && zt(f);
      var $, P;
      if (!x.commandName)
        x.line !== void 0 && (P = "move");
      else if ($ = this.matchCommand_(x.commandName), $) {
        if (P = $.name, $.excludeFromCommandHistory && y.setText(S), this.parseCommandArgs_(k, x, $), $.type == "exToKey") {
          di(f, $.toKeys || "", $);
          return;
        } else if ($.type == "exToEx") {
          this.processCommand(f, $.toInput || "");
          return;
        }
      }
      if (!P) {
        ue(f, 'Not an editor command ":' + d + '"');
        return;
      }
      try {
        Oh[P](f, x), (!$ || !$.possiblyAsync) && x.callback && x.callback();
      } catch (M) {
        throw ue(f, M + ""), M;
      }
    }
    /**
     * @param {CodeMirrorV} cm
     * @param {import("./types").StringStream} inputStream
     * @param {{ callback?: (() => void) | undefined; input?: string | undefined; line?: any; commandName?: any; lineEnd?: any; selectionLine?: any; selectionLineEnd?: any; }} result
     */
    parseInput_(f, d, O) {
      if (d.eatWhile(":"), d.eat("%"))
        O.line = f.firstLine(), O.lineEnd = f.lastLine();
      else if (d.eat("*")) {
        var g = f.state.vim.lastSelection, y = g?.anchorMark.find()?.line || 0, S = g?.headMark.find()?.line || 0;
        O.line = Math.max(y, S), O.lineEnd = Math.min(y, S);
      } else
        O.line = this.parseLineSpec_(f, d), O.line !== void 0 && d.eat(",") && (O.lineEnd = this.parseLineSpec_(f, d));
      O.line == null ? f.state.vim.visualMode ? (O.selectionLine = wn(f, f.state.vim, "<")?.line, O.selectionLineEnd = wn(f, f.state.vim, ">")?.line) : O.selectionLine = f.getCursor().line : (O.selectionLine = O.line, O.selectionLineEnd = O.lineEnd), d.eatSpace();
      var k = d.match(/^(\w+|!!|@@|[!#&*<=>@~])/);
      return k ? O.commandName = k[1] : O.commandName = (d.match(/.*/) || [""])[0], O;
    }
    /**
     * @param {CodeMirrorV} cm
     * @param {import("./types").StringStream} inputStream
     */
    parseLineSpec_(f, d) {
      var O = d.match(/^([\d]+)/);
      if (O)
        return this.parseLineSpecOffset_(f, d, parseInt(O[1], 10) - 1);
      switch (d.next()) {
        case ".":
          return this.parseLineSpecOffset_(f, d, f.getCursor().line);
        case "$":
          return this.parseLineSpecOffset_(f, d, f.lastLine());
        case "'":
          var g = d.next() || "", y = wn(f, f.state.vim, g);
          if (!y) throw new Error("Mark not set");
          return this.parseLineSpecOffset_(f, d, y.line);
        case "-":
        case "+":
        case "/":
        case "?":
          return d.backUp(1), this.parseLineSpecOffset_(f, d, f.getCursor().line);
        default:
          d.backUp(1);
          return;
      }
    }
    /**
     * @param {CodeMirrorV} cm
     * @param {string | import("./types").StringStream} inputStream
     * @param {number} line
     */
    parseLineSpecOffset_(f, d, O) {
      for (; ; ) {
        var g = d.match(/^([\/\?]|\\[\?\/])|([+-]?)(\d*)/);
        if (!g || !g[0])
          break;
        if (g[1]) {
          var y = "", S = !g[1].endsWith("?");
          if (g[1].length == 1) {
            var k = d.match(S ? /^([^\/\\]|\\\/)*/ : /^([^\/\?]|\\\?)*/);
            d.match(S ? /^\/?/ : /^\??/), y = k && k[0];
          }
          y || (y = D.registerController.getRegister("/")?.toString() || "");
          var x = new RegExp(y), $ = f.getSearchCursor(x, new e(O + (S ? 1 : 0), 0));
          S ? $.findNext() : $.findPrevious();
          var P = $.from();
          if (!P)
            throw new Error("Pattern not found" + x);
          O = P.line;
        } else {
          var M = parseInt(g[2] + (g[3] || "1"), 10);
          O += M;
        }
      }
      return O;
    }
    /**
     * @param {import("./types").StringStream} inputStream
     * @param {import("./types").exCommandArgs} params
     * @param {import("./types").exCommandDefinition} command
     */
    parseCommandArgs_(f, d, O) {
      if (!f.eol()) {
        d.argString = f.match(/.*/)?.[0];
        var g = O.argDelimiter || /\s+/, y = Us(d.argString || "").split(g);
        y.length && y[0] && (d.args = y);
      }
    }
    /**
     * @arg {string} commandName
     */
    matchCommand_(f) {
      for (var d = f.length; d > 0; d--) {
        var O = f.substring(0, d);
        if (this.commandMap_[O]) {
          var g = this.commandMap_[O];
          if (g.name.indexOf(f) === 0)
            return g;
        }
      }
    }
    buildCommandMap_() {
      this.commandMap_ = {};
      for (var f = 0; f < o.length; f++) {
        var d = o[f], O = d.shortName || d.name;
        this.commandMap_[O] = d;
      }
    }
    /**@type {(lhs: string, rhs: string, ctx: string|void, noremap?: boolean) => void} */
    map(f, d, O, g) {
      if (f != ":" && f.charAt(0) == ":") {
        if (O)
          throw Error("Mode not supported for ex mappings");
        var y = f.substring(1);
        d != ":" && d.charAt(0) == ":" ? this.commandMap_[y] = {
          name: y,
          type: "exToEx",
          toInput: d.substring(1),
          user: !0
        } : this.commandMap_[y] = {
          name: y,
          type: "exToKey",
          toKeys: d,
          user: !0
        };
      } else {
        var S = {
          keys: f,
          type: "keyToKey",
          toKeys: d,
          noremap: !!g
        };
        O && (S.context = O), to(S);
      }
    }
    /**@type {(lhs: string, ctx: string) => boolean|void} */
    unmap(f, d) {
      if (f != ":" && f.charAt(0) == ":") {
        if (d)
          throw Error("Mode not supported for ex mappings");
        var O = f.substring(1);
        if (this.commandMap_[O] && this.commandMap_[O].user)
          return delete this.commandMap_[O], !0;
      } else
        for (var g = f, y = 0; y < i.length; y++)
          if (g == i[y].keys && i[y].context === d)
            return i.splice(y, 1), bg(g), !0;
    }
  }
  var Oh = {
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    colorscheme: function(h, f) {
      if (!f.args || f.args.length < 1) {
        ue(h, h.getOption("theme"));
        return;
      }
      h.setOption("theme", f.args[0]);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params @arg {'insert'|'normal'|string} [ctx] @arg {boolean} [defaultOnly]*/
    map: function(h, f, d, O) {
      var g = f.args;
      if (!g || g.length < 2) {
        h && ue(h, "Invalid mapping: " + f.input);
        return;
      }
      ct.map(g[0], g[1], d, O);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    imap: function(h, f) {
      this.map(h, f, "insert");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nmap: function(h, f) {
      this.map(h, f, "normal");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vmap: function(h, f) {
      this.map(h, f, "visual");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    omap: function(h, f) {
      this.map(h, f, "operatorPending");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    noremap: function(h, f) {
      this.map(h, f, void 0, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    inoremap: function(h, f) {
      this.map(h, f, "insert", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nnoremap: function(h, f) {
      this.map(h, f, "normal", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vnoremap: function(h, f) {
      this.map(h, f, "visual", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    onoremap: function(h, f) {
      this.map(h, f, "operatorPending", !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params @arg {string} ctx*/
    unmap: function(h, f, d) {
      var O = f.args;
      (!O || O.length < 1 || !ct.unmap(O[0], d)) && h && ue(h, "No such mapping: " + f.input);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    mapclear: function(h, f) {
      we.mapclear();
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    imapclear: function(h, f) {
      we.mapclear("insert");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    nmapclear: function(h, f) {
      we.mapclear("normal");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vmapclear: function(h, f) {
      we.mapclear("visual");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    omapclear: function(h, f) {
      we.mapclear("operatorPending");
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    move: function(h, f) {
      Ti.processCommand(h, h.state.vim, {
        keys: "",
        type: "motion",
        motion: "moveToLineOrEdgeOfDocument",
        motionArgs: { forward: !1, explicitRepeat: !0, linewise: !0 },
        repeatOverride: f.line + 1
      });
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    set: function(h, f) {
      var d = f.args, O = f.setCfg || {};
      if (!d || d.length < 1) {
        h && ue(h, "Invalid mapping: " + f.input);
        return;
      }
      var g = d[0].split("="), y = g.shift() || "", S = g.length > 0 ? g.join("=") : void 0, k = !1, x = !1;
      if (y.charAt(y.length - 1) == "?") {
        if (S)
          throw Error("Trailing characters: " + f.argString);
        y = y.substring(0, y.length - 1), k = !0;
      } else y.charAt(y.length - 1) == "!" && (y = y.substring(0, y.length - 1), x = !0);
      S === void 0 && y.substring(0, 2) == "no" && (y = y.substring(2), S = !1);
      var $ = fe[y] && fe[y].type == "boolean";
      if ($ && (x ? S = !ne(y, h, O) : S == null && (S = !0)), !$ && S === void 0 || k) {
        var P = ne(y, h, O);
        P instanceof Error ? ue(h, P.message) : P === !0 || P === !1 ? ue(h, " " + (P ? "" : "no") + y) : ue(h, "  " + y + "=" + P);
      } else {
        var M = J(y, S, h, O);
        M instanceof Error && ue(h, M.message);
      }
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    setlocal: function(h, f) {
      f.setCfg = { scope: "local" }, this.set(h, f);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    setglobal: function(h, f) {
      f.setCfg = { scope: "global" }, this.set(h, f);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    registers: function(h, f) {
      var d = f.args, O = D.registerController.registers, g = `----------Registers----------

`;
      if (d)
        for (var k = d.join(""), x = 0; x < k.length; x++) {
          var y = k.charAt(x);
          if (D.registerController.isValidRegister(y)) {
            var $ = O[y] || new Wt();
            g += '"' + y + "    " + $.toString() + `
`;
          }
        }
      else
        for (var y in O) {
          var S = O[y].toString();
          S.length && (g += '"' + y + "    " + S + `
`);
        }
      ue(h, g, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    marks: function(h, f) {
      var d = f.args, O = h.state.vim.marks, g = `-----------Marks-----------
mark	line	col

`;
      if (d)
        for (var k = d.join(""), x = 0; x < k.length; x++) {
          var y = k.charAt(x), S = O[y] && O[y].find();
          S && (g += y + "	" + S.line + "	" + S.ch + `
`);
        }
      else
        for (var y in O) {
          var S = O[y] && O[y].find();
          S && (g += y + "	" + S.line + "	" + S.ch + `
`);
        }
      ue(h, g, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    sort: function(h, f) {
      var d, O, g, y, S, k;
      function x() {
        if (f.argString) {
          var ce = new r.StringStream(f.argString);
          if (ce.eat("!") && (d = !0), ce.eol())
            return;
          if (!ce.eatSpace())
            return "Invalid arguments";
          var se = ce.match(/([dinuoxr]+)?\s*(\/.+\/)?\s*/);
          if (!se || !ce.eol())
            return "Invalid arguments";
          if (se[1]) {
            k = se[1].indexOf("r") != -1, O = se[1].indexOf("i") != -1, g = se[1].indexOf("u") != -1;
            var ft = se[1].indexOf("d") != -1 || se[1].indexOf("n") != -1, Ve = se[1].indexOf("x") != -1, Ne = se[1].indexOf("o") != -1;
            if (Number(ft) + Number(Ve) + Number(Ne) > 1)
              return "Invalid arguments";
            y = ft && "decimal" || Ve && "hex" || Ne && "octal";
          }
          se[2] && (S = new RegExp(se[2].substr(1, se[2].length - 2), O ? "i" : ""));
        }
      }
      var $ = x();
      if ($) {
        ue(h, $ + ": " + f.argString);
        return;
      }
      var P = f.line || h.firstLine(), M = f.lineEnd || f.line || h.lastLine();
      if (P == M)
        return;
      var R = new e(P, 0), Z = new e(M, et(h, M)), T = h.getRange(R, Z).split(`
`), E = y == "decimal" ? /(-?)([\d]+)/ : y == "hex" ? /(-?)(?:0x)?([0-9a-f]+)/i : y == "octal" ? /([0-7]+)/ : null, I = y == "decimal" ? 10 : y == "hex" ? 16 : y == "octal" ? 8 : void 0, K = [], G = [];
      if (y || S)
        for (var U = 0; U < T.length; U++) {
          var ie = S ? T[U].match(S) : null;
          ie && ie.index != null && !k && (ie[0] = T[U].slice(ie.index + ie[0].length)), ie && ie[0] != "" ? K.push(ie) : E && E.exec(T[U]) ? K.push(T[U]) : G.push(T[U]);
        }
      else
        G = T;
      function oe(ce, se) {
        if (d) {
          var ft;
          ft = ce, ce = se, se = ft;
        }
        O && (ce = ce.toLowerCase(), se = se.toLowerCase());
        var Ve = E && E.exec(ce), Ne = E && E.exec(se);
        if (!Ve || !Ne)
          return ce < se ? -1 : 1;
        var Mi = parseInt((Ve[1] + Ve[2]).toLowerCase(), I), ro = parseInt((Ne[1] + Ne[2]).toLowerCase(), I);
        return Mi - ro;
      }
      function Ze(ce, se) {
        if (d) {
          var ft;
          ft = ce, ce = se, se = ft;
        }
        return O && (ce[0] = ce[0].toLowerCase(), se[0] = se[0].toLowerCase()), ce[0] < se[0] ? -1 : 1;
      }
      if (K.sort(S ? Ze : oe), S)
        for (var U = 0; U < K.length; U++)
          K[U] = K[U].input;
      else y || G.sort(oe);
      if (T = d ? K.concat(G) : G.concat(K), g) {
        var Pe = T, De;
        T = [];
        for (var U = 0; U < Pe.length; U++)
          Pe[U] != De && T.push(Pe[U]), De = Pe[U];
      }
      h.replaceRange(T.join(`
`), R, Z);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    vglobal: function(h, f) {
      this.global(h, f);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    normal: function(h, f) {
      var d = !1, O = f.argString;
      if (O && O[0] == "!" && (O = O.slice(1), d = !0), O = O.trimStart(), !O) {
        ue(h, "Argument is required.");
        return;
      }
      var g = f.line;
      if (typeof g == "number")
        for (var y = isNaN(f.lineEnd) ? g : f.lineEnd, S = g; S <= y; S++)
          h.setCursor(S, 0), di(h, f.argString.trimStart(), { noremap: d }), h.state.vim.insertMode && pi(h, !0);
      else
        di(h, f.argString.trimStart(), { noremap: d }), h.state.vim.insertMode && pi(h, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    global: function(h, f) {
      var d = f.argString;
      if (!d) {
        ue(h, "Regular Expression missing from global");
        return;
      }
      var O = f.commandName[0] === "v";
      d[0] === "!" && f.commandName[0] === "g" && (O = !0, d = d.slice(1));
      var g = f.line !== void 0 ? f.line : h.firstLine(), y = f.lineEnd || f.line || h.lastLine(), S = lg(d), k = d, x = "";
      if (S && S.length && (k = S[0], x = S.slice(1, S.length).join("/")), k)
        try {
          Cr(
            h,
            k,
            !0,
            !0
            /** smartCase */
          );
        } catch {
          ue(h, "Invalid regex: " + k);
          return;
        }
      for (var $ = Rt(h).getQuery(), P = [], M = g; M <= y; M++) {
        var R = h.getLine(M), Z = $.test(R);
        Z !== O && P.push(x ? h.getLineHandle(M) : R);
      }
      if (!x) {
        ue(h, P.join(`
`));
        return;
      }
      var T = 0, E = function() {
        if (T < P.length) {
          var I = P[T++], K = h.getLineNumber(I);
          if (K == null) {
            E();
            return;
          }
          var G = K + 1 + x;
          ct.processCommand(h, G, {
            callback: E
          });
        } else h.releaseLineHandles && h.releaseLineHandles();
      };
      E();
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    substitute: function(h, f) {
      if (!h.getSearchCursor)
        throw new Error("Search feature not available. Requires searchcursor.js or any other getSearchCursor implementation.");
      var d = f.argString, O = d ? ah(d, d[0]) : [], g = "", y = "", S, k, x, $ = !1, P = !1;
      if (O && O.length)
        g = O[0], ne("pcre") && g !== "" && (g = new RegExp(g).source), y = O[1], y !== void 0 && (ne("pcre") ? y = ug(y.replace(/([^\\])&/g, "$1$$&")) : y = fg(y), D.lastSubstituteReplacePart = y), S = O[2] ? O[2].split(" ") : [];
      else if (d && d.length) {
        ue(h, "Substitutions should be of the form :s/pattern/replace/");
        return;
      }
      if (S && (k = S[0], x = parseInt(S[1]), k && (k.indexOf("c") != -1 && ($ = !0), k.indexOf("g") != -1 && (P = !0), ne("pcre") ? g = g + "/" + k : g = g.replace(/\//g, "\\/") + "/" + k)), g)
        try {
          Cr(
            h,
            g,
            !0,
            !0
            /** smartCase */
          );
        } catch {
          ue(h, "Invalid regex: " + g);
          return;
        }
      if (y = y || D.lastSubstituteReplacePart, y === void 0) {
        ue(h, "No previous substitute regular expression");
        return;
      }
      var M = Rt(h), R = M.getQuery(), Z = f.line !== void 0 ? f.line : h.getCursor().line, T = f.lineEnd || Z;
      Z == h.firstLine() && T == h.lastLine() && (T = 1 / 0), x && (Z = T, T = Z + x - 1);
      var E = st(h, new e(Z, 0)), I = h.getSearchCursor(R, E);
      vg(h, $, P, Z, T, I, R, y, f.callback);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    startinsert: function(h, f) {
      di(h, f.argString == "!" ? "A" : "i", {});
    },
    redo: r.commands.redo,
    undo: r.commands.undo,
    /** @arg {CodeMirrorV} cm */
    write: function(h) {
      r.commands.save ? r.commands.save(h) : h.save && h.save();
    },
    /** @arg {CodeMirrorV} cm */
    nohlsearch: function(h) {
      Hi(h);
    },
    /** @arg {CodeMirrorV} cm  @arg {ExParams} params */
    yank: function(h, f) {
      var d = f.selectionLine, O = isNaN(f.selectionLineEnd) ? d : f.selectionLineEnd;
      if (O < d) {
        var g = O;
        O = d, d = g;
      }
      var y = h.getRange(new e(d, 0), new e(O + 1, 0)), S = f.args && f.args[0] ? f.args[0] : "0";
      D.registerController.pushText(
        S,
        "yank",
        y,
        !0,
        !1
      ), ue(h, O + 1 - d + " lines yanked" + (S ? ' into "' + S : ""), !1, 1500);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params @arg {boolean} [matchIndent]*/
    put: function(h, f, d) {
      var O = { after: !0, isEdit: !0, matchIndent: !!d, repeat: 1, lineWise: !0, registerName: "" }, g = f.args || [];
      g[0] == "!" && (O.after = !1, g.shift()), g[0] && (O.registerName = g[0]);
      var y = f.selectionLine;
      y != null && h.setCursor(new e(y, 0)), Ai.paste(h, O, h.state.vim);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    iput: function(h, f) {
      this.put(h, f, !0);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    delete: function(h, f) {
      var d = f.selectionLine, O = isNaN(f.selectionLineEnd) ? d : f.selectionLineEnd;
      Gs.delete(h, { linewise: !0 }, [
        {
          anchor: new e(d, 0),
          head: new e(O + 1, 0)
        }
      ]);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    join: function(h, f) {
      var d = f.selectionLine, O = isNaN(f.selectionLineEnd) ? d : f.selectionLineEnd;
      h.setCursor(new e(d, 0)), Ai.joinLines(h, { repeat: O - d }, h.state.vim);
    },
    /** @arg {CodeMirrorV} cm @arg {ExParams} params*/
    delmarks: function(h, f) {
      if (!f.argString || !Us(f.argString)) {
        ue(h, "Argument required");
        return;
      }
      for (var d = h.state.vim, O = new r.StringStream(Us(f.argString)); !O.eol(); ) {
        O.eatSpace();
        var g = O.pos;
        if (!O.match(/[a-zA-Z]/, !1)) {
          ue(h, "Invalid argument: " + f.argString.substring(g));
          return;
        }
        var y = O.next();
        if (O.match("-", !0)) {
          if (!O.match(/[a-zA-Z]/, !1)) {
            ue(h, "Invalid argument: " + f.argString.substring(g));
            return;
          }
          var S = y, k = O.next();
          if (S && k && _(S) == _(k)) {
            var x = S.charCodeAt(0), $ = k.charCodeAt(0);
            if (x >= $) {
              ue(h, "Invalid argument: " + f.argString.substring(g));
              return;
            }
            for (var P = 0; P <= $ - x; P++) {
              var M = String.fromCharCode(x + P);
              delete d.marks[M];
            }
          } else {
            ue(h, "Invalid argument: " + S + "-");
            return;
          }
        } else y && delete d.marks[y];
      }
    }
  }, ct = new yg();
  we.defineEx("version", "ve", (h) => {
    ue(h, "Codemirror-vim version: <DEV>");
  });
  function vg(h, f, d, O, g, y, S, k, x) {
    h.state.vim.exMode = !0;
    var $ = !1, P = 0, M, R, Z;
    function T() {
      h.operation(function() {
        for (; !$; )
          E(), K();
        G();
      });
    }
    function E() {
      var ie = "", oe = y.match || y.pos && y.pos.match;
      if (oe)
        ie = k.replace(/\$(\d{1,3}|[$&])/g, function(De, ce) {
          if (ce == "$") return "$";
          if (ce == "&") return oe[0];
          for (var se = ce; parseInt(se) >= oe.length && se.length > 0; )
            se = se.slice(0, se.length - 1);
          return se ? oe[se] + ce.slice(se.length, ce.length) : De;
        });
      else {
        var Ze = h.getRange(y.from(), y.to());
        ie = Ze.replace(S, k);
      }
      var Pe = y.to().line;
      y.replace(ie), R = y.to().line, g += R - Pe, Z = R < Pe;
    }
    function I() {
      var ie = M && $e(y.to()), oe = y.findNext();
      return oe && !oe[0] && ie && wt(y.from(), ie) && (oe = y.findNext()), oe && P++, oe;
    }
    function K() {
      for (; I() && mg(y.from(), O, g); )
        if (!(!d && y.from().line == R && !Z)) {
          h.scrollIntoView(y.from(), 30), h.setSelection(y.from(), y.to()), M = y.from(), $ = !1;
          return;
        }
      $ = !0;
    }
    function G(ie) {
      if (ie && ie(), h.focus(), M) {
        h.setCursor(M);
        var oe = h.state.vim;
        oe.exMode = !1, oe.lastHPos = oe.lastHSPos = M.ch;
      }
      x ? x() : $ && ue(
        h,
        (P ? "Found " + P + " matches" : "No matches found") + " for pattern: " + S + (ne("pcre") ? " (set nopcre to use Vim regexps)" : "")
      );
    }
    function U(ie, oe, Ze) {
      r.e_stop(ie);
      var Pe = Pr(ie);
      switch (Pe) {
        case "y":
          E(), K();
          break;
        case "n":
          K();
          break;
        case "a":
          var De = x;
          x = void 0, h.operation(T), x = De;
          break;
        case "l":
          E();
        // fall through and exit.
        case "q":
        case "<Esc>":
        case "<C-c>":
        case "<C-[>":
          G(Ze);
          break;
      }
      return $ && G(Ze), !0;
    }
    if (K(), $) {
      ue(h, "No matches for " + S + (ne("pcre") ? " (set nopcre to use vim regexps)" : ""));
      return;
    }
    if (!f) {
      T(), x && x();
      return;
    }
    xn(h, {
      prefix: Zt("span", "replace with ", Zt("strong", k), " (y/n/a/q/l)"),
      onKeyDown: U
    });
  }
  function pi(h, f) {
    var d = h.state.vim, O = D.macroModeState, g = D.registerController.getRegister("."), y = O.isPlaying, S = O.lastInsertModeChanges;
    y || (h.off("change", ph), d.insertEnd && d.insertEnd.clear(), d.insertEnd = void 0, r.off(h.getInputField(), "keydown", yh)), !y && d.insertModeRepeat && d.insertModeRepeat > 1 && (vh(
      h,
      d,
      d.insertModeRepeat - 1,
      !0
      /** repeatForInsert */
    ), d.lastEditInputState.repeatOverride = d.insertModeRepeat), delete d.insertModeRepeat, d.insertMode = !1, f || h.setCursor(h.getCursor().line, h.getCursor().ch - 1), h.setOption("keyMap", "vim"), h.setOption("disableInput", !0), h.toggleOverwrite(!1), g.setText(S.changes.join("")), r.signal(h, "vim-mode-change", { mode: "normal" }), O.isRecording && Qg(O);
  }
  function to(h) {
    i.unshift(h), h.keys && Sg(h.keys);
  }
  function Sg(h) {
    h.split(/(<(?:[CSMA]-)*\w+>|.)/i).forEach(function(f) {
      f && (n[f] || (n[f] = 0), n[f]++);
    });
  }
  function bg(h) {
    h.split(/(<(?:[CSMA]-)*\w+>|.)/i).forEach(function(f) {
      n[f] && n[f]--;
    });
  }
  function kg(h, f, d, O, g) {
    var y = { keys: h, type: f };
    y[f] = d, y[f + "Args"] = O;
    for (var S in g)
      y[S] = g[S];
    to(y);
  }
  re("insertModeEscKeysTimeout", 200, "number");
  function xg(h, f, d, O) {
    var g = D.registerController.getRegister(O);
    if (O == ":") {
      g.keyBuffer[0] && ct.processCommand(h, g.keyBuffer[0]), d.isPlaying = !1;
      return;
    }
    var y = g.keyBuffer, S = 0;
    d.isPlaying = !0, d.replaySearchQueries = g.searchQueries.slice(0);
    for (var k = 0; k < y.length; k++)
      for (var x = y[k], $, P, M = /<(?:[CSMA]-)*\w+>|./gi; $ = M.exec(x); )
        if (P = $[0], we.handleKey(h, P, "macro"), f.insertMode) {
          var R = g.insertModeChanges[S++].changes;
          D.macroModeState.lastInsertModeChanges.changes = R, bh(h, R, 1), pi(h);
        }
    d.isPlaying = !1;
  }
  function wg(h, f) {
    if (!h.isPlaying) {
      var d = h.latestRegister, O = D.registerController.getRegister(d);
      O && O.pushText(f);
    }
  }
  function Qg(h) {
    if (!h.isPlaying) {
      var f = h.latestRegister, d = D.registerController.getRegister(f);
      d && d.pushInsertModeChanges && d.pushInsertModeChanges(h.lastInsertModeChanges);
    }
  }
  function $g(h, f) {
    if (!h.isPlaying) {
      var d = h.latestRegister, O = D.registerController.getRegister(d);
      O && O.pushSearchQuery && O.pushSearchQuery(f);
    }
  }
  function ph(h, f) {
    var d = D.macroModeState, O = d.lastInsertModeChanges;
    if (!d.isPlaying)
      for (var g = h.state.vim; f; ) {
        if (O.expectCursorActivityForChange = !0, O.ignoreCount > 1)
          O.ignoreCount--;
        else if (f.origin == "+input" || f.origin == "paste" || f.origin === void 0) {
          var y = h.listSelections().length;
          y > 1 && (O.ignoreCount = y);
          var S = f.text.join(`
`);
          if (O.maybeReset && (O.changes = [], O.maybeReset = !1), S)
            if (h.state.overwrite && !/\n/.test(S))
              O.changes.push([S]);
            else {
              if (S.length > 1) {
                var k = g && g.insertEnd && g.insertEnd.find(), x = h.getCursor();
                if (k && k.line == x.line) {
                  var $ = k.ch - x.ch;
                  $ > 0 && $ < S.length && (O.changes.push([S, $]), S = "");
                }
              }
              S && O.changes.push(S);
            }
        }
        f = f.next;
      }
  }
  function gh(h) {
    var f = h.state.vim;
    if (f.insertMode) {
      var d = D.macroModeState;
      if (d.isPlaying)
        return;
      var O = d.lastInsertModeChanges;
      O.expectCursorActivityForChange ? O.expectCursorActivityForChange = !1 : (O.maybeReset = !0, f.insertEnd && f.insertEnd.clear(), f.insertEnd = h.setBookmark(h.getCursor(), { insertLeft: !0 }));
    } else h.curOp?.isVimOp || mh(h, f);
  }
  function mh(h, f) {
    var d = h.getCursor("anchor"), O = h.getCursor("head");
    if (f.visualMode && !h.somethingSelected() ? zt(h, !1) : !f.visualMode && !f.insertMode && h.somethingSelected() && (f.visualMode = !0, f.visualLine = !1, r.signal(h, "vim-mode-change", { mode: "visual" })), f.visualMode) {
      var g = Ae(O, d) ? 0 : -1, y = Ae(O, d) ? -1 : 0;
      O = Re(O, 0, g), d = Re(d, 0, y), f.sel = {
        anchor: d,
        head: O
      }, ni(h, f, "<", ot(O, d)), ni(h, f, ">", Oi(O, d));
    } else f.insertMode || (f.lastHPos = h.getCursor().ch);
  }
  function yh(h) {
    var f = D.macroModeState, d = f.lastInsertModeChanges, O = r.keyName ? r.keyName(h) : h.key;
    O && (O.indexOf("Delete") != -1 || O.indexOf("Backspace") != -1) && (d.maybeReset && (d.changes = [], d.maybeReset = !1), d.changes.push(new Je(O, h)));
  }
  function vh(h, f, d, O) {
    var g = D.macroModeState;
    g.isPlaying = !0;
    var y = f.lastEditActionCommand, S = f.inputState;
    function k() {
      y ? Ti.processAction(h, f, y) : Ti.evalInput(h, f);
    }
    function x(P) {
      if (g.lastInsertModeChanges.changes.length > 0) {
        P = f.lastEditActionCommand ? P : 1;
        var M = g.lastInsertModeChanges;
        bh(h, M.changes, P);
      }
    }
    if (f.inputState = f.lastEditInputState, y && y.interlaceInsertRepeat)
      for (var $ = 0; $ < d; $++)
        k(), x(1);
    else
      O || k(), x(d);
    f.inputState = S, f.insertMode && !O && pi(h), g.isPlaying = !1;
  }
  function Sh(h, f) {
    r.lookupKey(f, "vim-insert", function(O) {
      return typeof O == "string" ? r.commands[O](h) : O(h), !0;
    });
  }
  function bh(h, f, d) {
    var O = h.getCursor("head"), g = D.macroModeState.lastInsertModeChanges.visualBlock;
    g && (Hl(h, O, g + 1), d = h.listSelections().length, h.setCursor(O));
    for (var y = 0; y < d; y++) {
      g && h.setCursor(Re(O, y, 0));
      for (var S = 0; S < f.length; S++) {
        var k = f[S];
        if (k instanceof Je)
          Sh(h, k.keyName);
        else if (typeof k == "string")
          h.replaceSelection(k);
        else {
          var x = h.getCursor(), $ = Re(x, 0, k[0].length - (k[1] || 0));
          h.replaceRange(k[0], x, k[1] ? x : $), h.setCursor($);
        }
      }
    }
    g && h.setCursor(Re(O, 0, 1));
  }
  function io(h) {
    var f = new h.constructor();
    return Object.keys(h).forEach(function(d) {
      if (d != "insertEnd") {
        var O = h[d];
        Array.isArray(O) ? O = O.slice() : O && typeof O == "object" && O.constructor != Object && (O = io(O)), f[d] = O;
      }
    }), h.sel && (f.sel = {
      head: h.sel.head && $e(h.sel.head),
      anchor: h.sel.anchor && $e(h.sel.anchor)
    }), f;
  }
  function Pg(h, f, d) {
    var y = Le(h), O = (
      /**@type {CodeMirrorV}*/
      h
    ), g = !1, y = we.maybeInitVimState_(O), S = y.visualBlock || y.wasInVisualBlock;
    if (O.state.closeVimNotification) {
      var k = O.state.closeVimNotification;
      if (O.state.closeVimNotification = null, k(), f == "<CR>")
        return Ie(O), !0;
    }
    var x = O.isInMultiSelectMode();
    if (y.wasInVisualBlock && !x ? y.wasInVisualBlock = !1 : x && y.visualBlock && (y.wasInVisualBlock = !0), f == "<Esc>" && !y.insertMode && !y.visualMode && x && y.status == "<Esc>")
      Ie(O);
    else if (S || !x || O.inVirtualSelectionMode)
      g = we.handleKey(O, f, d);
    else {
      var $ = io(y), P = y.inputState.changeQueueList || [];
      O.operation(function() {
        O.curOp && (O.curOp.isVimOp = !0);
        var M = 0;
        O.forEachSelection(function() {
          O.state.vim.inputState.changeQueue = P[M];
          var R = O.getCursor("head"), Z = O.getCursor("anchor"), T = Ae(R, Z) ? 0 : -1, E = Ae(R, Z) ? -1 : 0;
          R = Re(R, 0, T), Z = Re(Z, 0, E), O.state.vim.sel.head = R, O.state.vim.sel.anchor = Z, g = we.handleKey(O, f, d), O.virtualSelection && (P[M] = O.state.vim.inputState.changeQueue, O.state.vim = io($)), M++;
        }), O.curOp?.cursorActivity && !g && (O.curOp.cursorActivity = !1), O.state.vim = y, y.inputState.changeQueueList = P, y.inputState.changeQueue = null;
      }, !0);
    }
    return g && !y.visualMode && !y.insertMode && y.visualMode != O.somethingSelected() && mh(O, y), g;
  }
  return Ee(), we;
}
function mt(r, e) {
  var t = e.ch, i = e.line + 1;
  i < 1 && (i = 1, t = 0), i > r.lines && (i = r.lines, t = Number.MAX_VALUE);
  var n = r.line(i);
  return Math.min(n.from + Math.max(0, t), n.to);
}
function Qt(r, e) {
  let t = r.lineAt(e);
  return { line: t.number - 1, ch: e - t.from };
}
class Ut {
  constructor(e, t) {
    this.line = e, this.ch = t;
  }
}
function wp(r, e, t) {
  if (r.addEventListener)
    r.addEventListener(e, t, !1);
  else {
    var i = r._handlers || (r._handlers = {});
    i[e] = (i[e] || []).concat(t);
  }
}
function Qp(r, e, t) {
  if (r.removeEventListener)
    r.removeEventListener(e, t, !1);
  else {
    var i = r._handlers, n = i && i[e];
    if (n) {
      var s = n.indexOf(t);
      s > -1 && (i[e] = n.slice(0, s).concat(n.slice(s + 1)));
    }
  }
}
function $p(r, e, ...t) {
  var i, n = (i = r._handlers) === null || i === void 0 ? void 0 : i[e];
  if (n)
    for (var s = 0; s < n.length; ++s)
      n[s](...t);
}
function Lf(r, ...e) {
  if (r)
    for (var t = 0; t < r.length; ++t)
      r[t](...e);
}
let Ga;
try {
  Ga = /* @__PURE__ */ new RegExp("[\\w\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
  Ga = /[\w]/;
}
function Wr(r, e) {
  var t = r.cm6;
  if (!t.state.readOnly) {
    var i = "input.type.compose";
    if (r.curOp && (r.curOp.lastChange || (i = "input.type.compose.start")), e.annotations)
      try {
        e.annotations.some(function(n) {
          n.value == "input" && (n.value = i);
        });
      } catch (n) {
        console.error(n);
      }
    else
      e.userEvent = i;
    return t.dispatch(e);
  }
}
function Ef(r, e) {
  var t;
  r.curOp && (r.curOp.$changeStart = void 0), (e ? kl : vs)(r.cm6);
  let i = (t = r.curOp) === null || t === void 0 ? void 0 : t.$changeStart;
  i != null && r.cm6.dispatch({ selection: { anchor: i } });
}
var hx = {
  Left: (r) => Ki(r.cm6, { key: "Left" }, "editor"),
  Right: (r) => Ki(r.cm6, { key: "Right" }, "editor"),
  Up: (r) => Ki(r.cm6, { key: "Up" }, "editor"),
  Down: (r) => Ki(r.cm6, { key: "Down" }, "editor"),
  Backspace: (r) => Ki(r.cm6, { key: "Backspace" }, "editor"),
  Delete: (r) => Ki(r.cm6, { key: "Delete" }, "editor")
};
class ae {
  // --------------------------
  openDialog(e, t, i) {
    return fx(this, e, t, i);
  }
  openNotification(e, t) {
    return cx(this, e, t);
  }
  constructor(e) {
    this.state = {}, this.marks = /* @__PURE__ */ Object.create(null), this.$mid = 0, this.options = {}, this._handlers = {}, this.$lastChangeEndOffset = 0, this.virtualSelection = null, this.cm6 = e, this.onChange = this.onChange.bind(this), this.onSelectionChange = this.onSelectionChange.bind(this);
  }
  on(e, t) {
    wp(this, e, t);
  }
  off(e, t) {
    Qp(this, e, t);
  }
  signal(e, t, i) {
    $p(this, e, t, i);
  }
  indexFromPos(e) {
    return mt(this.cm6.state.doc, e);
  }
  posFromIndex(e) {
    return Qt(this.cm6.state.doc, e);
  }
  foldCode(e) {
    let t = this.cm6, i = t.state.selection.ranges, n = this.cm6.state.doc, s = mt(n, e), o = L.create([L.range(s, s)], 0).ranges;
    t.state.selection.ranges = o, Ky(t), t.state.selection.ranges = i;
  }
  firstLine() {
    return 0;
  }
  lastLine() {
    return this.cm6.state.doc.lines - 1;
  }
  lineCount() {
    return this.cm6.state.doc.lines;
  }
  setCursor(e, t) {
    typeof e == "object" && (t = e.ch, e = e.line);
    var i = mt(this.cm6.state.doc, { line: e, ch: t || 0 });
    this.cm6.dispatch({ selection: { anchor: i } }, { scrollIntoView: !this.curOp }), this.curOp && !this.curOp.isVimOp && this.onBeforeEndOperation();
  }
  getCursor(e) {
    var t = this.cm6.state.selection.main, i = e == "head" || !e ? t.head : e == "anchor" ? t.anchor : e == "start" ? t.from : e == "end" ? t.to : null;
    if (i == null)
      throw new Error("Invalid cursor type");
    return this.posFromIndex(i);
  }
  listSelections() {
    var e = this.cm6.state.doc;
    return this.cm6.state.selection.ranges.map((t) => ({
      anchor: Qt(e, t.anchor),
      head: Qt(e, t.head)
    }));
  }
  setSelections(e, t) {
    var i = this.cm6.state.doc, n = e.map((s) => {
      var o = mt(i, s.head), a = mt(i, s.anchor);
      return o == a ? L.cursor(o, 1) : L.range(a, o);
    });
    this.cm6.dispatch({
      selection: L.create(n, t)
    });
  }
  setSelection(e, t, i) {
    this.setSelections([{ anchor: e, head: t }], 0), i && i.origin == "*mouse" && this.onBeforeEndOperation();
  }
  getLine(e) {
    var t = this.cm6.state.doc;
    return e < 0 || e >= t.lines ? "" : this.cm6.state.doc.line(e + 1).text;
  }
  getLineHandle(e) {
    return this.$lineHandleChanges || (this.$lineHandleChanges = []), { row: e, index: this.indexFromPos(new Ut(e, 0)) };
  }
  getLineNumber(e) {
    var t = this.$lineHandleChanges;
    if (!t)
      return null;
    for (var i = e.index, n = 0; n < t.length; n++)
      if (i = t[n].changes.mapPos(i, 1, Ue.TrackAfter), i == null)
        return null;
    var s = this.posFromIndex(i);
    return s.ch == 0 ? s.line : null;
  }
  releaseLineHandles() {
    this.$lineHandleChanges = void 0;
  }
  getRange(e, t) {
    var i = this.cm6.state.doc;
    return this.cm6.state.sliceDoc(mt(i, e), mt(i, t));
  }
  replaceRange(e, t, i, n) {
    i || (i = t);
    var s = this.cm6.state.doc, o = mt(s, t), a = mt(s, i);
    Wr(this, { changes: { from: o, to: a, insert: e } });
  }
  replaceSelection(e) {
    Wr(this, this.cm6.state.replaceSelection(e));
  }
  replaceSelections(e) {
    var t = this.cm6.state.selection.ranges, i = t.map((n, s) => ({ from: n.from, to: n.to, insert: e[s] || "" }));
    Wr(this, { changes: i });
  }
  getSelection() {
    return this.getSelections().join(`
`);
  }
  getSelections() {
    var e = this.cm6;
    return e.state.selection.ranges.map((t) => e.state.sliceDoc(t.from, t.to));
  }
  somethingSelected() {
    return this.cm6.state.selection.ranges.some((e) => !e.empty);
  }
  getInputField() {
    return this.cm6.contentDOM;
  }
  clipPos(e) {
    var t = this.cm6.state.doc, i = e.ch, n = e.line + 1;
    n < 1 && (n = 1, i = 0), n > t.lines && (n = t.lines, i = Number.MAX_VALUE);
    var s = t.line(n);
    return i = Math.min(Math.max(0, i), s.to - s.from), new Ut(n - 1, i);
  }
  getValue() {
    return this.cm6.state.doc.toString();
  }
  setValue(e) {
    var t = this.cm6;
    return t.dispatch({
      changes: { from: 0, to: t.state.doc.length, insert: e },
      selection: L.range(0, 0)
    });
  }
  focus() {
    return this.cm6.focus();
  }
  blur() {
    return this.cm6.contentDOM.blur();
  }
  defaultTextHeight() {
    return this.cm6.defaultLineHeight;
  }
  findMatchingBracket(e, t) {
    var i = this.cm6.state, n = mt(i.doc, e), s = ki(i, n + 1, -1);
    return s && s.end ? { to: Qt(i.doc, s.end.from) } : (s = ki(i, n, 1), s && s.end ? { to: Qt(i.doc, s.end.from) } : { to: void 0 });
  }
  scanForBracket(e, t, i, n) {
    return Ox(this, e, t, i, n);
  }
  indentLine(e, t) {
    t ? this.indentMore() : this.indentLess();
  }
  indentMore() {
    oO(this.cm6);
  }
  indentLess() {
    aO(this.cm6);
  }
  execCommand(e) {
    if (ae.commands.hasOwnProperty(e))
      ae.commands[e](this);
    else if (e == "goLineLeft")
      Yd(this.cm6);
    else if (e == "goLineRight") {
      Wd(this.cm6);
      let t = this.cm6.state, i = t.selection.main.head;
      i < t.doc.length && t.sliceDoc(i, i + 1) !== `
` && Rv(this.cm6);
    } else
      console.log(e + " is not implemented");
  }
  setBookmark(e, t) {
    var i = t?.insertLeft ? 1 : -1, n = this.indexFromPos(e), s = new mx(this, n, i);
    return s;
  }
  addOverlay({ query: e }) {
    let t = new w1({
      regexp: !0,
      search: e.source,
      caseSensitive: !/i/.test(e.flags)
    });
    if (t.valid) {
      t.forVim = !0, this.cm6Query = t;
      let i = Ba.of(t);
      return this.cm6.dispatch({ effects: i }), t;
    }
  }
  removeOverlay(e) {
    if (!this.cm6Query)
      return;
    this.cm6Query.forVim = !1;
    let t = Ba.of(this.cm6Query);
    this.cm6.dispatch({ effects: t });
  }
  getSearchCursor(e, t) {
    var i = this, n = null, s = null, o = !1;
    t.ch == null && (t.ch = Number.MAX_VALUE);
    var a = mt(i.cm6.state.doc, t), l = e.source.replace(/(\\.|{(?:\d+(?:,\d*)?|,\d+)})|[{}]/g, function(v, b) {
      return b || "\\" + v;
    });
    function c(v, b = 0, w = v.length) {
      return new Pl(v, l, { ignoreCase: e.ignoreCase }, b, w);
    }
    function u(v) {
      var b = i.cm6.state.doc;
      if (v > b.length)
        return null;
      let w = c(b, v).next();
      return w.done ? null : w.value;
    }
    var p = 1e4;
    function m(v, b) {
      var w = i.cm6.state.doc;
      for (let C = 1; ; C++) {
        let A = Math.max(v, b - C * p), X = c(w, A, b), _ = null;
        for (; !X.next().done; )
          _ = X.value;
        if (_ && (A == v || _.from > A + 10))
          return _;
        if (A == v)
          return null;
      }
    }
    return {
      findNext: function() {
        return this.find(!1);
      },
      findPrevious: function() {
        return this.find(!0);
      },
      find: function(v) {
        var b = i.cm6.state.doc;
        if (v) {
          let w = n ? o ? n.to - 1 : n.from : a;
          n = m(0, w);
        } else {
          let w = n ? o ? n.to + 1 : n.to : a;
          n = u(w);
        }
        return s = n && {
          from: Qt(b, n.from),
          to: Qt(b, n.to),
          match: n.match
        }, o = n ? n.from == n.to : !1, n && n.match;
      },
      from: function() {
        return s?.from;
      },
      to: function() {
        return s?.to;
      },
      replace: function(v) {
        n && (Wr(i, {
          changes: { from: n.from, to: n.to, insert: v }
        }), n.to = n.from + v.length, s && (s.to = Qt(i.cm6.state.doc, n.to)));
      },
      get match() {
        return s && s.match;
      }
    };
  }
  findPosV(e, t, i, n) {
    let { cm6: s } = this;
    const o = s.state.doc;
    let a = i == "page" ? s.dom.clientHeight : 0;
    const l = mt(o, e);
    let c = L.cursor(l, 1, void 0, n), u = Math.round(Math.abs(t));
    for (let m = 0; m < u; m++)
      i == "page" ? c = s.moveVertically(c, t > 0, a) : i == "line" && (c = s.moveVertically(c, t > 0));
    let p = Qt(o, c.head);
    return (t < 0 && c.head == 0 && n != 0 && e.line == 0 && e.ch != 0 || t > 0 && c.head == o.length && p.ch != n && e.line == p.line) && (p.hitSide = !0), p;
  }
  charCoords(e, t) {
    var i = this.cm6.contentDOM.getBoundingClientRect(), n = mt(this.cm6.state.doc, e), s = this.cm6.coordsAtPos(n), o = -i.top;
    return { left: (s?.left || 0) - i.left, top: (s?.top || 0) + o, bottom: (s?.bottom || 0) + o };
  }
  coordsChar(e, t) {
    var i = this.cm6.contentDOM.getBoundingClientRect(), n = this.cm6.posAtCoords({ x: e.left + i.left, y: e.top + i.top }) || 0;
    return Qt(this.cm6.state.doc, n);
  }
  getScrollInfo() {
    var e = this.cm6.scrollDOM;
    return {
      left: e.scrollLeft,
      top: e.scrollTop,
      height: e.scrollHeight,
      width: e.scrollWidth,
      clientHeight: e.clientHeight,
      clientWidth: e.clientWidth
    };
  }
  scrollTo(e, t) {
    e != null && (this.cm6.scrollDOM.scrollLeft = e), t != null && (this.cm6.scrollDOM.scrollTop = t);
  }
  scrollIntoView(e, t) {
    if (e) {
      var i = this.indexFromPos(e);
      this.cm6.dispatch({
        effects: N.scrollIntoView(i)
      });
    } else
      this.cm6.dispatch({ scrollIntoView: !0, userEvent: "scroll" });
  }
  getWrapperElement() {
    return this.cm6.dom;
  }
  // for tests
  getMode() {
    return { name: this.getOption("mode") };
  }
  setSize(e, t) {
    this.cm6.dom.style.width = e + 4 + "px", this.cm6.dom.style.height = t + "px", this.refresh();
  }
  refresh() {
    this.cm6.measure();
  }
  // event listeners
  destroy() {
    this.removeOverlay();
  }
  getLastEditEnd() {
    return this.posFromIndex(this.$lastChangeEndOffset);
  }
  onChange(e) {
    this.$lineHandleChanges && this.$lineHandleChanges.push(e);
    for (let i in this.marks)
      this.marks[i].update(e.changes);
    this.virtualSelection && (this.virtualSelection.ranges = this.virtualSelection.ranges.map((i) => i.map(e.changes)));
    var t = this.curOp = this.curOp || {};
    e.changes.iterChanges((i, n, s, o, a) => {
      (t.$changeStart == null || t.$changeStart > s) && (t.$changeStart = s), this.$lastChangeEndOffset = o;
      var l = { text: a.toJSON() };
      t.lastChange ? t.lastChange.next = t.lastChange = l : t.lastChange = t.change = l;
    }, !0), t.changeHandlers || (t.changeHandlers = this._handlers.change && this._handlers.change.slice());
  }
  onSelectionChange() {
    var e = this.curOp = this.curOp || {};
    e.cursorActivityHandlers || (e.cursorActivityHandlers = this._handlers.cursorActivity && this._handlers.cursorActivity.slice()), this.curOp.cursorActivity = !0;
  }
  operation(e, t) {
    this.curOp || (this.curOp = { $d: 0 }), this.curOp.$d++;
    try {
      var i = e();
    } finally {
      this.curOp && (this.curOp.$d--, this.curOp.$d || this.onBeforeEndOperation());
    }
    return i;
  }
  onBeforeEndOperation() {
    var e = this.curOp, t = !1;
    e && (e.change && Lf(e.changeHandlers, this, e.change), e && e.cursorActivity && (Lf(e.cursorActivityHandlers, this, null), e.isVimOp && (t = !0)), this.curOp = null), t && this.scrollIntoView();
  }
  moveH(e, t) {
    if (t == "char") {
      var i = this.getCursor();
      this.setCursor(i.line, i.ch + e);
    }
  }
  setOption(e, t) {
    switch (e) {
      case "keyMap":
        this.state.keyMap = t;
        break;
      case "textwidth":
        this.state.textwidth = t;
        break;
    }
  }
  getOption(e) {
    switch (e) {
      case "firstLineNumber":
        return 1;
      case "tabSize":
        return this.cm6.state.tabSize || 4;
      case "readOnly":
        return this.cm6.state.readOnly;
      case "indentWithTabs":
        return this.cm6.state.facet(Ni) == "	";
      // TODO
      case "indentUnit":
        return this.cm6.state.facet(Ni).length || 2;
      case "textwidth":
        return this.state.textwidth;
      // for tests
      case "keyMap":
        return this.state.keyMap || "vim";
    }
  }
  toggleOverwrite(e) {
    this.state.overwrite = e;
  }
  getTokenTypeAt(e) {
    var t, i = this.indexFromPos(e), n = dd(this.cm6.state, i), s = n?.resolve(i), o = ((t = s?.type) === null || t === void 0 ? void 0 : t.name) || "";
    return /comment/i.test(o) ? "comment" : /string/i.test(o) ? "string" : "";
  }
  overWriteSelection(e) {
    var t = this.cm6.state.doc, i = this.cm6.state.selection, n = i.ranges.map((s) => {
      if (s.empty) {
        var o = s.to < t.length ? t.sliceString(s.from, s.to + 1) : "";
        if (o && !/\n/.test(o))
          return L.range(s.from, s.to + 1);
      }
      return s;
    });
    this.cm6.dispatch({
      selection: L.create(n, i.mainIndex)
    }), this.replaceSelection(e);
  }
  /*** multiselect ****/
  isInMultiSelectMode() {
    return this.cm6.state.selection.ranges.length > 1;
  }
  virtualSelectionMode() {
    return !!this.virtualSelection;
  }
  forEachSelection(e) {
    var t = this.cm6.state.selection;
    this.virtualSelection = L.create(t.ranges, t.mainIndex);
    for (var i = 0; i < this.virtualSelection.ranges.length; i++) {
      var n = this.virtualSelection.ranges[i];
      n && (this.cm6.dispatch({ selection: L.create([n]) }), e(), this.virtualSelection.ranges[i] = this.cm6.state.selection.ranges[0]);
    }
    this.cm6.dispatch({ selection: this.virtualSelection }), this.virtualSelection = null;
  }
  hardWrap(e) {
    return yx(this, e);
  }
}
ae.isMac = typeof navigator < "u" && /* @__PURE__ */ /Mac/.test(navigator.platform);
ae.Pos = Ut;
ae.StringStream = cv;
ae.commands = {
  toggleLineComment: function(r) {
    Cd(r.cm6);
  },
  cursorCharLeft: function(r) {
    wl(r.cm6);
  },
  redo: function(r) {
    Ef(r, !1);
  },
  undo: function(r) {
    Ef(r, !0);
  },
  newlineAndIndent: function(r) {
    _a({
      state: r.cm6.state,
      dispatch: (e) => Wr(r, e)
    });
  },
  indentAuto: function(r) {
    sO(r.cm6);
  },
  newlineAndIndentContinueComment: void 0,
  save: void 0
};
ae.isWordChar = function(r) {
  return Ga.test(r);
};
ae.keys = hx;
ae.addClass = function(r, e) {
};
ae.rmClass = function(r, e) {
};
ae.e_preventDefault = function(r) {
  r.preventDefault();
};
ae.e_stop = function(r) {
  var e, t;
  (e = r?.stopPropagation) === null || e === void 0 || e.call(r), (t = r?.preventDefault) === null || t === void 0 || t.call(r);
};
ae.lookupKey = function(e, t, i) {
  var n = ae.keys[e];
  !n && /^Arrow/.test(e) && (n = ae.keys[e.slice(5)]), n && i(n);
};
ae.on = wp;
ae.off = Qp;
ae.signal = $p;
ae.findMatchingTag = px;
ae.findEnclosingTag = gx;
ae.keyName = void 0;
function Pp(r, e, t) {
  var i = document.createElement("div");
  return i.appendChild(e), i;
}
function Cp(r, e) {
  r.state.currentNotificationClose && r.state.currentNotificationClose(), r.state.currentNotificationClose = e;
}
function cx(r, e, t) {
  Cp(r, a);
  var i = Pp(r, e, t && t.bottom), n = !1, s, o = t && typeof t.duration < "u" ? t.duration : 5e3;
  function a() {
    n || (n = !0, clearTimeout(s), i.remove(), Ap(r, i));
  }
  return i.onclick = function(l) {
    l.preventDefault(), a();
  }, Tp(r, i), o && (s = setTimeout(a, o)), a;
}
function Tp(r, e) {
  var t = r.state.dialog;
  r.state.dialog = e, e.style.flex = "1", e && t !== e && (t && t.contains(document.activeElement) && r.focus(), t && t.parentElement ? t.parentElement.replaceChild(e, t) : t && t.remove(), ae.signal(r, "dialog"));
}
function Ap(r, e) {
  r.state.dialog == e && (r.state.dialog = null, ae.signal(r, "dialog"));
}
function fx(r, e, t, i) {
  i || (i = {}), Cp(r, void 0);
  var n = Pp(r, e, i.bottom), s = !1;
  Tp(r, n);
  function o(l) {
    if (typeof l == "string")
      a.value = l;
    else {
      if (s)
        return;
      s = !0, Ap(r, n), r.state.dialog || r.focus(), i.onClose && i.onClose(n);
    }
  }
  var a = n.getElementsByTagName("input")[0];
  return a && (i.value && (a.value = i.value, i.selectValueOnOpen !== !1 && a.select()), i.onInput && ae.on(a, "input", function(l) {
    i.onInput(l, a.value, o);
  }), i.onKeyUp && ae.on(a, "keyup", function(l) {
    i.onKeyUp(l, a.value, o);
  }), ae.on(a, "keydown", function(l) {
    i && i.onKeyDown && i.onKeyDown(l, a.value, o) || (l.keyCode == 13 && t && t(a.value), (l.keyCode == 27 || i.closeOnEnter !== !1 && l.keyCode == 13) && (a.blur(), ae.e_stop(l), o()));
  }), i.closeOnBlur !== !1 && ae.on(a, "blur", function() {
    setTimeout(function() {
      document.activeElement !== a && o();
    });
  }), a.focus()), o;
}
var ux = { "(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<", "<": ">>", ">": "<<" };
function dx(r) {
  return r && r.bracketRegex || /[(){}[\]]/;
}
function Ox(r, e, t, i, n) {
  for (var s = n && n.maxScanLineLength || 1e4, o = n && n.maxScanLines || 1e3, a = [], l = dx(n), c = t > 0 ? Math.min(e.line + o, r.lastLine() + 1) : Math.max(r.firstLine() - 1, e.line - o), u = e.line; u != c; u += t) {
    var p = r.getLine(u);
    if (p) {
      var m = t > 0 ? 0 : p.length - 1, v = t > 0 ? p.length : -1;
      if (!(p.length > s))
        for (u == e.line && (m = e.ch - (t < 0 ? 1 : 0)); m != v; m += t) {
          var b = p.charAt(m);
          if (l.test(b)) {
            var w = ux[b];
            if (w && w.charAt(1) == ">" == t > 0)
              a.push(b);
            else if (a.length)
              a.pop();
            else
              return { pos: new Ut(u, m), ch: b };
          }
        }
    }
  }
  return u - t == (t > 0 ? r.lastLine() : r.firstLine()) ? !1 : null;
}
function px(r, e) {
  return null;
}
function gx(r, e) {
  var t, i, n = r.cm6.state, s = r.indexFromPos(e);
  if (s < n.doc.length) {
    var o = n.sliceDoc(s, s + 1);
    o == "<" && s++;
  }
  for (var a = dd(n, s), l = a?.resolve(s) || null; l; ) {
    if (((t = l.firstChild) === null || t === void 0 ? void 0 : t.type.name) == "OpenTag" && ((i = l.lastChild) === null || i === void 0 ? void 0 : i.type.name) == "CloseTag")
      return {
        open: _f(n.doc, l.firstChild),
        close: _f(n.doc, l.lastChild)
      };
    l = l.parent;
  }
}
function _f(r, e) {
  return {
    from: Qt(r, e.from),
    to: Qt(r, e.to)
  };
}
class mx {
  constructor(e, t, i) {
    this.cm = e, this.id = e.$mid++, this.offset = t, this.assoc = i, e.marks[this.id] = this;
  }
  clear() {
    delete this.cm.marks[this.id];
  }
  find() {
    return this.offset == null ? null : this.cm.posFromIndex(this.offset);
  }
  update(e) {
    this.offset != null && (this.offset = e.mapPos(this.offset, this.assoc, Ue.TrackDel));
  }
}
function yx(r, e) {
  for (var t, i = e.column || r.getOption("textwidth") || 80, n = e.allowMerge != !1, s = Math.min(e.from, e.to), o = Math.max(e.from, e.to); s <= o; ) {
    var a = r.getLine(s);
    if (a.length > i) {
      var l = b(a, i, 5);
      if (l) {
        var c = (t = /^\s*/.exec(a)) === null || t === void 0 ? void 0 : t[0];
        r.replaceRange(`
` + c, new Ut(s, l.start), new Ut(s, l.end));
      }
      o++;
    } else if (n && /\S/.test(a) && s != o) {
      var u = r.getLine(s + 1);
      if (u && /\S/.test(u)) {
        var p = a.replace(/\s+$/, ""), m = u.replace(/^\s+/, ""), v = p + " " + m, l = b(v, i, 5);
        l && l.start > p.length || v.length < i ? (r.replaceRange(" ", new Ut(s, p.length), new Ut(s + 1, u.length - m.length)), s--, o--) : p.length < a.length && r.replaceRange("", new Ut(s, p.length), new Ut(s, a.length));
      }
    }
    s++;
  }
  return s;
  function b(w, C, A) {
    if (!(w.length < C)) {
      var X = w.slice(0, C), _ = w.slice(C), H = /^(?:(\s+)|(\S+)(\s+))/.exec(_), B = /(?:(\s+)|(\s+)(\S+))$/.exec(X), Y = 0, j = 0;
      if (B && !B[2] && (Y = C - B[1].length, j = C), H && !H[2] && (Y || (Y = C), j = C + H[1].length), Y)
        return {
          start: Y,
          end: j
        };
      if (B && B[2] && B.index > A)
        return {
          start: B.index,
          end: B.index + B[2].length
        };
      if (H && H[2])
        return Y = C + H[2].length, {
          start: Y,
          end: Y + H[3].length
        };
    }
  }
}
let Ua = Y0 || /* @__PURE__ */ (function() {
  let r = { cursorBlinkRate: 1200 };
  return function() {
    return r;
  };
})();
class vx {
  constructor(e, t, i, n, s, o, a, l, c, u) {
    this.left = e, this.top = t, this.height = i, this.fontFamily = n, this.fontSize = s, this.fontWeight = o, this.color = a, this.className = l, this.letter = c, this.partial = u;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", e.style.height = this.height + "px", e.style.lineHeight = this.height + "px", e.style.fontFamily = this.fontFamily, e.style.fontSize = this.fontSize, e.style.fontWeight = this.fontWeight, e.style.color = this.partial ? "transparent" : this.color, e.className = this.className, e.textContent = this.letter;
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.height == e.height && this.fontFamily == e.fontFamily && this.fontSize == e.fontSize && this.fontWeight == e.fontWeight && this.color == e.color && this.className == e.className && this.letter == e.letter;
  }
}
class Sx {
  constructor(e, t) {
    this.view = e, this.rangePieces = [], this.cursors = [], this.cm = t, this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) }, this.cursorLayer = e.scrollDOM.appendChild(document.createElement("div")), this.cursorLayer.className = "cm-cursorLayer cm-vimCursorLayer", this.cursorLayer.setAttribute("aria-hidden", "true"), e.requestMeasure(this.measureReq), this.setBlinkRate();
  }
  setBlinkRate() {
    let t = Ua(this.cm.cm6.state).cursorBlinkRate;
    this.cursorLayer.style.animationDuration = t + "ms";
  }
  update(e) {
    (e.selectionSet || e.geometryChanged || e.viewportChanged) && (this.view.requestMeasure(this.measureReq), this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink"), bx(e) && this.setBlinkRate();
  }
  scheduleRedraw() {
    this.view.requestMeasure(this.measureReq);
  }
  readPos() {
    let { state: e } = this.view, t = [];
    for (let i of e.selection.ranges) {
      let n = i == e.selection.main, s = Qx(this.cm, this.view, i, n);
      s && t.push(s);
    }
    return { cursors: t };
  }
  drawSel({ cursors: e }) {
    if (e.length != this.cursors.length || e.some((t, i) => !t.eq(this.cursors[i]))) {
      let t = this.cursorLayer.children;
      if (t.length !== e.length) {
        this.cursorLayer.textContent = "";
        for (const i of e)
          this.cursorLayer.appendChild(i.draw());
      } else
        e.forEach((i, n) => i.adjust(t[n]));
      this.cursors = e;
    }
  }
  destroy() {
    this.cursorLayer.remove();
  }
}
function bx(r) {
  return Ua(r.startState) != Ua(r.state);
}
const kx = {
  ".cm-vimMode .cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" },
    caretColor: "transparent !important"
  },
  ".cm-fat-cursor": {
    position: "absolute",
    background: "#ff9696",
    border: "none",
    whiteSpace: "pre"
  },
  "&:not(.cm-focused) .cm-fat-cursor": {
    background: "none",
    outline: "solid 1px #ff9696",
    color: "transparent !important"
  }
}, xx = /* @__PURE__ */ qi.highest(/* @__PURE__ */ N.theme(kx));
function wx(r) {
  let e = r.scrollDOM.getBoundingClientRect();
  return { left: (r.textDirection == Ce.LTR ? e.left : e.right - r.scrollDOM.clientWidth) - r.scrollDOM.scrollLeft * r.scaleX, top: e.top - r.scrollDOM.scrollTop * r.scaleY };
}
function Qx(r, e, t, i) {
  var n, s, o, a;
  let l = t.head, c = !1, u = 1, p = r.state.vim;
  if (p && (!p.insertMode || r.state.overwrite)) {
    if (c = !0, p.visualBlock && !i)
      return null;
    t.anchor < t.head && (l < e.state.doc.length && e.state.sliceDoc(l, l + 1)) != `
` && l--, r.state.overwrite ? u = 0.2 : p.status && (u = 0.5);
  }
  if (c) {
    let v = l < e.state.doc.length && e.state.sliceDoc(l, l + 1);
    v && /[\uDC00-\uDFFF]/.test(v) && l > 1 && (l--, v = e.state.sliceDoc(l, l + 1));
    let b = e.coordsAtPos(l, 1);
    if (!b)
      return null;
    let w = wx(e), C = e.domAtPos(l), A = C ? C.node : e.contentDOM;
    for (A instanceof Text && C.offset >= A.data.length && !((n = A.parentElement) === null || n === void 0) && n.nextSibling && (A = (s = A.parentElement) === null || s === void 0 ? void 0 : s.nextSibling, C = { node: A, offset: 0 }); C && C.node instanceof HTMLElement; )
      A = C.node, C = { node: C.node.childNodes[C.offset], offset: 0 };
    if (!(A instanceof HTMLElement)) {
      if (!A.parentNode)
        return null;
      A = A.parentNode;
    }
    let X = getComputedStyle(A), _ = b.left, H = (a = (o = e).coordsForChar) === null || a === void 0 ? void 0 : a.call(o, l);
    if (H && (_ = H.left), !v || v == `
` || v == "\r")
      v = " ";
    else if (v == "	") {
      v = " ";
      var m = e.coordsAtPos(l + 1, -1);
      m && (_ = m.left - (m.left - b.left) / parseInt(X.tabSize));
    } else /[\uD800-\uDBFF]/.test(v) && l < e.state.doc.length - 1 && (v += e.state.sliceDoc(l + 1, l + 2));
    let B = b.bottom - b.top;
    return new vx((_ - w.left) / e.scaleX, (b.top - w.top + B * (1 - u)) / e.scaleY, B * u / e.scaleY, X.fontFamily, X.fontSize, X.fontWeight, X.color, i ? "cm-fat-cursor cm-cursor-primary" : "cm-fat-cursor cm-cursor-secondary", v, u != 1);
  } else
    return null;
}
var $x = typeof navigator < "u" && /* @__PURE__ */ /linux/i.test(navigator.platform) && /* @__PURE__ */ / Gecko\/\d+/.exec(navigator.userAgent);
const Zi = /* @__PURE__ */ lx(ae), Px = 250, Cx = /* @__PURE__ */ N.baseTheme({
  ".cm-vimMode .cm-cursorLayer:not(.cm-vimCursorLayer)": {
    display: "none"
  },
  ".cm-vim-panel": {
    padding: "0px 10px",
    fontFamily: "monospace",
    minHeight: "1.3em",
    display: "flex"
  },
  ".cm-vim-panel input": {
    border: "none",
    outline: "none",
    backgroundColor: "inherit"
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" }
}), Tx = /* @__PURE__ */ Tt.fromClass(class {
  constructor(r) {
    this.status = "", this.query = null, this.decorations = ee.none, this.waitForCopy = !1, this.lastKeydown = "", this.useNextTextInput = !1, this.compositionText = "", this.view = r;
    const e = this.cm = new ae(r);
    Zi.enterVimMode(this.cm), this.view.cm = this.cm, this.cm.state.vimPlugin = this, this.blockCursor = new Sx(r, e), this.updateClass(), this.cm.on("vim-command-done", () => {
      e.state.vim && (e.state.vim.status = ""), this.blockCursor.scheduleRedraw(), this.updateStatus();
    }), this.cm.on("vim-mode-change", (t) => {
      e.state.vim && (e.state.vim.mode = t.mode, t.subMode && (e.state.vim.mode += t.subMode === "linewise" ? " line" : " block"), e.state.vim.status = "", this.blockCursor.scheduleRedraw(), this.updateClass(), this.updateStatus());
    }), this.cm.on("dialog", () => {
      this.cm.state.statusbar ? this.updateStatus() : r.dispatch({
        effects: Mp.of(!!this.cm.state.dialog)
      });
    }), this.dom = document.createElement("span"), this.spacer = document.createElement("span"), this.spacer.style.flex = "1", this.statusButton = document.createElement("span"), this.statusButton.onclick = (t) => {
      Zi.handleKey(this.cm, "<Esc>", "user"), this.cm.focus();
    }, this.statusButton.style.cssText = "cursor: pointer";
  }
  update(r) {
    var e;
    if ((r.viewportChanged || r.docChanged) && this.query && this.highlight(this.query), r.docChanged && this.cm.onChange(r), r.selectionSet && this.cm.onSelectionChange(), r.viewportChanged, this.cm.curOp && !this.cm.curOp.isVimOp && this.cm.onBeforeEndOperation(), r.transactions) {
      for (let t of r.transactions)
        for (let i of t.effects)
          if (i.is(Ba))
            if (!((e = i.value) === null || e === void 0 ? void 0 : e.forVim))
              this.highlight(null);
            else {
              let s = i.value.create();
              this.highlight(s);
            }
    }
    this.blockCursor.update(r);
  }
  updateClass() {
    const r = this.cm.state;
    !r.vim || r.vim.insertMode && !r.overwrite ? this.view.scrollDOM.classList.remove("cm-vimMode") : this.view.scrollDOM.classList.add("cm-vimMode");
  }
  updateStatus() {
    let r = this.cm.state.statusbar, e = this.cm.state.vim;
    if (!r || !e)
      return;
    let t = this.cm.state.dialog;
    if (t)
      t.parentElement != r && (r.textContent = "", r.appendChild(t));
    else {
      r.textContent = "";
      var i = (e.mode || "normal").toUpperCase();
      e.insertModeReturn && (i += "(C-O)"), this.statusButton.textContent = `--${i}--`, r.appendChild(this.statusButton), r.appendChild(this.spacer);
    }
    this.dom.textContent = e.status, r.appendChild(this.dom);
  }
  destroy() {
    Zi.leaveVimMode(this.cm), this.updateClass(), this.blockCursor.destroy(), delete this.view.cm;
  }
  highlight(r) {
    if (this.query = r, !r)
      return this.decorations = ee.none;
    let { view: e } = this, t = new Ii();
    for (let i = 0, n = e.visibleRanges, s = n.length; i < s; i++) {
      let { from: o, to: a } = n[i];
      for (; i < s - 1 && a > n[i + 1].from - 2 * Px; )
        a = n[++i].to;
      r.highlight(e.state, o, a, (l, c) => {
        t.add(l, c, Mx);
      });
    }
    return this.decorations = t.finish();
  }
  handleKey(r, e) {
    const t = this.cm;
    let i = t.state.vim;
    if (!i)
      return;
    const n = Zi.vimKeyFromEvent(r, i);
    if (ae.signal(this.cm, "inputEvent", { type: "handleKey", key: n }), !n)
      return;
    if (n == "<Esc>" && !i.insertMode && !i.visualMode && this.query) {
      const a = i.searchState_;
      a && (t.removeOverlay(a.getOverlay()), a.setOverlay(null));
    }
    if (n === "<C-c>" && !ae.isMac && t.somethingSelected())
      return this.waitForCopy = !0, !0;
    i.status = (i.status || "") + n;
    let o = Zi.multiSelectHandleKey(t, n, "user");
    return i = Zi.maybeInitVimState_(t), !o && i.insertMode && t.state.overwrite && (r.key && r.key.length == 1 && !/\n/.test(r.key) ? (o = !0, t.overWriteSelection(r.key)) : r.key == "Backspace" && (o = !0, ae.commands.cursorCharLeft(t))), o && (ae.signal(this.cm, "vim-keypress", n), r.preventDefault(), r.stopPropagation(), this.blockCursor.scheduleRedraw()), this.updateStatus(), !!o;
  }
}, {
  eventHandlers: {
    copy: function(r, e) {
      this.waitForCopy && (this.waitForCopy = !1, Promise.resolve().then(() => {
        var t = this.cm, i = t.state.vim;
        i && (i.insertMode ? t.setSelection(t.getCursor(), t.getCursor()) : t.operation(() => {
          t.curOp && (t.curOp.isVimOp = !0), Zi.handleKey(t, "<Esc>", "user");
        }));
      }));
    },
    compositionstart: function(r, e) {
      this.useNextTextInput = !0, ae.signal(this.cm, "inputEvent", r);
    },
    compositionupdate: function(r, e) {
      ae.signal(this.cm, "inputEvent", r);
    },
    compositionend: function(r, e) {
      ae.signal(this.cm, "inputEvent", r);
    },
    keypress: function(r, e) {
      ae.signal(this.cm, "inputEvent", r), this.lastKeydown == "Dead" && this.handleKey(r, e);
    },
    keydown: function(r, e) {
      ae.signal(this.cm, "inputEvent", r), this.lastKeydown = r.key, this.lastKeydown == "Unidentified" || this.lastKeydown == "Process" || this.lastKeydown == "Dead" ? this.useNextTextInput = !0 : (this.useNextTextInput = !1, this.handleKey(r, e));
    }
  },
  provide: () => [
    N.inputHandler.of((r, e, t, i) => {
      var n, s, o = Yl(r);
      if (!o)
        return !1;
      var a = (n = o.state) === null || n === void 0 ? void 0 : n.vim, l = o.state.vimPlugin;
      if (a && !a.insertMode && !(!((s = o.curOp) === null || s === void 0) && s.isVimOp)) {
        if (i === "\0\0")
          return !0;
        if (ae.signal(o, "inputEvent", {
          type: "text",
          text: i,
          from: e,
          to: t
        }), i.length == 1 && l.useNextTextInput) {
          if (a.expectLiteralNext && r.composing)
            return l.compositionText = i, !1;
          if (l.compositionText) {
            var c = l.compositionText;
            l.compositionText = "";
            var u = r.state.selection.main.head, p = r.state.sliceDoc(u - c.length, u);
            if (c === p) {
              var m = o.getCursor();
              o.replaceRange("", o.posFromIndex(u - c.length), m);
            }
          }
          return l.handleKey({
            key: i,
            preventDefault: () => {
            },
            stopPropagation: () => {
            }
          }), Ax(r), !0;
        }
      }
      return !1;
    })
  ],
  decorations: (r) => r.decorations
});
function Ax(r) {
  var e = r.scrollDOM.parentElement;
  if (e) {
    if ($x) {
      r.contentDOM.textContent = "\0\0", r.contentDOM.dispatchEvent(new CustomEvent("compositionend"));
      return;
    }
    var t = r.scrollDOM.nextSibling, i = window.getSelection(), n = i && {
      anchorNode: i.anchorNode,
      anchorOffset: i.anchorOffset,
      focusNode: i.focusNode,
      focusOffset: i.focusOffset
    };
    r.scrollDOM.remove(), e.insertBefore(r.scrollDOM, t);
    try {
      n && i && (i.setPosition(n.anchorNode, n.anchorOffset), n.focusNode && i.extend(n.focusNode, n.focusOffset));
    } catch (s) {
      console.error(s);
    }
    r.focus(), r.contentDOM.dispatchEvent(new CustomEvent("compositionend"));
  }
}
const Mx = /* @__PURE__ */ ee.mark({ class: "cm-searchMatch" }), Mp = /* @__PURE__ */ be.define(), Rx = /* @__PURE__ */ Ke.define({
  create: () => !1,
  update(r, e) {
    for (let t of e.effects)
      t.is(Mp) && (r = t.value);
    return r;
  },
  provide: (r) => tn.from(r, (e) => e ? Zx : null)
});
function Zx(r) {
  let e = document.createElement("div");
  e.className = "cm-vim-panel";
  let t = r.cm;
  return t.state.dialog && e.appendChild(t.state.dialog), { top: !1, dom: e };
}
function Xx(r) {
  let e = document.createElement("div");
  e.className = "cm-vim-panel";
  let t = r.cm;
  return t.state.statusbar = e, t.state.vimPlugin.updateStatus(), { dom: e };
}
function Lx(r = {}) {
  return [
    Cx,
    Tx,
    xx,
    r.status ? tn.of(Xx) : Rx
  ];
}
function Yl(r) {
  return r.cm || null;
}
const Fa = /* @__PURE__ */ new WeakMap(), Ex = (r, e) => r == null ? e : r === "true", Rp = (r) => {
  const e = r.match(/^(#{1,6})\s+(.+?)(?:\n|$)/);
  return e ? {
    exists: !0,
    level: e[1].length,
    title: e[2].trim()
  } : {
    exists: !1,
    level: 0,
    title: ""
  };
}, kr = ee.replace({}), _x = vn.define([
  { tag: Q.comment, color: "#3e4b59", fontStyle: "italic" },
  { tag: [Q.keyword, Q.operatorKeyword, Q.controlKeyword], color: "#d2a6ff" },
  { tag: [Q.string, Q.special(Q.string)], color: "#b8cc52" },
  { tag: [Q.number, Q.bool, Q.null], color: "#ff8f40" },
  { tag: [Q.variableName, Q.propertyName, Q.name], color: "#e6e1cf" },
  { tag: [Q.typeName, Q.className, Q.definition(Q.variableName)], color: "#59c2ff" },
  { tag: [Q.function(Q.variableName), Q.function(Q.propertyName)], color: "#95e6cb" },
  { tag: [Q.atom, Q.meta, Q.url], color: "#ffb454" },
  { tag: Q.heading, color: "#f3f4f5", fontWeight: "bold", textDecoration: "none" }
]), Vs = (r, e) => {
  const t = Te(r).cursor();
  if (!t.moveTo(e, -1)) return !1;
  do
    if (t.type.name === "FencedCode" || t.type.name === "InlineCode") return !0;
  while (t.parent());
  return !1;
};
class Bx extends Bt {
  constructor(e, t) {
    super(), this.symbol = e, this.className = t;
  }
  eq(e) {
    return e.symbol === this.symbol && e.className === this.className;
  }
  toDOM() {
    const e = document.createElement("span");
    return e.className = this.className, e.textContent = this.symbol, e;
  }
}
class jx extends Bt {
  constructor(e, t, i) {
    super(), this.level = e, this.start = t, this.end = i;
  }
  eq(e) {
    return e.level === this.level;
  }
  toDOM() {
    const e = document.createElement("span");
    return e.className = "cm-editor-heading-label", e.textContent = `H${this.level}`, e.addEventListener("mousedown", (t) => {
      t.stopPropagation(), t.preventDefault();
      const i = N.findFromDOM(e);
      i && Zp(i, e, this.start, this.end, this.level);
    }), e;
  }
}
const Ix = () => {
  document.querySelectorAll(".cm-editor-toolbar-dropdown").forEach((r) => r.remove());
}, Ns = (r, e) => {
  Ix();
  const t = document.createElement("div");
  t.className = "cm-editor-toolbar-dropdown";
  for (const s of e) {
    const o = document.createElement("button");
    o.type = "button", o.className = "cm-editor-toolbar-dropdown-item", s.active && o.classList.add("cm-editor-toolbar-dropdown-item-active"), o.textContent = s.label, o.addEventListener("click", (a) => {
      a.stopPropagation(), s.run(), t.remove();
    }), t.append(o);
  }
  const i = r.getBoundingClientRect();
  t.style.position = "fixed", t.style.top = `${i.bottom + 2}px`, t.style.left = `${i.left}px`;
  const n = (s) => {
    t.contains(s.target) || (t.remove(), document.removeEventListener("click", n));
  };
  requestAnimationFrame(() => document.addEventListener("click", n)), document.body.append(t);
}, Wx = Ke.define({
  create(r) {
    return zo(r);
  },
  update(r, e) {
    return !e.docChanged && !e.selection, zo(e.state);
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), zo = (r) => {
  const e = r.doc.toString(), t = r.selection.main, i = [], n = /^(#{1,6})\s/gm;
  for (const s of e.matchAll(n)) {
    const o = s[1].length, a = s.index ?? 0, l = a + s[0].length;
    Vs(r, a) || t.from <= l && t.to >= a || i.push(
      ee.replace({
        widget: new jx(o, a, l)
      }).range(a, l)
    );
  }
  return i.length ? ee.set(i, !0) : ee.none;
}, Zp = (r, e, t, i, n) => {
  Ns(e, [
    { level: 0, label: "Paragraph" },
    { level: 1, label: "Heading 1" },
    { level: 2, label: "Heading 2" },
    { level: 3, label: "Heading 3" },
    { level: 4, label: "Heading 4" },
    { level: 5, label: "Heading 5" },
    { level: 6, label: "Heading 6" }
  ].map((o) => ({
    label: o.label,
    active: o.level === n,
    run: () => {
      o.level === 0 ? r.dispatch({ changes: { from: t, to: i, insert: "" } }) : r.dispatch({ changes: { from: t, to: i, insert: "#".repeat(o.level) + " " } }), r.focus();
    }
  })));
}, Yx = Ke.define({
  create(r) {
    return Bf(r);
  },
  update(r, e) {
    return Bf(e.state);
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), Bf = (r) => {
  const e = r.doc.toString(), t = [], i = /^(#{1,6})\s+.+$/gm;
  for (const n of e.matchAll(i)) {
    const s = n[1]?.length, o = n.index;
    s == null || o == null || Vs(r, o) || t.push(
      ee.line({
        attributes: {
          class: `cm-editor-heading-line cm-editor-heading-level-${s}`
        }
      }).range(o)
    );
  }
  return t.length ? ee.set(t, !0) : ee.none;
}, zx = Ke.define({
  create(r) {
    return Vo(r);
  },
  update(r, e) {
    return !e.docChanged && !e.selection, Vo(e.state);
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), Dx = Ke.define({
  create(r) {
    return No(r);
  },
  update(r, e) {
    return !e.docChanged && !e.selection, No(e.state);
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), Vx = Ke.define({
  create(r) {
    return jf(r.doc.toString());
  },
  update(r, e) {
    return jf(e.state.doc.toString());
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), Nx = Ke.define({
  create(r) {
    return Do(r);
  },
  update(r, e) {
    return !e.docChanged && !e.selection, Do(e.state);
  },
  provide(r) {
    return N.decorations.from(r);
  }
}), Do = (r) => {
  const e = r.selection.main, t = [], i = (s) => {
    if (s.type.name === "FencedCode") {
      const o = s.from, a = s.to, l = r.doc.sliceString(o, a), c = l.indexOf(`
`), u = c >= 0 ? o + c + 1 : a, p = l.lastIndexOf(`
`, l.length - 2), m = p > c ? o + p + 1 : u, v = e.from <= a && e.to >= o, b = r.doc.lineAt(o), w = r.doc.lineAt(Math.max(o, a - 1));
      v || (t.push(kr.range(o, u)), t.push(kr.range(m, a)));
      for (let C = o; C < a; ) {
        const A = r.doc.lineAt(C), X = ["cm-editor-code-block"];
        A.from === b.from && X.push("cm-editor-code-block-first"), A.from === w.from && X.push("cm-editor-code-block-last"), t.push(
          ee.line({
            attributes: { class: X.join(" ") }
          }).range(A.from)
        ), C = A.to < a ? A.to + 1 : a;
      }
    }
    if (s.firstChild()) {
      do
        i(s);
      while (s.nextSibling());
      s.parent();
    }
  }, n = Te(r).cursor();
  if (n.firstChild())
    do
      i(n);
    while (n.nextSibling());
  return t.length ? ee.set(t, !0) : ee.none;
}, Vo = (r) => {
  const e = r.doc.toString(), t = r.selection.main, i = [], n = /\*\*([^*\n][\s\S]*?)\*\*/g;
  for (const s of e.matchAll(n)) {
    const o = s[0], a = s[1], l = s.index ?? 0, c = l + 2, u = c + a.length, p = l + o.length, m = t.from <= u && t.to >= c, v = t.empty && t.from >= c && t.from <= u;
    m || v || Vs(r, l) || (i.push(kr.range(l, l + 2)), i.push(kr.range(p - 2, p)));
  }
  return i.length ? ee.set(i, !0) : ee.none;
}, No = (r) => {
  const e = r.doc.toString(), t = r.selection.main, i = [], n = /\[([^\]]+)\]\(([^)]+)\)/g;
  for (const s of e.matchAll(n)) {
    const o = s[0], a = s[1], l = s.index ?? 0, u = l + 1 + a.length, p = l + o.length, m = t.from <= p && t.to >= l, v = t.empty && t.from >= l && t.from <= p;
    m || v || Vs(r, l) || (i.push(kr.range(l, l + 1)), i.push(kr.range(u, p)), i.push(
      ee.widget({
        widget: new Bx("↗", "cm-editor-link-icon"),
        side: 1
      }).range(u)
    ));
  }
  return i.length ? ee.set(i, !0) : ee.none;
}, jf = (r) => {
  const e = [], t = /^(?:---+|\*\*\*+|___+)$/gm;
  for (const i of r.matchAll(t)) {
    const n = i.index;
    n != null && e.push(
      ee.line({
        attributes: {
          class: "cm-editor-hr-line"
        }
      }).range(n)
    );
  }
  return e.length ? ee.set(e, !0) : ee.none;
}, is = (r, e, t = e) => {
  const i = r.state.selection.main;
  if (i.empty) {
    r.dispatch({
      changes: { from: i.from, to: i.to, insert: `${e}${t}` },
      selection: L.cursor(i.from + e.length)
    }), r.focus();
    return;
  }
  const n = r.state.sliceDoc(i.from, i.to);
  r.dispatch({
    changes: { from: i.from, to: i.to, insert: `${e}${n}${t}` },
    selection: L.range(i.from + e.length, i.to + e.length)
  }), r.focus();
}, ci = (r, e, t = e.length) => {
  const i = r.state.selection.main, n = r.state.doc.lineAt(i.from);
  r.dispatch({
    changes: { from: n.from, to: n.from, insert: e },
    selection: L.cursor(n.from + t)
  }), r.focus();
}, qx = (r, e) => {
  Ns(e, [
    { label: "Bullet list", run: () => ci(r, "- ") },
    { label: "Numbered list", run: () => ci(r, "1. ") },
    { label: "Task list", run: () => ci(r, "- [ ] ") }
  ]);
}, Gx = (r, e) => {
  Ns(e, [
    { label: "Inline code", run: () => is(r, "`") },
    { label: "Code block", run: () => ci(r, "```javascript\n\n```", 14) },
    { label: "Quote", run: () => ci(r, "> ") }
  ]);
}, Ux = (r, e) => {
  Ns(e, [
    { label: "Horizontal rule", run: () => ci(r, `---

`, 5) }
  ]);
}, Fx = (r) => {
  const e = Rp(r);
  return !e.exists || !e.title.trim() ? "New file" : e.title;
}, Hx = (r) => (Yl(r)?.state).vim?.mode ?? "normal", Kx = (r) => {
  const e = r.state.doc.toString(), t = Rp(e), i = r.state.selection.main;
  return {
    doc: e,
    mode: Hx(r),
    title: Fx(e),
    hasHeading: t.exists,
    headingLevel: t.level,
    selectionText: i.empty ? "" : r.state.sliceDoc(i.from, i.to),
    selectionEmpty: i.empty
  };
}, qo = (r, e) => {
  const t = Kx(e);
  r.dataset.titleTarget && document.querySelectorAll(r.dataset.titleTarget).forEach((i) => {
    i.textContent = t.title;
  }), r.dispatchEvent(new CustomEvent("lirox-editor-change", { detail: t }));
}, Jx = N.theme({
  "&": {
    height: "100%",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontFamily: "Victor Mono, monospace"
  },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "Victor Mono, monospace",
    padding: "0 1.5rem 1.5rem"
  },
  ".cm-content, .cm-gutter": {
    minHeight: "100%",
    paddingTop: "0",
    paddingBottom: "1.25rem"
  },
  ".cm-content": {
    caretColor: "rgb(var(--theme-accent))"
  },
  ".cm-panels": {
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    border: "0"
  },
  ".cm-panels-bottom": {
    border: "0"
  },
  ".cm-editor-heading-line": {
    position: "relative",
    fontFamily: "Victor Mono, monospace",
    fontWeight: "600",
    lineHeight: "1.15",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-heading-line .tok-heading": {
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-editor-heading-label": {
    position: "absolute",
    left: "0",
    bottom: "0",
    transform: "translate(-100%, -0.3em)",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "0.5em",
    fontWeight: "700",
    color: "rgb(var(--theme-subtle))",
    letterSpacing: "0.02em",
    cursor: "pointer",
    borderRadius: "3px",
    padding: "0 2px",
    lineHeight: "1",
    userSelect: "none"
  },
  ".cm-editor-heading-label:hover": {
    color: "rgb(var(--theme-text))",
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.5)"
  },
  ".cm-editor-heading-dropdown": {
    position: "fixed",
    zIndex: "100",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    backgroundColor: "rgb(var(--theme-surface))",
    border: "1px solid rgb(var(--shell-border))",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
    minWidth: "140px"
  },
  ".cm-editor-heading-dropdown-item": {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontSize: "13px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  ".cm-editor-heading-dropdown-item:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt))"
  },
  ".cm-editor-heading-dropdown-item-active": {
    fontWeight: "600",
    color: "rgb(var(--theme-accent))"
  },
  ".cm-editor-code-block": {
    backgroundColor: "#0f1419",
    color: "#e6e1cf",
    borderLeft: "1px solid #272d38",
    borderRight: "1px solid #272d38",
    paddingLeft: "0.85rem",
    paddingRight: "0.85rem",
    fontSize: "0.98em"
  },
  ".cm-editor-code-block-first": {
    borderTop: "1px solid #272d38",
    borderTopLeftRadius: "0.9rem",
    borderTopRightRadius: "0.9rem",
    paddingTop: "0.65rem"
  },
  ".cm-editor-code-block-last": {
    borderBottom: "1px solid #272d38",
    borderBottomLeftRadius: "0.9rem",
    borderBottomRightRadius: "0.9rem",
    paddingBottom: "0.65rem"
  },
  ".cm-editor-heading-level-1": { fontSize: "2.25rem" },
  ".cm-editor-heading-level-2": { fontSize: "1.875rem" },
  ".cm-editor-heading-level-3": { fontSize: "1.5rem" },
  ".cm-editor-heading-level-4": { fontSize: "1.25rem" },
  ".cm-editor-heading-level-5": { fontSize: "1.125rem" },
  ".cm-editor-heading-level-6": { fontSize: "1rem" },
  ".cm-editor-toolbar": {
    display: "flex",
    justifyContent: "center",
    padding: "0.5rem 1.5rem 1rem"
  },
  ".cm-editor-toolbar[hidden]": {
    display: "none"
  },
  ".cm-editor-toolbar-inner": {
    display: "flex",
    alignItems: "center",
    gap: "0.15rem",
    borderRadius: "0.5rem",
    backgroundColor: "rgba(var(--shell-panel), 0.9)",
    border: "1px solid rgb(var(--shell-border) / 0.65)",
    padding: "0.35rem"
  },
  ".cm-editor-toolbar-button": {
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-muted))",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.15rem",
    minWidth: "2rem",
    padding: "0.4rem 0.55rem",
    borderRadius: "0.375rem",
    fontSize: "14px",
    lineHeight: "1",
    fontWeight: "600",
    fontFamily: "inherit"
  },
  ".cm-editor-toolbar-button:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.85)",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-toolbar-button:disabled": {
    opacity: "0.45"
  },
  ".cm-editor-toolbar-button-active": {
    backgroundColor: "rgb(var(--theme-surface-alt) / 0.95)",
    color: "rgb(var(--theme-text))"
  },
  ".cm-editor-toolbar-button-arrow": {
    fontSize: "0.72em",
    transform: "translateY(-1px)"
  },
  ".cm-editor-toolbar-dropdown": {
    position: "fixed",
    zIndex: "100",
    display: "flex",
    flexDirection: "column",
    minWidth: "160px",
    backgroundColor: "rgb(var(--theme-surface))",
    border: "1px solid rgb(var(--shell-border))",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
  },
  ".cm-editor-toolbar-dropdown-item": {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "6px 12px",
    border: "0",
    backgroundColor: "transparent",
    color: "rgb(var(--theme-text))",
    fontSize: "13px",
    borderRadius: "6px",
    cursor: "pointer"
  },
  ".cm-editor-toolbar-dropdown-item:hover": {
    backgroundColor: "rgb(var(--theme-surface-alt))"
  },
  ".cm-editor-toolbar-dropdown-item-active": {
    fontWeight: "600",
    color: "rgb(var(--theme-accent))"
  },
  ".cm-editor-link-icon": {
    display: "inline-block",
    marginLeft: "0.35rem",
    color: "rgb(var(--theme-accent))",
    fontSize: "0.85em"
  },
  ".cm-editor-hr-line": {
    borderTop: "1px solid rgb(var(--shell-border))",
    paddingBottom: "0.75rem",
    height: "0",
    fontSize: "0",
    lineHeight: "0"
  },
  ".cm-focused": {
    outline: "none"
  },
  ".cm-lineNumbers": {
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "0",
    color: "rgb(var(--theme-subtle))"
  },
  ".cm-activeLine": {
    backgroundColor: "rgba(var(--theme-surface), 0.45)"
  },
  ".cm-activeLineGutter": {
    backgroundColor: "transparent"
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "rgba(var(--theme-accent), 0.22)"
  },
  ".cm-cursor": {
    borderLeftColor: "rgb(var(--theme-accent-soft))"
  }
}), ew = (r) => {
  const e = document.createElement("div");
  e.className = "cm-editor-toolbar";
  const t = document.createElement("div");
  t.className = "cm-editor-toolbar-inner";
  const i = (o, a, l, c = !1) => {
    const u = document.createElement("button");
    u.type = "button", u.className = "cm-editor-toolbar-button", c && u.classList.add("cm-editor-toolbar-button-active"), u.title = a, u.setAttribute("aria-label", a), u.textContent = o, u.addEventListener("mousedown", (p) => p.preventDefault()), u.addEventListener("click", () => l()), t.append(u);
  }, n = (o, a, l) => {
    const c = document.createElement("button");
    c.type = "button", c.className = "cm-editor-toolbar-button", c.title = a, c.setAttribute("aria-label", a);
    const u = document.createElement("span");
    u.textContent = o;
    const p = document.createElement("span");
    p.className = "cm-editor-toolbar-button-arrow", p.textContent = "▾", c.append(u, p), c.addEventListener("mousedown", (m) => m.preventDefault()), c.addEventListener("click", () => l(c)), t.append(c);
  };
  n("H", "Headings", (o) => {
    const a = r.state.selection.main, l = r.state.doc.lineAt(a.from), c = l.text.match(/^(#{1,6})\s+/);
    Zp(r, o, l.from, l.to, c ? c[1].length : 0);
  }), i("☑", "Task list", () => ci(r, "- [ ] ")), n("•", "Lists", (o) => qx(r, o)), i("B", "Bold", () => is(r, "**")), i("I", "Italic", () => is(r, "*")), n("✎", "Formatting", (o) => Gx(r, o)), i("↗", "Link", () => is(r, "[", "](https://)")), i("▦", "Table", () => ci(r, `| Column 1 | Column 2 |
| --- | --- |
|  |  |
`, 40)), i("🖼", "Image", () => ci(r, "![](https://)", 4)), n("⋮", "More", (o) => Ux(r, o));
  const s = () => {
    e.hidden = !r.hasFocus;
  };
  return e.append(t), s(), {
    top: !1,
    dom: e,
    update(o) {
      (o.selectionSet || o.focusChanged) && s();
    }
  };
}, Xp = (r, e) => {
  const t = Fa.get(r);
  if (t)
    return t.view;
  const i = e ?? r.dataset.initialDoc ?? "", n = r.dataset.writingWidth ?? "650px", s = Ex(r.dataset.lineNumbers, !1);
  r.style.height = "100%", r.style.maxWidth = n, r.style.margin = "0 auto";
  const o = [
    Lx(),
    U1,
    N.lineWrapping,
    rx({ defaultCodeLanguage: Et }),
    Ma($d),
    Ma(_x),
    Yx,
    Dx,
    Vx,
    Nx,
    zx,
    Wx,
    Jx,
    tn.of(ew),
    N.updateListener.of((c) => {
      (c.docChanged || c.selectionSet) && qo(r, c.view);
    })
  ];
  s && o.splice(1, 0, uy());
  const a = ge.create({
    doc: i,
    extensions: o
  }), l = new N({
    state: a,
    parent: r
  });
  return Yl(l)?.on("vim-mode-change", () => qo(r, l)), qo(r, l), r.dataset.editorMounted = "true", Fa.set(r, { view: l }), l;
}, tw = (r, e) => {
  const t = e ?? r.dataset.initialDoc ?? "", i = Fa.get(r);
  return i ? (i.view.state.doc.toString() === t || i.view.dispatch({
    changes: { from: 0, to: i.view.state.doc.length, insert: t }
  }), i.view) : Xp(r, t);
}, un = () => {
  document.querySelectorAll("[data-lirox-editor-root]").forEach((r) => Xp(r));
};
globalThis.LiroxNotesEditor = {
  mountAllLiroxNotesEditors: un,
  updateLiroxNotesEditor: tw
};
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", un, { once: !0 }) : un();
if (document.documentElement) {
  const r = new MutationObserver(() => {
    document.querySelector("[data-lirox-editor-root]") && (un(), r.disconnect());
  });
  r.observe(document.documentElement, { childList: !0, subtree: !0 }), document.querySelector("[data-lirox-editor-root]") && (un(), r.disconnect());
}
export {
  un as mountAllLiroxNotesEditors,
  Xp as mountLiroxNotesEditor,
  tw as updateLiroxNotesEditor
};
