/* eslint-disable max-len */
import { Form, FormListFieldData } from 'antd'

import { render, renderHook, screen } from '@acx-ui/test-utils'

import {
  formatVariableValue,
  formatContentWithLimit,
  getCustomizeFieldsText,
  getCustomizeButtonDisabled,
  getNetworkBitmap,
  getRequiredMark,
  getVariableColor,
  getVariableSeparator,
  ipv4ToBitmap,
  VariableType,
  validateDuplicateIp,
  validateInRange,
  validateRequiredAddress,
  validateValidIp
} from './CliVariableUtils'

describe('Test formatVariableValue function', () => {
  it('should render correctly', async () => {
    const variables = [{
      name: 'testRange',
      rangeEnd: 98,
      rangeStart: 88,
      type: 'RANGE'
    }, {
      ipAddressEnd: '1.1.1.10',
      ipAddressStart: '1.1.1.1',
      name: 'testIp',
      subMask: '255.255.254.0',
      type: 'ADDRESS'
    }, {
      name: 'testString',
      type: 'STRING',
      string: 'test-string'
    }]

    expect(formatVariableValue(variables[0])).toBe('88:98')
    expect(formatVariableValue(variables[1])).toBe('1.1.1.1_1.1.1.10_255.255.254.0')
    expect(formatVariableValue(variables[2])).toBe('test-string')
  })
})

describe('Test formatContentWithLimit function', () => {
  it('should render correctly', () => {
    const content = 'Line 1\nLine 2'
    const result = formatContentWithLimit(content, 3)
    expect(result).toBe(content)
  })

  it('should render correctly when line count exceeds maxLines', () => {
    const content = 'Line 1\nLine 2\nLine 3\nLine 4'
    const result = formatContentWithLimit(content, 2)
    expect(result).toContain('and 2 more lines...')
  })
})

describe('Test getVariableSeparator function', () => {
  it('should render correctly', async () => {
    expect(getVariableSeparator(VariableType.ADDRESS)).toBe('_')
    expect(getVariableSeparator(VariableType.RANGE)).toBe(':')
    expect(getVariableSeparator(VariableType.STRING)).toBe('*')
  })
})

describe('Test getVariableColor function', () => {
  it('should render correctly', async () => {
    expect(getVariableColor(VariableType.ADDRESS)).toBe('var(--acx-semantics-green-40)')
    expect(getVariableColor(VariableType.RANGE)).toBe('var(--acx-accents-blue-50)')
    expect(getVariableColor(VariableType.STRING)).toBe('var(--acx-accents-orange-50)')
  })
})

describe('Test getRequiredMark function', () => {
  it('should render correctly', async () => {
    expect(getRequiredMark()).toMatchSnapshot()
  })
})

