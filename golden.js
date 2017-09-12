// Golden

var cssContent = "\
body {\
 margin: 0; border: 0; padding: 0;\
 font-family: 'Open Sans', 'lucida grande', Arial, Verdana, sans-serif;\
 font-size: 13px;\
}\
#title {\
 border-bottom: 1px solid #bbb;\
 padding: 1ex 1em;\
}\
h1 {\
 font-size: 15px;\
}\
h2 {\
 margin: 0;\
 font-size: 13px;\
 margin-left: 1em;\
 color: #999;\
}\
#message {\
 margin: 1ex 1em;\
}\
table {\
 width: 100%;\
 border-collapse: collapse;\
 margin: 0 0 7ex;\
}\
tr:hover {\
 background: #9cf;\
}\
td {\
 font-size: 15px;\
 padding: 0.5ex 1em;\
 }\
a {\
 text-decoration: none;\
 color: inherit;\
}\
\
.notsel {\
}\
.sel {\
 background: #39f;\
 color: #fff;\
}\
#btns {\
 position: fixed;\
 bottom: 0;\
 width: 100%;\
 margin: 0;\
 padding: 1ex 0em;\
 border-top: 1px solid #bbb;\
 background: white;\
 text-align: right;\
 }\
#chooseBtn, #cancelBtn {\
 display: inline-block;\
 margin: 1ex 1em 1ex 0.5em;\
 border: 1px solid #bbb;\
 border-radius: 3px;\
 padding: 1ex 1em;\
}\
\
#cancelBtn {\
 color: #333;\
}\
#cancelBtn:hover {\
 background: #aaa;\
 color: black;\
 border: 1px solid #000;\
}\
\
#chooseBtn {\
 color: white;\
}\
.btnDisabled, .btnDisabled:hover {\
 background: #ccc;\
 color: white;\
}\
.btnEnabled {\
 background: #9cf;\
}\
.btnEnabled:hover {\
 background: #39f;\
 border: 1px solid #000;\
}\
";

//----------------------------------------------------------------
// HTML utility function (from section 15.8.1 of "JavaScript: The
// Definitive Guide", 5th edition.

function make(doc, tagname, attributes, children) {
    // If we were invoked with two arguments, the attributes argument is
    // an array or string; it should really be the children arguments.
    if (arguments.length == 2 &&
        (attributes instanceof Array || typeof attributes == "string")) {
        children = attributes;
        attributes = null;
    }

    // Create the element
    var e = doc.createElement(tagname);

    // Set attributes
    if (attributes) {
        for (var name in attributes)
            e.setAttribute(name, attributes[name]);
    }
    // Add children, if any were specified.
    if (children != null) {
        if (children instanceof Array) {  // If it really is an array
            for (var i = 0; i < children.length; i++) { // Loop through kids
                var child = children[i];
                if (typeof child == "string")          // Handle text nodes
                    child = doc.createTextNode(child);
                e.appendChild(child);  // Assume anything else is a Node
            }
        }
        else if (typeof children == "string") // Handle single text child
            e.appendChild(doc.createTextNode(children));
        else e.appendChild(children);
        // Finally, return the element.
        return e;
    }
}

function maker(doc, tag) {
    return function (attrs, kids) {
        if (arguments.length == 1)
            return make(doc, tag, attrs);
        else
            return make(doc, tag, attrs, kids);
    }
}

//----------------------------------------------------------------
// Parse URL query parameters

var urlParams;

(window.onpopstate = function () {
    var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) {
            return decodeURIComponent(s.replace(pl, " "));
        },
        query = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
        urlParams[decode(match[1])] = decode(match[2]);
})();

//----------------------------------------------------------------

function parseTitle(hiddenDiv) {

    var h1_tags = hiddenDiv.getElementsByTagName('H1');

    if (0 < h1_tags.length) {
        return h1_tags[0].innerText;
    } else {
        return null;
    }
}

function parseItems(hiddenDiv) {
    var items = [];

    var anchors = hiddenDiv.getElementsByTagName('a');
    for (var i = 0, len = anchors.length; i < len; i++) {
        var anchor = anchors[i];
        var filesize = null;
        var date = null;

        var p = anchor.parentNode;
        if (p.nodeName == 'TD') {
            var pp = p.parentNode;
            if (pp.nodeName == 'TR') {
                var children = pp.childNodes;
                for (var j = 0, len2 = children.length; j < len2; j++) {
                    var n = children[j];
                    if (n.nodeType == 1 && n.nodeName == 'TD') {
                        if (n.className == "colsize") {
                            filesize = n.innerText;
                        } else if (n.className == "coldate") {
                            date = n.innerText;
                        }
                    }
                }
            }
        }

        items.push([
            anchor.getAttribute("href"),
            anchor.innerText,
            filesize,
            date
        ]);
    }

    return items;
}

//----------------------------------------------------------------

