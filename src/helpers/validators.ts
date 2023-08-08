import _ from 'lodash';
import moment from 'moment-timezone';
import { commonConstants, fileConstants, userConstants } from '../constants';
import { EUserAccountType } from '../enums';
import { errorCodes } from '../error-codes';
import { IUserInputSchema } from '../interfaces';
import { fileTypeWhitelist } from '../maps';

class ValidatorHelper {
    validateObject(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        obj: any

    ) {
        return _.isObject(obj);
    }

    validateEmail(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        email: any

    ): void {
        if (
            !email ||
            !_.isString(email) ||
            email.length > userConstants.maxEmailLength

        ) {
            throw errorCodes.WrongParameters;
        }

        // eslint-disable-next-line no-useless-escape
        const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;

        if (!reg.test(email)) {
            throw errorCodes.WrongParameters;
        }
    }

    validatePassword(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        password: any,
        errorMessage = errorCodes.WrongPassword

    ) {
        if (!password || !_.isString(password)) {
            throw errorMessage;
        }
        const reg = new RegExp(
            // eslint-disable-next-line no-useless-escape
            `^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@;:=+\\()~|#$%^'"\[\\]{}. &*<>?/_-]).{${userConstants.minPasswordLength
            },${userConstants.maxPasswordLength}}$`,
            'g'
        );
        if (!reg.test(password)) {
            throw errorMessage;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateUsername(username: any) {
        if (!username || !_.isString(username)) {
            throw errorCodes.WrongUsername;
        }

        const reg = new RegExp(
            `^(?=.*[a-z])[a-zA-Z0-9!@#$%^&*<>?./_-]{${userConstants.minUsernameLength},${userConstants.maxUsernameLength}}$`,
            'g'
        );
        if (!reg.test(username)) {
            throw errorCodes.WrongUsername;
        }

    }

    validateStringLength(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        str: any,
        maxLength: number,
        minLength = 0,
        errorMessage = errorCodes.WrongParameters

    ) {
        if (!(
            str &&
            _.isString(str)
            && str.length > minLength
            && (
                maxLength
                    ? str.length <= maxLength
                    : true
            )

        )) {
            throw errorMessage;
        }
    }

    validateInteger(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        num: any,
        mustBePositive: boolean

    ) {
        if (
            (
                !parseInt(num) &&
                num != 0

            ) ||
            num !== parseInt(num) ||
            !_.isInteger(num) ||
            (mustBePositive
                ? num <= 0
                : false
            )

        ) {
            throw errorCodes.WrongParameters;
        }
    }

    validateArray(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arr: any,
        maxLength?: number,
        minLength = 0,
        errorMessage = errorCodes.WrongParameters

    ) {
        if (!(
            arr &&
            _.isArray(arr)
            && arr.length >= minLength
            && (
                maxLength
                    ? arr.length < maxLength
                    : true
            )

        )) {
            throw errorMessage;
        }
    }

    validateIntegerArray(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        members: any,
        maxLength?: number,
        minLength = 1

    ) {
        this.validateArray(
            members,
            maxLength,
            minLength
        );
        members.forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (id: any) => this.validateInteger(
                id,
                true
            )
        );
    }

    validatePaginationInput(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pagination: any,
        defaultMaxItemsPerPage: number

    ) {
        this.validateInteger(
            pagination?.pageIndex,
            false
        );
        if (pagination.pageIndex < 1) {
            pagination.pageIndex = 1;
        }
        let itemsPerPage = pagination?.pageSize || defaultMaxItemsPerPage;
        this.validateInteger(
            itemsPerPage,
            true
        );

        if (itemsPerPage <= 0 || itemsPerPage > defaultMaxItemsPerPage) {
            itemsPerPage = defaultMaxItemsPerPage;
        }
        return {
            pageIndex: pagination.pageIndex,
            pageSize: itemsPerPage
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateUrl(url: any) {
        if (!url || !_.isString(url)) {
            throw errorCodes.WrongUrl;
        }
        // eslint-disable-next-line no-useless-escape
        return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(url);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateBoolean(bool: any) {
        if (!_.isBoolean(bool)) {
            throw errorCodes.WrongParameters;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateDateFormat(date: any, format = commonConstants.dateTimeFormat, mustBeInFuture = false) {
        if (!moment(date, format, true).isValid()) {
            throw errorCodes.InvalidDateFormat;
        }

        if (mustBeInFuture) {
            if (!moment(date).isAfter(moment())) {
                throw errorCodes.WrongParameters;
            }
        }
    }

    validateJson(
        jsonString: string

    ): JSON {
        try {
            return JSON.parse(jsonString);

        } catch (err) {
            throw errorCodes.WrongParameters;
        }
    }

    validateBase64String(
        inputString: string

    ): boolean {
        return Buffer.from(
            inputString,
            'base64'

        ).toString(
            'base64'

        ) === inputString;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validateFileValidator(validator: any) {
        this.validateStringLength(
            validator,
            fileConstants.maxFileHashLength,
            fileConstants.maxFileHashLength - 1
        )
        for (const [key, val] of fileTypeWhitelist.entries()) {
            if (val?.token === validator) {
                return key;
            }
        }
        throw errorCodes.WrongParameters;
    }

    validateUserSchema(
        userInputSchema?: IUserInputSchema

    ): IUserInputSchema {
        if (!userInputSchema) {
            throw errorCodes.WrongParameters;
        }

        this.validateStringLength(
            userInputSchema.userName,
            userConstants.maxUsernameLength
        )

        if (userInputSchema.firstName) {
            this.validateStringLength(
                userInputSchema.firstName,
                userConstants.maxNameLength
            )
            userInputSchema.firstName = _.upperFirst(userInputSchema.firstName);

        } else {
            userInputSchema.firstName = undefined;
        }

        if (userInputSchema.lastName) {
            this.validateStringLength(
                userInputSchema.lastName,
                userConstants.maxNameLength
            )
            userInputSchema.lastName = _.upperFirst(userInputSchema.lastName);

        } else {
            userInputSchema.lastName = undefined;
        }

        if (userInputSchema.jobTitle) {
            this.validateStringLength(
                userInputSchema.jobTitle,
                userConstants.maxJobTitleLength
            )
            userInputSchema.jobTitle = _.upperFirst(userInputSchema.jobTitle);

        } else {
            userInputSchema.jobTitle = undefined;
        }

        this.validateUserAccountType(
            userInputSchema
        );

        this.validatePassword(
            userInputSchema.password
        )

        this.validateEmail(
            userInputSchema.email
        )

        return userInputSchema;
    }


    validateUserAccountType(
        UserData: IUserInputSchema
    ) {
        if (!Object.values(EUserAccountType).includes(UserData.accountType)) {
            throw errorCodes.InvalidUserAccountType;
        }
    }

}

const instance = new ValidatorHelper();

export {
    instance,
    ValidatorHelper
} 