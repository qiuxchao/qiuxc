'use strict';

const consola = require('consola');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');
const vtils = require('vtils');
const axios = require('axios');
const changeCase = require('change-case');
const prettier = require('prettier');
const esbuild = require('esbuild');
const jsonSchemaToTypescript = require('json-schema-to-typescript');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

function _interopNamespaceCompat(e) {
	if (e && typeof e === 'object' && 'default' in e) return e;
	const n = Object.create(null);
	if (e) {
		for (const k in e) {
			n[k] = e[k];
		}
	}
	n.default = e;
	return n;
}

const consola__default = /*#__PURE__*/_interopDefaultCompat(consola);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const fs__namespace = /*#__PURE__*/_interopNamespaceCompat(fs);
const ora__default = /*#__PURE__*/_interopDefaultCompat(ora);
const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const axios__default = /*#__PURE__*/_interopDefaultCompat(axios);
const changeCase__namespace = /*#__PURE__*/_interopNamespaceCompat(changeCase);
const prettier__default = /*#__PURE__*/_interopDefaultCompat(prettier);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var dayjs_min = {exports: {}};

(function (module, exports) {
	!function(t,e){module.exports=e();}(commonjsGlobal,(function(){var t=1e3,e=6e4,n=36e5,r="millisecond",i="second",s="minute",u="hour",a="day",o="week",f="month",h="quarter",c="year",d="date",$="Invalid Date",l=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,y=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,M={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_")},m=function(t,e,n){var r=String(t);return !r||r.length>=e?t:""+Array(e+1-r.length).join(n)+t},g={s:m,z:function(t){var e=-t.utcOffset(),n=Math.abs(e),r=Math.floor(n/60),i=n%60;return (e<=0?"+":"-")+m(r,2,"0")+":"+m(i,2,"0")},m:function t(e,n){if(e.date()<n.date())return -t(n,e);var r=12*(n.year()-e.year())+(n.month()-e.month()),i=e.clone().add(r,f),s=n-i<0,u=e.clone().add(r+(s?-1:1),f);return +(-(r+(n-i)/(s?i-u:u-i))||0)},a:function(t){return t<0?Math.ceil(t)||0:Math.floor(t)},p:function(t){return {M:f,y:c,w:o,d:a,D:d,h:u,m:s,s:i,ms:r,Q:h}[t]||String(t||"").toLowerCase().replace(/s$/,"")},u:function(t){return void 0===t}},v="en",D={};D[v]=M;var p=function(t){return t instanceof _},S=function t(e,n,r){var i;if(!e)return v;if("string"==typeof e){var s=e.toLowerCase();D[s]&&(i=s),n&&(D[s]=n,i=s);var u=e.split("-");if(!i&&u.length>1)return t(u[0])}else {var a=e.name;D[a]=e,i=a;}return !r&&i&&(v=i),i||!r&&v},w=function(t,e){if(p(t))return t.clone();var n="object"==typeof e?e:{};return n.date=t,n.args=arguments,new _(n)},O=g;O.l=S,O.i=p,O.w=function(t,e){return w(t,{locale:e.$L,utc:e.$u,x:e.$x,$offset:e.$offset})};var _=function(){function M(t){this.$L=S(t.locale,null,!0),this.parse(t);}var m=M.prototype;return m.parse=function(t){this.$d=function(t){var e=t.date,n=t.utc;if(null===e)return new Date(NaN);if(O.u(e))return new Date;if(e instanceof Date)return new Date(e);if("string"==typeof e&&!/Z$/i.test(e)){var r=e.match(l);if(r){var i=r[2]-1||0,s=(r[7]||"0").substring(0,3);return n?new Date(Date.UTC(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)):new Date(r[1],i,r[3]||1,r[4]||0,r[5]||0,r[6]||0,s)}}return new Date(e)}(t),this.$x=t.x||{},this.init();},m.init=function(){var t=this.$d;this.$y=t.getFullYear(),this.$M=t.getMonth(),this.$D=t.getDate(),this.$W=t.getDay(),this.$H=t.getHours(),this.$m=t.getMinutes(),this.$s=t.getSeconds(),this.$ms=t.getMilliseconds();},m.$utils=function(){return O},m.isValid=function(){return !(this.$d.toString()===$)},m.isSame=function(t,e){var n=w(t);return this.startOf(e)<=n&&n<=this.endOf(e)},m.isAfter=function(t,e){return w(t)<this.startOf(e)},m.isBefore=function(t,e){return this.endOf(e)<w(t)},m.$g=function(t,e,n){return O.u(t)?this[e]:this.set(n,t)},m.unix=function(){return Math.floor(this.valueOf()/1e3)},m.valueOf=function(){return this.$d.getTime()},m.startOf=function(t,e){var n=this,r=!!O.u(e)||e,h=O.p(t),$=function(t,e){var i=O.w(n.$u?Date.UTC(n.$y,e,t):new Date(n.$y,e,t),n);return r?i:i.endOf(a)},l=function(t,e){return O.w(n.toDate()[t].apply(n.toDate("s"),(r?[0,0,0,0]:[23,59,59,999]).slice(e)),n)},y=this.$W,M=this.$M,m=this.$D,g="set"+(this.$u?"UTC":"");switch(h){case c:return r?$(1,0):$(31,11);case f:return r?$(1,M):$(0,M+1);case o:var v=this.$locale().weekStart||0,D=(y<v?y+7:y)-v;return $(r?m-D:m+(6-D),M);case a:case d:return l(g+"Hours",0);case u:return l(g+"Minutes",1);case s:return l(g+"Seconds",2);case i:return l(g+"Milliseconds",3);default:return this.clone()}},m.endOf=function(t){return this.startOf(t,!1)},m.$set=function(t,e){var n,o=O.p(t),h="set"+(this.$u?"UTC":""),$=(n={},n[a]=h+"Date",n[d]=h+"Date",n[f]=h+"Month",n[c]=h+"FullYear",n[u]=h+"Hours",n[s]=h+"Minutes",n[i]=h+"Seconds",n[r]=h+"Milliseconds",n)[o],l=o===a?this.$D+(e-this.$W):e;if(o===f||o===c){var y=this.clone().set(d,1);y.$d[$](l),y.init(),this.$d=y.set(d,Math.min(this.$D,y.daysInMonth())).$d;}else $&&this.$d[$](l);return this.init(),this},m.set=function(t,e){return this.clone().$set(t,e)},m.get=function(t){return this[O.p(t)]()},m.add=function(r,h){var d,$=this;r=Number(r);var l=O.p(h),y=function(t){var e=w($);return O.w(e.date(e.date()+Math.round(t*r)),$)};if(l===f)return this.set(f,this.$M+r);if(l===c)return this.set(c,this.$y+r);if(l===a)return y(1);if(l===o)return y(7);var M=(d={},d[s]=e,d[u]=n,d[i]=t,d)[l]||1,m=this.$d.getTime()+r*M;return O.w(m,this)},m.subtract=function(t,e){return this.add(-1*t,e)},m.format=function(t){var e=this,n=this.$locale();if(!this.isValid())return n.invalidDate||$;var r=t||"YYYY-MM-DDTHH:mm:ssZ",i=O.z(this),s=this.$H,u=this.$m,a=this.$M,o=n.weekdays,f=n.months,h=function(t,n,i,s){return t&&(t[n]||t(e,r))||i[n].slice(0,s)},c=function(t){return O.s(s%12||12,t,"0")},d=n.meridiem||function(t,e,n){var r=t<12?"AM":"PM";return n?r.toLowerCase():r},l={YY:String(this.$y).slice(-2),YYYY:this.$y,M:a+1,MM:O.s(a+1,2,"0"),MMM:h(n.monthsShort,a,f,3),MMMM:h(f,a),D:this.$D,DD:O.s(this.$D,2,"0"),d:String(this.$W),dd:h(n.weekdaysMin,this.$W,o,2),ddd:h(n.weekdaysShort,this.$W,o,3),dddd:o[this.$W],H:String(s),HH:O.s(s,2,"0"),h:c(1),hh:c(2),a:d(s,u,!0),A:d(s,u,!1),m:String(u),mm:O.s(u,2,"0"),s:String(this.$s),ss:O.s(this.$s,2,"0"),SSS:O.s(this.$ms,3,"0"),Z:i};return r.replace(y,(function(t,e){return e||l[t]||i.replace(":","")}))},m.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},m.diff=function(r,d,$){var l,y=O.p(d),M=w(r),m=(M.utcOffset()-this.utcOffset())*e,g=this-M,v=O.m(this,M);return v=(l={},l[c]=v/12,l[f]=v,l[h]=v/3,l[o]=(g-m)/6048e5,l[a]=(g-m)/864e5,l[u]=g/n,l[s]=g/e,l[i]=g/t,l)[y]||g,$?v:O.a(v)},m.daysInMonth=function(){return this.endOf(f).$D},m.$locale=function(){return D[this.$L]},m.locale=function(t,e){if(!t)return this.$L;var n=this.clone(),r=S(t,e,!0);return r&&(n.$L=r),n},m.clone=function(){return O.w(this.$d,this)},m.toDate=function(){return new Date(this.valueOf())},m.toJSON=function(){return this.isValid()?this.toISOString():null},m.toISOString=function(){return this.$d.toISOString()},m.toString=function(){return this.$d.toUTCString()},M}(),T=_.prototype;return w.prototype=T,[["$ms",r],["$s",i],["$m",s],["$H",u],["$W",a],["$M",f],["$y",c],["$D",d]].forEach((function(t){T[t[1]]=function(e){return this.$g(e,t[0],t[1])};})),w.extend=function(t,e){return t.$i||(t(e,_,w),t.$i=!0),w},w.locale=S,w.isDayjs=p,w.unix=function(t){return w(1e3*t)},w.en=D[v],w.Ls=D,w.p={},w})); 
} (dayjs_min));

var dayjs_minExports = dayjs_min.exports;
const dayjs = /*@__PURE__*/getDefaultExportFromCjs(dayjs_minExports);

const JSTTOptions = {
  bannerComment: "",
  style: {
    bracketSpacing: false,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: "none",
    useTabs: false
  }
};
function toUnixPath(path2) {
  return path2.replace(/[/\\]+/g, "/");
}
function traverseJsonSchema(jsonSchema, cb, currentPath = []) {
  if (!vtils.isObject(jsonSchema))
    return jsonSchema;
  if (vtils.isArray(jsonSchema.properties)) {
    jsonSchema.properties = jsonSchema.properties.reduce((props, js) => {
      props[js.name] = js;
      return props;
    }, {});
  }
  cb(jsonSchema, currentPath);
  if (jsonSchema.properties) {
    vtils.forOwn(
      jsonSchema.properties,
      (item, key) => traverseJsonSchema(item, cb, [...currentPath, key])
    );
  }
  if (jsonSchema.items) {
    vtils.castArray(jsonSchema.items).forEach(
      (item, index) => traverseJsonSchema(item, cb, [...currentPath, index])
    );
  }
  if (jsonSchema.oneOf) {
    jsonSchema.oneOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  if (jsonSchema.anyOf) {
    jsonSchema.anyOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  if (jsonSchema.allOf) {
    jsonSchema.allOf.forEach((item) => traverseJsonSchema(item, cb, currentPath));
  }
  return jsonSchema;
}
function jsonSchemaToJSTTJsonSchema(jsonSchema, typeName) {
  if (jsonSchema) {
    delete jsonSchema.description;
  }
  return traverseJsonSchema(jsonSchema, (jsonSchema2, currentPath) => {
    const refValue = jsonSchema2.title === null ? jsonSchema2.description : jsonSchema2.title;
    if (refValue?.startsWith("&")) {
      const typeRelativePath = refValue.substring(1);
      const typeAbsolutePath = toUnixPath(
        path__default.resolve(
          path__default.dirname(`/${currentPath.join("/")}`.replace(/\/{2,}/g, "/")),
          typeRelativePath
        ).replace(/^[a-z]+:/i, "")
      );
      const typeAbsolutePathArr = typeAbsolutePath.split("/").filter(Boolean);
      let tsTypeLeft = "";
      let tsTypeRight = typeName;
      for (const key of typeAbsolutePathArr) {
        tsTypeLeft += "NonNullable<";
        tsTypeRight += `[${JSON.stringify(key)}]>`;
      }
      const tsType = `${tsTypeLeft}${tsTypeRight}`;
      jsonSchema2.tsType = tsType;
    }
    delete jsonSchema2.title;
    delete jsonSchema2.id;
    delete jsonSchema2.minItems;
    delete jsonSchema2.maxItems;
    if (jsonSchema2.type === "object") {
      jsonSchema2.additionalProperties = false;
    }
    delete jsonSchema2.default;
    return jsonSchema2;
  });
}
async function jsonSchemaToType(jsonSchema, typeName) {
  if (vtils.isEmpty(jsonSchema)) {
    return `export interface ${typeName} {}`;
  }
  if (jsonSchema.__is_any__) {
    delete jsonSchema.__is_any__;
    return `export type ${typeName} = any`;
  }
  const fakeTypeName = "THISISAFAKETYPENAME";
  const code = await jsonSchemaToTypescript.compile(
    jsonSchemaToJSTTJsonSchema(vtils.cloneDeepFast(jsonSchema), typeName),
    fakeTypeName,
    JSTTOptions
  );
  return code.replace(fakeTypeName, typeName).trim();
}
const genComment = ({
  title = "",
  method = "",
  path: path2 = "",
  url = "",
  type = "method"
} = {}) => {
  const escapedTitle = String(title).replace(/\//g, "\\/");
  const summary = [
    {
      label: "\u8BF7\u6C42\u5934",
      value: `\`${method.toUpperCase()} ${path2}\``
    },
    {
      label: "\u66F4\u65B0\u65F6\u95F4",
      value: `\`${dayjs().format("YYYY-MM-DD HH:mm:ss")}\``
    }
  ];
  const description = url ? `[${escapedTitle}\u2197](${url})` : escapedTitle;
  const titleComment = vtils.dedent`
  * ${type !== "method" ? "\u63A5\u53E3 " : ""}${description}${type !== "method" ? type === "requestType" ? " \u7684 **\u8BF7\u6C42\u7C7B\u578B**" : " \u7684 **\u54CD\u5E94\u7C7B\u578B**" : ""}
  *
`;
  const extraComment = summary.filter((item) => typeof item !== "boolean" && !vtils.isEmpty(item.value)).map((item) => {
    const _item = item;
    return `* @${_item.label} ${vtils.castArray(_item.value).join(", ")}`;
  }).join("\n");
  return vtils.dedent`
    /**
     ${[titleComment, extraComment].filter(Boolean).join("\n")}
     */
  `;
};
async function getPrettierOptions() {
  const prettierOptions = {
    parser: "typescript",
    // 解析器为typescript
    printWidth: 120,
    // 打印宽度为120
    tabWidth: 2,
    // 栅格符宽度为2
    singleQuote: true,
    // 使用单引号
    semi: false,
    // 不使用分号
    trailingComma: "all",
    // 添加所有可解析的尾随逗号
    bracketSpacing: false,
    // 不在大括号内添加间距
    endOfLine: "lf"
    // 使用LF作为行尾标识符
  };
  const [prettierConfigPathErr, prettierConfigPath] = await vtils.run(() => prettier__default.resolveConfigFile());
  if (prettierConfigPathErr || !prettierConfigPath) {
    return prettierOptions;
  }
  const [prettierConfigErr, prettierConfig] = await vtils.run(
    () => prettier__default.resolveConfig(prettierConfigPath)
  );
  if (prettierConfigErr || !prettierConfig) {
    return prettierOptions;
  }
  return {
    ...prettierOptions,
    ...prettierConfig,
    parser: "typescript"
    // 解析器为typescript
  };
}
const getCachedPrettierOptions = vtils.memoize(getPrettierOptions);
const isJavaScriptKeyword = (str) => {
  const keywords = [
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "debugger",
    "default",
    "delete",
    "do",
    "else",
    "export",
    "extends",
    "finally",
    "for",
    "function",
    "if",
    "import",
    "in",
    "instanceof",
    "new",
    "return",
    "super",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "var",
    "void",
    "while",
    "with",
    "yield",
    // ECMAScript 6 keywords
    "enum",
    "await",
    "implements",
    "package",
    "protected",
    "interface",
    "private",
    "public",
    "static"
  ];
  return keywords.includes(str.toLowerCase());
};
const transformWithEsbuild = async (code, filename) => {
  let loader = "js";
  const ext = path__default.extname(filename).slice(1);
  if (ext === "cjs" || ext === "mjs") {
    loader = "js";
  } else if (ext === "cts" || ext === "mts") {
    loader = "ts";
  } else {
    loader = ext;
  }
  const result = await esbuild.transform(code, {
    sourcefile: filename,
    loader,
    target: "es2020",
    platform: "node",
    format: "esm"
  });
  return result;
};
async function loadESModule(filepath) {
  const handle = await import(`${filepath}?${Date.now()}`);
  return handle.default;
}
async function loadModule(filepath, tempPath, isESM = true) {
  const ext = path__default.extname(filepath);
  let jsFilePath = filepath;
  if (ext === ".ts" || ext === ".js" && !isESM) {
    const tsText = fs.readFileSync(filepath, "utf-8");
    const { code } = await transformWithEsbuild(tsText, filepath);
    const tempFile = path__default.join(process.cwd(), tempPath, filepath.replace(/\.(ts|js)$/, ".mjs"));
    const tempBasename = path__default.dirname(tempFile);
    fs.mkdirSync(tempBasename, { recursive: true });
    fs.writeFileSync(tempFile, code, "utf8");
    jsFilePath = tempFile;
  }
  const content = await loadESModule(jsFilePath);
  return {
    content,
    jsFilePath
  };
}
const throwError = (...msg) => {
  throw new Error(msg.join(""));
};

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class Generator {
  constructor(config, cwd) {
    __publicField(this, "pathObj", {});
    __publicField(this, "componentsSchemas", {});
    __publicField(this, "typeCode", "");
    __publicField(this, "methodCodes", []);
    __publicField(this, "outputTypePath");
    __publicField(this, "outputIndexPath");
    __publicField(this, "config");
    __publicField(this, "cwd");
    this.outputTypePath = path__default.resolve(cwd, `${config.apiDirPath ?? "src/api"}/typings.d.ts`);
    this.outputIndexPath = path__default.resolve(cwd, `${config.apiDirPath ?? "src/api"}/index.ts`);
    this.config = config;
    this.cwd = cwd;
  }
  async prepare(url) {
    if (url) {
      const res = await axios__default.get(url);
      if (res?.data?.paths) {
        this.pathObj = res.data.paths;
      } else {
        throwError("\u63A5\u53E3\u6587\u6863\u683C\u5F0F\u9519\u8BEF");
      }
      if (res?.data?.components?.schemas) {
        const schemas = res.data.components.schemas;
        Object.keys(schemas).forEach((key) => {
          schemas[key] = this.handleRefs(schemas[key], schemas);
        });
        this.componentsSchemas = schemas;
      }
    }
  }
  async generate() {
    const pathKeys = Object.keys(this.pathObj);
    await Promise.all(
      pathKeys.filter((p) => p !== "/").map(async (p) => {
        const target = this.pathObj[p];
        const typeName = changeCase__namespace.pascalCase(p.split("/").slice(1).join("-"));
        const isGet = !!target.get;
        const method = isGet ? "get" : "post";
        const parameters = target?.get?.parameters;
        let requestSchema = {
          type: "object",
          properties: {}
        };
        let responseSchema = {
          type: "object",
          properties: {}
        };
        if (isGet && parameters && Array.isArray(parameters)) {
          parameters.forEach(
            (item) => {
              requestSchema.properties[item.name] = {
                type: item.schema.type,
                description: item.description
              };
            }
          );
        } else {
          if (target?.[method]?.requestBody?.content?.["application/json"]?.schema) {
            requestSchema = this.handleRefs(
              target[method].requestBody.content["application/json"].schema
            );
          }
        }
        if (target?.[method]?.responses?.["200"]?.content?.["application/json"]?.schema) {
          responseSchema = this.handleRefs(
            target[method].responses["200"].content["application/json"].schema
          );
        }
        const reqType = await jsonSchemaToType(requestSchema, `${typeName}Request`);
        const resType = await jsonSchemaToType(responseSchema, `${typeName}Response`);
        const title = target?.[method]?.summary ?? "";
        const url = target?.[method]?.["x-run-in-apifox"] ?? "";
        const reqTypeComment = genComment({
          title,
          method,
          path: p,
          type: "requestType",
          url
        });
        const resTypeComment = genComment({
          title,
          method,
          path: p,
          type: "responseType",
          url
        });
        const typeCode = vtils.dedent`
        ${reqTypeComment}
        ${reqType}

        ${resTypeComment}
        ${resType}

        `;
        this.typeCode += `

${typeCode}`;
        const [_, modelPath, ...other] = p.split("/");
        const funcOutputFilePath = path__default.resolve(
          this.cwd,
          `${this.config.apiDirPath ?? "src/api"}/${other.length > 0 ? `${changeCase__namespace.camelCase(modelPath)}Api.ts` : "indexApi.ts"}`
        );
        const funcName = changeCase__namespace.camelCase(other.length > 0 ? other.join("-") : modelPath);
        const funcComment = genComment({
          title,
          method,
          path: p,
          url,
          type: "method"
        });
        const methodCode = vtils.dedent`
        ${funcComment}
        export const ${isJavaScriptKeyword(funcName) ? `${funcName}Api` : funcName} = <R extends boolean = true>(
            ${this.handleEmptyReqData(`${typeName}Request`, reqType)}: API.${typeName}Request,
            options?: GetOptionsType<typeof request> & { returnData?: R }
          ) => request<GetResponseType<API.${typeName}Response, R>>('${p}', '${method.toUpperCase()}', data, options);
            `;
        this.methodCodes.push({
          code: methodCode,
          outputPath: funcOutputFilePath
        });
      })
    );
  }
  async write() {
    const prettyTypeContent = prettier__default.format(this.typeCode, {
      ...await getCachedPrettierOptions(),
      filepath: this.outputTypePath
    });
    const outputTypeContent = vtils.dedent`
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
    await fs__default.outputFile(this.outputTypePath, outputTypeContent);
    const groupedMethodCodes = vtils.groupBy(this.methodCodes, (item) => item.outputPath);
    await Promise.all(
      Object.keys(groupedMethodCodes).map(async (outputPath) => {
        const methodCodes = groupedMethodCodes[outputPath];
        const prettyMethodContent = prettier__default.format(
          methodCodes.map((item) => item.code).join("\n\n"),
          {
            ...await getCachedPrettierOptions(),
            filepath: outputPath
          }
        );
        const outputMethodContent = vtils.dedent`
        /* prettier-ignore-start */
        /* tslint:disable */
        /* eslint-disable */

        import request from '${this.config.requestPath || "./../request/index"}';

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
        await fs__default.outputFile(outputPath, outputMethodContent);
      })
    );
    const methodPaths = Object.keys(groupedMethodCodes).map(
      (outputPath) => {
        return {
          path: outputPath,
          name: path__default.basename(outputPath, ".ts")
        };
      }
    );
    let indexContent = "";
    methodPaths.forEach((item) => {
      indexContent += `import * as ${item.name} from './${item.name}';
`;
    });
    indexContent += `

export { ${methodPaths.map((item) => item.name).join(",")} };
`;
    const prettyIndexContent = prettier__default.format(indexContent, {
      ...await getCachedPrettierOptions(),
      filepath: this.outputIndexPath
    });
    const outputIndexContent = vtils.dedent`
    /* prettier-ignore-start */
    /* tslint:disable */
    /* eslint-disable */

    /* 该文件工具自动生成，请勿直接修改！！！ */

    // @ts-ignore

    ${prettyIndexContent}

    /* prettier-ignore-end */
    `;
    await fs__default.outputFile(this.outputIndexPath, outputIndexContent);
  }
  // 递归处理refs
  handleRefs(schema = {}, componentsSchemas) {
    if (!schema.type && !schema.$ref)
      return;
    if (schema.type && schema.type === "object") {
      const keys = Object.keys(schema.properties);
      keys.forEach((key) => {
        const target = schema.properties[key];
        if (target.$ref) {
          const ref = target.$ref.replace("#/components/schemas/", "");
          const refSchema = (componentsSchemas || this.componentsSchemas)[ref];
          delete target.$ref;
          Object.assign(target, refSchema);
        }
        if (target.type === "array") {
          this.handleRefs(target.items);
        }
        if (target.type === "object") {
          Object.keys(target.properties).forEach((subKey) => {
            target.properties[subKey] = this.handleRefs(target.properties[subKey]);
          });
        }
      });
    }
    if (schema.type === "array") {
      this.handleRefs(schema.items);
    }
    if (schema.$ref) {
      const ref = schema.$ref.replace("#/components/schemas/", "");
      const refSchema = this.componentsSchemas[ref];
      delete schema.$ref;
      Object.assign(schema, refSchema);
    }
    return schema;
  }
  // 处理请求为空的情况
  handleEmptyReqData(reqTypeName, reqType) {
    const reg = new RegExp(`${reqTypeName} {}`);
    const isEmpty = reg.test(reqType);
    return `data${isEmpty ? "?" : ""}`;
  }
}

function init(cwd) {
  const configPath = path__default.resolve(cwd, `att.config.ts`);
  if (fs__namespace.existsSync(configPath)) {
    consola__default.warn(`\u914D\u7F6E\u6587\u4EF6\u5DF2\u5B58\u5728: ${configPath}`);
    return;
  }
  const templatePath = path__default.resolve(__dirname, `./config.template`);
  fs__namespace.copyFileSync(templatePath, configPath);
  consola__default.success(`\u914D\u7F6E\u6587\u4EF6\u5DF2\u751F\u6210: ${configPath}`);
}

const att = async (config, cwd) => {
  const generator = new Generator(config, cwd);
  const spinner = ora__default("\u6B63\u5728\u83B7\u53D6\u63A5\u53E3\u6570\u636E...").start();
  try {
    await generator.prepare(config.serverUrl);
    spinner.text = "\u6B63\u5728\u89E3\u6790\u63A5\u53E3\u6570\u636E...";
    const delayNotice = vtils.wait(5e3);
    delayNotice.then(() => {
      spinner.text = `\u6B63\u5728\u89E3\u6790\u63A5\u53E3\u6570\u636E... (\u82E5\u957F\u65F6\u95F4\u5904\u4E8E\u6B64\u72B6\u6001\uFF0C\u8BF7\u68C0\u67E5\u662F\u5426\u6709\u63A5\u53E3\u5B9A\u4E49\u7684\u6570\u636E\u8FC7\u5927\u5BFC\u81F4\u89E3\u6790\u7F13\u6162)`;
    });
    await generator.generate();
    spinner.text = "\u6B63\u5728\u5199\u5165\u6587\u4EF6...";
    await generator.write();
    delayNotice.cancel();
    spinner.stop();
    consola__default.success("\u5199\u5165\u6587\u4EF6\u5B8C\u6BD5");
  } catch (err) {
    spinner?.stop();
    consola__default.error(err);
  }
};
const run = async (cwd) => {
  const configFile = path__default.join(cwd, "att.config.ts");
  const configFileExist = await fs__default.pathExists(configFile);
  if (!configFileExist) {
    return consola__default.error(`\u627E\u4E0D\u5230\u914D\u7F6E\u6587\u4EF6: ${configFile}`);
  }
  consola__default.success(`\u627E\u5230\u914D\u7F6E\u6587\u4EF6: ${configFile}`);
  const packageJson = await fs__default.readJSON(path__default.resolve(cwd, "package.json"));
  const isESM = packageJson.type === "module";
  const { content: config } = await loadModule(
    configFile,
    "node_modules/.cache/.att_config",
    isESM
  );
  await att(config, cwd);
};
if (require.main === module) {
  const { argv } = process;
  if (argv.includes("init")) {
    init(process.cwd());
  } else {
    run(process.cwd());
  }
}
