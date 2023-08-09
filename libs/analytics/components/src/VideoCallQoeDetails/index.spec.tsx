/* eslint-disable testing-library/no-node-access */
import userEvent from '@testing-library/user-event'

import { useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { Provider, dataApiSearchURL, store, r1VideoCallQoeURL } from '@acx-ui/store'
import {
  mockGraphqlMutation,
  mockGraphqlQuery, render, screen, waitFor,
  waitForElementToBeRemoved
} from '@acx-ui/test-utils'

import {
  callQoeTestDetailsFixtures1,
  callQoeTestDetailsFixtures2,
  callQoeTestDetailsFixtures3,
  callQoeTestDetailsFixtures4,
  searchClientsFixture } from '../VideoCallQoe/__tests__/fixtures'
import { clientSearchApi } from '../VideoCallQoe/services'

import { VideoCallQoeDetails } from '.'

describe('VideoCallQoe Details Page', () => {
  const params = {
    tenantId: 'tenant-id'
  }
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(clientSearchApi.util.resetApiState())
    mockGraphqlQuery(dataApiSearchURL, 'Search', {
      data: searchClientsFixture
    })
  })
  it('render the page properly', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })

    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('render the page properly having bad/average quality', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures2 })

    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('render the page properly without client MAC', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures3 })

    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('should open drawer for client mac serach while click on edit icon', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    mockGraphqlMutation(r1VideoCallQoeURL, 'UpdateCallQoeParticipant',
      { data: { updateCallQoeParticipant: 1 } })

    render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByTestId('EditOutlinedIcon'))
    await screen.findByText('A8:64:F1:1A:D0:33')
    const radioButtons = screen.getAllByRole('radio')
    await userEvent.click(radioButtons[2])
    await screen.findByText('1 selected')
    await userEvent.click(screen.getByText('Select'))
    await waitForElementToBeRemoved(() => screen.queryByText('Select'))
  })
  it('should close client mac search drawer while click on cancel button', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByTestId('EditOutlinedIcon'))
    await screen.findByText('Select Client MAC')
    await screen.findByText('A8:64:F1:1A:D0:33')
    const radioButtons = screen.getAllByRole('radio')
    await userEvent.click(radioButtons[2])
    await screen.findByText('1 selected')
    await userEvent.click(screen.getByTitle('Clear selection'))
    await userEvent.click(radioButtons[3])
    await userEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })
  })
  it('should search the client', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    mockGraphqlMutation(r1VideoCallQoeURL, 'UpdateCallQoeParticipant',
      { data: { updateCallQoeParticipant: 1 } })

    render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByTestId('EditOutlinedIcon'))
    const searchInput = await screen.findByPlaceholderText(/search by mac, username or hostname/i)
    await userEvent.type(searchInput, 'DPSK_User_8709')
    await waitFor(() => {
      expect(screen.queryByRole('img', { name: 'loader' })).toBeVisible()
    })
    expect(await screen.findByText('A8:64:F1:1A:D0:33')).toBeVisible()
  })
  it('render the page properly when call stats are null', async () => {
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures4 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node: Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('should handle when feature flag NAVBAR_ENHANCEMENT is off', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    mockGraphqlQuery(r1VideoCallQoeURL, 'CallQoeTestDetails', { data: callQoeTestDetailsFixtures1 })
    render(<VideoCallQoeDetails />, {
      wrapper: Provider, route: { params } })
    await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
    expect(screen.queryByText('AI Assurance')).toBeNull()
    expect(screen.queryByText('Network Assurance')).toBeNull()
  })
})
