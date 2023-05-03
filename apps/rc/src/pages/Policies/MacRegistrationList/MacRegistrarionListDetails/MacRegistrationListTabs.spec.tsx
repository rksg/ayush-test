import '@testing-library/jest-dom'

import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import MacRegistrationListTabs from './MacRegistrationListTabs'

const mockedUsedNavigate = jest.fn()
const params = { policyId: 'macRegistrationList-id', tenantId: 'tenant-id' }

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

describe('MacRegistrationListTab', () =>{

  it('should render correctly', async () => {
    // eslint-disable-next-line max-len
    render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    await screen.findByText('Overview')
    await screen.findByText('MAC Registrations')
  })

  it('should handle tab changes', async () => {
    render(<Provider><MacRegistrationListTabs /></Provider>, { route: { params } })
    fireEvent.click(await screen.findByText('MAC Registrations'))
    expect(mockedUsedNavigate).toHaveBeenCalledWith({
      // eslint-disable-next-line max-len
      pathname: `/${params.tenantId}/t/policies/macRegistrationList/${params.policyId}/detail/macRegistrations`,
      hash: '',
      search: ''
    })
  })

})
