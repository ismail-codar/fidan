savedTodos.forEach(function(item) {
  var todoItem = {
    $title: fjsx.value(item["$title"])
  };
});
