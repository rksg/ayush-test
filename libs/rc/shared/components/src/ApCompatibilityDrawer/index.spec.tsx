
import { Form } from 'antd'
import { rest } from 'msw'

import { venueApi }                              from '@acx-ui/rc/services'
import { ApCompatibility, WifiUrlsInfo }         from '@acx-ui/rc/utils'
import { Provider, store }                       from '@acx-ui/store'
import { mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'

import { InCompatibilityFeatures,
  ApCompatibilityQueryTypes,
  ApCompatibilityToolTip,
  ApFeatureCompatibility,
  ApCompatibilityDrawer } from '.'

describe('ApCompatibilityToolTip > ApFeatureCompatibility > ApCompatibilityDrawer', () => {
  describe('ApCompatibilityToolTip', () => {
    it('should visible render correctly', async () => {
      render(<ApCompatibilityToolTip title={'Simple tooltip'} visible={true} onClick={() => {}} />)
      const icon = await screen.findByTestId('QuestionMarkCircleOutlined')
      expect(icon).toBeVisible()
    })

    it('should invisible render correctly', async () => {
      render(<ApCompatibilityToolTip title={'Simple tooltip'} visible={false} onClick={() => {}} />)
      expect(screen.queryByTestId('tooltip-button')).toBeNull()
    })

  })

  describe('ApFeatureCompatibility', () => {
    it('should Fully compatible render correctly', async () => {
      render(<ApFeatureCompatibility count={0} onClick={() => {}} />)
      const icon = await screen.findByTestId('CheckMarkCircleSolid')
      expect(icon).toBeVisible()
    })

    it('should Partially incompatible render correctly', async () => {
      render(<ApFeatureCompatibility count={2} onClick={() => {}} />)
      const icon = await screen.findByTestId('WarningTriangleSolid')
      expect(icon).toBeVisible()
    })

    it('should Unknow render correctly', async () => {
      render(<ApFeatureCompatibility onClick={() => {}} />)
      const icon = await screen.findByTestId('Unknown')
      expect(icon).toBeVisible()
    })

  })

  describe('ApCompatibilityDrawer', () => {
    const venueId = 'Test VenueId'
    let params = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac', venueId }
    const venueName = 'Test Venue'
    const mockedCloseDrawer = jest.fn()
    const mockApCompatibilities: ApCompatibility[] = [
      {
        id: '48b026b6e6544dbcaf4d59216a64b6d2',
        incompatibleFeatures: [ {
          featureName: 'EXAMPLE-FEATURE-1',
          requiredFw: '7.0.0.0.123',
          requiredModel: '11be',
          incompatibleDevices: [{
            firmware: '6.2.3.103.233',
            model: 'R550',
            count: 1
          }]
        }
        ],
        total: 1,
        incompatible: 1
      },{
        id: '74d0491836274f3aab6754e6e8c85aca',
        incompatibleFeatures: [ {
          featureName: 'EXAMPLE-FEATURE-3',
          requiredFw: '6.2.3.103.250',
          incompatibleDevices: [{
            firmware: '6.2.3.103.233',
            model: 'R550',
            count: 1
          }]
        }
        ],
        total: 1,
        incompatible: 1
      }
    ]
    beforeEach(() => {
      store.dispatch(venueApi.util.resetApiState())
      mockServer.use(
        rest.post(
          WifiUrlsInfo.getApCompatibilitiesVenue.url,
          (_, res, ctx) => res(ctx.json(mockApCompatibilities)))
      )
    })
    it('should fetch and display render correctly', async () => {
      render(
        <Provider>
          <Form>
            <ApCompatibilityDrawer
              visible={true}
              venueId={venueId}
              featureName={InCompatibilityFeatures.BETA_DPSK3}
              venueName={venueName}
              queryType={ApCompatibilityQueryTypes.CHECK_VENUE_WITH_FEATURE}
              onClose={mockedCloseDrawer}
            /></Form>
        </Provider>, {
          route: { params, path: '/:tenantId' }
        })
      expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
      const icon = await screen.findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
    })

    it('should direct display render correctly', async () => {
      render(
        <Provider>
          <Form>
            <ApCompatibilityDrawer
              isMultiple
              visible={true}
              data={mockApCompatibilities}
              onClose={mockedCloseDrawer}
            /></Form>
        </Provider>, {
          route: { params, path: '/:tenantId' }
        })
      expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
      const icon = await screen.findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
      fireEvent.click(icon)
      expect(mockedCloseDrawer).toBeCalledTimes(1)
    })
  })

})
