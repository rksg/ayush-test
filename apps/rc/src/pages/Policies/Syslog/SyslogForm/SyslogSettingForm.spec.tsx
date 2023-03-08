import React from 'react'

import { act }  from '@testing-library/react'
import { Form } from 'antd'
import { rest } from 'msw'

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

import SyslogContext from '../SyslogContext'

import SyslogForm        from './SyslogForm'
import SyslogSettingForm from './SyslogSettingForm'



const policyListContent = [
  {
    id: 'policyId1',
    server: '1.1.1.1',
    port: 514,
    protocol: 'TCP',
    secondaryServer: '2.2.2.2',
    secondaryPort: 1514,
    secondaryProtocol: 'UDP',
    facility: 'KEEP_ORIGINAL',
    priority: 'ERROR',
    flowLevel: 'ALL',
    venueIds: []
  },
  {
    id: 'be62604f39aa4bb8a9f9a0733ac07add',
    server: '1.1.1.1',
    port: 514,
    protocol: 'TCP',
    secondaryServer: '2.2.2.2',
    secondaryPort: 1514,
    secondaryProtocol: 'UDP',
    facility: 'KEEP_ORIGINAL',
    priority: 'ERROR',
    flowLevel: 'ALL',
    venueIds: []
  }
]

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


const initStateEditMode = {
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

describe('SyslogSettingForm', () => {
  beforeEach(() => {
    act(() => {
      store.dispatch(policyApi.util.resetApiState())
    })
  })

  it('should render SyslogSettingForm successfully', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: initState,
        dispatch: setSyslogAPConfigure
      }}>
        <Form>
          <SyslogSettingForm edit={false}/>
        </Form>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })
  })

  it('should render SyslogSettingForm with editMode successfully', async () => {
    mockServer.use(rest.get(
      SyslogUrls.getSyslogPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(policyListContent)
      )
    ))

    render(
      <SyslogContext.Provider value={{
        state: initStateEditMode,
        dispatch: setSyslogAPConfigure
      }}>
        <Form>
          <SyslogForm edit={true}/>
        </Form>
      </SyslogContext.Provider>
      , {
        wrapper: wrapper,
        route: {
          path: '/policies/syslog/:policyId/edit',
          params: { policyId: 'policyId1', tenantId: 'tenantId1' }
        }
      }
    )

    await screen.findByRole('heading', { name: 'Settings', level: 3 })
  })
})
