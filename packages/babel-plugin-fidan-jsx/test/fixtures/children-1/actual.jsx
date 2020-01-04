<Router>
	{treeData.filter((treeNode) => treeNode.itemData._path !== undefined).map((treeNode) => {
		const { _path, _file } = treeNode.itemData;
		return <Route path={_path} component={_file.default} />;
	})}
</Router>;
