import '@testing-library/jest-dom'
import { rest } from 'msw'

import { StepsForm }                      from '@acx-ui/components'
import { useIsSplitOn }                   from '@acx-ui/feature-toggle'
import { switchApi, venueApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import { mockServer, render, screen }     from '@acx-ui/test-utils'

import { venues }             from './__tests__/fixtures'
import {
  ConfigurationProfileFormContext,
  ConfigurationProfileType
} from './ConfigurationProfileFormContext'
import { Summary } from './Summary'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}))

const portProfileList = {
  data: [
    {
      id: '4f7ea9ceec35486da138b017ca54638a',
      name: 'global1',
      type: 'STATIC',
      taggedVlans: [
        '11',
        '3',
        '4',
        '5'
      ],
      untaggedVlan: 2,
      poeEnable: true,
      poeClass: 'ONE',
      poePriority: 2,
      portSpeed: 'TEN_M_FULL',
      ingressAcl: 'ingress_test',
      egressAcl: 'egress_test',
      portProtected: false,
      rstpAdminEdgePort: true,
      stpBpduGuard: false,
      stpRootGuard: false,
      dhcpSnoopingTrust: true,
      ipsg: false,
      dot1x: true,
      macAuth: true,
      regularProfiles: [
        'af5878ca07dc4bb1b57880e67e14986a'
      ]
    }
  ],
  fields: [
    'name',
    'id'
  ],
  page: 1,
  totalCount: 1,
  totalPages: 1
}

describe('Wired', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(venues))
      ),
      rest.post(SwitchUrlsInfo.getSwitchPortProfilesList.url,
        (_, res, ctx) => res(ctx.json(portProfileList))
      )
    )
  })

  it('should render Switch Configuration Profile summary correctly', async () => {
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
          <Summary />
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText('111')).toBeInTheDocument()
    await screen.findByRole('heading', { level: 3, name: /Summary/i })
  })

  it('should render Switch Configuration Profile summary with empty data correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    const currentEmptyData = {
      name: '111',
      venues: [null],
      description: '',
      vlans: [],
      acls: []
    }

    const configureProfileEmptyContextValues = {
      editMode: true,
      currentData: currentEmptyData
    } as unknown as ConfigurationProfileType

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileEmptyContextValues}>
          <StepsForm>
            <StepsForm.StepForm>
              <Summary />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText('111')).toBeInTheDocument()
    await screen.findByRole('heading', { level: 3, name: /Summary/i })
  })
  it('should render Configuration Profile summary with port profile data correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit'
    }

    const currentData = {
      description: '',
      id: null,
      name: 'profile test',
      acls: [],
      portProfiles: [
        {
          portProfileId: '4f7ea9ceec35486da138b017ca54638a',
          models: [
            'ICX7550-24'
          ]
        }
      ],
      applyOnboardOnly: true,
      venues: []
    }

    const configureProfileEmptyContextValues = {
      editMode: true,
      currentData: currentData
    } as unknown as ConfigurationProfileType

    render(
      <Provider>
        <ConfigurationProfileFormContext.Provider value={configureProfileEmptyContextValues}>
          <StepsForm>
            <StepsForm.StepForm>
              <Summary />
            </StepsForm.StepForm>
          </StepsForm>
        </ConfigurationProfileFormContext.Provider>
      </Provider>, {
        route: { params, path: '/:tenantId/t/networks/wired/profiles/:action' }
      })

    expect(await screen.findByText(/ICX7550-24/)).toBeInTheDocument()
    expect(await screen.findByText(/global1/)).toBeInTheDocument()
    await screen.findByRole('heading', { level: 3, name: /Summary/i })
  })
})
