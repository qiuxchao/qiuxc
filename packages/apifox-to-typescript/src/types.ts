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
}
