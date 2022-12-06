import { cleanup, render } from '@acx-ui/test-utils'

import NoData from '.'

describe('SearchResults - NoData', () => {

  afterEach(() => cleanup())

  it ('should render correctly for snapshot test', async () => {
    const { asFragment } = render(<NoData />, { route: { params: { tenantId: '1234' } } })
    expect(asFragment()).toMatchSnapshot()
  })
})