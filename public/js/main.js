$(function() {
    console.info("[info] main.js is running");

    // Active Link
    var active = $("a.nav-link[href='" + location.pathname + "']");
    active.addClass("active");
});