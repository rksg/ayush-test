import { ReactNode } from 'react'

import { NodeProps } from 'reactflow'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { DisplayMessageNode } from './DisplayMessageNode'

jest.mock('./BaseStepNode', () => (props:{ children: ReactNode }) => (
  <div data-testid={'mockedBaseStepNode'}>
    {props.children}
  </div>
))


describe('DisplayMessageNode', () => {
  it('render `DisplayMessageNode` correctly', () => {
    render(<Provider><DisplayMessageNode {...{} as NodeProps}/></Provider>)

    expect(screen.getByTestId('mockedBaseStepNode')).toBeVisible()
    expect(screen.getByTestId('DisplayMessageActionTypeIcon')).toBeVisible()
  })
})