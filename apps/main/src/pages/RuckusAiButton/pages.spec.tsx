import { Form } from 'antd'

import { Provider  } from '@acx-ui/store'
import {
  render,
  screen
} from '@acx-ui/test-utils'

import BasicInformationPage from './BasicInformationPage'
import Congratulations      from './Congratulations'
import VerticalPage         from './VerticalPage'
import WelcomePage          from './WelcomePage'

describe('VerticalPage', () => {
  it('should display vertical page correctly', async () => {
    render(
      <Provider>
        <Form>
          <VerticalPage />
        </Form>
      </Provider>)
    expect(await screen.findByText('School')).toBeVisible()
  })
})

describe('Congratulations', () => {
  const params = { tenantId: 'tenant-id' }
  jest.mock('@acx-ui/user', () => ({
    ...jest.requireActual('@acx-ui/user'),
    useUserProfileContext: () => ({ data: { lastName: 'last-name', firstName: 'first-name' } })
  }))

  const mockedUsedNavigate = jest.fn()
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate
  }))

  it('should display congratulations page correctly', async () => {
    render(
      <Provider>
        <Form>
          <Congratulations
            closeModal={() => { }} />
        </Form>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText('You have finished onboarding your new Venue!')).toBeVisible()
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
    render(
      <Provider>
        <Form>
          <BasicInformationPage />
        </Form>
      </Provider>)
    expect(await screen.findByText('Tell me more about the deployment')).toBeVisible()
  })
})