import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import { RogueApLocation } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export function RogueApLocationMarker ({ rogueApDevices }: {
  rogueApDevices: RogueApLocation | undefined
}) {
  const { $t } = useIntl()

  if (!rogueApDevices?.hasOwnProperty('xPercent')) return null
  return <div>
    <Tooltip title={
      <span style={{ fontSize: '11px' }}>{$t({ defaultMessage: 'Rogue AP' })}</span>
    } >
      <UI.RogueApLocation
        className={`rogue-snr mark-location-rogue ${rogueApDevices?.category.toLowerCase()}`}
        style={
          {
            top: 'calc(' + rogueApDevices?.xPercent + '%)',
            left: 'calc(' + rogueApDevices?.yPercent + '%)'
          }
        } />
    </Tooltip>
  </div>
}
