#!/usr/bin/env node
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { wait } from 'vtils';

import { Generator } from './Generator';
import init from './init';
import { Config } from './types';
import { loadModule } from './utils';

const logger = {
  success: (msg: string) => console.log(`\x1b[32m✔\x1b[0m ${msg}`),
  error: (msg: any) => console.error(`\x1b[31m✖\x1b[0m`, msg),
  info: (msg: string) => console.log(`\x1b[34mℹ\x1b[0m ${msg}`),
  warn: (msg: string) => console.warn(`\x1b[33m⚠\x1b[0m ${msg}`),
};

const att = async (config: Config, cwd: string) => {
  const generator = new Generator(config, cwd);
  const spinner = ora('正在获取接口数据...').start();
  try {
    await generator.prepare(config.serverUrl);
    spinner.text = '正在解析接口数据...';
    const delayNotice = wait(5000);
    delayNotice.then(() => {
      spinner!.text = `正在解析接口数据... (若长时间处于此状态，请检查是否有接口定义的数据过大导致解析缓慢)`;
    });
    await generator.generate();
    spinner.text = '正在写入文件...';
    await generator.write();
    delayNotice.cancel();
    spinner.stop();
    logger.success('写入文件完毕');
  } catch (err: any) {
    spinner?.stop();
    if (err?.isAxiosError) {
      logger.error(`请求接口失败: ${err.message}${err.response ? ` (${err.response.status})` : ''}`);
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ERR_NETWORK') {
        logger.info('请检查 serverUrl 是否正确，以及接口服务是否已启动');
      }
    } else {
      logger.error(err);
    }
  }
};

const run = async (cwd: string) => {
  const configFile = path.join(cwd, 'att.config.ts');
  const configFileExist = await fs.pathExists(configFile);
  if (!configFileExist) {
    return logger.error(`找不到配置文件: ${configFile}`);
  }
  logger.info(`找到配置文件: ${configFile}`);
  // 读取宿主项目的 package.json
  const packageJson = await fs.readJSON(path.resolve(cwd, 'package.json'));
  const isESM = packageJson.type === 'module';
  const { content: config } = await loadModule<Config>(
    configFile,
    'node_modules/.cache/.att_config',
    isESM,
  );
  await att(config, cwd);
};

if (require.main === module) {
  const { argv } = process;
  if (argv.includes('init')) {
    init(process.cwd());
  } else {
    run(process.cwd());
  }
}
