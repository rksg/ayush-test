import { useIntl } from 'react-intl'

import { Loader, Card, Tooltip, ColorPill }           from '@acx-ui/components'
import { GoogleMeets, Teams, Webex, Workplace, Zoom } from '@acx-ui/icons'
import { TenantLink }                                 from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

type InsightType = {
  name: string,
  id: number,
  metric: string,
  icon: JSX.Element,
  value: JSX.Element
}

export function AppInsights () {
  const { $t } = useIntl()
  const title = {
    title: $t({ defaultMessage: 'AppInsights' }),
    icon: null
  }
  const subtitle = $t({
    defaultMessage: 'Empower yourself to proactively enhance user experience for pivotal apps.' })

  const Insights = [
    {
      name: 'Microsoft Teams',
      id: 1,
      metric: 'Overall QoE Score',
      icon: <Teams />
    },
    {
      name: 'Zoom',
      id: 2,
      metric: 'Overall QoE Score',
      icon: <Zoom />
    },
    {
      name: 'Cisco WebEx',
      id: 3,
      metric: 'Overall QoE Score',
      icon: <Webex />
    },
    {
      name: 'Google Meet',
      id: 4,
      metric: 'Overall QoE Score',
      icon: <GoogleMeets />
    },
    {
      name: 'Workplace',
      id: 5,
      metric: 'Overall QoE Score',
      icon: <Workplace />,
      value: <ColorPill
        color='var(--acx-accents-orange-50)'
        value='80'
      />
    }
  ]

  return <Loader>
    <Card title={title} subTitle={subtitle}>
      <UI.List
        dataSource={Insights}
        renderItem={item => {
          const insight = item as InsightType
          const { name, metric, id, icon, value } = insight
          return <UI.List.Item key={id}>
            <TenantLink to={`/appInsights/${id}`}>
              <Tooltip
                placement='top'
                title={$t(
                  { defaultMessage: '{name}' },
                  { name }
                )}
              >
                <UI.List.Item.Meta
                  avatar={icon}
                  title={name}
                  description={metric}
                >
                  {value}
                  <div>test</div>
                </UI.List.Item.Meta>
              </Tooltip>
            </TenantLink>
          </UI.List.Item>
        }}
      />
    </Card>
  </Loader>
}
