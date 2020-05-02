export const html = (literals, ...vars) => {
	let raw = literals.raw,
		result = '',
		i = 1,
		len = vars.length + 1,
		str,
		variable;

	while (i < len) {
		str = raw[i - 1];
		variable = vars[i - 1];
		result += str + variable;
		i++;
	}
	result += raw[raw.length - 1];
	return result;
};
