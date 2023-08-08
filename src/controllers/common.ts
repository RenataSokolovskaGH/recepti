import { commonConstants } from "../constants";
import { User } from "../models";
import moment from "moment-timezone";

class CommonCtl {
    async checkEmailExists(
        email: string

    ): Promise<boolean> {
        return !!await User
            .query()
            .findOne(
                {
                    email
                }
            ).modify('available');
    }

    adjustDBDateFormat(
        date: Date
    ): string {
        return moment(date).format(commonConstants.dateTimeFormat);
    }

}

export default new CommonCtl();
