import React from 'react'

import userEvent        from '@testing-library/user-event'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'
import '@testing-library/jest-dom'

import { SwitchUrlsInfo }                      from '@acx-ui/rc/utils'
import { Provider }                            from '@acx-ui/store'
import { mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import { LldpTlvDrawer } from './LldpTlvDrawer'

const lldpTlv = {
  id: '7d3a416c-6e73-4dde-8242-299649a16a9c',
  systemName: 'Test System',
  nameMatchingType: 'EXACT',
  systemDescription: 'Test Description',
  descMatchingType: 'CONTAINS'
}

describe('LldpTlvDrawer', () => {
  const mockClose = jest.fn()

  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.addSwitchPortProfileLldpTlv.url, (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.put(SwitchUrlsInfo.editSwitchPortProfileLldpTlv.url, (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.post(SwitchUrlsInfo.getSwitchPortProfileLldpTlvsList.url, (req, res, ctx) => {
        return res(ctx.json({ data: [lldpTlv] }))
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
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )
    expect(screen.getByText(/Add LLDP TLV/)).toBeInTheDocument()
  })

  it('submits the drawer successfully when adding a new LLDP TLV', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )
    const systemNameInput = await screen.findByLabelText(/System Name/)
    const systemDescriptionInput = await screen.findByLabelText(/System Description/)
    const radio = await screen.findAllByRole('radio')
    await userEvent.click(radio[0])
    await userEvent.click(radio[3])
    const saveButton = await screen.findByRole('button', { name: /Add/ })

    await userEvent.type(systemNameInput, 'Test System 1')
    await userEvent.type(systemDescriptionInput, 'Test Description 1')
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled()
    })
  })

  it('renders the drawer with edit data', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={true} editData={lldpTlv} />
        </IntlProvider>
      </Provider>
    )

    const systemNameInput = await screen.findByLabelText(/System Name/)
    const systemDescriptionInput = await screen.findByLabelText(/System Description/)

    expect(systemNameInput).toHaveValue(lldpTlv.systemName)
    expect(systemDescriptionInput).toHaveValue(lldpTlv.systemDescription)

    const saveButton = await screen.findByRole('button', { name: /Apply/ })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled()
    })
  })

  it('should cancel the drawer successfully', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )
    const cancelButton = await screen.findByText('Cancel')
    expect(cancelButton).toBeInTheDocument()
    await userEvent.click(cancelButton)

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled()
    })
  })

  it('validates system name for duplicates', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={false} />
        </IntlProvider>
      </Provider>
    )
    const systemNameInput = await screen.findByLabelText(/System Name/)
    await userEvent.type(systemNameInput, 'Test System')
    systemNameInput.blur()

    await waitFor(() => {
      expect(screen.queryByText('LLDP TLV already exists')).not.toBeInTheDocument()
    })
  })

  it('handles different matching types', async () => {
    render(
      <Provider>
        <IntlProvider locale='en'>
          <LldpTlvDrawer visible={true} setVisible={mockClose} isEdit={true} editData={lldpTlv} />
        </IntlProvider>
      </Provider>
    )
    const nameMatchingTypeRadio = await screen.findAllByLabelText('Begin with')
    await userEvent.click(nameMatchingTypeRadio[0])

    const descMatchingTypeRadio = await screen.findAllByLabelText('Exact')
    await userEvent.click(descMatchingTypeRadio[1])

    const saveButton = await screen.findByRole('button', { name: /Apply/ })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled()
    })
  })
})