import { ResultResponseInterceptor } from './result-response.interceptor';
import { BadRequestException, CallHandler } from '@nestjs/common';
import { Result } from 'typescript-functional-extensions';
import { Observable, of } from 'rxjs';

describe('ResultResponseInterceptor', () => {
  describe('with default handleFn', () => {
    const resultResponseInterceptor = new ResultResponseInterceptor();

    it('should throw BadRequestException when result is failure', (done) => {
      const next: CallHandler<Result<string>> = {
        handle(): Observable<Result<string>> {
          return of(Result.failure<string, string>(''));
        },
      };

      const observable = resultResponseInterceptor.intercept(null, next);

      observable.subscribe({
        error: (error) => {
          expect(error).toBeInstanceOf(BadRequestException);
          done();
        },
      });
    });

    it('should return value if not failure', (done) => {
      const expectedValue = 'This one is fine';
      const next: CallHandler<Result<string>> = {
        handle(): Observable<Result<string>> {
          return of(Result.success<string, string>(expectedValue));
        },
      };

      const observable = resultResponseInterceptor.intercept(null, next);

      observable.subscribe({
        next: (value) => {
          expect(value.data).toEqual(expectedValue);
          done();
        },
      });
    });
  });

  describe('with custom handleFn', () => {
    it('should call handleFn if intercepted value is type of Result', (done) => {
      const handleFn = jest.fn();
      const resultResponseInterceptor = new ResultResponseInterceptor(handleFn);

      const next: CallHandler<Result<string>> = {
        handle(): Observable<Result<string>> {
          return of(Result.success<string, string>(''));
        },
      };

      resultResponseInterceptor.intercept(null, next).subscribe(() => {
        expect(handleFn).toBeCalled();
        done();
      });
    });

    it('should NOT call handleFn if intercepted value is NOT type of Result', (done) => {
      const handleFn = jest.fn();
      const resultResponseInterceptor = new ResultResponseInterceptor(handleFn);

      const next: CallHandler<string> = {
        handle(): Observable<string> {
          return of('');
        },
      };

      resultResponseInterceptor.intercept(null, next).subscribe(() => {
        expect(handleFn).not.toBeCalled();
        done();
      });
    });
  });
});
