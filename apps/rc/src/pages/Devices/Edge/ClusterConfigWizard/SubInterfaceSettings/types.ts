
import { CompatibilityNodeError } from '@acx-ui/rc/components'
import {
  EdgeSerialNumber,
  SubInterface
} from '@acx-ui/rc/utils'

export interface SubInterfaceSettingsFormType {
  portSubInterfaces: Record<EdgeSerialNumber, { [portId:string]: SubInterface[] }>
  lagSubInterfaces: Record<EdgeSerialNumber, { [lagId:string]: SubInterface[] }>
}

export interface SubInterfaceCompatibility {
  totalSubInterfaceCount: { isError?: boolean, value: number },
  portSubInterfaceVlans: {
    [portId: string]: {
      vlanIds: { value: number[] }
    }
  }
  lagSubInterfaceVlans: {
    [lagId: string]: {
      vlanIds: { value: number[] }
    }
  }
}

export interface CompatibilityCheckResult {
  results: CompatibilityNodeError<SubInterfaceCompatibility>[]
  isError: boolean
}
