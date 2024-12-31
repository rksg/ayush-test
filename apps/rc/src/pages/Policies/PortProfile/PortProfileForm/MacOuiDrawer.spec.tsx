import React from 'react'

import '@testing-library/jest-dom'

import userEvent        from '@testing-library/user-event'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'

import { SwitchUrlsInfo }                                                            from '@acx-ui/rc/utils'
import { Provider }                                                                  from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { MacOuiDrawer } from './MacOuiDrawer'

const macOui = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  oui: 'aa:bb:cc',
  note: 'Test Note'
}

describe('MacOuiDrawer', () => {
  const mockClose = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchPortProfileMacOui.url, (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.put(SwitchUrlsInfo.editSwitchPortProfileMacOui.url, (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.post(SwitchUrlsInfo.getSwitchPortProfileMacOuisList.url, (req, res, ctx) => {
        return res(ctx.json({ data: [macOui] }))
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <MacOuiDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )

    expect(screen.getByText(/Add MAC OUI/)).toBeInTheDocument()
  })

  it('submits the drawer successfully when adding a new MAC OUI', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <MacOuiDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )

    const ouiInput = await screen.findByLabelText(/MAC OUI/)
    const noteInput = await screen.findByLabelText(/Note/)
    const saveButton = await screen.findByRole('button', { name: /Add/ })

    await userEvent.type(ouiInput, 'aa:bb:dd')
    ouiInput.focus()
    ouiInput.blur()
    const validating1 = await screen.findByRole('img', { name: 'loading' })
    await waitForElementToBeRemoved(validating1)
    await userEvent.type(noteInput, 'Test Note')
    fireEvent.click(saveButton)

    await waitFor(()=>{
      expect(mockClose).toHaveBeenLastCalledWith(false)
    })
  })

  it('renders the drawer with edit data', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <MacOuiDrawer
            visible={true}
            setVisible={mockClose}
            isEdit={true}
            editData={macOui}
          />
        </IntlProvider>
      </Provider>
    )

    const ouiInput = await screen.findByLabelText(/MAC OUI/)
    const noteInput = await screen.findByLabelText(/Note/)

    expect(ouiInput).toHaveValue(macOui.oui)
    expect(noteInput).toHaveValue(macOui.note)

    const saveButton = screen.getByRole('button', { name: /Apply/ })
    await userEvent.click(saveButton)

    await waitFor(()=>{
      expect(mockClose).toHaveBeenLastCalledWith(false)
    })
  })

  it('should cancel the drawer successfully', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <MacOuiDrawer
            visible={true}
            setVisible={mockClose}
            isEdit={true}
            editData={macOui}
          />
        </IntlProvider>
      </Provider>
    )

    const cancelButton = screen.getByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(cancelButton)
    expect(mockClose).toHaveBeenCalled()
  })
})