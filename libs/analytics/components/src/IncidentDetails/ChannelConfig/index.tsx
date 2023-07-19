import { useIntl } from 'react-intl'

import type { Incident }                   from '@acx-ui/analytics/utils'
import { GridRow, Card, Subtitle, Loader } from '@acx-ui/components'
import { formatter }                       from '@acx-ui/formatter'

import { useChannelDetailsQuery } from './services'
import * as UI                    from './styledComponents'

export const ChannelConfig = (props: { incident: Incident }) => {
  const { $t } = useIntl()
  const { incident } = props
  const configQuery = useChannelDetailsQuery(incident)
  const { data } = configQuery
  return <Card type='solid-bg'>
    <Loader states={[configQuery]}>
      <GridRow style={{ flexGrow: '1', justifyContent: 'space-around' }}>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>
            {$t({ defaultMessage: 'Channel' })}
          </UI.Title>
          <Subtitle level={3}>
            {(data?.channel === '0' || data?.channel === 'AUTO')
              ? $t({ defaultMessage: 'Auto' })
              : data?.channel}
          </Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 4 }}>
          <UI.Title>
            {$t({ defaultMessage: 'Channelization' })}
          </UI.Title>
          <Subtitle level={3}>
            {data?.channelWidth
              ? (data?.channelWidth === '_AUTO'
                ? $t({ defaultMessage: 'Auto' })
                : (data?.channelWidth.slice(1)).replace('MHZ', ' MHz').replace('_', '+'))
              : ''}
          </Subtitle>
        </UI.GridCol>
        <UI.GridCol col={{ span: 16 }}>
          <UI.Title>
            {$t({ defaultMessage: 'Channel Range ({radio})' }, {
              radio: formatter('radioFormat')(incident.code.includes('24g') ? '2.4' : '5')
            })}
          </UI.Title>
          <Subtitle level={3}>
            {data?.channelRange}
          </Subtitle>
        </UI.GridCol>
      </GridRow>
    </Loader>
  </Card>
}
