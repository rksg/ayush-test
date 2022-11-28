import '@testing-library/jest-dom'

import { Provider }                           from '@acx-ui/store'
import { render, screen, waitFor, fireEvent } from '@acx-ui/test-utils'

import MacRegistrationListTabs from './MacRegistrationListTabs'

const mockedUsedNavigate = jest.fn()
const params = { macRegistrationListId: 'macRegistrationList-id', tenantId: 'tenant-id' }

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('MacRegistrationListTab', () =>{

  it('should render correctly', async () => {
    // eslint-disable-next-line max-len
    const { asFragment } = render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    expect(asFragment()).toMatchSnapshot()
    await screen.findByText('Overview')
    await screen.findByText('MAC Registrations')
  })

  it('should handle tab changes', async () => {
    render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    await waitFor(() => screen.findByText('MAC Registrations'))
    fireEvent.click(await screen.findByText('MAC Registrations'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/t/${params.tenantId}/policies/mac-registration-lists/${params.macRegistrationListId}/mac-registration-lists-details/mac_registrations`,
      hash: '',
      search: ''
    })
  })

})
