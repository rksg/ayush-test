import { Canvas } from '@acx-ui/rc/utils'

import { Group, Section, DEFAULT_CANVAS } from './Canvas'
import { compactLayout }                  from './utils/compact'

const MENU_COLLAPSED_WIDTH = 60
const MENU_EXPANDED_WIDTH = 216
const SIDE_PADDING = 72
const WIDGET_GRID_GAP = 60
const COLUMN_COUNT = 4
export const DEFAULT_DASHBOARD_ID = 'default-dashboard-id'
export const MAXIMUM_CHAT_HISTORY = 10
export const MAXIMUM_OWNED_CANVAS = 10
export const MAXIMUM_DASHBOARD = 10

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

export const getCanvasData = (canvasList: Canvas[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ canvasData, ...rest ] = canvasList
  if (canvasList?.length && canvasData.content) {
    const canvasId = canvasData.id
    let data = JSON.parse(canvasData.content) as Section[]
    data = data.map(section => ({
      ...section,
      groups: section.groups.map(group => ({
        ...group,
        cards: compactLayout(group.cards.map(card => {
          const hasUpdated = canvasData.author
            && canvasData.diffWidgetIds?.includes(card.widgetId ?? '')
          return {
            ...card,
            updated: hasUpdated
          }
        }))
      }))
    }))
    const groups = data.flatMap(section => section.groups)
    return {
      canvasId, sections: data, groups
    }
  } else {
    if (canvasList?.length && canvasData.id) {
      return {
        canvasId: canvasData.id,
        sections: DEFAULT_CANVAS,
        groups: DEFAULT_CANVAS.reduce((acc:Group[], cur:Section) => [...acc, ...cur.groups], [])
      }
    }
  }
  return {}
}
