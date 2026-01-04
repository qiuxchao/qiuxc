#!/usr/bin/env node
'use strict';

const consola = require('consola');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');
const vtils = require('vtils');
const axios = require('axios');
const changeCase = require('change-case');
const prettier = require('prettier');
const esbuild = require('esbuild');
const jsonSchemaToTypescript = require('json-schema-to-typescript');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

function _interopNamespaceCompat(e) {
  if (e && typeof e === 'object' && 'default' in e) return e;
  const n = Object.create(null);
  if (e) {
    for (const k in e) {
      n[k] = e[k];
    }
  }
  n.default = e;
  return n;
}

const consola__default = /*#__PURE__*/_interopDefaultCompat(consola);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const fs__namespace = /*#__PURE__*/_interopNamespaceCompat(fs);
const ora__default = /*#__PURE__*/_interopDefaultCompat(ora);
const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);
const changeCase__namespace = /*#__PURE__*/_interopNamespaceCompat(changeCase);
const prettier__default = /*#__PURE__*/_interopDefaultCompat(prettier);

const JSTTOptions = {
  bannerComment: "",
  style: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: "none",
    useTabs: false
  }
};
function toUnixPath(path2) {
  return path2.replace(/[/\\]+/g, "/");
}
function traverseJsonSchema(jsonSchema, cb, currentPath = []) {
  if (!vtils.isObject(jsonSchema))
    return jsonSchema;
  if (vtils.isArray(jsonSchema.properties)) {
    jsonSchema.properties = jsonSchema.properties.reduce((props, js) => {
      props[js.name] = js;
      return props;
    }, {});
  }
  cb(jsonSchema, currentPath);
  if (jsonSchema.properties) {
    vtils.forOwn(
      jsonSchema.properties,
      (item, key) => traverseJsonSchema(item, cb, [...currentPath, key])
    );
  }
  if (jsonSchema.items) {
    vtils.castArray(jsonSchema.items).forEach(
      (item, index) => traverseJsonSchema(item, cb, [...currentPath, index])
    );
  }
  if (jsonSchema.oneOf) {
    jsonSchema.oneOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  if (jsonSchema.anyOf) {
    jsonSchema.anyOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  if (jsonSchema.allOf) {
    jsonSchema.allOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  return jsonSchema;
}
function jsonSchemaToJSTTJsonSchema(jsonSchema, typeName) {
  if (jsonSchema) {
    delete jsonSchema.description;
  }
  return traverseJsonSchema(jsonSchema, (jsonSchema2, currentPath) => {
    const refValue = jsonSchema2.title === null ? jsonSchema2.description : jsonSchema2.title;
    if (refValue?.startsWith("&")) {
      const typeRelativePath = refValue.substring(1);
      const typeAbsolutePath = toUnixPath(
        path__default.resolve(
          path__default.dirname(`/${currentPath.join("/")}`.replace(/\/{2,}/g, "/")),
          typeRelativePath
        ).replace(/^[a-z]+:/i, "")
      );
      const typeAbsolutePathArr = typeAbsolutePath.split("/").filter(Boolean);
      let tsTypeLeft = "";
      let tsTypeRight = typeName;
      for (const key of typeAbsolutePathArr) {
        tsTypeLeft += "NonNullable<";
        tsTypeRight += `[${JSON.stringify(key)}]>`;
      }
      const tsType = `${tsTypeLeft}${tsTypeRight}`;
      jsonSchema2.tsType = tsType;
    }
    delete jsonSchema2.title;
    delete jsonSchema2.id;
    delete jsonSchema2.minItems;
    delete jsonSchema2.maxItems;
    if (jsonSchema2.type === "object") {
      jsonSchema2.additionalProperties = false;
    }
    delete jsonSchema2.default;
    return jsonSchema2;
  });
}
async function jsonSchemaToType(jsonSchema, typeName) {
  if (vtils.isEmpty(jsonSchema)) {
    return `export interface ${typeName} {}`;
  }
  if (jsonSchema.__is_any__) {
    delete jsonSchema.__is_any__;
    return `export type ${typeName} = any`;
  }
  const fakeTypeName = "THISISAFAKETYPENAME";
  const code = await jsonSchemaToTypescript.compile(
    jsonSchemaToJSTTJsonSchema(vtils.cloneDeepFast(jsonSchema), typeName),
    fakeTypeName,
    JSTTOptions
  );
  return code.replace(fakeTypeName, typeName).trim();
}
const genComment = ({
  title = "",
  method = "",
  path: path2 = "",
  url = "",
  type = "method"
} = {}) => {
  const escapedTitle = String(title).replace(/\//g, "\\/");
  const summary = [
    {
      label: "\u8BF7\u6C42\u5934",
      value: `\`${method.toUpperCase()} ${path2}\``
    }
    // {
    //   label: '更新时间',
    //   value: `\`${dayjs().format('YYYY-MM-DD HH:mm:ss')}\``,
    // },
  ];
  const description = url ? `[${escapedTitle}\u2197](${url})` : escapedTitle;
  const titleComment = vtils.dedent`
  * ${type !== "method" ? "\u63A5\u53E3 " : ""}${description}${type !== "method" ? type === "requestType" ? " \u7684 **\u8BF7\u6C42\u7C7B\u578B**" : " \u7684 **\u54CD\u5E94\u7C7B\u578B**" : ""}
  *
`;
  const extraComment = summary.filter((item) => typeof item !== "boolean" && !vtils.isEmpty(item.value)).map((item) => {
    const _item = item;
    return `* @${_item.label} ${vtils.castArray(_item.value).join(", ")}`;
  }).join("\n");
  return vtils.dedent`
    /**
     ${[titleComment, extraComment].filter(Boolean).join("\n")}
     */
  `;
};
async function getPrettierOptions() {
  const prettierOptions = {
    parser: "typescript",
    // 解析器为typescript
    printWidth: 120,
    // 打印宽度为120
    tabWidth: 2,
    // 栅格符宽度为2
    singleQuote: true,
    // 使用单引号
    semi: false,
    // 不使用分号
    trailingComma: "all",
    // 添加所有可解析的尾随逗号
    bracketSpacing: false,
    // 不在大括号内添加间距
    endOfLine: "lf"
    // 使用LF作为行尾标识符
  };
  const [prettierConfigPathErr, prettierConfigPath] = await vtils.run(() => prettier__default.resolveConfigFile());
  if (prettierConfigPathErr || !prettierConfigPath) {
    return prettierOptions;
  }
  const [prettierConfigErr, prettierConfig] = await vtils.run(
    () => prettier__default.resolveConfig(prettierConfigPath)
  );
  if (prettierConfigErr || !prettierConfig) {
    return prettierOptions;
  }
  return {
    ...prettierOptions,
    ...prettierConfig,
    parser: "typescript"
    // 解析器为typescript
  };
}
const getCachedPrettierOptions = vtils.memoize(getPrettierOptions);
const isJavaScriptKeyword = (str) => {
  const keywords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    // ECMAScript 6 keywords
    "enum",
    "await",
    "implements",
    "package",
    "protected",
    "interface",
    "private",
    "public",
    "static"
  ];
  return keywords.includes(str.toLowerCase());
};
const transformWithEsbuild = async (code, filename) => {
  let loader = "js";
  const ext = path__default.extname(filename).slice(1);
  if (ext === "cjs" || ext === "mjs") {
    loader = "js";
  } else if (ext === "cts" || ext === "mts") {
    loader = "ts";
  } else {
    loader = ext;
  }
  const result = await esbuild.transform(code, {
    sourcefile: filename,
    loader,
    target: "es2020",
    platform: "node",
    format: "esm"
  });
  return result;
};
async function loadESModule(filepath) {
  const handle = await import(`${filepath}?${Date.now()}`);
  return handle.default;
}
async function loadModule(filepath, tempPath, isESM = true) {
  const ext = path__default.extname(filepath);
  let jsFilePath = filepath;
  if (ext === ".ts" || ext === ".js" && !isESM) {
    const tsText = fs.readFileSync(filepath, "utf-8");
    const { code } = await transformWithEsbuild(tsText, filepath);
    const tempFile = path__default.join(process.cwd(), tempPath, filepath.replace(/\.(ts|js)$/, ".mjs"));
    const tempBasename = path__default.dirname(tempFile);
    fs.mkdirSync(tempBasename, { recursive: true });
    fs.writeFileSync(tempFile, code, "utf8");
    jsFilePath = tempFile;
  }
  const content = await loadESModule(jsFilePath);
  return {
    content,
    jsFilePath
  };
}
const throwError = (...msg) => {
  throw new Error(msg.join(""));
};

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Generator {
  constructor(config, cwd) {
    __publicField(this, "pathObj", {});
    __publicField(this, "componentsSchemas", {});
    __publicField(this, "typeCode", "");
    __publicField(this, "methodCodes", []);
    __publicField(this, "outputTypePath");
    __publicField(this, "outputIndexPath");
    __publicField(this, "config");
    __publicField(this, "cwd");
    this.outputTypePath = path__default.resolve(cwd, `${config.apiDirPath ?? "src/api"}/typings.d.ts`);
    this.outputIndexPath = path__default.resolve(cwd, `${config.apiDirPath ?? "src/api"}/index.ts`);
    this.config = config;
    this.cwd = cwd;
  }
  async prepare(url) {
    if (url) {
      const res = await axios__default.get(url);
      if (res?.data?.paths) {
        this.pathObj = res.data.paths;
      } else {
        throwError("\u63A5\u53E3\u6587\u6863\u683C\u5F0F\u9519\u8BEF");
      }
      const schemas = res?.data?.components?.schemas || res?.data?.definitions || {};
      if (schemas) {
        Object.keys(schemas).forEach((key) => {
          schemas[key] = this.handleRefs(schemas[key], schemas);
        });
        this.componentsSchemas = schemas;
      }
    }
  }
  async generate() {
    const pathKeys = Object.keys(this.pathObj);
    await Promise.all(
      pathKeys.filter((p) => p !== "/").map(async (p) => {
        const target = this.pathObj[p];
        const typeName = changeCase__namespace.pascalCase(p.split("/").slice(1).join("-"));
        const isGet = !!target.get;
        const method = isGet ? "get" : "post";
        const methodData = target[method];
        const parameters = methodData?.parameters;
        let requestSchema = {
          type: "object",
          properties: {}
        };
        let responseSchema = {
          type: "object",
          properties: {}
        };
        if (parameters && Array.isArray(parameters)) {
          parameters.forEach((item) => {
            if (item.in === "body" && item.schema) {
              requestSchema = this.handleRefs(item.schema);
            } else if (["query", "path", "header"].includes(item.in)) {
              const schema = item.schema || { type: item.type };
              requestSchema.properties[item.name] = {
                ...schema,
                description: item.description || schema.description
              };
            }
          });
        }
        if (methodData?.requestBody?.content) {
          const content = methodData.requestBody.content["application/json"] || methodData.requestBody.content["*/*"] || Object.values(methodData.requestBody.content)[0];
          if (content?.schema) {
            requestSchema = this.handleRefs(content.schema);
          }
        }
        const responses = methodData?.responses;
        if (responses) {
          const successResponse = responses["200"] || responses["201"] || responses.default;
          if (successResponse) {
            if (successResponse.content) {
              const content = successResponse.content["application/json"] || successResponse.content["*/*"] || Object.values(successResponse.content)[0];
              if (content?.schema) {
                responseSchema = this.handleRefs(content.schema);
              }
            } else if (successResponse.schema) {
              responseSchema = this.handleRefs(successResponse.schema);
            }
          }
        }
        const reqType = await jsonSchemaToType(requestSchema, `${typeName}Request`);
        const resType = await jsonSchemaToType(responseSchema, `${typeName}Response`);
        const title = target?.[method]?.summary ?? "";
        const url = target?.[method]?.["x-run-in-apifox"] ?? "";
        const reqTypeComment = genComment({
          title,
          method,
          path: p,
          type: "requestType",
          url
        });
        const resTypeComment = genComment({
          title,
          method,
          path: p,
          type: "responseType",
          url
        });
        const typeCode = vtils.dedent`
        ${reqTypeComment}
        ${reqType}

        ${resTypeComment}
        ${resType}

        `;
        this.typeCode += `

${typeCode}`;
        const [_, modelPath, ...other] = p.split("/");
        const funcOutputFilePath = path__default.resolve(
          this.cwd,
          `${this.config.apiDirPath ?? "src/api"}/${other.length > 0 ? `${changeCase__namespace.camelCase(modelPath)}Api.ts` : "indexApi.ts"}`
        );
        const funcName = changeCase__namespace.camelCase(other.length > 0 ? other.join("-") : modelPath);
        const funcComment = genComment({
          title,
          method,
          path: p,
          url,
          type: "method"
        });
        const methodCode = vtils.dedent`
        ${funcComment}
        export const ${isJavaScriptKeyword(funcName) ? `${funcName}Api` : funcName} = <R extends boolean = true>(
            ${this.handleEmptyReqData(`${typeName}Request`, reqType)}: API.${typeName}Request,
            options?: GetOptionsType<typeof request> & { returnData?: R }
          ) => request<GetResponseType<API.${typeName}Response, R>>('${p}', '${method.toUpperCase()}', data, options);
            `;
        this.methodCodes.push({
          code: methodCode,
          outputPath: funcOutputFilePath
        });
      })
    );
  }
  async write() {
    const prettyTypeContent = await prettier__default.format(this.typeCode, {
      ...await getCachedPrettierOptions(),
      filepath: this.outputTypePath
    });
    const outputTypeContent = vtils.dedent`
    /* prettier-ignore-start */
    /* tslint:disable */
    /* eslint-disable */

    /* 该文件工具自动生成，请勿直接修改！！！ */

    // @ts-ignore

    declare namespace API {
    ${prettyTypeContent}
    }

    /* prettier-ignore-end */
    `;
    await fs__default.outputFile(this.outputTypePath, outputTypeContent);
    const groupedMethodCodes = vtils.groupBy(this.methodCodes, (item) => item.outputPath);
    await Promise.all(
      Object.keys(groupedMethodCodes).map(async (outputPath) => {
        const methodCodes = groupedMethodCodes[outputPath];
        const prettyMethodContent = await prettier__default.format(
          methodCodes.map((item) => item.code).join("\n\n"),
          {
            ...await getCachedPrettierOptions(),
            filepath: outputPath
          }
        );
        const outputMethodContent = vtils.dedent`
        /* prettier-ignore-start */
        /* tslint:disable */
        /* eslint-disable */

        import request from '${this.config.requestPath || "./../request/index"}';

        type GetOptionsType<T> = T extends (
        ...args: [string, string, Record<string, unknown> | {}, infer O]
        ) => Promise<unknown>
        ? O
        : never;
        type GetResponseType<T extends { data?: any }, R extends boolean> = R extends true ? T['data'] : T;


        /* 该文件工具自动生成，请勿直接修改！！！ */

        // @ts-ignore

        ${prettyMethodContent}

        /* prettier-ignore-end */
        `;
        await fs__default.outputFile(outputPath, outputMethodContent);
      })
    );
    const methodPaths = Object.keys(groupedMethodCodes).map(
      (outputPath) => {
        return {
          path: outputPath,
          name: path__default.basename(outputPath, ".ts")
        };
      }
    );
    let indexContent = "";
    methodPaths.forEach((item) => {
      indexContent += `import * as ${item.name} from './${item.name}';
`;
    });
    indexContent += `

export { ${methodPaths.map((item) => item.name).join(",")} };
`;
    const prettyIndexContent = await prettier__default.format(indexContent, {
      ...await getCachedPrettierOptions(),
      filepath: this.outputIndexPath
    });
    const outputIndexContent = vtils.dedent`
    /* prettier-ignore-start */
    /* tslint:disable */
    /* eslint-disable */

    /* 该文件工具自动生成，请勿直接修改！！！ */

    // @ts-ignore

    ${prettyIndexContent}

    /* prettier-ignore-end */
    `;
    await fs__default.outputFile(this.outputIndexPath, outputIndexContent);
  }
  // 递归处理refs
  handleRefs(schema = {}, componentsSchemas) {
    if (!schema || typeof schema !== "object")
      return schema;
    if (schema["x-apifox-refs"]) {
      Object.keys(schema["x-apifox-refs"]).forEach((key) => {
        const refObj = schema["x-apifox-refs"][key];
        if (refObj.$ref) {
          const ref = refObj.$ref.replace("#/components/schemas/", "");
          const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
          if (refSchema) {
            schema["x-apifox-refs"][key] = this.handleRefs(refSchema, componentsSchemas);
          } else {
            delete schema["x-apifox-refs"][key];
          }
        } else if (typeof refObj === "object") {
          schema["x-apifox-refs"][key] = this.handleRefs(refObj, componentsSchemas);
        }
      });
      if (Object.keys(schema["x-apifox-refs"]).length === 0) {
        delete schema["x-apifox-refs"];
      }
    }
    if (schema.$ref) {
      const ref = schema.$ref.replace("#/components/schemas/", "").replace("#/definitions/", "");
      const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
      if (refSchema) {
        delete schema.$ref;
        const resolvedSchema = { ...refSchema };
        return this.handleRefs(resolvedSchema, componentsSchemas);
      }
      return schema;
    }
    if (schema.type && schema.type === "object" && schema.properties) {
      const keys = Object.keys(schema.properties);
      keys.forEach((key) => {
        if (schema.properties[key]) {
          schema.properties[key] = this.handleRefs(schema.properties[key], componentsSchemas);
        }
      });
    }
    if (schema.type === "array" && schema.items) {
      schema.items = this.handleRefs(schema.items, componentsSchemas);
    }
    return schema;
  }
  // 处理请求为空的情况
  handleEmptyReqData(reqTypeName, reqType) {
    const reg = new RegExp(`${reqTypeName} {}`);
    const isEmpty = reg.test(reqType);
    return `data${isEmpty ? "?" : ""}`;
  }
}

function init(cwd) {
  const configPath = path__default.resolve(cwd, `att.config.ts`);
  if (fs__namespace.existsSync(configPath)) {
    consola__default.warn(`\u914D\u7F6E\u6587\u4EF6\u5DF2\u5B58\u5728: ${configPath}`);
    return;
  }
  const templatePath = path__default.resolve(__dirname, `./config.template`);
  fs__namespace.copyFileSync(templatePath, configPath);
  consola__default.success(`\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${configPath}`);
}

const att = async (config, cwd) => {
  const generator = new Generator(config, cwd);
  const spinner = ora__default("\u6B63\u5728\u83B7\u53D6\u63A5\u53E3\u6570\u636E...").start();
  try {
    await generator.prepare(config.serverUrl);
    spinner.text = "\u6B63\u5728\u89E3\u6790\u63A5\u53E3\u6570\u636E...";
    const delayNotice = vtils.wait(5e3);
    delayNotice.then(() => {
      spinner.text = `\u6B63\u5728\u89E3\u6790\u63A5\u53E3\u6570\u636E... (\u82E5\u957F\u65F6\u95F4\u5904\u4E8E\u6B64\u72B6\u6001\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u6709\u63A5\u53E3\u5B9A\u4E49\u7684\u6570\u636E\u8FC7\u5927\u5BFC\u81F4\u89E3\u6790\u7F13\u6162)`;
    });
    await generator.generate();
    spinner.text = "\u6B63\u5728\u5199\u5165\u6587\u4EF6...";
    await generator.write();
    delayNotice.cancel();
    spinner.stop();
    consola__default.success("\u5199\u5165\u6587\u4EF6\u5B8C\u6BD5");
  } catch (err) {
    spinner?.stop();
    consola__default.error(err);
  }
};
const run = async (cwd) => {
  const configFile = path__default.join(cwd, "att.config.ts");
  const configFileExist = await fs__default.pathExists(configFile);
  if (!configFileExist) {
    return consola__default.error(`\u627E\u4E0D\u5230\u914D\u7F6E\u6587\u4EF6: ${configFile}`);
  }
  consola__default.success(`\u627E\u5230\u914D\u7F6E\u6587\u4EF6: ${configFile}`);
  const packageJson = await fs__default.readJSON(path__default.resolve(cwd, "package.json"));
  const isESM = packageJson.type === "module";
  const { content: config } = await loadModule(
    configFile,
    "node_modules/.cache/.att_config",
    isESM
  );
  await att(config, cwd);
};
if (require.main === module) {
  const { argv } = process;
  if (argv.includes("init")) {
    init(process.cwd());
  } else {
    run(process.cwd());
  }
}
