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
      
      const schemas = res?.data?.components?.schemas || res?.data?.definitions || {};
      if (schemas) {
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
          const methodData = target[method];
          const parameters = methodData?.parameters;
          let requestSchema: any = {
            type: 'object',
            properties: {},
          };
          let responseSchema: any = {
            type: 'object',
            properties: {},
          };

          // 处理请求参数
          if (parameters && Array.isArray(parameters)) {
            parameters.forEach((item: any) => {
              if (item.in === 'body' && item.schema) {
                // Swagger 2.0 body 参数
                requestSchema = this.handleRefs(item.schema);
              } else if (['query', 'path', 'header'].includes(item.in)) {
                // 路径、查询或头参数
                const schema = item.schema || { type: item.type };
                requestSchema.properties[item.name] = {
                  ...schema,
                  description: item.description || schema.description,
                };
              }
            });
          }

          // 处理 OpenAPI 3.0 requestBody
          if (methodData?.requestBody?.content) {
            const content =
              methodData.requestBody.content['application/json'] ||
              methodData.requestBody.content['*/*'] ||
              Object.values(methodData.requestBody.content)[0];
            if ((content as any)?.schema) {
              requestSchema = this.handleRefs((content as any).schema);
            }
          }

          // 处理响应
          const responses = methodData?.responses;
          if (responses) {
            const successResponse = responses['200'] || responses['201'] || responses.default;
            if (successResponse) {
              if (successResponse.content) {
                const content =
                  successResponse.content['application/json'] ||
                  successResponse.content['*/*'] ||
                  Object.values(successResponse.content)[0];
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
    const prettyTypeContent = await prettier.format(this.typeCode, {
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
        const prettyMethodContent = await prettier.format(
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

    const prettyIndexContent = await prettier.format(indexContent, {
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
  private handleRefs(schema: any = {}, componentsSchemas?: Record<string, any>): any {
    if (!schema || typeof schema !== 'object') return schema;
    
    // 处理x-apifox-refs中的引用
    if (schema['x-apifox-refs']) {
      Object.keys(schema['x-apifox-refs']).forEach(key => {
        const refObj = schema['x-apifox-refs'][key];
        if (refObj.$ref) {
          const ref = refObj.$ref.replace('#/components/schemas/', '');
          const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
          // 检查引用的组件是否存在
          if (refSchema) {
            // 将引用替换为实际的schema，并递归处理
            schema['x-apifox-refs'][key] = this.handleRefs(refSchema, componentsSchemas);
          } else {
            // 如果引用不存在，删除这个引用
            delete schema['x-apifox-refs'][key];
          }
        } else if (typeof refObj === 'object') {
          // 对x-apifox-refs内部的对象也进行递归处理
          schema['x-apifox-refs'][key] = this.handleRefs(refObj, componentsSchemas);
        }
      });
      
      // 如果x-apifox-refs为空，删除这个字段
      if (Object.keys(schema['x-apifox-refs']).length === 0) {
        delete schema['x-apifox-refs'];
      }
    }
    
    // 处理 $ref 引用
    if (schema.$ref) {
      const ref = schema.$ref.replace('#/components/schemas/', '').replace('#/definitions/', '');
      const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
      // 检查引用的组件是否存在
      if (refSchema) {
        // 删除 $ref 属性，然后递归处理引用的schema
        delete schema.$ref;
        // 将引用的schema的属性合并到当前schema，并递归处理
        const resolvedSchema = { ...refSchema };
        return this.handleRefs(resolvedSchema, componentsSchemas);
      }
      return schema;
    }
    
    // 处理对象类型
    if (schema.type && schema.type === 'object' && schema.properties) {
      const keys = Object.keys(schema.properties);
      keys.forEach(key => {
        if (schema.properties[key]) {
          // 递归处理每个属性
          schema.properties[key] = this.handleRefs(schema.properties[key], componentsSchemas);
        }
      });
    }
    
    // 处理数组类型
    if (schema.type === 'array' && schema.items) {
      schema.items = this.handleRefs(schema.items, componentsSchemas);
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