function handlePage(options, win, doc, contents) {

    // Create a hidden DIV to parse the HTML into a DOM

    var hiddenDiv = doc.createElement("div");
    hiddenDiv.setAttribute("style", 'display: none');
    hiddenDiv.innerHTML = contents;

    // Parse information from document

    var pageTitle = parseTitle(hiddenDiv);
    var items = parseItems(hiddenDiv);

    if ((! options.hideSubtitle) && pageTitle != "") {
        doc.getElementById("subtitle").innerHTML = pageTitle;
    }
    doc.getElementById("message").innerHTML = "";

    // Map to track selected items

    var selected = new Map();

    var chooseBtn = doc.getElementById("chooseBtn");

    // Produce new links

    var table = maker(doc, "table");
    var tr = maker(doc, "tr");
    var td = maker(doc, "td");
    var a = maker(doc, "a");

    if (0 < items.length) {
        // Parser found some links: produce table

        var theTable = table(null, []);

        for (var i = 0, len = items.length; i < len; i++) {
            var item = items[i];
            var url = item[0];
            var text = item[1];
            var size = item[2]
            var date = item[3];

            if (! text) {
                text = "untitled";
            }
            if (! size) {
                size = '';
            }
            if (! date) {
                date = '';
            }

            var row = tr(null, [
                td(null, [a({href: url}, text)]),
                td(null, [size]),
                td(null, [date]),
            ]);
            row.url = url;

            row.onclick = function(event) {
                var url = this.url;
                //console.log(url);

                if (! selected.has(url)) {
                    selected.set(url, 1);
                    this.className = "sel";
                } else {
                    selected.delete(url);
                    this.setAttribute("class", "notSel");
                }

                if (selected.size == 0) {
                    chooseBtn.className = "btnDisabled";
                    chooseBtn.onclick = null;
                } else {
                    chooseBtn.className = "btnEnabled";
                    chooseBtn.onclick = function() {
                        win.close();
                        if (options.success) {
                            var results = [];
                            for (var k of selected.keys()) {
                                results.push(k);
                            }
                            options.success(results); // callback
                        }
                    };
                }
                return false;
            };

            theTable.appendChild(row);
        }

        doc.getElementById("contents").appendChild(theTable);

    } else {
        // Parser failed to find any links
        doc.getElementById("message").innerHTML = "No links found.";
    }
}

//----------------

function handleError(options, xreq, doc) {
    var message = xreq.statusText;
    if (message == null || message == "") {
        message = "HTTP status " + xreq.status;
    }
    doc.getElementById("message").innerHTML =
        "Error: could not load links: " + message;
}

//----------------------------------------------------------------

//function pageListener() {
//    if (this.status != 200) {
//      document.getElementById("contents").innerHTML = "Error: " + this.statusText;
//      return;
//    }
//    document.getElementById("contents").innerHTML = this.response;
//}

function initiateLoad(options, win, doc) {
    // Create an XMLHttpRequest object

    var xreq;
    if (window.XMLHttpRequest) { // for IE7+, Firefox, Chrome, Opera, Safari
        xreq = new XMLHttpRequest();
    } else { // for IE6, IE5
        xreq = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xreq.onreadystatechange = function () {
        if (xreq.readyState == 4) {  // Request is finished
            if (xreq.status == 200) {
                handlePage(options, win, doc, xreq.response);
                // Note: cannot use xreq.responseXML() because the
                // MIME type is incorrectly set to "text/plain" on XML
                // content from OpenStack Swift Object Store.
            } else {
                handleError(options, xreq, doc);
            }
        }
    }

    xreq.open("GET", options.src, true);
    xreq.send(null);
}

//----------------------------------------------------------------

function auChooser(options) {
    var titleStr;
    var src;
    if (options) {
        titleStr = options["title"];
        src = options["src"];
    }

    var win = window.open("about:blank", "_blank",
        'width=640,height=530,status=yes,resizable=yes,scrollbars=yes', true);

    var doc = win.document;

    // Create the initial contents

    var style = maker(doc, "style");
    var title = maker(doc, "title");
    var h1 = maker(doc, "h1");
    var h2 = maker(doc, "h2");
    var div = maker(doc, "div");
    var p = maker(doc, "p");
    var a = maker(doc, "a");

    if (!titleStr)
        titleStr = "Chooser";

    var head = doc.documentElement.getElementsByTagName('head')[0];
    var body = doc.documentElement.getElementsByTagName('body')[0];
    //var body = doc.documentElement.lastChild;

    head.appendChild(style({type: 'text/css'}, cssContent));
    head.appendChild(title(null, "Choose files to download"));

    var msg = p({id: "message"}, []);

    body.appendChild(
        div(null, [
            div({id: "title"}, [
                h1(null, titleStr),
                h2({id: "subtitle"}, ''),
            ]),
            div({id: "contents"}, [
                msg,
            ]),
            div({id: "btns"}, [
                a({id: "chooseBtn", class: "btnDisabled"}, "Choose"),
                a({id: "cancelBtn"}, "Cancel"),
            ]),
        ])
    );

    doc.getElementById("cancelBtn").onclick = function() {
        win.close();
        if (options.cancel) {
            options.cancel(); // invoke callback
        }
    }

    // Load the source

    if (src) {
        msg.innerHTML = "Loading...";
        initiateLoad(options, win, doc);
    } else {
        msg.innerHTML = "Internal error: source not specified.";
    }
}

//EOF
