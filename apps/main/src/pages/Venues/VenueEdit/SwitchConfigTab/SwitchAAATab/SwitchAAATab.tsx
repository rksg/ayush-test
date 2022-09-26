import { Divider } from 'antd'
import { useIntl } from 'react-intl'

import { AnchorLayout, Subtitle } from '@acx-ui/components'

import { AAAServers } from './AAAServers'

export function SwitchAAATab () {
  const { $t } = useIntl()
  const serversTitle = $t({ defaultMessage: 'Servers & Users' })
  const settingsTitle = $t({ defaultMessage: 'Settings' })
  const anchorItems = [{
    title: serversTitle,
    content: (
      <>
        <Subtitle level={3} id='aaa-servers'>
          { serversTitle }
        </Subtitle>
        <Divider style={{ marginTop: '4px' }} />
        <AAAServers />
      </>
    )
  }, {
    title: settingsTitle,
    content: (
      <>
        <Subtitle level={3} id='aaa-settings'>
          { settingsTitle }
        </Subtitle>
        <Divider style={{ marginTop: '4px' }} />
      </>
    )
  }]
  return (
    <AnchorLayout items={anchorItems} offsetTop={275} />
  )
}