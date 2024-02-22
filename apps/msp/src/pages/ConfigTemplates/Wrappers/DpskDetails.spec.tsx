import { rest } from 'msw'

import { servicesConfigTemplateApi } from '@acx-ui/rc/services'
import {
  ServiceType,
  getServiceDetailsLink,
  ServiceOperation,
  ServicesConfigTemplateUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import DpskDetails from './DpskDetails'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  DpskOverview: () => <div>DPSK Overview</div>
}))

describe('DpskDetails', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    serviceId: '4b76b1952c80401b8500b00d68106576'
  }
  const mockedDetailPath = '/:tenantId/:serviceId/'

  beforeEach(() => {
    store.dispatch(servicesConfigTemplateApi.util.resetApiState())
    mockServer.use(
      rest.get(
        ServicesConfigTemplateUrlsInfo.getDpsk.url,
        (req, res, ctx) => res(ctx.json({
          id: '4b76b1952c80401b8500b00d68106576',
          name: 'Fake DPSK Template',
          passphraseLength: 16,
          passphraseFormat: 'NUMBERS_ONLY',
          expirationType: 'HOURS_AFTER_TIME',
          expirationOffset: 1
        }))
      )
    )
  })

  it('should navigate to the edit page', async () => {
    const editLink = `/${params.tenantId}/v/configTemplates/` + getServiceDetailsLink({
      type: ServiceType.DPSK,
      oper: ServiceOperation.EDIT,
      serviceId: params.serviceId
    })

    render(
      <Provider>
        <DpskDetails />
      </Provider>, {
        route: { params: params, path: mockedDetailPath }
      }
    )

    // eslint-disable-next-line max-len
    expect(await screen.findByRole('link', { name: 'Configure' })).toHaveAttribute('href', editLink)
  })
})
