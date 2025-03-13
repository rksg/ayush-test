/* eslint-disable max-len */
import userEvent   from '@testing-library/user-event'
import { message } from 'antd'
import moment      from 'moment-timezone'

import { get }                                                                                      from '@acx-ui/config'
import { Provider, intentAIUrl, store, intentAIApi }                                                from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, waitForElementToBeRemoved, within } from '@acx-ui/test-utils'

import { mockIntentContext }                                        from '../../__tests__/fixtures'
import { mockedCRRMGraphs, mockedIntentCRRM, mockedIntentCRRMKPIs } from '../__tests__/fixtures'
import { kpis }                                                     from '../common'

import { IntentAIForm } from '.'

class ResizeObserver {
  observe () {}
  unobserve () {}
  disconnect () {}
}

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children, ...props
  }: React.PropsWithChildren<{ onChange?: (value: string) => void }>) => {
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})
jest.mock('@acx-ui/config')
const mockNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockNavigate
}))
jest.mock('../../IntentContext')
jest.mock('../../common/ScheduleTiming', () => ({
  ...jest.requireActual('../../common/ScheduleTiming'),
  validateScheduleTiming: jest.fn().mockResolvedValue(true)
}))

const { click, selectOptions } = userEvent

describe('IntentAIForm', () => {
  window.ResizeObserver = ResizeObserver

  beforeEach(() => {
    store.dispatch(intentAIApi.util.resetApiState())

    moment.tz.setDefault('Asia/Singapore')
    const now = +new Date('2024-08-08T12:00:00.000Z')
    jest.spyOn(Date, 'now').mockReturnValue(now)

    global.URL.createObjectURL = jest.fn().mockReturnValue('blob:csv-url')
    global.URL.revokeObjectURL = jest.fn()

    mockGraphqlQuery(intentAIUrl, 'IntentAIRRMGraph', {
      data: { intent: mockedCRRMGraphs }
    })
    mockGraphqlMutation(intentAIUrl, 'IntentTransition', {
      data: { transition: { success: true, errorMsg: '' , errorCode: '' } }
    })
    mockGraphqlQuery(intentAIUrl, 'IntentKPIs', { data: { intent: mockedIntentCRRMKPIs } })

    mockIntentContext({ intent: mockedIntentCRRM, kpis })
  })

  afterEach((done) => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    const toast = screen.queryByRole('img', { name: 'close' })
    if (toast) {
      waitForElementToBeRemoved(toast).then(done)
      message.destroy()
    } else {
      done()
    }
  })

  async function renderAndStepsThruForm () {
    const params = {
      root: '33707ef3-b8c7-4e70-ab76-8e551343acb4',
      sliceId: '4e3f1fbc-63dd-417b-b69d-2b08ee0abc52',
      code: mockedIntentCRRM.code
    }
    render(<IntentAIForm />, { route: { params }, wrapper: Provider })
    const form = within(await screen.findByTestId('steps-form'))
    const actions = within(form.getByTestId('steps-form-actions'))

    // Step 1
    expect(await screen.findByText('Benefits')).toBeVisible()
    expect(await screen.findByText('Projection')).toBeVisible()
    await click(actions.getByRole('button', { name: 'Next' }))

    // Step 2
    await screen.findAllByRole('heading', { name: 'Intent Priority' })
    expect(await screen.findByText('Potential trade-off')).toBeVisible()
    await click(screen.getByRole('radio', {
      name: 'High client throughput in sparse network'
    }))
    await click(actions.getByRole('button', { name: 'Next' }))

    // Step 3
    await screen.findAllByRole('heading', { name: 'Settings' })
    await selectOptions(
      await screen.findByPlaceholderText('Select time'),
      '12:30 (UTC+08)'
    )
    expect(await screen.findByPlaceholderText('Select time')).toHaveValue('12.5')
    await click(actions.getByRole('button', { name: 'Next' }))

    // Step 4
    await screen.findAllByRole('heading', { name: 'Summary' })
    expect(await screen.findByText('Selected Intent Priority')).toBeVisible()

    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText(/has been updated/)).toBeVisible()
    await click(await screen.findByText('View'))
    expect(mockNavigate).toBeCalled()
  }

  it('should render correctly', () => renderAndStepsThruForm())

  it('should render correctly when IS_MLISA_SA is true', async () => {
    jest.mocked(get).mockReturnValue('true')
    await renderAndStepsThruForm()
  })
})
