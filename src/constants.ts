import { ESystemEnv } from "./enums";
import { config } from "dotenv";

config();
export const commonConstants = {
    sessionTokenCutLength: 20,
    db: {
        grantUnsafeMigration: process.env.GRANT_UNSAFE_MIGRATION?.toLowerCase() === 'true',
    },
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss'
}

export const verboseMode = process.env.VERBOSE?.toLowerCase() === 'true';
export const sysEnvironment = process.env.NODE_ENV?.toLowerCase() || ESystemEnv.Prem;
export const sourceBlockingEnabled = process.env.SOURCE_BLOCKING_ENABLED?.toLocaleLowerCase() === 'true';

export const fileConstants = {
    avatarProxyIndicatorRegex: (
        proxyRoute: string

    ): RegExp => {
        return new RegExp(`${proxyRoute}`)
    },
    checksumLength: 64,
    defaultPrivateFilePermissions: '400',
    maxFileNameLength: 50,
    minFileNameLength: 1,
    maxFileHashLength: 36,
    avatarDomainIndicatorRegex: /https?:\/\//g,
    kernelCommands: {
        which: (commandName: string): string => `which ${commandName}`,
        clearTmp: (tmpDir: string): string => `rm -f ${tmpDir}/* 2>/dev/null`
    },
    avatars: {
        maxFileSize: 10 * 1024 * 1024, // 10mb
        thumbnailSize: 312
    },
    directories: {
        userAvatar: 'user-avatars',
        userThumbnail: 'user-avatars-thumbnail',
    },
    defaultBucketDir: process.env.DEFAULT_LOCAL_BUCKET_DIR || '../bucket',
}

export const userConstants = {
    defaultUserAvatar: {
        thumbnailUrl: null, // Stored on front
        avatarUrl: null
    },
    maxUsersPerPage: 50,
    maxEmailLength: 255,
    minPasswordLength: 8,
    maxPasswordLength: 32,
    minUsernameLength: 3,
    maxUsernameLength: 20,
    maxFirstnameLength: 20,
    maxLastnameLength: 20,
    maxJobTitleLength: 255,
    maxNameLength: 30,
    failedLoginAttempts: {
        validUserName: {
            warningThreshold: 3,
            warningBanPeriodInSec: 600
        },
        invalidUserNameLoginThreshold: 5,
    },
    userSessionTokenExpiresIn: 24 * 60 * 60 * 1000, // 24 hours
}
