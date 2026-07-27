$(function () {
  console.info("[info] main.js is running");

  // Active Link
  const active = $(`a.nav-link[href='${location.pathname}']`);
  active.addClass("active");

  $("form.adminForm").submit(function (e) {
    e.preventDefault();
    if (confirm("Are you sure?")) e.target.submit();
  });
});
