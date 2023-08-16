import React from 'react'

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsSplitOn }               from '@acx-ui/feature-toggle'
import { AccessControlUrls }          from '@acx-ui/rc/utils'
import { Provider }                   from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import {
  aclDetail,
  aclList, aclResponse, avcApp, avcCat, deviceDetailResponse, devicePolicyListResponse,
  layer2PolicyListResponse,
  layer2Response,
  layer3PolicyListResponse,
  layer3Response, queryApplication
} from '../__tests__/fixtures'

import AccessControlForm from './AccessControlForm'

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

describe('AccessControlForm Component', () => {
  beforeEach(async () => {
    mockServer.use(
      rest.post(AccessControlUrls.addAccessControlProfile.url,
        (_, res, ctx) => res(ctx.json(aclResponse))),
      rest.get(AccessControlUrls.getAccessControlProfile.url,
        (_, res, ctx) => res(ctx.json(aclDetail))),
      rest.put(AccessControlUrls.updateAccessControlProfile.url,
        (_, res, ctx) => res(ctx.json(aclDetail))),
      rest.get(AccessControlUrls.getAccessControlProfileList.url,
        (_, res, ctx) => res(ctx.json(aclList))),
      rest.get(AccessControlUrls.getL2AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer2PolicyListResponse))),
      rest.get(AccessControlUrls.getL3AclPolicyList.url,
        (_, res, ctx) => res(ctx.json(layer3PolicyListResponse))),
      rest.get(AccessControlUrls.getL3AclPolicy.url,
        (_, res, ctx) => res(ctx.json(layer3Response))),
      rest.get(AccessControlUrls.getL2AclPolicy.url,
        (_, res, ctx) => res(ctx.json(layer2Response))),
      rest.get(AccessControlUrls.getDevicePolicy.url,
        (_, res, ctx) => res(ctx.json(deviceDetailResponse))),
      rest.get(AccessControlUrls.getDevicePolicyList.url,
        (_, res, ctx) => res(ctx.json(devicePolicyListResponse))),
      rest.get(AccessControlUrls.getAppPolicyList.url,
        (_, res, ctx) => res(ctx.json(queryApplication))),
      rest.get(AccessControlUrls.getAvcCategory.url,
        (_, res, ctx) => res(ctx.json(avcCat))),
      rest.get(AccessControlUrls.getAvcApp.url,
        (_, res, ctx) => res(ctx.json(avcApp)))
    )
  })

  it('Render AccessControlForm component successfully', async () => {
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={false}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const header = screen.getByRole('heading', {
      name: /add access control policy/i
    })

    expect(header).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', {
      name: 'Cancel'
    }))
  })

  it('should render breadcrumb correctly when feature flag is off', () => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={false}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )
    expect(screen.queryByText('Network Control')).toBeNull()
    expect(screen.queryByText('Policies & Profiles')).toBeNull()
    expect(screen.getByRole('link', {
      name: 'Access Control'
    })).toBeVisible()
  })

  it('should render breadcrumb correctly when feature flag is on', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={false}/>
        </Form>
      </Provider>, {
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
      name: 'Access Control'
    })).toBeVisible()
  })

  it('Render AccessControlForm component successfully (create)', async () => {
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={false}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    const header = await screen.findByRole('heading', {
      name: /add access control policy/i
    })

    expect(header).toBeInTheDocument()

    await userEvent.click((await screen.findAllByRole('switch'))[1])

    await userEvent.click(screen.getByRole('button', {
      name: 'Add'
    }))

    await userEvent.click((await screen.findAllByRole('switch'))[0])

    await userEvent.click((await screen.findAllByRole('switch'))[1])

    await userEvent.click(screen.getByRole('button', {
      name: 'Add'
    }))

    await screen.findByRole('option', { name: 'layer2policy1' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'layer2policy1' })
    )

    await userEvent.click(screen.getByRole('button', {
      name: 'Add'
    }))

  })

  it('Render AccessControlForm component with editMode successfully', async () => {
    render(
      <Provider>
        <Form>
          <AccessControlForm editMode={true}/>
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', policyId: 'c9c0667abfe74ab7803999a793fd2bbe' }
        }
      }
    )

    const header = screen.getByRole('heading', {
      name: /edit access control policy/i
    })

    expect(header).toBeInTheDocument()

    await screen.findByDisplayValue('acl-test')

    await userEvent.clear(screen.getByRole('textbox', {
      name: /policy name/i
    }))

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name/i
    }), 'acl-test-modify')

    await userEvent.click(screen.getByRole('button', {
      name: 'Add'
    }))
  })
})
