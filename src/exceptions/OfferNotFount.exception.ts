import HttpException from "./Http.exception";

export default class OfferNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Offer with id ${id} not found`);
    }
}
