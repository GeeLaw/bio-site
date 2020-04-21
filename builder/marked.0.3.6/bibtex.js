;(function ()
{
'use strict';

/* @@ helper.js */
"use strict";
var Helper = (function () {
    function BindFunction1(pfn, thisArg, firstArgs) {
        var applyArgs = [thisArg];
        if (firstArgs instanceof Array) {
            for (var _i = 0, firstArgs_1 = firstArgs; _i < firstArgs_1.length; _i++) {
                var arg = firstArgs_1[_i];
                applyArgs.push(arg);
            }
        }
        return Function.prototype.bind.apply(pfn, applyArgs);
    }
    function BindFunction2(pfn, thisArg, firstArgs) {
        var fixedArgs = [];
        if (firstArgs instanceof Array) {
            for (var _i = 0, firstArgs_2 = firstArgs; _i < firstArgs_2.length; _i++) {
                var arg = firstArgs_2[_i];
                fixedArgs.push(arg);
            }
        }
        function pfnBound() {
            var applyArgs = [];
            for (var _i = 0, fixedArgs_1 = fixedArgs; _i < fixedArgs_1.length; _i++) {
                var arg = fixedArgs_1[_i];
                applyArgs.push(arg);
            }
            for (var i = 0, j = arguments.length; i !== j; ++i) {
                applyArgs.push(arguments[i]);
            }
            pfn.apply(thisArg, applyArgs);
        }
        return pfnBound;
    }
    var binder = (typeof Function.prototype.bind === 'function'
        ? BindFunction1 : BindFunction2);
    var helper = (function () {
        function NewEmptyObject() { return {}; }
        if (typeof Object.create !== 'function') {
            return { EmptyObject: {},
                NewEmptyObject: NewEmptyObject,
                BindFunction: binder };
        }
        var helper = Object.create(null);
        helper['EmptyObject'] = Object.create(null);
        helper['NewEmptyObject'] = binder(Object.create, Object, [null]);
        helper['BindFunction'] = binder;
        return helper;
    })();
    function FakeFreeze(obj) { return obj; }
    function FreezeDescendants(obj, noRecurseInto) {
        if (obj === noRecurseInto) {
            return obj;
        }
        for (var key in obj) {
            if (key !== '_Mutable' && key !== '_MutablePrivates') {
                var child = obj[key];
                var childType = typeof child;
                if (childType === 'object' || childType === 'function') {
                    Object.freeze(FreezeDescendants(child, noRecurseInto));
                }
            }
        }
        return obj;
    }
    if (typeof Object.freeze !== 'function') {
        helper['FreezeObject'] = FakeFreeze;
        helper['FreezeDescendants'] = FakeFreeze;
    }
    else {
        helper['FreezeObject'] = binder(Object.freeze, Object, []);
        helper['FreezeDescendants'] = FreezeDescendants;
    }
    function RepeatString1(str, n) {
        n = (n >= 0 ? n >>> 0 : 0);
        return (n !== 0
            ? str.repeat(n)
            : '');
    }
    function RepeatString2(str, n) {
        n = (n >= 0 ? n >>> 0 : 0);
        var result = '';
        while (n !== 0) {
            if ((n & 1) === 1) {
                result += str;
            }
            str += str;
            n >>>= 1;
        }
        return result;
    }
    helper.RepeatString = (typeof String.prototype.repeat === 'function'
        ? RepeatString1 : RepeatString2);
    helper.FreezeDescendants(helper);
    helper.FreezeObject(helper);
    return helper;
})();
var ExportBibTeX = (function (bibtex) {
    bibtex._Privates = Helper.NewEmptyObject();
    return bibtex;
})(Helper.NewEmptyObject());

/* helper.js @@ */

/* @@ Strings */
"use strict";
var Strings_BasicPieceBuilder = (function () {
    function Strings_BasicPieceBuilder(value) {
        this.Value = value;
        var probe = /[a-zA-Z]/.exec(value);
        this.Case = (probe
            ? /[A-Z]/.test(probe[0]) ? 'U' : 'l'
            : '?');
        this.Purified = value.replace(/[~\t\v\f\r\n-]/g, ' ').replace(/[\u0000-\u001f\u0021-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, '');
        Helper.FreezeObject(this);
    }
    return Strings_BasicPieceBuilder;
}());
var Strings_BasicPiece = (function () {
    function Strings_BasicPiece(value) {
        if (!(value instanceof Strings_BasicPieceBuilder)) {
            value = new Strings_BasicPieceBuilder(('' + (value || '')).replace(/[{}]/g, ''));
        }
        this.Raw = value.Value;
        this.Value = value.Value;
        this.Length = value.Value.length;
        this.Case = value.Case;
        this.Purified = value.Purified;
        this.PurifiedPedantic =
            value.Purified.replace(/[^0-9A-Za-z ]+/g, '');
        Helper.FreezeObject(this);
    }
    Strings_BasicPiece.Empty = new Strings_BasicPiece();
    return Strings_BasicPiece;
}());

;"use strict";
var Strings_BracedPieceBuilder = (function () {
    function Strings_BracedPieceBuilder(value) {
        this.Value = value;
        this.Length = value.replace(/[{}]/g, '').length;
        this.Purified = value.replace(/[~\t\v\f\r\n-]/g, ' ').replace(/[\u0000-\u001f\u0021-\u002f\u003a-\u0040\u005b-\u0060\u007b-\u007f]+/g, '');
        this.Raw = '{' + value + '}';
        Helper.FreezeObject(this);
    }
    return Strings_BracedPieceBuilder;
}());
var Strings_BracedPiece = (function () {
    function Strings_BracedPiece(value) {
        if (!(value instanceof Strings_BracedPieceBuilder)) {
            value = Strings_BalanceBraces(value);
            if (value[0] === '\\') {
                value = '{' + value + '}';
            }
            value = new Strings_BracedPieceBuilder(value);
        }
        this.Raw = value.Raw;
        this.Value = value.Value;
        this.Length = value.Length;
        this.Case = '?';
        this.Purified = value.Purified;
        this.PurifiedPedantic =
            value.Purified.replace(/[^0-9A-Za-z ]+/g, '');
        Helper.FreezeObject(this);
    }
    Strings_BracedPiece.Empty = new Strings_BracedPiece();
    return Strings_BracedPiece;
}());

;"use strict";
function Strings_SpCharToLowerCase(spch) {
    var replaced = spch.Value.replace(/([A-Z])[\u0000-\u005b\u005d-\u007f]*|\\(AA|AE|OE|O|L)(?![a-zA-Z])|\\[a-zA-Z]+\*?|\\[^a-zA-Z]/g, function (match, alpha, spcmd) {
        return (alpha !== undefined || spcmd !== undefined
            ? match.toLowerCase()
            : match);
    });
    return new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(replaced));
}
var Strings_ToLowerCaseStateMachine = (function () {
    function Strings_ToLowerCaseStateMachine() {
        this.Builder = new Strings_LiteralBuilder();
    }
    Strings_ToLowerCaseStateMachine.prototype.HandleBasic = function (bp) {
        this.Builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(bp.Value.replace(/[A-Z][\u0000-\u007f]*/g, function (x) { return x.toLowerCase(); }))));
    };
    Strings_ToLowerCaseStateMachine.prototype.HandleSpChar = function (spch) {
        this.Builder.AddSpCharPiece(Strings_SpCharToLowerCase(spch));
    };
    Strings_ToLowerCaseStateMachine.prototype.HandleBraced = function (braced) {
        this.Builder.AddBracedPiece(braced);
    };
    Strings_ToLowerCaseStateMachine.prototype.Finish = function () {
        return new Strings_Literal(this.Builder);
    };
    return Strings_ToLowerCaseStateMachine;
}());
function Strings_SpCharToUpperCase(spch) {
    var pasting = false;
    var converted = spch.Value.replace(/([a-z])[\u0000-\u005b\u005d-\u007f]*|\\(aa|ae|oe|o|l)(?![a-zA-Z])|\\(i|j|ss)[ \t\v\f\r\n]+|\\(i|j|ss)(?![a-zA-Z])|(\\)[a-zA-Z]+\*?|\\[^a-zA-Z]|[^a-z\\]+/g, function (match, alpha, spcmd, ijss1, ijss2, pastes) {
        var wasPasting = pasting;
        var ijss = ijss1 || ijss2;
        pasting = (spcmd !== undefined || pastes !== undefined);
        return (alpha !== undefined || spcmd !== undefined
            ? match.toUpperCase()
            : ijss !== undefined
                ? wasPasting
                    ? ' ' + ijss.toUpperCase()
                    : ijss.toUpperCase()
                : match);
    });
    return new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(converted[0] !== '\\'
        ? '\\relax ' + converted
        : converted));
}
var Strings_ToUpperCaseStateMachine = (function () {
    function Strings_ToUpperCaseStateMachine() {
        this.Builder = new Strings_LiteralBuilder();
    }
    Strings_ToUpperCaseStateMachine.prototype.HandleBasic = function (bp) {
        this.Builder.AddPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(bp.Value.replace(/[a-z][\u0000-\u007f]*/g, function (x) { return x.toUpperCase(); }))));
    };
    Strings_ToUpperCaseStateMachine.prototype.HandleSpChar = function (spch) {
        this.Builder.AddPiece(Strings_SpCharToUpperCase(spch));
    };
    Strings_ToUpperCaseStateMachine.prototype.HandleBraced = function (braced) {
        this.Builder.AddPiece(braced);
    };
    Strings_ToUpperCaseStateMachine.prototype.Finish = function () {
        return new Strings_Literal(this.Builder);
    };
    return Strings_ToUpperCaseStateMachine;
}());
var Strings_ToTitleCaseStateMachine = (function () {
    function Strings_ToTitleCaseStateMachine() {
        this.Preserving = true;
        this.Builder = new Strings_LiteralBuilder();
    }
    Strings_ToTitleCaseStateMachine.prototype.HandleBasic = function (bp) {
        var thisPreserving = this.Preserving;
        this.Builder.AddPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(bp.Value.replace(/([A-Z])[\u0000-\u0039\u003b-\u007f]*|(:)[ \t\v\f\r\n]+|:[^A-Z:]*|[^A-Z:]+/g, function (match, alpha, colon) {
            var wasPreserving = thisPreserving;
            thisPreserving = (colon !== undefined);
            return (alpha !== undefined
                ? wasPreserving
                    ? match[0] + match.substr(1).toLowerCase()
                    : match.toLowerCase()
                : match);
        }))));
        this.Preserving = thisPreserving;
    };
    Strings_ToTitleCaseStateMachine.prototype.HandleSpChar = function (spch) {
        var wasPreserving = this.Preserving;
        this.Preserving = false;
        this.Builder.AddPiece(wasPreserving
            ? spch
            : Strings_SpCharToLowerCase(spch));
    };
    Strings_ToTitleCaseStateMachine.prototype.HandleBraced = function (braced) {
        this.Preserving = false;
        this.Builder.AddPiece(braced);
    };
    Strings_ToTitleCaseStateMachine.prototype.Finish = function () {
        return new Strings_Literal(this.Builder);
    };
    return Strings_ToTitleCaseStateMachine;
}());
function Strings_ChangeCase(str, casing) {
    if (!(str instanceof Strings_Literal)
        || str.Pieces.length === 0) {
        return Strings_Literal.Empty;
    }
    var cssm = (casing === 'L' || casing === 'l'
        ? new Strings_ToLowerCaseStateMachine()
        : casing === 'U' || casing === 'u'
            ? new Strings_ToUpperCaseStateMachine()
            : new Strings_ToTitleCaseStateMachine());
    for (var _i = 0, _a = str.Pieces; _i < _a.length; _i++) {
        var piece = _a[_i];
        if (piece instanceof Strings_BasicPiece) {
            cssm.HandleBasic(piece);
        }
        else if (piece instanceof Strings_SpCharPiece) {
            cssm.HandleSpChar(piece);
        }
        else {
            cssm.HandleBraced(piece);
        }
    }
    return cssm.Finish();
}

;"use strict";
var Strings_LiteralBuilder = (function () {
    function Strings_LiteralBuilder() {
        this.RawPieces = [];
        this.Pieces = [];
        this.Length = 0;
        this.Case = '?';
        this.PurifiedPieces = [];
        this.PurifiedPedanticPieces = [];
        this.LeftoverPiece = undefined;
        this.LeftoverValue = [];
    }
    Strings_LiteralBuilder.prototype.PushLeftover = function () {
        if (this.LeftoverValue.length === 0) {
            return false;
        }
        var newpiece = (this.LeftoverValue.length == 1
            ? this.LeftoverPiece
            : new Strings_BasicPiece(new Strings_BasicPieceBuilder(this.LeftoverValue.join(''))));
        this.RawPieces.push(newpiece.Raw);
        this.Pieces.push(newpiece);
        this.Length += newpiece.Length;
        if (this.Case === '?') {
            this.Case = newpiece.Case;
        }
        this.PurifiedPieces.push(newpiece.Purified);
        this.PurifiedPedanticPieces.push(newpiece.PurifiedPedantic);
        this.LeftoverPiece = undefined;
        this.LeftoverValue = [];
        return true;
    };
    Strings_LiteralBuilder.prototype.AddBasicPiece = function (piece) {
        if (piece.Value.length === 0) {
            return;
        }
        this.LeftoverPiece = piece;
        this.LeftoverValue.push(piece.Value);
    };
    Strings_LiteralBuilder.prototype.AddSpCharPiece = function (piece) {
        this.PushLeftover();
        this.RawPieces.push(piece.Raw);
        this.Pieces.push(piece);
        this.Length += piece.Length;
        if (this.Case === '?') {
            this.Case = piece.Case;
        }
        this.PurifiedPieces.push(piece.Purified);
        this.PurifiedPedanticPieces.push(piece.PurifiedPedantic);
    };
    Strings_LiteralBuilder.prototype.AddBracedPiece = function (piece) {
        this.PushLeftover();
        this.RawPieces.push(piece.Raw);
        this.Pieces.push(piece);
        this.Length += piece.Length;
        if (this.Case === '?') {
            this.Case = piece.Case;
        }
        this.PurifiedPieces.push(piece.Purified);
        this.PurifiedPedanticPieces.push(piece.PurifiedPedantic);
    };
    Strings_LiteralBuilder.prototype.AddPiece = function (piece) {
        if (piece instanceof Strings_BasicPiece) {
            this.AddBasicPiece(piece);
            return true;
        }
        if (piece instanceof Strings_SpCharPiece) {
            this.AddSpCharPiece(piece);
            return true;
        }
        if (piece instanceof Strings_BracedPiece) {
            this.AddBracedPiece(piece);
            return true;
        }
        return false;
    };
    return Strings_LiteralBuilder;
}());
var Strings_Literal = (function () {
    function Strings_Literal(pieces) {
        if (!(pieces instanceof Strings_LiteralBuilder)) {
            pieces = Strings_LaunderPieces(pieces);
        }
        pieces.PushLeftover();
        this.Raw = pieces.RawPieces.join('');
        this.Pieces = pieces.Pieces;
        this.Length = pieces.Length;
        this.Case = pieces.Case;
        this.Purified = pieces.PurifiedPieces.join('');
        this.PurifiedPedantic = pieces.PurifiedPedanticPieces.join('');
        Helper.FreezeObject(this.Pieces);
        Helper.FreezeObject(this);
    }
    Strings_Literal.Concat = function (summands) {
        if (!(summands instanceof Array)
            || summands.length === 0) {
            return Strings_Literal.Empty;
        }
        if (summands.length === 1) {
            var summand = summands[0];
            return (summand instanceof Strings_Literal
                ? summand
                : Strings_Literal.Empty);
        }
        var builder = new Strings_LiteralBuilder();
        for (var _i = 0, summands_1 = summands; _i < summands_1.length; _i++) {
            var item = summands_1[_i];
            if (item instanceof Strings_Literal) {
                for (var _a = 0, _b = item.Pieces; _a < _b.length; _a++) {
                    var piece = _b[_a];
                    builder.AddPiece(piece);
                }
            }
        }
        return new Strings_Literal(builder);
    };
    Strings_Literal.prototype.ToUpperCase = function () {
        return Strings_ChangeCase(this, 'U');
    };
    Strings_Literal.prototype.ToLowerCase = function () {
        return Strings_ChangeCase(this, 'L');
    };
    Strings_Literal.prototype.ToTitleCase = function () {
        return Strings_ChangeCase(this, 'T');
    };
    Strings_Literal.prototype.ToCase = function (casing) {
        return Strings_ChangeCase(this, casing);
    };
    Strings_Literal.prototype.Prefix = function (len) {
        len = (len || 0) >>> 0;
        return Strings_TextPrefix(this, len);
    };
    Strings_Literal.prototype.PrefixRaw = function (len) {
        len = (len || 0) >>> 0;
        return Strings_TextPrefixRaw(this, len);
    };
    Strings_Literal.prototype.IsCompleteSentence = function () {
        return /[.?!][}]*$/.test(this.Raw);
    };
    Strings_Literal.Empty = new Strings_Literal();
    return Strings_Literal;
}());

;"use strict";
var Strings_ParseLiteralResult = (function () {
    function Strings_ParseLiteralResult(text, errpos, errno, result) {
        this.Text = text;
        this.ErrorPos = errpos;
        this.ErrorCode = errno;
        this.Result = result;
        Helper.FreezeObject(this);
    }
    Strings_ParseLiteralResult.ERROR_SUCCESS = 0;
    Strings_ParseLiteralResult.ERROR_CLOSING_BRACE = 1;
    Strings_ParseLiteralResult.ERROR_UNCLOSED_BRACE = 2;
    Strings_ParseLiteralResult.ErrorMessages = [
        'BibTeX.ParseString: Operation completed successfullly.',
        'BibTeX.ParseString: Outstanding closing brace.',
        'BibTeX.ParseString: Unclosed brace (end of string).'
    ];
    return Strings_ParseLiteralResult;
}());
function Strings_ParseLiteral(text) {
    text = '' + (text || '');
    var builder = new Strings_LiteralBuilder();
    var depth = 0, beginpos = 0, errpos = -1;
    var token = null;
    var rgx = /([^{}]*)([{}])/g;
    while (token = rgx.exec(text)) {
        if (token[2] === '{') {
            if (depth++ === 0) {
                var content_1 = token[1];
                if (content_1.length !== 0) {
                    builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(content_1)));
                }
                beginpos = rgx.lastIndex;
            }
            continue;
        }
        if (depth === 0) {
            var content_2 = token[1];
            beginpos = rgx.lastIndex;
            errpos = (errpos === -1 ? beginpos - 1 : errpos);
            if (content_2.length !== 0) {
                builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(content_2)));
            }
            builder.AddBracedPiece(Strings_BracedPiece.Empty);
            continue;
        }
        if (--depth !== 0) {
            continue;
        }
        var content_3 = text.substr(beginpos, rgx.lastIndex - 1 - beginpos);
        beginpos = rgx.lastIndex;
        if (content_3[0] === '\\') {
            builder.AddSpCharPiece(new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(content_3)));
        }
        else {
            builder.AddBracedPiece(new Strings_BracedPiece(new Strings_BracedPieceBuilder(content_3)));
        }
    }
    if (depth-- === 0) {
        if (beginpos !== text.length) {
            builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(text.substr(beginpos))));
        }
        return new Strings_ParseLiteralResult(text, errpos === -1 ? text.length : errpos, errpos === -1
            ? Strings_ParseLiteralResult.ERROR_SUCCESS
            : Strings_ParseLiteralResult.ERROR_CLOSING_BRACE, new Strings_Literal(builder));
    }
    var content = text.substr(beginpos) +
        Helper.RepeatString('}', depth);
    if (content[0] === '\\') {
        builder.AddSpCharPiece(new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(content)));
    }
    else {
        builder.AddBracedPiece(new Strings_BracedPiece(new Strings_BracedPieceBuilder(content)));
    }
    return new Strings_ParseLiteralResult(text, errpos === -1 ? text.length : errpos, errpos === -1
        ? Strings_ParseLiteralResult.ERROR_UNCLOSED_BRACE
        : Strings_ParseLiteralResult.ERROR_CLOSING_BRACE, new Strings_Literal(builder));
}

;"use strict";
var Strings_SpCharPieceBuilder = (function () {
    function Strings_SpCharPieceBuilder(value) {
        this.Value = value;
        var purified = value.replace(/\\(AE|OE|ae|oe|ss|[LOijlo])(?![a-zA-Z])|\\(a)a(?![a-zA-Z])|\\(A)A(?![a-zA-Z])|\\[a-zA-Z]+\*?|\\[^a-zA-Z]|[\u0000-\u002f\u003a-\u0040\u005b\u005d-\u0060\u007b-\u007f]+|\\$/g, '$1$2$3');
        var probe = /[a-zA-Z]/.exec(purified);
        this.Case = (probe
            ? /[A-Z]/.test(probe[0]) ? 'U' : 'l'
            : '?');
        this.Purified = purified;
        this.Raw = '{' + value + '}';
        Helper.FreezeObject(this);
    }
    return Strings_SpCharPieceBuilder;
}());
var Strings_SpCharPiece = (function () {
    function Strings_SpCharPiece(value) {
        if (!(value instanceof Strings_SpCharPieceBuilder)) {
            value = Strings_BalanceBraces(value);
            if (value.length === 0) {
                value = '\\relax';
            }
            else if (/[ \t\v\f\r\n]/.test(value[0])) {
                value = '\\relax{}' + value;
            }
            else if (value[0] !== '\\') {
                value = '\\relax ' + value;
            }
            value = new Strings_SpCharPieceBuilder(value);
        }
        this.Raw = value.Raw;
        this.Value = value.Value;
        this.Length = 1;
        this.Case = value.Case;
        this.Purified = value.Purified;
        this.PurifiedPedantic =
            value.Purified.replace(/[^0-9A-Za-z ]+/g, '');
        Helper.FreezeObject(this);
    }
    Strings_SpCharPiece.Empty = new Strings_SpCharPiece();
    return Strings_SpCharPiece;
}());

