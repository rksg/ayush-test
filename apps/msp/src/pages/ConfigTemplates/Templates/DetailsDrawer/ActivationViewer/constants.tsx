import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { NetworkActivationViewer } from './NetworkActivationViewer'
import { VenueActivationViewer }   from './VenueActivationViewer'

import { ActivationViewerProps } from '.'

export type AllowedDisplayActivationTemplateTypes =
  ConfigTemplateType.VENUE |
  ConfigTemplateType.DPSK |
  ConfigTemplateType.RADIUS |
  ConfigTemplateType.NETWORK |
  ConfigTemplateType.SYSLOG

export const allowedDisplayActivationTemplateTypesSet = new Set<ConfigTemplateType>([
  ConfigTemplateType.VENUE,
  ConfigTemplateType.DPSK,
  ConfigTemplateType.RADIUS,
  ConfigTemplateType.NETWORK,
  ConfigTemplateType.SYSLOG
])

// eslint-disable-next-line max-len
export function isAllowedDisplayActivationType (type: ConfigTemplateType): type is AllowedDisplayActivationTemplateTypes {
  return allowedDisplayActivationTemplateTypesSet.has(type)
}

// eslint-disable-next-line max-len
export const activationViewerMap: Record<AllowedDisplayActivationTemplateTypes, React.FC<ActivationViewerProps>> = {
  [ConfigTemplateType.NETWORK]: VenueActivationViewer,
  [ConfigTemplateType.VENUE]: NetworkActivationViewer,
  [ConfigTemplateType.DPSK]: NetworkActivationViewer,
  [ConfigTemplateType.RADIUS]: NetworkActivationViewer,
  [ConfigTemplateType.SYSLOG]: VenueActivationViewer
}