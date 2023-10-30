#!/usr/bin/env node
import colors from 'colors';
import path from 'path';
import fs from 'fs';
import minimist from 'minimist';
import axios from 'axios';
import { parseString } from 'xml2js';
import mkdirp from 'mkdirp';
import glob from 'glob';

const symbol_url = "";
const save_dir = "./iconfont";
const use_rpx = false;
const trim_icon_prefix = "icon";
const default_icon_size = 18;
const defaultConfig = {
	symbol_url: symbol_url,
	save_dir: save_dir,
	use_rpx: use_rpx,
	trim_icon_prefix: trim_icon_prefix,
	default_icon_size: default_icon_size
};

let cacheConfig;
const getConfig = () => {
  if (cacheConfig) {
    return cacheConfig;
  }
  const args = minimist(process.argv.slice(2));
  let configFilePath = "iconfont.json";
  if (args.config && typeof args.config === "string") {
    configFilePath = args.config;
  }
  const targetFile = path.resolve(configFilePath);
  if (!fs.existsSync(targetFile)) {
    console.warn(
      colors.red(
        `File "${configFilePath}" doesn't exist, did you forget to generate it?`
      )
    );
    process.exit(1);
  }
  const config = require(targetFile);
  if (!config.symbol_url || !/^(https?:)?\/\//.test(config.symbol_url)) {
    console.warn(colors.red("You are required to provide symbol_url"));
    process.exit(1);
  }
  if (config.symbol_url.indexOf("//") === 0) {
    config.symbol_url = "http:" + config.symbol_url;
  }
  if (config?.font_url?.indexOf("//") === 0) {
    config.font_url = "http:" + config.font_url;
  }
  config.save_dir = config.save_dir || defaultConfig.save_dir;
  config.default_icon_size = config.default_icon_size || defaultConfig.default_icon_size;
  cacheConfig = config;
  return config;
};

const fetchXml = async (url) => {
  console.log("Fetching iconfont data...");
  try {
    const { data } = await axios.get(url);
    const matches = String(data).match(/'<svg>(.+?)<\/svg>'/);
    if (matches) {
      return new Promise((resolve, reject) => {
        parseString(
          `<svg>${matches[1]}</svg>`,
          { rootName: "svg" },
          (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
      });
    }
    throw new Error("You provide a wrong symbol url");
  } catch (e) {
    console.error(colors.red(e.message || "Unknown Error"));
    process.exit(1);
    throw e;
  }
};

const getTemplate = (fileName) => {
  return fs.readFileSync(path.join(__dirname, `./templates/${fileName}.template`)).toString();
};

const replaceHexToRgb = (hex) => {
  const rgb = [];
  hex = hex.substr(1);
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, "$1$1");
  }
  hex.replace(/../g, (color) => {
    rgb.push(parseInt(color, 16));
    return color;
  });
  return "rgb(" + rgb.join(",") + ")";
};

const ATTRIBUTE_FILL_MAP = ["path"];
const generateComponent = async (data, config) => {
  const svgTemplates = {};
  const names = [];
  const saveDir = path.resolve(config.save_dir);
  mkdirp.sync(saveDir);
  glob.sync(path.join(saveDir, "*")).forEach((file) => fs.unlinkSync(file));
  data.svg.symbol.forEach((item) => {
    const iconId = item.$.id;
    const iconIdAfterTrim = config.trim_icon_prefix ? iconId.replace(
      new RegExp(`^${config.trim_icon_prefix}(.+?)$`),
      (_, value) => value.replace(/^[-_.=+#@!~*]+(.+?)$/, "$1")
    ) : iconId;
    names.push(iconIdAfterTrim);
    svgTemplates[iconIdAfterTrim] = ` url("data:image/svg+xml, ${generateCase(
      item
    )}")`;
    console.log(
      `${colors.green("\u221A")} Generated icon "${colors.yellow(iconId)}"`
    );
  });
  fs.writeFileSync(path.join(saveDir, "index.scss"), getTemplate("taro.scss"));
  fs.writeFileSync(
    path.join(saveDir, "index.tsx"),
    getTemplate("taro.tsx").replace("#names#", names.map((item) => `'${item}'`).join("|")).replace("#svgMap#", JSON.stringify(svgTemplates, null, 2))
  );
  console.log(
    `
${colors.green("\u221A")} All icons have been putted into dir: ${colors.green(
      config.save_dir
    )}
`
  );
};
const generateCase = (data) => {
  let template = `<svg viewBox='${data.$.viewBox}' xmlns='http://www.w3.org/2000/svg' width='#size#rpx' height='#size#rpx'>`;
  for (const domName of Object.keys(data)) {
    if (domName === "$") {
      continue;
    }
    const counter = {
      colorIndex: 0
    };
    if (data[domName].$) {
      template += `<${domName}${addAttribute(
        domName,
        data[domName],
        counter
      )} />`;
    } else if (Array.isArray(data[domName])) {
      data[domName].forEach((sub) => {
        template += `<${domName}${addAttribute(domName, sub, counter)} />`;
      });
    }
  }
  template += `</svg>`;
  return template.replace(/<|>/g, (matched) => encodeURI(matched));
};
const addAttribute = (domName, sub, counter) => {
  let template = "";
  if (sub && sub.$) {
    if (ATTRIBUTE_FILL_MAP.includes(domName)) {
      sub.$.fill = sub.$.fill || "#333333";
    }
    for (const attributeName of Object.keys(sub.$)) {
      if (attributeName === "fill") {
        let color;
        color = replaceHexToRgb(sub.$[attributeName]);
        template += ` ${attributeName}= '${color}'`;
        counter.colorIndex += 1;
      } else {
        template += ` ${attributeName}='${sub.$[attributeName]}'`;
      }
    }
  }
  return template;
};

const config = getConfig();
fetchXml(config.symbol_url).then((result) => {
  generateComponent(result, config);
}).catch((e) => {
  console.error(colors.red(e.message || "Unknown Error"));
  process.exit(1);
});
