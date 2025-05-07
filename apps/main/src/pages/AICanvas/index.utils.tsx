import { defineMessage } from 'react-intl'

import { Canvas } from '@acx-ui/rc/utils'

import { Group, Section, DEFAULT_CANVAS } from './Canvas'
import { compactLayout }                  from './utils/compact'

const MENU_COLLAPSED_WIDTH = 60
const MENU_EXPANDED_WIDTH = 216
const SIDE_PADDING = 72
const WIDGET_GRID_GAP = 60
const COLUMN_COUNT = 4
export const MAX_POLLING_TIMES = 100 //temp
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
        cards: compactLayout(group.cards)
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

/* eslint-disable max-len */
export const StreamingMessages = {
  INITIALIZING_INTENT: defineMessage({ defaultMessage: 'Running your question through my knowledge systems' }),
  SELECTING_DATA_SOURCES: defineMessage({ defaultMessage: 'Resolving intent and selecting appropriate data sources' }),
  PROCESSING_DATA_INITIAL: defineMessage({ defaultMessage: 'Working through the data now - almost there!' }),
  PROCESSING_DATA_RETRY_1_1: defineMessage({ defaultMessage: 'Still navigating the database schema jungle - hang tight!' }),
  PROCESSING_DATA_RETRY_2_1: defineMessage({ defaultMessage: 'Still fine-tuning the query to match your question' }),
  PROCESSING_DATA_RETRY_3_1: defineMessage({ defaultMessage: 'Query is being a bit tricky - running another pass' }),
  PROCESSING_DATA_RETRY_1_2: defineMessage({ defaultMessage: 'Scanning a bit deeper for the right data source - almost there!' }),
  PROCESSING_DATA_RETRY_2_2: defineMessage({ defaultMessage: 'Taking another swing, hand tight' }),
  PROCESSING_DATA_RETRY_3_2: defineMessage({ defaultMessage: 'Digging deeper to extract the data—thanks for your patience!' }),
  FINALIZING_RESULT: defineMessage({ defaultMessage: 'Here it goes - just getting the final piece ready!' })
}
/* eslint-enable max-len */

export const getStreamingWordingKey = (step: string): keyof typeof StreamingMessages => {
  const [stepNumber, retryNumber] = step.split('.').map(Number)
  if (retryNumber) {
    const step = stepNumber > 3 ? 3 : stepNumber
    const retries = retryNumber !== 1 ? 2 : 1
    return (`PROCESSING_DATA_RETRY_${step}_${retries}`) as keyof typeof StreamingMessages
  } else {
    switch (stepNumber) {
      case 0:
      case 1:
        return 'INITIALIZING_INTENT'
      case 2:
        return 'SELECTING_DATA_SOURCES'
      case 3:
        return 'PROCESSING_DATA_INITIAL'
      case 4:
      case 5:
        return 'FINALIZING_RESULT'
      default:
        return 'INITIALIZING_INTENT'
    }
  }
}
