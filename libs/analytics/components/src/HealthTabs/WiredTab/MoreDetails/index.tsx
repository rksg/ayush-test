import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol, GridRow } from '@acx-ui/components'
import { AnalyticsFilter }          from '@acx-ui/utils'

import { MoreDetailsPieChart }   from './HealthPieChart'
import { ImpactedSwitchesTable } from './ImpactedSwitchesTable'
import { WidgetType }            from './services'
import * as UI                   from './styledComponents'

export interface MoreDetailsDrawerProps {
  visible: boolean
  widget: String
  setVisible: (visible: boolean) => void
  setWidget: (widget: WidgetType['type']) => void
  filters: AnalyticsFilter
}

export type MoreDetailsWidgetsMapping = {
  type: WidgetType['type']
  title: string
  pieTitle: string
  tableTitle: string
}[]

export const MoreDetailsDrawer = (props: MoreDetailsDrawerProps) => {

  const { visible, setVisible, widget, setWidget, filters } = props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
    setWidget('')
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
      style={{ marginTop: '85px' }}
      children={
        <GridRow>
          <GridCol key={activeWidgetMapping?.type}
            col={{ span: 8 }}
            style={{ height: 260, width: 430 }}>
            {
              <>
                <UI.ChartTitle>{activeWidgetMapping?.pieTitle}</UI.ChartTitle>
                <MoreDetailsPieChart filters={filters} queryType={activeWidgetMapping?.type}/>
              </>
            }
          </GridCol>
          {
            (activeWidgetMapping?.type === 'dhcpFailure' ||
              activeWidgetMapping?.type === 'cpuUsage') &&
            <GridCol col={{ span: 16 }} style={{ height: 260, width: 830 }}>
              {
                <>
                  <UI.ChartTitle>{activeWidgetMapping?.tableTitle}</UI.ChartTitle>
                  <ImpactedSwitchesTable filters={filters} queryType={activeWidgetMapping?.type}/>
                </>
              }
            </GridCol>
          }
        </GridRow>
      }
    />
  )
}
