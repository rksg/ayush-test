import { fakeIncident1 }               from '@acx-ui/analytics/utils'
import { get }                         from '@acx-ui/config'
import { dataApiURL, Provider, store } from '@acx-ui/store'
import { mockGraphqlQuery, render, screen, waitForElementToBeRemoved,
  findTBody, within }                                                from '@acx-ui/test-utils'

import { mockImpactedSwitches, mockImpactedSwitchesWithUnknown } from './__tests__/fixtures'
import { api }                                                   from './services'

import { SwitchDetail, ImpactedSwitchPortConjestionTable } from '.'

describe('SwitchDetails', () => {
  beforeEach(() => {
    store.dispatch(api.util.resetApiState())
  })

  it('should render correctly', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1, apCount: 10 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('ICX8200-24P Router')).toBeVisible()

    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('ICX8200')).toBeVisible()

    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('38:45:3B:3C:F1:20')).toBeVisible()

    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findByText('RDR10020_b237')).toBeVisible()
  })
  it('should render empty data', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', {
      data: { incident: { impactedSwitches: [] } } })
    render(
      <Provider>
        <SwitchDetail incident={{ ...fakeIncident1 }}/>
      </Provider>
    )
    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    expect(await screen.findByText('Switch Name')).toBeVisible()
    expect(await screen.findByText('Switch Model')).toBeVisible()
    expect(await screen.findByText('Switch MAC')).toBeVisible()
    expect(await screen.findByText('Switch Firmware Version')).toBeVisible()
    expect(await screen.findAllByText('--')).toHaveLength(4)
    expect(screen.queryByText('InformationOutlined')).toBeNull()
  })
})

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils')
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('ImpactedSwitchPortCongestion',()=>{

  describe('ImpactedSwitchPortConjestionTable', () => {
    beforeEach(() => {
      store.dispatch(api.util.resetApiState())
    })

    it('should render for R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(await screen.findByText('Impacted Ports')).toBeVisible()
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('Device 1')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')
    })
    it('should render for R1 with unknown peer device', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitchesWithUnknown)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(1)
      expect(await screen.findByText('Impacted Port')).toBeVisible()
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('-')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')
    })
    it('should render for RA', async () => {
      jest.mocked(get).mockReturnValue('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitches', mockImpactedSwitches)
      render(
        <Provider>
          <ImpactedSwitchPortConjestionTable incident={fakeIncident1} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('Device 1')
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1/2/3')

    })
  })
})
