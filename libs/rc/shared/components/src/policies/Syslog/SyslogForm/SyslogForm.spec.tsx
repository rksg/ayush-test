import React from 'react'

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi } from '@acx-ui/rc/services'
import {
  SyslogUrls
} from '@acx-ui/rc/utils'
import { Provider, store }                                from '@acx-ui/store'
import { fireEvent, mockServer, render, screen, waitFor } from '@acx-ui/test-utils'

import SyslogContext from '../SyslogContext'

import { initState, syslogPolicyTableList, syslogVenueTable, targetSyslog } from './__tests__/fixtures'
import { SyslogForm }                                                       from './SyslogForm'

const policyResponse = {
  requestId: '360cf6c7-b2c6-4973-b4c0-a6be63adaac0'
}

const wrapper = ({ children }: { children: React.ReactElement }) => {
  return <Provider>
    {children}
  </Provider>
}

const setSyslogAPConfigure = jest.fn()

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => jest.fn(),
  useTenantLink: () => jest.fn()
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
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(
        SyslogUrls.syslogPolicyList.url,
        (_, res, ctx) => res(ctx.json(syslogPolicyTableList))
      ),
      rest.post(
        SyslogUrls.getVenueSyslogList.url,
        (_, res, ctx) => res(ctx.json(syslogVenueTable))
      )
    )
  })

  it('should render SyslogForm successfully', async () => {
    const addFn = jest.fn()

    mockServer.use(
      rest.post(
        SyslogUrls.addSyslogPolicy.url,
        (_, res, ctx) => {
          addFn()
          return res(ctx.json(policyResponse))
        }
      )
    )

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
    await userEvent.click(screen.getByText('Add'))
    await waitFor(() => expect(addFn).toHaveBeenCalledTimes(1))
  })

  it('should render breadcrumb correctly', async () => {
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
    const updateFn = jest.fn()

    mockServer.use(
      rest.get(
        SyslogUrls.getSyslogPolicy.url,
        (_, res, ctx) => res(ctx.json(targetSyslog))
      ),
      rest.put(
        SyslogUrls.updateSyslogPolicy.url,
        (_, res, ctx) => {
          updateFn()
          return res(ctx.json(200))
        }
      )
    )

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

    await screen.findByRole('heading', { name: 'Settings', level: 3 })

    await userEvent.type(await screen.findByTestId('name'), 'modify name')

    await userEvent.click(await screen.findByText('Scope'))

    const applyBtn = await screen.findByRole('button', { name: 'Apply' })

    await userEvent.click(applyBtn)

    await waitFor(() => expect(updateFn).toHaveBeenCalledTimes(1))
  })
})
