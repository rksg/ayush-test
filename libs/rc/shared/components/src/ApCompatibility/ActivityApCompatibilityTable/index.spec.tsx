
import userEvent from '@testing-library/user-event'

import { timelineApi }                               from '@acx-ui/rc/services'
import { CommonUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider, store }                           from '@acx-ui/store'
import { mockRestApiQuery, render, waitFor, screen } from '@acx-ui/test-utils'

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

    await waitFor(() => {
      expect(mockUpdateStatus).toBeCalledTimes(1)
    })
    const element = await screen.findByText('AP-1')
    expect(element).toBeInTheDocument()
    expect(await screen.findByText('AP-10')).toBeInTheDocument()
    const showBtn = await screen.findByTestId('showBtn')
    expect(showBtn).toBeVisible()
    await userEvent.click(showBtn)
    expect(element).not.toBeInTheDocument()
    await userEvent.click(showBtn)
    expect(await screen.findByText('AP-1')).toBeInTheDocument()
  })
})
