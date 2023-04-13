import {
  render
} from '@acx-ui/test-utils'

import {
  mockedWirelessConnection
} from './__tests__/fixtures'

import MeshConnectionLine from '.'

describe('MeshConnectionLine', () => {
  it('should render Mesh connection line', async () => {

    const { asFragment } = render(<MeshConnectionLine lineInfo={mockedWirelessConnection} />)

    expect(asFragment()).toMatchSnapshot()
  })
})
