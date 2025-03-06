/**
 * 给打包后的文件增加相关配置。
 * 想法：
 * 使用uni-app打包成百度小程序时，uni-app配置不了百度小程序中的project.swan.json文件，就考虑用这种方式添加。
 * 然后考虑不能只往project.swan.json中加，万一打包其他小程序，其他小程序有其他的配置文件，又得写个这种插件。
 * 所以需要写个通用的给打包后的文件增加配置的插件  传入打包后的文件路径和需要添加配置，给传入的文件路径的文件添加传入的配置。没有这个文件创建这个文件赋值传入的配置。
 * 又考虑到或许需要添加多个文件的配置，所以传入一个数组
 * [{path: "文件路径", content: 内容, config: { isAttrMerge: 属性是否合并（默认true合并，为false时直接替换，只有为数组和对象时这样） }}]
 */
module.exports = class AddConfigToBuildLast {
  constructor(options){
    // options为一个数组，数组中的为一个对象，对象有两个属性path：文件路径；config：配置
    this.options = options || [];
  }

  apply (compiler) {
    if(!this.options.length) return
    compiler.hooks.emit.tap('AddConfigToBuildLast', (compilation) => {
      for(let i = 0; i < this.options.length; i++){
        let optionItem = this.options[i];
        if(!optionItem.path){
          continue
        }
        const { filePath, fileType } = parsePath(optionItem.path)
        let fileConfig = compilation.assets[filePath]
        if(fileType == "json"){
          if(fileConfig){
            try {
              let fileJson = JSON.parse(fileConfig.source());
              fileJson = mergeOrReplace(fileJson, optionItem);
              updateAsset(compilation, filePath, JSON.stringify(fileJson));
            } catch (error) {
              console.error(`Error processing JSON file ${filePath}:`, error);
            }
          
          }else{
            updateAsset(compilation, filePath, JSON.stringify(optionItem.content));
          }
        }else{
          updateAsset(compilation, filePath, optionItem.content);
        }
        
      }
    })
  }
}


/**
 * 处理路径信息
 * 并且把文件路径处理成{path: 文件路径, type: 文件类型}
 */
const parsePath = pathStr => {
  const pathRegex = /^(?!.*\/\.\.\/).+\.[a-zA-Z0-9]+$/;
  if (typeof pathStr !== 'string' || pathStr.startsWith("/") || pathStr.startsWith("../") || !pathRegex.test(pathStr)) {
    throw new Error(`${pathStr}路径不正确，正确的路径应该为类似：xxx/xxx/xxx.xxx`);
  }
  let pathArr = pathStr.split("/");
  let fileName = pathArr[pathArr.length - 1]
  let fileNameArr = fileName.split(".");
  let type = "";
  if(fileNameArr.length > 1){
    type = fileNameArr[fileNameArr.length - 1]
  }
  return {
    filePath: pathStr,
    fileType: type
  }
}


const mergeOrReplace = (target, optionItem) => {
  let { content, config = {} } = optionItem;
  let { isAttrMerge = true } = config;
  for (const key in content) {
    if (target.hasOwnProperty(key)) {
      if (isAttrMerge) {
        if (Object.prototype.toString.call(target[key]) === '[object Object]' && Object.prototype.toString.call(content[key]) === '[object Object]') {
          target[key] = { ...target[key], ...content[key] };
        } else if (Array.isArray(target[key]) && Array.isArray(content[key])) {
          target[key] = [...target[key], ...content[key]];
        } else {
          target[key] = content[key];
        }
      } else {
        target[key] = content[key];
      }
    } else {
      target[key] = content[key];
    }
  }
  return target;
}

const updateAsset = (compilation, filePath, content) => {
  compilation.assets[filePath] = {
    source: () => content,
    size: () => content.length
  }
}