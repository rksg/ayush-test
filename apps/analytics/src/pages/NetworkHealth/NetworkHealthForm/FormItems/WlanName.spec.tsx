import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { networkApi }         from '@acx-ui/rc/services'
import { CommonUrlsInfo }     from '@acx-ui/rc/utils'
import { store }              from '@acx-ui/store'
import { mockServer, screen } from '@acx-ui/test-utils'

import { renderForm } from '../../__tests__/fixtures'

import { WlanName } from './WlanName'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, ...props }: React.PropsWithChildren) => (
    <select {...props}>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const { click, selectOptions } = userEvent

const params = { tenantId: 't-id' }
const items = Array(5).fill(null)
  .map((_, i) => ({ id: `n-${i}`, name: `Network ${i}` }))

const mockNetworksQuery = (data = items) => mockServer.use(
  rest.post(CommonUrlsInfo.getVMNetworksList.url, (_, res, ctx) =>
    res(ctx.json({ data, totalCount: data.length }))
  )
)

describe('WlanName', () => {
  beforeEach(() => store.dispatch(networkApi.util.resetApiState()))

  it('renders field', async () => {
    mockNetworksQuery()

    renderForm(<WlanName />, { params })

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

    renderForm(<WlanName />, { params })

    expect(await screen.findByRole('combobox')).toHaveAttribute('placeholder', 'No networks found')
  })

  it('invalidate field if left empty', async () => {
    mockNetworksQuery()

    renderForm(<WlanName />, { params })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const input = await screen.findByRole('combobox')
    expect(input).toBeVisible()

    await click(submit)

    expect(await screen.findByRole('alert')).toBeVisible()
  })

  it('invalidate field when previous chosen network deleted', async () => {
    mockNetworksQuery()

    renderForm(<WlanName />, {
      params,
      initialValues: { wlanName: 'Name XYZ' }
    })

    const submit = screen.getByRole('button', { name: 'Submit' })
    const input = await screen.findByRole('combobox')
    expect(input).toBeVisible()

    await click(submit)

    expect(await screen.findByRole('alert')).toHaveTextContent('does not exists')
  })
})
