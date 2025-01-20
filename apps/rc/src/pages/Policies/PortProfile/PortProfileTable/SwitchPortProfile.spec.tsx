import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Path }                      from '@acx-ui/react-router-dom'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import SwitchPortProfile from './SwitchPortProfile'

const mockedUseNavigate = jest.fn()

const mockedTenantPath: Path = {
  pathname: '/t/tenant-id',
  search: '',
  hash: ''
}

jest.mock('./SwitchPortProfileTable', () => ({
  __esModule: true,
  default: () => <div data-testid='profiles-table'>Profiles Table</div>
}))

jest.mock('./MacOuiTable', () => ({
  __esModule: true,
  default: () => <div data-testid='macoui-table'>MAC OUI Table</div>
}))

jest.mock('./LldpTlvTable', () => ({
  __esModule: true,
  default: () => <div data-testid='lldptlv-table'>LLDP TLV Table</div>
}))

jest.mock('@acx-ui/react-router-dom', () => ({
  useNavigate: () => mockedUseNavigate,
  useTenantLink: () => mockedTenantPath,
  useParams: () => ({
    activeSubTab: 'profiles'
  })
}))

describe('SwitchPortProfile', () => {
  beforeEach(() => {
    mockedUseNavigate.mockClear()
  })

  it('should render all tabs correctly', () => {
    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    expect(screen.getByRole('tab', { name: 'Profiles' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'MAC OUI' })).toBeVisible()
    expect(screen.getByRole('tab', { name: 'LLDP TLV' })).toBeVisible()
  })

  it('should render profiles tab content by default', () => {
    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    expect(screen.getByTestId('profiles-table')).toBeVisible()
  })

  it('should handle navigation when switching to MAC OUI tab', async () => {
    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    await userEvent.click(await screen.findByRole('tab', { name: 'MAC OUI' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/t/tenant-id/macoui',
      search: '',
      hash: ''
    })
  })

  it('should handle navigation when switching to LLDP TLV tab', async () => {
    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    fireEvent.click(screen.getByRole('tab', { name: 'LLDP TLV' }))

    expect(mockedUseNavigate).toHaveBeenCalledWith({
      pathname: '/t/tenant-id/lldptlv',
      search: '',
      hash: ''
    })
  })

  it('should render MAC OUI content when activeSubTab is macoui', () => {
    jest.spyOn(require('@acx-ui/react-router-dom'), 'useParams').mockReturnValue({
      activeSubTab: 'macoui'
    })

    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    expect(screen.getByTestId('macoui-table')).toBeVisible()
  })

  it('should render LLDP TLV content when activeSubTab is lldptlv', () => {
    jest.spyOn(require('@acx-ui/react-router-dom'), 'useParams').mockReturnValue({
      activeSubTab: 'lldptlv'
    })

    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    expect(screen.getByTestId('lldptlv-table')).toBeVisible()
  })

  it('should not render tab content for invalid activeSubTab', () => {
    jest.spyOn(require('@acx-ui/react-router-dom'), 'useParams').mockReturnValue({
      activeSubTab: 'invalid'
    })

    render(
      <Provider>
        <SwitchPortProfile />
      </Provider>
    )

    expect(screen.queryByTestId('profiles-table')).not.toBeInTheDocument()
    expect(screen.queryByTestId('macoui-table')).not.toBeInTheDocument()
    expect(screen.queryByTestId('lldptlv-table')).not.toBeInTheDocument()
  })
})