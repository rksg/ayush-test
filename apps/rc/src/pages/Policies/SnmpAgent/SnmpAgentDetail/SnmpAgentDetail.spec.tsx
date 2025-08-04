import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { policyApi } from '@acx-ui/rc/services'
import {
  ApSnmpRbacUrls,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { Provider, store }            from '@acx-ui/store'
import { mockServer, render, screen } from '@acx-ui/test-utils'

import SnmpAgentDetail from './SnmpAgentDetail'


const mockRbacOverviewData = {
  totalCount: 1,
  page: 1,
  data: [{
    id: 'c1082e7d05d74eb897bb3600a15c1dc7',
    name: 'SNMP-1',
    communityNames: ['test'],
    apSerialNumbers: '302002030366',
    userNames: ['testUser'],
    apNames: ['R550_0131'],
    venueIds: ['fffd4134ecbb4ce5a1a41baca4dfe5de'],
    venueNames: ['My-Venue-2'],
    apActivations: [{
      venueId: 'f44d4134ecbb4ce5a1a41baca4dfe5de',
      apSerialNumber: '302002030366'
    }]
  }]
}

const mockRbacInstancesData = {
  data: [{
    id: 'c1082e7d05d74eb897bb3600a15c1dc7',
    name: 'SNMP-1',
    communityNames: ['test'],
    apSerialNumbers: '302002030366',
    userNames: ['testUser'],
    apNames: ['R550_0131'],
    venueIds: ['fffd4134ecbb4ce5a1a41baca4dfe5de'],
    venueNames: ['My-Venue-2'],
    apActivations: [{
      venueId: 'f44d4134ecbb4ce5a1a41baca4dfe5de',
      apSerialNumber: '302002030366'
    }]
  }],
  totalCount: 1,
  page: 1
}

describe('SnmpAgentDetail', () => {
  const params = {
    tenantId: '15320bc221d94d2cb537fa0189fee742',
    policyId: '4b76b1952c80401b8500b00d68106576'
  }
  // eslint-disable-next-line max-len
  const detailPath = '/:tenantId/t/' + getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.DETAIL })


  beforeEach(async () => {
    store.dispatch(policyApi.util.resetApiState())

    mockServer.use(
      rest.post(ApSnmpRbacUrls.getApSnmpFromViewModel.url,
        (_, res, ctx) => res(ctx.json(mockRbacOverviewData))),
      rest.post(CommonRbacUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({
          data: [{
            id: '302002030366',
            name: 'R550_0131',
            venueId: 'f44d4134ecbb4ce5a1a41baca4dfe5de'
          }, {
            id: '302002030367',
            name: 'R550_02',
            venueId: 'f44d4134ecbb4ce5a1a41baca4dfe5de'
          }]
        }))),
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({
          data: [{
            id: 'f44d4134ecbb4ce5a1a41baca4dfe5de',
            name: 'My-Venue'
          }, {
            id: 'fffd4134ecbb4ce5a1a41baca4dfe5de',
            name: 'My-Venue-2'
          }]
        })))
    )
  })

  it('should create SNMP Agent Detail successfully', async () => {
    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    const snampOverviewData = mockRbacInstancesData.data[0]
    // Verify the settings
    // eslint-disable-next-line max-len
    expect(await screen.findByRole('heading', { level: 1, name: snampOverviewData.name })).toBeVisible()


    // Verify the instances
    const venueTable = await screen.findByTestId('venue-table')
    expect(venueTable).toBeVisible()

    const apTab = await screen.findByTestId('ap-tab')
    await userEvent.click(apTab)

    const apTable = await screen.findByTestId('ap-table')
    expect(apTable).toBeVisible()

    const venueTableAfterSwitch = screen.queryByTestId('venue-table')
    expect(venueTableAfterSwitch).not.toBeVisible()
  })

  it('should render breadcrumb correctly', async () => {
    render(
      <Provider>
        <SnmpAgentDetail />
      </Provider>, {
        route: { params, path: detailPath }
      }
    )

    expect(await screen.findByText('Network Control')).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'Policies & Profiles'
    })).toBeVisible()
    expect(screen.getByRole('link', {
      name: 'SNMP Agent'
    })).toBeVisible()
  })

})
