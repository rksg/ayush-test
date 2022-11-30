import { CapabilitiesApModel } from './CapabilitiesApModel'

export class ApCapabilities {
  version?: string

  apModels?: CapabilitiesApModel[]

  constructor () {
    this.apModels = []
  }
}
