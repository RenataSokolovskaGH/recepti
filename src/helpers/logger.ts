import { AccessLog, UserActivityLog } from '../models';
import { resolverHelper } from '.';
import { dbModels } from '../db/db-models';
import { Request } from 'express';
import { IIncomingClientConfig, ILogUserActivityParams, IObjectifySystemErrorParams, ISystemLoggerParams } from '../interfaces';
import { EStatuses, ESystemLoggerFlags } from '../enums';
import { verboseMode } from '../constants';

class LoggerHelper {
    private readonly styles = {
        reset: "\x1b[0m",
        bright: "\x1b[1m",
        dim: "\x1b[2m",
        underscore: "\x1b[4m",
        blink: "\x1b[5m",
        reverse: "\x1b[7m",
        hidden: "\x1b[8m",
        // Foreground (text) colors
        fg: {
            black: "\x1b[30m",
            red: "\x1b[31m",
            green: "\x1b[32m",
            yellow: "\x1b[33m",
            blue: "\x1b[34m",
            magenta: "\x1b[35m",
            cyan: "\x1b[36m",
            white: "\x1b[37m",
            crimson: "\x1b[38m"
        },
        // Background colors
        bg: {
            black: "\x1b[40m",
            red: "\x1b[41m",
            green: "\x1b[42m",
            yellow: "\x1b[43m",
            blue: "\x1b[44m",
            magenta: "\x1b[45m",
            cyan: "\x1b[46m",
            white: "\x1b[47m",
            crimson: "\x1b[48m"
        }
    }

    systemLogger(
        params: ISystemLoggerParams

    ): void {
        if (
            params.type ===
            ESystemLoggerFlags.Debug &&
            !verboseMode

        ) {
            return;
        }

        const separator = params.includeSeparator
            ? this.createLoggerSeparator()
            : null;

        const separatorLine = separator
            ? `\n\r${separator}\n`
            : '';

        const output = [
            `[${new Date().toLocaleString()}]`
        ]

        if (!params.type) {
            params.type = ESystemLoggerFlags.Info
        }

        if (params.clientId) {
            output.push(`[clientId] ${params.clientId}`)
        }

        if (params.service) {
            output.push(`[what] ${params.service}`)
        }

        if (params.message) {
            output.push(
                `[message] ${typeof params.message === "object"
                    ? JSON.stringify(
                        params.message
                    )
                    : params.message
                }`
            );
        }

        const commandStyle = this.getCommandTypeStyle(
            params.type
        )

        console.log(
            `${commandStyle
            }${separatorLine

            }${output.join(" | ")

            }${separatorLine
            }${this.styles.reset}`
        )
    }

    async logUserActivity(
        {
            userId,
            activityType,
            metadata

        }: ILogUserActivityParams

    ): Promise<void> {
        await UserActivityLog
            .query()
            .insert(
                {
                    user_id: userId,
                    activity_type: `${activityType}`,
                    metadata: metadata
                }
            )
    }

    private getCommandTypeStyle(
        type: ESystemLoggerFlags

    ): string {
        let style: string;

        switch (type) {
            case ESystemLoggerFlags.Debug:
                style = this.styles.fg.yellow;
                break;

            case ESystemLoggerFlags.Access:
                style = this.styles.fg.cyan;
                break;

            case ESystemLoggerFlags.Error:
                style = this.styles.fg.red;
                break;

            case ESystemLoggerFlags.Fatal:
                style = this.styles.bg.red;
                break;

            case ESystemLoggerFlags.Warn:
                style = this.styles.fg.magenta;
                break;

            case ESystemLoggerFlags.Cron:
                style = this.styles.fg.blue;
                break;

            default:
                style = this.styles.fg.green;
                break;
        }

        return style;
    }

    async accessLogger(
        req: Request,
        status: EStatuses,
        userId?: number | null,

    ) {
        const client: IIncomingClientConfig = {
            ip: resolverHelper.getClientIP(req),
            ua: req.get('user-agent'),
            route: req.originalUrl
        }

        try {
            await AccessLog
                .query()
                .insert(
                    {
                        ip: client.ip,
                        user_agent: client.ua?.substring(0, dbModels.accessLog.length.userAgent),
                        route: client.route?.substring(0, dbModels.accessLog.length.route),
                        user_id: userId,
                        status,
                    }
                )

        } catch (err) {
            this.systemLogger(
                {
                    message: 'Failed to log client access.',
                    service: 'accessLogger',
                    type: ESystemLoggerFlags.Error
                }
            )

            throw err;
        }
    }

    createLoggerSeparator(
        symbols: string[] = ['=', '+'],
        length = 101

    ): string {
        const output: string[] = [];

        for (let i = 0; i < length; i++) {
            output.push(
                symbols[i % symbols.length]
            );
        }
        return output.join('');
    }

    objectifySystemError(
        {
            message: err,
            service: errorDesc,
            type,
            includeSeparator

        }: IObjectifySystemErrorParams

    ): void {
        this.systemLogger(
            {
                message: typeof err === 'object'
                    ? JSON.stringify(
                        err,
                        null,
                        2
                    )
                    : err as string,

                service: errorDesc,
                type,
                includeSeparator
            }
        );
    }
}

const instance = new LoggerHelper();

export {
    instance,
    LoggerHelper
} 
