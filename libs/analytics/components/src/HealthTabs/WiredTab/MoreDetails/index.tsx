import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol, GridRow } from '@acx-ui/components'
import { AnalyticsFilter }          from '@acx-ui/utils'

import { WidgetType }            from './config'
import { MoreDetailsPieChart }   from './HealthPieChart'
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
      title: $t({ defaultMessage: 'Port Storm' }),
      pieTitle: 'Storm'
    },
    {
      type: 'cpuUsage',
      title: $t({ defaultMessage: 'High CPU' }),
      pieTitle: 'High CPU'
    }
  ]
  const activeWidgetMapping = mapping.filter(item => item.type === widget)[0]

  return (
    <Drawer
      title={
        <UI.DrawerTitle>
          <Typography.Title level={2}>
            {activeWidgetMapping?.title}
          </Typography.Title>
        </UI.DrawerTitle>
      }
      width={'80%'}
      visible={visible}
      onClose={onClose}
      children={
        <GridRow style={{ paddingTop: 20 }}>
          <GridCol col={{ span: 9 }} key={`pie-${activeWidgetMapping?.type}`}>
            <MoreDetailsPieChart
              filters={filters}
              queryType={activeWidgetMapping?.type}
              title={activeWidgetMapping?.pieTitle}/>
          </GridCol>
          {
            (activeWidgetMapping?.type === 'dhcpFailure' ||
              activeWidgetMapping?.type === 'cpuUsage') &&
            <GridCol col={{ span: 15 }} key={`table-${activeWidgetMapping?.type}`}>
              <ImpactedSwitchesTable filters={filters} queryType={activeWidgetMapping?.type}/>
            </GridCol>
          }
        </GridRow>
      }
    />
  )
}
