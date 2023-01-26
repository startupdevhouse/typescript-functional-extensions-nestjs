import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Result, Unit } from 'typescript-functional-extensions';

export type HandleFn<T> = (result: Result<T, any>) => T | undefined;

function handleFnDefault<T>(result: Result<T, any>) {
  if (result.isFailure) {
    throw new BadRequestException(result.getErrorOrThrow());
  }

  const value = result.getValueOrThrow();

  if (value === Unit.Instance) {
    return;
  }

  return value;
}

export type ResultResponseInterceptorResult<T> = { data: T | undefined } | any;

export class ResultResponseInterceptor<T> implements NestInterceptor {
  constructor(private readonly handleFn: HandleFn<T> = handleFnDefault) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<Result<T>> | CallHandler<unknown>,
  ): Observable<ResultResponseInterceptorResult<T>> {
    return next.handle().pipe(
      map((response) => {
        if (response instanceof Result) {
          return this.handleFn(response);
        }

        return response;
      }),
      map((data) => ({ data })),
    );
  }
}
