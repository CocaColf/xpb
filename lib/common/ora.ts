import * as ora from 'ora';

export class Ora {

    needInfo: boolean = false;

    constructor (needInfo: boolean) {
        this.needInfo = needInfo;
    }

    info (info: string): void {
        if (!this.needInfo) return;
        ora().info(info);
    }

    warn (info: string): void {
        if (!this.needInfo) return;
        ora().warn(info);
    }

    succeed (info: string) {
        if (!this.needInfo) return;
        ora().succeed(info);
    }
}