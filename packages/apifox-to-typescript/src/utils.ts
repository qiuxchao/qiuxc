import dayjs from 'dayjs';
import { type Loader, transform } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'fs-extra';
import { JSONSchema4 } from 'json-schema';
import { compile, Options } from 'json-schema-to-typescript';
import path from 'path';
import prettier from 'prettier';
import {
  castArray,
  cloneDeepFast,
  dedent,
  forOwn,
  isArray,
  isEmpty,
  isObject,
  memoize,
  run,
} from 'vtils';
import { Defined } from 'vtils/types';

const JSTTOptions: Partial<Options> = {
  bannerComment: '',
  style: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'none',
    useTabs: false,
  },
};

/**
 * 将路径统一为 unix 风格的路径。
 *
 * @param path 路径
 * @returns unix 风格的路径
 */
export function toUnixPath(path: string) {
  return path.replace(/[/\\]+/g, '/');
}

/**
 * 获得规范化的相对路径。
 *
 * @param from 来源路径
 * @param to 去向路径
 * @returns 相对路径
 */
export function getNormalizedRelativePath(from: string, to: string) {
  return toUnixPath(path.relative(path.dirname(from), to))
    .replace(/^(?=[^.])/, './')
    .replace(/\.(ts|js)x?$/i, '');
}

/**
 * 原地遍历 JSONSchema。
 */
export function traverseJsonSchema(
  jsonSchema: JSONSchema4,
  cb: (jsonSchema: JSONSchema4, currentPath: Array<string | number>) => JSONSchema4,
  currentPath: Array<string | number> = [],
): JSONSchema4 {
  /* istanbul ignore if */
  if (!isObject(jsonSchema)) return jsonSchema;

  // Mock.toJSONSchema 产生的 properties 为数组，然而 JSONSchema4 的 properties 为对象
  if (isArray(jsonSchema.properties)) {
    jsonSchema.properties = (jsonSchema.properties as JSONSchema4[]).reduce<
      Defined<JSONSchema4['properties']>
    >((props, js) => {
      props[js.name] = js;
      return props;
    }, {});
  }

  // 处理传入的 JSONSchema
  cb(jsonSchema, currentPath);

  // 继续处理对象的子元素
  if (jsonSchema.properties) {
    forOwn(jsonSchema.properties, (item, key) =>
      traverseJsonSchema(item, cb, [...currentPath, key]),
    );
  }

  // 继续处理数组的子元素
  if (jsonSchema.items) {
    castArray(jsonSchema.items).forEach((item, index) =>
      traverseJsonSchema(item, cb, [...currentPath, index]),
    );
  }

  // 处理 oneOf
  if (jsonSchema.oneOf) {
    jsonSchema.oneOf.forEach(item => traverseJsonSchema(item, cb, currentPath));
  }

  // 处理 anyOf
  if (jsonSchema.anyOf) {
    jsonSchema.anyOf.forEach(item => traverseJsonSchema(item, cb, currentPath));
  }

  // 处理 allOf
  if (jsonSchema.allOf) {
    jsonSchema.allOf.forEach(item => traverseJsonSchema(item, cb, currentPath));
  }

  return jsonSchema;
}

/**
 * 获取适用于 JSTT 的 JSONSchema。
 *
 * @param jsonSchema 待处理的 JSONSchema
 * @returns 适用于 JSTT 的 JSONSchema
 */