;"use strict";
function Strings_TextPrefix(str, len) {
    if (!(str instanceof Strings_Literal)) {
        return Strings_Literal.Empty;
    }
    len >>>= 0;
    if (len === 0) {
        return Strings_Literal.Empty;
    }
    if (str.Length <= len) {
        return str;
    }
    var builder = new Strings_LiteralBuilder();
    for (var _i = 0, _a = str.Pieces; _i < _a.length; _i++) {
        var piece = _a[_i];
        if (piece.Length <= len) {
            builder.AddPiece(piece);
            len -= piece.Length;
            if (len === 0) {
                break;
            }
            continue;
        }
        if (piece instanceof Strings_BasicPiece) {
            builder.AddPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(piece.Value.substr(0, len))));
            break;
        }
        if (piece instanceof Strings_SpCharPiece) {
            break;
        }
        var rgx = /([^{}]*)([{}])/g;
        var text = piece.Value;
        var depth = 0, prefix = 0;
        var token = null;
        while (token = rgx.exec(text)) {
            var partlen = token[1].length;
            if (partlen < len) {
                prefix += partlen + 1;
                len -= partlen;
                depth += (token[2] === '{' ? 1 : -1);
            }
            else {
                prefix += len;
                len = 0;
                break;
            }
        }
        builder.AddPiece(new Strings_BracedPiece(new Strings_BracedPieceBuilder(text.substr(0, prefix + len) +
            Helper.RepeatString('}', depth))));
        break;
    }
    return new Strings_Literal(builder);
}
function Strings_TextPrefixRaw(str, len) {
    if (!(str instanceof Strings_Literal)) {
        return '';
    }
    len >>>= 0;
    if (len === 0) {
        return '';
    }
    if (str.Length <= len) {
        return str.Raw;
    }
    var result = [];
    for (var _i = 0, _a = str.Pieces; _i < _a.length; _i++) {
        var piece = _a[_i];
        if (piece.Length <= len) {
            result.push(piece.Raw);
            len -= piece.Length;
            if (len === 0) {
                break;
            }
            continue;
        }
        if (piece instanceof Strings_BasicPiece) {
            result.push(piece.Value.substr(0, len));
            break;
        }
        if (piece instanceof Strings_SpCharPiece) {
            break;
        }
        var rgx = /([^{}]*)([{}])/g;
        var text = piece.Value;
        var depth = 0, prefix = 0;
        var token = null;
        while (token = rgx.exec(text)) {
            var partlen = token[1].length;
            if (partlen < len) {
                prefix += partlen + 1;
                len -= partlen;
                depth += (token[2] === '{' ? 1 : -1);
            }
            else {
                prefix += len;
                len = 0;
                break;
            }
        }
        result.push('{');
        result.push(text.substr(0, prefix + len));
        result.push(Helper.RepeatString('}', depth + 1));
        break;
    }
    return result.join('');
}

;"use strict";
function Strings_BalanceBraces(value) {
    value = '' + (value || '');
    var depth = 0;
    value = value.replace(/([^{}]*)([{}])|[^{}]+$/g, function (match, nonbrace, brace) {
        if (brace === '{') {
            ++depth;
            return match;
        }
        if (brace !== '}') {
            return match;
        }
        if (depth === 0) {
            return nonbrace + '{}';
        }
        --depth;
        return match;
    });
    return value + Helper.RepeatString('}', depth);
}
function Strings_LaunderPieces(pieces) {
    var builder = new Strings_LiteralBuilder();
    if (!(pieces instanceof Array)
        || pieces.length === 0) {
        return builder;
    }
    for (var _i = 0, pieces_1 = pieces; _i < pieces_1.length; _i++) {
        var piece = pieces_1[_i];
        builder.AddPiece(piece);
    }
    return builder;
}
ExportBibTeX.Strings = (function (ns) {
    ns.BasicPiece = Strings_BasicPiece;
    ns.SpCharPiece = Strings_SpCharPiece;
    ns.BracedPiece = Strings_BracedPiece;
    ns.Literal = Strings_Literal;
    ns.ParseLiteralResult = Strings_ParseLiteralResult;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX._Privates.Strings = (function (ns) {
    ns.BasicPieceBuilder = Strings_BasicPieceBuilder;
    ns.BalanceBraces = Strings_BalanceBraces;
    ns.BasicPiece = Strings_BasicPiece;
    ns.SpCharPieceBuilder = Strings_SpCharPieceBuilder;
    ns.SpCharPiece = Strings_SpCharPiece;
    ns.BracedPieceBuilder = Strings_BracedPieceBuilder;
    ns.BracedPiece = Strings_BracedPiece;
    ns.LiteralBuilder = Strings_LiteralBuilder;
    ns.LaunderPieces = Strings_LaunderPieces;
    ns.Literal = Strings_Literal;
    ns.ParseLiteralResult = Strings_ParseLiteralResult;
    ns.ParseLiteral = Strings_ParseLiteral;
    ns.SpCharToLowerCase = Strings_SpCharToLowerCase;
    ns.ToLowerCaseStateMachine = Strings_ToLowerCaseStateMachine;
    ns.SpCharToUpperCase = Strings_SpCharToUpperCase;
    ns.ToUpperCaseStateMachine = Strings_ToUpperCaseStateMachine;
    ns.ToTitleCaseStateMachine = Strings_ToTitleCaseStateMachine;
    ns.ChangeCase = Strings_ChangeCase;
    ns.TextPrefix = Strings_TextPrefix;
    ns.TextPrefixRaw = Strings_TextPrefixRaw;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX.ParseLiteral = Strings_ParseLiteral;

/* Strings @@ */

/* @@ ObjectModel */
"use strict";
var ObjectModel_RequiredFieldsCNF = (function (cnf) {
    cnf['article'] = [['author'], ['title'], ['journal'], ['year']];
    cnf['book'] = [['author', 'editor'], ['title'], ['publisher'], ['year']];
    cnf['booklet'] = [['title']];
    cnf['conference'] = [['author'], ['title'], ['booktitle'], ['year']];
    cnf['inbook'] = [['author', 'editor'], ['title'], ['chapter', 'pages'], ['publisher'], ['year']];
    cnf['incollection'] = [['author'], ['title'], ['booktitle'], ['year']];
    cnf['inproceedings'] = [['author'], ['title'], ['booktitle'], ['year']];
    cnf['manual'] = [['title']];
    cnf['masterthesis'] = [['author'], ['title'], ['school'], ['year']];
    cnf['misc'] = [];
    cnf['phdthesis'] = [['author'], ['title'], ['school'], ['year']];
    cnf['proceedings'] = [['title'], ['year']];
    cnf['techreport'] = [['author'], ['title'], ['institution'], ['year']];
    cnf['unpublished'] = [['author'], ['title'], ['misc']];
    Helper.FreezeDescendants(cnf);
    return Helper.FreezeObject(cnf);
})(Helper.NewEmptyObject());
var ObjectModel_EntryDataPrivates = (function () {
    function ObjectModel_EntryDataPrivates(owner, ofKey) {
        this.Owner = owner;
        this.ofKey = ofKey;
        this.Resolved = undefined;
        this.Resolving = false;
    }
    ObjectModel_EntryDataPrivates.prototype.Unresolve = function () {
        if (this.Resolving) {
            return false;
        }
        this.Resolved = undefined;
        return true;
    };
    ObjectModel_EntryDataPrivates.prototype.Resolve = function (macros, refresh) {
        if (this.Resolving) {
            return this.Resolved;
        }
        try {
            this.Resolving = true;
            if (refresh || !this.Resolved) {
                var owner = this.Owner;
                var result = new ObjectModel_Entry(owner.Type, owner.Id);
                this.Resolved = result;
                var fields = owner.Fields;
                var resultFields = result.Fields;
                for (var field in fields) {
                    resultFields[field] =
                        fields[field].Resolve(macros, refresh);
                }
                var crossref = resultFields['crossref'];
                if (crossref !== undefined) {
                    var parent_1 = this.ofKey[crossref.Raw];
                    if (parent_1 !== undefined) {
                        var parentResolved = parent_1.Resolve(macros, refresh);
                        var parentFields = parentResolved.Fields;
                        for (var field in parentFields) {
                            if (resultFields[field] === undefined) {
                                resultFields[field] = parentFields[field];
                            }
                        }
                    }
                }
                Helper.FreezeObject(result.Fields);
            }
        }
        finally {
            this.Resolving = false;
        }
        return this.Resolved;
    };
    return ObjectModel_EntryDataPrivates;
}());
var ObjectModel_EntryData = (function () {
    function ObjectModel_EntryData(type, id, ofKey) {
        if ((typeof ofKey !== 'object' && typeof ofKey !== 'function')
            || ofKey instanceof Number || ofKey instanceof String
            || ofKey instanceof Boolean || !ofKey) {
            ofKey = Helper.NewEmptyObject();
        }
        this._MutablePrivates = new ObjectModel_EntryDataPrivates(this, ofKey);
        this.Type = ('' + (type || '')).toLowerCase();
        this.Id = '' + (id || '');
        this.Fields = Helper.NewEmptyObject();
        Helper.FreezeObject(this);
    }
    ObjectModel_EntryData.prototype.Resolve = function (macros, refresh) {
        return this._MutablePrivates.Resolve(macros, refresh);
    };
    ObjectModel_EntryData.prototype.Unresolve = function () {
        return this._MutablePrivates.Unresolve();
    };
    ObjectModel_EntryData.prototype.IsStandardCompliant = function () {
        var conjunction = ObjectModel_RequiredFieldsCNF[this.Id];
        if (conjunction === undefined) {
            return true;
        }
        for (var _i = 0, conjunction_1 = conjunction; _i < conjunction_1.length; _i++) {
            var clause = conjunction_1[_i];
            var satisfied = false;
            for (var _a = 0, clause_1 = clause; _a < clause_1.length; _a++) {
                var literal = clause_1[_a];
                if (literal in this.Fields) {
                    satisfied = true;
                    break;
                }
            }
            if (!satisfied) {
                return false;
            }
        }
        return true;
    };
    return ObjectModel_EntryData;
}());
var ObjectModel_Entry = (function () {
    function ObjectModel_Entry(type, id) {
        this.Type = ('' + (type || '')).toLowerCase();
        this.Id = '' + (id || '');
        this.Fields = Helper.NewEmptyObject();
        Helper.FreezeObject(this);
    }
    ObjectModel_Entry.prototype.IsStandardCompliant = function () {
        var conjunction = ObjectModel_RequiredFieldsCNF[this.Id];
        if (conjunction === undefined) {
            return true;
        }
        for (var _i = 0, conjunction_2 = conjunction; _i < conjunction_2.length; _i++) {
            var clause = conjunction_2[_i];
            var satisfied = false;
            for (var _a = 0, clause_2 = clause; _a < clause_2.length; _a++) {
                var literal = clause_2[_a];
                if (literal in this.Fields) {
                    satisfied = true;
                    break;
                }
            }
            if (!satisfied) {
                return false;
            }
        }
        return true;
    };
    return ObjectModel_Entry;
}());

;"use strict";
var ObjectModel_DatabaseParser = (function () {
    function ObjectModel_DatabaseParser(text) {
        this.rgxEatJunk = /[^@]*@/g;
        this.myTypeId = undefined;
        this.myEntryCmdDelim = undefined;
        this.myCommentDepth = undefined;
        this.rgxEatCommentDepth0 = [/[^{}]*([{}])|[^{}]*$/g, /[^{})]*([{})])|[^{})]*$/g];
        this.rgxEatCommentDepth1 = /[^{}]*([{}])|[^{}]*$/g;
        this.myStringId = undefined;
        this.myEntry = undefined;
        this.myFieldId = undefined;
        this.pfnEatStringExprCleanup = undefined;
        this.myStringExprGood = false;
        this.myStringExpr = undefined;
        this.myIStringTermGood = false;
        this.rgxTryEatDelimitedLiteral = /[^{}"]*([{}"])/g;
        this.rgxTryEatLBraceLParen = /[ \t\v\f\r\n]*(([{(])|[^{( \t\v\f\r\n])/g;
        this.rgxTryEatTypeId = /[ \t\v\f\r\n]*(([a-zA-Z_]+)|[^a-zA-Z_ \t\v\f\r\n])/g;
        this.rgxTryEatStringId = /[ \t\v\f\r\n]*(([a-zA-Z_][a-zA-Z0-9_.:+/-]*)|[^a-zA-Z_ \t\v\f\r\n])/g;
        this.rgxTryEatEquals = /[ \t\v\f\r\n]*(([=])|[^= \t\v\f\r\n])/g;
        this.rgxTryEatEntryId = /[ \t\v\f\r\n]*(([a-zA-Z0-9_.:+/-]+)|[^a-zA-Z0-9_.:+/ \t\v\f\r\n-])/g;
        this.rgxTryEatCommaEqualsRBrace = /[ \t\v\f\r\n]*(([,=}])|[^,=} \t\v\f\r\n])/g;
        this.rgxTryEatCommaRBrace = /[ \t\v\f\r\n]*(([,}])|[^,} \t\v\f\r\n])/g;
        this.rgxTryEatCommaEqualsRParen = /[ \t\v\f\r\n]*(([,=)])|[^,=) \t\v\f\r\n])/g;
        this.rgxTryEatCommaRParen = /[ \t\v\f\r\n]*(([,)])|[^,) \t\v\f\r\n])/g;
        this.rgxTryEatFieldId = /[ \t\v\f\r\n]*(([a-zA-Z_]+)|[^a-zA-Z_ \t\v\f\r\n])/g;
        this.rgxTryEatNumeral = /[ \t\v\f\r\n]*(([0-9]+)|[^0-9 \t\v\f\r\n])/g;
        this.rgxTryEatLBraceQuote = /[ \t\v\f\r\n]*(([{"])|[^{" \t\v\f\r\n])/g;
        this.rgxTryEatPound = /[ \t\v\f\r\n]*(([#])|[^# \t\v\f\r\n])/g;
        this.rgxTryEatRBrace = /[ \t\v\f\r\n]*(([}])|[^} \t\v\f\r\n])/g;
        this.rgxTryEatRParen = /[ \t\v\f\r\n]*(([)])|[^) \t\v\f\r\n])/g;
        this.Text = text;
        this.LastIndex = 0;
        this.Result = new ObjectModel_ParseDatabaseResult();
        this.Preamble = [];
        this.pfnNext = this.EatJunk;
    }
    ObjectModel_DatabaseParser.prototype.GetStateSummary = function (len) {
        len = (len || 0) >>> 0;
        len = (len < 16 ? 16 : len > 1024 ? 1024 : len);
        var clsParser = ObjectModel_DatabaseParser.prototype;
        var fnName = '[unknown]';
        for (var key in clsParser) {
            if (clsParser[key] === this.pfnNext) {
                fnName = key;
                break;
            }
        }
        var pos = this.LastIndex.toString();
        pos = Helper.RepeatString(' ', this.Text.length.toString().length - pos.length) + pos;
        var excerpt = JSON.stringify(this.Text.substr(this.LastIndex, len));
        excerpt = excerpt.substr(1, excerpt.length - 2);
        return Helper.RepeatString(' ', 21 - fnName.length) +
            fnName + ' | ' + pos + ' | ' + excerpt;
    };
    ObjectModel_DatabaseParser.prototype.Operate = function () {
        return this.pfnNext();
    };
    ObjectModel_DatabaseParser.prototype.Finish = function () {
        var result = this.Result;
        result.Preamble = ObjectModel_StringExpr.Concat(this.Preamble);
        Helper.FreezeDescendants(result, result.Strings);
        return Helper.FreezeObject(result);
    };
    ObjectModel_DatabaseParser.prototype.EatNothing = function () {
        return false;
    };
    ObjectModel_DatabaseParser.prototype.EatJunk = function () {
        var rgx = this.rgxEatJunk;
        rgx.lastIndex = this.LastIndex;
        var match = rgx.exec(this.Text);
        if (!match) {
            this.LastIndex = this.Text.length;
            this.pfnNext = this.EatNothing;
            return false;
        }
        this.LastIndex = rgx.lastIndex;
        this.pfnNext = this.EatTypeId;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatTypeId = function () {
        var tid = this.TryEatTypeId();
        if (tid === undefined || tid === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_TYPE_ID));
            this.pfnNext = this.EatJunk;
            return true;
        }
        this.myTypeId = tid.toLowerCase();
        this.pfnNext = this.EatEntryCmdDelimiter;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatEntryCmdDelimiter = function () {
        var lblp = this.TryEatLBraceLParen();
        if (lblp === undefined || lblp === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_ENTRYCMD_DELIM));
            this.pfnNext = this.EatJunk;
            return true;
        }
        this.myEntryCmdDelim = (lblp === '{' ? 0 : 1);
        var tid = this.myTypeId;
        this.pfnNext = (tid === 'comment'
            ? this.EatCommentCmd
            : tid === 'preamble'
                ? this.EatPreambleCmd
                : tid === 'string'
                    ? this.EatStringCmd
                    : this.EatEntry);
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatCommentCmd = function () {
        this.myCommentDepth = 0;
        this.pfnNext = this.EatCommentContent;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatCommentContent = function () {
        var rgx = (this.myCommentDepth === 0
            ? this.rgxEatCommentDepth0[this.myEntryCmdDelim]
            : this.rgxEatCommentDepth1);
        rgx.lastIndex = this.LastIndex;
        var match = rgx.exec(this.Text);
        if (!match || match[1] === undefined) {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex = this.Text.length, ObjectModel_ParseDatabaseError.ERROR_COMMENT_OPEN));
            this.pfnNext = this.EatNothing;
            return false;
        }
        if (match[1] === '{') {
            ++this.myCommentDepth;
            this.LastIndex = rgx.lastIndex;
            return true;
        }
        if (this.myCommentDepth !== 0) {
            --this.myCommentDepth;
            this.LastIndex = rgx.lastIndex;
            return true;
        }
        if (match[1] === '})'[this.myEntryCmdDelim]) {
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatJunk;
            return true;
        }
        this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex = rgx.lastIndex - 1, ObjectModel_ParseDatabaseError.ERROR_COMMENT_RBRACE));
        this.pfnNext = this.EatJunk;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatPreambleCmd = function () {
        this.pfnEatStringExprCleanup = this.EatPreambleCmdCleanup;
        this.pfnNext = this.EatStringExpr;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatPreambleCmdCleanup = function () {
        this.Preamble.push(this.myStringExpr);
        this.pfnNext = this.EatJunk;
        if (!this.myStringExprGood) {
            return true;
        }
        var closing = (this.myEntryCmdDelim === 0
            ? this.TryEatRBrace() : this.TryEatRParen());
        if (closing === undefined || closing === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, this.myEntryCmdDelim === 0
                ? ObjectModel_ParseDatabaseError.ERROR_PREAMBLE_POUND_RBRACE
                : ObjectModel_ParseDatabaseError.ERROR_PREAMBLE_POUND_RPAREN));
        }
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatStringCmd = function () {
        var strid = this.TryEatStringId();
        if (strid === undefined || strid === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_STRING_ID));
            this.pfnNext = this.EatJunk;
            return true;
        }
        var eqsign = this.TryEatEquals();
        if (eqsign === undefined || eqsign === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_STRING_EQ));
            this.pfnNext = this.EatJunk;
            return false;
        }
        this.myStringId = strid.toLowerCase();
        this.pfnEatStringExprCleanup = this.EatStringCmdCleanup;
        this.pfnNext = this.EatStringExpr;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatStringCmdCleanup = function () {
        var strid = this.myStringId;
        var strtable = this.Result.Strings;
        if (strid in strtable) {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_STRING_ID_DUP));
        }
        strtable[strid] = this.myStringExpr;
        this.pfnNext = this.EatJunk;
        if (!this.myStringExprGood) {
            return true;
        }
        var closing = (this.myEntryCmdDelim === 0
            ? this.TryEatRBrace() : this.TryEatRParen());
        if (closing === undefined || closing === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, this.myEntryCmdDelim === 0
                ? ObjectModel_ParseDatabaseError.ERROR_STRING_POUND_RBRACE
                : ObjectModel_ParseDatabaseError.ERROR_STRING_POUND_RPAREN));
        }
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatEntry = function () {
        var efid = this.TryEatEntryId();
        if (efid === undefined || efid === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_ENTRY_EID_FID));
            this.pfnNext = this.EatJunk;
            return true;
        }
        var possibleField = /^[a-zA-Z_]+$/.test(efid);
        var afterEid = (this.myEntryCmdDelim === 0
            ? possibleField
                ? this.TryEatCommaEqualsRBrace()
                : this.TryEatCommaRBrace()
            : possibleField
                ? this.TryEatCommaEqualsRParen()
                : this.TryEatCommaRParen());
        if (afterEid === undefined || afterEid === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, this.myEntryCmdDelim === 0
                ? possibleField
                    ? ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_EQ_RBRACE
                    : ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_RBRACE
                : possibleField
                    ? ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_EQ_RPAREN
                    : ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_RPAREN));
            this.pfnNext = this.EatJunk;
            return true;
        }
        var ofKey = this.Result.ofKey;
        if (afterEid === ',') {
            this.myEntry = new ObjectModel_EntryData(this.myTypeId, efid, ofKey);
            this.pfnNext = this.EatField;
            return true;
        }
        if (afterEid === '=') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_ENTRY_ID_MISSING));
            this.myEntry = new ObjectModel_EntryData(this.myTypeId, '', ofKey);
            this.myFieldId = efid.toLowerCase();
            this.pfnEatStringExprCleanup = this.EatFieldCleanup;
            this.pfnNext = this.EatStringExpr;
            return true;
        }
        this.myEntry = new ObjectModel_EntryData(this.myTypeId, efid, ofKey);
        this.pfnNext = this.EatEntryCleanup;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatEntryCleanup = function () {
        var entry = this.myEntry;
        var eid = entry.Id;
        this.Result.Entries.push(entry);
        this.pfnNext = this.EatJunk;
        if (eid === '') {
            return true;
        }
        var entries = this.Result.ofKey;
        if (eid in entries) {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_ENTRY_ID_DUP));
        }
        else {
            entries[eid] = entry;
        }
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatField = function () {
        var fid = this.TryEatFieldId();
        var eqrbrp = (fid === undefined || fid === ''
            ? this.myEntryCmdDelim === 0
                ? this.TryEatRBrace() : this.TryEatRParen()
            : this.TryEatEquals());
        if (eqrbrp === '=') {
            this.myFieldId = fid.toLowerCase();
            this.pfnEatStringExprCleanup = this.EatFieldCleanup;
            this.pfnNext = this.EatStringExpr;
            return true;
        }
        this.pfnNext = this.EatEntryCleanup;
        if (fid !== undefined && fid !== '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_ENTRY_EQ));
        }
        else if (eqrbrp === undefined || eqrbrp === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, this.myEntryCmdDelim === 0
                ? ObjectModel_ParseDatabaseError.ERROR_ENTRY_FID_RBRACE
                : ObjectModel_ParseDatabaseError.ERROR_ENTRY_FID_RPAREN));
        }
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatFieldCleanup = function () {
        var fid = this.myFieldId;
        var fields = this.myEntry.Fields;
        if (fid in fields) {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_FIELD_ID_DUP));
        }
        else {
            fields[fid] = this.myStringExpr;
        }
        if (!this.myStringExprGood) {
            this.pfnNext = this.EatEntryCleanup;
            return true;
        }
        var commaclosing = (this.myEntryCmdDelim === 0
            ? this.TryEatCommaRBrace() : this.TryEatCommaRParen());
        if (commaclosing === ',') {
            this.pfnNext = this.EatField;
            return true;
        }
        this.pfnNext = this.EatEntryCleanup;
        if (commaclosing === undefined || commaclosing === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, this.myEntryCmdDelim === 0
                ? ObjectModel_ParseDatabaseError.ERROR_ENTRY_POUND_COMMA_RBRACE
                : ObjectModel_ParseDatabaseError.ERROR_ENTRY_POUND_COMMA_RPAREN));
        }
        return true;
    };
    ObjectModel_DatabaseParser.prototype.EatStringExpr = function () {
        this.myStringExprGood = false;
        var builder = new ObjectModel_StringExprBuilder();
        for (builder.AddSummand(this.TryEatIStringTerm()); this.myIStringTermGood; builder.AddSummand(this.TryEatIStringTerm())) {
            if (this.TryEatPound() !== '#') {
                this.myStringExprGood = true;
                break;
            }
        }
        this.myStringExpr = new ObjectModel_StringExpr(builder);
        this.pfnNext = this.pfnEatStringExprCleanup;
        return true;
    };
    ObjectModel_DatabaseParser.prototype.TryEatIStringTerm = function () {
        this.myIStringTermGood = false;
        var numeral = this.TryEatNumeral();
        if (numeral !== undefined && numeral !== '') {
            var builder = new Strings_LiteralBuilder();
            builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(numeral)));
            this.myIStringTermGood = true;
            return new Strings_Literal(builder);
        }
        var strid = this.TryEatStringId();
        if (strid !== undefined && strid !== '') {
            this.myIStringTermGood = true;
            return new ObjectModel_StringRef(strid, this.Result.Strings);
        }
        var bracequote = this.TryEatLBraceQuote();
        if (bracequote === undefined || bracequote === '') {
            this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex, ObjectModel_ParseDatabaseError.ERROR_STREXPR_OPERAND));
            return Strings_Literal.Empty;
        }
        return this.TryEatDelimitedLiteral(bracequote === '{' ? '}' : '"');
    };
    ObjectModel_DatabaseParser.prototype.TryEatDelimitedLiteral = function (delim) {
        var text = this.Text;
        var builder = new Strings_LiteralBuilder();
        var depth = 0, beginpos = this.LastIndex;
        var token = null;
        var rgx = this.rgxTryEatDelimitedLiteral;
        rgx.lastIndex = this.LastIndex;
        while (token = rgx.exec(text)) {
            var delimchr = token[1];
            var partlen = rgx.lastIndex - 1 - beginpos;
            if (delimchr === delim && depth === 0) {
                if (partlen !== 0) {
                    builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(text.substr(beginpos, partlen))));
                }
                this.myIStringTermGood = true;
                this.LastIndex = rgx.lastIndex;
                depth = -1;
                break;
            }
            if (delimchr === '"') {
                continue;
            }
            if (delimchr === '{') {
                if (depth++ === 0) {
                    if (partlen !== 0) {
                        builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(text.substr(beginpos, partlen))));
                    }
                    beginpos = rgx.lastIndex;
                }
                continue;
            }
            if (depth === 0) {
                if (partlen !== 0) {
                    builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(text.substr(beginpos, partlen))));
                }
                this.Result.Errors.push(new ObjectModel_ParseDatabaseError(rgx.lastIndex - 1, ObjectModel_ParseDatabaseError.ERROR_STREXPR_RBRACE));
                this.LastIndex = rgx.lastIndex;
                depth = -1;
                break;
            }
            if (--depth !== 0) {
                continue;
            }
            var content = text.substr(beginpos, partlen);
            beginpos = rgx.lastIndex;
            if (content[0] === '\\') {
                builder.AddSpCharPiece(new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(content)));
            }
            else {
                builder.AddBracedPiece(new Strings_BracedPiece(new Strings_BracedPieceBuilder(content)));
            }
        }
        if (depth === -1) {
            return new Strings_Literal(builder);
        }
        this.Result.Errors.push(new ObjectModel_ParseDatabaseError(this.LastIndex = text.length, ObjectModel_ParseDatabaseError.ERROR_STREXPR_OPEN));
        var trailingPiece = text.substr(beginpos);
        if (depth-- === 0) {
            if (trailingPiece.length !== 0) {
                builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(trailingPiece)));
            }
        }
        else if (trailingPiece[0] === '\\') {
            builder.AddSpCharPiece(new Strings_SpCharPiece(new Strings_SpCharPieceBuilder(trailingPiece + Helper.RepeatString('}', depth))));
        }
        else {
            builder.AddBracedPiece(new Strings_BracedPiece(new Strings_BracedPieceBuilder(trailingPiece + Helper.RepeatString('}', depth))));
        }
        return new Strings_Literal(builder);
    };
    ObjectModel_DatabaseParser.prototype.TryEatLBraceLParen = function () { return this.TryEatTemplate(this.rgxTryEatLBraceLParen); };
    ObjectModel_DatabaseParser.prototype.TryEatTypeId = function () { return this.TryEatTemplate(this.rgxTryEatTypeId); };
    ObjectModel_DatabaseParser.prototype.TryEatStringId = function () { return this.TryEatTemplate(this.rgxTryEatStringId); };
    ObjectModel_DatabaseParser.prototype.TryEatEquals = function () { return this.TryEatTemplate(this.rgxTryEatEquals); };
    ObjectModel_DatabaseParser.prototype.TryEatEntryId = function () { return this.TryEatTemplate(this.rgxTryEatEntryId); };
    ObjectModel_DatabaseParser.prototype.TryEatCommaEqualsRBrace = function () { return this.TryEatTemplate(this.rgxTryEatCommaEqualsRBrace); };
    ObjectModel_DatabaseParser.prototype.TryEatCommaRBrace = function () { return this.TryEatTemplate(this.rgxTryEatCommaRBrace); };
    ObjectModel_DatabaseParser.prototype.TryEatCommaEqualsRParen = function () { return this.TryEatTemplate(this.rgxTryEatCommaEqualsRParen); };
    ObjectModel_DatabaseParser.prototype.TryEatCommaRParen = function () { return this.TryEatTemplate(this.rgxTryEatCommaRParen); };
    ObjectModel_DatabaseParser.prototype.TryEatFieldId = function () { return this.TryEatTemplate(this.rgxTryEatFieldId); };
    ObjectModel_DatabaseParser.prototype.TryEatNumeral = function () { return this.TryEatTemplate(this.rgxTryEatNumeral); };
    ObjectModel_DatabaseParser.prototype.TryEatLBraceQuote = function () { return this.TryEatTemplate(this.rgxTryEatLBraceQuote); };
    ObjectModel_DatabaseParser.prototype.TryEatPound = function () { return this.TryEatTemplate(this.rgxTryEatPound); };
    ObjectModel_DatabaseParser.prototype.TryEatRBrace = function () { return this.TryEatTemplate(this.rgxTryEatRBrace); };
    ObjectModel_DatabaseParser.prototype.TryEatRParen = function () { return this.TryEatTemplate(this.rgxTryEatRParen); };
    ObjectModel_DatabaseParser.prototype.TryEatTemplate = function (rgx) {
        rgx.lastIndex = this.LastIndex;
        var match = rgx.exec(this.Text);
        if (!match) {
            this.LastIndex = this.Text.length;
            return undefined;
        }
        var match2 = match[2] || '';
        this.LastIndex = (match2 === ''
            ? rgx.lastIndex - 1
            : rgx.lastIndex);
        return match2;
    };
    return ObjectModel_DatabaseParser;
}());
function ObjectModel_ParseDatabase(text) {
    text = '' + (text || '');
    var parser = new ObjectModel_DatabaseParser(text);
    while (parser.Operate())
        ;
    return parser.Finish();
}

