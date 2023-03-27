import { Button } from '@qiuxc/core';
import { useIsomorphicLayoutEffect } from '@qiuxc/utils';

export default function Docs() {
	useIsomorphicLayoutEffect(() => {
		console.log('qiuxc docs page');
	}, []);
	return (
		<div>
			<h1>qiuxc Documentation</h1>
			<Button>Click me</Button>
		</div>
	);
}
