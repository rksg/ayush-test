import { useIntl } from 'react-intl'

import { AnchorLayout, Subtitle } from '@acx-ui/components'

import * as UI from '../../styledComponents'

import { ExternalAntenna } from './ExternalAntenna'
import { RadioSettings }   from './RadioSettings'

export function RadioTab () {
  const { $t } = useIntl()
  const wifiSettingTitle = $t({ defaultMessage: 'Wi-Fi Radio Settings' })
  const externalTitle = $t({ defaultMessage: 'External Antenna' })
  const anchorItems = [{
    title: wifiSettingTitle,
    content: (
      <>
        <Subtitle level={3} id='radio-settings'>
          { wifiSettingTitle }
        </Subtitle>
        <UI.Divider />
        <RadioSettings />
      </>
    )
  }, {
    title: externalTitle,
    content: (
      <>
        <Subtitle level={3} id='external-antenna'>
          { externalTitle }
        </Subtitle>
        <UI.Divider />
        <ExternalAntenna />
      </>
    )
  }]
  return (
    <AnchorLayout items={anchorItems} offsetTop={275} />
  )
}