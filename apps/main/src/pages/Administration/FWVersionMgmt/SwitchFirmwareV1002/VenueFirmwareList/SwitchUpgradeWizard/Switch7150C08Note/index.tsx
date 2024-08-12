import { useIntl } from 'react-intl'

import { SwitchFirmwareV1002 } from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'

interface Switch7150C08NoteProps {
  icx7150C08pGroupedData: SwitchFirmwareV1002[][]
}

export function Switch7150C08Note (props: Switch7150C08NoteProps) {
  const { $t } = useIntl()
  const switchListArray = props.icx7150C08pGroupedData

  return (
    <UI.Description>
      <b>{$t({ defaultMessage: 'Note' })}</b>
      <ol>
        <li>  {$t({
          // eslint-disable-next-line max-len
          defaultMessage: 'The following switches will not be upgraded because the ICX7150-C08P/PT models do not support FastIron versions 10.0.x. You can still upgrade them to the desired 09.0.10x version by selecting these switches separately.' })}
        <ul>
          {switchListArray.map((switchList, index) => (
            <li key={index}>
              <div>
                <span style={{ fontWeight: '600' }}>
                  {$t({ defaultMessage: '<venueSingular></venueSingular>:' })} </span>
                {switchList[0]?.venueName}
              </div>
              <div>
                <span style={{ fontWeight: '600' }}>
                  {$t({ defaultMessage: 'Switch(es):' })} </span>
                {switchList.map(switchItem => switchItem.switchName).join(', ')}
              </div>
            </li>
          ))}
        </ul>
        </li>
      </ol>
    </UI.Description>
  )
}
