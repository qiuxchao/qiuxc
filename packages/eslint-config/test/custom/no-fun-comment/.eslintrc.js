module.exports = {
	rules: {
		/**
		 * 组件方法必须要有注释说明
		 * ignoreHooks 可以忽略一些hooks不用写注释
		 */
		'@qiuxc/no-fun-comment': ['warn', { ignoreHooks: ['useForm'] }],
	},
};
