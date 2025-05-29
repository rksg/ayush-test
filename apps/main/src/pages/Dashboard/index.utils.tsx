import { defineMessage } from 'react-intl'

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

export const DashboardMessages = {
  authorTooltip: defineMessage({ defaultMessage: 'The creator or owner of this canvas.' })
}
