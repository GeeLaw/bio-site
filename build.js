const path = require('path');
const repo = path.dirname(process.argv[1]);
const marked = require(path.join(repo, 'builder', 'marked.0.3.6', 'marked.js'));

const KaTeX = require(path.join(repo, 'builder', 'katex.0.11.1', 'katex.js'));
const htmlEntityMap = { '"': '&quot;', '\'': '&39;', '&': '&amp;', '<': '&lt;', '>': '&gt;', '/': '&#47;', '\\': '&#92;', '\r': '&#13;', '\n': '&#10;' };
const entityMap = function (x) { return htmlEntityMap[x]; };
const sanitizeForAttribute = function (text) { return text.replace(/["'&<>\/\\\r\n]/g, entityMap); };
/*
    \s*

    1           2        3
    (\\@nobreak{([^{]*?){([\s\S]*?)}\2}\s*)?

                 4        5
    \\@arialabel{([^{]*?){([\s\S]*?)}\4}

    6
    ([\s\S]*?)

    7           8        9
    (\\@nobreak{([^{]*?){([\s\S]*?)}\8}\s*)?
*/
const regexKaTeX = /^\s*(\\@nobreak{([^{]*?){([\s\S]*?)}\2}\s*)?\\@arialabel{([^{]*?){([\s\S]*?)}\4}([\s\S]*?)(\\@nobreak{([^{]*?){([\s\S]*?)}\8}\s*)?$/;
const presenceInitialPunct = 1;
const contentInitialPunct = 3;
const contentAriaLabel = 5;
const contentBody = 6;
const presenceTrailingPunct = 7;
const contentTrailingPunct = 9;
function RenderKaTeX(part, isDisplay)
{
    const renderOptions = {
        displayMode: isDisplay,
        throwOnError: false,
        errorColor: '#FF0000',
        macros: {},
        GLarialabel: undefined,
        GLinitPunct: undefined,
        GLtrailPunct: undefined
    };
    wasRendering = part;
    const matchKaTeX = regexKaTeX.exec(part);
    var failure = null;
    if (matchKaTeX === null)
    {
        failure = '\\@arialabel is required but absent';
    }
    else if (matchKaTeX[contentAriaLabel].trim() === '')
    {
        failure = '\\@arialabel is required but empty';
    }
    else if (matchKaTeX[contentBody].trim() === '')
    {
        failure = 'body is required but empty';
    }
    else if (isDisplay && matchKaTeX[presenceInitialPunct] !== undefined)
    {
        failure = 'display equation cannot have initial \\@nobreak';
    }
    else if (isDisplay && matchKaTeX[presenceTrailingPunct] !== undefined)
    {
        failure = 'display equation cannot have trailing \\@nobreak';
    }
    else if (matchKaTeX[presenceInitialPunct] !== undefined
        && matchKaTeX[contentInitialPunct].trim() === '')
    {
        failure = 'initial \\@nobreak is present but empty';
    }
    else if (matchKaTeX[presenceTrailingPunct] !== undefined
        && matchKaTeX[presenceTrailingPunct].trim() === '')
    {
        failure = 'trailing \\@nobreak is present but empty';
    }
    else
    {
        renderOptions.GLarialabel = matchKaTeX[contentAriaLabel];
        renderOptions.GLinitPunct = matchKaTeX[contentInitialPunct];
        renderOptions.GLtrailPunct = matchKaTeX[contentTrailingPunct];
        return KaTeX.__renderToHTMLTree(
            matchKaTeX[contentBody], renderOptions).toMarkup();
    }
    return '<span class="gl-katex-fails' +
        (isDisplay ? ' gl-katex-display' : '') +
        '"><span>' + failure + ': </span><code>' +
        sanitizeForAttribute(part) + '</code></span>';
};

const fs = require('fs');
const indexmd = path.join(repo, 'index.md');
const content = fs.readFileSync(indexmd, 'utf8');
const rendered = marked(content);

const months = ['January', 'February', 'March', 'April',
'May', 'June', 'July', 'August',
'September', 'October', 'November', 'December'];
const now = new Date();
const dateModified = (function (now)
{
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    if (year < 1000 || year > 5000)
    {
        throw new Error('Unsupported date: ' + now);
    }
    return year + '-' +
        (month < 10 ? '0' + month : month) + '-' +
        (day < 10 ? '0' + day : day);
})(now);
const dateModifiedLong = (function (now)
{
    return now.getUTCDate() + ' ' +
        months[now.getUTCMonth()] + ' ' +
        now.getUTCFullYear();
})(now);

let indexhtml = fs.readFileSync(
    path.join(repo, 'builder', 'template.html'),
    'utf8');
indexhtml = indexhtml.replace(/\r\n|\r|\n/g, '\n');
indexhtml = indexhtml.replace(/\n[ \t\v\f\n]*\n/g, '\n');
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[body\]([\u0000-\uffff]*?)\[bio\]-->/g,
    rendered);

let meta = undefined;
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[meta\]([\u0000-\uffff]*?)\[bio\]-->/g,
    function (match, metastring)
    {
        meta = JSON.parse(metastring);
        return '';
    });
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[date-modified\]([\u0000-\uffff]*?)\[bio\]-->/g,
    dateModified);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[date-modified-long\]([\u0000-\uffff]*?)\[bio\]-->/g,
    dateModifiedLong);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[name\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.name);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[title\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.title);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[description\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.description);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[url\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.url);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[assets\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.assets);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[date-created\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta['date-created']);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[tilecolor\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.tilecolor);
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[repo\]([\u0000-\uffff]*?)\[bio\]-->/g,
    meta.repo);

let headline = undefined;
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[set-headline\]([\u0000-\uffff]*?)\[bio\]-->/g,
    function (match, headlinestring)
    {
        headline = headlinestring;
        return '';
    });
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[get-headline\]([\u0000-\uffff]*?)\[bio\]-->/g,
    headline);

indexhtml = indexhtml.replace(
    /<!--\[blog\]\[katex(-display)?\]([\u0000-\uffff]*?)\[blog\]-->/g,
    function (match, display, part)
    {
        return RenderKaTeX(part, !!display);
    });
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[protect\][ \t\v\f\n]*([\u0000-\uffff]*?)[ \t\v\f\n]*\[bio\]-->/g,
    '$1');
indexhtml = indexhtml.replace(
    /<!--\[bio\]\[remove\]([\u0000-\uffff]*?)\[bio\]-->/g,
    '');

fs.writeFileSync(
    path.join(repo, 'index.html'),
    indexhtml);

fs.writeFileSync(
    path.join(repo, '404.html'),
    fs.readFileSync(path.join(repo, 'builder', '404.template.html'), 'utf8').
    replace(/\r\n|\r|\n/g, '\n').
    replace(/\n[ \t\v\f\n]*\n/g, '\n').
    replace(/<!--\[bio\]\[url\]([\u0000-\uffff]*?)\[bio\]-->/g, meta.url)
);
