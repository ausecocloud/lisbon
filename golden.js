// Golden

//----------------------------------------------------------------
// Parse URL query parameters

var urlParams;

(window.onpopstate = function () {
    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

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
	items.push([
	    anchor.getAttribute("href"),
	    anchor.innerText
	]);
    }

    return items;
}

//----------------------------------------------------------------

function handleError(xreq) {
    document.getElementById("links").innerHTML = "Error: " + xreq.statusText;
}

function handlePage(contents) {

    // Create a hidden DIV to parse the HTML into a DOM
    
    var hiddenDiv = document.createElement("div");
    hiddenDiv.setAttribute("style", 'background:yellow; max-height: 10ex; overflow: scroll'); // for debugging
    hiddenDiv.setAttribute("style", 'display: none');
    document.getElementById("links").appendChild(hiddenDiv);

    hiddenDiv.innerHTML = contents;

    // Parse information from document
    
    var pageTitle = parseTitle(hiddenDiv);
    var items = parseItems(hiddenDiv);

    message = document.createTextNode("Loading done: " + pageTitle);

    // Produce new links

    var dest = urlParams["dest"];
    
    if (0 < items.length) {
	for (var i = 0, len = items.length; i < len; i++) {
	    var item = items[i];
	    var url = item[0];
	    var text = item[1];

	    if (dest != null) {
		url = dest + '?url=' + url;
	    }
	    
	    var p = document.createElement("p");
	    
	    var a = document.createElement("a");
	    a.setAttribute("href", url);
	    a.innerText = text;
	    
	    p.appendChild(a);
	    document.getElementById("links").appendChild(p);
	}	
    } else {
	document.getElementById("links").appendChild("no links");
    }
    
    document.getElementById("links").appendChild(message);
}

//----------------------------------------------------------------
// The onload method for the page

function au_chooser_onload() {

    // Set the page title, if one is provided
    
    title = urlParams["title"];
    if (title != null) {
        document.getElementById("title").innerHTML = title;
    }

    // Load the links page
    
    dataurl = urlParams["src"];

    if (dataurl == null) {
	// No URL to load: abort
	document.getElementById("links").innerHTML = "No source to display.";
	return;
    }
    
    document.getElementById("links").innerHTML = "Loading...";


    // Create an XMLHttpRequest object
    
    var xreq;
    if (window.XMLHttpRequest) { // IE7+, Firefox, Chrome, Opera, Safari
	xreq = new XMLHttpRequest();
    }
    else { // code for IE6, IE5
	xreq = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xreq.onreadystatechange = function() {
        if (xreq.readyState == 4) {  // Request is finished
	    if (xreq.status == 200) {
		handlePage(xreq.response);
		// Note: cannot use xreq.responseXML() because the
		// MIME type is incorrectly set to "text/plain" on XML
		// content from OpenStack Swift Object Store.
	    } else {
		handleError(xreq);
	    }
	}
    }

    xreq.open("GET", dataurl, true);
    xreq.send(null);
}

// Handler for links page

function pageListener() {
    if (this.status != 200) {
    	document.getElementById("links").innerHTML = "Error: " + this.statusText;
	return;
    }
    document.getElementById("links").innerHTML = this.response;
}

//EOF
