import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { rest }    from 'msw'

import { UserProfile, setUserProfile }                                                      from '@acx-ui/analytics/utils'
import { Provider, smartZoneURL }                                                           from '@acx-ui/store'
import { screen, render, mockServer, waitForElementToBeRemoved, mockRestApiQuery, waitFor } from '@acx-ui/test-utils'

import { mockSmartZoneList, tenants } from './__tests__/fixtures'
import { FormattedOnboardedSystem }   from './services'

import { useOnboardedSystems, TooltipContent } from '.'

const services = require('./services')
jest.mock('./services', () => ({
  ...jest.requireActual('./services')
}))

describe('OnboardedSystems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setUserProfile({ accountId: tenants[0].id, tenants } as UserProfile)
    mockServer.use(
      rest.get(`${smartZoneURL}/smartzones`,
        (_req, res, ctx) => res(ctx.json(mockSmartZoneList)))
    )
  })
  afterEach((done) => {
    const toast = screen.queryByTestId('toast-content')
    if (toast) {
      waitForElementToBeRemoved(toast).then(done)
      message.destroy()
    } else {
      done()
    }
  })
  it('should render correctly', async () => {
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findAllByText('Status')).toHaveLength(2)
    expect(await screen.findByPlaceholderText('Search Account, Name')).toBeVisible()
    expect(await screen.findByText('Account')).toBeVisible()
    expect(await screen.findByText('Name')).toBeVisible()
    expect(await screen.findByText('Added Time')).toBeVisible()

    expect(await screen.findByText('Onboarded')).toBeVisible()
    expect(await screen.findAllByText('account1')).toHaveLength(10)
    expect(await screen.findByText('sz1')).toBeVisible()
    expect(await screen.findAllByText('02/16/2019 05:32')).toHaveLength(10)
  })
  it('should sort by selected account', async () => {
    setUserProfile({ accountId: tenants[1].id, tenants } as UserProfile)
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findAllByText('account2')).toHaveLength(2)
  })
  it('should handle delete submit', async () => {
    mockRestApiQuery(
      `${smartZoneURL}/smartzones/${mockSmartZoneList[2].device_id}/delete`,
      'delete',
      { status: 204 }
    )
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Delete "sz3"?')).toBeVisible()
    expect(await screen.findByText(
      'Historical data for this system will not be viewable anymore if you confirm.')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /OK/ }))

    await waitFor(async () => expect(await screen.findByText('Delete "sz3"?')).not.toBeVisible())
    expect(await screen.findByTestId('toast-content')).toHaveTextContent('sz3 was deleted')
  })
  it('should handle delete cancel', async () => {
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Delete "sz3"?')).toBeVisible()
    expect(await screen.findByText(
      'Historical data for this system will not be viewable anymore if you confirm.')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /Cancel/ }))

    await waitFor(async () => expect(await screen.findByText('Delete "sz3"?')).not.toBeVisible())
  })
  it('should disable delete', async () => {
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
  it('should handle delete fail with error', async () => {
    mockRestApiQuery(
      `${smartZoneURL}/smartzones/${mockSmartZoneList[2].device_id}/delete`,
      'delete',
      { error: 'CANNOT_DELETE' }
    )
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Delete "sz3"?')).toBeVisible()
    expect(await screen.findByText(
      'Historical data for this system will not be viewable anymore if you confirm.')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /OK/ }))

    await waitFor(async () => expect(await screen.findByText('Delete "sz3"?')).not.toBeVisible())

    expect(await screen.findByTestId('toast-content'))
      .toHaveTextContent('Failed to delete sz3: Offboard this system to enable deletion')
  })
  it('should handle other delete fail', async () => {
    mockRestApiQuery(
      `${smartZoneURL}/smartzones/${mockSmartZoneList[2].device_id}/delete`,
      'delete',
      { error: 'UNKNOWN' }
    )
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Delete "sz3"?')).toBeVisible()
    expect(await screen.findByText(
      'Historical data for this system will not be viewable anymore if you confirm.')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /OK/ }))

    await waitFor(async () => expect(await screen.findByText('Delete "sz3"?')).not.toBeVisible())

    expect(await screen.findByTestId('toast-content'))
      .toHaveTextContent('Failed to delete sz3')
  })
  it('should query only Roles.PRIME_ADMINISTRATOR tenants', () => {
    setUserProfile({ accountId: tenants[0].id, tenants: [
      ...tenants,
      { id: 'id3', name: 'account3', permissions: { READ_ONBOARDED_SYSTEMS: false } }
    ] } as UserProfile)
    jest.spyOn(services, 'useFetchSmartZoneListQuery')
    const Component = () => {
      const { component } = useOnboardedSystems()
      return component
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(services.useFetchSmartZoneListQuery).toBeCalledWith({ tenantId: 'id1', tenants })
  })
})

describe('TooltipContent', () => {
  it('should render correctly for status', () => {
    const mockData = {
      errors: [],
      status: 'onboarded'
    }
    const TestComponent = TooltipContent(mockData as unknown as FormattedOnboardedSystem)
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
  it('should render correctly for error', () => {
    const mockData = {
      errors: [
        // eslint-disable-next-line max-len
        'License API: Operation is not allowed because cluster is in read only state. (status code: 503)',
        'Access control API: Invalid cluster id. (status code: 400)'
      ],
      status: 'Onboarding: Update tenant association'
    }
    const TestComponent = TooltipContent(mockData as unknown as FormattedOnboardedSystem)
    const { asFragment } = render(<TestComponent />)
    expect(asFragment()).toMatchSnapshot()
  })
})
