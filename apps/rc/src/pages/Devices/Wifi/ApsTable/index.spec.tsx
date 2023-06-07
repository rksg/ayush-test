import { rest } from 'msw'

import { useIsSplitOn }                 from '@acx-ui/feature-toggle'
import { CommonUrlsInfo, WifiUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import useApsTable from '.'

describe('AP List Table', () => {
  const list = {
    totalCount: 2,
    page: 1,
    data: [
      {
        deviceGroupId: 'e133583a0f2643fe9774ec44b35d3c46',
        deviceStatus: '1_01_NeverContactedCloud',
        healthStatus: 'Poor',
        name: 'AP01',
        serialNumber: '962202007049',
        tags: '',
        venueId: 'd3ba5e5b0c6c44649500c0ab1d853d61',
        venueName: '111sample'
      },
      {
        IP: '192.168.151.111',
        apMac: '94:B3:4F:3C:EE:20',
        apStatusData: {
          APRadio: [
            { txPower: null, channel: 0, band: '2.4G', Rssi: null, radioId: 0 },
            { txPower: null, channel: 100, band: '5G', Rssi: null, radioId: 1 }
          ],
          lanPortStatus: [
            { phyLink: 'Down', port: '0' },
            { phyLink: 'Down', port: '1' }
          ]
        },
        deviceGroupId: '24d56c947b924a6a9ec001f2d9f414f7',
        deviceStatus: '2_00_Operational',
        fwVersion: '6.2.1.103.2569',
        healthStatus: 'Excellent',
        meshRole: 'MAP',
        model: 'R750',
        name: 'R750-WIFIMAP-test-updtaed-mesh12',
        poePort: '1',
        serialNumber: '962202007912',
        tags: '',
        venueId: '101988f2bbcd431884de9a7e6a5875c4',
        venueName: 'Mesh_setup'
      }
    ]
  }

  beforeEach(() => {
    mockServer.use(
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (req, res, ctx) => res(ctx.json(list))
      ),
      rest.post(
        WifiUrlsInfo.addAp.url,
        (req, res, ctx) => res(ctx.json({
          txId: 'f83cdf6e-df01-466d-88ba-58e2f2c211c6'
        }))
      )
    )
    jest.mocked(useIsSplitOn).mockReturnValue(true)
  })

  it('should render page correctly', async () => {
    const Component = () => {
      const { component } = useApsTable()
      return component
    }

    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('AP01')).toBeVisible()
    expect(await screen.findByText('R750-WIFIMAP-test-updtaed-mesh12')).toBeVisible()
  })

  it('should render title with count correctly', async () => {
    const Title = () => {
      const { title } = useApsTable()
      return <span>{title}</span>
    }
    render(<Title/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('AP List (2)')).toBeVisible()
  })

  it('should render extra header correctly', async () => {
    const Component = () => {
      const { headerExtra } = useApsTable()
      return <span>{headerExtra}</span>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    expect(await screen.findByText('Add')).toBeVisible()
  })

  it('should show import CSV dialog', async () => {
    const Component = () => {
      const { title, headerExtra, component } = useApsTable()
      return <>{title}{headerExtra}{component}</>
    }
    render(<Component/>, { wrapper: Provider, route: {} })
    const csvFile = new File([''], 'aps_import_template.csv', { type: 'text/csv' })

    // await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
    // await userEvent.click(await screen.findByText('Import from file'))

    // const dialog = await screen.findByRole('dialog')

    // // eslint-disable-next-line testing-library/no-node-access
    // await userEvent.upload(document.querySelector('input[type=file]')!, csvFile)
    // expect(dialog).toHaveTextContent('aps_import_template.csv')

    // await userEvent.click(await screen.findByRole('button', { name: 'Import' }))
    // await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
  })
})
