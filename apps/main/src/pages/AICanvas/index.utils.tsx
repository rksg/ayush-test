import { defineMessage } from 'react-intl'

import { Canvas } from '@acx-ui/rc/utils'

import { Group, Section, DEFAULT_CANVAS } from './Canvas'
import { compactLayout }                  from './utils/compact'

const MENU_COLLAPSED_WIDTH = 60
const MENU_EXPANDED_WIDTH = 216
const SIDE_PADDING = 72
const WIDGET_GRID_GAP = 60
const COLUMN_COUNT = 4
export const MAX_POLLING_TIMES = 20 //temp
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

enum StreamingStep {
  INITIALIZING_INTENT = 1,
  SELECTING_DATA_SOURCES = 2,
  PROCESSING_DATA_INITIAL = 3,
  PROCESSING_DATA_RETRY_1 = 3.25,
  PROCESSING_DATA_RETRY_2 = 3.5,
  FINALIZING_RESULT = 4,
  FINALIZING_RESULT_EXTENDED = 4.5
}

const streamingStepKeyMap: Record<StreamingStep, keyof typeof StreamingMessages> = {
  [StreamingStep.INITIALIZING_INTENT]: 'INITIALIZING_INTENT',
  [StreamingStep.SELECTING_DATA_SOURCES]: 'SELECTING_DATA_SOURCES',
  [StreamingStep.PROCESSING_DATA_INITIAL]: 'PROCESSING_DATA_INITIAL',
  [StreamingStep.PROCESSING_DATA_RETRY_1]: 'PROCESSING_DATA_RETRY_1',
  [StreamingStep.PROCESSING_DATA_RETRY_2]: 'PROCESSING_DATA_RETRY_2',
  [StreamingStep.FINALIZING_RESULT]: 'FINALIZING_RESULT',
  [StreamingStep.FINALIZING_RESULT_EXTENDED]: 'FINALIZING_RESULT'
}

/* eslint-disable max-len */
export const StreamingMessages = {
  INITIALIZING_INTENT: defineMessage({ defaultMessage: 'Running your question through my knowledge systems...' }),
  SELECTING_DATA_SOURCES: defineMessage({ defaultMessage: 'Resolving intent and selecting appropriate data sources.' }),
  PROCESSING_DATA_INITIAL: defineMessage({ defaultMessage: 'Working through the data now—almost there!' }),
  PROCESSING_DATA_RETRY_1: defineMessage({ defaultMessage: 'Working through the data now—just a moment!' }),
  PROCESSING_DATA_RETRY_2: defineMessage({ defaultMessage: 'Working through the data now—hang tight!' }),
  FINALIZING_RESULT: defineMessage({ defaultMessage: 'Here it goes—just getting the final piece ready!' })
}
/* eslint-enable max-len */

export const getStreamingStep = (step: string): StreamingStep => {
  if (step === '0') return StreamingStep.INITIALIZING_INTENT //temp: waiting api update
  const [stepNumber, retryNumber] = step.split('.').map(Number)
  if (retryNumber && stepNumber !== 4) {
    return retryNumber === 1
      ? StreamingStep.PROCESSING_DATA_RETRY_1
      : StreamingStep.PROCESSING_DATA_RETRY_2
  }
  return Number(step)
}

export const getStreamingWordingKey = (step?: StreamingStep): keyof typeof StreamingMessages => {
  return streamingStepKeyMap[step ?? StreamingStep.INITIALIZING_INTENT] ?? 'INITIALIZING_INTENT'
}
