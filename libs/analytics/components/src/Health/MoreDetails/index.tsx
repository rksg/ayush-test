import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Drawer, GridCol, GridRow } from '@acx-ui/components'
import { AnalyticsFilter }          from '@acx-ui/utils'

import { HealthDrillDown }    from '../HealthDrillDown'
import { DrilldownSelection } from '../HealthDrillDown/config'

import * as UI from './styledComponents'

export type WidgetType =
  | 'successCount'
  | 'failureCount'
  | 'successPercentage'
  | 'averageTtc'
  | null

export interface MoreDetailsDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  widget: WidgetType
  setWidget: (widget: WidgetType) => void
  filters: AnalyticsFilter
}

export type MoreDetailsWidgetsMapping = {
  type: WidgetType
  title: string
  drilldownSelection: DrilldownSelection
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
      type: 'successCount',
      title: $t({ defaultMessage: 'Connection Failures' }),
      drilldownSelection: 'connectionFailure'
    },
    {
      type: 'failureCount',
      title: $t({ defaultMessage: 'Connection Failures' }),
      drilldownSelection: 'connectionFailure'
    },
    {
      type: 'successPercentage',
      title: $t({ defaultMessage: 'Connection Failures' }),
      drilldownSelection: 'connectionFailure'
    },
    {
      type: 'averageTtc',
      title: $t({ defaultMessage: 'Average Time To Connect' }),
      drilldownSelection: 'ttc'
    }
  ]

  const { title, drilldownSelection, type } = mapping.filter(item => item.type === widget)[0]
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
        <GridRow>
          <GridCol col={{ span: 24 }} key={`drawer-${type}`} style={{ height: 220, minWidth: 380 }}>
            <HealthDrillDown
              filters={filters}
              drilldownSelection={visible ? drilldownSelection : null}
            />
          </GridCol>
        </GridRow>
      }
    />
  )
}
