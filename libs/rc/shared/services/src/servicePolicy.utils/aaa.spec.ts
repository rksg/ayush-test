import { AAAViewModalType, AAARbacViewModalType, Radius, TableResult } from '@acx-ui/rc/utils'

import { convertRbacDataToAAAViewModelPolicyList, covertAAAViewModalTypeToRadius } from '.'

describe('aaa.utils', () => {
  it('should convert RBAC data to AAA view model policy list', () => {
    const input: TableResult<AAARbacViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', wifiNetworkIds: ['network1', 'network2'] }
      ]
    }
    const expectedOutput: TableResult<AAAViewModalType> = {
      page: 1,
      totalCount: 1,
      data: [
        // eslint-disable-next-line max-len
        { id: '1', name: 'Policy 1', primary: '192.168.1.1:8080', secondary: '', type: 'ACCOUNTING', networkIds: ['network1', 'network2'] }
      ]
    }
    expect(convertRbacDataToAAAViewModelPolicyList(input)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '192.168.1.2:9090',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 },
      secondary: { ip: '192.168.1.2', port: 9090 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })

  it('should convert AAA view model type to Radius - empty secondary', () => {
    const data: AAAViewModalType = {
      id: '1',
      name: 'Policy 1',
      primary: '192.168.1.1:8080',
      secondary: '',
      type: 'ACCOUNTING',
      networkIds: ['network1', 'network2']
    }
    const expectedOutput: Radius = {
      id: '1',
      name: 'Policy 1',
      type: 'ACCOUNTING',
      primary: { ip: '192.168.1.1', port: 8080 }
    }
    expect(covertAAAViewModalTypeToRadius(data)).toEqual(expectedOutput)
  })
})
