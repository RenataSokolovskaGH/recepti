import {
    IAPIErrorSchema,
    IAvatarSavingParams,
    IAvatarSchema,
    IGenerateStaticFileUrlParams,
    IGetUniqueFileNameParams,
    IInsertNewSpaceFileParams,
    IResizeLocalImageParams,
    ISaveFileToSpaceSchema,
    ISpaceDeleteFileParams,
    ISpaceFileSavingParams,
    ITransformAvatarSchemaUrlParams,
    IVerifyFileUrlAbsoluteParams,
    IWriteFileFromBufferParams
} from '../interfaces';
import { checksumHelper, loggerHelper, validatorHelper } from '.';
import { ESystemLoggerFlags } from '../enums';
import { execSync as shell } from 'child_process';
import { fileConstants, verboseMode } from '../constants';
import { routeConstants } from '../routes/definition';
import { errorCodes } from '../error-codes';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import sharp from 'sharp';
import { resolve } from 'path';
import { fileTypeWhitelist } from '../maps';
import crypto from 'crypto';
import { Storage } from '../models';

class StorageHelper {

    verifyFileUrlAbsolute(
        {
            fileUrl,
            proxied,
            proxyRoute

        }: IVerifyFileUrlAbsoluteParams

    ): string {
        if (
            proxied &&
            proxyRoute &&
            !fileUrl.match(
                fileConstants.avatarProxyIndicatorRegex(
                    proxyRoute
                )
            )

        ) {
            fileUrl = [
                `/${proxyRoute}`,
                fileUrl

            ].join('');
        }

        if (
            !fileUrl.match(
                fileConstants.avatarDomainIndicatorRegex
            )

        ) {
            fileUrl = [
                routeConstants.defaultDomain,
                fileUrl

            ].join('');
        }

        return fileUrl;
    }


    transformAvatarSchemaUrl(
        {
            proxied,
            avatarSchema,
            proxyRoute

        }: ITransformAvatarSchemaUrlParams

    ): IAvatarSchema | null {
        if (!avatarSchema) {
            return null;
        }

        if (avatarSchema.avatarUrl) {
            avatarSchema.avatarUrl = this.verifyFileUrlAbsolute(
                {
                    fileUrl: avatarSchema.avatarUrl,
                    proxied,
                    proxyRoute
                }

            )
        }

        if (avatarSchema.thumbnailUrl) {
            avatarSchema.thumbnailUrl = this.verifyFileUrlAbsolute(
                {
                    fileUrl: avatarSchema.thumbnailUrl,
                    proxied,
                    proxyRoute
                }
            )
        }

        return avatarSchema;
    }

    executeKernelCommand(
        command: string,
        cwd?: string

    ): string {
        if (verboseMode) {
            loggerHelper.systemLogger(
                {
                    message: `Running: ${command}`,
                    service: 'executeKernelCommand'
                }
            )
        }

        const result = shell(
            command,
            {
                encoding: 'ascii',
                cwd,
                stdio: 'pipe',
                shell: '/bin/bash'
            }
        )

        return result;
    }

    clearTempFolder(
        tempDir = '/tmp'

    ): void {
        try {
            this.executeKernelCommand(
                fileConstants.kernelCommands.clearTmp(
                    tempDir
                )
            )

        } catch (err) {
            loggerHelper.systemLogger(
                {
                    message: 'Failed to clear temp storage',
                    service: 'clearTempFolder',
                    type: ESystemLoggerFlags.Error
                }
            )
        }
    }

    private getUniqueFileName(
        params: IGetUniqueFileNameParams

    ): string {
        let fullFilePath = [
            fileConstants.defaultBucketDir,
            params.fileDir,
            params.fileName,

        ].join('/');

        while (fs.existsSync(fullFilePath)) {
            params.fileName = uuidv4();

            fullFilePath = [
                fileConstants.defaultBucketDir,
                params.fileDir,
                params.fileName,

            ].join('/');
        }

        return fullFilePath;
    }

    private async resizeLocalImage(
        {
            imageFile,
            outFileName,
            outFilePath

        }: IResizeLocalImageParams

    ): Promise<IWriteFileFromBufferParams | undefined> {
        return new Promise(
            async (resolve, reject) => {
                try {
                    const resizedBuffer = await sharp(imageFile)
                        .rotate()
                        .jpeg(
                            {
                                quality: 100,
                                progressive: true
                            }
                        )
                        .resize(
                            fileConstants.avatars.thumbnailSize,
                            fileConstants.avatars.thumbnailSize,
                            {
                                fit: 'cover',
                                withoutEnlargement: true
                            }

                        ).toBuffer();

                    this.writeFileFromBuffer(
                        outFilePath,
                        outFileName,
                        resizedBuffer
                    )

                    resolve(
                        {
                            fileSize: resizedBuffer.length,
                            checksum: checksumHelper
                                .createChecksum(
                                    resizedBuffer
                                )
                        }
                    )

                } catch (err) {
                    loggerHelper.objectifySystemError(
                        {
                            message: err,
                            service: 'storage-helper'
                        }
                    )

                    reject(err);
                }
            }
        );
    }

