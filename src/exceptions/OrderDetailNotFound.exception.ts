import HttpException from "./Http.exception";

export default class OrderDetailNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Order detail with id ${id} not found`);
    }
}
