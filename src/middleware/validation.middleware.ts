import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import express from "express";

import HttpException from "../exceptions/Http.exception";

function getAllConstraints(errors: ValidationError[]): string[] {
    const constraints: string[] = [];
    for (const error of errors) {
        if (error.constraints) {
            const constraintValues = Object.values(error.constraints);
            constraints.push(...constraintValues);
        }
        if (error.children) {
            const childConstraints = getAllConstraints(error.children);
            constraints.push(...childConstraints);
        }
    }
    return constraints;
}

export default function validationMiddleware(type: any, skipMissingProp = false): express.RequestHandler {
    return (req, res, next) => {
        // forbidUnknownValues: false
        // const validatorObject = Object.assign(new type(), req.body);
        validate(plainToInstance(type, req.body), { skipMissingProperties: skipMissingProp }).then((errors: ValidationError[]) => {
            if (errors!.length > 0) {
                next(new HttpException(400, "DTO error(s): " + getAllConstraints(errors).join(", ")));
            } else {
                next();
            }
        });
    };
}

// Links:
// class-transformer: https://www.jsdocs.io/package/class-transformer#plainToInstance
// class-validator: https://github.com/typestack/class-validator
