import axios from 'axios';
import * as changeCase from 'change-case';
import fs from 'fs-extra';
import path from 'path';
import prettier from 'prettier';
import { dedent, groupBy } from 'vtils';

import { Config } from './types';
import {
  genComment,
  getCachedPrettierOptions,
  isJavaScriptKeyword,
  jsonSchemaToType,
  throwError,
} from './utils';

type PathObjType = Record<string, Record<'get' | 'post', any>>;

export class Generator {
  public pathObj: PathObjType = {};
  public componentsSchemas: Record<string, any> = {};
  private typeCode = '';
  private methodCodes: Array<{
    code: string;
    outputPath: string;
  }> = [];
  private outputTypePath: string;
  private outputIndexPath: string;
  private config: Config;
  private cwd: string;

  public constructor(config: Config, cwd: string) {
    this.outputTypePath = path.resolve(cwd, `${config.apiDirPath ?? 'src/api'}/typings.d.ts`);
    this.outputIndexPath = path.resolve(cwd, `${config.apiDirPath ?? 'src/api'}/index.ts`);
    this.config = config;
    this.cwd = cwd;
  }

  public async prepare(url: string) {
    if (url) {
      const res = await axios.get(url);
      if (res?.data?.paths) {
        this.pathObj = res.data.paths;
      } else {
        throwError('接口文档格式错误');
      }
      if (res?.data?.components?.schemas) {
        const schemas = res.data.components.schemas;
        Object.keys(schemas).forEach(key => {
          schemas[key] = this.handleRefs(schemas[key], schemas);
        });
        this.componentsSchemas = schemas;
      }
    }
  }

  public async generate() {
    const pathKeys = Object.keys(this.pathObj);

    await Promise.all(
      pathKeys
        .filter(p => p !== '/')
        .map(async p => {
          const target = this.pathObj[p];

          // 生成类型
          const typeName = changeCase.pascalCase(p.split('/').slice(1).join('-'));
          const isGet = !!target.get;
          const method = isGet ? 'get' : 'post';
          const parameters = target?.get?.parameters;
          let requestSchema: any = {
            type: 'object',
            properties: {},
          };
          let responseSchema: any = {
            type: 'object',
            properties: {},
          };
          if (isGet && parameters && Array.isArray(parameters)) {
            parameters.forEach(
              (item: {
                name: string;
                in: string;
                description: string;
                required: boolean;
                example: string;
                schema: {
                  type: string;
                };
              }) => {
                requestSchema.properties[item.name] = {
                  type: item.schema.type,
                  description: item.description,
                };
              },
            );
          } else {
            if (target?.[method]?.requestBody?.content?.['application/json']?.schema) {
              requestSchema = this.handleRefs(
                target[method].requestBody.content['application/json'].schema,
              );
            }
          }
          if (target?.[method]?.responses?.['200']?.content?.['application/json']?.schema) {
            responseSchema = this.handleRefs(
              target[method].responses['200'].content['application/json'].schema,
            );
          }
          const reqType = await jsonSchemaToType(requestSchema, `${typeName}Request`);
          const resType = await jsonSchemaToType(responseSchema, `${typeName}Response`);
          const title = target?.[method]?.summary ?? '';
          const url = target?.[method]?.['x-run-in-apifox'] ?? '';
          const reqTypeComment = genComment({
            title,
            method,
            path: p,
            type: 'requestType',
            url,
          });
          const resTypeComment = genComment({
            title,
            method,
            path: p,
            type: 'responseType',
            url,
          });
          const typeCode = dedent`
        ${reqTypeComment}
        ${reqType}

        ${resTypeComment}
        ${resType}

        `;

          this.typeCode += `\n\n${typeCode}`;

          // 生成方法
          const [_, modelPath, ...other] = p.split('/');
          const funcOutputFilePath = path.resolve(
            this.cwd,
            `${this.config.apiDirPath ?? 'src/api'}/${
              other.length > 0 ? `${changeCase.camelCase(modelPath)}Api.ts` : 'indexApi.ts'
            }`,
          );
          const funcName = changeCase.camelCase(other.length > 0 ? other.join('-') : modelPath);
          const funcComment = genComment({
            title,
            method,
            path: p,
            url,
            type: 'method',
          });
          const methodCode = dedent`
        ${funcComment}
        export const ${
          isJavaScriptKeyword(funcName) ? `${funcName}Api` : funcName
        } = <R extends boolean = true>(
            ${this.handleEmptyReqData(`${typeName}Request`, reqType)}: API.${typeName}Request,
            options?: GetOptionsType<typeof request> & { returnData?: R }
          ) => request<GetResponseType<API.${typeName}Response, R>>('${p}', '${method.toUpperCase()}', data, options);
            `;
          this.methodCodes.push({
            code: methodCode,
            outputPath: funcOutputFilePath,
          });
        }),
    );
  }

