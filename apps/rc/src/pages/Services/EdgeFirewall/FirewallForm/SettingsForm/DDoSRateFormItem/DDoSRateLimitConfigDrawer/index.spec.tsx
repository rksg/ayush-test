import userEvent from '@testing-library/user-event'

import { DdosRateLimitingRule }   from '@acx-ui/rc/utils'
import { Provider }               from '@acx-ui/store'
import { render, screen, within } from '@acx-ui/test-utils'

import { DDoSRuleDialogProps } from '../DDoSRuleDialog'

import { DDoSRateLimitConfigDrawer } from './'

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
    const rows = await within(drawer).findAllByRole('row')
    expect(within(rows[2]).getByRole('cell', { name: /ICMP/ })).toBeVisible()
    const icmpRow = rows[2]
    expect(within(rows[1]).getByRole('cell', { name: /DNS Response/ })).toBeVisible()
    const dnsRow = rows[1]

    // edit ICMP rule
    await click(within(icmpRow).getByRole('checkbox'))
    await click(await screen.findByRole('button', { name: 'Edit' }))
    const dialog = await screen.findByTestId('rc-DDoSRuleDialog')
    await click(await within(dialog).findByText('Submit'))
    await click(within(icmpRow).getByRole('checkbox'))

    // delete DNS Response rule
    await click(within(dnsRow).getByRole('checkbox'))
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
    const rows = await screen.findAllByRole('row')
    expect(within(rows[3]).getByRole('cell', { name: /TCP SYN/ })).toBeVisible()
    const tcpSynRow = rows[3]
    expect(within(rows[2]).getByRole('cell', { name: /ICMP/ })).toBeVisible()
    const icmpRow = rows[2]
    await click(within(tcpSynRow).getByRole('checkbox'))
    await click(within(icmpRow).getByRole('checkbox'))
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
