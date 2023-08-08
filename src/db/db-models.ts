
export const dbModels = {  
    storage: {
        tableName: 'storage',
        length: {
            checksum: 100,
            fileName: 50
        }
    },   
    userActivityLog: {
        tableName: 'user_activity_log'
    },
    bannedUserLogin: {
        tableName: 'banned_user_login'
    },
    failedLoginAttempts: {
        tableName: 'failed_login_attempts'
    },
    knownUsersSessions: {
        tableName: 'known_users_sessions',
        length: {
            userAgent: 512,
            lifeTime: 30
        }
    },
    usersSessions: {
        tableName: 'users_sessions',
        length: {
            socketId: 30
        }
    },
    users: {
        tableName: 'users',
        length: {
            firstName: 30,
            lastname: 30,
            jobTitle: 255,
            userName: 20,
            account_type: 20,
            status: 30
        }
    },
    credentials: {
        tableName: 'credentials',
        length: {
            hash: 1024,
            salt: 255,
        }
    },
    accessLog: {
        tableName: 'access_log',
        length: {
            userAgent: 512,
            country: 50,
            city: 50,
            isp: 30,
            route: 255
        }
    },
    blockedSources: {
        tableName: 'blocked_sources',
        length: {
            userAgent: 512
        }
    }
}
