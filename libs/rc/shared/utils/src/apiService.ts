export {
  // ApiInfo,
  Filters,
  // createHttpRequest,
  getFilters,
  isDev,
  // isDelegationMode,
  isLocalHost
} from '@acx-ui/utils'

// eslint-disable-next-line max-len
export function isPromiseSettledFulfilled <T,> (p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> {
  return p.status === 'fulfilled'
}