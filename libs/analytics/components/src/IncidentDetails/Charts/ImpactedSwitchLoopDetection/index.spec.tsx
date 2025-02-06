import { renderHook } from '@testing-library/react'
import { act }        from 'react-dom/test-utils'

import { fakeIncidentLoopDetection, fakeIncidentLoopDetectionOnSzCluster,
  overlapsRollup } from '@acx-ui/analytics/utils'
import { get }                                                            from '@acx-ui/config'
import { dataApi, dataApiURL, Provider, store }                           from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, fireEvent } from '@acx-ui/test-utils'

import { ImpactedVlan } from './services'

import { ImpactedVlanTable, useDrawer, vlanSorter } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
const mockOverlapsRollup = overlapsRollup as jest.Mock


describe('ImpactedVlanTable',()=>{
  const sample1:ImpactedVlan[] = [
    {
      vlanId: '1',
      switches: [
        {
          name: 'babyrdn_24p',
          mac: '5C:83:6C:3F:B2:C2',
          serial: 'FNY4828V00B',
          switchGroup: 'switch grp 0'
        }
      ]
    },
    {
      vlanId: '98',
      switches: [
        {
          name: 'ROD-135',
          mac: 'C0:C5:20:82:57:AE',
          serial: 'FNL4308T00K',
          switchGroup: 'switch grp 1'
        },
        {
          name: 'MM-126',
          mac: 'D4:C1:9E:17:90:97',
          serial: 'FLW3331P01Z',
          switchGroup: 'switch grp 2'
        }
      ]
    }
  ]

  const response = (data: ImpactedVlan[] = [
    ...sample1
  ]) => ({
    incident: {
      impactedVLANs: data
    }
  })

  describe('ImpactedVlanTable', () => {
    beforeEach(() => store.dispatch(dataApi.util.resetApiState()))
    it('should render for R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(
        <Provider>
          <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1')
      expect(within(rows[1]).getAllByRole('cell')[1].textContent).toMatch('MM-126')
    })

    it('should render for RA', async () => {
      jest.mocked(get).mockReturnValueOnce('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(
        <Provider>
          <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
        </Provider>, {
          route: {
            path: '/tenantId/t/analytics/incidents',
            wrapRoutes: false
          }
        })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      expect(rows).toHaveLength(2)
      expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1')
      expect(within(rows[1]).getAllByRole('cell')[1].textContent).toMatch('MM-126')
    })

    it('should copy the port numbers to clipboard', async () => {
      const writeText = jest.fn()
      Object.assign(navigator, {
        clipboard: {
          writeText
        }
      })
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider><ImpactedVlanTable incident={fakeIncidentLoopDetection} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      const body = within(await findTBody())
      const rows = await body.findAllByRole('row')
      fireEvent.click(within(rows[0]).getByTestId('CopyOutlined'))
      expect(writeText).toHaveBeenCalledWith('babyrdn_24p')
      writeText.mockReset()
      fireEvent.click(within(rows[1]).getByTestId('CopyOutlined'))
      expect(writeText).toHaveBeenCalledWith('ROD-135, MM-126')
    })

    it('should open the drawer with impacted switches in R1', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider><ImpactedVlanTable incident={fakeIncidentLoopDetection} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      fireEvent.click(await screen.findByRole('button', { name: /1/i }))
      expect(await screen.findByText(/1 impacted switch/i)).toBeVisible()
      fireEvent.click(await screen.findByRole('button', { name: /98/i }))
      expect(await screen.findByText(/2 impacted switches/i)).toBeVisible()
      expect(screen.queryByText(/switch group/i)).not.toBeInTheDocument()
    })

    it('should open the drawer with impacted switches in RA', async () => {
      jest.mocked(get).mockReturnValueOnce('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider><ImpactedVlanTable incident={fakeIncidentLoopDetection} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      fireEvent.click(await screen.findByRole('button', { name: /1/i }))
      expect(await screen.findByText(/1 impacted switch/i)).toBeVisible()
      fireEvent.click(await screen.findByRole('button', { name: /98/i }))
      expect(await screen.findByText(/2 impacted switches/i)).toBeVisible()
      expect(screen.queryByText(/switch group/i)).not.toBeInTheDocument()
    })

    it('should open the drawer with impacted switches in R1 - Incident on System', async () => {
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider><ImpactedVlanTable
        incident={fakeIncidentLoopDetectionOnSzCluster} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      fireEvent.click(await screen.findByRole('button', { name: /1/i }))
      expect(await screen.findByText(/1 impacted switch/i)).toBeVisible()
      fireEvent.click(await screen.findByRole('button', { name: /98/i }))
      expect(await screen.findByText(/2 impacted switches/i)).toBeVisible()
      expect(await screen.findByText(/switch group/i)).toBeVisible()
    })

    it('should open the drawer with impacted switches in RA - Incident on System', async () => {
      jest.mocked(get).mockReturnValueOnce('true')
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider><ImpactedVlanTable
        incident={fakeIncidentLoopDetectionOnSzCluster} /></Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

      fireEvent.click(await screen.findByRole('button', { name: /1/i }))
      expect(await screen.findByText(/1 impacted switch/i)).toBeVisible()
      fireEvent.click(await screen.findByRole('button', { name: /98/i }))
      expect(await screen.findByText(/2 impacted switches/i)).toBeVisible()
      expect(await screen.findByText(/switch group/i)).toBeVisible()
    })

    describe('useDrawer', () => {
      it('should set visible when onClose', () => {
        const { result } = renderHook(() => useDrawer(false))
        act(() => {
          result.current.onClose()
        })
        expect(result.current.visible).toEqual(false)
      })
    })


    it('should hide table when under druidRollup', async () => {
      jest.mocked(mockOverlapsRollup).mockReturnValue(true)
      mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
      render(<Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })
      await screen.findByText('Data granularity at this level is not available')
      jest.mocked(mockOverlapsRollup).mockReturnValue(false)
    })

  })
  describe('vlanSorter', () => {
    it('should return -1 when the first number is less than the second', () => {
      expect(vlanSorter('1', '2')).toBe(-1)
    })

    it('should return 1 when the first number is greater than the second', () => {
      expect(vlanSorter('2', 1)).toBe(1)
    })

    it('should return 0 when both numbers are equal', () => {
      expect(vlanSorter(2, '2')).toBe(0)
    })
  })
})