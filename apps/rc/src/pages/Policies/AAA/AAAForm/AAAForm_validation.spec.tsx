import '@testing-library/jest-dom'
import userEvent   from '@testing-library/user-event'
import { Modal }   from 'antd'
import { rest }    from 'msw'
import { useIntl } from 'react-intl'

import { CommonUrlsInfo, AaaUrls }               from '@acx-ui/rc/utils'
import { Provider }                              from '@acx-ui/store'
import { fireEvent, mockServer, render, screen } from '@acx-ui/test-utils'


import { multipleConflictMessage, radiusErrorMessage } from '../../../Networks/wireless/NetworkForm/contentsMap'

import AAAForm from './AAAForm'

const aaaData={
  id: 'policy-id',
  name: 'test2',
  isAuth: true,
  primary: {
    ip: '2.3.3.4',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  secondary: {
    ip: '2.3.3.4',
    port: 101,
    sharedSecret: 'xxxxxxxx'
  },
  tags: ['xxdd']
}
const successResponse = { requestId: 'request-id', id: '2', name: 'test2' }
const aaaList=[{
  id: '1',
  name: 'test1'
},{
  id: 'policy-id',
  name: 'test2'
}]
const validateErrorResponse = [{
  code: '',
  message: 'Occured Some Error',
  object: 'radiusProfiles.xxxxxxx'
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9'
  }
}, {
  code: 'WIFI-10200',
  message: 'Accounting Profile Mismatch [Shared Secret on Primary has changed]',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '3e90174d344749b1a1e36a1fd802510c' }
}, {
  code: 'WIFI-10200',
  message: 'multiple conflict xxxxx Authentication Profile Mismatch xxxxxx',
  object: 'radiusProfiles.accountingRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 10,
      sharedSecret: '99999'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}, {
  code: 'WIFI-10200',
  message: 'Authentication Profile Mismatch xxxxxx multiple conflict xxxxxx',
  object: 'radiusProfiles.authRadius',
  value: {
    primary: {
      ip: '1.1.1.1',
      port: 20,
      sharedSecret: '88888'
    },
    id: '007d6854e6294e97882b432185c1abd9' }
}]
jest.mock('react-intl', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })

  return {
    ...reactIntl,
    useIntl: () => intl
  }
})
const params = { networkId: 'UNKNOWN-NETWORK-ID', tenantId: 'tenant-id', type: 'wifi',
  policyId: 'policy-id' }
describe('AAAForm', () => {
  beforeEach(()=>{
    mockServer.use(
      rest.get(CommonUrlsInfo.getAllUserSettings.url, (_, res, ctx) =>
        res(ctx.json({ COMMON: '{}' }))
      ),
      rest.post(CommonUrlsInfo.validateRadius.url, (_, res, ctx) =>
        res(ctx.json(successResponse))
      ),
      rest.get(
        AaaUrls.getAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(aaaData))}
      ),
      rest.post(
        AaaUrls.addAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.put(
        AaaUrls.updateAAAPolicy.url,
        (_, res, ctx) => {return res(ctx.json(successResponse))}
      ),
      rest.get(
        AaaUrls.getAAAPolicyList.url,
        (_, res, ctx) => {return res(ctx.json(aaaList))}
      )
    )
  })
  afterEach(() => Modal.destroyAll())
  const { $t } = useIntl()
  async function fillInAuthIpSettings () {
    const inputProfile = await screen.findByLabelText(/Profile Name/)
    fireEvent.change(inputProfile, { target: { value: 'create aaaa' } })
    const ipTextbox = await screen.findByLabelText('IP Address')
    fireEvent.change(ipTextbox, { target: { value: '1.1.1.1' } })

    const portTextbox = await screen.findByLabelText('Authentication Port')
    fireEvent.change(portTextbox, { target: { value: '10' } })

    const secretTextbox = await screen.findByLabelText('Shared Secret')
    fireEvent.change(secretTextbox, { target: { value: 'secret-1' } })
    await userEvent.click(await screen.findByText('Finish'))
  }

  async function fillInAuthAndAccIpSettings () {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    const inputProfile = await screen.findByLabelText(/Profile Name/)
    fireEvent.change(inputProfile, { target: { value: 'create aaaa' } })
    await userEvent.click(await screen.findByRole('radio', { name: /Accounting/ }))

    const ipTextbox = await screen.findAllByLabelText('IP Address')
    fireEvent.change(ipTextbox[0], { target: { value: '1.1.1.1' } })


    const portTextbox = await screen.findAllByLabelText('Authentication Port')
    fireEvent.change(portTextbox[0], { target: { value: '10' } })


    const secretTextbox = await screen.findAllByLabelText('Shared Secret')
    fireEvent.change(secretTextbox[0], { target: { value: 'secret-1' } })

    await userEvent.click(await screen.findByText('Finish'))
  }
  it('should not open Server Configuration Conflict Modal', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(404), ctx.json({ status: 404 }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthIpSettings()
    await new Promise((r)=>{setTimeout(r, 300)})
  })

  it('should open Modal with correct error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(422), ctx.json({ errors: [validateErrorResponse[0]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText('Occured Some Error')
  })

  it('should open Modal with auth error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[1]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH']))
    await userEvent.click(screen.getByText('Use existing server configuration'))
  })

  it('should open Modal with accounting error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[2]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthAndAccIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['ACCOUNTING']))
    await userEvent.click(screen.getByText('Use existing server configuration'))
  })

  it('should open Modal with auth and accounting error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: validateErrorResponse.slice(1, 3) }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthAndAccIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(radiusErrorMessage['AUTH_AND_ACC']))
    fireEvent.click(screen.getByText('Override the conflicting server configuration'))
  })

  it('should open Modal with accounting multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[3]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthAndAccIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['ACCOUNTING']))
  })

  it('should open Modal with auth multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[4]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['AUTH']))
  })

  it('should open Modal with auth and accounting multiple conflict message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: validateErrorResponse.slice(3, 5) }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthAndAccIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Server Configuration Conflict')
    await screen.findByText($t(multipleConflictMessage['AUTH_AND_ACC']))
  })

  it('should open Modal with occured error message', async () => {
    mockServer.use(
      rest.post(CommonUrlsInfo.validateRadius.url,
        (_, res, ctx) => {
          return res(ctx.status(400), ctx.json({ errors: [validateErrorResponse[0]] }))
        })
    )
    render(<Provider><AAAForm edit={false} networkView={true}/></Provider>, {
      route: { params }
    })
    await fillInAuthIpSettings()
    await screen.findByRole('dialog')
    await screen.findByText('Occured Error')
    await screen.findByText('Occured Some Error')
  })
})

