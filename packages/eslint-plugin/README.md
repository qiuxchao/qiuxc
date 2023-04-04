# @qiuxc/eslint-plugin

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
pnpm i eslint -D
```

Next, install `@qiuxc/eslint-plugin`:

```sh
pnpm i @qiuxc/eslint-plugin -D
```

## Usage

Add `@qiuxc` to the plugins section of your `.eslintrc` configuration file:

```json
{
    "plugins": [
        "@qiuxc"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "@qiuxc/rule-name": 2
    }
}
```

## Supported Rules

- no-classname-spaces className 中间不能有多余的空格
- no-fun-commnet react 组件内部 function 和 hook 要有注释