export function jsonSchemaToJSTTJsonSchema(jsonSchema: JSONSchema4, typeName: string): JSONSchema4 {
  if (jsonSchema) {
    // 去除最外层的 description 以防止 JSTT 提取它作为类型的注释
    delete jsonSchema.description;
  }
  return traverseJsonSchema(jsonSchema, (jsonSchema, currentPath) => {
    // 支持类型引用
    const refValue = jsonSchema.title === null ? jsonSchema.description : jsonSchema.title;
    if (refValue?.startsWith('&')) {
      const typeRelativePath = refValue.substring(1);
      const typeAbsolutePath = toUnixPath(
        path
          .resolve(
            path.dirname(`/${currentPath.join('/')}`.replace(/\/{2,}/g, '/')),
            typeRelativePath,
          )
          .replace(/^[a-z]+:/i, ''),
      );
      const typeAbsolutePathArr = typeAbsolutePath.split('/').filter(Boolean);

      let tsTypeLeft = '';
      let tsTypeRight = typeName;
      for (const key of typeAbsolutePathArr) {
        tsTypeLeft += 'NonNullable<';
        tsTypeRight += `[${JSON.stringify(key)}]>`;
      }
      const tsType = `${tsTypeLeft}${tsTypeRight}`;

      jsonSchema.tsType = tsType;
    }

    // 去除 title 和 id，防止 json-schema-to-typescript 提取它们作为接口名
    delete jsonSchema.title;
    delete jsonSchema.id;

    // 忽略数组长度限制
    delete jsonSchema.minItems;
    delete jsonSchema.maxItems;

    if (jsonSchema.type === 'object') {
      // 将 additionalProperties 设为 false
      jsonSchema.additionalProperties = false;
    }

    // 删除 default，防止 json-schema-to-typescript 根据它推测类型
    delete jsonSchema.default;

    return jsonSchema;
  });
}

/**
 * 根据 JSONSchema 对象生产 TypeScript 类型定义。
 *
 * @param jsonSchema JSONSchema 对象
 * @param typeName 类型名称
 * @returns TypeScript 类型定义
 */
export async function jsonSchemaToType(jsonSchema: JSONSchema4, typeName: string): Promise<string> {
  if (isEmpty(jsonSchema)) {
    return `export interface ${typeName} {}`;
  }
  if (jsonSchema.__is_any__) {
    delete jsonSchema.__is_any__;
    return `export type ${typeName} = any`;
  }
  // JSTT 会转换 typeName，因此传入一个全大写的假 typeName，生成代码后再替换回真正的 typeName
  const fakeTypeName = 'THISISAFAKETYPENAME';
  const code = await compile(
    jsonSchemaToJSTTJsonSchema(cloneDeepFast(jsonSchema), typeName),
    fakeTypeName,
    JSTTOptions,
  );
  return code.replace(fakeTypeName, typeName).trim();
}

/**
 * 生成注释。
 */
