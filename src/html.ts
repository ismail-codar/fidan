const _tmpl$ = document.createElement('template');

export const html = (literals, ...vars) => {
	let raw = literals.raw,
		result = '',
		i = 0,
		len = vars.length,
		str = '';

	while (i < len) {
		str = raw[i];
		if (str.startsWith('"')) {
			str = str.substr(1);
		}
		if (raw[i].endsWith('="')) {
			//attributes
			var p = str.lastIndexOf(' ') + 1;
			var attr = str.substr(p, str.length - p - 2);
			p = str.lastIndexOf('<');
			var comment = '<!--$cmt_' + i + '_' + attr + '-->';
			if (p === -1) {
				//next attributes
				p = result.lastIndexOf('<');
				result = result.substr(0, p) + comment + result.substr(p) + str.substr(0, str.length - attr.length - 3);
			} else {
				// fist attribute
				result += str.substr(0, p) + comment + str.substr(p, str.length - p - attr.length - 3);
			}
		} else {
			//text nodes
			result += str + '<!--$cmt_' + i + '-->';
		}
		i++;
	}
	result += raw[raw.length - 1];

	console.log(result);

	// _tmpl$ = _tmpl$.cloneNode(false) as HTMLTemplateElement;
	_tmpl$.innerHTML = result;

	const commentNodes = [];
	walkForCommentNodes(_tmpl$.content, commentNodes);
	if (commentNodes.length !== vars.length) {
		console.info(result);
		throw 'html parse error';
	}
	console.log(commentNodes.map((c) => c));
	console.log(vars);

	return _tmpl$.content;
};

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
