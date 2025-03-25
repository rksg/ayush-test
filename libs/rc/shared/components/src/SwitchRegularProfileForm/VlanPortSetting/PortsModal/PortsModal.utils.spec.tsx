import '@testing-library/jest-dom'
import { Form } from 'antd'

import { SwitchSlot2 as SwitchSlot } from '@acx-ui/rc/utils'
import { renderHook }                from '@acx-ui/test-utils'

import { checkIfModuleFixed } from '../index.utils'

import { getPortsModule, getModelModules, generateSlotData } from './PortsModal.utils'

const getSlots = (
  family: string, model: string, customConfig?: Record<string, string | boolean>
) => {
  const modelModules = getModelModules(family, model)
  const moduleCount = modelModules?.length ?? 0
  const { enableSlot2, enableSlot3 } = checkIfModuleFixed(family, model)
  const { result: formRef } = renderHook(() => {
    const [form] = Form.useForm()
    form.setFieldsValue({
      enableSlot2,
      enableSlot3,
      ...customConfig
    })
    return form
  })

  const slots = Array.from({ length: moduleCount }, (_, i) => {
    const slotNumber = i+1
    return generateSlotData(slotNumber, family, model, formRef.current)
  }).filter(Boolean) as SwitchSlot[]

  return slots
}

describe('Test getPortsModule', () => {
  it('should render module ICX7150-C08P correctly', async () => {
    const family = 'ICX7150'
    const model = 'C08P'
    const slots = getSlots(family, model)

    const [result] = getPortsModule(slots, false)
    expect(result[0]).toHaveLength(8)
    expect(result[1]).toHaveLength(2)
  })

  it('should render module ICX7650-48ZP correctly', async () => {
    const family = 'ICX7650'
    const model = '48ZP'
    const slots = getSlots(family, model, {
      enableSlot2: true,
      selectedOptionOfSlot2: '2X40G'
    })

    const [result] = getPortsModule(slots, false)
    expect(result[0]).toHaveLength(48)
    expect(result[1]).toHaveLength(2)
    expect(result).toStrictEqual([
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({ label: '1', value: '1/2/1' })
      ])
    ])
  })

  it('should render module ICX7850-32Q correctly', async () => {
    const family = 'ICX7850'
    const model = '32Q'
    const slots = getSlots(family, model)

    const [result] = getPortsModule(slots, false)
    expect(result[0]).toHaveLength(12)
    expect(result[1]).toHaveLength(12)
    expect(result[2]).toHaveLength(8)
    expect(result).toStrictEqual([
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({ label: '1', value: '1/2/1' })
      ]),
      expect.arrayContaining([
        expect.objectContaining({ label: '8', value: '1/3/8' })
      ])
    ])
  })

  it('should render module ICX8100-C08PF correctly', async () => {
    const family = 'ICX8100'
    const model = 'C08PF'
    const slots = getSlots(family, model)

    const [result] = getPortsModule(slots, false)
    expect(result[0]).toHaveLength(8)
    expect(result[1]).toHaveLength(2)
  })

  it('should render module ICX8200-24 correctly', async () => {
    const family = 'ICX8200'
    const model = '24'
    const slots = getSlots(family, model)

    const [result] = getPortsModule(slots, false)
    expect(result[0]).toHaveLength(24)
    expect(result[1]).toHaveLength(4)
    expect(result).toStrictEqual([
      expect.any(Array),
      expect.arrayContaining([
        expect.objectContaining({ label: '4', value: '1/2/4' })
      ])
    ])
  })
})
