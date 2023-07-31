import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                from '@acx-ui/feature-toggle'
import { r1VideoCallQoeURL, Provider } from '@acx-ui/store'
import {
  mockGraphqlQuery,
  mockGraphqlMutation,
  render,
  screen,
  waitForElementToBeRemoved
}                              from '@acx-ui/test-utils'

import * as fixtures         from './__tests__/fixtures'
import { VideoCallQoeTable } from './VideoCallQoeTable'

describe('VideoCallQoe Table', () => {
  const params = {
    tenantId: 'tenant-id'
  }

  it('should render table', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests',
      { data: fixtures.getAllCallQoeTests })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeTable />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    expect(asFragment()).toMatchSnapshot()
  })

  it('should render no data when no data is returned', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests',
      { data: fixtures.getAllCallQoeTests.noData })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeTable />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(asFragment()).toMatchSnapshot()
  })

  it('should open the drawer for the not started test call', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests',
      { data: fixtures.getAllCallQoeTestsWithNotStarted })
    render(
      <Provider>
        <VideoCallQoeTable />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByText(/test 1\.4/i))
    expect(screen.getByText(/call details/i)).toBeVisible()
    expect(screen.getByRole('link',
      { name: /https:\/\/zoom\.us\/j\/94194732704\?pwd=qmnpmc9qavvimgzwtjerzmpjdgm5qt09/i })
    ).toBeVisible()

    await userEvent.click(screen.getByRole('button', { name: /close/i }))
  })

  it('should delete test call', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlMutation(r1VideoCallQoeURL, 'DeleteVideoCallQoeTest',
      { data: fixtures.deleteTestResponse })
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests',
      { data: fixtures.getAllCallQoeTests })
    render(
      <Provider>
        <VideoCallQoeTable />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByText(/delete test call/i))
    expect(await screen.findByText('Test call deleted successfully')).toBeVisible()
  })

  it('should not delete test call', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockGraphqlMutation(r1VideoCallQoeURL, 'DeleteVideoCallQoeTest',
      { data: fixtures.deleteTestFailedResponse })
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTests',
      { data: fixtures.getAllCallQoeTests })
    render(
      <Provider>
        <VideoCallQoeTable />
      </Provider>, {
        route: { params }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    await userEvent.click(await screen.findByText(/delete test call/i))
    expect(await screen.findByText('Unable to delete test call. Try again later'))
      .toBeVisible()
  })
})
