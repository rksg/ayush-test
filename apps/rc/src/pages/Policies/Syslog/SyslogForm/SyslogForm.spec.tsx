import React from 'react'

import '@testing-library/jest-dom'
import { act, fireEvent } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { rest }           from 'msw'

import { useIsSplitOn } from '@acx-ui/feature-toggle'
import { policyApi }    from '@acx-ui/rc/services'
import {
  ProtocolEnum,
  FacilityEnum,
  PriorityEnum,
  FlowLevelEnum,
  RogueApUrls,
  SyslogContextType,
  SyslogUrls,
  SyslogVenue
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SyslogContext from '../SyslogContext'

import SyslogForm from './SyslogForm'

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

describe('SyslogForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })

    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ), rest.put(
      SyslogUrls.updateSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(200)
      )
    ))
  })

  it('should render SyslogForm successfully', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.post(
      SyslogUrls.addSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(policyResponse)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <SyslogForm edit={false}/>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyTestName' } })

    await userEvent.type(await screen.findByTestId('server'), '1.1.1.2')

    await userEvent.type(await screen.findByTestId('port'), '514')

    await userEvent.type(await screen.findByTestId('server2'), '1.1.1.3')

    await userEvent.type(await screen.findByTestId('port2'), '514')

    await userEvent.selectOptions(await screen.findByTestId('selectProtocol'), 'UDP')

    await userEvent.selectOptions(await screen.findByTestId('selectProtocol2'), 'TCP')

    await userEvent.selectOptions(await screen.findByTestId('selectFacility'), 'LOCAL0')

    await userEvent.selectOptions(await screen.findByTestId('selectFlowLevel'), 'ALL')

    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Scope' })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))

    await screen.findByRole('heading', { level: 3, name: 'Summary' })
    await userEvent.click(screen.getByText('Finish'))
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <SyslogForm edit={false}/>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Syslog'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <SyslogForm edit={false}/>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )
    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Syslog Server'
    })).toBeVisible()
  })

  it('should render SyslogForm with editMode successfully', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogList.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.get(
      RogueApUrls.getRoguePolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <SyslogForm edit={true}/>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await userEvent.type(await screen.findByTestId('name'), 'modify name')

    await userEvent.click(await screen.findByText('Scope'))

    const applyBtn = await screen.findByRole('button', { name: 'Apply' })

    await userEvent.click(applyBtn)
  })
})
