/* Polyfills classList.contains/add/remove. */
(function (htm)
{
    var hasClassForward = function (element, theClass)
    {
        return element.classList.contains(theClass);
    };
    var addClassForward = function (element, theClass)
    {
        return element.classList.add(theClass);
    };
    var removeClassForward = function (element, theClass)
    {
        return element.classList.remove(theClass);
    };
    var hasClassShim = function (element, theClass)
    {
        var currentClasses = element.className || '';
        var paddedClasses = ' ' + currentClasses + ' ';
        return paddedClasses.indexOf(' ' + theClass + ' ') >= 0;
    };
    var addClassShim  = function (element, theClass)
    {
        var currentClasses = element.className || '';
        var paddedClasses = ' ' + currentClasses + ' ';
        if (paddedClasses.indexOf(' ' + theClass + ' ') < 0)
        {
            element.className = currentClasses + ' ' + theClass;
        }
    };
    var removeClassShim = function (element, theClass)
    {
        var currentClasses = element.className || '';
        var paddedClasses = ' ' + currentClasses + ' ';
        theClass = ' ' + theClass + ' ';
        var replacedClasses = paddedClasses.replace(theClass, ' ');
        while (replacedClasses != paddedClasses)
        {
            paddedClasses = replacedClasses;
            replacedClasses = paddedClasses.replace(theClass, ' ');
        }
        element.className = replacedClasses;
    };
    window.GLHasClass = (htm.classList && htm.classList.contains
        ? hasClassForward
        : hasClassShim);
    window.GLAddClass = (htm.classList && htm.classList.add
        ? addClassForward
        : addClassShim);
    window.GLRemoveClass = (htm.classList && htm.classList.remove
        ? removeClassForward
        : removeClassShim);
})(document.documentElement);

/* Adds an event listener.
**  target: [required] The target element.
**   event: [required] E.g., 'hashchange'.
** handler: [required] The handler.
** options: [optional] Options for `addEventListener`.
**
** If the event is attached, returns a function to detach the event.
** Otherwise, Boolean value false is returned.
*/
window.GLAddEventListenerHelper = function (target, event, handler, options)
{
    if (target.addEventListener)
    {
        target.addEventListener(event, handler, options);
        return (function ()
        {
            target.removeEventListener(event, handle, options);
        });
    }
    if (target.attachEvent)
    {
        target.attachEvent('on' + event, handler);
        return (function ()
        {
            target.detachEvent('on' + event, handler);
        });
    }
    return false;
};

/* Uses the browser's scroll functionality. */
window.GLScrollIntoViewWithValues = function (element,
    nowTop, nowLeft, nowBottom, nowRight,
    viewHeight, viewWidth)
{
    if (nowTop < 0 || nowLeft < 0)
    {
        element.scrollIntoView(true);
    }
    else if (nowBottom > viewHeight || nowRight > viewWidth)
    {
        element.scrollIntoView(false);
    }
};

/* Compatibility shim. */
window.GLScrollIntoView = function (element)
{
    var boundingRect = element.getBoundingClientRect();
    window.GLScrollIntoViewWithValues(element,
        boundingRect.top, boundingRect.left,
        boundingRect.bottom, boundingRect.right,
        window.innerHeight, window.innerWidth);
};

/* Some browsers use <body> to scroll the document
** while some other use <html>.
*/
(function (cachedScrlElem, cachedBodyWrapper)
{
    var isScrollable = function (elem)
    {
        if (!elem)
        {
            return false;
        }
        if (window.getComputedStyle)
        {
            return window.getComputedStyle(elem).overflowY == 'visible';
        }
        return elem.currentStyle.overflowY == 'visible';
    };
    window.GLVerticalScroll = function (byAmount)
    {
        cachedScrlElem = (cachedScrlElem
            || document.scrollingElement
            || (document.body && document.body.scrollTop > 0
                ? document.body
                : document.documentElement.scrollTop > 0
                ? document.documentElement
                : undefined));
        if (isScrollable(cachedScrlElem))
        {
            cachedScrlElem.scrollTop += byAmount;
            return;
        }
        if (isScrollable(document.body))
        {
            document.body.scrollTop += byAmount;
        }
        if (isScrollable(document.documentElement))
        {
            document.documentElement.scrollTop += byAmount;
        }
    };
})();

window.GLResolveBringIntoViewRect = function (element)
{
    var altTarget = element.getAttribute('gl-bringintoviewnicely-union');
    if (altTarget)
    {
        altTarget = document.getElementById(altTarget);
    }
    var boundingRect = element.getBoundingClientRect();
    var altBoundingRect = (altTarget
        ? altTarget.getBoundingClientRect()
        : boundingRect);
    return {
        top: Math.min(boundingRect.top, altBoundingRect.top),
        left: Math.min(boundingRect.left, altBoundingRect.left),
        bottom: Math.max(boundingRect.bottom, altBoundingRect.bottom),
        right: Math.max(boundingRect.right, altBoundingRect.right)
    };
}

