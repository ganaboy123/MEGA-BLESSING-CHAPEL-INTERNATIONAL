(function () {
  "use strict";

  var path = (window.location.pathname || "").toLowerCase();
  if (path.endsWith("gateway.html")) return;

  var current = new URL(window.location.href);
  var cameFromGateway = current.searchParams.get("fromGateway") === "1";

  if (cameFromGateway) {
    current.searchParams.delete("fromGateway");
    var cleanQuery = current.searchParams.toString();
    var cleanUrl = current.pathname + (cleanQuery ? "?" + cleanQuery : "") + current.hash;
    window.history.replaceState({}, "", cleanUrl);
    return;
  }

  var navType = "navigate";
  if (window.performance && typeof performance.getEntriesByType === "function") {
    var entries = performance.getEntriesByType("navigation");
    if (entries && entries.length && entries[0].type) {
      navType = entries[0].type;
    }
  }

  var sameOriginReferrer = false;
  if (document.referrer) {
    try {
      sameOriginReferrer = new URL(document.referrer).origin === window.location.origin;
    } catch (_err) {
      sameOriginReferrer = false;
    }
  }

  var shouldShowGateway = navType === "reload" || !sameOriginReferrer;
  if (!shouldShowGateway) return;

  var next = (window.location.pathname + window.location.search + window.location.hash).replace(/^\//, "") || "index.html";
  window.location.replace("gateway.html?next=" + encodeURIComponent(next));
})();
