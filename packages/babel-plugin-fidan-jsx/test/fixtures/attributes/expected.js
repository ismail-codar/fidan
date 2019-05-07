const _tmpl$ = document.createElement("template");
_tmpl$.innerHTML =
  "<div><input id='toggle-all' class='toggle-all' type='checkbox'/><label for='toggle-all'>Mark all as complete</label></div>";
_tmpl$.content.firstChild.cloneNode(true);
