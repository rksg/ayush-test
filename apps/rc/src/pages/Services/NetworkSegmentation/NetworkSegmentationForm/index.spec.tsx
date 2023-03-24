/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import {
  CommonUrlsInfo,
  NetworkSegmentationUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import {
  mockNetworkGroup, mockVenueData,
  mockVenueNetworkData
} from '../__tests__/fixtures'

import NetworkSegmentationForm from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

jest.mock('./SmartEdgeForm', () => ({
  ...jest.requireActual('./SmartEdgeForm'),
  SmartEdgeForm: () => <div data-testid='smartEdgeForm' />
}))

jest.mock('./DistributionSwitchForm', () => ({
  DistributionSwitchForm: () => <div data-testid='distributionSwitchForm' />
}))
jest.mock('./AccessSwitchForm', () => ({
  AccessSwitchForm: () => <div data-testid='accessSwitchForm' />
}))
jest.mock('./SummaryForm', () => ({
  SummaryForm: () => <div data-testid='summaryForm' />
}))


type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('NetworkSegmentation', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => res(ctx.json(mockVenueData))
      ),
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => res(ctx.status(200))
      ),
      rest.post(
        NetworkSegmentationUrls.createNetworkSegmentationGroup.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
  })

  it('should create networkSegmentation successfully', async () => {
    const user = userEvent.setup()
    render(<NetworkSegmentationForm />, {
      wrapper: Provider,
      route: { params, path: createNsgPath }
    })
    // step 1
    const serviceNameInput = await screen.findByRole('textbox', { name: 'Service Name' })
    await user.type(serviceNameInput, 'TestService')
    await screen.findByRole('combobox', { name: 'Venue with the property management enabled' })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Venue with the property management enabled' }),
      await screen.findByRole('option', { name: 'Mock Venue 1' })
    )
    expect(await screen.findByRole('table')).toBeVisible()
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 2
    await screen.findByTestId('smartEdgeForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step 3
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )
    await user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    await user.click(await screen.findByRole('button', { name: 'Next' }))

    // step 4
    await screen.findByTestId('distributionSwitchForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step5
    await screen.findByTestId('accessSwitchForm')
    await user.click(await screen.findByRole('button', { name: 'Next' }))
    // step6
    await screen.findByTestId('summaryForm')
    await user.click(await screen.findByRole('button', { name: 'Finish' }))
  }, 30000)

})
