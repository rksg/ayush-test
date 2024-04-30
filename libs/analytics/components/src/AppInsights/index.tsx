import { List }    from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Loader, Card }                               from '@acx-ui/components'
import { GoogleMeets, Teams, Webex, Workplace, Zoom } from '@acx-ui/icons'
import { TenantLink }                                 from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

type InsightType = {
  name: string
  id: number
  metric: string
  icon: JSX.Element
  latency: string
}

export function AppInsights () {
  const { $t } = useIntl()
  const title = {
    title: $t({ defaultMessage: 'AppInsights' }),
    icon: null
  }
  const subtitle = $t({
    defaultMessage: 'Empower yourself to proactively enhance user experience for pivotal apps.' })

  const Insights = [ // static data
    {
      name: 'Microsoft Teams',
      id: 1,
      metric: 'Overall QoE Score',
      icon: <Teams />,
      latency: '10ms'
    },
    {
      name: 'Zoom',
      id: 2,
      metric: 'Overall QoE Score',
      icon: <Zoom />,
      latency: '20ms'
    },
    {
      name: 'Cisco WebEx',
      id: 3,
      metric: 'Overall QoE Score',
      icon: <Webex />,
      latency: '30ms'
    },
    {
      name: 'Google Meet',
      id: 4,
      metric: 'Overall QoE Score',
      icon: <GoogleMeets />,
      latency: '40ms'
    },
    {
      name: 'Workplace',
      id: 5,
      metric: 'Overall QoE Score',
      icon: <Workplace />,
      latency: '50ms'
    }
  ]

  return <Loader>
    <Card title={title} subTitle={subtitle}>
      <AutoSizer>
        {(size) => <UI.Container style={size}>
          <List<InsightType>
            dataSource={Insights}
            renderItem={insight => {
              const { name, metric, id, icon, latency } = insight
              return <UI.ListItem key={id} actions={[latency]}>
                <TenantLink to={''} style={{ pointerEvents: 'none' }}> {/* currently disable click events */}
                  <UI.ListItem.Meta
                    avatar={icon}
                    title={name}
                    description={metric}
                  />
                </TenantLink>
              </UI.ListItem>
            }}
          />
          <UI.Mask style={size}>
            <UI.Button type='primary'>
              {$t({ defaultMessage: 'Get started now!' })}
            </UI.Button>
          </UI.Mask>
        </UI.Container>}
      </AutoSizer>
    </Card>
  </Loader>
}
