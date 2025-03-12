import userEvent from '@testing-library/user-event'

import { render, screen } from '@acx-ui/test-utils'

import { SelectPersonaDrawer } from './SelectPersonaDrawer'

const expectedSelectedPersona = { id: 'test-persona' }

jest.mock('../PersonaTable/BasePersonaTable', () => ({
  BasePersonaTable: jest.fn(({ onChange }) => (
    <div data-testid='mock-base-persona-table' onClick={() => onChange(expectedSelectedPersona)}>
      BasePersonaTable Component
    </div>
  ))
}))

describe('SelectPersonaDrawer', () => {

  const renderComponent = (props = {}) => {
    return render(<SelectPersonaDrawer {...props} />)
  }

  it('Renders correctly with default props', () => {
    renderComponent()

    expect(screen.getByText('Select Identity')).toBeInTheDocument()
    expect(screen.getByText('BasePersonaTable Component')).toBeInTheDocument()
    expect(screen.getByText('Add')).toBeInTheDocument()
  })

  it('Renders "Change" button label when identityId is provided', () => {
    renderComponent({ identityId: '123' })

    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  it('Calls onSubmit with selectedPersona when save button is clicked', async () => {
    const onChange = jest.fn()
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    renderComponent({ onChange, onSubmit, onCancel })

    await userEvent.click(screen.getByTestId('mock-base-persona-table'))  // trigger onChange to update state

    await userEvent.click(screen.getByText('Add'))
    expect(onSubmit).toHaveBeenCalledWith(expectedSelectedPersona)

    await userEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })
})
