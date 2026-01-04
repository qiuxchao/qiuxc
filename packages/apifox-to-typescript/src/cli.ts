#!/usr/bin/env node
import consola from 'consola';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { wait } from 'vtils';

import { Generator } from './Generator';
import init from './init';
import { Config } from './types';
import { loadModule } from './utils';

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
    consola.success('写入文件完毕');
  } catch (err) {
    spinner?.stop();
    consola.error(err);
  }
};

const run = async (cwd: string) => {
  const configFile = path.join(cwd, 'att.config.ts');
  const configFileExist = await fs.pathExists(configFile);
  if (!configFileExist) {
    return consola.error(`找不到配置文件: ${configFile}`);
  }
  consola.success(`找到配置文件: ${configFile}`);
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
