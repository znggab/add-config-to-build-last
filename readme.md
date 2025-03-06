# add-config-to-build-last
给打包后的目录文件中添加或修改配置插件。

## 为什么要开发这么个插件？
使用uni-app打包成百度小程序时，uni-app配置不了百度小程序中的project.swan.json文件，就考虑用webpack插件的方式添加配合。

## 开发插件中的思考
- 考虑到如果这个插件只支持百度小程序中project.swan.json文件中添加配置，那么开发另一个比如抖音小程序时，也有一个配置文件uni-app不提供相关配置，又得重新写一个添加其他小程序配置的插件。然后再开发另一个小程序比如支付宝小程序等等等，无穷尽也。。。。
**所以需要开发一个通用的，传入文件名，再传入配置项就可以往指定文件添加配置的插件**

- 接着思考，如果不止要往一个文件中添加配置呢？**那么需要传一个数组，每个数组传文件名和配置**

- 接着思考，如果不在要修改配置的文件不在根目录下呢？**那么需要的就不是文件名，而是一个打包后该文件的路径**

- 接着思考，现在是个json文件，那其他文件怎么办呢，不能让他报错呀，而且文件不存在怎么办？**那么传入其他类型的文件，直接替换调文件内容，文件不存在直接创建文件**

-----------------

***所以这个插件可以修改打包后的任意文件，也可以在打包后的任意目录添加文件，开发者一定是需要时再使用该插件，谨慎使用***

## 安装
```js
npm install add-config-to-build-last
```

## 使用
以在project.swan.json中添加相关配置为例
```js
module.exports = {
  configureWebpack: config => {
    config.plugins.push(new AddConfigToBuildLast([
      {
        path: "project.swan.json", // 打包后的文件路径
        content: {  // 需要修改的配置内容
          "compilation-args": {
            "common": {
              "quickPreview": false,
              "ignorePrefixCss": true,
              "ignoreSourceMap": false,
              "ignoreCompileOnDemand": true,
              "useCheapSourceMap": false,
              "useThread": true,
              "enhance": true,
              "useNewCompileUpload": true
            },
            "forceChanged": {},
            "useOldCompiler": false
          },
        },
        config: { // 其他配置
          isAttrMerge: false // 属性是否合并（默认true合并，为false时直接替换，只有修改的配置内容为数组或对象时该配置有效）
        }
      },
    ]))
  }
}
```

## 参数
传入一个数组，数组每一项为需要修改或添加的文件配置。
- path：Stying类型，打包后的文件路径，必须要加后缀名。
>  比如打包后的文件目录为  
>  ```text    
>    -pages  
>      -home
>        home.wxml
>        home.js
>        home.json
>      -index
>        index.js
>        index.wxml
>    app.js
>    app.json   
>  ```
>  - 要修改app.json，那么path: app.json
>  - 要修改pages/home/home.json，那么path: pages/home/home.json
>  - 要在pages/index中添加index.json，那么path: pages/index/index.json
>  - 如果目录中没有该文件，则新建该文件

- content：any类型，要添加或修改的文件内容
>  - 要是json文件传入空对象，那么不会改变文件内容
>  - 除了json文件，传入的内容会直接替换原文件内容

- config：Object类型，其他配置
  - isAttrMerge：属性是否合并（默认true合并，为false时直接替换，只有为数组和对象时这样）
>    - 只有content传入的为Object类型并且path传入的为json文件时，表示Object中的属性是否于原文件中的该属性合并

  

