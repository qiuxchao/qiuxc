import colors from 'colors';
import fs from 'fs';
import glob from 'glob';
import mkdirp from 'mkdirp';
import path from 'path';

import { XmlData } from './fetchXml';
import { Config } from './getConfig';
import { getTemplate } from './getTemplate';
import { replaceHexToRgb } from './replace';

const ATTRIBUTE_FILL_MAP = ['path'];

export const generateComponent = async (data: XmlData, config: Config) => {
  const svgTemplates: Record<string, string> = {};
  const names: string[] = [];
  const saveDir = path.resolve(config.save_dir);

  mkdirp.sync(saveDir);
  glob.sync(path.join(saveDir, '*')).forEach(file => fs.unlinkSync(file));

  data.svg.symbol.forEach(item => {
    const iconId = item.$.id;
    const iconIdAfterTrim = config.trim_icon_prefix
      ? iconId.replace(new RegExp(`^${config.trim_icon_prefix}(.+?)$`), (_, value) =>
          value.replace(/^[-_.=+#@!~*]+(.+?)$/, '$1'),
        )
      : iconId;

    names.push(iconIdAfterTrim);
    svgTemplates[iconIdAfterTrim] = ` url("data:image/svg+xml, ${generateCase(item)}")`;

    console.log(`${colors.green('√')} Generated icon "${colors.yellow(iconId)}"`);
  });

  fs.writeFileSync(path.join(saveDir, 'index.scss'), getTemplate('taro.scss'));
  fs.writeFileSync(
    path.join(saveDir, 'index.tsx'),
    getTemplate('taro.tsx')
      .replace('#names#', names.map(item => `'${item}'`).join('|'))
      .replace('#svgMap#', JSON.stringify(svgTemplates, null, 2)),
  );

  console.log(
    `\n${colors.green('√')} All icons have been putted into dir: ${colors.green(
      config.save_dir,
    )}\n`,
  );
};

const generateCase = (data: XmlData['svg']['symbol'][number]) => {
  let template = `<svg viewBox='${data.$.viewBox}' xmlns='http://www.w3.org/2000/svg' width='#size#rpx' height='#size#rpx'>`;

  for (const domName of Object.keys(data)) {
    if (domName === '$') {
      continue;
    }

    const counter = {
      colorIndex: 0,
    };

    if (data[domName].$) {
      template += `<${domName}${addAttribute(domName, data[domName], counter)} />`;
    } else if (Array.isArray(data[domName])) {
      data[domName].forEach(sub => {
        template += `<${domName}${addAttribute(domName, sub, counter)} />`;
      });
    }
  }

  template += `</svg>`;

  return template.replace(/<|>/g, matched => encodeURI(matched));
};

const addAttribute = (
  domName: string,
  sub: XmlData['svg']['symbol'][number]['path'][number],
  counter: { colorIndex: number },
) => {
  let template = '';

  if (sub?.$) {
    if (ATTRIBUTE_FILL_MAP.includes(domName)) {
      // Set default color same as in iconfont.cn
      // And create placeholder to inject color by user's behavior
      sub.$.fill = sub.$.fill || '#666666';
    }

    for (const attributeName of Object.keys(sub.$)) {
      if (attributeName === 'fill') {
        const color: string | undefined = replaceHexToRgb(sub.$[attributeName]);
        template += ` ${attributeName}= '${color}'`;
        counter.colorIndex += 1;
      } else {
        template += ` ${attributeName}='${sub.$[attributeName]}'`;
      }
    }
  }

  return template;
};