    private writeFileFromBuffer(
        filePath: string,
        fileName: string,
        buffer: Buffer

    ): string {
        this.ensureFileExists(
            filePath
        )

        const fullFilePath = [
            filePath,
            fileName

        ].join('/');

        fs.writeFileSync(
            fullFilePath,
            buffer
        )

        this.changeFilePermissions(
            fullFilePath
        )

        return fullFilePath;
    }

    async saveAvatarToStorage(
        params: IAvatarSavingParams

    ): Promise<IAvatarSchema> {
        const result: IAvatarSchema = {
            avatarUrl: null,
            thumbnailUrl: null
        }

        if (!params.fileType) {
            throw errorCodes.ProblemWithProcessing;
        }

        params.newFileHash = params.newFileHash
            || uuidv4();

        if (params.needThumbnail) {
            const thumbnailHash = uuidv4();

            const outFileDir = fileConstants.directories.userThumbnail;

            const outFilePath = this.getUniqueFileName(
                {
                    fileName: thumbnailHash,
                    fileDir: outFileDir
                }
            )
            const uniqueNewFileName = outFilePath.split('/').pop();

            if (!uniqueNewFileName) {
                throw errorCodes.ProblemWithProcessing;
            }

            const resizeResult = await this.resizeLocalImage(
                {
                    imageFile: params.oldfilePath,
                    outFilePath: [
                        fileConstants.defaultBucketDir,
                        outFileDir

                    ].join('/'),
                    outFileName: uniqueNewFileName
                }
            )

            if (!resizeResult) {
                loggerHelper.systemLogger(
                    {
                        message: `Failed to save avatar thumbnail - hash: ${thumbnailHash}, userId: ${params.userId}`,
                        service: 'storage-helper',
                        type: ESystemLoggerFlags.Error
                    }
                )

                return result;
            }

            if (resizeResult.checksum) {
                result.thumbnailUrl = this.generateStaticFileUrl(
                    {
                        fileHash: thumbnailHash,
                        fileType: params.fileType,
                        includeDomain: false,
                        proxied: false
                    }
                );
            }

            await this.insertNewFileToStorage(
                {
                    ...params,
                    newfileDir: outFileDir,
                    fileName: uniqueNewFileName,
                    fileSize: resizeResult.fileSize,
                    fileChecksum: resizeResult.checksum,
                    newFileHash: thumbnailHash
                }
            )
        }

        const {
            localFileUrl

        } = await this.saveFileToStorage(
            params
        )

        result.avatarUrl = localFileUrl;

        return result;
    }

    private async insertNewFileToStorage(
        params: IInsertNewSpaceFileParams

    ): Promise<Storage> {
        if (!params.fileType) {
            throw errorCodes.ProblemWithProcessing
        }

        const localFile = await Storage
            .query()
            .insertAndFetch(
                {
                    owner_user_id: params.userId,
                    file_hash: params.newFileHash,
                    relative_file_path: [
                        params.newfileDir,
                        `${params.newFileHash}`
                    ].join('/'),
                    file_type: params.fileType,
                    checksum: params.fileChecksum,
                    file_name: params.fileName,
                    file_size: params.fileSize,
                }

            ).skipUndefined();

        if (
            !localFile &&
            params.fullFilePath

        ) {
            this.unlinkLocalFile(
                params.fullFilePath
            );

            loggerHelper.systemLogger(
                {
                    message: `Failed to save file to space => hash: ${params.newFileHash},
                    ownerUserId: ${params.userId}, fullFilePath: ${params.fullFilePath}`,
                    service: 'storage-helper',
                    type: ESystemLoggerFlags.Error
                }
            );

            throw errorCodes.ProblemWithProcessing;
        }

        return localFile;
    }

    ensureFileExists(
        filePath: string,
        buildPath = true

    ): boolean {
        const existenceState = fs.existsSync(
            filePath
        );

        if (
            !existenceState &&
            buildPath

        ) {
            fs.mkdirSync(
                filePath,
                {
                    recursive: true
                }
            );
        }

        return existenceState;
    }

