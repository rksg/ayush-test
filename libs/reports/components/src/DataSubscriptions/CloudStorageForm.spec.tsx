import { Provider }                           from '@acx-ui/store'
import { fireEvent, render, screen, waitFor } from '@acx-ui/test-utils'

import CloudStorageForm from './CloudStorageForm'

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))

describe('CloudStorageForm', () => {
  it('(RAI) should render New CloudStorageForm correct', async () => {
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
  })
  it('(RAI) should render Edit CloudStorageForm correct', async () => {
    render(<CloudStorageForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage: azure')).toBeVisible()
  })
  it('should log for fields on apply click', async () => {
    const spyLog = jest.spyOn(console, 'log')
    render(<CloudStorageForm editMode/>, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('Cloud Storage: azure')).toBeVisible()
    const applyBtn = await screen.findByRole('button', { name: 'Save' })
    expect(applyBtn).toBeVisible()
    fireEvent.click(applyBtn)
    await waitFor(() => {
      expect(spyLog).toBeCalledWith({
        connectionType: 'azure',
        azureConnectionType: 'Azure Files',
        azureAccountName: 'some name',
        azureAccountKey: 'key',
        azureShareName: 'share name',
        azureCustomerName: 'name'
      })
    })
  })
  it('should navigate to previous route on cancel click', async () => {
    render(<CloudStorageForm />, {
      route: {},
      wrapper: Provider
    })
    expect(await screen.findByText('New Cloud Storage')).toBeVisible()
    const CancelBtn = await screen.findByRole('button', { name: 'Cancel' })
    expect(CancelBtn).toBeVisible()
    fireEvent.click(CancelBtn)
    await waitFor(() => {
      expect(mockNavigate).toBeCalledWith(-1)
    })
  })
})