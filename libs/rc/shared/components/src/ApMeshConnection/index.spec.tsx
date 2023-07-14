import {
  render
} from '@acx-ui/test-utils'

import {
  mockedApMeshLink
} from './__tests__/fixtures'

import ApMeshConnection from '.'

describe('ApMeshConnection', () => {
  it('should render Mesh connection line', async () => {

    const { asFragment } = render(<ApMeshConnection linkInfo={mockedApMeshLink} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