;"use strict";
var ObjectModel_ParseDatabaseError = (function () {
    function ObjectModel_ParseDatabaseError(errpos, errno) {
        this.ErrorPos = errpos;
        this.ErrorCode = errno;
        Helper.FreezeObject(this);
    }
    ObjectModel_ParseDatabaseError.ERROR_SUCCESS = 0;
    ObjectModel_ParseDatabaseError.ERROR_TYPE_ID = 1;
    ObjectModel_ParseDatabaseError.ERROR_ENTRYCMD_DELIM = 2;
    ObjectModel_ParseDatabaseError.ERROR_COMMENT_OPEN = 3;
    ObjectModel_ParseDatabaseError.ERROR_COMMENT_RBRACE = 4;
    ObjectModel_ParseDatabaseError.ERROR_PREAMBLE_POUND_RBRACE = 5;
    ObjectModel_ParseDatabaseError.ERROR_PREAMBLE_POUND_RPAREN = 6;
    ObjectModel_ParseDatabaseError.ERROR_STRING_ID = 7;
    ObjectModel_ParseDatabaseError.ERROR_STRING_EQ = 8;
    ObjectModel_ParseDatabaseError.ERROR_STRING_POUND_RBRACE = 9;
    ObjectModel_ParseDatabaseError.ERROR_STRING_POUND_RPAREN = 10;
    ObjectModel_ParseDatabaseError.ERROR_STRING_ID_DUP = 11;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_EID_FID = 12;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_EQ_RBRACE = 13;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_EQ_RPAREN = 14;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_RBRACE = 15;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_COMMA_RPAREN = 16;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_ID_MISSING = 17;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_ID_DUP = 18;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_FID_RBRACE = 19;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_FID_RPAREN = 20;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_POUND_COMMA_RBRACE = 21;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_POUND_COMMA_RPAREN = 22;
    ObjectModel_ParseDatabaseError.ERROR_ENTRY_EQ = 23;
    ObjectModel_ParseDatabaseError.ERROR_FIELD_ID_DUP = 24;
    ObjectModel_ParseDatabaseError.ERROR_STREXPR_OPERAND = 25;
    ObjectModel_ParseDatabaseError.ERROR_STREXPR_OPEN = 26;
    ObjectModel_ParseDatabaseError.ERROR_STREXPR_RBRACE = 27;
    ObjectModel_ParseDatabaseError.ErrorMessages = [
        'BibTeX.ParseDatabase: Operation completed successfullly.',
        'BibTeX.ParseDatabase: Expecting type identifier after "@".',
        'BibTeX.ParseDatabase: Expecting entry/command opening delimiter "{" or "(".',
        'BibTeX.ParseDatabase: Unclosed "@comment" command at end of string (unbalanced braces?).',
        'BibTeX.ParseDatabase: Outstanding closing brace "}" in "@comment(...)" command (unbalanced braces?).',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or "}" to close "@preamble{...".',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or ")" to close "@preamble(...".',
        'BibTeX.ParseDatabase: Expecting string identifier after "@string{" or "@string(".',
        'BibTeX.ParseDatabase: Expecting "=" after string identifier in "@string" command.',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or "}" to close "@string{...".',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or ")" to close "@string(...".',
        'BibTeX.ParseDatabase: Duplicate string identifier (the last one is kept).',
        'BibTeX.ParseDatabase: Expecting entry identifier (citation key) or field identifier after "@entry{" or "@entry(".',
        'BibTeX.ParseDatabase: Expecting "," after entry identifier (citation key) or "=" after field identifier or "}" to close "@entry{...".',
        'BibTeX.ParseDatabase: Expecting "," after entry identifier (citation key) or "=" after field identifier or ")" to close "@entry(...".',
        'BibTeX.ParseDatabase: Expecting "," or "}" to continue/close "@entry{...".',
        'BibTeX.ParseDatabase: Expecting "," or ")" to continue/close "@entry(...".',
        'BibTeX.ParseDatabase: Warning for missing entry identifier (citation key).',
        'BibTeX.ParseDatabase: Duplicate entry identifier (citation key; the first entry is available by key).',
        'BibTeX.ParseDatabase: Expecting "}" to close "@entry{..." or a field identifier to continue it.',
        'BibTeX.ParseDatabase: Expecting ")" to close "@entry(..." or a field identifier to continue it.',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or "," to end the field or "}" to close "@entry{...".',
        'BibTeX.ParseDatabase: Expecting "#" to concatenate another string or "," to end the field or ")" to close "@entry(...".',
        'BibTeX.ParseDatabase: Expecting "=" after field identifier.',
        'BibTeX.ParseDatabase: Duplicate field identifier (the first field value is kept).',
        'BibTeX.ParseDatabase: Expecting numerals as a string literal, or a string identifier for a named string, or \'{\' or \'"\' to begin a string literal. ',
        'BibTeX.ParseDatabase: Unclosed string literal delimited with {} or "" (unbalanced braces?).',
        'BibTeX.ParseDatabase: Oustanding closing brace } in ""-delimited string literal.'
    ];
    return ObjectModel_ParseDatabaseError;
}());
var ObjectModel_ParseDatabaseResult = (function () {
    function ObjectModel_ParseDatabaseResult() {
        this._Privates = Helper.NewEmptyObject();
        this.Errors = [];
        this.Preamble = ObjectModel_StringExpr.Empty;
        this.Strings = Helper.NewEmptyObject();
        this.Entries = [];
        this.ofKey = Helper.NewEmptyObject();
    }
    ObjectModel_ParseDatabaseResult.prototype.IsStandardCompliant = function () {
        for (var _i = 0, _a = this.Entries; _i < _a.length; _i++) {
            var entry = _a[_i];
            if (!entry.IsStandardCompliant()) {
                return false;
            }
        }
        return true;
    };
    ObjectModel_ParseDatabaseResult.prototype.UnresolveAll = function () {
        var strings = this.Strings;
        for (var strid in strings) {
            strings[strid].Unresolve();
        }
        for (var _i = 0, _a = this.Entries; _i < _a.length; _i++) {
            var entry = _a[_i];
            entry.Unresolve();
        }
    };
    ObjectModel_ParseDatabaseResult.MonthMacros = (function (obj) {
        obj['jan'] = Strings_ParseLiteral('1').Result;
        obj['feb'] = Strings_ParseLiteral('2').Result;
        obj['mar'] = Strings_ParseLiteral('3').Result;
        obj['apr'] = Strings_ParseLiteral('4').Result;
        obj['may'] = Strings_ParseLiteral('5').Result;
        obj['jun'] = Strings_ParseLiteral('6').Result;
        obj['jul'] = Strings_ParseLiteral('7').Result;
        obj['aug'] = Strings_ParseLiteral('8').Result;
        obj['sep'] = Strings_ParseLiteral('9').Result;
        obj['oct'] = Strings_ParseLiteral('10').Result;
        obj['nov'] = Strings_ParseLiteral('11').Result;
        obj['dec'] = Strings_ParseLiteral('12').Result;
        return obj;
    })(Helper.NewEmptyObject());
    return ObjectModel_ParseDatabaseResult;
}());

