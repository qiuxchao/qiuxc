module.exports = {
	rules: {
		/**
		 * 使用 && 渲染组件时，禁止条件是 0 '' 或 NaN，强制转为布尔值
		 * @reason 已经是布尔值的也会被转换，没有必要
		 */
		'react/jsx-no-leaked-render': 'off',
	},
};
