import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { useIsSplitOn }   from '@acx-ui/feature-toggle'
import { networkApi }     from '@acx-ui/rc/services'
import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import {
  dataApi,
  dataApiURL,
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl,
  Provider,
  store
} from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery,
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import {
  fetchServiceGuardSpec,
  serviceGuardSpecNames,
  mockNetworkHierarchy
}                                 from '../__tests__/fixtures'
import { ServiceGuardSpecGuard } from '../ServiceGuardGuard'

import { ServiceGuardForm } from './ServiceGuardForm'

const { click, type, selectOptions } = userEvent

const mockedNavigate = jest.fn()
jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigateToPath: () => mockedNavigate
}))

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, onChange?: (value: string) => void }>) => {
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

const [wlans, networkNames] = _(Array(5))
  .map((_, i) => [
    { name: `Network ${i}`, authMethods: [] },
    { id: `n-${i}`, name: `Network ${i}`, aps: 1, venues: { count: 1 } }
  ])
  .unzip()
  .value()


const mockNetworksQuery = (data = networkNames) => mockServer.use(
  rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
    res(ctx.json({ data, totalCount: data.length }))
  )
)

const EditWrapper = (props: React.PropsWithChildren) => {
  return <Provider>
    <ServiceGuardSpecGuard {...props} />
  </Provider>
}

describe('ServiceGuardForm', () => {
  beforeEach(() => {
    mockedNavigate.mockReset()
    store.dispatch(dataApi.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
    store.dispatch(api.util.resetApiState())
    mockGraphqlQuery(dataApiURL, 'RecentNetworkHierarchy', { data: mockNetworkHierarchy })
    mockNetworksQuery()
    mockGraphqlQuery(apiUrl, 'ServiceGuardSpecNames', { data: serviceGuardSpecNames })
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })
  })

  it('should render breadcrumb', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(<ServiceGuardForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(await screen.findByText('AI Assurance')).toBeVisible()
    expect(await screen.findByText('Network Assurance')).toBeVisible()
    expect(await screen.findByText('Service Validation')).toBeVisible()
  })

  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(<ServiceGuardForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })
    expect(screen.queryByText('AI Assurance')).toBeNull()
    expect(screen.queryByText('Network Assurance')).toBeNull()
    expect(await screen.findByText('Service Validation')).toBeVisible()
  })

  it('works correctly for create flow', async () => {
    render(<ServiceGuardForm />, {
      wrapper: Provider,
      route: { params: { tenantId: 't-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()

    // Step 1
    await type(body.getByRole('textbox', { name: 'Test Name' }), 'Test 1')
    await selectOptions(await body.findByRole('combobox', { name: 'Test Type' }), 'On-Demand')
    await selectOptions(
      await body.findByRole('combobox', {
        name: (_, el) => el.id === 'configs_0_wlanName'
      }),
      'Network 1'
    )
    await selectOptions(
      await body.findByRole('combobox', {
        name: (_, el) => el.id === 'configs_0_authenticationMethod'
      }),
      await body.findByRole('option', { name: 'Pre-Shared Key (PSK)' })
    )

    // Navigate to Step 2
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'APs Selection' })).toBeVisible()
    expect(await body.findByTestId('QuestionMarkCircleOutlined')).toBeVisible()

    // Step 2
    await type(await screen.findByRole('combobox'), 'AP 4')
    await click(await screen.findByRole('menuitemcheckbox', { name: /AP 4/ }))

    // Navigate to Step 3
    await click(actions.getByRole('button', { name: 'Next' }))
    expect(await body.findByRole('heading', { name: 'Summary' })).toBeVisible()

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'CreateServiceGuardSpec', {
      data: { createServiceGuardSpec: expected }
    })

    await click(actions.getByRole('button', { name: 'Add' }))

    expect(await screen.findByText('Service Validation test created')).toBeVisible()
    expect(mockedNavigate).toBeCalled()
  })

  it('works correctly for edit flow', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fetchServiceGuardSpec })

    render(<ServiceGuardForm />, {
      wrapper: EditWrapper,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()

    // Navigate to Step 2
    await click(screen.getByRole('button', { name: 'APs Selection' }))
    expect(await body.findByRole('heading', { name: 'APs Selection' })).toBeVisible()
    expect(body.queryByTestId('QuestionMarkCircleOutlined')).toBeNull()

    const expected = { spec: { id: 'spec-id' }, userErrors: null }
    mockGraphqlMutation(apiUrl, 'UpdateServiceGuardSpec', {
      data: { updateServiceGuardSpec: expected }
    })

    // Submit
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('Service Validation test updated')).toBeVisible()
    expect(mockedNavigate).toBeCalled()
  })

  it('show error in toast', async () => {
    mockGraphqlQuery(apiUrl, 'FetchServiceGuardSpec', { data: fetchServiceGuardSpec })

    render(<ServiceGuardForm />, {
      wrapper: EditWrapper,
      route: { params: { tenantId: 't-id', specId: 'spec-id' } }
    })

    const form = within(await screen.findByTestId('steps-form'))
    const body = within(form.getByTestId('steps-form-body'))
    const actions = within(form.getByTestId('steps-form-actions'))

    expect(await body.findByRole('heading', { name: 'Settings' })).toBeVisible()

    // Navigate to Step 2
    await click(screen.getByRole('button', { name: 'APs Selection' }))
    expect(await body.findByRole('heading', { name: 'APs Selection' })).toBeVisible()

    const expected = {
      spec: null,
      userErrors: [{ field: 'name', message: 'DUPLICATE_NAME_NOT_ALLOWED' }]
    }
    mockGraphqlMutation(apiUrl, 'UpdateServiceGuardSpec', {
      data: { updateServiceGuardSpec: expected }
    })

    // Submit
    await click(actions.getByRole('button', { name: 'Apply' }))

    expect(await screen.findByText('Duplicate test name exist')).toBeVisible()
    expect(mockedNavigate).not.toBeCalled()
  })
})
