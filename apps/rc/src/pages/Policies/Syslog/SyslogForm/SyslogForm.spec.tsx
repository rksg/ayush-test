import React from 'react'

import '@testing-library/jest-dom'
import { act, fireEvent } from '@testing-library/react'
import userEvent          from '@testing-library/user-event'
import { rest }           from 'msw'

import { policyApi } from '@acx-ui/rc/services'
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
    server: '1.1.1.1',
    port: '514',
    protocol: 'TCP',
    secondaryServer: '2.2.2.2',
    secondaryPort: '1514',
    secondaryProtocol: 'UDP',
    facility: 'KEEP_ORIGINAL',
    priority: 'ERROR',
    flowLevel: 'ALL',
    venueIds: []
  },
  {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    server: '1.1.1.1',
    port: '514',
    protocol: 'TCP',
    secondaryServer: '2.2.2.2',
    secondaryPort: '1514',
    secondaryProtocol: 'UDP',
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
  port: '',
  protocol: ProtocolEnum.TCP,
  secondaryServer: '',
  secondaryPort: '',
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
  })

  it('should render SyslogForm successfully', async () => {
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

    expect(screen.getAllByText('Settings')).toBeTruthy()
    expect(screen.getAllByText('Scope')).toBeTruthy()
    expect(screen.getAllByText('Summary')).toBeTruthy()

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
      { target: { value: 'policyTestName-modify' } })

    // fireEvent.change(screen.getByTestId('server'),
    //   { target: { value: '1.1.1.2' } })
    await userEvent.type(await screen.findByTestId('server'), '1.1.1.2')

    // fireEvent.change(screen.getByTestId('port'),
    //   { target: { value: '514' } })
    await userEvent.type(await screen.findByTestId('port'), '514')

    // fireEvent.change(screen.getByTestId('server2'),
    //   { target: { value: '1.1.1.1' } })
    await userEvent.type(await screen.findByTestId('server2'), '1.1.1.3')

    // fireEvent.change(screen.getByTestId('port2'),
    //   { target: { value: '514' } })
    await userEvent.type(await screen.findByTestId('port2'), '514')

    // fireEvent.change(screen.getByTestId('selectProtocol'), {
    //   target: { value: 'UDP' }
    // })
    await userEvent.selectOptions(await screen.findByTestId('selectProtocol'), 'UDP')

    // fireEvent.change(screen.getByTestId('selectProtocol2'), {
    //   target: { value: 'UDP' }
    // })
    await userEvent.selectOptions(await screen.findByTestId('selectProtocol2'), 'TCP')

    // fireEvent.change(screen.getByTestId('selectFacility'), {
    //   target: { value: 'LOCAL0' }
    // })
    await userEvent.selectOptions(await screen.findByTestId('selectFacility'), 'LOCAL0')

    // fireEvent.change(screen.getByTestId('selectFlowLevel'), {
    //   target: { value: 'ALL' }
    // })
    await userEvent.selectOptions(await screen.findByTestId('selectFlowLevel'), 'ALL')

    expect(screen.getByText(/next/i)).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    expect(await screen
      .findByText(/Select the venues where the syslog server will be applie/i))
      .toBeInTheDocument()

    expect(screen.getByText(/next/i)).not.toBeDisabled()
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    expect(await screen.findByText(/venues \(0\)/i)).toBeInTheDocument()

    const finishBtn = await screen.findByRole('button', { name: 'Finish' })

    await userEvent.click(finishBtn)
  })

  it('should render SyslogForm with editMode successfully', async () => {
    mockServer.use(rest.post(
      SyslogUrls.getVenueSyslogPolicy.url,
      (_, res, ctx) => res(
        ctx.json(venueTable)
      )
    ), rest.get(
      SyslogUrls.getSyslogPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
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

    // fireEvent.change(screen.getByRole('textbox', { name: /policy name/i }),
    //   { target: { value: 'policyTestName-modify' } })
    await userEvent.type(await screen.findByTestId('name'), 'modify name')

    // fireEvent.change(screen.getByTestId('server'),
    //   { target: { value: '1.1.1.1' } })
    await userEvent.type(await screen.findByTestId('server'), '1.1.1.2')

    // fireEvent.change(screen.getByTestId('port'),
    //   { target: { value: '514' } })
    await userEvent.type(await screen.findByTestId('port'), '514')

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }))

    const finishBtn = await screen.findByRole('button', { name: 'Finish' })

    await userEvent.click(finishBtn)
  })
})
