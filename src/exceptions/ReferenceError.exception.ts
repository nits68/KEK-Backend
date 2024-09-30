import HttpException from "./Http.exception";

export default class ReferenceErrorException extends HttpException {
    constructor(from: string) {
        super(409, `Can't DELETE from ${from} collection, because has reference in other collection(s).`);
    }
}