;"use strict";
var ObjectModel_PersonNameFormatParser = (function () {
    function ObjectModel_PersonNameFormatParser(text) {
        this.rgxEatVbtmOutside = /([^{}]*)([{}])/g;
        this.myVbtmBefore = '';
        this.myTarget = undefined;
        this.myInitials = undefined;
        this.myVbtmLink = undefined;
        this.myVbtmAfter = '';
        this.myComponentBad = true;
        this.myVbtmBeforeBegins = undefined;
        this.rgxEatVbtmBefore = /([^{}a-zA-Z]*)([{}]|[Ff][Ff]?[{]?|[Vv][Vv]?[{]?|[Ll][Ll]?[{]?|[Jj][Jj]?[{]?|[a-zA-Z])/g;
        this.myVbtmLinkBegins = undefined;
        this.myVbtmAfterBegins = undefined;
        this.rgxEatVbtmAfter = /[^a-zA-Z{}]*([a-zA-Z{}])/g;
        this.pfnEatRBraceCleanup = undefined;
        this.rgxEatRBrace = /[^{}]*([{}])/g;
        this.Text = text;
        this.LastIndex = 0;
        this.ErrorPos = text.length;
        this.ErrorCode = ObjectModel_PersonNameFormat.ERROR_SUCCESS;
        this.Result = new ObjectModel_PersonNameFormatBuilder();
        this.pfnNext = this.EatVbtmOutside;
    }
    ObjectModel_PersonNameFormatParser.prototype.GetStateSummary = function (len) {
        len = (len || 0) >>> 0;
        len = (len < 16 ? 16 : len > 1024 ? 1024 : len);
        var clsParser = ObjectModel_PersonNameFormatParser.prototype;
        var fnName = '[unknown]';
        for (var key in clsParser) {
            if (clsParser[key] === this.pfnNext) {
                fnName = key;
                break;
            }
        }
        var pos = this.LastIndex.toString();
        pos = Helper.RepeatString(' ', this.Text.length.toString().length - pos.length) + pos;
        var excerpt = JSON.stringify(this.Text.substr(this.LastIndex, len));
        excerpt = excerpt.substr(1, excerpt.length - 2);
        return Helper.RepeatString(' ', 21 - fnName.length) +
            fnName + ' | ' + pos + ' | ' + excerpt;
    };
    ObjectModel_PersonNameFormatParser.prototype.Operate = function () {
        return this.pfnNext();
    };
    ObjectModel_PersonNameFormatParser.prototype.Finish = function () {
        return new ObjectModel_PersonNameFormat(this.ErrorPos, this.ErrorCode, this.Result);
    };
    ObjectModel_PersonNameFormatParser.prototype.EatNothing = function () {
        return false;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatVbtmOutside = function () {
        var rgx = this.rgxEatVbtmOutside;
        rgx.lastIndex = this.LastIndex;
        var token = rgx.exec(this.Text);
        if (token === null) {
            this.Result.AddVerbatimContent(this.Text.substr(this.LastIndex));
            this.LastIndex = this.Text.length;
            this.pfnNext = this.EatNothing;
            return false;
        }
        if (token[2] === '{') {
            this.Result.AddVerbatimContent(token[1]);
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatComponent;
            return true;
        }
        this.Result.AddVerbatimContent(token[1] + '{}');
        if (!this.ErrorCode) {
            this.ErrorPos = rgx.lastIndex - 1;
            this.ErrorCode = ObjectModel_PersonNameFormat.ERROR_RBRACE;
        }
        this.LastIndex = rgx.lastIndex;
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatComponent = function () {
        this.myVbtmBefore = '';
        this.myTarget = undefined;
        this.myInitials = undefined;
        this.myVbtmLink = undefined;
        this.myVbtmAfter = '';
        this.myComponentBad = false;
        this.myVbtmBeforeBegins = this.LastIndex;
        this.pfnNext = this.EatVbtmBefore;
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatComponentCleanup = function () {
        this.pfnNext = this.EatVbtmOutside;
        if (this.myComponentBad) {
            return true;
        }
        if (this.myTarget === undefined) {
            this.Result.AddVerbatimContent(this.myVbtmBefore);
            return true;
        }
        this.Result.AddComponent(new ObjectModel_PersonNameFormatComponent(this.myVbtmBefore, this.myTarget, this.myInitials, this.myVbtmLink, this.myVbtmAfter));
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatVbtmBefore = function () {
        var rgx = this.rgxEatVbtmBefore;
        rgx.lastIndex = this.LastIndex;
        var token = rgx.exec(this.Text);
        if (token === null) {
            if (!this.ErrorCode) {
                this.ErrorPos = this.Text.length;
                this.ErrorCode =
                    ObjectModel_PersonNameFormat.ERROR_UNCLOSED_BRACE;
            }
            this.myComponentBad = true;
            this.LastIndex = this.Text.length;
            this.pfnNext = this.EatComponentCleanup;
            return true;
        }
        var stopper = token[2];
        if (stopper === '{') {
            this.LastIndex = rgx.lastIndex;
            this.pfnEatRBraceCleanup = this.EatVbtmBefore;
            this.pfnNext = this.EatRBrace;
            return true;
        }
        if (stopper === '}') {
            this.myVbtmBefore = this.Text.substr(this.myVbtmBeforeBegins, rgx.lastIndex - 1 - this.myVbtmBeforeBegins);
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatComponentCleanup;
            return true;
        }
        if (!/[FfVvLlJj]/.test(stopper[0])) {
            if (!this.ErrorCode) {
                this.ErrorPos = rgx.lastIndex - 1;
                this.ErrorCode =
                    ObjectModel_PersonNameFormat.ERROR_INVALID_CHAR;
            }
            this.myComponentBad = true;
            this.LastIndex = rgx.lastIndex;
            this.pfnEatRBraceCleanup = this.EatComponentCleanup;
            this.pfnNext = this.EatRBrace;
            return true;
        }
        this.myVbtmBefore = this.Text.substr(this.myVbtmBeforeBegins, rgx.lastIndex - stopper.length - this.myVbtmBeforeBegins);
        var tgt = stopper[0].toLowerCase();
        this.myTarget = (tgt === 'f' ? 'First'
            : tgt === 'v' ? 'von'
                : tgt === 'l' ? 'Last' : 'Jr');
        this.myInitials = ((stopper[1] || '').toLowerCase() !== tgt);
        if (stopper[stopper.length - 1] === '{') {
            this.myVbtmLinkBegins = rgx.lastIndex;
            this.LastIndex = rgx.lastIndex;
            this.pfnEatRBraceCleanup = this.EatVbtmLinkCleanup;
            this.pfnNext = this.EatRBrace;
        }
        else {
            this.myVbtmAfterBegins = rgx.lastIndex;
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatVbtmAfter;
        }
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatVbtmLinkCleanup = function () {
        this.myVbtmLink = this.Text.substr(this.myVbtmLinkBegins, this.LastIndex - 1 - this.myVbtmLinkBegins);
        this.myVbtmAfterBegins = this.LastIndex;
        this.pfnNext = this.EatVbtmAfter;
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatVbtmAfter = function () {
        var rgx = this.rgxEatVbtmAfter;
        rgx.lastIndex = this.LastIndex;
        var token = rgx.exec(this.Text);
        if (token === null) {
            if (!this.ErrorCode) {
                this.ErrorPos = this.Text.length;
                this.ErrorCode =
                    ObjectModel_PersonNameFormat.ERROR_UNCLOSED_BRACE;
            }
            this.myComponentBad = true;
            this.LastIndex = this.Text.length;
            this.pfnNext = this.EatComponentCleanup;
            return true;
        }
        var brace = token[1];
        if (brace === '}') {
            this.myVbtmAfter = this.Text.substr(this.myVbtmAfterBegins, rgx.lastIndex - 1 - this.myVbtmAfterBegins);
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatComponentCleanup;
            return true;
        }
        if (brace === '{') {
            this.pfnEatRBraceCleanup = this.EatVbtmAfter;
            this.LastIndex = rgx.lastIndex;
            this.pfnNext = this.EatRBrace;
            return true;
        }
        if (!this.ErrorCode) {
            this.ErrorPos = rgx.lastIndex - 1;
            this.ErrorCode =
                ObjectModel_PersonNameFormat.ERROR_INVALID_CHAR;
        }
        this.myComponentBad = true;
        this.LastIndex = rgx.lastIndex;
        this.pfnEatRBraceCleanup = this.EatComponentCleanup;
        this.pfnNext = this.EatRBrace;
        return true;
    };
    ObjectModel_PersonNameFormatParser.prototype.EatRBrace = function () {
        var rgx = this.rgxEatRBrace;
        rgx.lastIndex = this.LastIndex;
        var text = this.Text;
        var depth = 1;
        var token = null;
        while (depth !== 0) {
            token = rgx.exec(text);
            if (token === null) {
                if (!this.ErrorCode) {
                    this.ErrorPos = this.Text.length;
                    this.ErrorCode =
                        ObjectModel_PersonNameFormat.ERROR_UNCLOSED_BRACE;
                }
                this.LastIndex = this.Text.length;
                this.pfnNext = this.pfnEatRBraceCleanup;
                return true;
            }
            depth += (token[1] === '{' ? 1 : -1);
        }
        this.LastIndex = rgx.lastIndex;
        this.pfnNext = this.pfnEatRBraceCleanup;
        return true;
    };
    return ObjectModel_PersonNameFormatParser;
}());
function ObjectModel_ParsePersonNameFormat(fmt) {
    var parser = new ObjectModel_PersonNameFormatParser('' + (fmt || ''));
    while (parser.Operate())
        ;
    return parser.Finish();
}

;"use strict";
function ObjectModel_LaunderNameTokens(tokens, words, links) {
    var target = 0;
    var err = ObjectModel_PersonName.ERROR_SUCCESS;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (target === 0 &&
            token instanceof ObjectModel_PersonNameTokenWord) {
            words.push(token.Value);
            target = 1;
        }
        else if (target === 0 &&
            words.length === 0 &&
            token instanceof ObjectModel_PersonNameTokenLink) {
        }
        else if (target === 1 &&
            token instanceof ObjectModel_PersonNameTokenLink) {
            target = 0;
            links.push(token.Link);
        }
        else {
            err = err || ObjectModel_PersonName.ERROR_TOKEN_INTERLEAVE;
        }
    }
    if (words.length === 0) {
        err = err || ObjectModel_PersonName.ERROR_EMPTY;
    }
    else {
        while (links.length >= words.length) {
            links.pop();
        }
    }
    return err;
}
function ObjectModel_ResolveName_First_von_Last(tokens) {
    var words = [];
    var links = [];
    var errcode = ObjectModel_LaunderNameTokens(tokens, words, links);
    if (words.length === 0) {
        return new ObjectModel_PersonName(errcode
            || ObjectModel_PersonName.ERROR_EMPTY);
    }
    var firstEnds = 0;
    var lastBegins = words.length - 1;
    while (firstEnds !== lastBegins &&
        words[firstEnds].Case !== 'l') {
        ++firstEnds;
    }
    while (lastBegins !== firstEnds &&
        words[lastBegins - 1].Case !== 'l') {
        --lastBegins;
    }
    return new ObjectModel_PersonName(errcode, words.slice(0, firstEnds), links.slice(0, firstEnds - 1), words.slice(firstEnds, lastBegins), links.slice(firstEnds, lastBegins - 1), words.slice(lastBegins), links.slice(lastBegins));
}
function ObjectModel_ResolveName_von_Last_Jr_First(vonLastTokens, jrTokens, firstTokens, errfallback) {
    var vonLastWords = [];
    var vonLastLinks = [];
    var vonLastErr = ObjectModel_LaunderNameTokens(vonLastTokens, vonLastWords, vonLastLinks);
    var jrWords = [];
    var jrLinks = [];
    var jrErr = ObjectModel_LaunderNameTokens(jrTokens, jrWords, jrLinks);
    var firstWords = [];
    var firstLinks = [];
    var firstErr = ObjectModel_LaunderNameTokens(firstTokens, firstWords, firstLinks);
    var errcode = (vonLastErr === ObjectModel_PersonName.ERROR_EMPTY
        ? ObjectModel_PersonName.ERROR_LEADING_COMMA
        : vonLastErr) ||
        (jrErr === ObjectModel_PersonName.ERROR_EMPTY
            ? ObjectModel_PersonName.ERROR_SUCCESS
            : jrErr) ||
        (firstErr === ObjectModel_PersonName.ERROR_EMPTY
            ? ObjectModel_PersonName.ERROR_TRAILING_COMMA
            : firstErr) || errfallback;
    var lastBegins = (vonLastWords.length === 0
        ? 0
        : vonLastWords.length - 1);
    while (lastBegins !== 0 &&
        vonLastWords[lastBegins - 1].Case !== 'l') {
        --lastBegins;
    }
    return new ObjectModel_PersonName(errcode, firstWords, firstLinks, vonLastWords.slice(0, lastBegins), vonLastLinks.slice(0, lastBegins - 1), vonLastWords.slice(lastBegins), vonLastLinks.slice(lastBegins), jrWords, jrLinks);
}
function ObjectModel_ResolveName(tokens, parts, commas) {
    var name = (commas === 0
        ? ObjectModel_ResolveName_First_von_Last(parts[0])
        : commas === 1
            ? ObjectModel_ResolveName_von_Last_Jr_First(parts[0], parts[2], parts[1], ObjectModel_PersonName.ERROR_SUCCESS)
            : ObjectModel_ResolveName_von_Last_Jr_First(parts[0], parts[1], parts[2], commas === 2
                ? ObjectModel_PersonName.ERROR_SUCCESS
                : ObjectModel_PersonName.ERROR_TOO_MANY_COMMAS));
    name._Privates.Tokens = tokens;
    name._Privates.Parts = parts;
    name._Privates.Commas = commas;
    Helper.FreezeDescendants(name._Privates);
    Helper.FreezeObject(name._Privates);
    return name;
}
function ObjectModel_ParsePersonNames(names) {
    if (!(names instanceof Strings_Literal)
        || names.Pieces.length === 0) {
        return [];
    }
    if (names.Pieces.length === 1) {
        var onlyPiece = names.Pieces[0];
        if (onlyPiece instanceof Strings_BasicPiece
            && /^[ \t\v\f\r\n]*$/.test(onlyPiece.Raw)) {
            return [];
        }
    }
    var tokens = [];
    var parts = [[], [], []];
    var commas = 0;
    var result = [];
    for (var _i = 0, _a = ObjectModel_GetPersonNameTokens(names); _i < _a.length; _i++) {
        var token = _a[_i];
        if (token instanceof ObjectModel_PersonNameTokenComma) {
            tokens.push(token);
            ++commas;
        }
        else if (token instanceof ObjectModel_PersonNameTokenLink
            || token instanceof ObjectModel_PersonNameTokenWord) {
            tokens.push(token);
            parts[commas < 3 ? commas : 2].push(token);
        }
        else {
            var name_1 = ObjectModel_ResolveName(tokens, parts, commas);
            result.push(name_1);
            tokens = [];
            parts = [[], [], []];
            commas = 0;
        }
    }
    var name = ObjectModel_ResolveName(tokens, parts, commas);
    result.push(name);
    return result;
}

;"use strict";
function ObjectModel_LaunderNameWordArray(words) {
    var result = [];
    if (!(words instanceof Array)) {
        return Helper.FreezeObject(result);
    }
    for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
        var item = words_1[_i];
        if (item instanceof Strings_Literal) {
            result.push(item);
        }
    }
    return Helper.FreezeObject(result);
}
function ObjectModel_LaunderNameLinkArray(words, links) {
    var result = [];
    var maxcount = words.length - 1;
    if (maxcount < 1) {
        return Helper.FreezeObject(result);
    }
    var len = (links instanceof Array
        ? links.length : 0);
    var i = 0;
    for (; i !== maxcount && i !== len; ++i) {
        var item = '' + (links[i] + '');
        result.push(item === '-' ? '-' : '~');
    }
    for (; i !== maxcount; ++i) {
        result.push('~');
    }
    return Helper.FreezeObject(result);
}
var ObjectModel_PersonName = (function () {
    function ObjectModel_PersonName(errcode, firstWords, firstLinks, vonWords, vonLinks, lastWords, lastLinks, jrWords, jrLinks) {
        this._Privates = Helper.NewEmptyObject();
        this.ErrorCode =
            errcode =
                Number(errcode);
        if (!(errcode >= 0 && errcode < 7)) {
            this.ErrorCode = ObjectModel_PersonName.ERROR_UNKNOWN;
        }
        else {
            this.ErrorCode >>= 0;
        }
        this.First = ObjectModel_LaunderNameWordArray(firstWords);
        this.FirstLinks = ObjectModel_LaunderNameLinkArray(this.First, firstLinks);
        this.von = ObjectModel_LaunderNameWordArray(vonWords);
        this.vonLinks = ObjectModel_LaunderNameLinkArray(this.von, vonLinks);
        this.Last = ObjectModel_LaunderNameWordArray(lastWords);
        this.LastLinks = ObjectModel_LaunderNameLinkArray(this.Last, lastLinks);
        this.Jr = ObjectModel_LaunderNameWordArray(jrWords);
        this.JrLinks = ObjectModel_LaunderNameLinkArray(this.Jr, jrLinks);
        Helper.FreezeObject(this);
    }
    ObjectModel_PersonName.prototype.Format = function (fmt) {
        return ObjectModel_ParsePersonNameFormat(fmt).Format(this);
    };
    ObjectModel_PersonName.prototype.IsEtal = function () {
        if (this.First.length !== 0
            || this.von.length !== 0
            || this.Jr.length !== 0
            || this.Last.length !== 1) {
            return false;
        }
        var pcs = this.Last[0].Pieces;
        if (pcs.length !== 1) {
            return false;
        }
        var piece = pcs[0];
        return (piece instanceof Strings_BasicPiece
            && piece.Value === 'others');
    };
    ObjectModel_PersonName.ERROR_SUCCESS = 0;
    ObjectModel_PersonName.ERROR_EMPTY = 1;
    ObjectModel_PersonName.ERROR_TOO_MANY_COMMAS = 2;
    ObjectModel_PersonName.ERROR_LEADING_COMMA = 3;
    ObjectModel_PersonName.ERROR_TRAILING_COMMA = 4;
    ObjectModel_PersonName.ERROR_TOKEN_INTERLEAVE = 5;
    ObjectModel_PersonName.ERROR_UNKNOWN = 6;
    ObjectModel_PersonName.ErrorMessages = [
        'BibTeX.ParsePersonName: Operation completed successfully.',
        'BibTeX.ParsePersonName: The name is empty.',
        'BibTeX.ParsePersonName: There are too many commas (use "and" to separate names).',
        'BibTeX.ParsePersonName: There is a trailing comma.',
        'BibTeX.ParsePersonName: There is a leading comma.',
        'BibTeX.ParsePersonName: The word/link tokens should interleave (potential bug).'
    ];
    return ObjectModel_PersonName;
}());

;"use strict";
function ObjectModel_FormatPersonNameWords(words, links) {
    var results = [];
    var count = links.length;
    for (var i = 0; i !== count; ++i) {
        results.push(words[i].Raw);
        results.push(links[i]);
    }
    results.push(words[count].Raw);
    return results.join('');
}
function ObjectModel_FormatPersonNameInitials(words, links) {
    var results = [];
    var count = links.length;
    for (var i = 0; i !== count; ++i) {
        var lnk = links[i];
        results.push(Strings_TextPrefixRaw(words[i], 1));
        results.push('.', lnk);
    }
    results.push(Strings_TextPrefixRaw(words[count], 1));
    return results.join('');
}
function ObjectModel_FormatPersonNameWordsWithLink(words, link) {
    var results = [];
    for (var _i = 0, words_1 = words; _i < words_1.length; _i++) {
        var word = words_1[_i];
        results.push(word.Raw);
    }
    return results.join(link);
}
function ObjectModel_FormatPersonNameInitialsWithLink(words, link) {
    var results = [];
    for (var _i = 0, words_2 = words; _i < words_2.length; _i++) {
        var word = words_2[_i];
        results.push(Strings_TextPrefixRaw(word, 1));
    }
    return results.join(link);
}
var ObjectModel_PersonNameFormatComponent = (function () {
    function ObjectModel_PersonNameFormatComponent(verbatimBefore, target, onlyInitials, verbatimLink, verbatimAfter) {
        this.VerbatimBefore = '' + (verbatimBefore || '');
        this.Taret = (target === 'First'
            || target === 'von'
            || target === 'Jr'
            ? target : 'Last');
        this.OnlyInitials = !!onlyInitials;
        this.VerbatimLink = (verbatimLink !== undefined
            ? '' + (verbatimLink || '')
            : undefined);
        this.VerbatimAfter = '' + (verbatimAfter || '');
        Helper.FreezeObject(this);
    }
    ObjectModel_PersonNameFormatComponent.prototype.Format = function (name) {
        if (!(name instanceof ObjectModel_PersonName)) {
            return '';
        }
        var words = name[this.Taret];
        if (words.length === 0) {
            return '';
        }
        var initials = this.OnlyInitials;
        var vblnk = this.VerbatimLink;
        var links = name[this.Taret
            + 'Links'];
        var rendered = (initials
            ? vblnk === undefined
                ? ObjectModel_FormatPersonNameInitials(words, links)
                : ObjectModel_FormatPersonNameInitialsWithLink(words, vblnk)
            : vblnk === undefined
                ? ObjectModel_FormatPersonNameWords(words, links)
                : ObjectModel_FormatPersonNameWordsWithLink(words, vblnk));
        return this.VerbatimBefore + rendered + this.VerbatimAfter;
    };
    return ObjectModel_PersonNameFormatComponent;
}());
var ObjectModel_PersonNameFormatBuilder = (function () {
    function ObjectModel_PersonNameFormatBuilder() {
        this.Components = [];
        this.VerbatimPieces = [];
    }
    ObjectModel_PersonNameFormatBuilder.prototype.PushLeftover = function () {
        if (this.VerbatimPieces.length === 0) {
            return false;
        }
        this.Components.push(this.VerbatimPieces.join(''));
        this.VerbatimPieces = [];
        return true;
    };
    ObjectModel_PersonNameFormatBuilder.prototype.AddVerbatimContent = function (value) {
        if (value.length !== 0) {
            this.VerbatimPieces.push(value);
        }
    };
    ObjectModel_PersonNameFormatBuilder.prototype.AddComponent = function (cmpnt) {
        this.PushLeftover();
        this.Components.push(cmpnt);
    };
    return ObjectModel_PersonNameFormatBuilder;
}());
function ObjectModel_LaunderPersonNameFormatComponentArray(array) {
    var result = new ObjectModel_PersonNameFormatBuilder();
    if (!(array instanceof Array) || array.length === 0) {
        return result;
    }
    for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
        var item = array_1[_i];
        if (item instanceof ObjectModel_PersonNameFormatComponent) {
            result.AddComponent(item);
        }
        else {
            result.AddVerbatimContent('' + (item || ''));
        }
    }
    return result;
}
var ObjectModel_PersonNameFormat = (function () {
    function ObjectModel_PersonNameFormat(errpos, errcode, components) {
        this.ErrorPos = ((errpos || 0) >>> 0);
        errcode =
            Number(errcode || 0);
        if (!(errcode >= 0 && errcode < 5)) {
            errcode = ObjectModel_PersonNameFormat.ERROR_UNKNOWN;
        }
        this.ErrorCode = errcode;
        if (!(components instanceof ObjectModel_PersonNameFormatBuilder)) {
            components =
                ObjectModel_LaunderPersonNameFormatComponentArray(components);
        }
        components.PushLeftover();
        this.Components = components.Components;
        Helper.FreezeObject(this);
    }
    ObjectModel_PersonNameFormat.prototype.Format = function (name) {
        var result = [];
        for (var _i = 0, _a = this.Components; _i < _a.length; _i++) {
            var component = _a[_i];
            if (component instanceof ObjectModel_PersonNameFormatComponent) {
                result.push(component.Format(name));
            }
            else {
                result.push(component);
            }
        }
        return result.join('').replace(/(\\+relax)?(~+)/g, function (_, relax, tie) {
            if (relax) {
                if (relax.length % 2 === 0 && tie.length === 1) {
                    return relax + ' ';
                }
                return relax + '~';
            }
            return '~';
        });
    };
    ObjectModel_PersonNameFormat.ERROR_SUCCESS = 0;
    ObjectModel_PersonNameFormat.ERROR_UNCLOSED_BRACE = 1;
    ObjectModel_PersonNameFormat.ERROR_RBRACE = 2;
    ObjectModel_PersonNameFormat.ERROR_INVALID_CHAR = 3;
    ObjectModel_PersonNameFormat.ERROR_UNKNOWN = 4;
    ObjectModel_PersonNameFormat.ErrorMessages = [
        'BibTeX.ParsePersonNameFormat: Operation completed successfully.',
        'BibTeX.ParsePersonNameFormat: Unclosed brace.',
        'BibTeX.ParsePersonNameFormat: Unexpected closing brace.',
        'BibTeX.ParsePersonNameFormat: Invalid character in component specifier (wrap inside braces?).',
        'BibTeX.ParsePersonNameFormat: Unknown error.'
    ];
    return ObjectModel_PersonNameFormat;
}());

;"use strict";
var ObjectModel_PersonNameTokenComma = (function () {
    function ObjectModel_PersonNameTokenComma() {
        Helper.FreezeObject(this);
    }
    ObjectModel_PersonNameTokenComma.Instance = new ObjectModel_PersonNameTokenComma();
    return ObjectModel_PersonNameTokenComma;
}());
var ObjectModel_PersonNameTokenAnd = (function () {
    function ObjectModel_PersonNameTokenAnd() {
        Helper.FreezeObject(this);
    }
    ObjectModel_PersonNameTokenAnd.Instance = new ObjectModel_PersonNameTokenAnd();
    return ObjectModel_PersonNameTokenAnd;
}());
var ObjectModel_PersonNameTokenLink = (function () {
    function ObjectModel_PersonNameTokenLink(link, verbatim) {
        this.Link = link;
        this.Verbatim = verbatim;
        Helper.FreezeObject(this);
    }
    return ObjectModel_PersonNameTokenLink;
}());
var ObjectModel_PersonNameTokenWord = (function () {
    function ObjectModel_PersonNameTokenWord(value) {
        this.Value = value;
        Helper.FreezeObject(this);
    }
    return ObjectModel_PersonNameTokenWord;
}());
function ObjectModel_GetPersonNameTokens(names) {
    var results = [];
    var builder = new Strings_LiteralBuilder();
    var rgxWhitespace = /[ \t\v\f\r\n]/;
    var rgx = /(,)|([ \t\v\f\r\n~-])[ \t\v\f\r\n~-]*|[^, \t\v\f\r\n~-]+/g;
    var sawWhitespace = false;
    var wordPending = false;
    for (var _i = 0, _a = names.Pieces; _i < _a.length; _i++) {
        var piece = _a[_i];
        if (piece instanceof Strings_SpCharPiece) {
            sawWhitespace = false;
            wordPending = true;
            builder.AddSpCharPiece(piece);
            continue;
        }
        if (piece instanceof Strings_BracedPiece) {
            sawWhitespace = false;
            wordPending = true;
            builder.AddBracedPiece(piece);
            continue;
        }
        var text = piece.Value;
        var token = null;
        while (token = rgx.exec(text)) {
            if (token[1] !== undefined) {
                sawWhitespace = false;
                if (wordPending) {
                    results.push(new ObjectModel_PersonNameTokenWord(new Strings_Literal(builder)));
                    builder = new Strings_LiteralBuilder();
                    wordPending = false;
                }
                results.push(ObjectModel_PersonNameTokenComma.Instance);
                continue;
            }
            var link = token[2];
            if (link !== undefined) {
                var verbatim = token[0];
                sawWhitespace =
                    rgxWhitespace.test(verbatim[verbatim.length - 1]);
                if (wordPending) {
                    results.push(new ObjectModel_PersonNameTokenWord(new Strings_Literal(builder)));
                    builder = new Strings_LiteralBuilder();
                    wordPending = false;
                }
                results.push(new ObjectModel_PersonNameTokenLink(link === '-' ? '-' : '~', verbatim));
                continue;
            }
            var word = token[0];
            if (word === 'and'
                && sawWhitespace
                && rgxWhitespace.test(text[rgx.lastIndex] || 'x')) {
                results.push(ObjectModel_PersonNameTokenAnd.Instance);
                continue;
            }
            sawWhitespace = false;
            wordPending = true;
            builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(word)));
        }
    }
    if (wordPending) {
        results.push(new ObjectModel_PersonNameTokenWord(new Strings_Literal(builder)));
    }
    return results;
}

;"use strict";
var ObjectModel_StringExprBuilder = (function () {
    function ObjectModel_StringExprBuilder() {
        this.Summands = [];
        Helper.FreezeObject(this);
    }
    ObjectModel_StringExprBuilder.prototype.AddSummand = function (summand) {
        if (summand instanceof Strings_Literal
            || summand instanceof ObjectModel_StringRef) {
            this.Summands.push(summand);
            return true;
        }
        return false;
    };
    return ObjectModel_StringExprBuilder;
}());
var ObjectModel_StringExprPrivates = (function () {
    function ObjectModel_StringExprPrivates(owner) {
        this.Owner = owner;
        this.Resolved = undefined;
        this.Resolving = false;
    }
    ObjectModel_StringExprPrivates.prototype.Unresolve = function () {
        if (this.Resolving) {
            return false;
        }
        this.Resolved = undefined;
        return true;
    };
    ObjectModel_StringExprPrivates.prototype.Resolve = function (macros, refresh) {
        if (this.Resolving) {
            return Strings_Literal.Empty;
        }
        if (refresh || !this.Resolved) {
            try {
                this.Resolving = true;
                this.Resolved = Strings_Literal.Empty;
                var pieces = [];
                for (var _i = 0, _a = this.Owner.Summands; _i < _a.length; _i++) {
                    var summand = _a[_i];
                    pieces.push(summand instanceof Strings_Literal
                        ? summand
                        : summand.Resolve(macros, refresh));
                }
                this.Resolved = Strings_Literal.Concat(pieces);
            }
            finally {
                this.Resolving = false;
            }
        }
        return this.Resolved;
    };
    return ObjectModel_StringExprPrivates;
}());
function ObjectModel_LaunderSummands(summands) {
    var result = new ObjectModel_StringExprBuilder();
    if (!(summands instanceof Array)
        || summands.length === 0) {
        return result;
    }
    for (var _i = 0, summands_1 = summands; _i < summands_1.length; _i++) {
        var summand = summands_1[_i];
        result.AddSummand(summand);
    }
    return result;
}
var ObjectModel_StringExpr = (function () {
    function ObjectModel_StringExpr(summands) {
        if (!(summands instanceof ObjectModel_StringExprBuilder)) {
            summands = ObjectModel_LaunderSummands(summands);
        }
        this._MutablePrivates = new ObjectModel_StringExprPrivates(this);
        summands = summands.Summands;
        this.Summands = summands;
        Helper.FreezeObject(summands);
        Helper.FreezeObject(this);
    }
    ObjectModel_StringExpr.prototype.Unresolve = function () {
        return this._MutablePrivates.Unresolve();
    };
    ObjectModel_StringExpr.prototype.Resolve = function (macros, refresh) {
        return this._MutablePrivates.Resolve(macros, refresh);
    };
    ObjectModel_StringExpr.Concat = function (strexprs) {
        if (!(strexprs instanceof Array)
            || strexprs.length === 0) {
            return ObjectModel_StringExpr.Empty;
        }
        if (strexprs.length === 1) {
            var theResult = strexprs[0];
            return (theResult instanceof ObjectModel_StringExpr
                ? theResult
                : ObjectModel_StringExpr.Empty);
        }
        var builder = new ObjectModel_StringExprBuilder();
        for (var _i = 0, strexprs_1 = strexprs; _i < strexprs_1.length; _i++) {
            var strexpr = strexprs_1[_i];
            if (strexpr instanceof ObjectModel_StringExpr) {
                for (var _a = 0, _b = strexpr.Summands; _a < _b.length; _a++) {
                    var summand = _b[_a];
                    builder.AddSummand(summand);
                }
            }
        }
        return new ObjectModel_StringExpr(builder);
    };
    ObjectModel_StringExpr.Empty = new ObjectModel_StringExpr();
    return ObjectModel_StringExpr;
}());

;"use strict";
var ObjectModel_StringRefPrivates = (function () {
    function ObjectModel_StringRefPrivates(owner) {
        this.Owner = owner;
        this.Resolved = undefined;
        this.Resolving = false;
    }
    ObjectModel_StringRefPrivates.prototype.Unresolve = function () {
        if (this.Resolving) {
            return false;
        }
        this.Resolved = undefined;
        return true;
    };
    ObjectModel_StringRefPrivates.prototype.Resolve = function (macros, refresh) {
        if (this.Resolving) {
            return Strings_Literal.Empty;
        }
        if (refresh || !this.Resolved) {
            try {
                this.Resolving = true;
                this.Resolved = Strings_Literal.Empty;
                var referee = this.Owner.Referee;
                var stringReferee = this.Owner.Dictionary[referee];
                if (stringReferee instanceof ObjectModel_StringExpr) {
                    this.Resolved = stringReferee.Resolve(macros, refresh);
                }
                if (macros) {
                    var macroReferee = macros[referee];
                    if (macroReferee instanceof Strings_Literal) {
                        this.Resolved = macroReferee;
                    }
                }
            }
            finally {
                this.Resolving = false;
            }
        }
        return this.Resolved;
    };
    return ObjectModel_StringRefPrivates;
}());
var ObjectModel_StringRef = (function () {
    function ObjectModel_StringRef(id, dict) {
        this._MutablePrivates = new ObjectModel_StringRefPrivates(this);
        this.Referee = ('' + (id || '')).toLowerCase();
        this.Dictionary = dict || Helper.EmptyObject;
        Helper.FreezeObject(this);
    }
    ObjectModel_StringRef.prototype.Unresolve = function () {
        return this._MutablePrivates.Unresolve();
    };
    ObjectModel_StringRef.prototype.Resolve = function (macros, refresh) {
        return this._MutablePrivates.Resolve(macros, refresh);
    };
    return ObjectModel_StringRef;
}());

;"use strict";
ExportBibTeX.ObjectModel = (function (ns) {
    ns.StringRef = ObjectModel_StringRef;
    ns.StringExpr = ObjectModel_StringExpr;
    ns.Entry = ObjectModel_Entry;
    ns.EntryData = ObjectModel_EntryData;
    ns.ParseDatabaseResult = ObjectModel_ParseDatabaseResult;
    ns.ParseDatabaseError = ObjectModel_ParseDatabaseError;
    ns.PersonName = ObjectModel_PersonName;
    ns.PersonNameFormatComponent = ObjectModel_PersonNameFormatComponent;
    ns.PersonNameFormat = ObjectModel_PersonNameFormat;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX._Privates.ObjectModel = (function (ns) {
    ns.StringRefPrivates = ObjectModel_StringRefPrivates;
    ns.StringRef = ObjectModel_StringRef;
    ns.StringExprPrivates = ObjectModel_StringExprPrivates;
    ns.StringExprBuilder = ObjectModel_StringExprBuilder;
    ns.LaunderSummands = ObjectModel_LaunderSummands;
    ns.StringExpr = ObjectModel_StringExpr;
    ns.RequiredFieldsCNF = ObjectModel_RequiredFieldsCNF;
    ns.Entry = ObjectModel_Entry;
    ns.EntryData = ObjectModel_EntryData;
    ns.ParseDatabaseResult = ObjectModel_ParseDatabaseResult;
    ns.ParseDatabaseError = ObjectModel_ParseDatabaseError;
    ns.DatabaseParser = ObjectModel_DatabaseParser;
    ns.ParseDatabase = ObjectModel_ParseDatabase;
    ns.LaunderNameWordArray = ObjectModel_LaunderNameWordArray;
    ns.LaunderNameLinkArray = ObjectModel_LaunderNameLinkArray;
    ns.PersonName = ObjectModel_PersonName;
    ns.PersonNameTokenComma = ObjectModel_PersonNameTokenComma;
    ns.PersonNameTokenAnd = ObjectModel_PersonNameTokenAnd;
    ns.PersonNameTokenLink = ObjectModel_PersonNameTokenLink;
    ns.PersonNameTokenWord = ObjectModel_PersonNameTokenWord;
    ns.GetPersonNameTokens = ObjectModel_GetPersonNameTokens;
    ns.LaunderNameTokens = ObjectModel_LaunderNameTokens;
    ns.ResolveName_First_von_Last = ObjectModel_ResolveName_First_von_Last;
    ns.ResolveName_von_Last_Jr_First = ObjectModel_ResolveName_von_Last_Jr_First;
    ns.ResolveName = ObjectModel_ResolveName;
    ns.ParsePersonNames = ObjectModel_ParsePersonNames;
    ns.FormatPersonNameWords =
        ObjectModel_FormatPersonNameWords;
    ns.FormatPersonNameInitials =
        ObjectModel_FormatPersonNameInitials;
    ns.FormatPersonNameWordsWithLink =
        ObjectModel_FormatPersonNameWordsWithLink;
    ns.FormatPersonNameInitialsWithLink =
        ObjectModel_FormatPersonNameInitialsWithLink;
    ns.PersonNameFormatComponent = ObjectModel_PersonNameFormatComponent;
    ns.LaunderPersonNameFormatComponentArray =
        ObjectModel_LaunderPersonNameFormatComponentArray;
    ns.PersonNameFormatBuilder = ObjectModel_PersonNameFormatBuilder;
    ns.PersonNameFormat = ObjectModel_PersonNameFormat;
    ns.PersonNameFormatParser = ObjectModel_PersonNameFormatParser;
    ns.ParsePersonNameFormat = ObjectModel_ParsePersonNameFormat;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX.ParseDatabase = ObjectModel_ParseDatabase;
ExportBibTeX.ParsePersonNames = ObjectModel_ParsePersonNames;
ExportBibTeX.ParsePersonNameFormat = ObjectModel_ParsePersonNameFormat;

/* ObjectModel @@ */

/* @@ TeX */
"use strict";
var TeX_SimpleHandler = (function () {
    function TeX_SimpleHandler(text) {
        this.Text = text;
    }
    TeX_SimpleHandler.prototype.Render = function () {
        var rgx = /\\([a-zA-Z]+\*?)[ \t\v\f\r\n]*|\\([^a-zA-Z])|([{])|([}])|([$][$])|([$])|[^\\{}$]+/g;
        var token = null;
        var text = this.Text.replace(/\\([a-zA-Z]+\*?)|\\([^a-zA-Z])|%[^\r\n]*(\r\n|\r|\n|$)|[^\\%]+/g, function (match, _csname1, _csname2, comment) {
            return comment === undefined ? match : '';
        });
        while (token = rgx.exec(text)) {
            var csname = token[1] || token[2];
            if (csname !== undefined) {
                this.EatControlSeq(csname, token[0]);
            }
            else if (token[3] !== undefined) {
                this.EatGroupOpen();
            }
            else if (token[4] !== undefined) {
                this.EatGroupClose();
            }
            else if (token[5] !== undefined) {
                this.EatDisplayMathSwitcher();
            }
            else if (token[6] !== undefined) {
                this.EatInlineMathSwitcher();
            }
            else {
                this.EatText(token[0]);
            }
        }
        return this.Finish();
    };
    return TeX_SimpleHandler;
}());

;"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TeX_SimpleRenderer_StackFrame = (function () {
    function TeX_SimpleRenderer_StackFrame() {
        this.Char1 = [];
        this.Char2 = [];
        Helper.FreezeObject(this);
    }
    TeX_SimpleRenderer_StackFrame.prototype.Append = function (char1, char2) {
        this.Char1.push(char1);
        this.Char2.push(char2);
    };
    TeX_SimpleRenderer_StackFrame.prototype.StringConcatInto = function (target) {
        var char1 = this.Char1;
        var char2 = this.Char2;
        while (char1.length < char2.length) {
            char1.push('');
        }
        while (char1.length > char2.length) {
            char2.push('');
        }
        var len = char1.length;
        if (len === 0) {
            target.Append('', '');
            return;
        }
        var result = [char2[0]];
        for (var i = 1; i !== len; ++i) {
            result.push(char1[i] || '');
            result.push(char2[i] || '');
        }
        target.Append(char1[0], result.join(''));
    };
    return TeX_SimpleRenderer_StackFrame;
}());
var TeX_SimpleRendererPrivates = (function (_super) {
    __extends(TeX_SimpleRendererPrivates, _super);
    function TeX_SimpleRendererPrivates(owner, text) {
        var _this = _super.call(this, text) || this;
        _this.owner = owner;
        _this.csnames = [];
        _this.argcounts = [];
        _this.groups = [];
        _this.maths = [];
        _this.mathContent = undefined;
        _this.rawMath = undefined;
        _this.PushCtrlSeq('@all', -1);
        return _this;
    }
    TeX_SimpleRendererPrivates.prototype.PushCtrlSeq = function (csname, argcount) {
        this.csnames.push(csname);
        this.argcounts.push(argcount);
        this.groups.push(new TeX_SimpleRenderer_StackFrame());
    };
    TeX_SimpleRendererPrivates.prototype.CompleteCtrlSeqs = function () {
        while (this.TryComplete1CtrlSeq())
            ;
    };
    TeX_SimpleRendererPrivates.prototype.TryComplete1CtrlSeq = function () {
        var acs = this.argcounts;
        if (acs.length === 0) {
            return false;
        }
        var top = acs.length - 1;
        var grps = this.groups;
        if (acs[top] === grps[top].Char1.length) {
            var csns = this.csnames;
            this.owner.RenderCtrlSeq(csns[top], grps[top], grps[top - 1]);
            csns.pop();
            acs.pop();
            grps.pop();
            return true;
        }
        return false;
    };
    TeX_SimpleRendererPrivates.prototype.OpenGroup = function (raw) {
        if (this.mathContent !== undefined) {
            this.maths.push('@group');
            this.mathContent += raw;
            this.rawMath += raw;
            return;
        }
        this.PushCtrlSeq('@group', -1);
    };
    TeX_SimpleRendererPrivates.prototype.CloseOutsideMathUntil = function (target) {
        var csns = this.csnames;
        var acs = this.argcounts;
        var grps = this.groups;
        for (var top_1 = csns.length - 1; top_1 !== 0 && csns[top_1] !== target; top_1 = csns.length - 1) {
            var grp = grps[top_1];
            var ac = acs[top_1];
            if (ac !== -1) {
                while (grp.Char1.length < ac) {
                    grp.Append(null, null);
                }
                while (grp.Char1.length > ac) {
                    grp.Char1.pop();
                    grp.Char2.pop();
                }
            }
            else {
                switch (csns[top_1]) {
                    case '@group':
                        this.owner.RenderGroup(grps[top_1], grps[top_1 - 1]);
                        break;
                    case '@virtual':
                        this.owner.RenderVirtGroup(grps[top_1], grps[top_1 - 1]);
                        break;
                }
                csns.pop();
                acs.pop();
                grps.pop();
            }
            this.CompleteCtrlSeqs();
        }
        return csns.length - 1;
    };
    TeX_SimpleRendererPrivates.prototype.CloseGroup = function (raw) {
        if (this.mathContent !== undefined) {
            var ms = this.maths;
            if (ms[ms.length - 1] === '@group') {
                ms.pop();
            }
            this.mathContent += raw;
            this.rawMath += raw;
            return;
        }
        var csns = this.csnames;
        var acs = this.argcounts;
        var grps = this.groups;
        var top = this.CloseOutsideMathUntil('@group');
        if (csns[top] === '@group') {
            this.owner.RenderGroup(grps[top], grps[top - 1]);
            csns.pop();
            acs.pop();
            grps.pop();
            this.CompleteCtrlSeqs();
        }
    };
    TeX_SimpleRendererPrivates.prototype.OpenMathInline = function (raw) {
        if (this.mathContent !== undefined) {
            this.mathContent += raw;
            this.rawMath += raw;
        }
        else {
            this.mathContent = '';
            this.rawMath = raw;
        }
        this.maths.push('@inline');
    };
    TeX_SimpleRendererPrivates.prototype.CloseMathInline = function (raw) {
        this.mathContent = this.mathContent || '';
        this.rawMath = (this.rawMath || '') + raw;
        var ms = this.maths;
        while (ms.length !== 0) {
            var popped = ms.pop();
            if (popped === '@inline') {
                break;
            }
        }
        if (ms.length !== 0) {
            this.mathContent += raw;
            return;
        }
        var grps = this.groups;
        this.owner.RenderMathInline(this.mathContent, this.rawMath, grps[grps.length - 1]);
        this.mathContent = undefined;
        this.rawMath = undefined;
        this.CompleteCtrlSeqs();
    };
    TeX_SimpleRendererPrivates.prototype.SwitchMathInline = function (raw) {
        if (this.maths[this.maths.length - 1] === '@inline') {
            this.CloseMathInline(raw);
        }
        else {
            this.OpenMathInline(raw);
        }
    };
    TeX_SimpleRendererPrivates.prototype.OpenMathDisplay = function (raw) {
        if (this.mathContent !== undefined) {
            this.mathContent += raw;
            this.rawMath += raw;
        }
        else {
            this.mathContent = '';
            this.rawMath = raw;
        }
        this.maths.push('@display');
    };
    TeX_SimpleRendererPrivates.prototype.CloseMathDisplay = function (raw) {
        this.mathContent = this.mathContent || '';
        this.rawMath = (this.rawMath || '') + raw;
        var ms = this.maths;
        while (ms.length !== 0) {
            var popped = ms.pop();
            if (popped === '@display') {
                break;
            }
        }
        if (ms.length !== 0) {
            this.mathContent += raw;
            return;
        }
        var grps = this.groups;
        this.owner.RenderMathDisplay(this.mathContent, this.rawMath, grps[grps.length - 1]);
        this.mathContent = undefined;
        this.rawMath = undefined;
        this.CompleteCtrlSeqs();
    };
    TeX_SimpleRendererPrivates.prototype.SwitchMathDisplay = function (raw) {
        if (this.maths[this.maths.length - 1] === '@display') {
            this.CloseMathDisplay(raw);
        }
        else {
            this.OpenMathDisplay(raw);
        }
    };
    TeX_SimpleRendererPrivates.prototype.EatControlSeq = function (csname, raw) {
        if (this.mathContent !== undefined) {
            switch (this.owner.CtrlSeqTypeInMath(csname)) {
                case -2:
                    this.OpenGroup(raw);
                    return;
                case -3:
                    this.CloseGroup(raw);
                    return;
                case -4:
                    this.OpenMathInline(raw);
                    return;
                case -5:
                    this.CloseMathInline(raw);
                    return;
                case -6:
                    this.SwitchMathInline(raw);
                    return;
                case -7:
                    this.OpenMathDisplay(raw);
                    return;
                case -8:
                    this.CloseMathDisplay(raw);
                    return;
                case -9:
                    this.SwitchMathDisplay(raw);
                    return;
                default:
                    this.mathContent += raw;
                    this.rawMath += raw;
                    return;
            }
        }
        var cst = this.owner.CtrlSeqType(csname, raw, this.groups[this.groups.length - 1]);
        if (cst >= 0) {
            this.PushCtrlSeq(csname, cst >>> 0);
            this.CompleteCtrlSeqs();
            return;
        }
        switch (cst) {
            case -1:
                this.PushCtrlSeq(csname, 1);
                this.PushCtrlSeq('@virtual', -1);
                return;
            case -2:
                this.OpenGroup(raw);
                return;
            case -3:
                this.CloseGroup(raw);
                return;
            case -4:
                this.OpenMathInline(raw);
                return;
            case -5:
                this.CloseMathInline(raw);
                return;
            case -6:
                this.SwitchMathInline(raw);
                return;
            case -7:
                this.OpenMathDisplay(raw);
                return;
            case -8:
                this.CloseMathDisplay(raw);
                return;
            case -9:
                this.SwitchMathDisplay(raw);
                return;
            default:
                this.CompleteCtrlSeqs();
                return;
        }
    };
    TeX_SimpleRendererPrivates.prototype.EatGroupOpen = function () {
        this.OpenGroup('{');
    };
    TeX_SimpleRendererPrivates.prototype.EatGroupClose = function () {
        this.CloseGroup('}');
    };
    TeX_SimpleRendererPrivates.prototype.EatDisplayMathSwitcher = function () {
        this.SwitchMathDisplay('$$');
    };
    TeX_SimpleRendererPrivates.prototype.EatInlineMathSwitcher = function () {
        this.SwitchMathInline('$');
    };
    TeX_SimpleRendererPrivates.prototype.EatText = function (text) {
        if (this.mathContent !== undefined) {
            this.mathContent += text;
            this.rawMath += text;
            return;
        }
        while (text.length !== 0) {
            var top_2 = this.csnames.length - 1;
            var ac = this.argcounts[top_2];
            var grp = this.groups[top_2];
            if (grp.Char1.length < ac) {
                this.owner.RenderText(text.substr(0, 1), grp);
                this.CompleteCtrlSeqs();
                text = text.substr(1);
            }
            else {
                this.owner.RenderText(text, grp);
                this.CompleteCtrlSeqs();
                text = '';
            }
        }
    };
    TeX_SimpleRendererPrivates.prototype.Finish = function () {
        if (this.mathContent !== undefined) {
            var ms = this.maths;
            if (ms[0] === '@display') {
                this.owner.RenderMathDisplay(this.mathContent, this.rawMath, this.groups[this.groups.length - 1]);
            }
            else {
                this.owner.RenderMathInline(this.mathContent, this.rawMath, this.groups[this.groups.length - 1]);
            }
            while (ms.length !== 0) {
                ms.pop();
            }
            this.mathContent = undefined;
            this.rawMath = undefined;
        }
        return this.owner.RenderAll(this.groups[this.CloseOutsideMathUntil('@all')]);
    };
    return TeX_SimpleRendererPrivates;
}(TeX_SimpleHandler));
var TeX_SimpleRenderer = (function () {
    function TeX_SimpleRenderer(text) {
        text = '' + (text || '');
        this._MutablePrivates = new TeX_SimpleRendererPrivates(this, text);
    }
    TeX_SimpleRenderer.prototype.Render = function () {
        return this._MutablePrivates.Render();
    };
    TeX_SimpleRenderer.CtrlSeqType = function (csname) {
        if (TeX_SimpleRenderer.CtrlSeq2Arg.indexOf(csname) >= 0) {
            return 2;
        }
        if (TeX_SimpleRenderer.CtrlSeq1Arg.indexOf(csname) >= 0) {
            return 1;
        }
        if (TeX_SimpleRenderer.CtrlSeq0Args.indexOf(csname) >= 0) {
            return 0;
        }
        if (TeX_SimpleRenderer.CtrlSeqVirtGroup.indexOf(csname) >= 0) {
            return -1;
        }
        if (TeX_SimpleRenderer.CtrlSeqOpenGroup.indexOf(csname) >= 0) {
            return -2;
        }
        if (TeX_SimpleRenderer.CtrlSeqCloseGroup.indexOf(csname) >= 0) {
            return -3;
        }
        if (TeX_SimpleRenderer.CtrlSeqOpenMathInline.indexOf(csname) >= 0) {
            return -4;
        }
        if (TeX_SimpleRenderer.CtrlSeqCloseMathInline.indexOf(csname) >= 0) {
            return -5;
        }
        if (TeX_SimpleRenderer.CtrlSeqSwitchMathInline.indexOf(csname) >= 0) {
            return -6;
        }
        if (TeX_SimpleRenderer.CtrlSeqOpenMathDisplay.indexOf(csname) >= 0) {
            return -7;
        }
        if (TeX_SimpleRenderer.CtrlSeqCloseMathDisplay.indexOf(csname) >= 0) {
            return -8;
        }
        if (TeX_SimpleRenderer.CtrlSeqSwitchMathDisplay.indexOf(csname) >= 0) {
            return -9;
        }
        return Number.NaN;
    };
    TeX_SimpleRenderer.StackFrame = TeX_SimpleRenderer_StackFrame;
    TeX_SimpleRenderer.CtrlSeq2Arg = ['printfirst', 'switchargs'];
    TeX_SimpleRenderer.CtrlSeq1Arg = [
        '`', "'", '^', '"', '~', '=', '.',
        'u', 'v', 'H', 't', 'c', 'd', 'b', 'r',
        'text', 'emph',
        'textrm', 'textsf', 'texttt',
        'textmd', 'textbf',
        'textup', 'textsl', 'textit', 'textsc',
        'textsuperscript', 'textsubscript',
        'fbox', 'frame', 'framebox',
        'hspace', 'vspace', 'hspace*', 'vspace*',
        'label', 'ref', 'cite',
        '@',
        'uppercase', 'lowercase',
        'etalchar',
        'noopsort', 'singleletter'
    ];
    TeX_SimpleRenderer.CtrlSeq0Args = [
        'relax',
        ' ', '!', ',', ';', ':', '/',
        'quad', 'qquad', 'hfill', 'vfill',
        'TeX', 'LaTeX', 'LaTeXe', 'XeTeX', 'BibTeX', 'KaTeX',
        '{', '}', '#', '$', '%', '&',
        'copyright', 'dag', 'ddag', 'pounds', 'S', 'P',
        '\\', '-', 'slash',
        'lbrace', 'rbrace', 'lbrack', 'rbrack',
        'textasciitilde', 'textunderline', 'textbackslash',
        'textless', 'textgreater', 'textlangle', 'textrangle',
        'textbar', 'ldots', 'textellipsis', 'textemdash', 'textendash',
        'aa', 'ae', 'i', 'j', 'l', 'o', 'oe', 'ss',
        'AA', 'AE', 'L', 'O', 'OE'
    ];
    TeX_SimpleRenderer.CtrlSeqVirtGroup = [
        'rmfamily', 'sffamily', 'ttfamily',
        'mdseries', 'bfseries',
        'upshape', 'slshape', 'itshape', 'scshape',
        'rm', 'sf', 'tt', 'md', 'bf',
        'up', 'sl', 'it', 'em', 'sc',
        'tiny', 'scriptsize', 'footnotesize', 'small',
        'normalsize',
        'large', 'Large', 'LARGE', 'huge', 'Huge',
        'sloppy', 'fussy',
        'noindent'
    ];
    TeX_SimpleRenderer.CtrlSeqOpenGroup = ['bgroup'];
    TeX_SimpleRenderer.CtrlSeqCloseGroup = ['egroup'];
    TeX_SimpleRenderer.CtrlSeqOpenMathInline = ['('];
    TeX_SimpleRenderer.CtrlSeqCloseMathInline = [')'];
    TeX_SimpleRenderer.CtrlSeqSwitchMathInline = [];
    TeX_SimpleRenderer.CtrlSeqOpenMathDisplay = ['['];
    TeX_SimpleRenderer.CtrlSeqCloseMathDisplay = [']'];
    TeX_SimpleRenderer.CtrlSeqSwitchMathDisplay = [];
    return TeX_SimpleRenderer;
}());

;"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var TeX_TextRendererPrivates = (function (_super) {
    __extends(TeX_TextRendererPrivates, _super);
    function TeX_TextRendererPrivates(text) {
        return _super.call(this, text) || this;
    }
    TeX_TextRendererPrivates.SmartPuncts = function (text) {
        text = text.replace(/``/g, '“').replace(/''/g, '”');
        text = text.replace(/<</g, '«').replace(/>>/g, '»');
        text = text.replace(/</g, '‹').replace(/>/g, '›');
        text = text.replace(/`/g, '‘').replace(/'/g, '’');
        text = text.replace(/,,/g, '„').replace(/\.\.\./g, '…');
        text = text.replace(/---/g, '—').replace(/--/g, '–');
        text = text.replace(/~/g, ' ');
        text = text.replace(/[ \t\v\f\r\n]+/g, ' ');
        return text;
    };
    TeX_TextRendererPrivates.prototype.CtrlSeqType = function (csname, raw, target) {
        var ret = TeX_SimpleRenderer.CtrlSeqType(csname);
        if (ret != ret) {
            target.Append('', raw);
        }
        return ret;
    };
    TeX_TextRendererPrivates.prototype.CtrlSeqTypeInMath = function (csname) {
        return TeX_SimpleRenderer.CtrlSeqType(csname);
    };
    TeX_TextRendererPrivates.prototype.RenderCtrlSeq = function (csname, args, target) {
        if (csname === 'relax') {
            return;
        }
        var dcrt = TeX_TextRendererPrivates.CtrlSeqDiacritics[csname];
        if (dcrt !== undefined) {
            if (args.Char1.length === 0) {
                args.Append('', '');
            }
            args.Char1[0] = args.Char1[0] || '◌';
            args.Char1[0] += dcrt;
            args.StringConcatInto(target);
            return;
        }
        var txt = TeX_TextRendererPrivates.CtrlSeqTextReplacement[csname];
        if (txt !== undefined) {
            target.Append('', txt);
            return;
        }
        if (csname === 'printfirst') {
            this.RenderCtrlSeq_printfirst(args, target);
            return;
        }
        if (csname === 'switchargs') {
            this.RenderCtrlSeq_switchargs(args, target);
            return;
        }
        args.StringConcatInto(target);
    };
    TeX_TextRendererPrivates.prototype.RenderAll = function (content) {
        var result = new TeX_SimpleRenderer_StackFrame();
        content.StringConcatInto(result);
        return result.Char1[0] + result.Char2[0];
    };
    TeX_TextRendererPrivates.prototype.RenderGroup = function (args, target) {
        args.StringConcatInto(target);
    };
    TeX_TextRendererPrivates.prototype.RenderVirtGroup = function (args, target) {
        args.StringConcatInto(target);
    };
    TeX_TextRendererPrivates.prototype.RenderMathInline = function (_math, raw, target) {
        target.Append('', raw);
    };
    TeX_TextRendererPrivates.prototype.RenderMathDisplay = function (_math, raw, target) {
        target.Append('', raw);
    };
    TeX_TextRendererPrivates.prototype.RenderText = function (text, target) {
        text = TeX_TextRendererPrivates.SmartPuncts(text);
        target.Append(text.substr(0, 1), text.substr(1));
    };
    TeX_TextRendererPrivates.prototype.RenderCtrlSeq_printfirst = function (args, target) {
        while (args.Char1.length > 1) {
            args.Char1.pop();
        }
        while (args.Char2.length > 1) {
            args.Char2.pop();
        }
        args.StringConcatInto(target);
    };
    TeX_TextRendererPrivates.prototype.RenderCtrlSeq_switchargs = function (args, target) {
        while (args.Char1.length > 2) {
            args.Char1.pop();
        }
        while (args.Char1.length < 2) {
            args.Char1.push('');
        }
        while (args.Char2.length > 2) {
            args.Char2.pop();
        }
        while (args.Char2.length < 2) {
            args.Char2.push('');
        }
        var tmp = undefined;
        tmp = args.Char1[0];
        args.Char1[0] = args.Char1[1];
        args.Char1[1] = tmp;
        tmp = args.Char2[0];
        args.Char2[0] = args.Char2[1];
        args.Char2[1] = tmp;
        args.StringConcatInto(target);
    };
    TeX_TextRendererPrivates.CtrlSeqDiacritics = (function (obj) {
        obj['`'] = '̀';
        obj["'"] = '́';
        obj['^'] = '̂';
        obj['"'] = '̈';
        obj['~'] = '̃';
        obj['='] = '̄';
        obj['.'] = '̇';
        obj['u'] = '̆';
        obj['v'] = '̌';
        obj['H'] = '̋';
        obj['t'] = '͡';
        obj['c'] = '̧';
        obj['d'] = '̣';
        obj['b'] = '̱';
        obj['r'] = '̊';
        return Helper.FreezeObject(obj);
    })(Helper.NewEmptyObject());
    TeX_TextRendererPrivates.CtrlSeqTextReplacement = (function (obj) {
        obj['hspace'] = '';
        obj['vspace'] = '';
        obj['hspace*'] = '';
        obj['vspace*'] = '';
        obj['label'] = '';
        obj['ref'] = '?';
        obj['cite'] = '[?]';
        obj[' '] = ' ';
        obj['!'] = '';
        obj[','] = ' ';
        obj[';'] = ' ';
        obj[':'] = ' ';
        obj['/'] = ' ';
        obj['quad'] = '  ';
        obj['qquad'] = '    ';
        obj['hfill'] = '\t';
        obj['TeX'] = 'TeX';
        obj['LaTeX'] = 'LaTeX';
        obj['LaTeXe'] = 'LaTeX 2ε';
        obj['XeTeX'] = 'XeTeX';
        obj['BibTeX'] = 'BibTeX';
        obj['KaTeX'] = 'KaTeX';
        obj['{'] = '{';
        obj['}'] = '}';
        obj['#'] = '#';
        obj['$'] = '$';
        obj['%'] = '%';
        obj['&'] = '&';
        obj['copyright'] = '©';
        obj['dag'] = '†';
        obj['ddag'] = '‡';
        obj['pounds'] = '£';
        obj['S'] = '§';
        obj['P'] = '¶';
        obj['\\'] = '\n';
        obj['-'] = '­';
        obj['slash'] = '/';
        obj['lbrace'] = '{';
        obj['rbrace'] = '}';
        obj['lbrack'] = '[';
        obj['rbrack'] = ']';
        obj['textasciitilde'] = '~';
        obj['textunderline'] = '_';
        obj['textbackslash'] = '\\';
        obj['textless'] = '<';
        obj['textgreater'] = '>';
        obj['textlangle'] = '〈';
        obj['textrangle'] = '〉';
        obj['textbar'] = '|';
        obj['ldots'] = '…';
        obj['textellipsis'] = '…';
        obj['textemdash'] = '—';
        obj['textendash'] = '–';
        obj['aa'] = 'å';
        obj['ae'] = 'æ';
        obj['i'] = 'ı';
        obj['j'] = 'ȷ';
        obj['l'] = 'ł';
        obj['o'] = 'ø';
        obj['oe'] = 'œ';
        obj['ss'] = 'ß';
        obj['AA'] = 'Å';
        obj['AE'] = 'Æ';
        obj['L'] = 'Ł';
        obj['O'] = 'Ø';
        obj['OE'] = 'Œ';
        obj['noopsort'] = '';
        return Helper.FreezeObject(obj);
    })(Helper.NewEmptyObject());
    return TeX_TextRendererPrivates;
}(TeX_SimpleRenderer));
var TeX_TextRenderer = (function () {
    function TeX_TextRenderer(text) {
        text = '' + (text || '');
        this._MutablePrivates = new TeX_TextRendererPrivates(text);
    }
    TeX_TextRenderer.prototype.Render = function () {
        return this._MutablePrivates.Render();
    };
    return TeX_TextRenderer;
}());
function TeX_ToPlainText(text) {
    return (new TeX_TextRenderer(text)).Render();
}

;"use strict";
ExportBibTeX.TeX = (function (ns) {
    ns.SimpleHandler = TeX_SimpleHandler;
    ns.SimpleRenderer = TeX_SimpleRenderer;
    ns.TextRenderer = TeX_TextRenderer;
    ns.ToPlainText = TeX_ToPlainText;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX._Privates.TeX = (function (ns) {
    ns.SimpleHandler = TeX_SimpleHandler;
    ns.SimpleRenderer = TeX_SimpleRenderer;
    ns.SimpleRendererPrivates = TeX_SimpleRendererPrivates;
    ns.TextRendererPrivates = TeX_TextRendererPrivates;
    ns.TextRenderer = TeX_TextRenderer;
    ns.ToPlainText = TeX_ToPlainText;
    return ns;
})(Helper.NewEmptyObject());

/* TeX @@ */

/* @@ Styles */
"use strict";
var Styles_AbbrvImpl = (function () {
    function Styles_AbbrvImpl() {
    }
    Styles_AbbrvImpl.ProcessEntry = function (entry) {
        var that = Styles_StandardStyle.Abbrv;
        if (Styles_StandardStyle.EntryTypes.indexOf(entry.Type) >= 0) {
            return that[entry.Type].call(that, entry);
        }
        return that.misc(entry);
    };
    Styles_AbbrvImpl.FixNicknames = function (entries) {
        return Styles_PlainImpl.FixNicknames(entries);
    };
    return Styles_AbbrvImpl;
}());
var Styles_Abbrv = (function () {
    function Styles_Abbrv() {
    }
    Styles_Abbrv.ProcessEntries = function (entries) {
        var result = [];
        if (entries instanceof Array) {
            var len = entries.length;
            for (var i = 0; i !== len; ++i) {
                result.push(new Styles_Plain_SortedEntry(true, entries[i], i, Styles_Abbrv.Macros));
            }
        }
        result.sort(Styles_Plain_SortedEntry.Compare);
        Styles_AbbrvImpl.FixNicknames(result);
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var item = result_1[_i];
            Helper.FreezeObject(item);
        }
        return result;
    };
    Styles_Abbrv.GetEntryNicknameTeX = function (entry) {
        if (!(entry instanceof Styles_Plain_SortedEntry)) {
            return '';
        }
        return entry.Nickname.Raw;
    };
    Styles_Abbrv.GetEntryCitationTeX = function (entry) {
        if (!(entry instanceof Styles_Plain_SortedEntry)) {
            return '';
        }
        var myEntry = entry.Entry;
        if (myEntry === undefined) {
            return '';
        }
        return Styles_AbbrvImpl.ProcessEntry(myEntry);
    };
    Styles_Abbrv.SortedEntry = Styles_Plain_SortedEntry;
    Styles_Abbrv.Macros = (function (obj) {
        obj['jan'] = Strings_ParseLiteral('Jan.').Result;
        obj['feb'] = Strings_ParseLiteral('Feb.').Result;
        obj['mar'] = Strings_ParseLiteral('Mar.').Result;
        obj['apr'] = Strings_ParseLiteral('Apr.').Result;
        obj['may'] = Strings_ParseLiteral('May').Result;
        obj['jun'] = Strings_ParseLiteral('June').Result;
        obj['jul'] = Strings_ParseLiteral('July').Result;
        obj['aug'] = Strings_ParseLiteral('Aug.').Result;
        obj['sep'] = Strings_ParseLiteral('Sept.').Result;
        obj['oct'] = Strings_ParseLiteral('Oct.').Result;
        obj['nov'] = Strings_ParseLiteral('Nov.').Result;
        obj['dec'] = Strings_ParseLiteral('Dec.').Result;
        obj['acmcs'] = Strings_ParseLiteral('ACM Comput. Surv.').Result;
        obj['acta'] = Strings_ParseLiteral('Acta Inf.').Result;
        obj['cacm'] = Strings_ParseLiteral('Commun. ACM').Result;
        obj['ibmjrd'] = Strings_ParseLiteral('IBM J. Res. Dev.').Result;
        obj['ibmsj'] = Strings_ParseLiteral('IBM Syst.~J.').Result;
        obj['ieeese'] = Strings_ParseLiteral('IEEE Trans. Softw. Eng.').Result;
        obj['ieeetc'] = Strings_ParseLiteral('IEEE Trans. Comput.').Result;
        obj['ieeetcad'] = Strings_ParseLiteral('IEEE Trans. Comput.-Aided Design Integrated Circuits').Result;
        obj['ipl'] = Strings_ParseLiteral('Inf. Process. Lett.').Result;
        obj['jacm'] = Strings_ParseLiteral('J.~ACM').Result;
        obj['jcss'] = Strings_ParseLiteral('J.~Comput. Syst. Sci.').Result;
        obj['scp'] = Strings_ParseLiteral('Sci. Comput. Programming').Result;
        obj['sicomp'] = Strings_ParseLiteral('SIAM J. Comput.').Result;
        obj['tocs'] = Strings_ParseLiteral('ACM Trans. Comput. Syst.').Result;
        obj['tods'] = Strings_ParseLiteral('ACM Trans. Database Syst.').Result;
        obj['tog'] = Strings_ParseLiteral('ACM Trans. Gr.').Result;
        obj['toms'] = Strings_ParseLiteral('ACM Trans. Math. Softw.').Result;
        obj['toois'] = Strings_ParseLiteral('ACM Trans. Office Inf. Syst.').Result;
        obj['toplas'] = Strings_ParseLiteral('ACM Trans. Prog. Lang. Syst.').Result;
        obj['tcs'] = Strings_ParseLiteral('Theoretical Comput. Sci.').Result;
        return obj;
    })(Helper.NewEmptyObject());
    return Styles_Abbrv;
}());

;"use strict";
var Styles_Alpha_SortedEntry = (function () {
    function Styles_Alpha_SortedEntry(src, idx, macros) {
        this.Source = src;
        var entry = (src instanceof ObjectModel_EntryData
            ? src.Resolve(macros)
            : src instanceof ObjectModel_Entry
                ? src
                : undefined);
        this.Entry = entry;
        if (entry !== undefined) {
            var first = [];
            var vonLast = [];
            var jr = [];
            this.Nickname = Styles_AlphaImpl.format_label_text(entry);
            this.NicknameSort = Styles_AlphaImpl.format_label_sort(entry);
            this.Year = Styles_ResolveYear(entry);
            this.Month = Styles_ResolveMonth(entry);
            Styles_Helper.CreateSortName(entry, false, first, vonLast, jr);
            this.First = Helper.FreezeObject(first);
            this.vonLast = Helper.FreezeObject(vonLast);
            this.Jr = Helper.FreezeObject(jr);
            this.Title = Styles_Helper.ChopWords(entry, 'title');
        }
        else {
            var emptyArray = Styles_Helper.EmptyArray;
            this.Nickname = Strings_Literal.Empty;
            this.NicknameSort = '';
            this.Year = Number.NaN;
            this.Month = Number.NaN;
            this.First = emptyArray;
            this.vonLast = emptyArray;
            this.Jr = emptyArray;
            this.Title = emptyArray;
        }
        this.OriginalIndex = idx;
    }
    Styles_Alpha_SortedEntry.Compare = function (entry1, entry2) {
        return (entry1.OriginalIndex === entry2.OriginalIndex
            ? 0
            : Styles_Helper.CompareStrings(entry1.NicknameSort, entry2.NicknameSort) || Styles_Helper.CompareDate(entry1, entry2) || Styles_Helper.CompareNames(entry1, entry2) || Styles_Helper.CompareWords(entry1.Title, entry2.Title) || Styles_Helper.CompareNumbers(entry1.OriginalIndex, entry2.OriginalIndex));
    };
    return Styles_Alpha_SortedEntry;
}());
var Styles_AlphaImpl = (function () {
    function Styles_AlphaImpl() {
    }
    Styles_AlphaImpl.ProcessEntry = function (entry) {
        var that = Styles_StandardStyle.Alpha;
        if (Styles_StandardStyle.EntryTypes.indexOf(entry.Type) >= 0) {
            return that[entry.Type].call(that, entry);
        }
        return that.misc(entry);
    };
    Styles_AlphaImpl.MakeLiteral = function (str) {
        var builder = new Strings_LiteralBuilder();
        builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder(str)));
        return new Strings_Literal(builder);
    };
    Styles_AlphaImpl.format_name_vl = function (name) {
        var builder = new Strings_LiteralBuilder();
        for (var _i = 0, _a = name.von; _i < _a.length; _i++) {
            var vonName = _a[_i];
            for (var _b = 0, _c = vonName.Prefix(1).Pieces; _b < _c.length; _b++) {
                var piece = _c[_b];
                builder.AddPiece(piece);
            }
        }
        for (var _d = 0, _e = name.Last; _d < _e.length; _d++) {
            var lastName = _e[_d];
            for (var _f = 0, _g = lastName.Prefix(1).Pieces; _f < _g.length; _f++) {
                var piece = _g[_f];
                builder.AddPiece(piece);
            }
        }
        return new Strings_Literal(builder);
    };
    Styles_AlphaImpl.format_name_ll = function (name) {
        var vl = this.format_name_vl(name);
        if (vl.Length > 1) {
            return vl;
        }
        for (var _i = 0, _a = name.Last; _i < _a.length; _i++) {
            var word = _a[_i];
            if (word.Length !== 0) {
                return word.Prefix(3);
            }
        }
        return vl;
    };
    Styles_AlphaImpl.format_label_names = function (entry) {
        var etal = false;
        var namestring = entry.Fields['author'] ||
            entry.Fields['editor'];
        if (namestring === undefined) {
            var key = entry.Fields['key'];
            if (key !== undefined) {
                return key.Prefix(3);
            }
            return this.AnonName;
        }
        var people = ObjectModel_ParsePersonNames(namestring);
        var ll = undefined;
        var vls = [];
        for (var _i = 0, people_1 = people; _i < people_1.length; _i++) {
            var person = people_1[_i];
            if (person.IsEtal()) {
                etal = true;
                continue;
            }
            var vl = this.format_name_vl(person);
            if (vl.Length === 0) {
                continue;
            }
            vls.push(vl);
            if (vls.length === 1) {
                ll = this.format_name_ll(person);
            }
        }
        if (vls.length === 0) {
            return this.AnonName;
        }
        if (vls.length === 1) {
            vls[0] = ll;
        }
        else if (vls.length > 4) {
            vls = vls.slice(0, 3);
            etal = true;
        }
        if (etal) {
            vls.push(this.EtalChar);
        }
        return Strings_Literal.Concat(vls);
    };
    Styles_AlphaImpl.format_label_year = function (entry) {
        var year = Styles_ResolveYear(entry);
        if (year != year) {
            return Strings_Literal.Empty;
        }
        if (year < 0) {
            year = -year;
        }
        if (year < 10) {
            return this.MakeLiteral(year.toString());
        }
        year %= 100;
        return this.MakeLiteral(year < 10
            ? '0' + year.toString()
            : year.toString());
    };
    Styles_AlphaImpl.format_label_text = function (entry) {
        return Strings_Literal.Concat([
            this.format_label_names(entry),
            this.format_label_year(entry)
        ]);
    };
    Styles_AlphaImpl.format_label_sort = function (entry) {
        return Styles_Helper.purified_uppercase(this.format_label_names(entry));
    };
    Styles_AlphaImpl.FixNicknames = function (entries) {
        var name1 = Helper.NewEmptyObject();
        var name2 = Helper.NewEmptyObject();
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var baseNickname = entry.Nickname.Purified;
            if (baseNickname in name1) {
                ++name1[baseNickname];
            }
            else {
                name1[baseNickname] = 1;
                name2[baseNickname] = 0;
            }
        }
        var suffix = this.NicknameSuffix;
        for (var _a = 0, entries_2 = entries; _a < entries_2.length; _a++) {
            var entry = entries_2[_a];
            var baseNickname = entry.Nickname.Purified;
            if (baseNickname.length === 0 ||
                name1[baseNickname] <= 1) {
                continue;
            }
            var order = name2[baseNickname]++;
            var nickname = [entry.Nickname,
                Strings_Literal.Empty,
                Strings_Literal.Empty];
            if (order < suffix.length) {
                if (!/[0-9]$/.test(baseNickname)) {
                    nickname[1] = this.NicknameConnector;
                }
                nickname[2] = suffix[order];
            }
            else {
                nickname[1] = this.NicknameConnector;
                nickname[2] = Strings_ParseLiteral((order + 1).toString()).Result;
            }
            entry.Nickname = Strings_Literal.Concat(nickname);
        }
    };
    Styles_AlphaImpl.AnonName = Styles_AlphaImpl.MakeLiteral('Anon');
    Styles_AlphaImpl.EtalChar = (function (builder) {
        builder.AddSpCharPiece(new Strings_SpCharPiece(new Strings_SpCharPieceBuilder('\\etalchar{+}')));
        return new Strings_Literal(builder);
    })(new Strings_LiteralBuilder());
    Styles_AlphaImpl.NicknameSuffix = [
        Styles_AlphaImpl.MakeLiteral('a'),
        Styles_AlphaImpl.MakeLiteral('b'),
        Styles_AlphaImpl.MakeLiteral('c'),
        Styles_AlphaImpl.MakeLiteral('d'),
        Styles_AlphaImpl.MakeLiteral('e'),
        Styles_AlphaImpl.MakeLiteral('f'),
        Styles_AlphaImpl.MakeLiteral('g'),
        Styles_AlphaImpl.MakeLiteral('h'),
        Styles_AlphaImpl.MakeLiteral('i'),
        Styles_AlphaImpl.MakeLiteral('j'),
        Styles_AlphaImpl.MakeLiteral('k'),
        Styles_AlphaImpl.MakeLiteral('l'),
        Styles_AlphaImpl.MakeLiteral('m'),
        Styles_AlphaImpl.MakeLiteral('n'),
        Styles_AlphaImpl.MakeLiteral('o'),
        Styles_AlphaImpl.MakeLiteral('p'),
        Styles_AlphaImpl.MakeLiteral('q'),
        Styles_AlphaImpl.MakeLiteral('r'),
        Styles_AlphaImpl.MakeLiteral('s'),
        Styles_AlphaImpl.MakeLiteral('t'),
        Styles_AlphaImpl.MakeLiteral('u'),
        Styles_AlphaImpl.MakeLiteral('v'),
        Styles_AlphaImpl.MakeLiteral('w'),
        Styles_AlphaImpl.MakeLiteral('x'),
        Styles_AlphaImpl.MakeLiteral('y'),
        Styles_AlphaImpl.MakeLiteral('z'),
        Styles_AlphaImpl.MakeLiteral('α'),
        Styles_AlphaImpl.MakeLiteral('β'),
        Styles_AlphaImpl.MakeLiteral('γ'),
        Styles_AlphaImpl.MakeLiteral('δ'),
        Styles_AlphaImpl.MakeLiteral('ε'),
        Styles_AlphaImpl.MakeLiteral('ζ'),
        Styles_AlphaImpl.MakeLiteral('η'),
        Styles_AlphaImpl.MakeLiteral('θ'),
        Styles_AlphaImpl.MakeLiteral('ι'),
        Styles_AlphaImpl.MakeLiteral('κ'),
        Styles_AlphaImpl.MakeLiteral('λ'),
        Styles_AlphaImpl.MakeLiteral('μ'),
        Styles_AlphaImpl.MakeLiteral('ξ'),
        Styles_AlphaImpl.MakeLiteral('π'),
        Styles_AlphaImpl.MakeLiteral('ρ'),
        Styles_AlphaImpl.MakeLiteral('σ'),
        Styles_AlphaImpl.MakeLiteral('τ'),
        Styles_AlphaImpl.MakeLiteral('φ'),
        Styles_AlphaImpl.MakeLiteral('χ'),
        Styles_AlphaImpl.MakeLiteral('ψ'),
        Styles_AlphaImpl.MakeLiteral('ω')
    ];
    Styles_AlphaImpl.NicknameConnector = Styles_AlphaImpl.MakeLiteral('-');
    return Styles_AlphaImpl;
}());
var Styles_Alpha = (function () {
    function Styles_Alpha() {
    }
    Styles_Alpha.ProcessEntries = function (entries) {
        var result = [];
        if (entries instanceof Array) {
            var len = entries.length;
            for (var i = 0; i !== len; ++i) {
                result.push(new Styles_Alpha_SortedEntry(entries[i], i, Styles_Alpha.Macros));
            }
        }
        result.sort(Styles_Alpha_SortedEntry.Compare);
        Styles_AlphaImpl.FixNicknames(result);
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var item = result_1[_i];
            Helper.FreezeObject(item);
        }
        return result;
    };
    Styles_Alpha.GetEntryNicknameTeX = function (entry) {
        if (!(entry instanceof Styles_Alpha_SortedEntry)) {
            return '';
        }
        return entry.Nickname.Raw;
    };
    Styles_Alpha.GetEntryCitationTeX = function (entry) {
        if (!(entry instanceof Styles_Alpha_SortedEntry)) {
            return '';
        }
        var myEntry = entry.Entry;
        if (myEntry === undefined) {
            return '';
        }
        return Styles_AlphaImpl.ProcessEntry(myEntry);
    };
    Styles_Alpha.SortedEntry = Styles_Alpha_SortedEntry;
    Styles_Alpha.Macros = (function (obj) {
        obj['jan'] = Strings_ParseLiteral('January').Result;
        obj['feb'] = Strings_ParseLiteral('February').Result;
        obj['mar'] = Strings_ParseLiteral('March').Result;
        obj['apr'] = Strings_ParseLiteral('April').Result;
        obj['may'] = Strings_ParseLiteral('May').Result;
        obj['jun'] = Strings_ParseLiteral('June').Result;
        obj['jul'] = Strings_ParseLiteral('July').Result;
        obj['aug'] = Strings_ParseLiteral('August').Result;
        obj['sep'] = Strings_ParseLiteral('September').Result;
        obj['oct'] = Strings_ParseLiteral('October').Result;
        obj['nov'] = Strings_ParseLiteral('November').Result;
        obj['dec'] = Strings_ParseLiteral('December').Result;
        obj['acmcs'] = Strings_ParseLiteral('ACM Computing Surveys').Result;
        obj['acta'] = Strings_ParseLiteral('Acta Informatica').Result;
        obj['cacm'] = Strings_ParseLiteral('Communications of the ACM').Result;
        obj['ibmjrd'] = Strings_ParseLiteral('IBM Journal of Research and Development').Result;
        obj['ibmsj'] = Strings_ParseLiteral('IBM Systems Journal').Result;
        obj['ieeese'] = Strings_ParseLiteral('IEEE Transactions on Software Engineering').Result;
        obj['ieeetc'] = Strings_ParseLiteral('IEEE Transactions on Computers').Result;
        obj['ieeetcad'] = Strings_ParseLiteral('IEEE Transactions on Computer-Aided Design of Integrated Circuits').Result;
        obj['ipl'] = Strings_ParseLiteral('Information Processing Letters').Result;
        obj['jacm'] = Strings_ParseLiteral('Journal of the ACM').Result;
        obj['jcss'] = Strings_ParseLiteral('Journal of Computer and System Sciences').Result;
        obj['scp'] = Strings_ParseLiteral('Science of Computer Programming').Result;
        obj['sicomp'] = Strings_ParseLiteral('SIAM Journal on Computing').Result;
        obj['tocs'] = Strings_ParseLiteral('ACM Transactions on Computer Systems').Result;
        obj['tods'] = Strings_ParseLiteral('ACM Transactions on Database Systems').Result;
        obj['tog'] = Strings_ParseLiteral('ACM Transactions on Graphics').Result;
        obj['toms'] = Strings_ParseLiteral('ACM Transactions on Mathematical Software').Result;
        obj['toois'] = Strings_ParseLiteral('ACM Transactions on Office Information Systems').Result;
        obj['toplas'] = Strings_ParseLiteral('ACM Transactions on Programming Languages and Systems').Result;
        obj['tcs'] = Strings_ParseLiteral('Theoretical Computer Science').Result;
        return obj;
    })(Helper.NewEmptyObject());
    return Styles_Alpha;
}());

;"use strict";
var Styles_FormattedNames = (function () {
    function Styles_FormattedNames(count, value) {
        this.Count = count;
        this.Value = value;
        Helper.FreezeObject(this);
    }
    Styles_FormattedNames.Empty = new Styles_FormattedNames(0, '');
    return Styles_FormattedNames;
}());
var Styles_Helper = (function () {
    function Styles_Helper() {
    }
    Styles_Helper.sentence = function (text) {
        return (text.length === 0
            ? ''
            : /[.?!]\}*$/.test(text)
                ? text + '\n'
                : text + '.\n');
    };
    Styles_Helper.clause = function (clause1, clause2) {
        return (clause1.length === 0
            ? clause2
            : clause2.length === 0
                ? clause1
                : clause1 + ', ' + clause2);
    };
    Styles_Helper.field = function (entry, field) {
        var presence = entry.Fields[field];
        return presence || Strings_Literal.Empty;
    };
    Styles_Helper.emph = function (text) {
        return (text.length === 0
            ? ''
            : '{\\em ' + text + '}');
    };
    Styles_Helper.purified_uppercase = function (text) {
        return text.Purified.replace(/[a-z]+/g, function (x) { return x.toUpperCase(); });
    };
    Styles_Helper.format_names = function (format, people) {
        var result = [];
        var etal = false;
        for (var _i = 0, people_1 = people; _i < people_1.length; _i++) {
            var person = people_1[_i];
            if (person.IsEtal()) {
                etal = true;
                continue;
            }
            result.push(format.Format(person));
        }
        if (result.length === 0) {
            return Styles_FormattedNames.Empty;
        }
        if (etal) {
            return new Styles_FormattedNames(result.length + 1, result.length === 1
                ? result[0] + ' et~al.'
                : result.join(', ') + ', et~al.');
        }
        if (result.length === 1) {
            return new Styles_FormattedNames(1, result[0]);
        }
        return new Styles_FormattedNames(result.length, result.slice(0, result.length - 1).join(', ')
            + (result.length === 2 ? ' and ' : ', and ')
            + result[result.length - 1]);
    };
    Styles_Helper.n_dashify = function (text) {
        return text.replace(/[ \t\v\f\r\n]*-+[ \t\v\f\r\n]*/g, '--');
    };
    Styles_Helper.LaunderNameWords = function (name, target, result) {
        for (var _i = 0, _a = name[target]; _i < _a.length; _i++) {
            var word = _a[_i];
            result.push(this.purified_uppercase(word));
        }
        return result;
    };
    Styles_Helper.LaunderInitials = function (name, target, result) {
        for (var _i = 0, _a = name[target]; _i < _a.length; _i++) {
            var word = _a[_i];
            result.push(this.purified_uppercase(word.Prefix(1)));
        }
        return result;
    };
    Styles_Helper.ChopWords = function (entry, field) {
        var value = this.purified_uppercase(this.field(entry, field));
        var result = [];
        var rgx = /[^ \t\v\f\r\n]+/g;
        var match = null;
        rgx.lastIndex = 0;
        while (match = rgx.exec(value)) {
            result.push(match[0]);
        }
        return Helper.FreezeObject(result);
    };
    Styles_Helper.CreateSortName = function (entry, firstAbbrv, first, vonLast, jr) {
        var authors = entry.Fields['author'];
        for (var _i = 0, _a = (authors !== undefined
            ? ObjectModel_ParsePersonNames(authors)
            : this.EmptyArray); _i < _a.length; _i++) {
            var person = _a[_i];
            if (person.IsEtal()) {
                continue;
            }
            first.push(Helper.FreezeObject(firstAbbrv
                ? this.LaunderNameWords(person, 'First', [])
                : this.LaunderInitials(person, 'First', [])));
            vonLast.push(Helper.FreezeObject(this.LaunderNameWords(person, 'Last', this.LaunderNameWords(person, 'von', []))));
            jr.push(Helper.FreezeObject(this.LaunderNameWords(person, 'Jr', [])));
        }
        if (vonLast.length !== 0) {
            return;
        }
        var editors = entry.Fields['editors'];
        for (var _b = 0, _c = (editors !== undefined
            ? ObjectModel_ParsePersonNames(editors)
            : this.EmptyArray); _b < _c.length; _b++) {
            var person = _c[_b];
            if (person.IsEtal()) {
                continue;
            }
            first.push(Helper.FreezeObject(firstAbbrv
                ? this.LaunderNameWords(person, 'First', [])
                : this.LaunderInitials(person, 'First', [])));
            vonLast.push(Helper.FreezeObject(this.LaunderNameWords(person, 'Last', this.LaunderNameWords(person, 'von', []))));
            jr.push(Helper.FreezeObject(this.LaunderNameWords(person, 'Jr', [])));
        }
        if (vonLast.length !== 0) {
            return;
        }
        var org = this.ChopWords(entry, 'organization');
        if (org.length === 0) {
            return;
        }
        first.push(this.EmptyArray);
        vonLast.push(org);
        jr.push(this.EmptyArray);
    };
    Styles_Helper.CompareNumbers = function (n1, n2) {
        return (n1 != n1
            ? n2 != n2
                ? 0
                : 1
            : n2 != n2
                ? -1
                : n1 < n2 ? -1 : n1 > n2 ? 1 : 0);
    };
    Styles_Helper.CompareStrings = function (str1, str2) {
        return (str1 === ''
            ? str2 === '' ? 0 : 1
            : str2 === '' ? -1
                : str1 < str2 ? -1 : str1 > str2 ? 1 : 0);
    };
    Styles_Helper.CompareWords = function (words1, words2) {
        var l1 = words1.length;
        var l2 = words2.length;
        for (var i = 0; i !== l1 && i !== l2; ++i) {
            var n1 = words1[i];
            var n2 = words2[i];
            if (n1 < n2) {
                return -1;
            }
            if (n1 > n2) {
                return 1;
            }
        }
        return l1 < l2 ? -1 : l1 > l2 ? 1 : 0;
    };
    Styles_Helper.CompareParts = function (parts1, parts2) {
        var l1 = parts1.length;
        var l2 = parts2.length;
        for (var i = 0; i !== l1 && i !== l2; ++i) {
            var result = this.CompareWords(parts1[i], parts2[i]);
            if (result) {
                return result;
            }
        }
        return l1 < l2 ? -1 : l1 > l2 ? 1 : 0;
    };
    Styles_Helper.CompareNames = function (entry1, entry2) {
        return (entry1.vonLast.length !== 0
            ? entry2.vonLast.length !== 0
                ? this.CompareParts(entry1.vonLast, entry2.vonLast) || this.CompareParts(entry1.First, entry2.First) || this.CompareParts(entry1.Jr, entry2.Jr)
                : -1
            : entry2.vonLast.length !== 0
                ? 1
                : 0);
    };
    Styles_Helper.CompareDate = function (entry1, entry2) {
        return Styles_Helper.CompareNumbers(entry1.Year, entry2.Year) || Styles_Helper.CompareNumbers(entry1.Month, entry2.Month);
    };
    Styles_Helper.NameFormat_ffvvlljj = ObjectModel_ParsePersonNameFormat('{ff }{vv~}{ll}{, jj}');
    Styles_Helper.NameFormat_fvvlljj = ObjectModel_ParsePersonNameFormat('{f.~}{vv~}{ll}{, jj}');
    Styles_Helper.MonthNamesLong = Helper.FreezeObject([
        '', 'January', 'February', 'March',
        'April', 'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ]);
    Styles_Helper.MonthNamesShort = Helper.FreezeObject([
        '', 'Jan.', 'Feb.', 'Mar.',
        'Apr.', 'May', 'June', 'July', 'Aug.',
        'Sept.', 'Oct.', 'Nov.', 'Dec.'
    ]);
    Styles_Helper.EmptyArray = Helper.FreezeObject([]);
    return Styles_Helper;
}());

;"use strict";
var Styles_Plain_SortedEntry = (function () {
    function Styles_Plain_SortedEntry(abbrv, src, idx, macros) {
        this.Source = src;
        var entry = (src instanceof ObjectModel_EntryData
            ? src.Resolve(macros)
            : src instanceof ObjectModel_Entry
                ? src
                : undefined);
        this.Entry = entry;
        this.Nickname = Strings_Literal.Empty;
        if (entry !== undefined) {
            var first = [];
            var vonLast = [];
            var jr = [];
            Styles_Helper.CreateSortName(entry, abbrv, first, vonLast, jr);
            this.First = Helper.FreezeObject(first);
            this.vonLast = Helper.FreezeObject(vonLast);
            this.Jr = Helper.FreezeObject(jr);
            this.Year = Styles_ResolveYear(entry);
            this.Month = Styles_ResolveMonth(entry);
            this.Title = Styles_Helper.ChopWords(entry, 'title');
        }
        else {
            var emptyArray = Styles_Helper.EmptyArray;
            this.First = emptyArray;
            this.vonLast = emptyArray;
            this.Jr = emptyArray;
            this.Year = Number.NaN;
            this.Month = Number.NaN;
            this.Title = emptyArray;
        }
        this.OriginalIndex = idx;
    }
    Styles_Plain_SortedEntry.Compare = function (entry1, entry2) {
        return (entry1.OriginalIndex === entry2.OriginalIndex
            ? 0
            : Styles_Helper.CompareNames(entry1, entry2) || Styles_Helper.CompareDate(entry1, entry2) || Styles_Helper.CompareWords(entry1.Title, entry2.Title) || Styles_Helper.CompareNumbers(entry1.OriginalIndex, entry2.OriginalIndex));
    };
    return Styles_Plain_SortedEntry;
}());
var Styles_PlainImpl = (function () {
    function Styles_PlainImpl() {
    }
    Styles_PlainImpl.ProcessEntry = function (entry) {
        var that = Styles_StandardStyle.Plain;
        if (Styles_StandardStyle.EntryTypes.indexOf(entry.Type) >= 0) {
            return that[entry.Type].call(that, entry);
        }
        return that.misc(entry);
    };
    Styles_PlainImpl.FixNicknames = function (entries) {
        var i = 0;
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            var builder = new Strings_LiteralBuilder();
            builder.AddBasicPiece(new Strings_BasicPiece(new Strings_BasicPieceBuilder((++i).toString())));
            entry.Nickname = new Strings_Literal(builder);
        }
    };
    return Styles_PlainImpl;
}());
var Styles_Plain = (function () {
    function Styles_Plain() {
    }
    Styles_Plain.ProcessEntries = function (entries) {
        var result = [];
        if (entries instanceof Array) {
            var len = entries.length;
            for (var i = 0; i !== len; ++i) {
                result.push(new Styles_Plain_SortedEntry(true, entries[i], i, Styles_Plain.Macros));
            }
        }
        result.sort(Styles_Plain_SortedEntry.Compare);
        Styles_PlainImpl.FixNicknames(result);
        for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
            var item = result_1[_i];
            Helper.FreezeObject(item);
        }
        return result;
    };
    Styles_Plain.GetEntryNicknameTeX = function (entry) {
        if (!(entry instanceof Styles_Plain_SortedEntry)) {
            return '';
        }
        return entry.Nickname.Raw;
    };
    Styles_Plain.GetEntryCitationTeX = function (entry) {
        if (!(entry instanceof Styles_Plain_SortedEntry)) {
            return '';
        }
        var myEntry = entry.Entry;
        if (myEntry === undefined) {
            return '';
        }
        return Styles_PlainImpl.ProcessEntry(myEntry);
    };
    Styles_Plain.SortedEntry = Styles_Plain_SortedEntry;
    Styles_Plain.Macros = (function (obj) {
        obj['jan'] = Strings_ParseLiteral('January').Result;
        obj['feb'] = Strings_ParseLiteral('February').Result;
        obj['mar'] = Strings_ParseLiteral('March').Result;
        obj['apr'] = Strings_ParseLiteral('April').Result;
        obj['may'] = Strings_ParseLiteral('May').Result;
        obj['jun'] = Strings_ParseLiteral('June').Result;
        obj['jul'] = Strings_ParseLiteral('July').Result;
        obj['aug'] = Strings_ParseLiteral('August').Result;
        obj['sep'] = Strings_ParseLiteral('September').Result;
        obj['oct'] = Strings_ParseLiteral('October').Result;
        obj['nov'] = Strings_ParseLiteral('November').Result;
        obj['dec'] = Strings_ParseLiteral('December').Result;
        obj['acmcs'] = Strings_ParseLiteral('ACM Computing Surveys').Result;
        obj['acta'] = Strings_ParseLiteral('Acta Informatica').Result;
        obj['cacm'] = Strings_ParseLiteral('Communications of the ACM').Result;
        obj['ibmjrd'] = Strings_ParseLiteral('IBM Journal of Research and Development').Result;
        obj['ibmsj'] = Strings_ParseLiteral('IBM Systems Journal').Result;
        obj['ieeese'] = Strings_ParseLiteral('IEEE Transactions on Software Engineering').Result;
        obj['ieeetc'] = Strings_ParseLiteral('IEEE Transactions on Computers').Result;
        obj['ieeetcad'] = Strings_ParseLiteral('IEEE Transactions on Computer-Aided Design of Integrated Circuits').Result;
        obj['ipl'] = Strings_ParseLiteral('Information Processing Letters').Result;
        obj['jacm'] = Strings_ParseLiteral('Journal of the ACM').Result;
        obj['jcss'] = Strings_ParseLiteral('Journal of Computer and System Sciences').Result;
        obj['scp'] = Strings_ParseLiteral('Science of Computer Programming').Result;
        obj['sicomp'] = Strings_ParseLiteral('SIAM Journal on Computing').Result;
        obj['tocs'] = Strings_ParseLiteral('ACM Transactions on Computer Systems').Result;
        obj['tods'] = Strings_ParseLiteral('ACM Transactions on Database Systems').Result;
        obj['tog'] = Strings_ParseLiteral('ACM Transactions on Graphics').Result;
        obj['toms'] = Strings_ParseLiteral('ACM Transactions on Mathematical Software').Result;
        obj['toois'] = Strings_ParseLiteral('ACM Transactions on Office Information Systems').Result;
        obj['toplas'] = Strings_ParseLiteral('ACM Transactions on Programming Languages and Systems').Result;
        obj['tcs'] = Strings_ParseLiteral('Theoretical Computer Science').Result;
        return obj;
    })(Helper.NewEmptyObject());
    return Styles_Plain;
}());

;"use strict";
var Styles_StandardStyleHelper = (function () {
    function Styles_StandardStyleHelper(abbrv) {
        this.CrossRefEditorFormat = ObjectModel_ParsePersonNameFormat('{vv~}{ll}');
        this.NameFormat = (abbrv
            ? Styles_Helper.NameFormat_fvvlljj
            : Styles_Helper.NameFormat_ffvvlljj);
        this.MonthNames = (abbrv
            ? Styles_Helper.MonthNamesShort
            : Styles_Helper.MonthNamesLong);
        Helper.FreezeObject(this);
    }
    Styles_StandardStyleHelper.prototype.format_names = function (people) {
        return Styles_Helper.format_names(this.NameFormat, people);
    };
    Styles_StandardStyleHelper.prototype.format_authors = function (entry) {
        return this.format_names(ObjectModel_ParsePersonNames(Styles_Helper.field(entry, 'author'))).Value;
    };
    Styles_StandardStyleHelper.prototype.format_editors = function (entry) {
        var formatted = this.format_names(ObjectModel_ParsePersonNames(Styles_Helper.field(entry, 'editor')));
        return (formatted.Count > 1
            ? formatted.Value + ', editors'
            : formatted.Count === 1
                ? formatted.Value + ', editor'
                : '');
    };
    Styles_StandardStyleHelper.prototype.format_title = function (entry) {
        return Styles_Helper.field(entry, 'title').Raw;
    };
    Styles_StandardStyleHelper.prototype.format_date = function (entry) {
        var year = Styles_Helper.field(entry, 'year').Raw;
        var month = Styles_Helper.field(entry, 'month').Raw;
        var monthNum = Styles_ResolveMonth(entry);
        if (monthNum != monthNum) {
            return month.length === 0 ? year : month + ' ' + year;
        }
        return (year.length !== 0
            ? this.MonthNames[monthNum] + ' ' + year
            : this.MonthNames[monthNum]);
    };
    Styles_StandardStyleHelper.prototype.format_btitle = function (entry) {
        return Styles_Helper.emph(Styles_Helper.field(entry, 'title').Raw);
    };
    Styles_StandardStyleHelper.prototype.format_bvolume = function (entry) {
        var volume = Styles_Helper.field(entry, 'volume').Raw;
        if (volume.length === 0) {
            return '';
        }
        var series = Styles_Helper.field(entry, 'series').Raw;
        return 'volume~' + volume + (series.length === 0
            ? ''
            : ' of ' + series);
    };
    Styles_StandardStyleHelper.prototype.format_number_series = function (entry, insentence) {
        var volume = Styles_Helper.field(entry, 'volume').Raw;
        if (volume.length !== 0) {
            return '';
        }
        var number = Styles_Helper.field(entry, 'number').Raw;
        var series = Styles_Helper.field(entry, 'series').Raw;
        if (number.length === 0) {
            return series;
        }
        return (insentence ? 'number~' : 'Number~') + number +
            (series.length !== 0 ? ' in ' + series : '');
    };
    Styles_StandardStyleHelper.prototype.format_edition = function (entry) {
        var edition = Styles_Helper.field(entry, 'edition').Raw;
        return edition.length !== 0 ? edition + ' edition' : '';
    };
    Styles_StandardStyleHelper.prototype.format_pages = function (entry) {
        var pages = Styles_Helper.field(entry, 'pages').Raw;
        if (pages.length === 0) {
            return '';
        }
        return (/[-,]/.test(pages)
            ? 'pages ' + Styles_Helper.n_dashify(pages)
            : 'page ' + pages);
    };
    Styles_StandardStyleHelper.prototype.format_vol_num_pages = function (entry) {
        var result = Styles_Helper.field(entry, 'volume').Raw;
        var number = Styles_Helper.field(entry, 'number').Raw;
        if (number.length !== 0) {
            result += '(' + number + ')';
        }
        var pages = Styles_Helper.field(entry, 'pages').Raw;
        if (pages.length !== 0) {
            result += ':';
            result += (/[-,]/.test(pages)
                ? Styles_Helper.n_dashify(pages)
                : pages);
        }
        return result;
    };
    Styles_StandardStyleHelper.prototype.format_chapter_pages = function (entry) {
        var chapter = Styles_Helper.field(entry, 'chapter').Raw;
        var pages = this.format_pages(entry);
        if (chapter.length === 0) {
            return pages;
        }
        var type = Styles_Helper.field(entry, 'type');
        var myType = (type.Raw.length === 0
            ? 'chapter' : type.ToLowerCase().Raw);
        return myType + ' ' + chapter +
            (pages.length !== 0 ? ', ' + pages : '');
    };
    Styles_StandardStyleHelper.prototype.format_in_ed_booktitle = function (entry) {
        var booktitle = Styles_Helper.field(entry, 'booktitle').Raw;
        if (booktitle.length === 0) {
            return '';
        }
        var editors = this.format_editors(entry);
        return 'In ' +
            (editors.length !== 0 ? editors + ', ' : '') +
            Styles_Helper.emph(booktitle);
    };
    Styles_StandardStyleHelper.prototype.format_thesis_type = function (entry, fallback) {
        var type = Styles_Helper.field(entry, 'type');
        var myType = (type.Raw.length === 0 ? fallback : type);
        return myType.ToTitleCase().Raw;
    };
    Styles_StandardStyleHelper.prototype.format_tr_number = function (entry) {
        var type = Styles_Helper.field(entry, 'type');
        var myType = (type.Raw.length === 0
            ? Styles_StandardStyleHelper.TRType
            : type);
        var number = Styles_Helper.field(entry, 'number').Raw;
        if (number.length === 0) {
            return myType.ToTitleCase().Raw;
        }
        return myType.Raw + '~' + number;
    };
    Styles_StandardStyleHelper.prototype.format_crossref_editor = function (entry) {
        var people = ObjectModel_ParsePersonNames(Styles_Helper.field(entry, 'editor'));
        var editors = [];
        var etal = false;
        for (var _i = 0, people_1 = people; _i < people_1.length; _i++) {
            var person = people_1[_i];
            if (person.IsEtal()) {
                etal = true;
                continue;
            }
            var name_1 = this.CrossRefEditorFormat.Format(person);
            if (name_1.length !== 0) {
                editors.push(name_1);
            }
        }
        if (editors.length === 0) {
            return '';
        }
        return (etal || editors.length > 2
            ? editors[0] + ' et~al.'
            : editors.length === 2
                ? editors[0] + ' and ' + editors[1]
                : editors[0]);
    };
    Styles_StandardStyleHelper.prototype.format_book_crossref = function (entry) {
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        var volume = Styles_Helper.field(entry, 'volume').Raw;
        var result = (volume.length !== 0
            ? 'Volume~' + volume + ' of' : 'In');
        var series = Styles_Helper.field(entry, 'series').Raw;
        if (series.length !== 0) {
            result += ' ' + Styles_Helper.emph(series);
        }
        else {
            var editors = this.format_crossref_editor(entry);
            if (editors.length !== 0) {
                result += ' ' + editors;
            }
        }
        result += '~\\cite{' + crossref + '}';
        return result;
    };
    Styles_StandardStyleHelper.prototype.format_incoll_inproc_crossref = function (entry) {
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        var booktitle = Styles_Helper.field(entry, 'booktitle').Raw;
        var result = 'In';
        if (booktitle.length !== 0) {
            result += ' ' + Styles_Helper.emph(booktitle);
        }
        else {
            var editors = this.format_crossref_editor(entry);
            if (editors.length !== 0) {
                result += ' ' + editors;
            }
        }
        result += '~\\cite{' + crossref + '}';
        return result;
    };
    Styles_StandardStyleHelper.prototype.thesis = function (entry, fallback) {
        var result = Styles_Helper.sentence(this.format_authors(entry));
        result += Styles_Helper.sentence(this.format_title(entry));
        result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(this.format_thesis_type(entry, fallback), Styles_Helper.field(entry, 'school').Raw), Styles_Helper.clause(Styles_Helper.field(entry, 'address').Raw, this.format_date(entry))));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyleHelper.MastersThesisType = Strings_ParseLiteral("{M}aster's thesis").Result;
    Styles_StandardStyleHelper.PhDThesisType = Strings_ParseLiteral('{P}h{D} thesis').Result;
    Styles_StandardStyleHelper.TRType = Strings_ParseLiteral('Technical Report').Result;
    return Styles_StandardStyleHelper;
}());
var Styles_StandardStyle = (function () {
    function Styles_StandardStyle(abbrv) {
        this.that = new Styles_StandardStyleHelper(abbrv);
        Helper.FreezeObject(this);
    }
    Styles_StandardStyle.prototype.article = function (entry) {
        var result = '';
        result += Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        if (crossref.length === 0) {
            var journal = Styles_Helper.emph(Styles_Helper.field(entry, 'journal').Raw);
            journal = Styles_Helper.clause(journal, this.that.format_vol_num_pages(entry));
            journal = Styles_Helper.clause(journal, this.that.format_date(entry));
            result += Styles_Helper.sentence(journal);
        }
        else {
            var journal = 'In';
            var jrnl = Styles_Helper.emph(Styles_Helper.field(entry, 'journal').Raw);
            if (jrnl.length !== 0) {
                journal += ' ' + jrnl;
            }
            journal += '~\\cite{' + crossref + '}';
            journal = Styles_Helper.clause(journal, this.that.format_pages(entry));
            result += Styles_Helper.sentence(journal);
        }
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.book = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry) ||
            this.that.format_editors(entry));
        result += Styles_Helper.sentence(this.that.format_btitle(entry));
        var crossrefPublisher = undefined;
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        if (crossref.length !== 0) {
            crossrefPublisher = this.that.format_book_crossref(entry);
        }
        else {
            result += Styles_Helper.sentence(this.that.format_bvolume(entry));
            result += Styles_Helper.sentence(this.that.format_number_series(entry, false));
            crossrefPublisher = Styles_Helper.clause(Styles_Helper.field(entry, 'publisher').Raw, Styles_Helper.field(entry, 'address').Raw);
        }
        result += Styles_Helper.sentence(Styles_Helper.clause(crossrefPublisher, Styles_Helper.clause(this.that.format_edition(entry), this.that.format_date(entry))));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.booklet = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        var howpublishedAddress = Styles_Helper.sentence(Styles_Helper.field(entry, 'howpublished').Raw) +
            Styles_Helper.sentence(Styles_Helper.field(entry, 'address').Raw);
        if (howpublishedAddress.length !== 0) {
            result += Styles_Helper.sentence(this.that.format_title(entry));
            result += howpublishedAddress;
            result += Styles_Helper.sentence(this.that.format_date(entry));
        }
        else {
            result += Styles_Helper.sentence(Styles_Helper.clause(this.that.format_title(entry), this.that.format_date(entry)));
        }
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.inbook = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry) ||
            this.that.format_editors(entry));
        var crossrefAddr = undefined;
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        if (crossref.length !== 0) {
            result += Styles_Helper.sentence(Styles_Helper.clause(this.that.format_btitle(entry), this.that.format_chapter_pages(entry)));
            crossrefAddr = this.that.format_book_crossref(entry);
        }
        else {
            result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(this.that.format_btitle(entry), this.that.format_bvolume(entry)), this.that.format_chapter_pages(entry)));
            result += Styles_Helper.sentence(this.that.format_number_series(entry, false));
            crossrefAddr = Styles_Helper.clause(Styles_Helper.field(entry, 'howpublished').Raw, Styles_Helper.field(entry, 'address').Raw);
        }
        result += Styles_Helper.sentence(Styles_Helper.clause(crossrefAddr, Styles_Helper.clause(this.that.format_edition(entry), this.that.format_date(entry))));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.incollection = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        if (crossref.length !== 0) {
            result += Styles_Helper.sentence(Styles_Helper.clause(this.that.format_incoll_inproc_crossref(entry), this.that.format_chapter_pages(entry)));
        }
        else {
            var clause1 = Styles_Helper.clause(this.that.format_in_ed_booktitle(entry), this.that.format_bvolume(entry));
            var clause2 = Styles_Helper.clause(this.that.format_number_series(entry, clause1.length === 0), this.that.format_chapter_pages(entry));
            result += Styles_Helper.sentence(Styles_Helper.clause(clause1, clause2));
            result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(Styles_Helper.field(entry, 'howpublished').Raw, Styles_Helper.field(entry, 'address').Raw), Styles_Helper.clause(this.that.format_edition(entry), this.that.format_date(entry))));
        }
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.inproceedings = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        var crossref = Styles_Helper.field(entry, 'crossref').Raw;
        if (crossref.length !== 0) {
            result += Styles_Helper.sentence(Styles_Helper.clause(this.that.format_incoll_inproc_crossref(entry), this.that.format_pages(entry)));
        }
        else {
            var clause1 = Styles_Helper.clause(this.that.format_in_ed_booktitle(entry), this.that.format_bvolume(entry));
            var clause2 = Styles_Helper.clause(this.that.format_number_series(entry, clause1.length === 0), this.that.format_pages(entry));
            var clause12 = Styles_Helper.clause(clause1, clause2);
            var orgpub = Styles_Helper.clause(Styles_Helper.field(entry, 'organization').Raw, Styles_Helper.field(entry, 'publisher').Raw);
            var date = this.that.format_date(entry);
            var address = Styles_Helper.field(entry, 'address').Raw;
            if (address.length !== 0) {
                result += Styles_Helper.sentence(Styles_Helper.clause(clause12, Styles_Helper.clause(address, date)));
                result += Styles_Helper.sentence(orgpub);
            }
            else if (orgpub.length !== 0) {
                result += Styles_Helper.sentence(clause12);
                result += Styles_Helper.sentence(Styles_Helper.clause(orgpub, date));
            }
            else {
                result += Styles_Helper.sentence(Styles_Helper.clause(clause12, date));
            }
        }
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.conference = function (entry) {
        return this.inproceedings(entry);
    };
    Styles_StandardStyle.prototype.manual = function (entry) {
        var authors = this.that.format_authors(entry);
        var org = Styles_Helper.field(entry, 'organization').Raw;
        var addr = Styles_Helper.field(entry, 'address').Raw;
        var result = Styles_Helper.sentence(authors);
        if (authors.length === 0 && org.length !== 0) {
            result = Styles_Helper.sentence(Styles_Helper.clause(org, addr));
        }
        var midsentence = this.that.format_btitle(entry);
        if (authors.length === 0) {
            if (org.length === 0) {
                midsentence = Styles_Helper.clause(midsentence, addr);
            }
        }
        else if (org.length !== 0 || addr.length !== 0) {
            result += Styles_Helper.sentence(midsentence);
            midsentence = Styles_Helper.clause(org, addr);
        }
        midsentence = Styles_Helper.clause(midsentence, this.that.format_edition(entry));
        midsentence = Styles_Helper.clause(midsentence, this.that.format_date(entry));
        result += Styles_Helper.sentence(midsentence);
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.mastersthesis = function (entry) {
        return this.that.thesis(entry, Styles_StandardStyleHelper.MastersThesisType);
    };
    Styles_StandardStyle.prototype.misc = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.field(entry, 'howpublished').Raw, this.that.format_date(entry)));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.phdthesis = function (entry) {
        return this.that.thesis(entry, Styles_StandardStyleHelper.PhDThesisType);
    };
    Styles_StandardStyle.prototype.proceedings = function (entry) {
        var editors = this.that.format_editors(entry);
        var org = Styles_Helper.field(entry, 'organization').Raw;
        var result = Styles_Helper.sentence(editors || org);
        var btbv = Styles_Helper.clause(this.that.format_btitle(entry), this.that.format_bvolume(entry));
        var ns = this.that.format_number_series(entry, btbv.length === 0);
        var addr = Styles_Helper.field(entry, 'address').Raw;
        var date = this.that.format_date(entry);
        var pub = Styles_Helper.field(entry, 'publisher').Raw;
        if (addr.length !== 0) {
            result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(btbv, ns), Styles_Helper.clause(addr, date)));
            result += Styles_Helper.sentence(Styles_Helper.clause(editors.length !== 0 ? org : '', pub));
        }
        else {
            var orgpub = (editors.length === 0
                ? Styles_Helper.clause(org, pub)
                : pub);
            result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(btbv, ns), Styles_Helper.clause(orgpub, date)));
        }
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.techreport = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        result += Styles_Helper.sentence(Styles_Helper.clause(Styles_Helper.clause(this.that.format_tr_number(entry), Styles_Helper.field(entry, 'institution').Raw), Styles_Helper.clause(Styles_Helper.field(entry, 'address').Raw, this.that.format_date(entry))));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.prototype.unpublished = function (entry) {
        var result = Styles_Helper.sentence(this.that.format_authors(entry));
        result += Styles_Helper.sentence(this.that.format_title(entry));
        result += Styles_Helper.sentence(this.that.format_date(entry));
        result += Styles_Helper.sentence(Styles_Helper.field(entry, 'note').Raw);
        return result;
    };
    Styles_StandardStyle.Plain = new Styles_StandardStyle(false);
    Styles_StandardStyle.Alpha = new Styles_StandardStyle(false);
    Styles_StandardStyle.Abbrv = new Styles_StandardStyle(true);
    Styles_StandardStyle.EntryTypes = ['article', 'book',
        'booklet', 'inbook', 'incollection', 'inproceedings',
        'conference', 'manual', 'mastersthesis', 'misc',
        'phdthesis', 'proceedings', 'techreport', 'unpublished'];
    return Styles_StandardStyle;
}());

