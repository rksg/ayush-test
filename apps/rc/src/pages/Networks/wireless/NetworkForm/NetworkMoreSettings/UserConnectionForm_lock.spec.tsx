import '@testing-library/jest-dom'


import userEvent from '@testing-library/user-event'


import { StepsForm }      from '@acx-ui/components'
import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import {
  mockGuestMoreDataDaysLockEnable,
  mockGuestMoreDataLockEnable,
  mockGuestMoreDataMinutesLockEnable
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import { UserConnectionForm } from './UserConnectionForm'



describe('UserConnectionForm', () => {
  it('should render user connection form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider><NetworkFormContext.Provider
        value={{
          editMode: true, cloneMode: true, data: mockGuestMoreDataLockEnable
        }}>
        <StepsForm><StepsForm.StepForm>
          <UserConnectionForm /></StepsForm.StepForm>
        </StepsForm></NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      })
    expect(await screen.findByText(/User Connection Settings/i)).toBeVisible()
    const spins = await screen.findAllByRole('spinbutton')
    await userEvent.click((await screen.findAllByTitle('Hours'))[0])
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.type(spins[0], '440')
    // await userEvent.click((await screen.findAllByTitle('Hours'))[2])
    // await userEvent.click((await screen.findAllByTitle('Days'))[1])
    await userEvent.click(await screen.findByText('Finish'))
  })

  it('should render user connection minutes form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider><NetworkFormContext.Provider
        value={{
          editMode: true, cloneMode: true, data: mockGuestMoreDataMinutesLockEnable
        }}>
        <StepsForm><StepsForm.StepForm>
          <UserConnectionForm /></StepsForm.StepForm>
        </StepsForm></NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      })
    const spins = await screen.findAllByRole('spinbutton')
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.click((await screen.findAllByTitle('Hours'))[0])
    await userEvent.click((await screen.findAllByTitle('Minutes'))[2])
    await userEvent.click((await screen.findAllByTitle('Hours'))[2])
    await userEvent.click(await screen.findByText('Finish'))
    await userEvent.type(spins[0], '4')
    await userEvent.type(spins[1], '4')
    await userEvent.click((await screen.findAllByTitle('Hours'))[0])
  })
  it('should render user connection days form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider><NetworkFormContext.Provider
        value={{
          editMode: false, cloneMode: true, data: mockGuestMoreDataDaysLockEnable
        }}>
        <StepsForm><StepsForm.StepForm>
          <UserConnectionForm /></StepsForm.StepForm>
        </StepsForm></NetworkFormContext.Provider>
      </Provider>, {
        route: { params }
      })
    const spins = await screen.findAllByRole('spinbutton')
    await userEvent.type(spins[0], '4')
    await userEvent.click((await screen.findAllByTitle('Hours'))[0])
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.type(spins[0], '4')
    await userEvent.click((await screen.findAllByTitle('Minutes'))[0])
    await userEvent.click(await screen.findByText('Finish'))
  })
})
