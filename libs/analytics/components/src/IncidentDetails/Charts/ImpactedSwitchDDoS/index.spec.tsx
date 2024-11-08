import { fakeIncidentDDoS, overlapsRollup }     from '@acx-ui/analytics/utils'
import { get }                                  from '@acx-ui/config'
import { dataApi, dataApiURL, Provider, store } from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render,
  within, screen, fireEvent } from '@acx-ui/test-utils'

import { ImpactedSwitch } from './services'

import { ImpactedSwitchDDoSDonut, ImpactedSwitchDDoSTable } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock

Object.assign(navigator, {
  clipboard: {
    writeText: () => {}
  }
})

describe('ImpactedSwitchDDoS',()=>{
  const sample1:ImpactedSwitch[] = [{
    name: 'ICX7150-C12 Router',
    mac: '58:FB:96:0B:12:CA',
    serial: 'FEK3215S0H7',
    ports: [
      {
        portNumber: '1/1/1'
      }
    ]
  },
  {
    name: 'ICX7650-48ZP Router',
    mac: 'D4:C1:9E:14:C3:99',
    serial: 'EZC3307P01H',
    ports: [
      {
        portNumber: '1/1/1'
      },
      {
        portNumber: '1/1/23'
      },
      {
        portNumber: '1/1/1'
      }
    ]
  }
  ]

  const response = (data: ImpactedSwitch[] = [
    ...sample1
  ]) => ({
    incident: {
      impactedSwitchDDoS: data,
      switchCount: 5
    }
  })

  describe('ImpactedSwitchDDoSTable', () => {
    beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
    it('should render for R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      render(
        <Provider>
          <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('58:FB:96:0B:12:CA')
      expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('1/1/1, 1/1/23')
    })
    it('should copy the port numbers to clipboard', async () => {
      jest.spyOn(navigator.clipboard, 'writeText')
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      render(<Provider><ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      fireEvent.click(within(rows[0]).getByTestId('CopyOutlined'))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1/1/1')
      fireEvent.click(within(rows[1]).getByTestId('CopyOutlined'))
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('1/1/1, 1/1/23')
    })
    it('should render for RA', async () => {
      jest.mocked(get).mockReturnValue('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      render(
        <Provider>
          <ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[1].textContent).toMatch('58:FB:96:0B:12:CA')
      expect(within(rows[1]).getAllByRole('cell')[3].textContent).toMatch('1/1/1, 1/1/23')

    })
    it('should hide table when under druidRollup', async () => {
      jest.mocked(mockOverlapsRollup).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      render(<Provider><ImpactedSwitchDDoSTable incident={fakeIncidentDDoS} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })
      await screen.findByText('Data granularity at this level is not available')
      jest.mocked(mockOverlapsRollup).mockReturnValue(false)
    })
  })

  describe('ImpactedSwitchDDoSDonut', () => {
    beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
    it('should render', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      const { asFragment } = render(<Provider>
        <ImpactedSwitchDDoSDonut incident={fakeIncidentDDoS} />
      </Provider>)
      await screen.findByText('Switch Distribution')
      expect(asFragment()
        .querySelector('div.ant-card-body > div:nth-child(1) > div > div > div > div:nth-child(1)'))
        .toMatchSnapshot()
    })
    it('should hide chart when under druidRollup', async () => {
      jest.mocked(mockOverlapsRollup).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'ImpactedSwitchDDoS', { data: response() })
      render(<Provider>
        <ImpactedSwitchDDoSDonut incident={fakeIncidentDDoS} />
      </Provider>)
      await screen.findByText('Switch Distribution')
      await screen.findByText('Data granularity at this level is not available')
      jest.mocked(mockOverlapsRollup).mockReturnValue(false)
    })
  })
})