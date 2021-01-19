/**
 * 工具函数
 * @since 2020/12/12
 */

import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import { debugXpb } from './debug';
import { CONFIG_FILE_NAME, PROTOCOL_FUN_MAP } from './const';
import * as Joi from 'joi';
import { EventEmitter } from 'events';
import { Uploader } from '../interface/uploader';

/**
 * 校验配置字段是否正确
 * @param config 配置
 */
export const validConfig = function (config: XpbConfig) {
	const schema = Joi.object({
		basePath: Joi.string().required(),
		publishedPath: Joi.string(),
		protocol: Joi.string().valid(...Object.keys(PROTOCOL_FUN_MAP)).required(),
		remotePath: Joi.string().required(),
		uploadLimit: Joi.number().integer().min(1).optional(),
		retryTimes: Joi.number().integer().min(1).optional(),
		connect: Joi.object().keys({
			host: Joi.string().required(),
			port: Joi.number().integer().required(),
			username: Joi.string().required(),
			password: Joi.string().required()
		})
	});
		
	let validRes = schema.validate(config);
	if (validRes.error) {
		return validRes.error.details.map(item => {
			return item.message;
		}).join('\n');
	}
	
	return true;
};

// 传了配置则使用配置；否则使用配置文件
export const useConfig = function (config?: XpbConfig): XpbConfig {
	let switchConfig: XpbConfig,
		validRes: string | boolean;

    if (!config) {
		switchConfig = getConnectConfig();
    } else {
		switchConfig = config;
	}

	validRes = validConfig(switchConfig);

	if (validRes !== true) {
		throw new Error(`配置错误：${validRes}`);
	}

	return switchConfig;
};

/**
 * 获取连接配置文件
 */
export const getConnectConfig = function (): XpbConfig {
	const connectConfigPath = path.join(process.cwd(), CONFIG_FILE_NAME);

	if (fs.existsSync(connectConfigPath)) {
		return JSON.parse(fs.readFileSync(connectConfigPath, 'utf-8'));
	} else {
		throw new Error(`当前目录下未找到 ${CONFIG_FILE_NAME} 文件`);
	}
};

/**
 * 递归收集文件信息
 * @param fn 回调
 */
const recursionFile = function (fn: Function): Function {
	return function traverse(filePath: string) {
		if (!fs.existsSync(filePath)) {
			throw new Error(`${filePath} 不存在!`);
		}

		const stat = fs.statSync(filePath);
		
		if (stat.isDirectory()) {
			fn(filePath, stat);
			fs.readdirSync(filePath).forEach(file => traverse(`${filePath}/${file}`));
		} else {
			fn(filePath, stat);
		}
	};
};

/**
 * 判断是否为glob模式
 * @param filePath 
 */
export function isGlob (path: string) {
	return glob.hasMagic(path);
};

/**
 * 整理文件信息
 * @param filePath 文件路径
 */
export const getFilesInfo = function (filePath: string): Array<FileArrItem>  {
	let recursionFilePath: Array<string> = [];

	const filesInfo: Array<FileArrItem> = [];

	if ( isGlob(filePath) ) {
		recursionFilePath = glob.sync(`${filePath}`);
	} else {
		recursionFilePath.push(filePath);
	}

	recursionFilePath.forEach(everyFilePath =>{
		recursionFile((currentFilePath: string, stat: fs.Stats) => {
			filesInfo.push({
				size: stat.size,
				path: currentFilePath,    // 当前正在处理的文件路径
				isDirectory: stat.isDirectory(),
				retryTimes: 0
			});
		})(everyFilePath);
	});

	return filesInfo;
};

/**
 * 统计文件信息
 * @param connectConfig 配置
 */
export const statisticsFileBeforePublish = function (connectConfig: XpbConfig) {
	let filesInfo = getFilesInfo(connectConfig.publishedPath);

    let totalFilesInfo = filesInfo.filter(file => !file.isDirectory);
    let totalFileNums = totalFilesInfo.length;


	let size = totalFilesInfo.reduce((pre, cur) => pre + cur.size, 0);
	
	return {
		filesInfo,
		totalFilesInfo,
		totalFileNums,
		size
	};
}

/**
 * 判断目录是否存在，不存在则创建
 * @param path 目录路径
 * @param uploader 上传者
 */
async function dirExistAndMk (path: string, uploader: Uploader): Promise<void> {
	let dirExist = await uploader.exists(path);

	if (!dirExist) {
		try {
			await uploader.mkdir(path);
		} catch {
			debugXpb('创建目录时出现异常');
			// 这个异常无需处理，可能是两个并行操作同时在处理文件
			// 上传文件时会二次确认文件夹是否存在，可保证此处的操作最终都会被处理
		}
	}
}

/**
 * 单个文件/文件夹上传处理
 * @param currentFile 当前上传的文件(信息)
 * @param uploader 当前的上传者
 */
export const handleCurrentFile = async function (currentFile: FileArrItem, uploader: Uploader, ora: OraObj, event: EventEmitter) {

	const connectConfig = uploader.config;

	const absBasePath = path.join(process.cwd(), connectConfig.publishedPath);
	const abspublishedPath = path.join(process.cwd(), currentFile.path);
	
	let absRemotePath = '';

	debugXpb(`\n配置中定义文件的绝对路径：${absBasePath}`);
	debugXpb(`当前正在处理的文件的绝对路径：${absBasePath}`);

	try {
		if (currentFile.isDirectory) {
			absRemotePath = path
				.join(connectConfig.remotePath, abspublishedPath.replace(absBasePath, ""))
				.replace(/\\/g, "/");

			debugXpb(`远程路径： ${absRemotePath}`);
	
			await dirExistAndMk(absRemotePath, uploader);
		} else {
	
			absRemotePath = path
				.join(connectConfig.remotePath, abspublishedPath.replace(path.join(process.cwd(), connectConfig.basePath), ""))
				.replace(/\\/g, "/");

			debugXpb(`远程路径： ${absRemotePath}`);
			
			// 确保文件放置的文件夹存在
			let parentDir = path.dirname(absRemotePath);
			await dirExistAndMk(parentDir, uploader);

			if (currentFile.retryTimes > 0) {

				debugXpb(`正在对 ${absRemotePath} 进行失败重传`);

				ora.info(`正在第 ${currentFile.retryTimes} 次 重试上传 ${currentFile.path}`)
			}
			// throw new Error('手动构造错误');

			// @ts-ignore
			ora.info(`正在上传文件： ${currentFile.path}`);
			event.emit('publishFile', currentFile.path);
			
			await uploader.putFile(abspublishedPath, absRemotePath);
		
			return true;
		}
	} catch {

		debugXpb(`上传文件 ${currentFile} 失败`);

		if (isNaN(currentFile.retryTimes)) {
			currentFile.retryTimes = 0;
		} else {
			currentFile.retryTimes++;
		}

		return currentFile;
	}
	
}

/**
 * 获取上传文件信息
 * @param uploader 上传者
 * @param files 默认为空，存在则为失败重传的文件
 */
export const getFiles = function (uploader: Uploader, files: Array<FileArrItem> = []) {
	let filesInfo: Array<FileArrItem> = [],
        totalFileNums = 0;

    if (files.length > 0) {
        debugXpb('存在失败的任务，开始重传');

        filesInfo = files;
        totalFileNums = files.length;
    } else {
        let statistInfo = statisticsFileBeforePublish(uploader.config);
        filesInfo = statistInfo.filesInfo;
        totalFileNums = statistInfo.totalFileNums;
	}
	
	return {
		filesInfo,
		totalFileNums
	};
}