module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "组件内部function要有注释",
      
    },
    messages: {
      comment: "请在fun/hooks上方，补充注释",
      emptyComment:  "存在无意义的注释"
    },
    schema: [
      {
        type: "object",
        properties: {
          'ignoreHooks': {
                "type": "array",
                "items": {
                  "type": "string"
              }
            }
        },
        additionalProperties: false,
    }
    ]
  },
  create: function (context) {
    // 认定是不是 组件内部的函数
    // 第一 parent是个函数
    // 第三 parent 最后一个一定是ReturnStatement - JSXElement 
    // 自己是cont 并且是个函数 或者 useCallback
    return {
      // 文本
      VariableDeclaration: (node) =>{
        if (node.kind !== 'const') return
        if (node.declarations.length !== 1) return
        if (!['ArrowFunctionExpression',  'FunctionExpression'].includes(node?.parent?.parent?.type)) return
        const  {init} = node.declarations[0]
        const isFn = ['CallExpression', 'FunctionExpression', 'ArrowFunctionExpression'].includes(init.type)
        
        if (!isFn) return
        const hooksName = init?.callee?.name ||init?.callee?.property?.name
        const {ignoreHooks} = context.options[0] ?? {}
        if (hooksName && ignoreHooks?.includes(hooksName)) return

        const varName = node?.parent?.parent?.parent?.id?.name
        if (!/^[A-Z]/.test(varName))return
     
        const comments = context.getCommentsBefore(node)
        if (comments.length === 0) {
          context.report({
            node: node,
            // 错误/警告提示信息
            messageId: "comment",
            // fix(fixer) {
            //   return [fixer.replaceTextRange(
            //     [node.range[0]+ 1, node.range[1] - 1],
            //     `// TODO: 兄dei,你有一个注释需要补充\n${context.getSource(node)}`
            //   )];
            // },
          })
        } else  if (!comments[0]?.value?.replace(/\s+/g, '')) {
          context.report({
            node: node,
            messageId: "emptyComment",
            // fix(fixer) {
            //   return [fixer.replaceTextRange(
            //     [node.range[0]+ 1, node.range[1] - 1],
            //     `// TODO: 兄dei,你有一个注释需要补充\n${context.getSource(node)}`
            //   )];
            // },
          })
        }
      }
    };
  },
};
