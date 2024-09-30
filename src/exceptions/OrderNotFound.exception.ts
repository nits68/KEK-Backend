import HttpException from "./Http.exception";

export default class OrderNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Order with id ${id} not found`);
    }
}
