
import userEvent from '@testing-library/user-event'

import { timelineApi }                               from '@acx-ui/rc/services'
import { CommonUrlsInfo }                            from '@acx-ui/rc/utils'
import { Provider, store }                           from '@acx-ui/store'
import { mockRestApiQuery, render, waitFor, screen } from '@acx-ui/test-utils'

import { mockActivityApCompatibilityTable } from '../__tests__/fixtures'

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
    let desc = ''
    render(
      <Provider>
        <ActivityApCompatibilityTable
          requestId={requestId}
          updateActivityDesc={(description) => {
            mockUpdateStatus()
            desc = description
          }} />
      </Provider>,
      { route: { params } })

    const { totalCount, impactedCount } = mockActivityApCompatibilityTable
    const compatibiliyCount = impactedCount - totalCount
    const percent = Math.round(compatibiliyCount / impactedCount * 100 )
    const expectDesc = `(${compatibiliyCount} / ${impactedCount} devices, ${percent}%)`
    const element = await screen.findByText('AP-1')
    expect(element).toBeInTheDocument()
    expect(await screen.findByText('AP-10')).toBeInTheDocument()
    expect(await screen.findByText(`Total: ${totalCount}`)).toBeInTheDocument()
    const showBtn = await screen.findByTestId('showBtn')
    expect(showBtn).toBeVisible()
    await userEvent.click(showBtn)
    expect(element).not.toBeInTheDocument()
    await userEvent.click(showBtn)
    expect(await screen.findByText('AP-1')).toBeInTheDocument()
    await waitFor(() => {
      expect(mockUpdateStatus).toBeCalled()
    })
    await waitFor(() => {
      expect(desc).toEqual(expectDesc)
    })
  })
})
