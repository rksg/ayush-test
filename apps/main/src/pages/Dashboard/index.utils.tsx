import { TooltipProps }  from '@acx-ui/components'
import { DashboardInfo } from '@acx-ui/rc/utils'

import { DEFAULT_DASHBOARD_ID } from '../AICanvas/index.utils'

export const formatDashboardList = (list: DashboardInfo[]) => {
  return list.map((item, index) => {
    return {
      ...item,
      index,
      isLanding: index === 0,
      isDefault: item.id === DEFAULT_DASHBOARD_ID
    }
  })
}

export const tooltipConfig: TooltipProps = {
  placement: 'bottom',
  overlayInnerStyle: { fontSize: '12px', minHeight: '28px' }
}