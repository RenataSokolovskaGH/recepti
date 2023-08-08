import { EUserActivityType } from "../enums";
import { generatorHelper, loggerHelper, storageHelper } from "../helpers";
import { Credentials, User } from "../models";
import { IEditUserProfile } from "../interfaces";
import { APISuccessResponseSkeleton } from "../skeleton/api/responses/common.responses.skeleton";
import { errorCodes } from "../error-codes";
import { authController } from ".";
import { File } from "formidable";
import { fileConstants } from "../constants";
import { GetUserProfileSkeleton } from "../skeleton/api/responses/user.responses.skeleton";

class UserCtl {
    async checkUserNameTaken(
        userName: string

    ): Promise<boolean> {
        return !!await User
            .query()
            .findOne(
                {
                    user_name: userName
                }
            )
    }

    async getUserProfile(
        userId: number
    ): Promise<GetUserProfileSkeleton> {
        const validUser = await User
            .query()
            .findOne({
                id: userId
            });

        if (!validUser) {
            throw errorCodes.InvalidUser;
        }

        return {
            userProfile: validUser.userProfileBaseInfo()
        }
    }

    async editUserProfile(
        {
            userId,
            firstName,
            lastName,
            jobTitle
        }: IEditUserProfile
    ): Promise<APISuccessResponseSkeleton> {
        const validUser = await User
            .query()
            .findOne({
                id: userId
            });

        if (!validUser) {
            throw errorCodes.InvalidUser;
        }

        await validUser.$query()
            .patch(
                {
                    first_name: firstName,
                    last_name: lastName,
                    job_title: jobTitle
                }
            )
            .skipUndefined();

        return errorCodes.Success;
    }

    async changeUserPassword(
        user: User,
        oldPassword: string,
        newPassword: string

    ): Promise<APISuccessResponseSkeleton> {
        const validOldPassword = await authController.validateCredentials(
            user,
            oldPassword
        )

        if (!validOldPassword) {
            throw errorCodes.InvalidCredentials;

        } else if (
            oldPassword ===
            newPassword

        ) {
            throw errorCodes.PasswordsMustDiffer;
        }

        const {
            hash,
            salt

        } = generatorHelper.encryptPassword(
            newPassword
        )

        const trx = await User.startTransaction();

        try {
            await Credentials
                .query(trx)
                .findOne(
                    {
                        user_id: user.id
                    }
                ).patch(
                    {
                        hash,
                        salt
                    }
                )

            await trx.commit();

        } catch (err) {
            await trx.rollback();
            throw err;
        }

        await loggerHelper.logUserActivity(
            {
                userId: user.id,
                activityType: EUserActivityType.PasswordChanged,
                metadata: null
            }
        )
        return errorCodes.Success;
    }

    async setProfileAvatar(
        user: User,
        avatar: File

    ): Promise<APISuccessResponseSkeleton> {
        if (user.avatar) {
            for (const imageUrl of Object.values(user.avatar)) {
                await storageHelper.deleteFileFromStorage(
                    {
                        userId: user.id,
                        staticFileUrl: imageUrl
                    }
                )
            }
        }
        const uploadedAvatar = await storageHelper.saveAvatarToStorage(
            {
                oldfilePath: avatar.filepath,
                fileType: avatar.mimetype,
                newfileDir: fileConstants.directories.userAvatar,
                needThumbnail: true,
                userId: user.id,
                fileSize: avatar.size,
                generateUrlWithDomain: false,
            }
        )
        await user
            .$query()
            .patch(
                {
                    avatar: uploadedAvatar
                }
            )

        return errorCodes.Success;
    }

    async removeProfileAvatar(
        user: User

    ): Promise<APISuccessResponseSkeleton> {
        if (user.avatar) {
            for (const imageUrl of Object.values(user.avatar)) {
                await storageHelper.deleteFileFromStorage(
                    {
                        userId: user.id,
                        staticFileUrl: imageUrl
                    }
                )
            }
            await user
                .$query()
                .patch(
                    {
                        avatar: null
                    }
                )
        }

        return errorCodes.Success;
    }
}

export default new UserCtl();
