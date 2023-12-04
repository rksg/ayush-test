import userEvent from '@testing-library/user-event'
import _         from 'lodash'
import { rest }  from 'msw'

import { get }                   from '@acx-ui/config'
import { networkApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo }        from '@acx-ui/rc/utils'
import {
  serviceGuardApi as api,
  serviceGuardApiURL as apiUrl
} from '@acx-ui/store'
import { store }                                from '@acx-ui/store'
import { mockServer, mockGraphqlQuery, screen } from '@acx-ui/test-utils'

import { renderForm }                       from '../../__tests__/fixtures'
import { AuthenticationMethod, ClientType } from '../../types'

import { WlanName } from './WlanName'

jest.mock('@acx-ui/config', () => ({ get: jest.fn() }))
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

const { click, selectOptions } = userEvent

const params = { tenantId: 't-id' }
const [wlans, items] = _(Array(5))
  .map((_, i) => [
    { name: `Network ${i}`, authMethods: [] },
    { id: `n-${i}`, name: `Network ${i}`, aps: 1, venues: { count: 1 } }
  ])
  .unzip()
  .value()

const mockNetworksQuery = (data = items) => mockServer.use(
  rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
    res(ctx.json({ data, totalCount: data.length }))
  )
)

describe('WlanName', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
    store.dispatch(networkApi.util.resetApiState())
  })

  it('renders field', async () => {
    mockNetworksQuery()
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    const dropdown = await screen.findByRole('combobox')

    expect(dropdown).toHaveAttribute('placeholder', 'Select a network')
    expect(screen.getAllByRole('option', {
      name: (_, el) => Boolean((el as HTMLInputElement).value)
    })).toHaveLength(items.length)

    await selectOptions(dropdown, 'Network 1')

    await click(screen.getByRole('button', { name: 'Submit' }))
    expect(await screen.findByTestId('form-values')).toHaveTextContent('Network 1')
  })

  it('renders no networks found placeholder when no networks available', async () => {
    mockNetworksQuery([])
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: [] } })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    expect(await screen.findByRole('combobox')).toHaveAttribute('placeholder', 'No networks found')
  })

  it('invalidate field if left empty', async () => {
    mockNetworksQuery()
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const input = await screen.findByRole('combobox')
    expect(input).toBeVisible()

    await click(submit)

    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('invalidate field when previous chosen network deleted', async () => {
    mockNetworksQuery()
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })

    renderForm(<WlanName />, {
      params,
      initialValues: {
        clientType: ClientType.VirtualClient,
        configs: [{ wlanName: 'Name XYZ' }]
      }
    })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const input = await screen.findByRole('combobox')
    expect(input).toBeVisible()

    await click(submit)

    expect(await screen.findByRole('alert')).toHaveTextContent('does not exists')
  })

  it('hide networks not associate with any APs and venues', async () => {
    mockNetworksQuery([
      ...items,
      { id: 'h-1', name: 'No APs', aps: 0, venues: { count: 1 } },
      { id: 'h-1', name: 'No Venues', aps: 1, venues: { count: 0 } }
    ])
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    expect(await screen.findByRole('combobox')).toBeVisible()
    expect(screen.getAllByRole('option', {
      name: (_, el) => Boolean((el as HTMLInputElement).value)
    })).toHaveLength(items.length)
  })

  it('show tooltip & disable option not exist in historical', async () => {
    mockNetworksQuery()
    mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans: wlans.slice(0, -1) } })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    expect(await screen.findByRole('combobox')).toBeVisible()
    expect(screen.getByRole('option', { name: items.at(-1)?.name })).toBeDisabled()
  })

  it('update authenticationMethod if historical data available', async () => {
    const name = 'Auto Suggest'
    mockNetworksQuery([ ...items, { id: 'X', name, aps: 1, venues: { count: 1 } }])
    mockGraphqlQuery(apiUrl, 'Wlans', {
      data: {
        wlans: [...wlans, {
          name,
          authMethods: [AuthenticationMethod.WPA2_PERSONAL, AuthenticationMethod.WPA3_PERSONAL]
        }]
      }
    })

    renderForm(<WlanName />, {
      params,
      initialValues: { clientType: ClientType.VirtualClient }
    })

    const dropdown = await screen.findByRole('combobox')

    await selectOptions(dropdown, name)
    await click(screen.getByRole('button', { name: 'Submit' }))

    // auto select from historical
    expect(await screen.findByTestId('form-values'))
      .toHaveTextContent(AuthenticationMethod.WPA2_PERSONAL)

    await selectOptions(dropdown, 'Network 1')
    await click(screen.getByRole('button', { name: 'Submit' }))

    // reset when historical doesn't have value
    expect(await screen.findByTestId('form-values'))
      .toHaveTextContent(JSON.stringify({ wlanName: 'Network 1' }))
  })

  describe('RA', () => {
    beforeEach(() => jest.mocked(get).mockReturnValue('true'))

    it('renders field', async () => {
      mockGraphqlQuery(apiUrl, 'Wlans', { data: { wlans } })

      renderForm(<WlanName />, {
        params,
        initialValues: { clientType: ClientType.VirtualClient }
      })

      const dropdown = await screen.findByRole('combobox')

      expect(dropdown).toHaveAttribute('placeholder', 'Select a network')
      expect(screen.getAllByRole('option', {
        name: (_, el) => Boolean((el as HTMLInputElement).value)
      })).toHaveLength(items.length)

      await selectOptions(dropdown, 'Network 1')

      await click(screen.getByRole('button', { name: 'Submit' }))
      expect(await screen.findByTestId('form-values')).toHaveTextContent('Network 1')
    })
  })
})
