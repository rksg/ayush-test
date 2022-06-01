import { Params } from '@acx-ui/react-router-dom'

export interface RequestPayload {
    params?: Params<string>
    payload?: any
  }