const rule = require("../../../lib/rules/no-fun-comment")
const RuleTester = require("eslint").RuleTester;
const parserOptions = {
  ecmaVersion: 2020,
  sourceType: 'module',
  ecmaFeatures: {
    jsx: true,
  },
};
const ruleTester = new RuleTester({parserOptions} );

ruleTester.run("no-fun-comment", rule, {
  valid: [
    `
    const ComponentA = function () {
      // form
      const [form] = Form.useForm();
      // state
      const [goods] = useState('');
      // b 是一个大佬||||
      const b = function () {
        return <div>333</div>;
      };


      /*
      dd
       4
     */
      const c = function () {
        return <div>333</div>;
      };
    
      return <><div className="111" id="444">{b()}</div></>;
    };

     `,
  ],
  invalid: [
    {
      options: [{ignoreHooks: ['useForm']}],
      code: `
      const ComponentA = function () {
        const [form] = Form.useForm();
        const b = function () {
          return <div>333</div>;
        };
      
        return <div className="111" id="444">{b()}</div>;
      };

 
      const ComponentB = () => {
        //
        const handleClick = () => {
          console.log('我被点击了');
        };
        return (
          <div className="list-index" onClick={handleClick}>
            我是页面组件
          </div>
        );
      };
      
     `,

     errors: [
      {
        messageId: 'comment'
      },
      {
        messageId: 'emptyComment'
      },
    ],
    },
]
});
