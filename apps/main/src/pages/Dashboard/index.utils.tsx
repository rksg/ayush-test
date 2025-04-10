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
  menuCollapsed?: boolean, width?: number, ignoreMenuWidth?: boolean
) => {
  const clientWidth = width ?? document.documentElement.clientWidth
  const menuWidth = menuCollapsed ? MENU_COLLAPSED_WIDTH : MENU_EXPANDED_WIDTH
  const viewWidth = ignoreMenuWidth ? clientWidth : clientWidth - menuWidth
  return (viewWidth - SIDE_PADDING - WIDGET_GRID_GAP) / COLUMN_COUNT
}
