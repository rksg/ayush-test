import { within } from '@testing-library/react'
import userEvent  from '@testing-library/user-event'

import { DdosRateLimitingRule } from '@acx-ui/rc/utils'
import { Provider }             from '@acx-ui/store'
import { render, screen }       from '@acx-ui/test-utils'

import { DDoSRuleDialogProps } from '../DDoSRuleDialog'

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
const mockedGetRuleSubmitData = jest.fn()
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  useStepFormContext: () => ({
    form: {
      getFieldValue: mockedGetFieldValue,
      setFieldValue: mockedSetFieldValue
    }
  })
}))
jest.mock('../DDoSRuleDialog', () => ({
  ...jest.requireActual('../DDoSRuleDialog'),
  DDoSRuleDialog: (props: DDoSRuleDialogProps) => {
    const submitData = mockedGetRuleSubmitData()
    return props.visible && <div data-testid='rc-DDoSRuleDialog'>
      <div onClick={() => {
        props.onSubmit(submitData, props.editMode)
        props.setVisible(false)
      }}>Submit</div>
    </div>
  }
}))

const { click } = userEvent

describe('DDos rate limit config drawer', () => {
  beforeEach(() => {
    mockedGetFieldValue.mockReset()
    mockedSetFieldValue.mockReset()
    mockedGetRuleSubmitData.mockReset()
    mockedGetFieldValue.mockReturnValue([])
  })



  it('should correctly edit rule and delete rule', async () => {
    const mockedData = [{
      ddosAttackType: 'DNS_RESPONSE',
      rateLimiting: 150
    }, {
      ddosAttackType: 'ICMP',
      rateLimiting: 200
    }]
    mockedGetFieldValue.mockReturnValue(mockedData)
    mockedGetRuleSubmitData.mockReturnValue({
      ddosAttackType: 'ICMP',
      rateLimiting: 111
    })

    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={() => {}}
          data={mockedData as DdosRateLimitingRule[]}
        />
      </Provider>)

    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()
    const drawer = screen.getByRole('dialog')
    const icmpRow = await screen.findByRole('row', { name: /ICMP/ })
    const dnsRow = await screen.findByRole('row', { name: /DNS Response/ })

    // edit ICMP rule
    await click(await within(icmpRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByTestId('rc-DDoSRuleDialog')
    await click(await within(dialog).findByText('Submit'))
    await click(await within(icmpRow).findByRole('checkbox'))

    // delete DNS Response rule
    await click(await within(dnsRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "DNS Response"?')
    await click(await screen.findByRole('button', { name: 'Delete Rule' }))

    // submit
    await click(within(drawer).getByRole('button', { name: 'Apply' }))

    expect(mockedSetFieldValue).toBeCalledWith('ddosRateLimitingRules', [{
      ddosAttackType: 'ICMP',
      rateLimiting: 111
    }])
  })

  it('should correctly delete multiple rules', async () => {
    const mockedData = [{
      ddosAttackType: 'TCP_SYN',
      rateLimiting: 252
    }, {
      ddosAttackType: 'DNS_RESPONSE',
      rateLimiting: 100
    }, {
      ddosAttackType: 'ICMP',
      rateLimiting: 266
    }]
    mockedGetFieldValue.mockReturnValue(mockedData)

    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={() => {}}
          data={mockedData as DdosRateLimitingRule[]}
        />
      </Provider>)

    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()
    const tcpSynRow = await screen.findByRole('row', { name: /TCP SYN/ })
    const icmpRow = await screen.findByRole('row', { name: /ICMP/ })
    await click(await within(tcpSynRow).findByRole('checkbox'))
    await click(await within(icmpRow).findByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Delete' }))
    await screen.findByText('Delete "2 Rules"?')
    await click(await screen.findByRole('button', { name: 'Delete Rules' }))

    // submit
    await click(screen.getByRole('button', { name: 'Apply' }))

    expect(mockedSetFieldValue).toBeCalledWith('ddosRateLimitingRules', [{
      ddosAttackType: 'DNS_RESPONSE',
      rateLimiting: 100
    }])
  })

  it('cancel should do nothing', async () => {
    const mockedData = [{
      ddosAttackType: 'DNS_RESPONSE',
      rateLimiting: 252
    }]
    mockedGetFieldValue.mockReturnValue(mockedData)
    mockedGetRuleSubmitData.mockReturnValue({
      ddosAttackType: 'ICMP',
      rateLimiting: 112
    })

    render(
      <Provider>
        <DDoSRateLimitConfigDrawer
          visible={true}
          setVisible={() => {}}
          data={mockedData as DdosRateLimitingRule[]}
        />
      </Provider>)

    expect(await screen.findByText('DDoS Rate-limiting Settings')).toBeVisible()
    const drawer = screen.getByRole('dialog')
    await screen.findByRole('row', { name: /DNS Response/ })

    // add ddos rule
    await click(screen.getByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findByTestId('rc-DDoSRuleDialog')
    await click(await within(dialog).findByText('Submit'))

    await click(within(drawer).getByRole('button', { name: 'Cancel' }))
    expect(mockedSetFieldValue).toBeCalledTimes(0)
  })

  it('should reset data when click cancel', async () => {
    mockedGetRuleSubmitData.mockReturnValue({
      ddosAttackType: 'ICMP',
      rateLimiting: 2566
    })

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
    await click(screen.getByRole('button', { name: 'Add Rule' }))
    const dialog = await screen.findByTestId('rc-DDoSRuleDialog')
    await click(await within(dialog).findByText('Submit'))
    await within(drawer).findByRole('row', { name: /ICMP/ })

    // submit
    await click(within(drawer).getByRole('button', { name: 'Cancel' }))

    expect(mockedSetFieldValue).toBeCalledWith('ddosRateLimitingEnabled', false)
  })
})
