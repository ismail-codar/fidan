export const createRuntime = () => {
	return {
		init: (name: string, value: any, depends?: any[]) => {},
		set: (name: string, value: any) => {}
	};
};
