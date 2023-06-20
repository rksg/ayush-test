import '@testing-library/jest-dom'


import { Form } from 'antd'

import { AaaServerTypeEnum, AaaServerOrderEnum } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render, screen, fireEvent }             from '@acx-ui/test-utils'

import { IpPortSecretForm } from './index'


describe('IpPortSecretForm', () => {
  it('should render IP Port Secrect form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <IpPortSecretForm serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}/>
        </Form>
      </Provider>, {
        route: { params }
      })

    expect(asFragment()).toMatchSnapshot()
  })

  it('should render IP Port Secrect accounting form successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    const { asFragment } = render(
      <Provider>
        <Form>
          <IpPortSecretForm serverType={AaaServerTypeEnum.ACCOUNTING}
            order={AaaServerOrderEnum.PRIMARY}/>
        </Form>
      </Provider>, {
        route: { params }
      })


    const ipTextbox = await screen.findByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '192.168.1.1' } })

    const portTextbox = await screen.findByLabelText('Port')
    fireEvent.change(portTextbox, { target: { value: '1111' } })

    const secretTextbox = await screen.findByLabelText('Shared secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })
    expect(asFragment()).toMatchSnapshot()
  })


  it('should checking unique IP Port Secrect successfully', async () => {
    const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id' }

    render(
      <Provider>
        <Form>
          <IpPortSecretForm serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.PRIMARY}/>
          <IpPortSecretForm serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.SECONDARY}/>
        </Form>
      </Provider>, {
        route: { params }
      })


    const ipTextbox = await screen.findAllByLabelText('IP Address')
    fireEvent.change(ipTextbox[0], { target: { value: '192.168.1.1' } })
    fireEvent.change(ipTextbox[1], { target: { value: '192.168.1.1' } })

    const alertMsg = await screen.findAllByRole('alert')
    expect(alertMsg[1]).toBeVisible()
  })

})

