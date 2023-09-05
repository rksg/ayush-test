import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { DdosAttackType, DdosRateLimitingRule } from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen } from '@acx-ui/test-utils'

import { DDoSRuleDialog } from './'

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
  return { ...components, Select }
})

const mockedSubmit = jest.fn()
const mockedSetVisible = jest.fn()
const { click, type, selectOptions, clear } = userEvent

describe('DDoS rule dialog', () => {
  beforeEach(() => {
    mockedSubmit.mockClear()
    mockedSetVisible.mockClear()
  })

  it('should correctly render', async () => {
    render(<Form>
      <DDoSRuleDialog
        visible={true}
        setVisible={mockedSetVisible}
        onSubmit={mockedSubmit}
        editMode={false}
        editData={{} as DdosRateLimitingRule}
      />
    </Form>)

    await screen.findByText('Add DDoS Rule')
    await selectOptions(
      await screen.findByRole('combobox', { name: 'DDoS Attack Type' }),
      'ICMP')
    await type(screen.getByRole('spinbutton'), '6')
    await click(screen.getByRole('button', { name: 'Add' }))

    expect(mockedSubmit).toBeCalledWith({
      ddosAttackType: 'ICMP',
      rateLimiting: 2566
    }, false)
  })

  it('should correctly when edit mode', async () => {
    const mockedData = {
      ddosAttackType: DdosAttackType.NTP_REFLECTION,
      rateLimiting: 366
    } as DdosRateLimitingRule
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('rules', [mockedData])
      return form
    })

    render(<Form form={formRef.current}>
      <DDoSRuleDialog
        visible={true}
        setVisible={mockedSetVisible}
        onSubmit={mockedSubmit}
        editMode={true}
        editData={mockedData}
      />
    </Form>)

    await screen.findAllByRole('option')
    const disabledOpts = screen.getAllByRole('option', { name: 'this rule is already created.' })
    expect(disabledOpts.length).toBe(2)
    await type(screen.getByRole('spinbutton'), '{backspace}2')
    await click(screen.getByRole('button', { name: 'Apply' }))
    expect(mockedSubmit).toBeCalledWith({
      ddosAttackType: DdosAttackType.NTP_REFLECTION,
      rateLimiting: 362
    }, true)
  })

  it('should reset form while want to `Add another rule`', async () => {
    render(<Form>
      <DDoSRuleDialog
        visible={true}
        setVisible={mockedSetVisible}
        onSubmit={mockedSubmit}
        editMode={false}
        editData={{} as DdosRateLimitingRule}
      />
    </Form>)

    // add the first one
    await selectOptions(
      await screen.findByRole('combobox', { name: 'DDoS Attack Type' }),
      'TCP_SYN')
    await clear(screen.getByRole('spinbutton'))
    await type(screen.getByRole('spinbutton'), '168')

    await click(await screen.findByRole('checkbox', { name: 'Add another rule' }))
    await click(screen.getByRole('button', { name: 'Add' }))
    expect(mockedSubmit).toBeCalledWith({
      ddosAttackType: DdosAttackType.TCP_SYN,
      rateLimiting: 168
    }, false)

    // expect form to be reset
    expect(screen.queryByRole('spinbutton')).toHaveValue('256')
    expect(screen.queryByRole('combobox', { name: 'DDoS Attack Type' })).toHaveValue('')
  })

  it('should disabled all options and `Add another rule` after `All` is created', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('rules', [{
        ddosAttackType: DdosAttackType.ALL,
        rateLimiting: 300
      }])
      return form
    })

    render(<Form form={formRef.current}>
      <DDoSRuleDialog
        visible={true}
        setVisible={mockedSetVisible}
        onSubmit={mockedSubmit}
        editMode={false}
        editData={{} as DdosRateLimitingRule}
      />
    </Form>)

    const disabledOpts = screen.getAllByRole('option', { name: 'this rule is already created.' })
    expect(disabledOpts.length).toBe(5)
    expect(screen.getByRole('checkbox', { name: 'Add another rule' })).toBeDisabled()
  })

  it('should disabled `Add another rule` after `All` is selected', async () => {
    render(<Form>
      <DDoSRuleDialog
        visible={true}
        setVisible={mockedSetVisible}
        onSubmit={mockedSubmit}
        editMode={false}
        editData={{} as DdosRateLimitingRule}
      />
    </Form>)

    await screen.findByText('Add DDoS Rule')
    await selectOptions(
      await screen.findByRole('combobox', { name: 'DDoS Attack Type' }),
      'All')
    expect(screen.getByRole('checkbox', { name: 'Add another rule' })).toBeDisabled()
  })
})
