// / <reference types="@webgpu/types" />

declare module '*.wgsl' {
	const shader: 'string';
	export default shader;
}
declare global {
	module globalThis {
		export var __ENV__: 'prod' | 'dev';
	}
}