import { NamePath } from 'antd/es/form/interface'

import { screen } from '@acx-ui/test-utils'

import { renderForm, renderFormHook } from '../../__tests__/fixtures'
import { ClientType, Band }           from '../../types'

import { RadioBand } from './RadioBand'

describe('RadioBand', () => {
  it('render field for virtual-client', async () => {
    renderForm(<RadioBand />, {
      initialValues: {
        clientType: ClientType.VirtualClient,
        configs: [{ radio: Band.Band2_4 }]
      }
    })

    expect(screen.getAllByRole('radio', {
      name: (_, el) => (el as HTMLInputElement).disabled === false
    })).toHaveLength(2)
  })

  it('render field for virtual-wireless-client', async () => {
    renderForm(<RadioBand />, {
      initialValues: {
        clientType: ClientType.VirtualWirelessClient,
        configs: [{ radio: Band.Band2_4 }]
      }
    })

    expect(screen.getAllByRole('radio', {
      name: (_, el) => (el as HTMLInputElement).disabled === false
    })).toHaveLength(3)
  })

  describe('reset', () => {
    const name = RadioBand.fieldName as unknown as NamePath

    it('resets to 2.4', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, Band.Band6)
      RadioBand.reset(form, ClientType.VirtualClient)
      expect(form.getFieldValue(name)).toEqual(Band.Band2_4)
    })

    it('does not reset to 2.4 if virtual wireless client', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, Band.Band6)
      RadioBand.reset(form, ClientType.VirtualWirelessClient)
      expect(form.getFieldValue(name)).toEqual(Band.Band6)
    })

    it('does not reset to 2.4 if band is not 6', () => {
      const { form } = renderFormHook()
      form.setFieldValue(name, Band.Band5)
      RadioBand.reset(form, ClientType.VirtualClient)
      expect(form.getFieldValue(name)).toEqual(Band.Band5)
    })
  })
})
