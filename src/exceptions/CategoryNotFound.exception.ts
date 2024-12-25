import HttpException from "./Http.exception";

export default class CategoryNotFoundException extends HttpException {
    constructor(id: string) {
        super(404, `Category with id ${id} not found`);
    }
}
