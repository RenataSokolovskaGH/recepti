import { fileConstants, userConstants } from "./constants";

export const errorCodes = {
    Success: {
        title: "Success",
        message: "Operation successful",
        code: 's_0',
    },
    AccessDenied: {
        title: "Access Denied",
        message: "Access Denied",
        code: 's_1',
    },
    ApiRouteNotFound: {
        title: "Page Not Found",
        message: "Error 404",
        code: 's_2',
    },
    WrongParameters: {
        title: "Invalid Params",
        message: "Invalid Parameters Provided",
        code: 's_3',
    },
    WrongPassword: {
        title: "Invalid Password",
        message: `A password must be between ${userConstants.minPasswordLength
            } and ${userConstants.maxPasswordLength
            } characters, contain a capital letter, a number, and a special character.`,
        code: "s_4",
    },
    WrongUsername: {
        title: "Invalid Username",
        message: `A username must be between ${userConstants.minUsernameLength
            } and ${userConstants.maxPasswordLength
            } characters and contain a number. No spaces allowed`,
        code: "s_5",
    },
    NoPrivilegesUponOperation: {
        title: "No Privileges Upon Operation",
        message: "You have no rights to perform this operation.",
        code: 's_6',
    },
    InvalidDateFormat: {
        title: "Invalid Date Format",
        message: "The date format provided is invalid",
        code: 's_7',
    },
    ProblemWithProcessing: {
        title: "Problem With Processing",
        message: "Problem with processing current operation.",
        code: 's_8',
    },
    UserBlocked: {
        title: "User Account Blocked",
        message: "Please contact admin for support.",
        code: "s_9",
    },
    SessionInactive: {
        title: "Session Inactive",
        message: "Your session is no longer active. Please login again.",
        code: 's_10',
    },
    WrongUrl: {
        title: "Invalid url",
        message: `An url has to be in correct format.`,
        code: "s_11",
    },
    UserAccountBanned: {
        title: "Account Temporarily Disabled",
        message: `Account banned for ${userConstants.failedLoginAttempts.validUserName.warningBanPeriodInSec / 60
            } minutes due to suspicious activity`,
        code: "s_12",
    },
    InvalidCredentials: {
        title: "Login Information Is Incorrect",
        message: `The provided credentials do not match a user account.`,
        code: "s_13",
    },
    InvalidUserAccountType: {
        title: "Invalid User Account Type",
        message: "The provided user account type is invalid.",
        code: 's_14',
    },
    UserNameTaken: {
        title: 'Username Taken',
        message: 'This username has already been taken. Please provide another one',
        code: 's_15'
    },
    EmailAlreadyInUse: {
        title: "Email Already In Use",
        message: `Email addresses must be unique`,
        code: "s_16",
    },
    InvalidUser: {
        title: 'Invalid User',
        message: 'No matching user found on file.',
        code: 's_19'
    },
    CantDeleteUser: {
        title: 'Cannot Delete User',
        message: 'Cannot delete this user.',
        code: 's_20'
    },
    PasswordsMustDiffer: {
        title: "New Password Must Be Unique",
        message: `Your new password must be different from the previous one.`,
        code: "s_24",
    },
    InvalidAvatarFile: {
        title: "Invalid Avatar File Format",
        message: "The avatar has to be either .jpeg or .png format.",
        code: 's_26',
    },
    AvatarMaxSizeExceeded: {
        title: "Maximum Avatar Size Exceeded",
        message: `Profile avatar must be smaller than ${fileConstants.avatars.maxFileSize / (1024 * 1024)} MB in size.`,
        code: "s_27",
    },
    UnsupportedFileType: {
        title: "Unsupported File Type",
        message: "The certain file type is not supported by the system.",
        code: 's_28',
    }
}
