
import { IdAndName }                     from './IdAndName'
import { RogueClassificationPolicyRule } from './RogueClassificationPolicyRule'

export class RogueClassificationPolicy {
  venues?: IdAndName[]

  name: string

  description?: string

  rules?: RogueClassificationPolicyRule[]

  id?: string

  constructor () {
    this.venues = []

    this.name = ''

    this.rules = []
  }
}
