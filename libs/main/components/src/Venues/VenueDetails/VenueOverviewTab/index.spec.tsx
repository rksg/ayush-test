import '@testing-library/jest-dom'
import { rest } from 'msw'

import { venueApi }                                                         from '@acx-ui/rc/services'
import { CommonUrlsInfo, WifiUrlsInfo, WifiRbacUrlsInfo }                   from '@acx-ui/rc/utils'
import { generatePath }                                                     from '@acx-ui/react-router-dom'
import { Provider, store  }                                                 from '@acx-ui/store'
import { mockServer, fireEvent, render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { triBandApCap } from '../../__tests__/fixtures'

import { VenueOverviewTab } from '.'

/* eslint-disable max-len */
jest.mock('@acx-ui/analytics/components', () => ({
  ConnectedClientsOverTime: () => <div data-testid={'analytics-ConnectedClientsOverTime'} title='ConnectedClientsOverTime' />,
  IncidentBySeverity: () => <div data-testid={'analytics-IncidentBySeverity'} title='IncidentBySeverity' />,
  NetworkHistory: () => <div data-testid={'analytics-NetworkHistory'} title='NetworkHistory' />,
  SwitchesTrafficByVolume: () => <div data-testid={'analytics-SwitchesTrafficByVolume'} title='SwitchesTrafficByVolume' />,
  TopSwitchModels: () => <div data-testid={'analytics-TopSwitchModels'} title='TopSwitchModels' />,
  TopApplicationsByTraffic: () => <div data-testid={'analytics-TopApplicationsByTraffic'} title='TopApplicationsByTraffic' />,
  TopSSIDsByClient: () => <div data-testid={'analytics-TopSSIDsByClient'} title='TopSSIDsByClient' />,
  TopSSIDsByTraffic: () => <div data-testid={'analytics-TopSSIDsByTraffic'} title='TopSSIDsByTraffic' />,
  TopSwitchesByError: () => <div data-testid={'analytics-TopSwitchesByError'} title='TopSwitchesByError' />,
  TopSwitchesByPoEUsage: () => <div data-testid={'analytics-TopSwitchesByPoEUsage'} title='TopSwitchesByPoEUsage' />,
  TopSwitchesByTraffic: () => <div data-testid={'analytics-TopSwitchesByTraffic'} title='TopSwitchesByTraffic' />,
  TrafficByVolume: () => <div data-testid={'analytics-TrafficByVolume'} title='TrafficByVolume' />,
  VenueHealth: () => <div data-testid={'analytics-VenueHealth'} title='VenueHealth' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  LowPowerBannerAndModal: () => <div data-testid={'rc-LowPowerBannerAndModal'} title='LowPowerBannerAndModal' />,
  VenueAlarmWidget: () => <div data-testid={'rc-VenueAlarmWidget'} title='VenueAlarmWidget' />,
  VenueDevicesWidget: () => <div data-testid={'rc-VenueDevicesWidget'} title='VenueDevicesWidget' />,
  TopologyFloorPlanWidget: () => <div data-testid={'rc-TopologyFloorPlanWidget'} title='TopologyFloorPlanWidget' />
}))

/* eslint-enable */

const params = { venueId: 'venue-id', tenantId: 'tenant-id' }
const url = generatePath(CommonUrlsInfo.getVenueDetailsHeader.url, params)

const venueDetailHeaderData = {
  venue: {
    name: 'testVenue'
  }
}

describe('VenueOverviewTab', () => {
  beforeEach(() => {
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.get(url, (_, res, ctx) => res(ctx.json(venueDetailHeaderData))),
      rest.get(
        WifiRbacUrlsInfo.getVenueRadioCustomization.url,
        (_, res, ctx) => res(ctx.json({}))),
      rest.get(
        WifiRbacUrlsInfo.getVenueDefaultRegulatoryChannels.url,
        (_, res, ctx) => res(ctx.json({ afcEnabled: true }))),
      rest.get(
        WifiUrlsInfo.getVenueApCapabilities.url,
        (_, res, ctx) => res(ctx.json(triBandApCap))),
      rest.post(
        CommonUrlsInfo.getApsList.url,
        (_, res, ctx) => res(ctx.json({ data: [] })))
    )
  })

  it('renders correctly', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })

    expect(await screen.findAllByTestId(/^analytics/)).toHaveLength(8)
    expect(await screen.findAllByTestId(/^rc/)).toHaveLength(3)
  })

  it('switches between tabs', async () => {
    render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
    await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

    const wifiWidgets = [
      'TrafficByVolume',
      'NetworkHistory',
      'ConnectedClientsOverTime',
      'TopApplicationsByTraffic',
      'TopSSIDsByTraffic',
      'TopSSIDsByClient'
    ]
    wifiWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())

    fireEvent.click(screen.getByRole('radio', { name: 'Switch' }))

    const switchWidgets = [
      'SwitchesTrafficByVolume',
      'TopSwitchesByPoEUsage',
      'TopSwitchesByTraffic',
      'TopSwitchesByError',
      'TopSwitchModels'
    ]
    switchWidgets.forEach(widget => expect(screen.getByTitle(widget)).toBeVisible())
  })

  describe('LowPowerBannerAndModal', () => {
    it('Should not show when country not support AFC', async () => {
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueDefaultRegulatoryChannels.url,
          (_, res, ctx) => res(ctx.json({ afcEnabled: false }))
        ),
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001050',
                name: 'AP-T670',
                model: 'T670'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTitle('LowPowerBannerAndModal')).not.toBeInTheDocument()
    })

    it('Should not show when 3R outdoor AP with venue height', async () => {
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json(
            { radioParams6G: {
              enableAfc: false,
              venueHeight: {
                minFloor: 1,
                maxFloor: 2
              }
            } }
          ))
        ),
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001050',
                name: 'AP-T670',
                model: 'T670'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTitle('LowPowerBannerAndModal')).not.toBeInTheDocument()
    })

    it('Should not show when no 3R AP', async () => {
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({ radioParams6G: { enableAfc: false } }))
        ),
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001048',
                name: 'AP-R550',
                model: 'R550'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTitle('LowPowerBannerAndModal')).not.toBeInTheDocument()
    })

    it('Should not show when 3R indoor AP with AFC disabled', async () => {
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({ radioParams6G: { enableAfc: false } }))
        ),
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001049',
                name: 'AP-R670',
                model: 'R670'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(screen.queryByTitle('LowPowerBannerAndModal')).not.toBeInTheDocument()
    })

    it('Should show when 3R outdoor AP exists', async () => {
      mockServer.use(
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001050',
                name: 'AP-T670',
                model: 'T670'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(await screen.findByTitle('LowPowerBannerAndModal')).toBeVisible()
    })

    it('Should show when 3R indoor AP with AFC enabled', async () => {
      mockServer.use(
        rest.get(
          WifiRbacUrlsInfo.getVenueRadioCustomization.url,
          (_, res, ctx) => res(ctx.json({ radioParams6G: { enableAfc: true } }))
        ),
        rest.post(
          CommonUrlsInfo.getApsList.url,
          (_, res, ctx) => res(ctx.json({
            data: [
              {
                serialNumber: '121749001049',
                name: 'AP-R670',
                model: 'R670'
              }
            ] }))
        )
      )
      render(<Provider><VenueOverviewTab /></Provider>, { route: { params } })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))

      expect(await screen.findByTitle('LowPowerBannerAndModal')).toBeVisible()
    })
  })

})
