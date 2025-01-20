import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { SwitchConfigurationProfile, SwitchUrlsInfo }  from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { ConfigurationProfileFormContext, ConfigurationProfileType } from '../ConfigurationProfileFormContext'

import { PortProfile } from './index'


const currentData = {
  name: 'test-profile',
  description: '',
  acls: [],
  vlans: [{ arpInspection: true, switchFamilyModels: [] }]
}

describe('PortProfile', () => {
  const configureProfileContextValues = {
    editMode: false,
    currentData
  } as unknown as ConfigurationProfileType

  const portProfiles = [
    { id: 'profile1', models: ['Model A'], portProfileId: ['port1'] },
    { id: 'profile2', models: ['Model B'], portProfileId: ['port2'] }
  ]

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

  beforeEach(() => {
    mockServer.use(
      rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url,
        (_, res, ctx) => res(ctx.json(portProfileList))
      )
    )
  })

  it('should render PortProfile component correctly', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <PortProfile />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>
    )

    expect(await screen.findByText('Port Profiles')).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Add Port Profile' })).toBeInTheDocument()
  })

  it('should open PortProfileModal when Add Port Profile button is clicked', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <Form>
            <PortProfile />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>
    )

    const addButton = await screen.findByRole('button', { name: 'Add Port Profile' })
    await userEvent.click(addButton)

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  it('should display existing port profiles', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            portProfiles
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <PortProfile />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>
    )

    expect(await screen.findByText('Model A')).toBeInTheDocument()
    expect(await screen.findByText('Model B')).toBeInTheDocument()
    expect(await screen.findByText('Port Profile 1')).toBeInTheDocument()
    expect(await screen.findByText('Port Profile 2')).toBeInTheDocument()
  })

  it('should allow deleting a port profile', async () => {
    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={{
          ...configureProfileContextValues,
          editMode: true,
          currentData: {
            ...currentData,
            portProfiles
          } as unknown as SwitchConfigurationProfile
        }}>
          <Form>
            <PortProfile />
          </Form>
        </ConfigurationProfileFormContext.Provider>
      </Provider>
    )
    const row = await screen.findByRole('row', { name: /Model A/i })
    await userEvent.click(await within(row).findByRole('radio'))

    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(await within(dialog).findByRole('button', { name: 'Delete' }))

    await waitFor(() => {
      expect(screen.queryByText('Model A')).not.toBeInTheDocument()
    })
  })
})