describe('Test getCustomizeFieldsText function', () => {
  it('should render type=VariableType.ADDRESS correctly', async () => {
    render(<>{ getCustomizeFieldsText(VariableType.ADDRESS) }</>)
    expect(await screen.findByText('IP Address')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleOutlined')).toBeVisible()
  })
  it('should render type=VariableType.RANGE correctly', async () => {
    render(<>{ getCustomizeFieldsText(VariableType.RANGE) }</>)
    expect(await screen.findByText('Value')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleOutlined')).toBeVisible()
  })
  it('should render type=VariableType.STRING correctly', async () => {
    render(<>{ getCustomizeFieldsText(VariableType.STRING) }</>)
    expect(await screen.findByText('String')).toBeVisible()
    expect(await screen.findByTestId('QuestionMarkCircleOutlined')).toBeVisible()
  })
})

describe('Test getCustomizeButtonDisabled function', () => {
  it('should render type=VariableType.ADDRESS correctly', async () => {
    const type = VariableType.ADDRESS
    const fields = [] as FormListFieldData[]
    const requiredFields = ['1.1.1.1', '1.1.1.10', '255.255.254.0', '2', '10', 'string']

    expect(getCustomizeButtonDisabled(type, fields, requiredFields)).toBe(false)
    expect(getCustomizeButtonDisabled(type, [{ name: 1, key: 1 }], requiredFields)).toBe(false)
    expect(getCustomizeButtonDisabled('', fields, requiredFields)).toBe(true)
  })
  it('should render type=VariableType.RANGE correctly', async () => {
    const type = VariableType.RANGE
    const fields = [] as FormListFieldData[]
    const requiredFields = ['1.1.1.1', '1.1.1.10', '255.255.254.0', '', '10', 'string']

    expect(getCustomizeButtonDisabled(type, fields, requiredFields)).toBe(true)
    expect(getCustomizeButtonDisabled(type, [{ name: 1, key: 1 }], requiredFields)).toBe(false)
  })
  it('should render type=VariableType.STRING correctly', async () => {
    const type = VariableType.STRING
    const fields = [] as FormListFieldData[]
    const requiredFields = ['1.1.1.1', '1.1.1.10', '255.255.254.0', '2', '10', 'string']

    expect(getCustomizeButtonDisabled(type, fields, requiredFields)).toBe(false)
    expect(getCustomizeButtonDisabled(type, [{ name: 1, key: 1 }], requiredFields)).toBe(false)
  })
})


describe('Test getNetworkBitmap function', () => {
  it('should render correctly', async () => {
    expect(
      getNetworkBitmap('00000001000000010000000100000001', '11111111111111111111111000000000')
    ).toBe('00000001000000010000000000000000')
    expect(
      getNetworkBitmap('00000001000000010000000101100100', '11111111111111111111111000000000')
    ).toBe('00000001000000010000000000000000')
  })
})

describe('Test ipv4ToBitmap function', () => {
  it('should render correctly', async () => {
    expect(ipv4ToBitmap('1.1.1.1')).toBe('00000001000000010000000100000001')
    expect(ipv4ToBitmap('1.1.1.100')).toBe('00000001000000010000000101100100')
    expect(ipv4ToBitmap('255.255.254.0')).toBe('11111111111111111111111000000000')
  })
})

describe('Test validateInRange function', () => {
  it('should render correctly', async () => {
    expect(validateInRange(1, 2, 99)).toBe(false)
    expect(validateInRange(1, 1, 99)).toBe(true)
    expect(validateInRange(10, 1, 99)).toBe(true)
  })
})

describe('Test validateValidIp function', () => {
  it('should resolve correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '1.1.1.1',
      ipAddressEnd: '1.1.1.100',
      subMask: '255.255.254.0'
    })
    await expect(validateValidIp('1.1.1.10', formRef.current)).resolves.toBeUndefined()
  })
  it('should reject correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '1.1.1.1',
      ipAddressEnd: '1.1.1.100',
      subMask: '255.255.254.0'
    })
    await expect(validateValidIp('1.1.1.200', formRef.current)).rejects.toEqual('Please enter valid value')
  })
})

describe('Test validateRequiredAddress function', () => {
  it('should resolve correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '1.1.1.1',
      ipAddressEnd: '1.1.1.100',
      subMask: '255.255.254.0'
    })
    await expect(validateRequiredAddress(formRef.current)).resolves.toBeUndefined()
  })
  it('should reject correctly when the End IP Address is empty', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '1.1.1.1',
      ipAddressEnd: '',
      subMask: '255.255.254.0'
    })
    await expect(validateRequiredAddress(formRef.current)).rejects.toEqual('Please enter End IP Address first')
  })
  it('should reject correctly when the Start IP Address is empty', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '',
      ipAddressEnd: '',
      subMask: '255.255.254.0'
    })
    await expect(validateRequiredAddress(formRef.current)).rejects.toEqual('Please enter Start IP Address first')
  })
  it('should reject correctly when the Network Mask is empty', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      ipAddressStart: '1.1.1.1',
      ipAddressEnd: '1.1.1.10',
      subMask: ''
    })
    await expect(validateRequiredAddress(formRef.current)).rejects.toEqual('Please enter Network Mask first')
  })
})

describe('Test validateDuplicateIp function', () => {
  it('should resolve correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      switchVariables: [{ value: '1.1.1.1' }, { value: '1.1.1.2' }]
    })
    await expect(validateDuplicateIp('1.1.1.1', 0, formRef.current)).resolves.toBeUndefined()
  })
  it('should reject correctly', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      switchVariables: [{ value: '1.1.1.1' }, { value: '1.1.1.1' }]
    })
    await expect(validateDuplicateIp('1.1.1.1', 0, formRef.current)).rejects.toEqual('IP already exists')
  })
})

