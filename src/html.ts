const _tmpl$ = document.createElement('template');

export const html = (literals, ...vars) => {
	let raw = literals.raw,
		result = '',
		i = 0,
		len = vars.length,
		str,
		variable;

	while (i < len) {
		str = raw[i];
		variable = vars[i];
		// result += str + variable;
		result += str + '<!-- $cmt_' + i + '-->';
		i++;
	}
	result += raw[raw.length - 1];

	console.log(result);

	// _tmpl$ = _tmpl$.cloneNode(false) as HTMLTemplateElement;
	_tmpl$.innerHTML = result;

	const commentNodes = [];
	walkForCommentNodes(_tmpl$.content, commentNodes);
	console.log(commentNodes.map((c) => c.textContent));
	console.log(vars);

	return _tmpl$.content;
};

const walkForCommentNodes = (element, commentNodes) => {
	var treeWalker = document.createTreeWalker(
		element,
		NodeFilter.SHOW_COMMENT,
		{
			acceptNode: function(node) {
				var nodeValue = node.nodeValue.trim();
				return nodeValue.startsWith('$cmt_') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
			}
		},
		false
	);

	while (treeWalker.nextNode()) {
		commentNodes.push(treeWalker.currentNode);
	}
};
