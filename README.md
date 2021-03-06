# Lisbon

JavaScript chooser to select URLs.

## Chooser

Presents a list of items for the user to chooser from. The URLs of the
selected items are provided in a successful callback function. The
items to display are obtained from a source document.

The source document can be any HTML document, where the items are the
hyperlinks in it. This works with arbitrary HTML documents, as well as
the default HTML listing of Swift Object Store containers (in which
case it recognises the size and timestamp). Note: the HTML listing
feature must be explicitly enabled in the Swift Object Store container
for it to produce a HTML listing.

The source can also be a Swift Object Store listing XML document. But,
for this to work the Swift container _must_ be enabled to support
Cross-Origin Resource Sharing (CORS).

```
var options = {
  src: "https://www.example.com/data-listing.html",
  headers: {
    'x-auth-token': 'foobar'
  },
  isXML: false,
  title: "My chooser",
  showSubtitle: true,
  success: function (items) {
    // items is an array of one or more 'items' representing data about swift objects chosen.
    // An item hase the following fields:
    //    url: url to download object
    //    name: object name (includes full path as it is part of the name)
    //    bytes: object size in bytes (may be null)
    //    size: human readable object size
    //    date: last modified date
    //    selected: boolean whether this item has been selected by the user (alway true)
  },
  cancel: function () {
    // chooser cancelled
  }
};

var c = new Lisbon.Chooser(options);
c.run();
```

Important: if used on a button or link's _onclick_ method, also
"`return false`" to cancel the default action, otherwise the Chooser
will not function correctly. For example,

```
<input type="button"
 onclick="new LisbonChooser({src: 'https://swift.example.org/v1/x/y', isXML: true}).run(); return false;" />
```

The options can contain:

- `src` - URL to download for links (mandatory)
- `headers` - dictionary of additional HTTP request headers (default: null)
- `isXML` - source URL is to an OpenStack Swift XML listing (default: false)
- `title` - title to display
- `showSubtitle` - show the source page's H1 as the subtitle (default: true)
- `success` - function to invoke if user selects one or more items.
- `cancel` - function to invoke if user cancels the chooser.

Additional HTTP request headers can be provided in the `headers`
member.  It must be a dictionary where the keys are the header names
and the values are either single strings or an array of strings
(producing a single header or multiple headers with the same name,
respectively).

Setting `isXML` to true is equivalent to adding a HTTP request
"Accept" header with the value of "text/xml". If the `headers` already
contains an "Accept" header, `isXML` should not be used. If set, it is
ignored (i.e. the explicitly provided "Accept" header is used).

## Known issues

### Cross-origin HTTP requests

Browsers may prevent the Chooser from downloading source documents
from a different origin from where the Chooser is deployed.

This usually results in the Chooser showing an error message that
says, "Error: could not get source page". The problem can be confirmed
by messages in the Browser's JavaScript console.

This can be triggered by the source being on a different domain,
protocol (e.g. HTTP vs HTTPS) or port number -- or simply requesting
XML when _isXML_ is set to true.

If this is a problem, the _server_ needs to be configured to allow
Cross-Origin Resource Sharing to work (assuming you have the ability
to do that). The Chooser uses _XMLHttpRequest_ to download the source
document, and it is subject subject to the [HTTP access control
(CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)
rules.

## Contact

Hoylen Sue <h.sue@qcif.edu.au>.
