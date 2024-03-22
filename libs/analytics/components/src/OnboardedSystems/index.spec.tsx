import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import { Map }     from 'immutable'
import { get }     from 'lodash'
import { rest }    from 'msw'

import { Tenant, UserProfile, setUserProfile }                                              from '@acx-ui/analytics/utils'
import { Provider, smartZoneURL }                                                           from '@acx-ui/store'
import { screen, render, mockServer, waitForElementToBeRemoved, mockRestApiQuery, waitFor } from '@acx-ui/test-utils'

import { mockSmartZoneList } from './__tests__/fixtures'
import { OnboardedSystem }   from './services'

import { OnboardedSystems, TooltipContent, formatSmartZone, FormattedOnboardedSystem } from '.'

const tenants = [
  { id: 'id1', name: 'account1' }, { id: 'id2', name: 'account2' }
] as unknown as Tenant[]

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
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
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
  it('should handle delete submit', async () => {
    mockRestApiQuery(
      `${smartZoneURL}/smartzones/${mockSmartZoneList[2].device_id}/delete`,
      'delete',
      { status: 204 }
    )
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[1])
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Delete "sz3"?')).toBeVisible()
    expect(await screen.findByText(
      'Historical data for this system will not be viewable anymore if you confirm.')).toBeVisible()

    await userEvent.click(await screen.findByRole('button', { name: /OK/ }))

    await waitFor(async () => expect(await screen.findByText('Delete "sz3"?')).not.toBeVisible())
  })
  it('should handle delete cancel', async () => {
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
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
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
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
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
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
    render(<Provider><OnboardedSystems /></Provider>, { route: {} })
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
})

describe('formatSmartZone', () => {
  it('should generate correct formatted data', () => {
    const tenantsMap = Map(tenants.map(t => [get(t, 'id'), t]))
    expect(formatSmartZone(
      mockSmartZoneList as OnboardedSystem[], tenants[0].id, tenantsMap)).toMatchSnapshot()
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
