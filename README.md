
文件上传工具
## 特性

+ 支持sftp、ftp协议
+ 支持串行和并行上传，自定义最大并行个数
+ 支持失败重传，可以自定义最大重试次数
+ 支持命令行和SDK方式使用
+ 支持文件、文件夹、glob方式
+ 丰富的事件订阅

## 运行截图

**命令行**

![命令行运行截图](./run_screenshot/command.png)

**SDK截图**

![SDK运行截图](./run_screenshot/SDK.png)

**失败重试**

![失败重试运行截图](./run_screenshot/retry.png)

## 使用

### 命令行

命令为 `xpb publish`

使用命令行方式，使用前需要：

+ 在根目录下创建配置文件 `xpb.config.json`
+ 配置文件的内容如下：

```js
{
    basePath: string,    // 本地根路径
    publishedPath: string,    // 要上传的路径
    protocol: 'sftp' | 'ftp',    // 协议
    remotePath: string,    // 远程路径
    uploadLimit: number,    // 并发数
    retryTimes?: number,    // 失败重试次数
    connect: {    // 连接服务器的配置
        host: string,
        port: number,
        username: string,
        password: string
    }
}
```

### SDK方式

**实例化对象**

在一切开始前，需要实例化Xpb对象。

```js
import * as Xpb ftom 'xpb';

let uploader = new Xpb({
	// 配置，同上面命令行的配置
});
```

这个实例化对象具有如下方法：

| 方法                            | 说明                        | 参数                          |   |
|-------------------------------|---------------------------|-----------------------------|---|
| startUpload(): void           | 会解析实例化时传入的配置，连接服务器并执行执行上传 | -                           |   |
| connect(): Uploader           | 连接服务器，若连接成功将会返回上传者对象。上传者对象具有一些方法，见下文      | -                           |   |
| publishFile(): void           | 执行上传操作                    | -                           |   |
| on(eventName, callback): void | 事件监听，事件名见下方事件列表           | eventName:事件名；callback：回调函数 |   |

**事件列表**

| 事件名            | 返回数据                                      | 说明              |
|----------------|-------------------------------------------|-----------------|
| publishFile    | [filePath: string] 当前正在上传的文件路径            | 正在上传某个文件时触发     |
| endPublish     | -                                         | 结束所有上传时触发       |
| hasFailedFile  | [needRetryFilesList: Array] 上传失败的文件列表     | 完成一次上传和下一次重试前触发 |
| beyondMaxRetry | [beyondMaxRetryFile: Array] 超过最大重试次数的文件列表 | 文件超过最大重试次数时触发   |

### demo

```js
import * as Xpb ftom 'xpb';

let uploader = new Xpb({
	// 配置，同上面命令行的配置
});

uploader.startUpload();  // 直接快速上传

/**
* 或者使用下面拆解的方式自定义一些行为
*/

uploader.connect()
	.then((obj) => {
		// do something by obj
	})
uploader.publishFile();


// 事件监听

uploader.on('hasFailedFile', failList => {
	console.log(failList);
})

```

### 上传者对象

如果你确实需要利用上传者对象做一些事情，可以查看下面这个列表了解其上具有的方法。

| 方法                                                            | 说明          |
|---------------------------------------------------------------|-------------|
| connect(connectConfig): Promise<void>                         | 连接服务器       |
| mkdir(path: string): Promise<void>                            | 在远程服务器上创建目录 |
| exists(filePath): Promise<boolean>                            | 某文件/文件夹是否存在 |
| putFile(localPath: string, remotePath: string): Promise<void> | 上传本地文件到服务器  |
| end(): Promise<void>                                          | 关闭连接        |

## 调试和特点

+ 设置环境变量DEBUG即可开启调试，如 `DEBUG=xpb && node test/quick_test.js`
+ 串行并行： 通过配置中 `uploadLimit` 即可进行串行并行控制，设置为1即为串行
+ 失败重试： 设置 `retryTimes` 进行失败重试，此项非必须，默认为 3 次

## 覆盖率

All files

80.56% Statements 52% Branches 100% Functions 79.41% Lines

