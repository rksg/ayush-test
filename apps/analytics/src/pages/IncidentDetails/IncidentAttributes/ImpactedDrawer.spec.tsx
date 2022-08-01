import '@testing-library/jest-dom'

import React from 'react'

import { dataApiURL }                                from '@acx-ui/analytics/services'
import { BrowserRouter as Router }                   from '@acx-ui/react-router-dom'
import { Provider, store }                           from '@acx-ui/store'
import { render, screen, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { mockGraphqlQuery }                          from '@acx-ui/test-utils'

import {
  ImpactedAPsDrawer,
  ImpactedClientsDrawer,
  sortCell,
  renderCell,
  AggregatedImpactedAP
}                 from './ImpactedDrawer'
import { impactedAPsApi, impactedClientsApi, ImpactedAP, ImpactedClient } from './services'


jest.mock('@acx-ui/icons', ()=> ({
  ...(jest.requireActual('@acx-ui/icons')),
  InformationOutlined: () => <div data-testid='information'/>
}), { virtual: true })

jest.mock('@acx-ui/react-router-dom', () => ({
  ...(jest.requireActual('@acx-ui/react-router-dom')),
  TenantLink: ({ to, children }: { to: string, children: React.ReactNode }) =>
    <div>{to} - {children}</div>
}), { virtual: true })

describe('Drawer', () => {
  beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}))
  afterAll(() => jest.resetAllMocks())
  describe('ImpactedAPsDrawer', () => {
    beforeEach(() => store.dispatch(impactedAPsApi.util.resetApiState()))
    const props = { visible: true, onClose: jest.fn(), id: 'id' }
    const sample = [
      { name: 'name', mac: 'mac', model: 'model', version: 'version' }
    ] as ImpactedAP[]
    it('should render loader', () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        data: { incident: { impactedAPs: sample } } })
      render(<Provider><ImpactedAPsDrawer {...props}/></Provider>)
      expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    })
    it('should render drawer', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        data: { incident: { impactedAPs: sample } } })
      render(<Router><Provider><ImpactedAPsDrawer {...props}/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await screen.findByPlaceholderText('Search for...')
      await screen.findByText(sample[0].name)
      await screen.findByText(`TBD - ${sample[0].mac}`)
      await screen.findByText(sample[0].model)
      await screen.findByText(sample[0].version)
      await screen.findByText(`${sample.length} Impacted AP`)
    })
    it('should render error', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedAPs', {
        error: new Error('something went wrong!') })
      render(<Provider><ImpactedAPsDrawer {...props}/></Provider>)
      await screen.findByText('Something went wrong.')
    })
  })
  describe('ImpactedClientsDrawer', () => {
    beforeEach(() => store.dispatch(impactedClientsApi.util.resetApiState()))
    const props = { visible: true, onClose: jest.fn(), id: 'id' }
    const sample = [{
      mac: 'mac',
      manufacturer: 'manufacturer',
      ssid: 'ssid',
      hostname: 'hostname',
      username: 'username' }] as ImpactedClient[]
    it('should render loader', () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedClients', {
        data: { incident: { impactedClients: sample } } })
      render(<Provider><ImpactedClientsDrawer {...props}/></Provider>)
      expect(screen.getByRole('img', { name: 'loader' })).toBeVisible()
    })
    it('should render drawer', async () => {
      mockGraphqlQuery( dataApiURL, 'ImpactedClients', {
        data: { incident: { impactedClients: sample } } })
      render(<Router><Provider><ImpactedClientsDrawer {...props}/></Provider></Router>)
      await waitForElementToBeRemoved(() => screen.queryByLabelText('loader'))
      await screen.findByPlaceholderText('Search for...')
      await screen.findByText(`TBD - ${sample[0].mac}`)
      await screen.findByText(sample[0].manufacturer)
      await screen.findByText(sample[0].ssid)
      await screen.findByText(sample[0].hostname)
      await screen.findByText(sample[0].username)
      await screen.findByText(`${sample.length} Impacted Client`)
      const icons = await screen.findAllByTestId('information')
      expect(icons.length).toBe(2)
    })
    it('should render error', async () => {
      mockGraphqlQuery( dataApiURL, 'ImpactedClients', {
        error: new Error('something went wrong!') })
      render(<Provider><ImpactedClientsDrawer {...props}/></Provider>)
      await screen.findByText('Something went wrong.')
    })
  })
})

describe('sortCell', () => {
  it('should return correct sort order', () => {
    expect(sortCell<Pick<AggregatedImpactedAP,'mac'>>('mac')({ mac: ['mac1'] },{ mac: ['mac2'] }))
      .toBe(-1)
    expect(sortCell<Pick<AggregatedImpactedAP,'mac'>>('mac')({ mac: ['mac2'] },{ mac: ['mac1'] }))
      .toBe(1)
  })
})

describe('renderCell', () => {
  it('should return correct sort order', () => {
    expect(renderCell<Pick<AggregatedImpactedAP,'mac'>>('mac')(null, { mac: ['mac1', 'mac2'] }))
      .toMatchSnapshot()
    expect(sortCell<Pick<AggregatedImpactedAP,'mac'>>('mac')({ mac: ['mac1'] },{ mac: ['mac2'] }))
      .toBe(-1)
    expect(sortCell<Pick<AggregatedImpactedAP,'mac'>>('mac')({ mac: ['mac2'] },{ mac: ['mac1'] }))
      .toBe(1)
  })
})