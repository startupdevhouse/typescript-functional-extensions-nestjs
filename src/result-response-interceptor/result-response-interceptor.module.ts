import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import {
  HandleFn,
  ResultResponseInterceptor,
} from './result-response.interceptor';

@Module({})
export class ResultResponseInterceptorModule {
  static register(
    options: { handleFn?: HandleFn<unknown> } = {},
  ): DynamicModule {
    return {
      module: ResultResponseInterceptorModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useFactory: () => new ResultResponseInterceptor(options.handleFn),
        },
      ],
    };
  }
}
