async function fn() {
	await new Promise((resolve, reject) => {
		setTimeout(resolve, 2000);
	});
}
