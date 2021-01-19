/**
 * 配置文件
 */
declare interface XpbConfig {
    basePath: string,    // 本地根路径
    publishedPath: string,    // 要上传的路径
    protocol: 'sftp' | 'ftp',    // 协议
    remotePath: string,    // 远程路径
    uploadLimit: number,    // 并发数
    retryTimes?: number,
    connect: {    // 连接服务器的配置
        host: string,
        port: number,
        username: string,
        password: string
    }
};

/**
 * 文件信息
 */
declare interface FileArrItem {
    size: number,
    path: string,
    isDirectory: boolean,
    retryTimes: number
};

declare type FilePushResult = boolean | FileArrItem | undefined;

declare interface OraObj {
    needInfo: boolean,
    info: Function,
    warn: Function,
    succeed: Function
};

declare type EventName = 'endPublish' | 'hasFailedFile' | 'beyondMaxRetry';

// declare class Uploader {
//     private client: object;
//     protected config:  XpbConfig;
//     connect: Function;
//     mkdir: Function;
//     exists: Function;
//     putFile: Function;
//     end: Function
// };