import { useState } from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider  }      from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  within
} from '@acx-ui/test-utils'

import BasicInformationPage from './BasicInformationPage'
import Congratulations      from './Congratulations'
import VerticalPage         from './VerticalPage'
import WelcomePage          from './WelcomePage'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('VerticalPage', () => {
  const VerticalPageWrapper = () => {
    const [selectedType, setSelectedType] = useState('' as string)
    return (
      <Provider>
        <Form>
          <VerticalPage selectedType={selectedType} setSelectedType={setSelectedType} />
        </Form>
      </Provider>
    )
  }

  it('should display vertical page correctly', async () => {
    render(
      <VerticalPageWrapper />)
    expect(await screen.findByText('School')).toBeVisible()
    await userEvent.click(await screen.findByText('School'))
    const othersButton = screen.getByText(/others/i)
    await userEvent.click(othersButton)
    within(othersButton).getByRole('textbox')
  })
})

describe('Congratulations', () => {
  const params = { tenantId: 'tenant-id' }
  jest.mock('@acx-ui/user', () => ({
    ...jest.requireActual('@acx-ui/user'),
    useUserProfileContext: () => ({ data: { lastName: 'last-name', firstName: 'first-name' } })
  }))

  it('should display congratulations page and click network link correctly', async () => {
    const mockCloseModal = jest.fn()
    render(
      <Provider>
        <Form>
          <Congratulations
            configResponse={{ vlan: [] }}
            closeModal={() => {mockCloseModal()}} />
        </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('You have finished onboarding your new Venue!')).toBeVisible()

    await userEvent.click(await screen.findByTestId('network-link'))
    expect(mockCloseModal).toBeCalled()
  })

  it('should display congratulations page and click wired link correctly', async () => {
    const mockCloseModal = jest.fn()
    render(
      <Provider>
        <Form>
          <Congratulations
            configResponse={{ vlan: [{ vlanId: 1 }] }}
            closeModal={() => {mockCloseModal()}} />
        </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('You have finished onboarding your new Venue!')).toBeVisible()

    await userEvent.click(await screen.findByTestId('wired-link'))
    expect(mockCloseModal).toBeCalled()
  })
})

describe('WelcomePage', () => {
  it('should display Welcome page correctly', async () => {
    render(
      <Provider>
        <Form>
          <WelcomePage startOnboardingAssistant={()=>{}} goChatCanvas={()=>{}} />
        </Form>
      </Provider>)
    expect(screen.getByText('About')).toBeInTheDocument()
    // eslint-disable-next-line max-len
    expect(screen.getByText('Onboarding Assistant automates and optimizes complex network onboarding processes, leading to increased efficiency and productivity.')).toBeInTheDocument()
  })
  it('should display new Welcome page correctly', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.CANVAS)
    const mockedStart = jest.fn()
    const mockedUsedNavigate = jest.fn()
    render(
      <Provider>
        <Form>
          <WelcomePage startOnboardingAssistant={mockedStart} goChatCanvas={mockedUsedNavigate} />
        </Form>
      </Provider>)
    const chatCanvasCard = screen.getByTestId('AIChat')
    await userEvent.click(chatCanvasCard)
    expect(mockedUsedNavigate).toBeCalled()

    const onboardingCard = screen.getByTestId('OnboardingDog')
    await userEvent.click(onboardingCard)
    expect(mockedStart).toBeCalled()
  })
})

describe('BasicInfomrationPage', () => {
  it('should display Basic Information page correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json({ data: [{ name: 'venue1' }] }))
      )
    )

    render(
      <Provider>
        <Form>
          <BasicInformationPage />
        </Form>
      </Provider>)
    expect(await screen.findByText('Tell me more about the deployment')).toBeVisible()

    const venueName = screen.getByRole('textbox', {
      name: /venue name/i
    })
    await userEvent.type(venueName, 'venue1')
    venueName.blur()
    expect(await screen.findByText('Venue with that name already exists')).toBeInTheDocument()
    await userEvent.type(venueName, 'ruckus-1')

    const apNumber = screen.getByRole('textbox', {
      name: /approx\. number of aps/i
    })
    await userEvent.type(apNumber, 'abc')
    expect(await screen.findByText('Please enter a valid number.')).toBeVisible()
    await userEvent.type(apNumber, '1')

    const switchNumber = screen.getByRole('textbox', {
      name: /approx\. number of switches/i
    })
    await userEvent.type(switchNumber, 'abc')
    expect(await screen.findByText('Please enter a valid number.')).toBeVisible()
    await userEvent.type(switchNumber, '1')

    const description = screen.getByRole('textbox', {
      name: /tell me more about the deployment/i
    })
    await userEvent.type(description, 'Hello')


  })
})
