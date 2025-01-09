import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import DataSubscriptionsCloudStorage from './DataSubscriptionsCloudStorage'
describe('DataSubscriptionsCloudStorage', () => {
  it('(RAI) should render DataSubscriptionsCloudStorage correct', async () => {
    render(<DataSubscriptionsCloudStorage isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage Edit')).toBeVisible()
  })
})