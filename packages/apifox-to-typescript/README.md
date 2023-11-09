# @qiuxc/apifox-to-typescript

将 Apifox API 转换为 Typescript 请求代码

## 安装

```bash
npm install @qiuxc/apifox-to-typescript
```

## 使用

1. 生成配置文件

```sh
npx att init
```

> 生成配置文件后，需要修改配置文件，将 `serverUrl` 修改为你的 Apifox 地址

2. 生成

```sh
npx att
```

> 转换后，会在当前目录生成 `api` 目录