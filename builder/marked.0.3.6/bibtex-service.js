(function ()
{
const BibTeX = require('./bibtex.js');
const Utils = require('./bibtex-utils.js');

function field(entry, field)
{
    const field1 = entry.Fields[field];
    if (!field1)
    {
        return BibTeX.Strings.Literal.Empty;
    }
    const field2 = field1.Resolve();
    return field2 || BibTeX.Strings.Literal.Empty;
}

function ResolveUrl(entry)
{
    const url = field(entry, 'biosite_url').Raw;
    const doi = field(entry, 'doi').Raw;
    return (url || !doi
        ? url
        : /http(s)?:\/\/doi\.org/gi.test(doi)
        ? doi
        : 'https://doi.org/' + doi);
}

function RenderTitle(entry, result)
{
    const url = ResolveUrl(entry);
    const title = field(entry, 'title');
    const arialabel = field(entry, 'biosite_arialabel').Raw;
    const titlehtml = Utils.TeX2Html(false, title.Raw);
    const hasMath = /<!--\[blog\]\[katex(-display)?\]([\u0000-\uffff]*?)\[blog\]-->/g.test(titlehtml);
    const hasLabel = !!(hasMath || (url && arialabel));
    result.push('<div class="gl-bibtex-entry-title"><span class="gl-bibtex-entry-bullet" aria-label="bullet symbol" role="img"><span aria-hidden="true">&#8226;</span> </span><a');
    if (hasLabel)
    {
        result.push(' aria-label="',
            Utils.HtmlEncode(arialabel || title.Purified), '"');
    }
    if (url)
    {
        result.push(' href="', Utils.HtmlEncode(url), '" rel="nofollow"');
    }
    else if (hasLabel)
    {
        result.push(' role="img"');
    }
    result.push(hasLabel ? '><span aria-hidden="true">' : '>',
        titlehtml, hasLabel ? '</span></a></div>\n' : '</a></div>\n');
}

const AuthorFormat = BibTeX.ParsePersonNameFormat('{ff }{vv~}{ll}{, jj}');
function RenderAuthors(entry, result)
{
    result.push('<div class="gl-bibtex-entry-authors">');
    const people = BibTeX.ParsePersonNames(field(entry, 'author'));
    const realpeople = [];
    let etal = false;
    for (const person of people)
    {
        if (person.IsEtal())
        {
            etal = true;
        }
        else
        {
            const formatted = AuthorFormat.Format(person);
            if (formatted.replace(/[ \t\v\f\r\n~-]+/g, '') !== '')
            {
                realpeople.push(Utils.TeX2Html(false, formatted));
            }
        }
    }
    if (realpeople.length === 0)
    {
        result.push('Anonymous');
    }
    else if (realpeople.length === 1)
    {
        result.push(realpeople[0]);
        if (etal)
        {
            result.push(' et&nbsp;al.');
        }
    }
    else if (etal)
    {
        result.push(realpeople.join(', '));
        result.push(', et&nbsp;al.');
    }
    else if (realpeople.length === 2)
    {
        result.push(realpeople[0]);
        result.push(' and ');
        result.push(realpeople[1]);
    }
    else
    {
        const lastPerson = realpeople.pop();
        result.push(realpeople.join(', '));
        result.push(', and ');
        result.push(lastPerson);
    }
    result.push('</div>\n');
}

const InfoLinks = [
{
    field: 'arxiv',
    name: 'arXiv',
    href1html: 'https://arxiv.org/abs/',
    href2html: '',
    arialabel: 'archive'
},
{
    field: 'eprint',
    name: 'ePrint',
    href1html: 'https://eprint.iacr.org/',
    href2html: '',
    arialabel: 'e-Print'
},
{
    field: 'jcryptol',
    name: 'J.&nbsp;Cryptol',
    href1html: 'https://link.springer.com/article/10.1007/',
    href2html: '',
    arialabel: 'Journal of Cryptology'
},
{
    field: 'demo',
    name: 'Demo',
    href1html: '',
    href2html: ''
},
];
function RenderInfo(entry, result)
{
    result.push('<div class="gl-bibtex-entry-info">');
    let first = true;
    const venue = field(entry, 'biosite_venue').Raw;
    if (venue)
    {
        result.push('<span class="gl-bibtex-entry-venue">',
            Utils.TeX2Html(false, venue),
            '</span>');
        first = false;
    }
    for (const item of InfoLinks)
    {
        const value = Utils.HtmlEncode(
            field(entry, 'biosite_' + item.field).Raw);
        if (!value)
        {
            continue;
        }
        if (!first)
        {
            result.push('<span aria-hidden="true"> | </span>');
        }
        else
        {
            first = false;
        }
        result.push('<span class="gl-bibtex-entry-',
            item.field, '" data-value="', value,
            '"><a href="',
            item.href1html, value, item.href2html,
            '" rel="nofollow"');
        if (item.arialabel)
        {
            result.push(' aria-label="', item.arialabel, '"');
        }
        result.push('>', item.name, '</a></span>');
    }
    if (!first)
    {
        result.push('</div>\n');
    }
    else
    {
        result.pop();
    }
}

function RenderExtra(entry, result)
{
    const extra = field(entry, 'biosite_extra').Raw;
    if (extra)
    {
        result.push('<div class="gl-bibtex-entry-extra">',
            Utils.TeX2Html(false, extra),
            '</div>\n');
    }
}

function RenderDatabase(parsed)
{
    const result = ['<div class="gl-bibtex-bst-bio">\n'];
    let className = 'gl-bibtex-entry';
    const preamble = Utils.RenderPreambleHtml(parsed);
    if (preamble)
    {
        result.push('<div class="gl-bibtex-preamble">',
            preamble, '</div>\n');
        className = 'gl-bibtex-entry gl-bibtex-notfirstentry';
    }
    for (const entry of parsed.Entries)
    {
        result.push('<div class="', className, '" id="bibitem_',
            entry.Id.replace(/:/g, '_'), '">\n');
        RenderTitle(entry, result);
        RenderAuthors(entry, result);
        RenderInfo(entry, result);
        RenderExtra(entry, result);
        result.push('</div>\n');
        className = 'gl-bibtex-entry gl-bibtex-notfirstentry';
    }
    result.push('</div>');
    return result.join('');
}

function Handler(content)
{
    const parsed = BibTeX.ParseDatabase(content);
    return RenderDatabase(parsed);
}

const BlogBibTeX = {
    BibTeX: BibTeX,
    Handler: Handler
};

if (typeof module !== 'undefined' && typeof exports === 'object')
{
    module.exports = BlogBibTeX;
}
else if (typeof define === 'function' && define.amd)
{
    define(function() { return BlogBibTeX; });
}
else if (this)
{
    this.GL_BlogBibTeX = BlogBibTeX;
}
else if (typeof window !== 'undefined')
{
    window.GL_BlogBibTeX = BlogBibTeX;
}
else
{
    global.GL_BlogBibTeX = BlogBibTeX;
}
})();
