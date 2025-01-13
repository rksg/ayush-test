import '@testing-library/jest-dom'
import moment   from 'moment'
import { rest } from 'msw'

import { MspEcTierEnum, MspUrlsInfo }         from '@acx-ui/msp/utils'
import { AdministrationUrlsInfo }             from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { mockServer, render, screen, within } from '@acx-ui/test-utils'

import MspCustomersLicences from './MspCustomersLicences'

const list = {
  totalCount: 3,
  page: 1,
  data: [
    {
      assignedMspEcList: [],
      creationDate: '1659589676020',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '2',
          tenantId: '701fe9df5f6b4c17928a29851c07cc04',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc04',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 111',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2,
      switchLicenses: 1,
      edgeLicenses: 1,
      accountTier: MspEcTierEnum.Essentials
    },
    {
      assignedMspEcList: [],
      creationDate: '',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'DVCNWTYPE_WIFI',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '0',
          tenantId: '701fe9df5f6b4c17928a29851c07cc05',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc05',
      installer: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspInstallerAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 222',
      status: 'Active',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 2,
      accountType: 'TRIAL',
      accountTier: MspEcTierEnum.Essentials
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [
        {
          consumed: '0',
          entitlementDeviceType: 'APSW',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '5',
          tenantId: '701fe9df5f6b4c17928a29851c07cc06',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        },
        {
          consumed: '0',
          entitlementDeviceType: 'APSW',
          expirationDate: '2022-11-02T06:59:59Z',
          expirationDateTs: '1667372399000',
          quantity: '0',
          tenantId: '701fe9df5f6b4c17928a29851c07cc06',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc06',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 333',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589676050',
      entitlements: [
        {
          consumed: '1',
          entitlementDeviceType: 'APSW',
          expirationDate: moment().add(30, 'days'),
          expirationDateTs: '1667372399000',
          quantity: '10',
          tenantId: '701fe9df5f6b4c17928a29851c07cc07',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc07',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 444',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    },
    {
      assignedMspEcList: [],
      creationDate: '1659589677050',
      entitlements: [
        {
          consumed: '2',
          entitlementDeviceType: 'APSW',
          expirationDate: moment().add(70, 'days'),
          expirationDateTs: '1667372399000',
          quantity: '10',
          tenantId: '701fe9df5f6b4c17928a29851c07cc07',
          toBeRemovedQuantity: 0,
          type: 'entitlement'
        }
      ],
      id: '701fe9df5f6b4c17928a29851c07cc22',
      integrator: '675dc01dc28846c383219b00d2f28f48',
      mspAdminCount: 1,
      mspIntegratorAdminCount: 1,
      mspAdmins: ['aefb12fab1194bf6ba061ddcec14230d'],
      mspEcAdminCount: 1,
      name: 'ec 888',
      status: 'Inactive',
      streetAddress: '675 Tasman Dr, Sunnyvale, CA 94089, USA',
      tenantType: 'MSP_EC',
      wifiLicenses: 0,
      accountTier: MspEcTierEnum.Professional
    }
  ]
}

describe('MspCustomersLicenses', () => {
  let params: { tenantId: string }
  beforeEach(async () => {
    mockServer.use(
      rest.post(
        MspUrlsInfo.getMspCustomersList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.get(
        AdministrationUrlsInfo.getTenantDetails.url,
        (req, res, ctx) => res(ctx.json({}))
      )
    )
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    }
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render table', async () => {
    render(
      <Provider>
        <MspCustomersLicences />
      </Provider>, {
        route: { params,
          path: '/:tenantId/t/administration/subscriptions/compliance' }
      })

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const rows = within(tbody).getAllByRole('row')
    expect(rows).toHaveLength(list.data.length)
    list.data.forEach((item, index) => {
      expect(within(rows[index]).getByText(item.name)).toBeVisible()
    })

    expect(await screen.findByRole('cell', { name: 'ec 111' })).toBeVisible()
    expect(await screen.findByRole('cell', { name: 'ec 222' })).toBeVisible()
    expect(await screen.findByRole('cell', { name: 'ec 333' })).toBeVisible()
    expect(await screen.findByRole('cell', { name: 'ec 444' })).toBeVisible()
  })
})
