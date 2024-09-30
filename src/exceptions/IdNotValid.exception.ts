import HttpException from "./Http.exception";

export default class IdNotValidException extends HttpException {
    constructor(id: string) {
        super(404, `This ${id} id is not valid.`);
    }
}
