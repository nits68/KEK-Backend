import HttpException from "./Http.exception";

export default class ProductNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Product with id ${id} not found`);
    }
}
