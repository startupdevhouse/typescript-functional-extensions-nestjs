import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { Result, Unit } from 'typescript-functional-extensions';

export type HandleFn<T> = (result: Result<T, any>) => T | undefined;
export type MappingFn = (data: unknown) => unknown;

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

function mappingFnDefault<T>(data: T): unknown {
  return {
    data,
  };
}

export type ResultResponseInterceptorResult<T> = { data: T | undefined } | any;

export type ResultResponseInterceptorConfiguration<T> = {
  handleFn?: HandleFn<T>;
  mappingFn?: MappingFn;
};

export class ResultResponseInterceptor<T> implements NestInterceptor {
  private readonly handleFn: HandleFn<T>;
  private readonly mappingFn: MappingFn;

  constructor(configuration: ResultResponseInterceptorConfiguration<T>) {
    this.handleFn = configuration.handleFn || handleFnDefault;
    this.mappingFn = configuration.mappingFn || mappingFnDefault;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler<Result<T>> | CallHandler<unknown>,
  ): Observable<ResultResponseInterceptorResult<T>> {
    return next.handle().pipe(
      map((response) => {
        // In some situations there is a problem with using instanceOf if a class is in the package and in the project using the package.
        // Therefore we introduce this comparison function as a workaround.
        if (response && response.toString) {
          const string = response.toString();
          if (['Result.success', 'Result.failure'].includes(string)) {
            return this.handleFn(response as Result<T>);
          }
        }

        return response;
      }),
      map((data) => this.mappingFn(data)),
    );
  }
}
