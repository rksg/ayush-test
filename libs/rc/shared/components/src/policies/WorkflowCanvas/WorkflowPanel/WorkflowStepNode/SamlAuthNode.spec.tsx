import { ReactNode } from 'react'


import { NodeProps } from 'reactflow'

import { WorkflowStep }   from '@acx-ui/rc/utils'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { SamlAuthNode } from './SamlAuthNode'


jest.mock('./BaseStepNode', () => (props:{ children: ReactNode }) => (
  <div data-testid={'mockedBaseStepNode'}>
    {props.children}
  </div>
))

describe('SamlAuthNode', () => {
  it('render `SamlAuthNode` correctly', () => {
    render(<Provider><SamlAuthNode {...{
      data: {} as WorkflowStep
    } as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('SamlAuthActionTypeIcon')).toBeVisible()
  })
})
