module.exports = {
	rules: {
		/**
		 * 使用 && 渲染组件时，禁止条件是 0 '' 或 NaN，强制转为布尔值
		 */
		'react/jsx-no-leaked-render': ['error', { validStrategies: ['coerce'] }],
	},
};
