import { renderHook } from '@testing-library/react'
import { act }        from 'react-dom/test-utils'

import { fakeIncidentLoopDetection, fakeIncidentLoopDetectionOnDomain,
  fakeIncidentLoopDetectionOnSzCluster,
  overlapsRollup } from '@acx-ui/analytics/utils'
import { dataApi, dataApiURL, Provider, store }                                                      from '@acx-ui/store'
import { findTBody, mockGraphqlQuery, render, within, screen, fireEvent, waitForElementToBeRemoved } from '@acx-ui/test-utils'
import { handleBlobDownloadFile }                                                                    from '@acx-ui/utils'

import { ImpactedVlan } from './services'

import { ImpactedVlanTable, useDrawer, vlanSorter } from '.'

jest.mock('@acx-ui/analytics/utils', () => ({
  ...jest.requireActual('@acx-ui/analytics/utils'),
  overlapsRollup: jest.fn().mockReturnValue(false)
}))
jest.mock('@acx-ui/config', () => ({
  get: jest.fn()
}))
jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  handleBlobDownloadFile: jest.fn()
}))

const mockOverlapsRollup = overlapsRollup as jest.Mock
const mockHandleBlobDownloadFile = handleBlobDownloadFile as jest.Mock

describe('ImpactedVlanTable', () => {
  const sample1: ImpactedVlan[] = [
    {
      vlanId: '1',
      switches: [
        {
          name: 'babyrdn_24p',
          mac: '5C:83:6C:3F:B2:C2',
          serial: 'FNY4828V00B',
          switchGroup: 'switch grp 0',
          domains: ['domain1||Domain 1']
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
          switchGroup: 'switch grp 1',
          domains: ['domain2||Domain 2']
        },
        {
          name: 'MM-126',
          mac: 'D4:C1:9E:17:90:97',
          serial: 'FLW3331P01Z',
          switchGroup: 'switch grp 2',
          domains: ['domain3||Domain 3']
        }
      ]
    }
  ]

  const response = (data: ImpactedVlan[] = [...sample1]) => ({
    incident: {
      impactedVLANs: data
    }
  })

  beforeEach(() => {
    store.dispatch(dataApi.util.resetApiState())
    jest.clearAllMocks()
  })

  it('should render table with VLAN data', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(2)
    expect(within(rows[0]).getAllByRole('cell')[0].textContent).toMatch('1')
    expect(within(rows[1]).getAllByRole('cell')[1].textContent).toMatch('MM-126')
  })

  it('should handle CSV export with multiple VLANs', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('Loop-Detection-VLANs')
    )
  })

  it('should handle CSV export with single VLAN', async () => {
    const singleVlanResponse = {
      incident: {
        impactedVLANs: [{
          vlanId: '1',
          switches: [
            {
              name: 'babyrdn_24p',
              mac: '5C:83:6C:3F:B2:C2',
              serial: 'FNY4828V00B',
              switchGroup: 'switch grp 0',
              domains: ['domain1||Domain 1']
            }
          ]
        }]
      }
    }

    mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: singleVlanResponse })
    render(
      <Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const exportButton = await screen.findByTestId('DownloadOutlined')
    fireEvent.click(exportButton)

    expect(mockHandleBlobDownloadFile).toHaveBeenCalledWith(
      expect.any(Blob),
      expect.stringContaining('Loop-Detection-VLAN')
    )
  })

  it('should handle CSV export with empty data', async () => {
    const emptyResponse = {
      incident: {
        impactedVLANs: []
      }
    }

    mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: emptyResponse })
    render(
      <Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    // The export button should not be present when data is empty
    const exportButton = screen.queryByTestId('DownloadOutlined')
    expect(exportButton).not.toBeInTheDocument()
    expect(mockHandleBlobDownloadFile).not.toHaveBeenCalled()
  })

  it('should handle table sorting', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const vlanIdHeader = await screen.findByRole('columnheader', { name: /vlan id/i })
    fireEvent.click(vlanIdHeader)

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    const firstRow = rows[0]
    expect(firstRow).toHaveTextContent('1')
  })

  it('should handle search functionality', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const searchInput = await screen.findByPlaceholderText(/search vlan id/i)
    fireEvent.change(searchInput, { target: { value: '1' } })

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(2)
    expect(body.getByText('1')).toBeVisible()
  })

  it('should handle empty data state', async () => {
    const emptyResponse = {
      incident: {
        impactedVLANs: []
      }
    }

    mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: emptyResponse })
    render(
      <Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetection} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveClass('ant-table-placeholder')
  })

  it('should handle drawer interaction', async () => {
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByRole('button', { name: /1/i }))
    expect(await screen.findByText(/1 impacted switch/i)).toBeVisible()

    const drawer = await screen.findByRole('dialog')
    expect(drawer).toBeVisible()
    expect(drawer).toHaveTextContent('babyrdn_24p')
    expect(drawer).toHaveTextContent('5C:83:6C:3F:B2:C2')
  })

  it('should handle copy switch names to clipboard', async () => {
    const writeText = jest.fn()
    Object.assign(navigator, {
      clipboard: {
        writeText
      }
    })
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

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    const body = within(await findTBody())
    const rows = await body.findAllByRole('row')
    fireEvent.click(within(rows[0]).getByTestId('CopyOutlined'))
    expect(writeText).toHaveBeenCalledWith('babyrdn_24p')
  })

  it('should show domain information in switch group tooltip', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
    render(
      <Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetectionOnDomain} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))

    fireEvent.click(await screen.findByRole('button', { name: /1/i }))
    const switchGroupCell = await screen.findByText('switch grp 0')
    fireEvent.mouseEnter(switchGroupCell)

    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Some Domain')
    expect(tooltip).toHaveTextContent('switch grp 0')
  })

  it('should handle system cluster incidents', async () => {
    mockGraphqlQuery(dataApiURL, 'ImpactedVLANs', { data: response() })
    render(
      <Provider>
        <ImpactedVlanTable incident={fakeIncidentLoopDetectionOnSzCluster} />
      </Provider>, {
        route: {
          path: '/tenantId/t/analytics/incidents',
          wrapRoutes: false
        }
      })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    expect(await screen.findByText('VLANs')).toBeVisible()
  })

  it('should hide table when under druidRollup', async () => {
    jest.mocked(mockOverlapsRollup).mockReturnValue(true)
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

    await screen.findByText('Data granularity at this level is not available')
    jest.mocked(mockOverlapsRollup).mockReturnValue(false)
  })

  describe('useDrawer', () => {
    it('should handle drawer state correctly', () => {
      const { result } = renderHook(() => useDrawer(false))

      act(() => {
        result.current.onClose()
      })
      expect(result.current.visible).toEqual(false)

      act(() => {
        result.current.onOpen(sample1[0])
      })
      expect(result.current.visible).toEqual(true)
      expect(result.current.vlan).toEqual(sample1[0])
    })
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
