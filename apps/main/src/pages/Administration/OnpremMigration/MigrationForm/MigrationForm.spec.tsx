import React from 'react'

import '@testing-library/jest-dom'
import { act }   from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi } from '@acx-ui/rc/services'
import {
  ProtocolEnum,
  FacilityEnum,
  PriorityEnum,
  FlowLevelEnum,
  SyslogContextType,
  SyslogUrls,
  SyslogVenue
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import MigrationContext from '../MigrationContext'

import MigrationForm from './MigrationForm'

const policyResponse = {
  requestId: '360cf6c7-b2c6-4973-b4c0-a6be63adaac0'
}

const policyListContent = [
  {
    id: 'policyId1',
    primary: {
      server: '1.1.1.1',
      port: 514,
      protocol: 'TCP'
    },
    secondary: {
      server: '2.2.2.2',
      port: 1514,
      potocol: 'UDP'
    },
    facility: 'KEEP_ORIGINAL',
    priority: 'ERROR',
    flowLevel: 'ALL',
    venueIds: []
  },
  {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    primary: {
      server: '1.1.1.1',
      port: 514,
      protocol: 'TCP'
    },
    secondary: {
      server: '2.2.2.2',
      port: 1514,
      protocol: 'UDP'
    },
    facility: 'KEEP_ORIGINAL',
    priority: 'ERROR',
    flowLevel: 'ALL',
    venueIds: []
  }
]

const venueTable = {
  fields: [
    'country',
    'city',
    'name',
    'switches',
    'id',
    'aggregatedApStatus',
    'rogueDetection',
    'status'
  ],
  totalCount: 2,
  page: 1,
  data: [
    {
      id: '4ca20c8311024ac5956d366f15d96e0c',
      name: 'test-venue',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '1_01_NeverContactedCloud': 10
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: '14d6ee52df3a48988f91558bac54c1ae',
        policyName: 'Default profile',
        enabled: false
      }
    },
    {
      id: '4ca20c8311024ac5956d366f15d96e03',
      name: 'test-venue2',
      city: 'Toronto, Ontario',
      country: 'Canada',
      aggregatedApStatus: {
        '2_00_Operational': 5
      },
      status: '1_InSetupPhase',
      rogueDetection: {
        policyId: 'policyId1',
        policyName: 'Default policyId1 profile',
        enabled: true
      }
    }
  ]
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const setSyslogAPConfigure = jest.fn()

const initState = {
  policyName: '',
  server: '',
  port: 514,
  protocol: ProtocolEnum.TCP,
  secondaryServer: '',
  secondaryPort: 514,
  secondaryProtocol: ProtocolEnum.TCP,
  facility: FacilityEnum.KEEP_ORIGINAL,
  priority: PriorityEnum.ALL,
  flowLevel: FlowLevelEnum.ALL,
  venues: [] as SyslogVenue[]
} as SyslogContextType

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: jest.fn(),
  useTenantLink: jest.fn()
}))

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')

  // @ts-ignore
  const Select = ({ children, onChange, ...otherProps }) =>
    <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>

  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

describe('MigrationForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render MigrationForm successfully', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.get(
      SyslogUrls.getSyslogPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ), rest.post(
      SyslogUrls.addSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(policyResponse)
      )
    ))

    render(
      <MigrationContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <MigrationForm />
      </MigrationContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Backup File Selection', level: 3 })

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Migration' })

    await userEvent.type(await screen.findByTestId('name'), 'venuexxxx')

    await userEvent.click(screen.getByRole('button', { name: 'Migrate' }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('Click Done to return to the ZD Migrations list or wait here for the result.')).toBeVisible()

  })

})
