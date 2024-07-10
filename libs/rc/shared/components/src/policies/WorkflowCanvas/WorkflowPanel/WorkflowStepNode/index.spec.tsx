import { ReactNode } from 'react'

import { NodeProps } from 'reactflow'

import { WorkflowStep }   from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  AupNode,
  DataPromptNode,
  DisplayMessageNode
} from './index'


jest.mock('./BaseStepNode', () => (props:{ children: ReactNode }) => (
  <div data-testid={'mockedBaseStepNode'}>
    {props.children}
  </div>
))

describe('StepNode', () => {
  it('render `AupNode` correctly', () => {
    render(<Provider><AupNode {...{
      data: {} as WorkflowStep
    } as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('AupIcon')).toBeVisible()
  })

  it('render `DataPromptNode` correctly', () => {
    render(<Provider><DataPromptNode {...{} as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('DataPromptIcon')).toBeVisible()
  })

  it('render `DisplayMessageNode` correctly', () => {
    render(<Provider><DisplayMessageNode {...{} as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('DisplayMessageIcon')).toBeVisible()
  })
})
