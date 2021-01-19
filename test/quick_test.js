let xpb = require('../dist/index')

let uploader = new xpb.Xpb({
    "basePath": "./test_dir",
    "publishedPath": "./test_dir",
    // "publishedPath": "./test_dir/1.txt",
    // "publishedPath": "./test_dir/**/*.txt",
    "protocol": "sftp",
    "remotePath": "/xl-test-sftp",
    "uploadLimit": 2,
    "connect": {
        "host": "",
        "port": 22,
        "username": "",
        "password": ""
    }
});
uploader.startUpload();

uploader.on('publishFile', (filePath) => {
    console.log(`正在上传：${filePath}`);
});

uploader.on('endPublish', () => {
    console.log('上传结束');
});