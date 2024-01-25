
import { Form } from 'antd'
import { rest } from 'msw'

import { venueApi, networkApi, apApi }                from '@acx-ui/rc/services'
import { WifiUrlsInfo, CommonUrlsInfo }               from '@acx-ui/rc/utils'
import { Provider, store }                            from '@acx-ui/store'
import { act, mockServer, render, screen, fireEvent } from '@acx-ui/test-utils'


import {
  mockApCompatibilitiesVenue,
  mockApCompatibilitiesNetwork,
  mockFeatureCompatibilities
} from './__test__/fixtures'

import {
  ApCompatibilityType,
  InCompatibilityFeatures,
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
    const venueId = '8caa8f5e01494b5499fa156a6c565138'
    const networkId = 'c9d5f4c771c34ad2898f7078cebbb191'
    const tenantId = 'ecc2d7cf9d2342fdb31ae0e24958fcac'
    const featureName = InCompatibilityFeatures.BETA_DPSK3
    let params = { tenantId, venueId, featureName: InCompatibilityFeatures.BETA_DPSK3 }
    const venueName = 'Test Venue'
    const mockedCloseDrawer = jest.fn()

    beforeEach(() => {
      act(() => {
        store.dispatch(venueApi.util.resetApiState())
        store.dispatch(networkApi.util.resetApiState())
        store.dispatch(apApi.util.resetApiState())
      })

      mockServer.use(
        rest.post(
          WifiUrlsInfo.getApCompatibilitiesVenue.url,
          (_, res, ctx) => res(ctx.json(mockApCompatibilitiesVenue))),
        rest.post(
          WifiUrlsInfo.getApCompatibilitiesNetwork.url,
          (_, res, ctx) => res(ctx.json(mockApCompatibilitiesNetwork))),
        rest.get(
          WifiUrlsInfo.getApFeatureSets.url.split('?')[0],
          (_, res, ctx) => res(ctx.json(mockFeatureCompatibilities))),
        rest.get(
          CommonUrlsInfo.getVenue.url.split('?')[0],
          (_, res, ctx) => res(ctx.json({ name: venueName })))
      )
    })
    it('should fetch and display render venue correctly', async () => {
      render(
        <Provider>
          <Form>
            <ApCompatibilityDrawer
              visible={true}
              type={ApCompatibilityType.VENUE}
              venueId={venueId}
              featureName={InCompatibilityFeatures.BETA_DPSK3}
              venueName={venueName}
              queryType={ApCompatibilityQueryTypes.CHECK_VENUE_WITH_FEATURE}
              onClose={mockedCloseDrawer}
            /></Form>
        </Provider>, {
          route: { params: { tenantId, venueId }, path: '/:tenantId' }
        })
      expect(await screen.findByText('7.0.0.0.123')).toBeInTheDocument()
      const icon = await screen.findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
    })

    it('should fetch and display render network correctly', async () => {
      render(
        <Provider>
          <Form>
            <ApCompatibilityDrawer
              visible={true}
              type={ApCompatibilityType.NETWORK}
              networkId={networkId}
              featureName={InCompatibilityFeatures.BETA_DPSK3}
              queryType={ApCompatibilityQueryTypes.CHECK_NETWORK}
              onClose={mockedCloseDrawer}
            /></Form>
        </Provider>, {
          route: { params: { tenantId, networkId }, path: '/:tenantId' }
        })
      expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()
      const icon = await screen.findByTestId('CloseSymbol')
      expect(icon).toBeVisible()
    })

    it('should fetch and display render alone correctly', async () => {
      render(
        <Provider>
          <Form>
            <ApCompatibilityDrawer
              visible={true}
              type={ApCompatibilityType.ALONE}
              featureName={InCompatibilityFeatures.BETA_DPSK3}
              onClose={mockedCloseDrawer}
            /></Form>
        </Provider>, {
          route: { params: { tenantId, featureName }, path: '/:tenantId' }
        })
      expect(await screen.findByText('6.2.3.103.251')).toBeInTheDocument()
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
              data={mockApCompatibilitiesVenue.apCompatibilities}
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
