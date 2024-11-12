import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                                                     from '@acx-ui/components'
import { switchApi, venueApi }                                           from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo }                                from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import { mockServer, render, screen, within, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { familyModels, venues } from './__tests__/fixtures'
import {
  ConfigurationProfileFormContext,
  ConfigurationProfileType
} from './ConfigurationProfileFormContext'
import { VenueSetting } from './VenueSetting'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))
const currentData = {
  name: '111',
  venues: ['f8da55210928402fa5a470642d80de53'],
  description: '',
  vlans: [{
    id: '73e46643d9ed408fa20a901ccffa358f',
    vlanId: 1,
    ipv4DhcpSnooping: false,
    arpInspection: false,
    igmpSnooping: 'none',
    spanningTreeProtocol: 'none',
    spanningTreePriority: 32768,
    switchFamilyModels: [
      {
        id: 'ed79373de6a949c6bf05220fb64b1743',
        model: 'ICX7150-24',
        taggedPorts: '1/1/2',
        untaggedPorts: '1/1/1',
        slots: [
          { slotNumber: 3, enable: true, option: '4X1/10G' },
          { slotNumber: 1, enable: true },
          { slotNumber: 2, enable: true, option: '2X1G' }
        ]
      }
    ]
  }],
  acls: [{
    id: '9e062359d5644facae4bc0d9e9fb87e9',
    name: '1',
    aclType: 'standard',
    aclRules: [
      {
        id: '990453de8cbe4922bb9778fe158de039',
        sequence: 65000,
        action: 'permit',
        protocol: 'ip',
        source: 'any'
      }
    ]
  }]
}
describe('Wired', () => {
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venues))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      )
    )
  })

  it('should render Switch Configuration Profile venue setting correctly', async () => {
    const configureProfileContextValues = {
      editMode: true,
      currentData
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <StepsForm>
            <StepsForm.StepForm>
              <VenueSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    const alertbar = await screen.findByRole('alert')
    await userEvent.click(await within(alertbar).findByText('Activate'))
    expect(await within(row).findByRole('switch')).toBeChecked()

    await userEvent.click(await within(alertbar).findByText('Deactivate'))
    expect(await within(row).findByRole('switch')).not.toBeChecked()

    await userEvent.click(await within(row).findByRole('switch'))
    expect(await within(row).findByRole('switch')).toBeChecked()
  })
  it('should render Configuration Profile venue setting switch behavior correctly', async () => {
    const configureProfileContextValues = {
      editMode: true,
      currentData
    } as unknown as ConfigurationProfileType

    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileContextValues}>
          <StepsForm>
            <StepsForm.StepForm>
              <VenueSetting />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    const row = await screen.findByRole('row', { name: /My-Venue/i })
    await userEvent.click(await within(row).findByRole('checkbox'))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    const alertbar = await screen.findByRole('alert')
    await userEvent.click(await within(alertbar).findByText('Activate'))
    expect(await within(row).findByRole('switch')).toBeChecked()

    await userEvent.click(await within(row).findByRole('switch'))
    expect(await within(row).findByRole('switch')).not.toBeChecked()
  })
})
