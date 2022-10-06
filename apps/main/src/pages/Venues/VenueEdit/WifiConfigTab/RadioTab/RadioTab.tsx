import { useIntl } from 'react-intl'

import { AnchorLayout, StepsForm } from '@acx-ui/components'

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
        <StepsForm.SectionTitle id='radio-settings'>
          { wifiSettingTitle }
        </StepsForm.SectionTitle>
        <RadioSettings />
      </>
    )
  }, {
    title: externalTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='external-antenna'>
          { externalTitle }
        </StepsForm.SectionTitle>
        <ExternalAntenna />
      </>
    )
  }]
  return (
    <AnchorLayout items={anchorItems} offsetTop={275} />
  )
}