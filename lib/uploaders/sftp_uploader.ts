import { Uploader } from '../interface/uploader';
import * as sftp from 'ssh2-sftp-client';

export class SftpUploader implements Uploader {

    client: sftp;
    config: XpbConfig;

    constructor (config: XpbConfig) {
        this.client = new sftp();
        this.config = config;
    }
    
    async connect(ora: OraObj): Promise<void> {
        await this.client
                .connect(this.config.connect)
                .catch(err => {
                    throw err;
                });

        this.client.on("ready", () => {
            ora.info(`[client] 连接成功！`);
        });

        this.client.on("end", () => {
            ora.info(`[client] 断开连接！`);
        });
    }

    async mkdir(path: string): Promise<void> {
        await this.client.mkdir(path, true);
    }

    async exists(path: string): Promise<string | boolean> {
        return await this.client.exists(path);
    }

    async putFile(localPath: string, remotePath: string): Promise<void> {
        await this.client.fastPut(localPath, remotePath);
    }

    end(): void {
        this.client.end();
    }
}