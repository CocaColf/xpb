import { Uploader } from "../lib/interface/uploader";

export class MockUploader {
    config;
    constructor ()  {
        this.config = {
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
        }
    }
    async connect() {
        return true;
    }

    async mkdir() {
        return true;
    }

    async exists() {
        return true;
    }

    async putFile() {
        return true;
    }

    end () {
        return true;
    }
}