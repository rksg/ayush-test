import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol, GridRow } from '@acx-ui/components'
import { AnalyticsFilter }          from '@acx-ui/utils'

import { MoreDetailsPieChart } from './HealthPieChart'
import * as UI                 from './styledComponents'


export interface MoreDetailsDrawerProps {
  visible: boolean
  widget: String
  setVisible: (visible: boolean) => void
  setWidget: (widget: String) => void
  filters: AnalyticsFilter
}

export type MoreDetailsWidgetsMapping = {
  type: string
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
      type: 'dhcp',
      title: $t({ defaultMessage: 'DHCP Failure' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' })
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
      type: 'cpu',
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
      width={1111}
      visible={visible}
      onClose={onClose}
      style={{ marginTop: '85px' }}
      children={
        <GridRow>
          <GridCol key={activeWidgetMapping?.type}
            col={{ span: 10 }}
            style={{ height: 260, width: 430 }}>
            <UI.PieTitle>
              <Typography.Paragraph>
                {activeWidgetMapping?.pieTitle}
              </Typography.Paragraph>
            </UI.PieTitle>
            {<MoreDetailsPieChart filters={filters} queryType={activeWidgetMapping?.type}/>}
          </GridCol>
        </GridRow>
      } // table TBD
    />
  )
}
