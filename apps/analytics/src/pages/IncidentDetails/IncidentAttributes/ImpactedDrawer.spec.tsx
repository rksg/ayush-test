import '@testing-library/jest-dom'

import React from 'react'

import { dataApiURL }                                from '@acx-ui/analytics/services'
import { Provider, store }                           from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { mockGraphqlQuery }                          from '@acx-ui/test-utils'

import {
  ImpactedAPsDrawer,
  ImpactedClientsDrawer,
  column,
  AggregatedImpactedAP
}                 from './ImpactedDrawer'
import { impactedApi, ImpactedAP, ImpactedClient } from './services'

jest.mock('@acx-ui/react-router-dom', () => ({
  ...(jest.requireActual('@acx-ui/react-router-dom')),
  TenantLink: ({ to, children }: { to: string, children: React.ReactNode }) =>
    <div>{to} - {children}</div>
}), { virtual: true })

describe('Drawer', () => {
  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
  afterAll(() => jest.resetAllMocks())
  describe('ImpactedAPsDrawer', () => {
    beforeEach(() => store.dispatch(impactedApi.util.resetApiState()))
    const props = { visible: true, onClose: jest.fn(), id: 'id', impactedCount: 1 }
    const sample = [
      { name: 'name', mac: 'mac', model: 'model', version: 'version' },
      { name: 'name 2', mac: 'mac', model: 'model 2', version: 'version 2' }
    ] as ImpactedAP[]
    it('should render loader', () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        data: { incident: { impactedAPs: sample } } })
      render(<Provider><ImpactedAPsDrawer {...props}/></Provider>, { route: true })
      expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    })
    it('should render drawer', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        data: { incident: { impactedAPs: sample } } })
      render(<Provider><ImpactedAPsDrawer {...props}/></Provider>, { route: true })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await screen.findByPlaceholderText('Search for...')
      await screen.findByText(new RegExp(`TBD(.*) - (.*)${sample[0].name}(.*)${sample[1].name}`))
      await screen.findByText(sample[0].mac)
      await screen.findByText(`${sample[0].model} (2)`)
      await screen.findByText(`${sample[0].version} (2)`)
      await screen.findByText('1 Impacted AP')
    })
    it('should render error', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        error: new Error('something went wrong!') })
      render(<Provider><ImpactedAPsDrawer {...props}/></Provider>, { route: true })
      await screen.findByText('Something went wrong.')
    })
  })
  describe('ImpactedClientsDrawer', () => {
    beforeEach(() => store.dispatch(impactedApi.util.resetApiState()))
    const props = { visible: true, onClose: jest.fn(), id: 'id', impactedCount: 1 }
    const sample = [
      {
        mac: 'mac',
        manufacturer: 'manufacturer',
        ssid: 'ssid',
        hostname: 'hostname',
        username: 'username'
      },
      {
        mac: 'mac',
        manufacturer: 'manufacturer 2',
        ssid: 'ssid 2',
        hostname: 'hostname 2',
        username: 'username 2'
      }
    ] as ImpactedClient[]
    it('should render loader', () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedClients', {
        data: { incident: { impactedClients: sample } } })
      render(<Provider><ImpactedClientsDrawer {...props}/></Provider>, { route: true })
      expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    })
    it('should render drawer', async () => {
      mockGraphqlQuery( dataApiURL, 'ImpactedClients', {
        data: { incident: { impactedClients: sample } } })
      render(<Provider><ImpactedClientsDrawer {...props}/></Provider>, { route: true })
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await screen.findByPlaceholderText('Search for...')
      await screen.findByText(sample[0].mac)
      await screen.findByText(`${sample[0].manufacturer} (2)`)
      await screen.findByText(`${sample[0].ssid} (2)`)
      await screen.findByText(
        new RegExp(`TBD(.*) - (.*)${sample[0].hostname}(.*)${sample[1].hostname}`)
      )
      await screen.findByText(`${sample[0].username} (2)`)
      await screen.findByText('1 Impacted Client')
      await screen.findByText('Hostname')
      const icons = await screen.findAllByText('InformationOutlined.svg')
      expect(icons.length).toBe(2)
    })
    it('should render error', async () => {
      mockGraphqlQuery( dataApiURL, 'ImpactedClients', {
        error: new Error('something went wrong!') })
      render(<Provider><ImpactedClientsDrawer {...props}/></Provider>, { route: true })
      await screen.findByText('Something went wrong.')
    })
  })
})

describe('column.sorter', () => {
  const sorter = column<AggregatedImpactedAP>('mac').sorter! as CallableFunction
  it('should return correct sort order', () => {
    expect(sorter({ mac: ['mac1'] }, { mac: ['mac2'] })).toBe(-1)
    expect(sorter({ mac: ['mac2'] }, { mac: ['mac1'] })).toBe(1)
  })
})

describe('column.render', () => {
  const render = column<AggregatedImpactedAP>('mac').render! as CallableFunction
  it('should return correct sort order', () => {
    expect(render(['mac1', 'mac2'], { mac: ['mac1', 'mac2'] })).toMatchSnapshot()
  })
})
