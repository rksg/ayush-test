import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { apApi }                                                from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo }                         from '@acx-ui/rc/utils'
import { Provider, store }                                      from '@acx-ui/store'
import { logDOM, mockRestApiQuery, mockServer, render, screen } from '@acx-ui/test-utils'
import { RolesEnum }                                            from '@acx-ui/types'
import { getUserProfile, setUserProfile }                       from '@acx-ui/user'

import { apDetailData } from './__tests__/fixtures'
import { activities }   from './ApTimelineTab/__tests__/fixtures'

import ApDetails from '.'

jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid={'analytics-RangePicker'} title='RangePicker' />
}))
jest.mock('@acx-ui/analytics/components', () => {
  const sets = Object.keys(jest.requireActual('@acx-ui/analytics/components'))
    .map(key => [key, () => <div data-testid={`analytics-${key}`} title={key} />])
  return Object.fromEntries(sets)
})

jest.mock('@acx-ui/reports/components', () => ({
  ...jest.requireActual('@acx-ui/reports/components'),
  EmbeddedReport: () => <div data-testid={'some-report-id'} id='acx-report' />
}))


describe('ApDetails', () => {
  // beforeEach(() => {
  //   store.dispatch(apApi.util.resetApiState())
  //   mockRestApiQuery(CommonUrlsInfo.getActivityList.url, 'post', activities)
  //   mockServer.use(
  //     rest.get(WifiUrlsInfo.getAp.url.replace('?operational=false', ''),
  //       (_, res, ctx) => res(ctx.json({}))
  //     ),
  //     rest.post(
  //       CommonUrlsInfo.getApsList.url,
  //       (_, res, ctx) => res(ctx.json(list))
  //     ),
  //     rest.get(CommonUrlsInfo.getApDetailHeader.url,
  //       (_, res, ctx) => res(ctx.json(apDetailData))),
  //     rest.patch(
  //       WifiUrlsInfo.detectApNeighbors.url,
  //       (req, res, ctx) => res(ctx.json({ requestId: '123456789' }))
  //     )
  //   )
  // })

  // it('should render correctly', async () => {
  //   const params = {
  //     apId: 'ap-id'
  //   }
  //   render(<Provider><ApDetails /></Provider>, {
  //     route: { params, path: '/wifi/:apId/details/reports' }
  //   })

  //   expect(await screen.findByText('Overview')).toBeVisible()
  //   expect(await screen.findAllByRole('tab')).toHaveLength(6)
  // })

  it('should render correctly', async () => {
    const params = {
      apId: 'ap-id'
    }
    const { container }= render(<Provider><ApDetails /></Provider>, {
      route: { params, path: '/wifi/:apId/details/reports' }
    })
    // eslint-disable-next-line testing-library/no-debugging-utils
    screen.logTestingPlaygroundURL(container)
    expect(screen.getByRole('heading', { name: /ap\-id/i }).textContent)
      .toEqual('ap-id')
  })

})
