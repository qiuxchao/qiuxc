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
    this.outputTypePath = path.resolve(cwd, 'api/typings.d.ts');
    this.outputIndexPath = path.resolve(cwd, 'api/index.ts');
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
              requestSchema = target[method].requestBody.content['application/json'].schema;
            }
          }
          if (target?.[method]?.responses?.['200']?.content?.['application/json']?.schema) {
            responseSchema = target[method].responses['200'].content['application/json'].schema;
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
            process.cwd(),
            `api/${other.length > 0 ? `${changeCase.camelCase(modelPath)}Api.ts` : 'indexApi.ts'}`,
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
            data: API.${typeName}Request,
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
}
