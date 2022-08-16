import { RadioEnum }     from './RadioEnum'
import { RadioTypeEnum } from './RadioTypeEnum'

export class NetworkApGroup {
  apGroupId?: string
  vlanId?: number
  radio: RadioEnum
  radioTypes?: RadioTypeEnum[]
  isDefault?: boolean
  apGroupName?: string
  validationErrorReachedMaxConnectedNetworksLimit?: boolean
  validationErrorSsidAlreadyActivated?: boolean
  validationErrorReachedMaxConnectedCaptiveNetworksLimit?: boolean
  validationError?: boolean
  vlanPoolId?: string
  vlanPoolName?: string
  id?: string

  constructor () {
    this.radio = RadioEnum.Both

    this.radioTypes = []

    this.isDefault = false

    this.validationErrorReachedMaxConnectedNetworksLimit = false

    this.validationErrorSsidAlreadyActivated = false

    this.validationErrorReachedMaxConnectedCaptiveNetworksLimit = false

    this.validationError = false
  }
}
