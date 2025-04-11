import { Section }       from '../AICanvas/Canvas'
import { compactLayout } from '../AICanvas/utils/compact'

import { mockCanvas } from './mockData'

const MENU_COLLAPSED_WIDTH = 60
const MENU_EXPANDED_WIDTH = 216
const SIDE_PADDING = 72
const WIDGET_GRID_GAP = 60
const COLUMN_COUNT = 4
export const DEFAULT_DASHBOARD_ID = 'default-dashboard-id'

export const getMenuWidth = (menuCollapsed?: boolean) => {
  return menuCollapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH
}

export const getPreviewModalWidth = (
  menuWidth: number, isFullmode: boolean
) => {
  return isFullmode
    ? document.documentElement.clientWidth
    : document.documentElement.clientWidth - menuWidth
}

export const getCalculatedColumnWidth = (
  menuCollapsed?: boolean, width?: number
) => {
  const menuWidth = menuCollapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH
  const viewWidth = width ?? document.documentElement.clientWidth - menuWidth
  return (viewWidth - SIDE_PADDING - WIDGET_GRID_GAP) / COLUMN_COUNT
}

export const getCanvasData = () => { //temp
  const response = mockCanvas
  if (response?.length && response[0].content) {
    const canvasId = response[0].id
    let data = JSON.parse(response[0].content) as Section[]
    data = data.map(section => ({
      ...section,
      groups: section.groups.map(group => ({
        ...group,
        cards: compactLayout(group.cards)
      }))
    }))
    const groups = data.flatMap(section => section.groups)
    return {
      canvasId, sections: data, groups
    }
  } else {
    if (response?.length && response[0].id) {
      return { canvasId: response[0].id }
    }
  }
  return {}
}
