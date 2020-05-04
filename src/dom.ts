const _tmpl$ = document.createElement('template');

const walkForCommentNodes = (element, commentNodes) => {
	var treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_COMMENT,
		{
			acceptNode: function(node) {
				console.log(node);
				var nodeValue = node.nodeValue;
				return nodeValue.startsWith('$cmt_') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			}
		},
		false
	);

	while (treeWalker.nextNode()) {
		commentNodes.push(treeWalker.currentNode);
	}
};

export const commentedHtmlToDom = (result: string) => {
	// _tmpl$ = _tmpl$.cloneNode(false) as HTMLTemplateElement;
	_tmpl$.innerHTML = result;
	const commentNodes = [];
	walkForCommentNodes(_tmpl$.content, commentNodes);
	return _tmpl$.content;
};
