import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { DDoSRateLimitConfigDrawer } from './'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    mode,
    ...props
  }: React.PropsWithChildren<{
    showSearch: boolean,
    mode: string,
    onChange?: (value: string) => void }>) => {

    return (<select {...props}
      multiple={mode==='tags' || mode==='multiple'}
      onChange={(e) => {
        props.onChange?.(e.target.value)}
      }>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      <option value={undefined}></option>
      {children}
    </select>)
  }
  Select.Option = 'option'
  Select.OptGroup = 'optgroup'
  return { ...components, Select }
})

const mockedSetFieldValue = jest.fn()
const mockedGetFieldValue = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: mockedGetFieldValue.mockReturnValue([]),
      setFieldValue: mockedSetFieldValue
    }
  })
}))

const { click, type, selectOptions } = userEvent

describe('DDos rate limit config drawer', () => {
  beforeEach(() => {
    mockedGetFieldValue.mockReset()
    mockedSetFieldValue.mockReset()
  })

  it('should correctly render', async () => {
    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={() => {}}
        />
      </Provider>)

    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()

    // add ddos rule
    const addRuleBtn = screen.getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    await screen.findByText('Add DDoS Rule')
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'ICMP')
    await type(within(dialog).getByRole('spinbutton'), '6')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await screen.findByRole('row', { name: /ICMP/ })

    // add another rule
    await click(addRuleBtn)
    await click(await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }))

    // the added attack type should be disabled
    const opts = await within(dialog).findAllByRole('option')
    const icmp = opts.filter(o => o.textContent === 'ICMP')
    expect(icmp[0]).toBeDisabled()
    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'DNS Response')
    await type(within(dialog).getByRole('spinbutton'), '{backspace}2')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await screen.findByRole('row', { name: /DNS Response/ })

    // delete ICMP rule
    const icmpRow = await screen.findByRole('row', { name: /ICMP/ })
    await click(await within(icmpRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "ICMP"?')
    await click(await screen.findByRole('button', { name: 'Delete Rule' }))

    // submit
    await click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockedSetFieldValue).toBeCalledWith('ddosRateLimitingRules', [{
      ddosAttackType: 'DNS_RESPONSE',
      rateLimiting: 252
    }])
  })

  it('should reset data when click cancel', async () => {
    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={() => {}}
        />
      </Provider>)

    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()
    const drawer = screen.getByRole('dialog')

    // add ddos rule
    const addRuleBtn = screen.getByRole('button', { name: 'Add Rule' })
    await click(addRuleBtn)
    await screen.findByText('Add DDoS Rule')
    const dialogs = screen.queryAllByRole('dialog')
    const dialog = dialogs.filter(elem => elem.classList.contains('ant-modal'))[0]

    await selectOptions(
      await within(dialog).findByRole('combobox', { name: 'DDoS Attack Type' }),
      'ICMP')
    await type(within(dialog).getByRole('spinbutton'), '6')
    await click(within(dialog).getByRole('button', { name: 'Add' }))
    await within(drawer).findByRole('row', { name: /ICMP/ })

    // submit
    await click(within(drawer).getByRole('button', { name: 'Cancel' }))

    expect(mockedSetFieldValue).toBeCalledWith('ddosRateLimitingEnabled', false)
  })
})
