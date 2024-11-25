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


const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))


describe('VerticalPage', () => {
  it('should display vertical page correctly', async () => {
    render(
      <Provider>
        <Form>
          <VerticalPage />
        </Form>
      </Provider>)
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
          <WelcomePage />
        </Form>
      </Provider>)
    expect(await screen.findByText('Your personal onboarding assistant')).toBeVisible()
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
