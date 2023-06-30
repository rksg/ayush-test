
/* eslint-disable max-len */
import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                       from '@acx-ui/store'
import {
  fireEvent,
  mockServer,
  render,
  screen,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { SwitchConfigHistoryTable } from '.'

jest.mock('../CodeMirrorWidget', () => ({
  CodeMirrorWidget: () => <div data-testid='CodeMirrorWidget' />
}))

const list = {
  response: {
    totalCount: 3,
    list: [
      {
        switchName: '7150stack',
        startTime: '2023-01-02T18:04:36.294+00:00',
        endTime: '2023-01-02T18:05:38.244+00:00',
        serialNumber: 'FEK3230S0A0',
        configType: 'VE_PORTS',
        dispatchStatus: 'FAILED',
        clis: "* add [ ve port ]\n\t- 'id' = 3\n\t- 'vlan id' = 3",
        numberOfErrors: 2,
        transactionId: '162f20c5-a63a-4f08-8b70-07bc3596b35b',
        dispatchFailedReason: [
          {
            lineNumber: '12',
            message: 'set-name'
          },
          {
            lineNumber: '310',
            message: 'set-name'
          }
        ]
      },
      {
        switchName: '7150stack',
        startTime: '2023-01-03T02:59:46.454+00:00',
        endTime: '2023-01-03T03:00:05.182+00:00',
        serialNumber: 'FEK3230S0A0',
        configType: 'VE_PORTS',
        dispatchStatus: 'SUCCESS',
        clis: "* update [ ve port ]\n\t- 'id' = 1\n\t- 'name' = 2d2\n\n",
        numberOfErrors: 0,
        transactionId: 'c172337a-2292-4651-a733-8e8dd8d112c5'
      },
      {
        switchName: '7150stack',
        startTime: '2023-01-03T02:58:14.082+00:00',
        endTime: '2023-01-03T02:58:14.296+00:00',
        serialNumber: 'FEK3230S0A0',
        configType: 'VE_PORTS',
        dispatchStatus: 'NO_CONFIG_CHANGE',
        numberOfErrors: 1,
        transactionId: '2945b565-5d4c-4fa5-a214-89d67307158d',
        dispatchFailedReason: [
          {
            lineNumber: 'N/A',
            message: 'Configuration has no any changed.'
          }
        ]
      }
    ]
  }
}

const venueConfigList = {
  response: {
    list: [{
      configType: ['PORT_CONFIGURATION'],
      numberOfFailed: 0,
      numberOfNotifySuccess: 0,
      numberOfSuccess: 2,
      numberOfSwitches: 2,
      startTime: '1/13/23, 11:34 AM',
      transactionId: '626c8b67-77b3-4b3d-9592-d1458da0f8a6'
    }, {
      configType: ['PORT_CONFIGURATION'],
      numberOfFailed: 1,
      numberOfNotifySuccess: 0,
      numberOfSuccess: 1,
      numberOfSwitches: 2,
      startTime: '1/13/23, 10:55 AM',
      transactionId: '4dfa2a49-d266-415b-86bc-661671e2260e'
    }, {
      configType: ['VLAN', 'PORT_CONFIGURATION'],
      numberOfFailed: 1,
      numberOfNotifySuccess: 0,
      numberOfSuccess: 1,
      numberOfSwitches: 2,
      startTime: '1/13/23, 7:51 AM',
      transactionId: 'b8ae27fd-8f42-4dd5-9e0f-b24373775731'
    }]
  }
}

const venueConfigDetails = {
  response: {
    list: [{
      clis: "* update [ Port ]\n\t- 'interface ethernet' = 1/1/7\n\t- 'portEnable' = true\n\t- 'portProtected' = false\n\t- 'poeEnable' = true\n\t- 'rstpAdminEdgePort' = false\n\t- 'stpBpduGuard' = false\n\t- 'stpRootGuard' = false\n\t- 'dhcpSnoopingTrust' = false\n\t- 'arpInspectionTrust' = false\n\t- 'ipsg' = false\n\t- 'lldpEnable' = false\n\n* update [ Port ]\n\t- 'interface ethernet' = 1/1/9\n\t- 'portEnable' = true\n\t- 'portProtected' = false\n\t- 'poeEnable' = true\n\t- 'rstpAdminEdgePort' = false\n\t- 'stpBpduGuard' = false\n\t- 'stpRootGuard' = false\n\t- 'dhcpSnoopingTrust' = true\n\t- 'arpInspectionTrust' = false\n\t- 'ipsg' = false\n\t- 'lldpEnable' = false\n\n* update [ Port ]\n\t- 'interface ethernet' = 1/1/6\n\t- 'portEnable' = true\n\t- 'portProtected' = false\n\t- 'untaggedVlan' = 1\n\t- 'poeEnable' = true\n\t- 'rstpAdminEdgePort' = false\n\t- 'stpBpduGuard' = false\n\t- 'stpRootGuard' = false\n\t- 'dhcpSnoopingTrust' = false\n\t- 'arpInspectionTrust' = false\n\t- 'ipsg' = false\n\t- 'lldpEnable' = false\n\t- 'lldpQos' = [\n\t\t{\n\t\t\t- 'applicationType' = GUEST_VOICE\n\t\t\t- 'qosVlanType' = PRIORITY_TAGGED\n\t\t\t- 'priority' = 2\n\t\t\t- 'dscp' = 33\n\t\t}\n\t  ]\n\n* update [ Port ]\n\t- 'interface ethernet' = 1/1/8\n\t- 'portEnable' = true\n\t- 'portProtected' = false\n\t- 'untaggedVlan' = 1\n\t- 'poeEnable' = true\n\t- 'rstpAdminEdgePort' = false\n\t- 'stpBpduGuard' = false\n\t- 'stpRootGuard' = false\n\t- 'dhcpSnoopingTrust' = false\n\t- 'arpInspectionTrust' = false\n\t- 'ipsg' = false\n\t- 'lldpEnable' = false\n\n",
      configType: 'PORT_CONFIGURATION',
      dispatchStatus: 'SUCCESS',
      endTime: '2023-01-13T07:53:29.708+00:00',
      numberOfErrors: 0,
      serialNumber: 'FEK3224R0AG',
      startTime: '2023-01-13T07:51:32.800+00:00',
      switchName: 'FEK3224R0AG',
      transactionId: 'b8ae27fd-8f42-4dd5-9e0f-b24373775731'
    }, {
      clis: "* update [ Vlan ]\n\t- 'id' = 6\n\t- 'name' = \n\t- 'ip dhcp snooping' = false\n\t- 'ip arp inspection' = true\n\t- 'multicast' = none\n\t- 'spanning-tree' = none\n\t- 'spanning-tree priority' = 32768\n\t- 'ethernet' = [\n\t\t{\n\t\t\t- 'tagged ethe' = 1/1/2\n\t\t\t- 'untagged ethe' = \n\t\t}\n\t  ]\n\n* remove [ Vlan ]\n\t- 'id' = 5\n\n* remove [ Vlan ]\n\t- 'id' = 7\n\n",
      configType: 'VLAN',
      dispatchFailedReason: [{ lineNumber: '272', message: 'data missing' }],
      dispatchStatus: 'FAILED',
      endTime: '2023-01-13T07:51:54.902+00:00',
      numberOfErrors: 1,
      serialNumber: 'FEK3224R0AG',
      startTime: '2023-01-13T07:51:32.799+00:00',
      switchName: 'FEK3224R0AG',
      transactionId: 'b8ae27fd-8f42-4dd5-9e0f-b24373775731'
    }]
  }
}

describe('SwitchConfigHistoryTable', () => {
  afterEach(() => jest.restoreAllMocks())

  beforeEach(() => {
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getSwitchConfigHistory.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        CommonUrlsInfo.getVenueConfigHistory.url,
        (req, res, ctx) => res(ctx.json(venueConfigList))
      ),
      rest.post(
        CommonUrlsInfo.getVenueConfigHistoryDetail.url,
        (req, res, ctx) => res(ctx.json(venueConfigDetails))
      )
    )
  })

  it('should render failed case correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.response.list.length)

    const row1 = await screen.findByRole('row', { name: /Failed/i })
    await userEvent.click(await within(row1).findByRole('button'))
    expect(await screen.findByTestId('CodeMirrorWidget')).toBeVisible()
    expect(await screen.findByText('Errors (2)')).toBeVisible()
    fireEvent.click(await screen.findByText('310'))
    const collapsedButton = await screen.findByTestId('ArrowCollapsed')
    await userEvent.click(collapsedButton)
    await userEvent.click(await screen.findByText('Close'))
  })

  it('should render success case correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const row2 = await screen.findByRole('row', { name: /Success/i })
    await userEvent.click(await within(row2).findByRole('button'))
    expect(await screen.findByTestId('CodeMirrorWidget')).toBeVisible()
  })

  it('should render no clis case correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      switchId: 'switchId',
      serialNumber: 'serialNumber',
      activeTab: 'configuration',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable /></Provider>, {
      route: { params, path: '/:tenantId/devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()

    const row3 = await screen.findByRole('row', { name: /No Config Change/i })
    await userEvent.click(await within(row3).findByRole('button'))
    expect(await screen.findByText('Errors (1)')).toBeVisible()
  })

  it('should render success/failed case in venue level correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: 'venueId',
      activeTab: 'switch',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable isVenueLevel={true} /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.response.list.length)

    await userEvent.click(await within(rows[2]).findByRole('button'))
    const modal = await screen.findByRole('dialog')
    const radios = await within(modal).findAllByRole('radio')
    expect(await within(modal).findByText(/Configuration Details/i)).toBeVisible()
    expect(await within(modal).findByText(/VLAN, Port Configuration/i)).toBeVisible()
    expect(await screen.findByTestId('CodeMirrorWidget')).toBeVisible()
    expect(radios).toHaveLength(6)
    fireEvent.click(radios[5])

    fireEvent.click(await within(modal).findByText(/Notify Success/i))
    expect(await screen.findByTestId('CodeMirrorWidget')).toBeVisible()
  })

  it('should render no clis case in venue level correctly', async () => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueConfigHistory.url,
        (req, res, ctx) => res(ctx.json({
          response: {
            list: [{
              configType: ['PORT_CONFIGURATION'],
              numberOfSwitches: 1,
              startTime: '1/13/23, 11:34 AM',
              transactionId: '626c8b67-77b3-4b3d-9592-d1458da0f8a6'
            }]
          }
        }))
      ),
      rest.post(
        CommonUrlsInfo.getVenueConfigHistoryDetail.url,
        (req, res, ctx) => res(ctx.json({
          response: {
            list: [{
              configType: 'PORT_CONFIGURATION',
              dispatchStatus: 'PENDING',
              numberOfErrors: 0,
              startTime: '2023-01-13T07:46:18.605+00:00',
              transactionId: '0fbe9d1b-b7f1-4398-bc19-d3fb29dc2c8f',
              clis: '---'
            }, {
              configType: 'PORT_CONFIGURATION',
              dispatchStatus: 'PENDING',
              numberOfErrors: 0,
              startTime: '2023-01-13T07:46:18.605+00:00',
              transactionId: '0fbe9d1b-b7f1-4398-bc19-d3fb29dc2c9f'
            }]
          }
        }))
      )
    )

    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: 'venueId',
      activeTab: 'switch',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable isVenueLevel={true} /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(1)

    await userEvent.click(await within(rows[0]).findByRole('button'))
    const modal = await screen.findByRole('dialog')
    const radios = await within(modal).findAllByRole('radio')
    await within(modal).findByText('Not applied yet')

    fireEvent.click(radios[5])
    fireEvent.click(await within(modal).findByText('Success'))
    expect(await screen.findByTestId('CodeMirrorWidget')).toBeVisible()
  })

  it('should reset radio value correctly', async () => {
    const params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      venueId: 'venueId',
      activeTab: 'switch',
      activeSubTab: 'history'
    }

    render(<Provider><SwitchConfigHistoryTable isVenueLevel={true} /></Provider>, {
      route: { params, path: '/:tenantId/venues/:venueId/edit/:activeTab/:activeSubTab' }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    // eslint-disable-next-line testing-library/no-node-access
    const tbody = (await screen.findByRole('table')).querySelector('tbody')!
    expect(tbody).toBeVisible()
    const rows = await within(tbody).findAllByRole('row')
    expect(rows).toHaveLength(list.response.list.length)

    await userEvent.click(await within(rows[2]).findByRole('button'))
    const modal = await screen.findByRole('dialog')
    const radios = await within(modal).findAllByRole('radio')
    fireEvent.click(radios[2])

    const closeBtns = await within(modal).findAllByRole('button', { name: 'Close' })
    await userEvent.click(closeBtns[0])
    const checkedRadios = (await within(modal).findAllByRole('radio', { checked: true })) as HTMLInputElement[]
    const checkedRadio = checkedRadios.filter(x => x.checked && x.value === 'ALL')
    expect(checkedRadio).toHaveLength(1)
  })
})
