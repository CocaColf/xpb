/**
 * 文件上传
 */

import { handleCurrentFile, getFiles } from './util';
// import { Uploader } from '../interface/uploader';
import * as pLimit from 'p-limit';
import { MAX_RETRY_TIMES } from './const';
import { debugXpb } from './debug';
import { EventEmitter } from 'events';
import { Uploader } from '../interface/uploader';

/**
 * 上传处理入口
 * @param uploader 上传者
 */
export const publishFile = async function (uploader: Uploader, ora: OraObj, event: EventEmitter, files: Array<FileArrItem> = []) {
    let limitNum = uploader.config.uploadLimit,
        limit = pLimit(limitNum);

    // @ts-ignore
    let { filesInfo, totalFileNums } = getFiles(uploader, files);
    
    ora.info(`总共需要上传 ${totalFileNums} 个文件`);

    ora.info('开始传输...');

    // 构造promise集合，限制并发
    let promisesList = (filesInfo as Array<FileArrItem>).map(file => {
        return limit(() => handleCurrentFile(file, uploader, ora, event));
    });
    
    let pushRes: Array<FilePushResult> = await Promise.all(promisesList);

    debugXpb('所有文件的Promise Task执行结束');

    // 重试
    handleRetry(pushRes, uploader, event, ora).then(() => {
        uploader.end();
    });
};

// 失败重试
function handleRetry(pushRes: Array<FilePushResult>, uploader: Uploader, event: EventEmitter, ora: OraObj): Promise<void> {
    return new Promise(resolve => {
        let finallyPushFailList: Array<string> = [],    // 三次上传都失败的文件
            needRetryFilesList: Array<FileArrItem> = [];

        pushRes.forEach((res) => {
            let isObj = Object.prototype.toString.call(res) === '[object Object]';
            
            if (!isObj) {
                return;
            }
            
            if ((res as FileArrItem).retryTimes <= MAX_RETRY_TIMES) {
                needRetryFilesList.push(res as FileArrItem);
            }
    
            if ((res as FileArrItem).retryTimes > MAX_RETRY_TIMES) {
                finallyPushFailList.push((res as FileArrItem).path);
            }
        });
    
        let failLen = needRetryFilesList.length;
        if (failLen > 0) {
            event.emit('hasFailedFile', needRetryFilesList);
            ora.warn(`有 ${failLen} 个文件上传失败，准备为您重新上传，单个文件最多尝试三次`);
            publishFile(uploader, ora, event, needRetryFilesList);
    
            return;
        }
    
        if (finallyPushFailList.length > 0) {
            debugXpb(`这些文件 %O 上传失败重试次数超过了上限：`, finallyPushFailList.join('、'));

            event.emit('beyondMaxRetry', finallyPushFailList);
            
            ora.warn(`结束上传，${finallyPushFailList.join('、')} 上传失败！`);
        } else {
            ora.succeed('完成！');
        }

        event.emit('endPublish');

        resolve();
    });
}