import { EventEmitter } from "events";
import { PROTOCOL_FUN_MAP } from "./common/const";
import { debugXpb } from "./common/debug";
import { Ora } from "./common/ora";
import { publishFile } from "./common/publish";
import { useConfig } from "./common/util";
import { Uploader } from "./interface/uploader";

class Xpb {
    private ora: Ora;
    private uploader: Uploader;
    private event: EventEmitter;

    constructor (config: XpbConfig) {
        this.event = new EventEmitter();
        this.uploader = this.createUploadr(config);
        this.ora = new Ora(!config);
    }

    get uploaderGetter () {
        return this.uploader;
    }

    private createUploadr (config: XpbConfig): Uploader {

        // 这里进行配置处理和参数校验
        let selectedConfig = useConfig(config);

        debugXpb(`初始化上传者，当前使用协议为 ${selectedConfig.protocol}`);
        
        return new PROTOCOL_FUN_MAP[selectedConfig.protocol](selectedConfig);   
    }

    async connect () {
        try {
            await this.uploader.connect(this.ora);
            return this.uploaderGetter;
        } catch {
            throw new Error('连接失败');
        }
    }
    
    async startUpload () {
        await this.connect();
        
        this.publishFile();
    }
    
    publishFile () {
        publishFile(this.uploader, this.ora, this.event);
    }

    on (eventName: EventName, Fn: (...args: any[]) => void) {
        this.event.on(eventName, Fn);
    }
}

export {
    Xpb
};