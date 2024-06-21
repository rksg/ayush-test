import { MspEc }                    from '@acx-ui/msp/utils'
import { ConfigTemplate }           from '@acx-ui/rc/utils'
import { renderHook, waitFor, act } from '@acx-ui/test-utils'

import { mockedConfigTemplateList } from '../__tests__/fixtures'

import { OverrideEntitiyType }                                from './types'
import { transformOverrideValues, useConfigTemplateOverride } from './utils'


describe('Config Template Overrides utils', () => {
  describe('transformOverrideValues', () => {
    it('should transform flattened object into overrides array', () => {
      const entity = { a: 1, b: { c: 2 } } as OverrideEntitiyType
      const expectedOutput = {
        overrides: [{ a: 1 }, { 'b.c': 2 }]
      }

      const result = transformOverrideValues(entity)

      expect(result).toEqual(expectedOutput)
    })

    it('should handle empty entity', () => {
      const entity = {}
      const expectedOutput = { overrides: [] }

      const result = transformOverrideValues(entity)

      expect(result).toEqual(expectedOutput)
    })

    it('should handle undefined entity', () => {
      const expectedOutput = { overrides: [] }

      const result = transformOverrideValues()

      expect(result).toEqual(expectedOutput)
    })
  })

  describe('useConfigTemplateOverride', () => {
    it('should return correct createOverrideModalProps', async () => {
      // eslint-disable-next-line max-len
      const mockedTemplate = mockedConfigTemplateList.data.find(t => t.type === 'VENUE') as ConfigTemplate
      const mockedMspEcs: MspEc[] = [{
        id: '123456',
        name: 'EC-1',
        tenantType: 'MSP_EC',
        streetAddress: '350 W Java Dr, Sunnyvale, CA 94089, USA',
        status: 'Active',
        mspAdminCount: '1',
        mspEcAdminCount: '1',
        expirationDate: '2023-12-20T02:05:06Z',
        wifiLicenses: '0',
        switchLicenses: '0',
        apswLicenses: '0',
        assignedMspEcList: [],
        creationDate: 1715654961625,
        entitlements: []
      }]
      const { result } = renderHook(() => useConfigTemplateOverride(mockedTemplate, mockedMspEcs))

      // eslint-disable-next-line max-len
      act(() => result.current.createOverrideModalProps().updateOverrideValue({ description: 'existing override value' }))

      // eslint-disable-next-line max-len
      await waitFor(() => expect(result.current.createOverrideModalProps().existingOverrideValues).not.toBeUndefined())
    })
  })
})