/* Scrolls an element into the view with nice placement.
** element: [required]
**          The element to be brought into view.
*/
window.GLBringIntoViewNicely = function (element)
{
    var boundingRect = GLResolveBringIntoViewRect(element);
    var nowTop = boundingRect.top;
    var nowBottom = boundingRect.bottom;
    var viewHeight = window.innerHeight;
    nowBottom = Math.min(nowTop + viewHeight, nowBottom);
    window.GLVerticalScroll((nowTop + nowBottom - viewHeight) / 2);
    return;
};

window.GLBringIntoViewNicelyLater = function (element)
{
    window.setTimeout(function ()
    {
        window.GLBringIntoViewNicely(element);
    }, 0);
};

/* Gets the position of an element's top-left corner
** relative to the viewport.
** element: [required] The element of interest.
** Returns { top: 1, left: 1 }.
*/
window.GLGetViewportPos = function (element)
{
    var boundingRect = element.getBoundingClientRect();
    return { top: boundingRect.top, left: boundingRect.left };
};

/* Sets the position of an element's top-left corner
** to the specified position relative to the viewport.
** element: [required] The element to be moved.
**   point: [required] { top: 1, left: 1 }.
*/
window.GLSetViewportPos = function (element, point)
{
    var boundingRect = element.getBoundingClientRect();
    var nowTop = boundingRect.top;
    if (point.top != null)
    {
        window.GLVerticalScroll(nowTop - point.top);
    }
};

/* Handles hash change event. */
window.GLHashHandler = new (function ()
{
    var lastSeenHash = '*';
    var pretendHashChange = false;
    var HandleHashChange = function ()
    {
        var target = location.hash || '*';
        var oldHash = lastSeenHash;
        lastSeenHash = target;
        /* Abort when there is no actual change. */
        if (!pretendHashChange && oldHash == target)
        {
            return;
        }
        var elem = document.getElementById(target.substring(1));
        if (elem == null)
        {
            return;
        }
        /* Scroll the element into view after the browser
        ** finishes its own placement job.
        */
        window.GLBringIntoViewNicelyLater(elem);
        /* Force replaying the blinking animation. */
        if (!window.GLHasClass(elem, 'gl-reset-animations'))
        {
            window.GLAddClass(elem, 'gl-reset-animations');
            window.setTimeout(function ()
            {
                window.GLRemoveClass(elem, 'gl-reset-animations');
            }, 5);
        }
    };
    var PretendHashChange = function (newValue)
    {
        var oldValue = pretendHashChange;
        pretendHashChange = newValue;
        return oldValue;
    };
    this.HandleHashChange = HandleHashChange;
    this.PretendHashChange = PretendHashChange;
});

window.GLBookmarkHashHandler = new (function ()
{
    var hashHandler = window.GLHashHandler;
    var HandleBookmarkClick = function (target)
    {
        var evt = target || window.event;
        target = evt.target || evt.srcElement;
        for (; target != null && !target.hasAttribute('href');
            target = target.parentElement)
            ;
        if (target == null || !target.hasAttribute('href'))
        {
            return;
        }
        target = target.getAttribute('href');
        if (target[0] == '#' && location.hash == target)
        {
            var oldValue = hashHandler.PretendHashChange(true);
            hashHandler.HandleHashChange();
            hashHandler.PretendHashChange(oldValue);
        }
    };
    this.HandleBookmarkClick = HandleBookmarkClick;
});

/* Handles a bookmark link.
** When JavaScript is enabled, we make sure
** the targeted element blinks and is placed
** close to the center of the viewport.
*/
window.GLHandleBookmarkJumps = function ()
{
    var hashHandler = window.GLHashHandler;
    var bkmkHander = window.GLBookmarkHashHandler;
    window.GLAddEventListenerHelper(window, 'hashchange', function ()
    {
        hashHandler.HandleHashChange();
    }, true);
    window.GLAddEventListenerHelper(document, 'click', function (e)
    {
        bkmkHander.HandleBookmarkClick(e);
    }, true);
    window.GLAddClass(document.body, 'gl-targeted-animation');
    /* When the page is first navigated to,
    ** Microsoft Edge will need another knock.
    ** All browsers work fine when refreshed.
    */
    window.setTimeout(function ()
    {
        var oldValue = hashHandler.PretendHashChange(true);
        hashHandler.HandleHashChange();
        hashHandler.PretendHashChange(oldValue);
    }, 100);
};

/* When all resources are loaded, enable these functionalities. */
window.GLFinishLoading = function ()
{
    window.GLHandleBookmarkJumps();
};