    async saveFileToStorage(
        params: ISpaceFileSavingParams

    ): Promise<ISaveFileToSpaceSchema> {
        if (
            !params.fileType ||
            (
                !params.userId
            )

        ) {
            throw errorCodes.ProblemWithProcessing;
        }

        params.newFileHash = params.newFileHash
            || uuidv4();

        try {
            validatorHelper.validateStringLength(
                params.fileName,
                fileConstants.maxFileNameLength,
                fileConstants.minFileNameLength
            )

        } catch {
            params.fileName = this.generateRandomFileName();
        }

        if (!fileTypeWhitelist.has(params.fileType)) {
            throw errorCodes.UnsupportedFileType;
        }

        this.ensureFileExists(
            `${fileConstants.defaultBucketDir
            }/${params.newfileDir}`
        );

        const fileContentBuffer =
            fs.readFileSync(
                params.oldfilePath
            )

        const fullFilePath = this.getUniqueFileName(
            {
                fileName: params.newFileHash,
                fileDir: params.newfileDir,
            }
        )

        fs.writeFileSync(
            fullFilePath,
            fileContentBuffer
        )

        this.changeFilePermissions(
            fullFilePath
        )

        const localFile = await this.insertNewFileToStorage(
            {
                ...params,
                fileChecksum: checksumHelper.createChecksum(
                    fs.readFileSync(
                        params.oldfilePath
                    )
                ),
                fullFilePath
            }
        )

        this.unlinkLocalFile(
            params.oldfilePath
        )

        return {
            localFileUrl: this.generateStaticFileUrl(
                {
                    fileHash: params.newFileHash,
                    fileType: params.fileType,
                    includeDomain: params.generateUrlWithDomain,
                    proxied: false
                }
            ),
            localFilePath: fullFilePath,
            localFileId: localFile.id
        }
    }

    generateRandomFileName(

    ): string {
        return crypto
            .randomBytes(25)
            .toString('hex');
    }

    changeFilePermissions(
        filePath: string,
        permissions: string = fileConstants.defaultPrivateFilePermissions

    ): void {
        try {
            fs.chmodSync(
                filePath,
                permissions
            )

            loggerHelper.systemLogger(
                {
                    message: 'File permissions set',
                    service: 'commonCtl: changeFilePermissions'
                }
            )

        } catch (err) {
            loggerHelper.objectifySystemError(
                {
                    message: err,
                    service: 'commonCtl: changeFilePermissions'
                }
            )
        }
    }

    generateStaticFileUrl(
        {
            fileHash,
            fileType,
            includeDomain,
            proxied,
            proxyRoute

        }: IGenerateStaticFileUrlParams

    ): string {
        const validator = fileTypeWhitelist
            .get(fileType)?.token;

        if (!validator) {
            throw errorCodes.UnsupportedFileType;
        }

        return [
            includeDomain
                ? routeConstants.defaultDomain
                : '',
            proxied
                ? `/${proxyRoute}`
                : '',
            routeConstants.routes.static.collect,
            `?hash=${fileHash}&validator=${validator}`

        ].join('');
    }

    async deleteFileFromStorage(
        params: ISpaceDeleteFileParams

    ): Promise<boolean> {
        if (
            (
                !params.staticFileUrl &&
                !params.fileId
            ) ||
            (
                !params.userId
            )

        ) {
            throw errorCodes.ProblemWithProcessing;
        }
        let fileName: string | undefined = undefined;

        if (params.staticFileUrl) {
            fileName = !params.fileId &&
                params.staticFileUrl?.indexOf('hash=') > -1

                ? params.staticFileUrl?.split('hash=')[1]?.split('&validator')[0]
                : undefined;
        }

        if (!fileName && !params.fileId) {
            return false;
        }
        const validFile = await Storage
            .query()
            .findOne(
                {
                    id: params.fileId,
                    owner_user_id: params.userId,
                    file_hash: fileName
                }

            ).skipUndefined();

        if (!validFile) {
            return false;
        }
        const fullFilePath = resolve(
            fileConstants.defaultBucketDir,
            validFile.relative_file_path
        );
        this.unlinkLocalFile(fullFilePath);

        await validFile.$query().delete();

        return true;
    }

    unlinkLocalFile(
        fullFilePath: string,
        throwIfNotExist = false,
        errorMessage: IAPIErrorSchema = errorCodes.ProblemWithProcessing

    ): void {
        try {
            if (fs.existsSync(fullFilePath)) {
                fs.unlinkSync(fullFilePath)

            } else if (throwIfNotExist) {
                throw errorMessage;
            }

        } catch (err) {
            loggerHelper.objectifySystemError(
                {
                    message: err,
                    service: 'storage-helper'
                }
            )
        }
    }
}

const instance = new StorageHelper();

export {
    instance,
    StorageHelper
}


