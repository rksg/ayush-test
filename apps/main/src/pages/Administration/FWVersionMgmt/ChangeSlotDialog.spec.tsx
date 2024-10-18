import userEvent from '@testing-library/user-event'

import { Provider }       from '@acx-ui/store'
import { render, screen } from '@acx-ui/test-utils'

import { ChangeSlotDialog } from './ChangeSlotDialog'

const mockOnCancel = jest.fn()
const mockOnSubmit = jest.fn()

describe('ChangeSlotDialog', () => {
  beforeEach(() => {
    mockOnCancel.mockClear()
    mockOnSubmit.mockClear()
  })

  it('should render correctly', async () => {
    render (
      <Provider>
        <ChangeSlotDialog
          onCancel={mockOnCancel}
          onSubmit={mockOnSubmit}
          days={['Sunday', 'Saturday']}
          times={['12 AM - 02 AM', '02 AM - 04 AM']} />
      </Provider>
    )

    expect(await screen.findByText('Change preferred update slot')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(mockOnCancel).toBeCalled()

    const saveBtn = screen.getByRole('button', { name: 'Save' })
    expect(saveBtn).toBeDisabled()

    const [dayCombox, timeCombox] = await screen.findAllByRole('combobox')

    await userEvent.click(dayCombox) // open multi select
    await userEvent.click(await screen.findByTitle('Monday')) // select another
    await userEvent.click(dayCombox) // close multi select

    const dayOptions = await screen.findAllByTitle('Monday') // unselect
    expect(dayOptions.length).toBe(2)
    await userEvent.click(dayCombox) // open multi select
    await userEvent.click(dayOptions[1])
    await userEvent.click(dayCombox) // close multi select

    await userEvent.click(timeCombox) // open multi select
    await userEvent.click(await screen.findByTitle('04 AM - 06 AM')) // select another
    await userEvent.click(timeCombox) // close multi select

    const timeOptions = await screen.findAllByTitle('04 AM - 06 AM')
    expect(timeOptions.length).toBe(2)
    await userEvent.click(timeCombox) // open multi select
    await userEvent.click(timeOptions[1]) // unselect
    await userEvent.click(timeCombox) // close multi select

    expect(saveBtn).toBeEnabled() // become dirty
    await userEvent.click(saveBtn)
    expect(mockOnSubmit).toBeCalled()
  })

})