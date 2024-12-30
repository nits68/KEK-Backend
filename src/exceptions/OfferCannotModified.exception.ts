import HttpException from "./Http.exception";

export default class OfferCannotModifiedException extends HttpException {
    constructor() {
        super(403, "Offer cannot be modified, because it is not your offer!");
    }
}
