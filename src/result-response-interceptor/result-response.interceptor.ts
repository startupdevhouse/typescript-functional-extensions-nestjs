/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Result, Unit } from 'typescript-functional-extensions';

export type HandleFn = (result: Result<unknown, any>) => undefined | unknown;

function handleFnDefault(result: Result<unknown, any>) {
  if (result.isFailure) {
    throw new BadRequestException(result.getErrorOrThrow());
  }

  const value = result.getValueOrDefault(Unit.Instance);

  if (value === Unit.Instance) {
    return;
  }

  return value;
}

export class ResultResponseInterceptor implements NestInterceptor {
  constructor(private readonly handleFn: HandleFn | undefined) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((response) => {
        switch (true) {
          case response instanceof Result:
            return this.processResult(response);
          default:
            return response;
        }
      }),
      map((data) => ({ data })),
    );
  }

  private processResult(response: Result<unknown, any>) {
    return this.handleFn ? this.handleFn(response) : handleFnDefault(response);
  }
}
