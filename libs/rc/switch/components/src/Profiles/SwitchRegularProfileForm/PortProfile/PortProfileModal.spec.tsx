import '@testing-library/jest-dom'

import userEvent        from '@testing-library/user-event'
import { Modal }        from 'antd'
import { rest }         from 'msw'
import { IntlProvider } from 'react-intl'

import { PortProfileUI, SwitchUrlsInfo }      from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, fireEvent, waitFor } from '@acx-ui/test-utils'
import { mockServer }                         from '@acx-ui/test-utils'

import PortProfileContext   from './PortProfileContext'
import { PortProfileModal } from './PortProfileModal'

const portProfileList = {
  data: [
    {
      id: 'port1',
      name: 'Port Profile 1'
    },
    {
      id: 'port2',
      name: 'Port Profile 2'

    }
  ],
  fields: [
    'id'
  ],
  page: 1,
  totalCount: 8,
  totalPages: 1
}

describe('PortProfileModal', () => {
  afterEach(() => {
    Modal.destroyAll()
  })

  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url,
        (_, res, ctx) => res(ctx.json(portProfileList))
      )
    )
  })

  it('should render correctly', async () => {
    const onSave = jest.fn()
    const onCancel = jest.fn()

    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileModal
            visible={true}
            onSave={onSave}
            onCancel={onCancel}
          />
        </Provider>
      </IntlProvider>
    )

    await screen.findByText(/Add Port Profile/i)
    expect(await screen.findByTestId('PortProfileModal')).toBeInTheDocument()

    // Test cancel functionality
    await userEvent.click(await screen.findByRole('button', { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('should handle form submission', async () => {
    const onSave = jest.fn()

    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileContext.Provider value={{
            portProfileList: [],
            setPortProfileSettingValues: jest.fn()
          }}>
            <PortProfileModal
              visible={true}
              onSave={onSave}
            />
          </PortProfileContext.Provider>
        </Provider>
      </IntlProvider>
    )

    // Simulate selecting a model and ports
    await userEvent.click(await screen.findByText('ICX-7550'))
    await userEvent.click(await screen.findByTestId('ICX7550-24'))
    await userEvent.click(await screen.findByRole('button', { name: /Next/i }))

    // Simulate selecting ports
    fireEvent.change(await screen.findByRole('combobox'), {
      target: { value: 'port1' }
    })

    await userEvent.click(await screen.findByRole('button', { name: /Add/i }))
  })


  it('should handle family model checked', async () => {
    const onSave = jest.fn()

    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileModal
            visible={true}
            onSave={onSave}
          />
        </Provider>
      </IntlProvider>
    )

    // Simulate selecting a model and ports
    await userEvent.click(await screen.findByTestId('family-checkbox-ICX7650'))
    expect(await screen.findByTestId('family-checkbox-ICX7650')).toBeChecked()
    expect(await screen.findByTestId('ICX7650-48P')).toBeChecked()
    expect(await screen.findByTestId('ICX7650-48ZP')).toBeChecked()
    expect(await screen.findByTestId('ICX7650-48F')).toBeChecked()
  })

  it('should show warning when no model is selected', async () => {
    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileModal
            visible={true}
            onSave={jest.fn()}
          />
        </Provider>
      </IntlProvider>
    )

    await userEvent.click(await screen.findByRole('button', { name: /Next/i }))

    expect(await screen.findByText(/No model selected/i)).toBeInTheDocument()
  })

  it('should render in edit mode', async () => {
    const onSave = jest.fn()
    const portProfileSettingValues = {
      id: '15a5c0b224434a66872bf5c96ca0fa80',
      models: ['ICX7150-24'],
      portProfileId: ['port1']
    }
    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileContext.Provider value={{
            portProfileSettingValues: portProfileSettingValues ?? {} as PortProfileUI,
            setPortProfileSettingValues: onSave,
            editMode: true
          }}>
            <PortProfileModal
              visible={true}
              onSave={jest.fn()}
            />
          </PortProfileContext.Provider>
        </Provider>
      </IntlProvider>
    )

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should handle form submission in edit mode', async () => {
    const onSave = jest.fn()
    const portProfileSettingValues = {
      id: '15a5c0b224434a66872bf5c96ca0fa80',
      models: ['ICX7550-24'],
      portProfileId: ['port1']
    }
    render(
      <IntlProvider locale='en'>
        <Provider>
          <PortProfileContext.Provider value={{
            portProfileList: [],
            portProfileSettingValues: portProfileSettingValues ?? {} as PortProfileUI,
            setPortProfileSettingValues: onSave,
            editMode: true
          }}>
            <PortProfileModal
              visible={true}
              onSave={jest.fn()}
            />
          </PortProfileContext.Provider>
        </Provider>
      </IntlProvider>
    )

    expect(await screen.findByTestId('ICX7550-24')).toBeChecked()
    await userEvent.click(await screen.findByText('Port Profiles'))
    await waitFor(async () => {
      expect(await screen.findByText('Port Profile 1')).toBeInTheDocument()
    })
  })
})