import { AAAViewModalType, AAARbacViewModalType } from '@acx-ui/rc/utils'
import { TableResult }                            from '@acx-ui/utils'

import { convertRbacDataToAAAViewModelPolicyList } from '.'

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
})
