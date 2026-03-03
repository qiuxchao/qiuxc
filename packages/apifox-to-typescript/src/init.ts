import * as fs from 'fs-extra';
import path from 'path';

const logger = {
  success: (msg: string) => console.log(`\x1b[32m✔\x1b[0m ${msg}`),
  warn: (msg: string) => console.warn(`\x1b[33m⚠\x1b[0m ${msg}`),
};

/**
 * 初始化配置文件
 * @param cwd 执行命令的目录
 * @param target 要生成的配置文件类型
 */
export default function init(cwd: string) {
  const configPath = path.resolve(cwd, `att.config.ts`);
  if (fs.existsSync(configPath)) {
    logger.warn(`配置文件已存在: ${configPath}`);
    return;
  }
  const templatePath = path.resolve(__dirname, `./config.template`);
  fs.copyFileSync(templatePath, configPath);
  logger.success(`配置文件已生成: ${configPath}`);
}
