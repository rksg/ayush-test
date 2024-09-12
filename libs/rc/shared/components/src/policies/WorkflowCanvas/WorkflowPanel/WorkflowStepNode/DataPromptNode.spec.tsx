import { ReactNode } from 'react'

import { NodeProps } from 'reactflow'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { DataPromptNode } from './DataPromptNode'

jest.mock('./BaseStepNode', () => (props:{ children: ReactNode }) => (
  <div data-testid={'mockedBaseStepNode'}>
    {props.children}
  </div>
))


describe('DataPromptNode', () => {
  it('render `DataPromptNode` correctly', () => {
    render(<Provider><DataPromptNode {...{} as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('DataPromptActionTypeIcon')).toBeVisible()
  })
})