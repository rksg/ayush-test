import type { CompatibilityNodeError, InterfaceCompatibilityError } from '../CompatibilityErrorDetails/types'

export const errorDetails = [{
  nodeId: '123',
  nodeName: 'SE_Node 1',
  errors: {
    lags: 1
  }
}, {
  nodeId: '321',
  nodeName: 'SE_Node 2',
  errors: {
    corePort: 0
  }
}] as CompatibilityNodeError<InterfaceCompatibilityError>[]