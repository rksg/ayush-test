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
  tableTitle: string
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
      title: $t({ defaultMessage: 'DHCP Failure' }),
      pieTitle: $t({ defaultMessage: 'Top 5 DHCP Failure Switches' }),
      tableTitle: $t({ defaultMessage: 'Top 10 Switches with DHCP Failures' })
    },
    {
      type: 'congestion',
      title: $t({ defaultMessage: 'Congestion' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' })
    },
    {
      type: 'portStorm',
      title: $t({ defaultMessage: 'Port Storm' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' })
    },
    {
      type: 'cpuUsage',
      title: $t({ defaultMessage: 'High CPU' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' })
    }
  ]
  const activeWidgetMapping = mapping.filter(item => item.type === widget)[0]

  return (
    <Drawer
      title={
        <UI.Title>
          <Typography.Title level={2}>
            {activeWidgetMapping?.title}
          </Typography.Title>
        </UI.Title>
      }
      width={'80%'}
      visible={visible}
      onClose={onClose}
      children={
        <GridRow>
          <GridCol col={{ span: 9 }} key={activeWidgetMapping?.type}>
            <MoreDetailsPieChart filters={filters} queryType={activeWidgetMapping?.type}/>
          </GridCol>
          {
            (activeWidgetMapping?.type === 'dhcpFailure' ||
              activeWidgetMapping?.type === 'cpuUsage') &&
            <GridCol col={{ span: 15 }}>
              <ImpactedSwitchesTable filters={filters} queryType={activeWidgetMapping?.type}/>
            </GridCol>
          }
        </GridRow>
      }
    />
  )
}
