import { Canvas } from '@acx-ui/rc/utils'

import { DEFAULT_CANVAS, Section } from './Canvas'
import { compactLayout }           from './utils/compact'

const MENU_COLLAPSED_WIDTH = 60
const MENU_EXPANDED_WIDTH = 216
const SIDE_PADDING = 72
const WIDGET_GRID_GAP = 60
const COLUMN_COUNT = 4
export const DEFAULT_DASHBOARD_ID = 'default-dashboard-id'
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
  const canvasContent = canvasData.content !== ''
    ? canvasData.content : JSON.stringify(DEFAULT_CANVAS)

  if (canvasList?.length && canvasContent) {
    // const diffWidgetIds = [
    //   '73b6b992b2dc4521ab84c27b1cb96b40',
    //   'feda21d9d4bd4c398fed43fcda6a3c1d'
    // ]

    const canvasId = canvasData.id
    let data = JSON.parse(canvasContent) as Section[]
    data = data.map(section => ({
      ...section,
      groups: section.groups.map(group => ({
        ...group,
        cards: compactLayout(group.cards.map(card => {
          return {
            ...card,
            updated: canvasData.diffWidgetIds.includes(card.widgetId ?? '')
          }
        }))
      }))
    }))
    const groups = data.flatMap(section => section.groups)
    return {
      canvasId, sections: data, groups
    }
  }
  return {}
}
