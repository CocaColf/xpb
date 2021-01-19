import { 
    useConfig,
    getConnectConfig, 
    isGlob, 
    getFilesInfo, 
    validConfig,
    statisticsFileBeforePublish,
    getFiles,
    handleCurrentFile
} from '../lib/common/util';

test('test is glob pattern', () => {
    let path = './test/**/*.js';

    expect(isGlob(path)).toStrictEqual(true);
});

test('test xpb config file is exist', () => {
    expect(() => getConnectConfig()).toThrowError('当前目录下未找到 xpb.config.json 文件')
});


test('test validConfig function', () => {
    let testConfig = {
        "publishedPath": "./test_dir",
        "protocol": "sftp",
        "remotePath": "/xl-test-sftp",
        "uploadLimit": 2,
        "connect": {
            "host": "",
            "port": 22,
            "username": "",
            "password": ""
        }
    };

    expect(validConfig(testConfig)).toEqual('"basePath" is required');
});

test('test use whitch config', () => {
    let testConfig = {
        "basePath": "./test_dir",
        "publishedPath": "./test_dir",
        "protocol": "sftp",
        "remotePath": "/xl-test-sftp",
        "uploadLimit": 2,
        "retryTimes": 3,
        "connect": {
            "host": "",
            "port": 22,
            "username": "",
            "password": ""
        }
    };

    let errorConfig = {
        "publishedPath": "./test_dir",
        "protocol": "sftp"
    };

    expect(useConfig(testConfig)).toEqual(testConfig);
    expect(useConfig()).toEqual(testConfig);
    expect(useConfig(errorConfig)).toThrow();
});


test('test getFilesInfo funciton', () => {
    let path = './test_dir';

    const expectResult = [
        { size: 0, path: './test_dir', isDirectory: true, retryTimes: 0 },
        {
          size: 4,
          path: './test_dir/1.txt',
          isDirectory: false,
          retryTimes: 0
        },
        {
          size: 4,
          path: './test_dir/2.md',
          isDirectory: false,
          retryTimes: 0
        },
        {
          size: 0,
          path: './test_dir/dir2',
          isDirectory: true,
          retryTimes: 0
        },
        {
          size: 0,
          path: './test_dir/dir2/3.txt',
          isDirectory: false,
          retryTimes: 0
        }
    ];

    expect(getFilesInfo(path)).toEqual(expectResult);
});

test('test statisticsFileBeforePublish', () => {
    // this function just need publishedPath
    let config = {
        "publishedPath": "./test_dir"
    };

    const res = { 
        filesInfo:
            [ 
                { size: 0, path: './test_dir', isDirectory: true, retryTimes: 0 },
                { size: 4,
                    path: './test_dir/1.txt',
                    isDirectory: false,
                    retryTimes: 0 },
                { size: 4,
                    path: './test_dir/2.md',
                    isDirectory: false,
                    retryTimes: 0 },
                { size: 0,
                    path: './test_dir/dir2',
                    isDirectory: true,
                    retryTimes: 0 },
                { size: 0,
                    path: './test_dir/dir2/3.txt',
                    isDirectory: false,
                    retryTimes: 0 } 
            ],
       totalFilesInfo:
            [ 
                { size: 4,
                    path: './test_dir/1.txt',
                    isDirectory: false,
                    retryTimes: 0 },
                { size: 4,
                    path: './test_dir/2.md',
                    isDirectory: false,
                    retryTimes: 0 },
                { size: 0,
                    path: './test_dir/dir2/3.txt',
                    isDirectory: false,
                    retryTimes: 0 } 
            ],
       totalFileNums: 3,
       size: 8 }
     
    expect(statisticsFileBeforePublish(config)).toEqual(res)
});

test('test getFiles', () => {
    expect(getFiles(null, ['testFile'])).toEqual({
        filesInfo: ['testFile'],
        totalFileNums: 1
    });
});

test('test handleCurrentFile', async () => {
    let currentFile = {
        size: 4,
        path: './test_dir/1.txt',
        isDirectory: false,
        retryTimes: 0
      };
    
    let uploader = {
        config: {
            "basePath": "./test_dir",
            "publishedPath": "./test_dir",
            "protocol": "sftp",
            "remotePath": "/xl-test-sftp",
            "uploadLimit": 2,
            "retryTimes": 3,
        }
    };
    let res = await handleCurrentFile(currentFile, uploader);
    expect(res).toEqual({
        size: 4,
        path: './test_dir/1.txt',
        isDirectory: false,
        retryTimes: 1
    })
});
