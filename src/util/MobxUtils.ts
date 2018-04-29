import { flow } from "mobx"

// https://github.com/mobxjs/mobx/issues/1405#issuecomment-377154852
export function flowed(
  _: object,
  _1: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => IterableIterator<any>>
): any {
  if (descriptor.value) {
    descriptor.value = flow(descriptor.value) as any
  }
}
