import { MessageDescriptor } from 'react-intl'
import { Edge, Node }        from 'reactflow'

import { ActionType } from '@acx-ui/rc/utils'

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
