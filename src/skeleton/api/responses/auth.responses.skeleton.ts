import { EUserAccountType } from "../../../enums";

export interface AuthLoginResponseSkeleton {
    userAccessToken: string;
    accountType: EUserAccountType;
}