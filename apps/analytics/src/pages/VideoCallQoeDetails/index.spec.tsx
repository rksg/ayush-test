/* eslint-disable testing-library/no-node-access */
import userEvent from '@testing-library/user-event'

import { Provider, videoCallQoeURL }                                                        from '@acx-ui/store'
import { mockGraphqlMutation, mockGraphqlQuery, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

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
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
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
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('render the page properly without client MAC',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures3 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
  it('should open drawer for client mac serach while click on edit icon',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    mockGraphqlMutation(videoCallQoeURL, 'UpdateCallQoeParticipant',
      { data: { updateCallQoeParticipant: 1 } })
    render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByTestId('EditOutlinedIcon'))
    await screen.findByText('Select Client MAC')
    await screen.findByText('0a:0f:36:f5:51:e8')
    const radioButtons=screen.getAllByRole('radio')
    // submit without selecting client mac
    await userEvent.click(screen.getByText('Select'))
    await userEvent.click(radioButtons[2])
    await screen.findByText('1 selected')
    await userEvent.click(screen.getByText('Select'))
    await waitForElementToBeRemoved(() => screen.queryByText('Select'))
  })
  it('should close client mac search drawer while click on cancel button',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures1 })
    render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await userEvent.click(screen.getByTestId('EditOutlinedIcon'))
    await screen.findByText('Select Client MAC')
    await screen.findByText('0a:0f:36:f5:51:e8')
    const radioButtons=screen.getAllByRole('radio')
    await userEvent.click(radioButtons[2])
    await screen.findByText('1 selected')
    await userEvent.click(screen.getByTitle('Clear selection'))
    await userEvent.click(radioButtons[3])
    await userEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
  })
  it('render the page properly when call stats are null',async ()=>{
    mockGraphqlQuery(videoCallQoeURL, 'CallQoeTestDetails',
      { data: callQoeTestDetailsFixtures4 })
    const { asFragment } = render(
      <Provider>
        <VideoCallQoeDetails />
      </Provider>, {
        route: { params }
      })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const fragment = asFragment()
    fragment.querySelectorAll('div[_echarts_instance_^="ec_"]')
      .forEach((node:Element) => node.setAttribute('_echarts_instance_', 'ec_mock'))
    expect(fragment).toMatchSnapshot()
  })
})
