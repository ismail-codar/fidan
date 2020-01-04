Router({
	children: treeData
		.filter(function(treeNode) {
			return treeNode.itemData._path !== undefined;
		})
		.map(function(treeNode) {
			var _treeNode$itemData = treeNode.itemData,
				_path = _treeNode$itemData._path,
				_file = _treeNode$itemData._file;
			return Route({
				path: _path,
				component: _file['default']
			});
		})
});
