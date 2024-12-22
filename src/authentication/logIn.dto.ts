import { IsString } from "class-validator";

import ILogIn from "./logIn.interface";

export default class LogInDto implements ILogIn {
    @IsString()
    public email: string;

    @IsString()
    public password: string;
}
