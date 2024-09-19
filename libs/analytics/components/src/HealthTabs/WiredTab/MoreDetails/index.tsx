import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol } from '@acx-ui/components'
import { AnalyticsFilter } from '@acx-ui/utils'

import { WidgetType }            from './config'
import { MoreDetailsPieChart }   from './HealthPieChart'
import { ImpactedClientsTable }  from './ImpactedClientsTable'
import { ImpactedSwitchesTable } from './ImpactedSwitchesTable'
import * as UI                   from './styledComponents'

export interface MoreDetailsDrawerProps {
  visible: boolean
  widget: WidgetType
  setVisible: (visible: boolean) => void
  setWidget: (widget: WidgetType | null) => void
  filters: AnalyticsFilter
}

export type MoreDetailsWidgetsMapping = {
  type: WidgetType
  title: string
  pieTitle: string
}[]

export const MoreDetailsDrawer = (props: MoreDetailsDrawerProps) => {

  const { visible, setVisible, widget, setWidget, filters } = props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
    setWidget(null)
  }

  const mapping: MoreDetailsWidgetsMapping = [
    {
      type: 'dhcpFailure',
      title: $t({ defaultMessage: 'DHCP' }),
      pieTitle: 'DHCP Failure'
    },
    {
      type: 'congestion',
      title: $t({ defaultMessage: 'Uplink Usage' }),
      pieTitle: 'Congested'
    },
    {
      type: 'portStorm',
      title: $t({ defaultMessage: 'Multicast Storm Ports' }),
      pieTitle: 'Storm'
    },
    {
      type: 'cpuUsage',
      title: $t({ defaultMessage: 'High CPU' }),
      pieTitle: 'High CPU'
    }
  ]
  const { title, pieTitle, type } = mapping.filter(item => item.type === widget)[0]
  const height = '355px'
  return (
    <Drawer
      title={
        <UI.DrawerTitle>
          <Typography.Title level={2}>
            {title}
          </Typography.Title>
        </UI.DrawerTitle>
      }
      width={'80%'}
      visible={visible}
      onClose={onClose}
      children={
        <UI.WrapperRow>
          <GridCol col={{ span: 9 }} key={`pie-${type}`} style={{ height }}>
            <MoreDetailsPieChart
              filters={filters}
              queryType={type}
              title={pieTitle}/>
          </GridCol>
          <GridCol col={{ span: 15 }} key={`table-${type}`} style={{ height, overflow: 'auto' }}>
            {
              (type === 'dhcpFailure' || type === 'cpuUsage') &&
                  <ImpactedSwitchesTable filters={filters} queryType={type}/>
            }
            {
              (type === 'portStorm' || type === 'congestion') &&
                  <ImpactedClientsTable filters={filters} queryType={type}/>
            }
          </GridCol>
        </UI.WrapperRow>
      }
    />
  )
}
