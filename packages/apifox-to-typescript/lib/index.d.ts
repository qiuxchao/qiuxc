interface Config {
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
}

/**
 * 定义配置。
 *
 * @param config 配置
 */
declare const defineConfig: (config: Config) => Config;

export { type Config, defineConfig };
