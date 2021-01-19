export interface Uploader {
    client: object;
    config: XpbConfig;
    
    connect(ora: OraObj): void;

    mkdir(path: string): Promise<void>;

    exists(path: string): Promise<string | boolean>;

    putFile(localPath: string, remotePath: string): Promise<void>;

    end(): void;
}