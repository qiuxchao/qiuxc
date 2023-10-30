#!/usr/bin/env node
'use strict';

const colors = require('colors');
const path = require('path');
const fs = require('fs');
const minimist = require('minimist');
const axios = require('axios');
const xml2js = require('xml2js');
const mkdirp = require('mkdirp');
const glob = require('glob');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const colors__default = /*#__PURE__*/_interopDefaultCompat(colors);
const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const minimist__default = /*#__PURE__*/_interopDefaultCompat(minimist);
const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);
const mkdirp__default = /*#__PURE__*/_interopDefaultCompat(mkdirp);
const glob__default = /*#__PURE__*/_interopDefaultCompat(glob);

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
  const args = minimist__default(process.argv.slice(2));
  let configFilePath = "iconfont.json";
  if (args.config && typeof args.config === "string") {
    configFilePath = args.config;
  }
  const targetFile = path__default.resolve(configFilePath);
  if (!fs__default.existsSync(targetFile)) {
    console.warn(
      colors__default.red(
        `File "${configFilePath}" doesn't exist, did you forget to generate it?`
      )
    );
    process.exit(1);
  }
  const config = require(targetFile);
  if (!config.symbol_url || !/^(https?:)?\/\//.test(config.symbol_url)) {
    console.warn(colors__default.red("You are required to provide symbol_url"));
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
    const { data } = await axios__default.get(url);
    const matches = String(data).match(/'<svg>(.+?)<\/svg>'/);
    if (matches) {
      return new Promise((resolve, reject) => {
        xml2js.parseString(
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
    console.error(colors__default.red(e.message || "Unknown Error"));
    process.exit(1);
    throw e;
  }
};

const getTemplate = (fileName) => {
  return fs__default.readFileSync(path__default.join(__dirname, `./templates/${fileName}.template`)).toString();
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
  const saveDir = path__default.resolve(config.save_dir);
  mkdirp__default.sync(saveDir);
  glob__default.sync(path__default.join(saveDir, "*")).forEach((file) => fs__default.unlinkSync(file));
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
      `${colors__default.green("\u221A")} Generated icon "${colors__default.yellow(iconId)}"`
    );
  });
  fs__default.writeFileSync(path__default.join(saveDir, "index.scss"), getTemplate("taro.scss"));
  fs__default.writeFileSync(
    path__default.join(saveDir, "index.tsx"),
    getTemplate("taro.tsx").replace("#names#", names.map((item) => `'${item}'`).join("|")).replace("#svgMap#", JSON.stringify(svgTemplates, null, 2))
  );
  console.log(
    `
${colors__default.green("\u221A")} All icons have been putted into dir: ${colors__default.green(
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
  console.error(colors__default.red(e.message || "Unknown Error"));
  process.exit(1);
});
