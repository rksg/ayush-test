import { DEFAULT_DASHBOARD_ID } from '../AICanvas/index.utils'

export interface DashboardInfo {
  id: string
  name: string
  author?: string
  updatedDate?: string
  widgetIds?: string[]
  diffWidgetIds?: string[]
  isLanding?: boolean
  isDefault?: boolean
  key: string
  index: number
}

export const updateDashboardList = (list: DashboardInfo[]) => {
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