(function ()
{
const BibTeX = require('./bibtex.js');

function HtmlEncode(text)
{
    return text.replace(/&/g, '&amp;').
        replace(/</g, '&lt;').
        replace(/>/g, '&gt;').
        replace(/"/g, '&quot;').
        replace(/ /g, '&nbsp;').
        replace(/—/g, '&mdash;').
        replace(/–/g, '&ndash;');
}

function HtmlDecode(text)
{
    return text.replace(/&lt;/g, '<').
        replace(/&gt;/g, '>').
        replace(/&quot;/g, '"').
        replace(/&nbsp;/g, ' ').
        replace(/&mdash;/g, '—').
        replace(/&ndash;/g, '–').
        replace(/&amp;/g, '&');
}

function SmartPuncts(text)
{
    text = text.replace(/``/g, '“').replace(/''/g, '”');
    text = text.replace(/<</g, '«').replace(/>>/g, '»');
    text = text.replace(/</g, '‹').replace(/>/g, '›');
    text = text.replace(/`/g, '‘').replace(/'/g, '’');
    text = text.replace(/,,/g, '„').replace(/\.\.\./g, '…');
    text = text.replace(/---/g, '—').replace(/--/g, '–');
    text = text.replace(/~/g, ' ');
    return text;
}

function DumbPuncts(text)
{
    text = text.replace(/“/g, '``').replace(/”/g, "''");
    text = text.replace(/«/g, '&lt;&lt;').replace(/»/g, '&gt;&gt;');
    text = text.replace(/‹/g, '&lt;').replace(/›/g, '&gt;');
    text = text.replace(/‘/g, '`').replace(/’/g, "'");
    text = text.replace(/„/g, ',,').replace(/…/g, '...');
    text = text.replace(/—|&mdash;/g, '---').replace(/–|&ndash;/g, '--');
    text = text.replace(/ |&nbsp;/g, '~');
    return text;
}

/* CLASS HtmlRenderer extends BibTeX.TeX.SimpleRenderer */

function HtmlRenderer_CtrlSeqType(csname, raw, target)
{
    if (csname === 'url')
    {
        return 1;
    }
    if (csname === 'urlwithtext')
    {
        return 2;
    }
    if (csname === 'nickname')
    {
        return -1;
    }
    if (csname === 'zhCN')
    {
        return -1;
    }
    var ret = BibTeX.TeX.SimpleRenderer.CtrlSeqType(csname);
    if (ret != ret)
    {
        target.Append('', '<code>' + HtmlEncode(raw) + '</code>');
    }
    return ret;
}
function HtmlRenderer_CtrlSeqTypeInMath(csname)
{
    return BibTeX.TeX.SimpleRenderer.CtrlSeqType(csname);
}
function HtmlRenderer_RenderAll(content)
{
    var result = new BibTeX.TeX.SimpleRenderer.StackFrame();
    content.StringConcatInto(result);
    return result.Char1[0] + result.Char2[0];
}
function HtmlRenderer_RenderGroup(args, target)
{
    args.StringConcatInto(target);
}
function HtmlRenderer_RenderVirtGroup(args, target)
{
    args.StringConcatInto(target);
}
function HtmlRenderer_RenderMathInline(math, raw, target)
{
    target.Append('', '<!--[blog][katex]\\@arialabel{_$__$_{' +
        raw +  '}_$__$_}' + math + '[blog]-->');
}
function HtmlRenderer_RenderMathDisplay(math, raw, target)
{
    target.Append('', '<!--[blog][katex-display]\\@arialabel{_$__$_{' +
        raw +  '}_$__$_}' + math + '[blog]-->');
}
function HtmlRenderer_RenderText(text, target)
{
    text = SmartPuncts(text);
    target.Append(HtmlEncode(text.substr(0, 1)),
        HtmlEncode(text.substr(1)));
}

const CtrlSeqDiacritics = (function (obj) {
    obj['`'] = '̀'; obj["'"] = '́'; obj['^'] = '̂';
    obj['"'] = '̈'; obj['~'] = '̃'; obj['='] = '̄';
    obj['.'] = '̇'; obj['u'] = '̆'; obj['v'] = '̌';
    obj['H'] = '̋'; obj['t'] = '͡'; obj['c'] = '̧';
    obj['d'] = '̣'; obj['b'] = '̱'; obj['r'] = '̊';
    return obj;
})({});

const CtrlSeqSpanWithClass = (function (obj)
{
/* em, emph, textsuperscript, textsubscript, etalchar,
 * uppercase, lowercase and url are handled independently.
 */
obj['text'] = 'text';
obj['textrm'] = 'textrm'; obj['textsf'] = 'textsf';
obj['texttt'] = 'texttt';
obj['textmd'] = 'textmd'; obj['textbf'] = 'textbf';
obj['textup'] = 'textup'; obj['textsl'] = 'textsl';
obj['textit'] = 'textit'; obj['textsc'] = 'textsc';

obj['fbox'] = 'fbox'; obj['frame'] = 'frame';
obj['framebox'] = 'framebox';

obj['rmfamily'] = 'rmfamily'; obj['sffamily'] = 'sffamily';
obj['ttfamily'] = 'ttfamily';
obj['mdseries'] = 'mdseries'; obj['bfseries'] = 'bfseries';
obj['upshape'] = 'upshape'; obj['slshape'] = 'slshape';
obj['itshape'] = 'itshape'; obj['scshape'] = 'scshape';

obj['rm'] = 'rm'; obj['sf'] = 'sf'; obj['tt'] = 'tt';
obj['md'] = 'md'; obj['bf'] = 'bf';
obj['up'] = 'up'; obj['sl'] = 'sl';
obj['it'] = 'it'; obj['sc'] = 'sc';

/* Avoid using case as the only difference. */
obj['tiny'] = 'tiny';
obj['scriptsize'] = 'scriptsize';
obj['footnotesize'] = 'footnotesize';
obj['small'] = 'small';
obj['normalsize'] = 'normalsize';
obj['large'] = 'large';
obj['Large'] = 'large2';
obj['LARGE'] = 'large3';
obj['huge'] = 'huge';
obj['Huge'] = 'huge2';

obj['sloppy'] = 'sloppy';
obj['fussy'] = 'fussy';
obj['noindent'] = 'noindent';

return obj;
})({});

/* These characters are ineligible for diacritical marks. */
const CtrlSeqTextReplacement = (function (obj)
{
obj['hspace'] = '<span class="gl-bibtex-tex-hspace"> </span>';
obj['hspace*'] = '<span class="gl-bibtex-tex-hspace-star"> </span>';
obj['vspace'] = '<span class="gl-bibtex-tex-vspace"></span>';
obj['vspace*'] = '<span class="gl-bibtex-tex-vspace-star"></span>';
obj['label'] = '<span class="gl-bibtex-tex-label"></span>';
obj['ref'] = '<span class="gl-bibtex-tex-ref">?</span>';
obj[' '] = '<span class="gl-bibtex-tex-ctrl-space"> </span>';
obj['!'] = '<span class="gl-bibtex-tex-neg-thin-space"></span>';
obj[','] = '<span class="gl-bibtex-tex-thin-space"> </span>';
obj[';'] = '<span class="gl-bibtex-tex-thick-space"> </span>';
obj[':'] = '<span class="gl-bibtex-tex-mid-space"> </span>';
obj['/'] = '<span class="gl-bibtex-tex-it-adjust-space"></span>';
obj['quad'] = '<span class="gl-bibtex-tex-quad">  </span>';
obj['qquad'] = '<span class="gl-bibtex-tex-qquad">    </span>';
obj['hfill'] = '<span class="gl-bibtex-tex-hfill">\t</span>';
obj['vfill'] = '<span class="gl-bibtex-tex-vfill"></span>';
/* stylized names */
obj['TeX'] = '<!--[blog][katex]\\@arialabel{{TeX}}\\TeX[blog]-->';
obj['LaTeX'] = '<!--[blog][katex]\\@arialabel{{LaTeX}}\\LaTeX[blog]-->';
obj['LaTeXe'] = '<!--[blog][katex]\\@arialabel{{LaTeX two-epsilon}}\\LaTeX\,2\\varepsilon[blog]-->';
obj['XeTeX'] = '<!--[blog][katex]\\@arialabel{{XeTeX}}\\text{X\\hspace{-0.8px}\\raisebox{1.6px}{\\scriptsize E}}\\TeX[blog]-->';
obj['BibTeX'] = '<!--[blog][katex]\\@arialabel{{BibTeX}}\\text{B\\footnotesize IB\\hspace{-0.2px}}\\TeX[blog]-->';
obj['KaTeX'] = '<!--[blog][katex]\\@arialabel{{KaTeX}}\\KaTeX[blog]-->';
/* symbols */
obj['\\'] = '<br />';
obj['-'] = '&shy;';
/* no-op */
obj['noopsort'] = '';
return obj;
})({});

/* These characters are eligible for diacritical marks. */
const CtrlSeqLetters = (function (obj)
{
/* symbols */
obj['{'] = '{';
obj['}'] = '}';
obj['#'] = '#';
obj['$'] = '$';
obj['%'] = '%';
obj['&'] = '&amp;';
obj['copyright'] = '&copy;';
obj['dag'] = '&dagger;';
obj['ddag'] = '&ddagger;';
obj['pounds'] = '&pound;';
obj['S'] = '&sect;';
obj['P'] = '&para;';
obj['slash'] = '/';
obj['lbrace'] = '{';
obj['rbrace'] = '}';
obj['lbrack'] = '[';
obj['rbrack'] = ']';
obj['textasciitilde'] = '~';
obj['textunderline'] = '_';
obj['textbackslash'] = '\\';
obj['textless'] = '&lt;';
obj['textgreater'] = '&gt;';
obj['textlangle'] = '&lang;';
obj['textrangle'] = '&rang;';
obj['textbar'] = '|';
obj['ldots'] = '…';
obj['textellipsis'] = '…';
obj['textemdash'] = '&mdash;';
obj['textendash'] = '&ndash;';
/* letters */
obj['aa'] = '&aring;';
obj['ae'] = '&aelig;';
obj['i'] = 'ı';
obj['j'] = 'ȷ';
obj['l'] = 'ł';
obj['o'] = '&oslash;';
obj['oe'] = '&oelig;';
obj['ss'] = '&szlig;';
obj['AA'] = '&Aring;';
obj['AE'] = '&AElig;';
obj['L'] = 'Ł';
obj['O'] = '&Oslash;';
obj['OE'] = '&OElig;';

return obj;
})({});

const CaseConversion = (function (obj)
{
obj['&aring;'] = '&Aring;';
obj['&aelig;'] = '&AElig;';
obj['ı'] = 'I';
obj['ȷ'] = 'J';
obj['ł'] = 'Ł';
obj['&oslash;'] = '&Oslash;';
obj['&oelig;'] = '&OElig;';
obj['&szlig;'] = 'SS';
obj['&Aring;'] = '&aring;';
obj['&AElig;'] = '&aelig;';
obj['Ł'] = 'ł';
obj['&Oslash;'] = '&oslash;';
obj['&OElig;'] = '&oelig;';

return obj;
})({});
function ConvertCaseHelper(match, entity, _namedEntity, intact)
{
    return (entity
        ? CaseConversion[entity]
        : intact
        ? match
        : match.toUpperCase());
}

function HtmlRenderer_RenderCtrlSeq(csname, args, target)
{
    if (csname === 'relax')
    {
        return;
    }
    if (csname === 'nickname')
    {
        if (this.ForNickname)
        {
            args.StringConcatInto(target);
        }
        else
        {
            target.Append('', '');
        }
        return;
    }
    if (csname === 'singleletter')
    {
        args.StringConcatInto(target);
        return;
    }
    if (csname === 'printfirst')
    {
        while (args.Char1.length > 1) { args.Char1.pop(); }
        while (args.Char2.length > 1) { args.Char2.pop(); }
        args.StringConcatInto(target);
        return;
    }
    if (csname === 'switchargs')
    {
        while (args.Char1.length > 2) { args.Char1.pop(); }
        while (args.Char2.length > 2) { args.Char2.pop(); }
        while (args.Char1.length < 2) { args.Char1.push(''); }
        while (args.Char2.length < 2) { args.Char2.push(''); }
        let tt = undefined;
        tt = args.Char1[0]; args.Char1[0] = args.Char1[1]; args.Char1[1] = tt;
        tt = args.Char2[0]; args.Char2[0] = args.Char2[1]; args.Char2[1] = tt;
        args.StringConcatInto(target);
        return;
    }
    var dcrt = CtrlSeqDiacritics[csname];
    if (dcrt !== undefined)
    {
        let ch1 = args.Char1[0] || '';
        if (ch1.length === 0 || ch1[ch1.length - 1] === '>')
        {
            ch1 += '◌';
        }
        let ch2 = args.Char2[0] || '';
        if (csname === 't' &&
            (ch2.length === 0 || ch2[0] === '<'))
        {
            ch2 = '◌' + ch2;
        }
        target.Append(ch1 + dcrt, ch2);
        return;
    }
    const ltr = CtrlSeqLetters[csname];
    if (ltr !== undefined)
    {
        target.Append(ltr, '');
        return;
    }
    const txt = CtrlSeqTextReplacement[csname];
    if (txt !== undefined)
    {
        target.Append('', txt);
        return;
    }
    if (csname === 'uppercase' || csname === 'lowercase')
    {
        const rgx = (csname === 'uppercase'
? /(&(aring|aelig|oslash|oelig|szlig);|ı|ȷ|ł)|&(#[0-9]{1,10}|#[Xx][0-9A-Fa-f]{1,6}|[a-zA-Z0-9]{1,10});|[a-z]+/g
: /(&(Aring|AElig|Oslash|OElig);|Ł)|&(#[0-9]{1,10}|#[Xx][0-9A-Fa-f]{1,6}|[a-zA-Z0-9]{1,10});|[A-Z]+/g);
        let ch1 = args.Char1[0] || '';
        let ch2 = args.Char2[0] || '';
        if (ch1.indexOf('<') < 0)
        {
            ch1 = ch1.replace(rgx, ConvertCaseHelper);
        }
        if (ch2.indexOf('<') < 0)
        {
            ch2 = ch2.replace(rgx, ConvertCaseHelper);
        }
        target.Append(
            '<span class="gl-bibtex-tex-' +
                csname + '">' + ch1,
            ch2 + '</span>');
        return;
    }
    const ch1 = args.Char1[0] || '';
    const ch2 = args.Char2[0] || '';
    const spancls = CtrlSeqSpanWithClass[csname];
    if (spancls !== undefined)
    {
        target.Append(
            '<span class="gl-bibtex-tex-' + spancls + '">' + ch1,
            ch2 + '</span>');
        return;
    }
    if (csname === '@')
    {
        target.Append(
            '<span class="gl-bibtex-tex-ending-punct">' + ch1,
            ch2 + '</span>');
        return;
    }
    if (csname === 'emph' || csname === 'em')
    {
        target.Append(
            '<em class="gl-bibtex-tex-' + csname + '">' + ch1,
            ch2 + '</em>');
        return;
    }
    if (csname === 'textsuperscript' || csname === 'etalchar')
    {
        if (csname === 'etalchar' && ch1 + ch2 === '+')
        {
            target.Append('&#8314;', '');
        }
        else
        {
            target.Append('<sup class="gl-bibtex-tex-' +
                csname + '">' + ch1,
                ch2 + '</sup>');
        }
        return;
    }
    if (csname === 'textsubscript')
    {
        target.Append('<sub class="gl-bibtex-tex-textsubscript">' +
            ch1, ch2 + '</sub>');
        return;
    }
    if (csname === 'cite')
    {
        target.Append('',
            '<!--[blog][cite]' +
            HtmlDecode(DumbPuncts(ch1 + ch2)) +
            '[blog]-->');
        return;
    }
    if (csname === 'url')
    {
        const url = DumbPuncts(ch1 + ch2);
        const noopener = /^(https?:)?\/\//i.test(url);
        target.Append('', (noopener
            ? '<a class="gl-bibtex-tex-url" target="_blank" rel="noopener" href="'
            : '<a class="gl-bibtex-tex-url" target="_blank" href="') +
            url + '">' + url + '</a>');
        return;
    }
    if (csname === 'urlwithtext')
    {
        const url = DumbPuncts(
            (args.Char1[1] || '') +
            (args.Char2[1] || ''));
        const noopener = /^(https?:)?\/\//i.test(url);
        target.Append((noopener
            ? '<a class="gl-bibtex-tex-url" target="_blank" rel="noopener" href="'
            : '<a class="gl-bibtex-tex-url" target="_blank" href="') +
            url + '">' + ch1, ch2 + '</a>');
        return;
    }
    if (csname === 'zhCN')
    {
        target.Append('<span class="gl-bibtex-tex-zhcn" lang="zh-CN">' + ch1,
            ch2 + '</span>');
        return;
    }
    args.StringConcatInto(target);
}

function NewHtmlRenderer(forNickname, text)
{
    const result = new BibTeX.TeX.SimpleRenderer(text);
    result.ForNickname = !!forNickname;
    result.CtrlSeqType = HtmlRenderer_CtrlSeqType;
    result.CtrlSeqTypeInMath = HtmlRenderer_CtrlSeqTypeInMath;
    result.RenderCtrlSeq = HtmlRenderer_RenderCtrlSeq;
    result.RenderAll = HtmlRenderer_RenderAll;
    result.RenderGroup = HtmlRenderer_RenderGroup;
    result.RenderVirtGroup = HtmlRenderer_RenderVirtGroup;
    result.RenderMathInline = HtmlRenderer_RenderMathInline;
    result.RenderMathDisplay = HtmlRenderer_RenderMathDisplay;
    result.RenderText = HtmlRenderer_RenderText;
    return result;
}

function TeX2Html(forNickname, tex)
{
    return NewHtmlRenderer(forNickname, tex
        .replace(/^[ \t\v\f\r\n]+/, '')
        .replace(/[ \t\v\f\r\n]+$/, '')
    ).Render();
}

function RenderPreambleHtml(parsed)
{
    const preamble = parsed.Preamble;
    if (preamble === undefined)
    {
        return '';
    }
    const strlit = preamble.Resolve();
    if (strlit === undefined)
    {
        return '';
    }
    return TeX2Html(false, strlit.Raw);
}

const BlogBibTeX_Utils = {
    HtmlEncode: HtmlEncode,
    HtmlDecode: HtmlDecode,
    SmartPuncts: SmartPuncts,
    DumbPuncts: DumbPuncts,
    TeX2Html: TeX2Html,
    RenderPreambleHtml: RenderPreambleHtml
};

if (typeof module !== 'undefined' && typeof exports === 'object')
{
    module.exports = BlogBibTeX_Utils;
}
else if (typeof define === 'function' && define.amd)
{
    define(function() { return BlogBibTeX_Utils; });
}
else if (this)
{
    this.GL_BlogBibTeX_Utils = BlogBibTeX_Utils;
}
else if (typeof window !== 'undefined')
{
    window.GL_BlogBibTeX_Utils = BlogBibTeX_Utils;
}
else
{
    global.GL_BlogBibTeX_Utils = BlogBibTeX_Utils;
}
})();
