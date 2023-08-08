import { NextFunction, Request, Response } from 'express';
import { fileConstants, userConstants } from '../constants';
import { authController, commonController, userController } from '../controllers/';
import { errorCodes } from '../error-codes';
import { resolverHelper, validatorHelper } from '../helpers/';
import { IFileFieldsSchema } from '../interfaces';
import { File } from 'formidable';
import { fileTypeWhitelist } from '../maps';

export default {
    login: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const {
                userName,
                password

            } = req.body;

            try {
                validatorHelper.validateStringLength(
                    userName,
                    userConstants.maxUsernameLength,
                    0,
                    errorCodes.AccessDenied
                )

                validatorHelper.validatePassword(
                    password,
                    errorCodes.AccessDenied
                )

            } catch (err) {
                return next(err);
            }

            const result = await authController.login(
                req
            );
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    logout: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const result = await authController.logout(
                req.user,
                req.userActiveSession
            );
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    setProfileAvatar: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        let parsedForm: IFileFieldsSchema;
        try {
            parsedForm = await resolverHelper.resolveIncomingForm(req);

        } catch (err) {
            return next(err);
        }
        const avatar = parsedForm?.files?.avatar as (File | undefined);

        if (
            !avatar?.filepath ||
            !avatar?.mimetype ||
            !fileTypeWhitelist.has(avatar.mimetype)

        ) {
            return next(errorCodes.InvalidAvatarFile);
        }
        if (avatar?.size > fileConstants.avatars.maxFileSize) {
            return next(errorCodes.AvatarMaxSizeExceeded);
        }

        try {
            const result = await userController.setProfileAvatar(req.user, avatar);
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    removeProfileAvatar: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const result = await userController.removeProfileAvatar(req.user);
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    validatePasswordPattern: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        const { password } = req.body;

        try {
            validatorHelper.validatePassword(
                password
            );

            res.status(200)
                .json(
                    errorCodes.Success
                );

        } catch (err) {
            return next(err);
        }
    },

    changeUserPassword: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        const { oldPassword, newPassword } = req.body;

        try {
            validatorHelper.validateStringLength(
                oldPassword,
                userConstants.maxPasswordLength
            );
            validatorHelper.validatePassword(newPassword);

        } catch (err) {
            return next(err);
        }

        try {
            const result = await userController.changeUserPassword(req.user, oldPassword, newPassword);
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    editUserProfile: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        const {
            firstName,
            lastName,
            jobTitle
        } = req.body;

        try {
            validatorHelper.validateStringLength(
                firstName,
                userConstants.maxFirstnameLength
            )

            validatorHelper.validateStringLength(
                lastName,
                userConstants.maxLastnameLength
            )

            validatorHelper.validateStringLength(
                jobTitle,
                userConstants.maxJobTitleLength
            )

        } catch (err) {
            return next(err);
        }

        try {
            const result = await userController.editUserProfile(
                {
                    userId: req.user.id,
                    firstName,
                    lastName,
                    jobTitle
                }
            );
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },

    getUserProfile: async (
        req: Request,
        res: Response,
        next: NextFunction

    ) => {
        try {
            const result = await userController.getUserProfile(
                req.user.id,
            );
            res.status(200).json(result);

        } catch (err) {
            next(err);
        }
    },
}