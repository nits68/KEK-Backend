/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString } from "class-validator";

/**
 * @openapi
 * components:
 *  schemas:
 *    LoginData:
 *      properties:
 *        email:
 *          type: string
 *          description: 'A felhasználó e-mail címe'
 *          example: 'esze.gabor@students.jedlik.eu'
 *        password:
 *          type: string
 *          description: 'A felhasználó jelszava'
 *          example: 'gabor'
 *
 */
export default class LogInDto {
    @IsString()
    public email: string;

    @IsString()
    public password: string;
}
