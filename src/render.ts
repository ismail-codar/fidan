import { createRuntime } from './runtime';

export const render = (
	dom: HTMLElement,
	view: { result: string; vars: any[] },
	runtime: ReturnType<typeof createRuntime>
) => {};
