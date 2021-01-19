import { Uploader } from "../interface/uploader";
import * as Client from 'promise-ftp';

// @ts-ignore
export class FtpUploader implements Uploader {
    client: Client;
    config: XpbConfig;

    constructor(config: XpbConfig) {
        this.config = config;
        this.client = new Client();
    }

    async connect(): Promise<void> {
        await this.client.connect(this.config.connect);
    }

    async mkdir(path: string): Promise<void> {
        await this.client.mkdir(path);
    }

    async exists(path: string): Promise<boolean> {
        try {
            await this.client.get(path);
        } catch {
            return false;
        }

        return true;
    }

    async putFile(localPath: string, remotePath: string): Promise<void> {
        await this.client.put(localPath, remotePath);
    }

    end(): void {
        this.client.end();
    }
    
}