import { useIntl } from 'react-intl'

import { AnchorLayout, StepsForm } from '@acx-ui/components'

import { AAAServers } from './AAAServers'

export function SwitchAAATab () {
  const { $t } = useIntl()
  const serversTitle = $t({ defaultMessage: 'Servers & Users' })
  const settingsTitle = $t({ defaultMessage: 'Settings' })
  const anchorItems = [{
    title: serversTitle,
    content: (
      <>
        <StepsForm.SectionTitle id='aaa-servers'>
          { serversTitle }
        </StepsForm.SectionTitle>
        <AAAServers />
      </>
    )
  }, {
    title: settingsTitle,
    content: (
      <StepsForm.SectionTitle id='aaa-settings'>
        { settingsTitle }
      </StepsForm.SectionTitle>
    )
  }]
  return (
    <AnchorLayout items={anchorItems} offsetTop={275} />
  )
}