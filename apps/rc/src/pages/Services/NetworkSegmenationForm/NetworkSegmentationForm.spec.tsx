import { Provider } from '@acx-ui/store'
import { render }   from '@acx-ui/test-utils'

import NetworkSegmentationForm from './NetworkSegmentationForm'


describe( 'NetworkSegmentationForm', () => {
  let params: { tenantId: string }

  it( 'should create form successfully', async () => {
    const { asFragment } = render(
      <Provider>
        <NetworkSegmentationForm />
      </Provider>, { route: { params } }
    )
    expect(asFragment()).toMatchSnapshot()
  })
})
