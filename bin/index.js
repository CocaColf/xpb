#!/usr/bin/env node

let program = require('commander');
let Xpb  = require('../dist/index.js');

program
    .version(require('../package.json').version)
    .usage('<command> [options]')
    .description(
        `
            文件上传工具：
                1.支持文件、目录、glob上传方式
                2. 支持ftp、sftp等常用传输方式
                3. 支持命令行、SDK等多种调用方式
        `
    );

program
    .command('publish [localPath] [remotePath]')
    .description('上传文件或文件夹')
    .action(() => {
        let uploader = new Xpb.Xpb();
        uploader.startUpload();
    });

program
    .option('-w --watch')
    .description('监听文件夹，自动上传')
    .action(() => {
        // TODO:
        console.log('正在监听...');
    })


program.parse(process.argv);