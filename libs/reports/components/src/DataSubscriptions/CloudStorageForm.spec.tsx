import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import CloudStorageForm from './CloudStorageForm'
describe('CloudStorageForm', () => {
  it('(RAI) should render New CloudStorageForm correct', async () => {
    render(<CloudStorageForm isRAI/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
  })
  it('(RAI) should render Edit CloudStorageForm correct', async () => {
    render(<CloudStorageForm isRAI editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage: azure')).toBeVisible()
  })
})