import { EUserAccountType } from "../../enums";
import { IAvatarSchema } from "../../interfaces";

export interface UserProfileInfoSkeleton {
    userId: number;
    firstName: string;
    lastName: string;
    userName: string;
    avatar: IAvatarSchema | null;
    jobTitle: string | null;
    accountType: EUserAccountType;
    email: string | null;
}
