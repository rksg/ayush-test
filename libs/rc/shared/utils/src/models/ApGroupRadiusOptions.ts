import { RadiusOptions } from './RadiusOptions'


export class ApGroupRadiusOptions extends RadiusOptions {
  overrideEnabled: boolean

  constructor () {
    super()

    this.overrideEnabled = false
  }
}
