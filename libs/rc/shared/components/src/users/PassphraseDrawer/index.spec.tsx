import React from 'react'

import { waitFor } from '@testing-library/react'
import { rest }    from 'msw'

import { Persona, PersonaUrls }                  from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent, mockServer } from '@acx-ui/test-utils'

import { PassphraseDrawer } from './index'


describe('PassphraseDrawer', () => {
  const mockUpdatePersona = jest.fn().mockResolvedValue({})
  const mockPersona: Persona = {
    name: '', revoked: false,
    id: '1',
    groupId: 'group-1',
    dpskPassphrase: 'initial-passphrase'
  }
  beforeEach( async () => {
    mockServer.use(
      rest.patch(
        PersonaUrls.updatePersona.url,
        (req, res, ctx) => {
          mockUpdatePersona({ params: req.params, payload: req.body })
          return res(ctx.json({}))
        }
      )
    )
  })

  const setup = (props = {}) => {
    const onClose = jest.fn()
    const utils = render(
      <Provider>
        <PassphraseDrawer
          persona={mockPersona}
          visible={true}
          onClose={onClose}
          {...props}
        />
      </Provider>
    )
    const passphraseInput = screen.getByLabelText(/Passphrase/i) as HTMLInputElement
    const saveButton = screen.getByText(/Save/i)
    const cancelButton = screen.getByText(/Cancel/i)
    return {
      passphraseInput,
      saveButton,
      cancelButton,
      onClose,
      ...utils
    }
  }

  it('renders correctly', () => {
    const { passphraseInput } = setup()
    expect(passphraseInput.value).toBe('initial-passphrase')
  })

  it('calls onClose when cancel button is clicked', () => {
    const { cancelButton, onClose } = setup()
    fireEvent.click(cancelButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('calls updatePersona with the correct payload when save button is clicked', async () => {
    const { passphraseInput, saveButton, onClose } = setup()
    fireEvent.change(passphraseInput, { target: { value: 'new-passphrase' } })
    fireEvent.click(saveButton)

    await waitFor(() => expect(mockUpdatePersona).toHaveBeenCalledWith({
      params: { groupId: mockPersona.groupId, id: mockPersona.id },
      payload: { dpskPassphrase: 'new-passphrase' }
    }))
    await screen.findByText(/Change Passphrase/i) // Wait for the component to re-render
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })
})
