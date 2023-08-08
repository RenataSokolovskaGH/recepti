export enum ESystemEnv {
    Development = 'dev',
    Make = 'make',
    Production = 'production',
    Prem = 'prem'
}

export enum EKnownUserSessionLifeTime {
    Temporary = 'temporary',
    Permanent = 'permanent'
}

export enum ESystemLoggerFlags {
    Debug = 'debug',
    Error = 'error',
    Fatal = 'fatal',
    Access = 'access',
    Warn = 'warn',
    Info = 'info',
    Cron = 'cron'
}

export enum EUserAccountType {
    Regular = 'regular',
    Admin = 'admin'
}

export enum EUserActivityType {
    RegistrationCompleted = 'registration-completed',
    LoggedIn = 'logged-in',
    LoggedOut = 'logged-out',
    UnsuccessfulLogin = 'unsuccessful-login',
    UserTemporaryBlockedLogin = 'user-temporary-blocked-login',
    PasswordChanged = 'password-changed',
    PersonalInfoChanged = 'personal-info-changed'
}

export enum EStatuses {
    Active = 'active',
    Revoked = 'revoked',
    Blocked = 'blocked',
    Unverified = 'unverified',
    NotFound = 'not-found',
    General = 'general',
    ValidUserName = 'valid-user-name',
    InvalidUserName = 'invalid-user-name',
    Expired = 'expired',
    Unauthorized = 'unauthorized'
}