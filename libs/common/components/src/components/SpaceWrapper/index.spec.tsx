import { render } from '@acx-ui/test-utils'

import { SpaceWrapper } from '.'

describe('SpaceWrapper', () => {
  it('Should render SpaceWrapper successfully', async () => {
    const { asFragment } = render(
      <SpaceWrapper>
        <div>Child 1</div>
        <div>Child 2</div>
      </SpaceWrapper>
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
