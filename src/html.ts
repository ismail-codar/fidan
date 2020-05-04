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
	return { result, vars };
};