  public async write() {
    // 写入类型文件
    const prettyTypeContent = prettier.format(this.typeCode, {
      ...(await getCachedPrettierOptions()),
      filepath: this.outputTypePath,
    });
    const outputTypeContent = dedent`
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
    await fs.outputFile(this.outputTypePath, outputTypeContent);

    // 写入方法文件
    const groupedMethodCodes = groupBy(this.methodCodes, item => item.outputPath);
    await Promise.all(
      Object.keys(groupedMethodCodes).map(async outputPath => {
        const methodCodes = groupedMethodCodes[outputPath];
        const prettyMethodContent = prettier.format(
          methodCodes.map(item => item.code).join('\n\n'),
          {
            ...(await getCachedPrettierOptions()),
            filepath: outputPath,
          },
        );
        const outputMethodContent = dedent`
        /* prettier-ignore-start */
        /* tslint:disable */
        /* eslint-disable */

        import request from '${this.config.requestPath || './../request/index'}';

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
        await fs.outputFile(outputPath, outputMethodContent);
      }),
    );

    // 写入 index 入口文件
    const methodPaths: Array<{ name: string; path: string }> = Object.keys(groupedMethodCodes).map(
      outputPath => {
        return {
          path: outputPath,
          name: path.basename(outputPath, '.ts'),
        };
      },
    );
    let indexContent = '';
    methodPaths.forEach(item => {
      indexContent += `import * as ${item.name} from './${item.name}';\n`;
    });
    indexContent += `\n\nexport { ${methodPaths.map(item => item.name).join(',')} };\n`;

    const prettyIndexContent = prettier.format(indexContent, {
      ...(await getCachedPrettierOptions()),
      filepath: this.outputIndexPath,
    });
    const outputIndexContent = dedent`
    /* prettier-ignore-start */
    /* tslint:disable */
    /* eslint-disable */

    /* 该文件工具自动生成，请勿直接修改！！！ */

    // @ts-ignore

    ${prettyIndexContent}

    /* prettier-ignore-end */
    `;
    await fs.outputFile(this.outputIndexPath, outputIndexContent);
  }

  // 递归处理refs
  private handleRefs(schema: any = {}, componentsSchemas?: Record<string, any>) {
    if (!schema.type && !schema.$ref) return;
    if (schema.type && schema.type === 'object') {
      const keys = Object.keys(schema.properties);
      keys.forEach(key => {
        const target = schema.properties[key];
        if (target.$ref) {
          const ref = target.$ref.replace('#/components/schemas/', '');
          const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
          delete target.$ref;
          Object.assign(target, refSchema);
        }
        if (target.type === 'array') {
          this.handleRefs(target.items);
        }
        if (target.type === 'object') {
          Object.keys(target.properties).forEach(subKey => {
            target.properties[subKey] = this.handleRefs(target.properties[subKey]);
          });
        }
      });
    }
    if (schema.type === 'array') {
      this.handleRefs(schema.items);
    }
    if (schema.$ref) {
      const ref = schema.$ref.replace('#/components/schemas/', '');
      const refSchema = this.componentsSchemas[ref];
      delete schema.$ref;
      Object.assign(schema, refSchema);
    }
    return schema;
  }

  // 处理请求为空的情况
  private handleEmptyReqData(reqTypeName: string, reqType: string) {
    const reg = new RegExp(`${reqTypeName} {}`);
    const isEmpty = reg.test(reqType);
    return `data${isEmpty ? '?' : ''}`;
  }
}
