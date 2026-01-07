export interface Config {
  /**
   * api 服务器地址
   */
  serverUrl: string;

  /**
   * 请求方法路径
   *
   * @default './../request/index'
   */
  requestPath?: string;

  /**
   * api 目录路径
   *
   * @default 'src/api'
   */
  apiDirPath?: string;

  /**
   * 接口文件后缀
   *
   * @default 'Api'
   */
  apiFileSuffix?: string;

  /**
   * 响应类型代码片段
   *
   * @default type GetResponseType<T extends { data?: any }, R extends boolean> = R extends true ? T['data'] : T;
   */
  getResponseTypeSnippet?: string;
}
