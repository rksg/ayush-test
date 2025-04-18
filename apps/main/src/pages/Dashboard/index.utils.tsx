import { DashboardInfo } from '@acx-ui/rc/utils'

import { DEFAULT_DASHBOARD_ID } from '../AICanvas/index.utils'

export const formatDashboardList = (list: DashboardInfo[]) => {
  return list.map((item, index) => {
    return {
      ...item,
      key: item.id,
      index,
      isLanding: index === 0,
      isDefault: item.id === DEFAULT_DASHBOARD_ID
    }
  })
}