import { MessageDescriptor } from 'react-intl'
import { Edge, Node }        from 'reactflow'

import { ActionType, WorkflowActionDefinition, WorkflowStep } from '@acx-ui/rc/utils'
import { NewAPITableResult } from '@acx-ui/utils'

// To make sure that the tests are working, it's important that you are using
// this implementation of ResizeObserver and DOMMatrixReadOnly
class ResizeObserver {
  callback: globalThis.ResizeObserverCallback

  constructor (callback: globalThis.ResizeObserverCallback) {
    this.callback = callback
  }

  observe (target: Element) {
    this.callback([{ target } as globalThis.ResizeObserverEntry], this)
  }

  unobserve () {}

  disconnect () {}
}

class DOMMatrixReadOnly {
  m22: number
  constructor (transform: string) {
    const scale = transform?.match(/scale\(([1-9.])\)/)?.[1]
    this.m22 = scale !== undefined ? +scale : 1
  }
}

// Only run the shim once when requested
let init = false

export const setupLocalReactFlow = () => {
  if (init) return
  init = true

  global.ResizeObserver = ResizeObserver

  // @ts-ignore
  global.DOMMatrixReadOnly = DOMMatrixReadOnly

  Object.defineProperties(global.HTMLElement.prototype, {
    offsetHeight: {
      get () {
        return parseFloat(this.style.height) || 1
      }
    },
    offsetWidth: {
      get () {
        return parseFloat(this.style.width) || 1
      }
    }
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (global.SVGElement as any).prototype.getBBox = () => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  })
}


export const $t = (params: MessageDescriptor) =>
  (params.defaultMessage?.[0] as { value: string }).value

export const mockInitialNodes: Node[] = [
  {
    id: 'step-1',
    position: { x: 0, y: 0 },
    type: ActionType.AUP,
    data: {}
  },
  {
    id: 'step-2',
    position: { x: 0, y: 0 },
    type: ActionType.DISPLAY_MESSAGE,
    data: {}
  }
]

export const mockInitialEdges: Edge[] = [
  {
    id: 'edge-1',
    source: mockInitialNodes[0].id,
    target: mockInitialNodes[1].id
  }
]

export const mockGetStepsByIdResult: NewAPITableResult<WorkflowStep> = {
  content: [
    {
      id: 'step-1',
      enrollmentActionId: 'step-1-action-id',
      nextStepId: 'step-2'
    },
    {
      id: 'step-2',
      enrollmentActionId: 'step-2-action-id',
      priorStepId: 'step-1'
    }
  ],
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 3
  }
}

export const mockGetActionDefinitionsResult: NewAPITableResult<WorkflowActionDefinition> = {
  content: [
    {
      id: 'd1342c9e-c379-4fe6-9a18-8eec67e34eb6',
      name: 'Display an Acceptable Use Policy (AUP)',
      localizationDescriptionId: 'aup_workflow_locale',
      isSplit: false,
      actionType: 'AUP' as ActionType,
      category: 'basic',
      dependencyType: 'NONE',
      hasEndActions: false
    },
    {
      id: 'b300d030-f415-4252-90cc-8265e5314696',
      name: 'Display a message',
      localizationDescriptionId: 'display_message_locale',
      isSplit: false,
      actionType: 'DISPLAY_MESSAGE' as ActionType,
      category: 'basic',
      dependencyType: 'NONE',
      hasEndActions: false
    },
    {
      id: '8c0168b4-5b34-4b0e-9356-d2b42cb88967',
      name: 'Generate a Ruckus DPSK',
      localizationDescriptionId: 'generate_dpsk_locale',
      isSplit: false,
      actionType: 'DPSK' as ActionType,
      category: 'onboard',
      dependencyType: 'NONE',
      hasEndActions: true
    },
    {
      id: '580584f1-a3f4-407f-b3ac-a62addea530e',
      name: 'Prompt user for information',
      localizationDescriptionId: 'data_prompt_locale',
      isSplit: false,
      actionType: 'DATA_PROMPT' as ActionType,
      category: 'basic',
      dependencyType: 'NONE',
      hasEndActions: false
    }
  ],
  paging: {
    page: 0,
    pageSize: 10,
    totalCount: 4
  }
}