export const genComment = ({
  title = '',
  method = '',
  path = '',
  url = '',
  type = 'method',
}: {
  title?: string;
  method?: string;
  path?: string;
  url?: string;
  type?: 'method' | 'requestType' | 'responseType';
} = {}) => {
  // 转义标题中的 /
  const escapedTitle = String(title).replace(/\//g, '\\/');
  const summary: Array<
    | false
    | {
      label: string;
      value: string | string[];
    }
  > = [
      {
        label: '请求头',
        value: `\`${method.toUpperCase()} ${path}\``,
      },
      // {
      //   label: '更新时间',
      //   value: `\`${dayjs().format('YYYY-MM-DD HH:mm:ss')}\``,
      // },
    ];
  const description = url ? `[${escapedTitle}↗](${url})` : escapedTitle;
  const titleComment = dedent`
  * ${type !== 'method' ? '接口 ' : ''}${description}${type !== 'method' ? (type === 'requestType' ? ' 的 **请求类型**' : ' 的 **响应类型**') : ''
    }
  *
`;
  const extraComment: string = summary
    .filter(item => typeof item !== 'boolean' && !isEmpty(item.value))
    .map(item => {
      const _item: Exclude<(typeof summary)[0], boolean> = item as any;
      return `* @${_item.label} ${castArray(_item.value).join(', ')}`;
    })
    .join('\n');
  return dedent`
    /**
     ${[titleComment, extraComment].filter(Boolean).join('\n')}
     */
  `;
};

/**
 * 获取Prettier的选项
 * @returns 返回一个Promise，解析为Prettier的选项对象
 */
export async function getPrettierOptions(): Promise<prettier.Options> {
  // 初始化Prettier的选项对象
  const prettierOptions: prettier.Options = {
    parser: 'typescript', // 解析器为typescript
    printWidth: 120, // 打印宽度为120
    tabWidth: 2, // 栅格符宽度为2
    singleQuote: true, // 使用单引号
    semi: false, // 不使用分号
    trailingComma: 'all', // 添加所有可解析的尾随逗号
    bracketSpacing: false, // 不在大括号内添加间距
    endOfLine: 'lf', // 使用LF作为行尾标识符
  };

  // 解析Prettier的配置文件
  const [prettierConfigPathErr, prettierConfigPath] = await run(() => prettier.resolveConfigFile());

  // 如果解析出错或未找到配置文件，则返回默认的Prettier选项对象
  if (prettierConfigPathErr || !prettierConfigPath) {
    return prettierOptions;
  }

  // 解析Prettier的配置文件内容
  const [prettierConfigErr, prettierConfig] = await run(() =>
    prettier.resolveConfig(prettierConfigPath),
  );

  // 如果解析出错或配置文件内容为空，则返回默认的Prettier选项对象
  if (prettierConfigErr || !prettierConfig) {
    return prettierOptions;
  }

  // 返回组合后的Prettier选项对象
  return {
    ...prettierOptions,
    ...prettierConfig,
    parser: 'typescript', // 解析器为typescript
  };
}

/**
 * 获取缓存的Prettier选项
 * @returns 返回一个Promise，解析为缓存的Prettier选项对象
 */
export const getCachedPrettierOptions: () => Promise<prettier.Options> =
  memoize(getPrettierOptions);

/**
 * 判断给定的字符串是否为JavaScript的关键字
 * @param str 要判断的字符串
 * @returns 如果给定的字符串是JavaScript的关键字，则返回 true；否则返回false
 */
export const isJavaScriptKeyword = (str: string) => {
  const keywords = [
    'break',
    'case',
    'catch',
    'class',
    'const',
    'continue',
    'debugger',
    'default',
    'delete',
    'do',
    'else',
    'export',
    'extends',
    'finally',
    'for',
    'function',
    'if',
    'import',
    'in',
    'instanceof',
    'new',
    'return',
    'super',
    'switch',
    'this',
    'throw',
    'try',
    'typeof',
    'var',
    'void',
    'while',
    'with',
    'yield',
    // ECMAScript 6 keywords
    'enum',
    'await',
    'implements',
    'package',
    'protected',
    'interface',
    'private',
    'public',
    'static',
  ];

  return keywords.includes(str.toLowerCase());
};

/** 转换 ts | js 文件 */
export const transformWithEsbuild = async (code: string, filename: string) => {
  let loader: Loader = 'js';
  const ext = path.extname(filename).slice(1);
  if (ext === 'cjs' || ext === 'mjs') {
    loader = 'js';
  } else if (ext === 'cts' || ext === 'mts') {
    loader = 'ts';
  } else {
    loader = ext as Loader;
  }
  const result = await transform(code, {
    sourcefile: filename,
    loader,
    target: 'es2020',
    platform: 'node',
    format: 'esm',
  });
  return result;
};

/**
 * 加载ES模块
 */
export async function loadESModule<T>(filepath: string): Promise<T> {
  const handle = await import(`${filepath}?${Date.now()}`);
  return handle.default;
}

/**
 * 加载模块 ts/js
 * @param filepath 文件路径
 * @returns 文件内容
 */
export async function loadModule<T>(
  filepath: string,
  tempPath: string,
  isESM = true,
): Promise<{
  content: T;
  jsFilePath: string;
}> {
  const ext = path.extname(filepath);
  let jsFilePath = filepath;
  if (ext === '.ts' || (ext === '.js' && !isESM)) {
    const tsText = readFileSync(filepath, 'utf-8');
    const { code } = await transformWithEsbuild(tsText, filepath);
    const tempFile = path.join(process.cwd(), tempPath, filepath.replace(/\.(ts|js)$/, '.mjs'));
    const tempBasename = path.dirname(tempFile);
    mkdirSync(tempBasename, { recursive: true });
    writeFileSync(tempFile, code, 'utf8');
    jsFilePath = tempFile;
  }
  const content = await loadESModule<T>(jsFilePath);
  return {
    content,
    jsFilePath,
  };
}

/**
 * 抛出错误。
 *
 * @param msg 错误信息
 */
export const throwError = (...msg: string[]): never => {
  throw new Error(msg.join(''));
};