;"use strict";
function Styles_ResolveYear(entry) {
    if (!(entry instanceof ObjectModel_Entry)) {
        return Number.NaN;
    }
    var yearField = entry.Fields['year'];
    if (yearField === undefined) {
        return Number.NaN;
    }
    var yearString = yearField.PurifiedPedantic.
        replace(/ /g, '').
        replace(/[A-Z]+/g, function (x) { return x.toLowerCase(); });
    {
        var rgx = /^[+-]?[0-9]{1,6}$/;
        var match = rgx.exec(yearString);
        if (match) {
            return parseInt(yearString);
        }
    }
    {
        var rgx = /^((b\.?c\.?(e\.?)?)|(c\.?e\.?|a\.?d\.?)),?([0-9]{1,6})$/;
        var match = rgx.exec(yearString);
        if (match) {
            return (match[2] ? -1 : 1) * parseInt(match[5]);
        }
    }
    {
        var rgx = /^([0-9]{1,6}),?((b\.?c\.?(e\.?)?)|(c\.?e\.?|a\.?d\.?))$/;
        var match = rgx.exec(yearString);
        if (match) {
            return (match[3] ? -1 : 1) * parseInt(match[1]);
        }
    }
    return Number.NaN;
}
var Styles_MonthTranslator = [
    [],
    ['01', 'jan', 'jan.', '1', 'january'],
    ['02', 'feb', 'feb.', '2', 'february'],
    ['03', 'mar', 'mar.', '3', 'march'],
    ['04', 'apr', 'apr.', '4', 'april'],
    ['05', 'may', '5'],
    ['06', 'jun', 'jun.', '6', 'june'],
    ['07', 'jul', 'jul.', '7', 'july'],
    ['08', 'aug', 'aug.', '8', 'august'],
    ['09', 'sep', 'sep.', '9', 'sept', 'sept.', 'september'],
    ['10', 'oct', 'oct.', 'october'],
    ['11', 'nov', 'nov.', 'november'],
    ['12', 'dec', 'dec.', 'december'],
];
function Styles_ResolveMonth(entry) {
    if (!(entry instanceof ObjectModel_Entry)) {
        return Number.NaN;
    }
    var monthField = entry.Fields['month'];
    if (monthField === undefined) {
        return Number.NaN;
    }
    var monthString = monthField.PurifiedPedantic.replace(/ /g, '').toLowerCase();
    for (var i = 1; i !== 13; ++i) {
        if (Styles_MonthTranslator[i].indexOf(monthString) >= 0) {
            return i;
        }
    }
    return Number.NaN;
}
ExportBibTeX.Styles = (function (ns) {
    ns.ResolveYear = Styles_ResolveYear;
    ns.ResolveMonth = Styles_ResolveMonth;
    ns.Alpha = Styles_Alpha;
    ns.Plain = Styles_Plain;
    ns.Abbrv = Styles_Abbrv;
    return ns;
})(Helper.NewEmptyObject());
ExportBibTeX._Privates.Styles = (function (ns) {
    ns.ResolveYear = Styles_ResolveYear;
    ns.ResolveMonth = Styles_ResolveMonth;
    ns.Helper = Styles_Helper;
    ns.StandardStyleHelper = Styles_StandardStyleHelper;
    ns.StandardStyle = Styles_StandardStyle;
    ns.AlphaImpl = Styles_AlphaImpl;
    ns.Alpha = Styles_Alpha;
    ns.PlainImpl = Styles_PlainImpl;
    ns.Plain = Styles_Plain;
    ns.AbbrvImpl = Styles_AbbrvImpl;
    ns.Abbrv = Styles_Abbrv;
    return ns;
})(Helper.NewEmptyObject());

/* Styles @@ */

Helper.FreezeDescendants(ExportBibTeX);
Helper.FreezeObject(ExportBibTeX);

if (typeof module !== 'undefined' && typeof exports === 'object')
{
    module.exports = ExportBibTeX;
}
else if (typeof define === 'function' && define.amd)
{
    define(function() { return ExportBibTeX; });
}
else
{
    this.BibTeX = ExportBibTeX;
}
      
}).call((function ()
{
    return this || (typeof window !== 'undefined' ? window : global);
})());
