
const rule = require("../../../lib/rules/no-classname-spaces")
const RuleTester = require("eslint").RuleTester;
const parserOptions = {
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};
const ruleTester = new RuleTester({parserOptions,
  // eslint-disable-next-line node/no-unpublished-require
  parser: require.resolve('@typescript-eslint/parser')});

ruleTester.run("no-classname-spaces", rule, {
  valid: [
    `<div className="detail dd 66"> 23232</div>`,
  ],
  invalid: [
    {
      code: `<div className="      222   33   dd     ">23232</div>`,
      output: `<div className="222 33 dd">23232</div>`,
      errors: [
        {
          messageId: 'space'
        },
      ],
    },
  ]
});
