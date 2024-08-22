import { ReactNode } from 'react'


import { NodeProps } from 'reactflow'

import { WorkflowStep }   from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { AupNode } from './AupNode'


jest.mock('./BaseStepNode', () => (props:{ children: ReactNode }) => (
  <div data-testid={'mockedBaseStepNode'}>
    {props.children}
  </div>
))

describe('AupNode', () => {
  it('render `AupNode` correctly', () => {
    render(<Provider><AupNode {...{
      data: {} as WorkflowStep
    } as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('AupActionTypeIcon')).toBeVisible()
  })
})