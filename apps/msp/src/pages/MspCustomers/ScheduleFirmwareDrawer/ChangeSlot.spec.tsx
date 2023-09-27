import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { Provider }                from '@acx-ui/store'
import { render, screen, waitFor } from '@acx-ui/test-utils'

import ChangeSlot from './ChangeSlot'

describe('ChangeSlot', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should render correctly if no date or times given', async () => {
    render(
      <Provider>
        <ChangeSlot
          visible={true}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Scheduled Days')).toBeVisible()
    expect(screen.getByText('Scheduled Time Slots')).toBeVisible()

    expect(screen.getByText('Selected 2 days')).toBeVisible()
    expect(screen.getByText('Selected 3 time slots')).toBeVisible()

    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.queryByText('Saturday')).toBeNull()
    expect(screen.queryByText('12 AM - 02 AM')).toBeNull()
  })
  it('should render correctly when date and times given', async () => {
    render(
      <Provider>
        <ChangeSlot
          visible={true}
          days={['Monday', 'Tuesday']}
          times={['02 AM - 04 AM', '04 AM - 06 AM']}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })
    expect(screen.getByText('Scheduled Days')).toBeVisible()
    expect(screen.getByText('Scheduled Time Slots')).toBeVisible()

    expect(screen.queryByText('Selected 2 days')).toBeNull()
    expect(screen.queryByText('Selected 3 time slots')).toBeNull()

    expect(screen.getByText('Monday')).toBeVisible()
    expect(screen.getByText('Tuesday')).toBeVisible()
    expect(screen.getByText('02 AM - 04 AM')).toBeVisible()
    expect(screen.getByText('04 AM - 06 AM')).toBeVisible()
  })
  it('should work correctly when days selected is changed', async () => {
    render(
      <Provider>
        <ChangeSlot
          visible={true}
          days={['Monday']}
          times={['02 AM - 04 AM', '04 AM - 06 AM']}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const inputs = screen.getAllByRole('combobox')
    expect(inputs).toHaveLength(2)
    await userEvent.click(inputs[0])
    await userEvent.click(inputs[0])
    const sundays = await screen.findAllByText('Sunday')

    // Assert option is added to selected list
    await userEvent.click(sundays[1])
    await waitFor(() => {
      expect(screen.getAllByText('Sunday')).toHaveLength(3)
    })

    // Assert no more options are able to be selected after max 2 selected
    await userEvent.click(screen.getByText('Tuesday'))
    await waitFor(() => {
      expect(screen.getAllByText('Tuesday')).toHaveLength(1)
    })

    // fireEvent.change(inputs[0], { target: { value: ['Monday'] } })
    // await waitFor(() => {
    //   expect(screen.getAllByText('Sunday')).toHaveLength(1)
    // })
  })
  it('should work correctly when time slots selected is changed', async () => {
    render(
      <Provider>
        <ChangeSlot
          visible={true}
          days={['Monday']}
          times={['02 AM - 04 AM', '04 AM - 06 AM']}
        />
      </Provider>, {
        route: { params, path: '/:tenantId/v/dashboard/mspCustomers' }
      })

    const inputs = screen.getAllByRole('combobox')
    expect(inputs).toHaveLength(2)
    await userEvent.click(inputs[1])
    await userEvent.click(inputs[1])
    const slot = await screen.findByText('06 AM - 08 AM')

    // Assert option is added to selected list
    await userEvent.click(slot)
    await waitFor(() => {
      expect(screen.getAllByText('06 AM - 08 AM')).toHaveLength(2)
    })

    // Assert no more options are able to be selected after max 2 selected
    await userEvent.click(screen.getByText('08 AM - 10 AM'))
    await waitFor(() => {
      expect(screen.getAllByText('08 AM - 10 AM')).toHaveLength(1)
    })
  })
})
