import { RadioEnum }     from './RadioEnum'
import { RadioTypeEnum } from './RadioTypeEnum'

export class NetworkApGroup {
  // AP-group ID
  apGroupId?: string

  vlanId?: number

  // *Deprecated* Legacy AP group radio type configuration (might be removed in later release)
  radio: RadioEnum

  // AP group radio types configuration
  radioTypes?: RadioTypeEnum[]

  isDefault?: boolean

  apGroupName?: string

  // Indicate whether a network ap group has reached its max connected networks
  validationErrorReachedMaxConnectedNetworksLimit?: boolean

  // Indicate whether a ssid already activated on network ap group
  validationErrorSsidAlreadyActivated?: boolean

  // Indicate whether a captive network ap group has reached its max connected networks
  validationErrorReachedMaxConnectedCaptiveNetworksLimit?: boolean

  // Indicate whether one of the validations has an error
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
