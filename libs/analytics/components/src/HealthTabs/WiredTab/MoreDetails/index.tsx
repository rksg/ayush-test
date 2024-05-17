import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol, GridRow } from '@acx-ui/components'
import { NodesFilter, SSIDFilter }  from '@acx-ui/utils'

import { MoreDetailsPieChart }  from './moreDetailsPieChart'
import { usePieChartDataQuery } from './services'
import * as UI                  from './styledComponents'

interface AddMoreDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  widget: String
  setWidget: (widget: String) => void
  payload: {
    start: string,
    end: string,
    filter: NodesFilter & SSIDFilter
  }
}

export const AddMoreDetailsDrawer = (props: AddMoreDetailsDrawerProps) => {

  const { visible, setVisible, widget, setWidget, payload } = props
  const { $t } = useIntl()
  const onClose = () => {
    setVisible(false)
    setWidget('')
  }
  const filters = {
    filter: payload.filter,
    start: payload.start,
    end: payload.end,
    n: 5,
    type: widget
  }

  const { data: summaryData } = usePieChartDataQuery(filters)
  const topNByCpuData = summaryData?.topNSwitchesByCpuUsage
  const topNByDhcpData = summaryData?.topNSwitchesByDhcpFailure

  const mapping = [
    {
      type: 'dhcp',
      title: $t({ defaultMessage: 'DHCP Failure' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      pieData: topNByDhcpData
    },
    {
      type: 'congestion',
      title: $t({ defaultMessage: 'Congestion' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' }),
      pieData: []
    },
    {
      type: 'portStorm',
      title: $t({ defaultMessage: 'Port Storm' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Clients' }),
      pieData: []
    },
    {
      type: 'cpu',
      title: $t({ defaultMessage: 'High CPU' }),
      pieTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      tableTitle: $t({ defaultMessage: 'Top Impacted Switches' }),
      pieData: topNByCpuData
    }
  ]
  const matchingMapping = mapping.filter(item => item.type === widget)
  return (
    <Drawer
      title={
        <UI.Title>
          <Typography.Title level={2}>
            {matchingMapping[0]?.title}
          </Typography.Title>
        </UI.Title>
      }
      width={1111}
      visible={visible}
      onClose={onClose}
      style={{ marginTop: '85px' }}
      children={
        <GridRow>
          <GridCol key={matchingMapping[0]?.type}
            col={{ span: 10 }}
            style={{ height: 260, width: 430 }}>
            <UI.PieTitle>
              <Typography.Paragraph>
                {matchingMapping[0]?.pieTitle}
              </Typography.Paragraph>
            </UI.PieTitle>
            {<MoreDetailsPieChart mapping={matchingMapping}/>}
          </GridCol>
        </GridRow>
      } // table TBD
    />
  )
}
