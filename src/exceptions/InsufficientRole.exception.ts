import HttpException from "./Http.exception";

export default class InsufficientRoleException extends HttpException {
    constructor() {
        super(401, "Insufficient role(s)!");
    }
}
