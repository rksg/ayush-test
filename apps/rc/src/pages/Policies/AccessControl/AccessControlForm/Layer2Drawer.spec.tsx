import '@testing-library/jest-dom'

import React from 'react'

import {  within } from '@testing-library/react'
import userEvent   from '@testing-library/user-event'
import { Form }    from 'antd'
import { rest }    from 'msw'

import { AccessControlUrls, CommonUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                          from '@acx-ui/store'
import { mockServer, render, screen }        from '@acx-ui/test-utils'

import Layer2Drawer from './Layer2Drawer'

const queryLayer2 = {
  data: [
    {
      id: 'c11884695f13443c9c10bc261102217d',
      name: 'allowl2',
      macAddressesCount: 1,
      networksCount: 0
    },
    {
      id: '36ec4826b5da48cc8118eda83aa4080f',
      name: 'blockl2',
      macAddressesCount: 1,
      networksCount: 0
    }
  ],
  fields: [
    'check-all',
    'name',
    'description',
    'macAddressesCount',
    'networksCount',
    'id'
  ],
  totalCount: 2,
  totalPages: 1,
  page: 1
}

const layer2Detail = {
  name: 'blockL2Acl',
  access: 'ALLOW',
  macAddresses: [
    '11:11:11:11:11:11'
  ],
  id: 'a760d3fee7934128b16fce99f78e94df'
}

const layer2Response = {
  requestId: 'bbe8642c-9f29-4a86-a03d-850b48725d82',
  response: {
    name: 'l2-n',
    access: 'ALLOW',
    macAddresses: [
      '21:12:12:12:12:12'
    ],
    id: 'bb8cd612fc1e4374b28f25128070c99b'
  }
}

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

describe('Layer2Drawer Component', () => {
  it('Render Layer2Drawer component successfully', async () => {
    mockServer.use(rest.post(
      CommonUrlsInfo.getL2AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryLayer2)
      )
    ), rest.post(
      AccessControlUrls.addL2AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer2Response)
      )
    ))

    render(
      <Provider>
        <Form>
          <Layer2Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1' }
        }
      }
    )

    await userEvent.click(screen.getByText(/add new/i))

    await screen.findByText(/layer 2 settings/i)

    const dialog = screen.getByRole('dialog')

    within(dialog).getByText(/access/i)

    screen.getByText(/mac address \( 0\/128 \)/i)

    const saveButton = screen.getByText(/save/i)
    await userEvent.click(saveButton)

    await screen.findByText(/no mac addresses were added yet/i)

    const addButton = screen.getByText('Add')
    await userEvent.click(addButton)

    await screen.findByText(/add mac address/i)

    const inputField = screen.getByPlaceholderText(
      'Enter MAC addresses, separated by comma or semicolon'
    )
    await userEvent.type(inputField, '@@@,')
    await userEvent.type(inputField, '11:11:11:11:11:11,')
    await userEvent.type(inputField, '11:11:11:22:22:22,')

    await screen.findByTestId('11:11:11:22:22:22')
    await userEvent.click(
      within(screen.getByTestId('11:11:11:22:22:22')).getByRole('img')
    )

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.click(screen.getByRole('button', {
      name: /allow connections only from mac addresses listed below/i
    }))

    await userEvent.click(screen.getByRole('button', {
      name: /block connections from mac addresses listed below/i
    }))

    await userEvent.click(within(screen.getByRole('cell', {
      name: /11:11:11:11:11:11/i
    })).getByTestId('11:11:11:11:11:11'))

    const clearButton = screen.getByText('Clear list')
    await userEvent.click(clearButton)

    await userEvent.click(addButton)

    await screen.findByText(/add mac address/i)

    await userEvent.type(inputField, '11:11:11:11:11:11,')

    await userEvent.click(screen.getAllByText('Save')[1])

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'allowl2')

    await userEvent.type(screen.getByRole('textbox', {
      name: /policy name:/i
    }), 'allowl2-new')

    await userEvent.click(screen.getAllByText('Save')[0])

  })

  it('Render Layer2Drawer component in viewMode successfully', async () => {
    mockServer.use(rest.post(
      CommonUrlsInfo.getL2AclPolicyList.url,
      (_, res, ctx) => res(
        ctx.json(queryLayer2)
      )
    ), rest.get(
      AccessControlUrls.getL2AclPolicy.url,
      (_, res, ctx) => res(
        ctx.json(layer2Detail)
      )
    ))

    render(
      <Provider>
        <Form>
          <Layer2Drawer />
        </Form>
      </Provider>, {
        route: {
          params: { tenantId: 'tenantId1', requestId: 'requestId1' }
        }
      }
    )

    await screen.findByRole('option', { name: 'allowl2' })

    await userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'allowl2' })
    )

    await userEvent.click(screen.getByText(/view details/i))

    await screen.findByText(/layer 2 settings/i)

    await screen.findByText('allowl2')

    const dialog = screen.getByRole('dialog')

    within(dialog).getByText(/access/i)

    screen.getByText(/mac address \( 1\/128 \)/i)

    await userEvent.click(screen.getByText('Cancel'))
  })
})
