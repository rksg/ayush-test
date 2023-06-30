import { ApLanPortTypeEnum } from './ApLanPortTypeEnum'

export class ApLanPort {
  type: ApLanPortTypeEnum

  untagId: number

  vlanMembers: string

  portId?: string

  enabled?: boolean

  constructor () {
    this.type = ApLanPortTypeEnum['ACCESS']

    this.untagId = 0

    this.vlanMembers = ''

    this.enabled = true
  }
}
