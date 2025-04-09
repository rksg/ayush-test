import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { NetworkActivationViewer } from './NetworkActivationViewer'
import { VenueActivationViewer }   from './VenueActivationViewer'

import { ActivationViewerProps } from '.'

export const allowedDisplayActivationTemplateTypesSet = new Set<ConfigTemplateType>([
  ConfigTemplateType.VENUE,
  ConfigTemplateType.DPSK,
  ConfigTemplateType.RADIUS,
  ConfigTemplateType.NETWORK,
  ConfigTemplateType.SYSLOG
])

// eslint-disable-next-line max-len
export const activationViewerMap: Partial<Record<ConfigTemplateType, React.FC<ActivationViewerProps>>> = {
  [ConfigTemplateType.NETWORK]: VenueActivationViewer,
  [ConfigTemplateType.VENUE]: NetworkActivationViewer,
  [ConfigTemplateType.DPSK]: NetworkActivationViewer,
  [ConfigTemplateType.RADIUS]: NetworkActivationViewer,
  [ConfigTemplateType.SYSLOG]: VenueActivationViewer
}