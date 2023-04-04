
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "className 空格有很多",
    },
    fixable: "code",
    messages: {
      space: "className 中间有多余的空格"
  },
  schema: [
      {
          "enum": ["always", "never"]
      },
    ]
  },
 

  create: function (context) {
    // const sourceCode = context.getSourceCode();
    return {
      // 文本
      JSXAttribute: (node) =>{
        if (node.name.name !== 'className') return
        const classNameValueNode = node.value
        if (/(^\s+|\s{2}|\s+$)/.test(classNameValueNode.value)) {
          context.report({
            node: classNameValueNode,
            // 错误/警告提示信息
            messageId: "space",
            // 修复
            fix(fixer) {
              return [fixer.replaceTextRange(
                [classNameValueNode.range[0]+ 1, classNameValueNode.range[1] - 1],
                  `${classNameValueNode.value.trim().replace(/\s{2,}/g, ' ')}`
              )];
            },
          });
        }
      }
    };
  },
};
