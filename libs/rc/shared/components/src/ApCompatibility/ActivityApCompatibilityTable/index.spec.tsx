
import { timelineApi }                   from '@acx-ui/rc/services'
import { CommonUrlsInfo }                from '@acx-ui/rc/utils'
import { Provider, store }               from '@acx-ui/store'
import { mockRestApiQuery, act, render } from '@acx-ui/test-utils'

import { mockActivityApCompatibilityTable } from '../__test__/fixtures'

import {  ActivityApCompatibilityTable } from '.'

const params = { tenantId: 'tenant-id' }

describe('ActivityApCompatibilityTable', () => {
  beforeEach(() => {
    store.dispatch(timelineApi.util.resetApiState())
    mockRestApiQuery(
      CommonUrlsInfo.getActivityApCompatibilitiesList.url,
      'post',
      mockActivityApCompatibilityTable
    )
  })
  it('should visible render correctly', async () => {
    const requestId = 'requestId'
    const mockUpdateStatus = jest.fn()
    render(
      <Provider>
        <ActivityApCompatibilityTable
          requestId={requestId}
          updateActivityDesc={mockUpdateStatus} />
      </Provider>,
      { route: { params } })
    expect(mockUpdateStatus).toBeCalledTimes(1)
  })

})
