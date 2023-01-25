# NestJS typescript-functional-extensions utilities

This package contains utilities for working with [typescript-functional-extensions](https://www.npmjs.com/package/typescript-functional-extensions) in NestJS projects. Notably, it has the `ResultResponseInterceptorModule` with `ResultResponseInterceptor` that processes `Result` monads returned by controller methods and converts them to HTTP responses.

## Installation

```
# using npm
npm install --save @startupdevhouse/typescript-functional-extensions-nestjs

# or using yarn
yarn add @startupdevhouse/typescript-functional-extensions-nestjs
```

## Configuration

### Import the module
To convert `Result` monads to HTTP responses register the `ResultResponseInterceptorModule` in your `AppModule`:

```typescript
@Module({
  imports: [
    ResultResponseInterceptorModule.register(),
  ],
})
export class AppModule {}
```

Then return a `Result` in your controller:
```typescript
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    const result = Result.success(this.appService.getData());

    return result;
  }
}
```

### Default module configuration
By default the module will return HTTP 200 OK for success results returned by application controllers. Additionally, if the result returned contained a value other than `Unit.Instance` it will be unwrapped and returned in the response body.

All failures will be returned as HTTP 400 Bad Request. Default implementation will unwrap the error and return it in the response body.

### Customization
`ResultResponseInterceptorModule` accepts the `handleFn` property in configuration options. You can override the default result handling logic there. In the following example all errors ending with `.DOES_NOT_EXIST` postfix will be processed as HTTP 404 responses:

```typescript
function handleResult(result: Result<unknown, any>) {
  if (result.isSuccess) {
    const value = result.getValueOrDefault(Unit.Instance);

    if (value === Unit.Instance) {
      return;
    }

    return value;
  }
  const error = result.getErrorOrThrow() as string;
  const errorParts = error.split('_');

  if (error.endsWith('.DOES_NOT_EXIST')) {
    throw new NotFoundException(error);
  }

  throw new BadRequestException(error);
}

@Module({
  imports: [
    ResultResponseInterceptorModule.register({
      handleFn: handleResult,
    }),
  ],
})
export class AppModule {}
```

## Contributing
If you've found a bug or have a feature request, please [open an issue]() on GitHub.

If you'd like to make a contribution, you can [create a Pull Request]() on GitHub.

## Startup Development House
<img src="https://start-up.house/packs/media/images/home/logo-lightbg-4f1a397101dea4defb8d18e275203d56.svg" alt="SDH" />

This package was initially created for projects in [Startup Development House](https://start-up.house). We love using Monads so we decided to share this love with the community ❤️
