import { get } from '@acx-ui/config'

export function isStandaloneSwitch <Input> (a: Input, b: Input) {
  return get('IS_MLISA_SA') ? a : b
}
