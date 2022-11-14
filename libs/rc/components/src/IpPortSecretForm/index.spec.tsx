import '@testing-library/jest-dom'


import { Form } from 'antd'

import { AaaServerTypeEnum, AaaServerOrderEnum } from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { render }                                from '@acx-ui/test-utils'

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

    expect(asFragment()).toMatchSnapshot()
  })

})

