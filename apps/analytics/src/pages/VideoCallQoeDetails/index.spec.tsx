import { Provider, videoCallQoeURL }                                   from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { callQoeTestDetailsFixtures1, callQoeTestDetailsFixtures2, callQoeTestDetailsFixtures3, callQoeTestDetailsFixtures4 } from '../VideoCallQoe/__tests__/fixtures'

import { VideoCallQoeDetails } from '.'

describe('VideoCallQoe Details Page',()=>{
  const params = {
    tenantId: 'tenant-id'
  }
  it('render the page properly',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('render the page properly having bad/average quality',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures2 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('render the page properly when mos is null',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures4 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
  it('render the page properly when call stats are null',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures3 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })
})