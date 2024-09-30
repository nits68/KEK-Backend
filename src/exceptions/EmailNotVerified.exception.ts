import HttpException from "./Http.exception";

export default class EmailNotVerifiedException extends HttpException {
    constructor(email: string) {
        super(401, `Your Email ${email} has not been verified. Please click on resend!`);
    }
}
