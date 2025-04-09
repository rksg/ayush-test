import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import moment      from 'moment-timezone'

import { get }                                       from '@acx-ui/config'
import { useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { intentAIApi, intentAIUrl, Provider, store } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockIntentContext, mockVenueList } from '../../__tests__/fixtures'
import { Statuses }                         from '../../states'
import { IntentDetail }                     from '../../useIntentDetailsQuery'
import { mocked, mockedKPIs }               from '../__tests__/mockedEquiFlex'
import { kpis }                             from '../common'

import { IntentAIForm } from '.'

const { click, selectOptions } = userEvent

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children, maxTagCount, showArrow,
    showSearch, maxTagPlaceholder, menuItemSelectedIcon,dropdownClassName, value, mode,
    ...props
  }: React.PropsWithChildren<{
    onChange?: (value: string) => void,
    maxTagCount?: number,
    showArrow?: boolean,
    showSearch?: boolean,
    maxTagPlaceholder?: React.ReactNode,
    menuItemSelectedIcon?: React.ReactNode,
    dropdownClassName?: string,
    value?: string | string[],
    mode?: 'multiple'
  }>) => (
    <select
      value={value}
      multiple={mode === 'multiple'}
      {...props}
      onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))

jest.mock('../common/ScheduleTiming', () => ({
  ...jest.requireActual('../common/ScheduleTiming'),
  validateScheduleTiming: jest.fn().mockResolvedValue(true)
}))

jest.mock('../IntentContext')
const mockGet = get as jest.Mock
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
jest.mock('@acx-ui/rc/services', () => ({
  useVenueRadioActiveNetworksQuery: jest.fn().mockReturnValue({ data: [{
    id: 'i4',
    name: 'n4',
    ssid: 's4'
  }, {
    id: 'i5',
    name: 'n5',
    ssid: 's5'
  }, {
    id: 'i6',
    name: 'n6',
    ssid: 's6'
  }] }),
  useVenueWifiRadioActiveNetworksQuery: jest.fn().mockReturnValue({ data: [{
    id: 'i7',
    name: 'n7',
    ssid: 's7'
  }]
  }),
  useEnhanceVenueTableQuery: jest.fn().mockReturnValue({ data: mockVenueList }),
  useVenuesTableQuery: jest.fn().mockReturnValue({ data: mockVenueList })
}))
beforeEach(() => {
  store.dispatch(intentAIApi.util.resetApiState())
  moment.tz.setDefault('Asia/Singapore')
  const now = +new Date('2024-08-08T12:00:00.000Z')
  jest.spyOn(Date, 'now').mockReturnValue(now)
  mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
    data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
  })
  mockGraphqlQuery(intentAIUrl, 'Wlans', {
    data: {
      intent: {
        wlans: [
          {
            name: 'DENSITY-GUEST',
            ssid: 'DENSITY-GUEST'
          },
          {
            name: 'DENSITY',
            ssid: 'DENSITY'
          }
        ]
      }
    }
  })
  mockGraphqlQuery(intentAIUrl, 'IntentKPIs', { data: { intent: mockedKPIs } })
})

const mockIntentContextWith = (data: Partial<IntentDetail> = {}) => {
  const intent = { ...mocked, ...data }
  mockIntentContext({ intent, kpis })
  return {
    params: { code: mocked.code, root: mocked.root, sliceId: mocked.sliceId }
  }
}

