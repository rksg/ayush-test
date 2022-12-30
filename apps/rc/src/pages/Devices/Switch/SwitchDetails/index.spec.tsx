import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { apApi }                                                 from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo }                        from '@acx-ui/rc/utils'
import { Provider, store }                                       from '@acx-ui/store'
import { mockServer, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { switchDetailData }   from './__tests__/fixtures'
import { events, eventsMeta } from './SwitchTimelineTab/__tests__/fixtures'

import SwitchDetails from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/components', () => ({
  ...jest.requireActual('@acx-ui/components'),
  RangePicker: () => <div data-testid={'analytics-RangePicker'} title='RangePicker' />
}))

describe('SwitchDetails', () => {
  beforeEach(() => {
    store.dispatch(apApi.util.resetApiState())
    mockServer.use(
      rest.get( SwitchUrlsInfo.getSwitchDetailHeader.url,
        (_, res, ctx) => res(ctx.json(switchDetailData))),
      rest.post(CommonUrlsInfo.getEventList.url,
        (_, res, ctx) => res(ctx.json(events))),
      rest.post(CommonUrlsInfo.getEventListMeta.url,
        (_, res, ctx) => res(ctx.json(eventsMeta)))
    )
  })

  it('should render correctly', async () => {
    const params = {
      tenantId: 'tenantId',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })

    expect(screen.getAllByRole('tab')).toHaveLength(13)
  })

  it('should navigate to incidents tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'incidents'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to troubleshooting tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'troubleshooting'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to reports tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'reports'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to clients tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'clients'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to configuration tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to DHCP tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'dhcp'
    }
    const { asFragment } = render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    expect(asFragment()).toMatchSnapshot()
  })

  it('should navigate to timeline tab correctly', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'timeline'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('730-11-60')
  })

  it('should not navigate to non-existent tab', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'not-exist'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })

    expect(screen.getAllByRole('tab').filter(x => x.getAttribute('aria-selected') === 'true'))
      .toHaveLength(0)
  })
  it('should go to edit page', async () => {
    const params = {
      tenantId: 'tenant-id',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'overview'
    }
    render(<Provider><SwitchDetails /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab' }
    })

    await userEvent.click(await screen.findByRole('button', { name: 'Configure' }))
  })
})
