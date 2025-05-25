import { data } from 'msw/lib/types/context'

import { defaultNetworkPath }      from '@acx-ui/analytics/utils'
import { get }                     from '@acx-ui/config'
import { NetworkNode, NodeFilter } from '@acx-ui/utils'

import { mockNetworkNodes } from '../__tests__/mockedEcoFlex'

import { transformSANetworkHierarchy, validateSelectingAllAPs } from './APSelection'

describe('transformSANetworkHierarchy', () => {
  it('transform label correctly', () => {
    const data = mockNetworkNodes as NetworkNode[]
    const expectLabels = data[0].children?.map(ap => `${ap.name} (${ap.mac}) (Access Point)`)
    const result = transformSANetworkHierarchy(data, defaultNetworkPath)
    const labels = result[0].children?.map(node => node.label)
    expect(result[0].label).toEqual(`${data[0].name} (AP Group)`)
    expect(labels).toEqual(expectLabels)
  })
})

jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockGet = jest.mocked(get)

describe('validateSelectingAllAPs', () => {
  beforeEach(() => {
    mockGet.mockReturnValue('')
  })
  it('should resolve if nothing is selected', async () => {
    await expect(validateSelectingAllAPs([], { data: {} }))
      .resolves.toBeUndefined()
  })
  it('should reject if all AP groups are selected in RAI', async () => {
    mockGet.mockReturnValue('true')
    const selectedValue = [
      [{ type: 'apGroup', name: 'group1' }],
      [{ type: 'apGroup', name: 'group2' }]
    ] as NodeFilter[]
    const apDataResponse = { data: { children: [
      [{ type: 'apGroup', name: 'group1' }],
      [{ type: 'apGroup', name: 'group2' }]
    ] } }
    await expect(validateSelectingAllAPs(selectedValue, apDataResponse))
      .rejects.toBe('Cannot exclude all APs.')
  })
  it('should resolve if not all AP groups are selected in RAI', async () => {
    mockGet.mockReturnValue('true')
    const selectedValue = [[{ type: 'apGroup', name: 'group1' }]] as NodeFilter[]
    const apDataResponse = { data: { children: [
      [{ type: 'apGroup', name: 'group1' }],
      [{ type: 'apGroup', name: 'group2' }]
    ] } }
    await expect(validateSelectingAllAPs(selectedValue, apDataResponse))
      .resolves.toBeUndefined()
  })
  it('should handle case where children is undefined', async () => {
    mockGet.mockReturnValue('true')
    const selectedValue = [[{ type: 'apGroup', name: 'group1' }]] as NodeFilter[]
    const apDataResponse = { data: { children: undefined } } // Simulating no APs
    // Should resolve, as totalApGroups = 0
    await expect(validateSelectingAllAPs(selectedValue, apDataResponse))
      .resolves.toBeUndefined()
  })
  it('should reject if all APs are selected in R1', async () => {
    const selectedValue = [[{ type: 'zone', name: 'zone1' }]] as NodeFilter[]
    await expect(validateSelectingAllAPs(selectedValue, { data: {} }))
      .rejects.toBe('Cannot exclude all APs.')
  })
  it('should resolve if not all APs are selected in R1', async () => {
    const selectedValue = [[
      { type: 'zone', name: 'Auto_RA-R1-Enterprise' },
      { type: 'apMac', list: ['mac1', 'mac2'] }
    ]] as NodeFilter[]
    await expect(validateSelectingAllAPs(selectedValue, { data: {} }))
      .resolves.toBeUndefined()
  })
})