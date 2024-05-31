import { MessageDescriptor, defineMessage } from 'react-intl'

import {
  APMeshSignalExcellent,
  APMeshSignalGood,
  APMeshSignalLow,
  APMeshSignalPoor
} from '@acx-ui/icons'
import { APMeshRole, SignalStrengthLevel } from '@acx-ui/rc/utils'

export const apMeshRoleLabelMap: Record<APMeshRole, MessageDescriptor> = {
  [APMeshRole.RAP]: defineMessage({ defaultMessage: 'Root' }),
  [APMeshRole.MAP]: defineMessage({ defaultMessage: 'Mesh' }),
  [APMeshRole.EMAP]: defineMessage({ defaultMessage: 'Ethernet Mesh' }),
  [APMeshRole.DISABLED]: defineMessage({ defaultMessage: 'Disabled' })
}

export const snrColorMap: Record<SignalStrengthLevel, string> = {
  [SignalStrengthLevel.EXCELLENT]: '#23AB36',
  [SignalStrengthLevel.GOOD]: '#23AB36',
  [SignalStrengthLevel.LOW]: '#F9C34B',
  [SignalStrengthLevel.POOR]: '#ED1C24'
}

export const snrIconMap: Record<SignalStrengthLevel, React.FunctionComponent> = {
  [SignalStrengthLevel.EXCELLENT]: APMeshSignalExcellent,
  [SignalStrengthLevel.GOOD]: APMeshSignalGood,
  [SignalStrengthLevel.LOW]: APMeshSignalLow,
  [SignalStrengthLevel.POOR]: APMeshSignalPoor
}
