import HttpException from "./Http.exception";

export default class UserIdCannotChangeException extends HttpException {
    constructor() {
        super(404, "The user_id cannot change!");
    }
}
