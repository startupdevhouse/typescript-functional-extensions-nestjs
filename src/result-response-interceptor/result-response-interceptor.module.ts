import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import {
  ResultResponseInterceptor,
  ResultResponseInterceptorConfiguration,
} from './result-response.interceptor';

@Module({})
export class ResultResponseInterceptorModule {
  static register(
    configuration: ResultResponseInterceptorConfiguration<unknown> = {},
  ): DynamicModule {
    return {
      module: ResultResponseInterceptorModule,
      providers: [
        {
          provide: APP_INTERCEPTOR,
          useFactory: () => new ResultResponseInterceptor(configuration),
        },
      ],
    };
  }
}
