import {
  Row,
  Col,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle } from '@acx-ui/components'

import * as UI from '../../styledComponents'
import { FirmwareSwitchVenueV1002, SwitchFirmware } from '@acx-ui/rc/utils'

interface Switch7150C08NoteProps {
  upgradeVenueList: FirmwareSwitchVenueV1002[],
  upgradeSwitchList: SwitchFirmware[]
}

export function Switch7150C08Note (props: Switch7150C08NoteProps) {
  const { $t } = useIntl()

  return (
    <UI.Description>
    <b>{$t({ defaultMessage: 'Note' })}</b>
    <ol>
      <li>  {$t({ defaultMessage: 'The following switches will not be upgraded because the ICX7150-C08P/PT models do not support FastIron versions 10.0.x. You can still upgrade them to the desired 09.0.10x version by selecting these switches separately.' })}
        <ul>
          <li>
            <b>Venue:</b>
            <br />
            <b>Switch(es):</b>
          </li>
        </ul>
      </li>
    </ol>
  </UI.Description>
  )
}