describe('IntentAIForm', () => {
  describe('IntentAI Actions', () => {
    afterEach((done) => {
      jest.clearAllMocks()
      jest.restoreAllMocks()
      const toast = screen.queryAllByRole('img', { name: 'close' })
      toast.forEach((t) => {
        if (t) {
          waitForElementToBeRemoved(toast).then(done)
          message.destroy()
        } else {
          done()
        }
      })
    })

    it('handle schedule intent for RAI', async () => {
      mockGet.mockReturnValue(true) // RAI
      const { params } = mockIntentContextWith({ status: Statuses.new })
      render(<IntentAIForm />, { route: { params }, wrapper: Provider })
      const form = within(await screen.findByTestId('steps-form'))
      const actions = within(form.getByTestId('steps-form-actions'))

      expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
      expect(
        (await screen.findAllByText('Time to Connect vs Client Density for 5 GHz')).length
      ).toEqual(1)
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
      expect(await screen.findByText('Potential trade-off')).toBeVisible()
      const radioEnabled = screen.getByRole('radio', {
        name: 'Reduce Management traffic in dense network'
      })
      await click(radioEnabled)
      expect(radioEnabled).toBeChecked()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-09' }))
      expect(date).toHaveValue('08/09/2024')
      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:30 (UTC+08)')
      expect(time).toHaveValue('12.5')
      await selectOptions(
        await screen.findByPlaceholderText('Select Networks'),
        'DENSITY'
      )
      await click(actions.getByRole('button', { name: 'Next' }))

      expect((await screen.findAllByText('Summary')).length).toEqual(2)
      expect(await screen.findByText('Average management traffic per client')).toBeVisible()
      expect(await screen.findByText('2 networks selected')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText(/has been updated/)).toBeVisible()
      await click(await screen.findByText(/View/))
      expect(mockNavigate).toBeCalled()
    })

    it('handle schedule intent for R1', async () => {
      mockGet.mockReturnValue(false) // R1
      const { params } = mockIntentContextWith({ status: Statuses.new })
      render(<IntentAIForm />, { route: { params }, wrapper: Provider })
      const form = within(await screen.findByTestId('steps-form'))
      const actions = within(form.getByTestId('steps-form-actions'))

      expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
      expect(await screen.findByText('Potential trade-off')).toBeVisible()
      const radio = screen.getByRole(
        'radio',
        { name: 'Reduce Management traffic in dense network' }
      )
      await click(radio)
      expect(radio).toBeChecked()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-09' }))
      expect(date).toHaveValue('08/09/2024')
      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:30 (UTC+08)')
      expect(time).toHaveValue('12.5')
      await selectOptions(
        await screen.findByPlaceholderText('Select Networks'),
        'n4'
      )
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()
      expect(await screen.findByText('1 network selected')).toBeVisible()
      expect(await screen.findByText('1 venue')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText(/has been updated/)).toBeVisible()
      await click(await screen.findByText(/View/))
      expect(mockNavigate).toBeCalled()
    })

    it('handle pause intent', async () => {
      mockGet.mockReturnValue(false) // R1
      const { params } = mockIntentContextWith({ status: Statuses.new })
      render(<IntentAIForm />, { route: { params }, wrapper: Provider })
      const form = within(await screen.findByTestId('steps-form'))
      const actions = within(form.getByTestId('steps-form-actions'))

      expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
      expect(await screen.findByText('Potential trade-off')).toBeVisible()
      const radio = screen.getByRole(
        'radio',
        { name: 'Standard Management traffic in a sparse network' }
      )
      await click(radio)
      expect(radio).toBeChecked()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
      expect(await screen.findByPlaceholderText('Select date')).toBeDisabled()
      expect(await screen.findByPlaceholderText('Select time')).toBeDisabled()
      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Summary' })).toBeVisible()

      // eslint-disable-next-line max-len
      expect(await screen.findByText(/IntentAI will maintain the existing network configuration and will cease automated monitoring of configuration for handling probe request\/response in the network./)).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText(/has been updated/)).toBeVisible()
      await click(await screen.findByText(/View/))
      expect(mockNavigate).toBeCalled()
    })

    it('should use all wlans when no saved wlans', async () => {
      mockGet.mockReturnValue(true) // RAI
      const data = { ...mocked, metadata: { wlans: [] } } as IntentDetail
      const { params } = mockIntentContextWith(data)
      render(<IntentAIForm />, { route: { params }, wrapper: Provider })
      const form = within(await screen.findByTestId('steps-form'))
      const actions = within(form.getByTestId('steps-form-actions'))

      await click(actions.getByRole('button', { name: 'Next' }))

      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-09' }))
      expect(date).toHaveValue('08/09/2024')
      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:30 (UTC+08)')
      expect(time).toHaveValue('12.5')
      await click(actions.getByRole('button', { name: 'Next' }))

      expect((await screen.findAllByText('Summary')).length).toEqual(2)
      expect(await screen.findByText('2 networks selected')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText(/has been updated/)).toBeVisible()
      await click(await screen.findByText(/View/))
      expect(mockNavigate).toBeCalled()
    })

    it('should use all wlans when no saved wlans with FF', async () => {
      mockGet.mockReturnValue(true) // RAI
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      const data = { ...mocked, metadata: { wlans: [] } } as IntentDetail
      const { params } = mockIntentContextWith(data)
      render(<IntentAIForm />, { route: { params }, wrapper: Provider })
      const form = within(await screen.findByTestId('steps-form'))
      const actions = within(form.getByTestId('steps-form-actions'))

      await click(actions.getByRole('button', { name: 'Next' }))

      await click(actions.getByRole('button', { name: 'Next' }))

      expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
      await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
      const date = await screen.findByPlaceholderText('Select date')
      await click(date)
      await click(await screen.findByRole('cell', { name: '2024-08-09' }))
      expect(date).toHaveValue('08/09/2024')
      const time = await screen.findByPlaceholderText('Select time')
      await selectOptions(time, '12:30 (UTC+08)')
      expect(time).toHaveValue('12.5')
      await click(actions.getByRole('button', { name: 'Next' }))

      expect((await screen.findAllByText('Summary')).length).toEqual(2)
      expect(await screen.findByText('2 networks selected')).toBeVisible()
      await click(actions.getByRole('button', { name: 'Apply' }))

      expect(await screen.findByText(/has been updated/)).toBeVisible()
      await click(await screen.findByText(/View/))
      expect(mockNavigate).toBeCalled()
    })
  })

  it('should validate when no wlans', async () => {
    mockGet.mockReturnValue(true) // RAI
    const data = { ...mocked, metadata: {} } as IntentDetail
    mockGraphqlQuery(intentAIUrl, 'Wlans', {
      data: {
        intent: {
          wlans: []
        }
      }
    })

    const { params } = mockIntentContextWith(data)
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    await click(actions.getByRole('button', { name: 'Next' }))

    await click(actions.getByRole('button', { name: 'Next' }))

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeVisible()
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const date = await screen.findByPlaceholderText('Select date')
    await click(date)
    await click(await screen.findByRole('cell', { name: '2024-08-09' }))
    expect(date).toHaveValue('08/09/2024')
    const time = await screen.findByPlaceholderText('Select time')
    await selectOptions(time, '12:30 (UTC+08)')
    expect(time).toHaveValue('12.5')
    await click(actions.getByRole('button', { name: 'Next' }))

    expect((await screen.findAllByText('Summary')).length).toEqual(2)
    expect(await screen.findByText('0 networks selected')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/Please select at least one network in Settings/)).toBeVisible()
  })

  it('handle cancel button', async () => {
    mockGet.mockReturnValue(true) // RAI

    const { params } = mockIntentContextWith({ status: Statuses.new })
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await screen.findByRole('heading', { name: 'Introduction' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await screen.findByRole('heading', { name: 'Intent Priority' })).toBeVisible()
    await click(actions.getByRole('button', { name: 'Cancel' }))
    expect(mockNavigate).toBeCalled()
  })
})
