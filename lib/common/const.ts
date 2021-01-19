import { FtpUploader } from '../uploaders/ftp_uploader';
import { SftpUploader } from '../uploaders/sftp_uploader';

export const PROTOCOL_FUN_MAP = {
    sftp: SftpUploader,
    ftp: FtpUploader
};
export const MAX_RETRY_TIMES = 3;

export const CONFIG_FILE_NAME = 'xpb.config.json';
