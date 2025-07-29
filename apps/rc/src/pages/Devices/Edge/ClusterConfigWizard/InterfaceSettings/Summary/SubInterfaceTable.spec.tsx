/* eslint-disable max-len */
import { Features }               from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }  from '@acx-ui/rc/utils'
import { render, screen, within } from '@acx-ui/test-utils'

import { defaultCxtData, mockClusterConfigWizardData } from '../../__tests__/fixtures'
import { ClusterConfigWizardContext }                  from '../../ClusterConfigWizardDataProvider'
import { InterfaceSettingsFormType }                   from '../types'

import { SubInterfaceTable } from './SubInterfaceTable'

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('InterfaceSettings - Summary > sub-interface table', () => {
  const mockUseIsEdgeFeatureReady = jest.mocked(useIsEdgeFeatureReady)

  beforeEach(() => {
    mockUseIsEdgeFeatureReady.mockReturnValue(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render correctly with all data provided', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={mockClusterConfigWizardData.lagSettings}
            portData={mockClusterConfigWizardData.portSettings}
            portSubInterfaceData={mockClusterConfigWizardData.portSubInterfaces as InterfaceSettingsFormType['portSubInterfaces']}
            lagSubInterfaceData={mockClusterConfigWizardData.lagSubInterfaces as unknown as InterfaceSettingsFormType['portSubInterfaces']}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('row', { name: 'Smart Edge 1 Port1 LAN STATIC 1.1.5.1 255.255.255.0 123' })).toBeVisible()
      expect(screen.getByRole('row', { name: 'Smart Edge 2 Port2 LAN STATIC 1.1.2.1 255.255.255.0 1' })).toBeVisible()
      expect(screen.getByRole('row', { name: 'Smart Edge 1 Lag0 LAN STATIC 1.1.3.1 255.255.255.0 1' })).toBeVisible()
      expect(screen.getByRole('row', { name: 'Smart Edge 2 Lag1 LAN DHCP 3' })).toBeVisible()
    })

    it('should render with empty data', () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable />
        </ClusterConfigWizardContext.Provider>
      )

      // Should render table headers but no data rows
      expect(screen.getByRole('columnheader', { name: 'RUCKUS Edge' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Interface Name' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Port Type' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'IP Type' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'IP Address' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Subnet Mask' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'VLAN' })).toBeVisible()
    })

    it('should render with undefined props', () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={undefined}
            portData={undefined}
            portSubInterfaceData={undefined}
            lagSubInterfaceData={undefined}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should render table headers but no data rows
      expect(screen.getByRole('columnheader', { name: 'RUCKUS Edge' })).toBeVisible()
    })
  })

  describe('Port sub-interface data processing', () => {
    it('should filter out ports that are LAG members', () => {
      const lagDataWithMembers = [
        {
          serialNumber: 'edge1',
          lags: [
            {
              id: 0,
              lagMembers: [{ portId: 'port_id_0' }]
            }
          ]
        }
      ]

      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ],
          port_id_1: [
            {
              id: '2',
              ip: '1.1.2.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 2
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }],
          port2: [{ id: 'port_id_1', interfaceName: 'port2' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={lagDataWithMembers}
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should only show port_id_1 data, not port_id_0 (which is a LAG member)
      expect(screen.queryByText('1.1.1.1')).not.toBeInTheDocument()
      expect(screen.getByText('1.1.2.1')).toBeInTheDocument()
    })

    it('should handle empty sub-interface arrays', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [],
          port_id_1: [
            {
              id: '2',
              ip: '1.1.2.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 2
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }],
          port2: [{ id: 'port_id_1', interfaceName: 'port2' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should only show data from port_id_1
      expect(screen.getByText('1.1.2.1')).toBeInTheDocument()
    })

    it('should handle missing port data for serial number', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        },
        edge2: undefined
      }

      const portData = {
        // No data for edge1
        edge2: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should still render the row but with empty interface name
      const row = screen.getByRole('row', { name: 'LAN STATIC 1.1.1.1 255.255.255.0 1' })
      expect(row).toBeVisible()
    })

    it('should handle missing port info for specific port ID', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ],
          different_port_id: undefined
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'different_port_id', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should still render the row but with empty interface name
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument()
    })
  })

  describe('LAG sub-interface data processing', () => {
    it('should filter out LAGs that are not in lagData', () => {
      const lagData = [
        {
          serialNumber: 'edge1',
          lags: [
            { id: 0 },
            { id: 1 }
          ]
        }
      ]

      const lagSubInterfaceData = {
        edge1: {
          0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ],
          2: [ // LAG ID 2 is not in lagData
            {
              id: '2',
              ip: '1.1.2.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 2
            }
          ]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={lagData}
            lagSubInterfaceData={lagSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should only show LAG 0 data, not LAG 2
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument()
      expect(screen.queryByText('1.1.2.1')).not.toBeInTheDocument()
    })

    it('should handle empty LAG sub-interface arrays', () => {
      const lagData = [
        {
          serialNumber: 'edge1',
          lags: [{ id: 0 }]
        }
      ]

      const lagSubInterfaceData = {
        edge1: {
          0: [],
          1: [
            {
              id: '2',
              ip: '1.1.2.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 2
            }
          ]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={lagData}
            lagSubInterfaceData={lagSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should not show any data since LAG 1 is not in lagData
      expect(screen.queryByText('1.1.2.1')).not.toBeInTheDocument()
    })

    it('should handle missing LAG data for serial number', () => {
      const lagSubInterfaceData = {
        edge1: {
          0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ],
          1: undefined
        },
        edge2: undefined
      }

      const lagData = [
        {
          serialNumber: 'edge2', // Different serial number
          lags: [{ id: 0 }]
        }
      ]

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={lagData}
            lagSubInterfaceData={lagSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should not show any data since edge1 is not in lagData
      expect(screen.queryByText('1.1.1.1')).not.toBeInTheDocument()
    })
  })

  describe('Edge name resolution', () => {
    it('should display edge name when found in cluster info', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      const contextWithEdge1 = {
        ...defaultCxtData,
        clusterInfo: {
          ...defaultCxtData.clusterInfo,
          edgeList: [
            { serialNumber: 'edge1', name: 'Test Edge 1' },
            { serialNumber: 'edge2', name: 'Test Edge 2' }
          ]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={contextWithEdge1}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByText('Test Edge 1')).toBeInTheDocument()
    })

    it('should display empty edge name when not found in cluster info', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      const contextWithoutEdge1 = {
        ...defaultCxtData,
        clusterInfo: {
          ...defaultCxtData.clusterInfo,
          edgeList: [
            { serialNumber: 'edge2', name: 'Test Edge 2' }
          ]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={contextWithoutEdge1}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should still render the row but with empty edge name
      const row = screen.getByRole('row', { name: 'Port1 LAN STATIC 1.1.1.1 255.255.255.0 1' })
      expect(row).toBeVisible()
    })

    it('should handle undefined cluster info', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      const contextWithoutClusterInfo = {
        ...defaultCxtData,
        clusterInfo: undefined
      }

      render(
        <ClusterConfigWizardContext.Provider value={contextWithoutClusterInfo}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should still render the row but with empty edge name
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument()
    })
  })

  describe('Interface name resolution', () => {
    it('should capitalize port interface names', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByText('Port1')).toBeInTheDocument()
    })

    it('should format LAG interface names correctly', () => {
      const lagData = [
        {
          serialNumber: 'edge1',
          lags: [{ id: 0 }]
        }
      ]

      const lagSubInterfaceData = {
        edge1: {
          0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={lagData}
            lagSubInterfaceData={lagSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByText('Lag0')).toBeInTheDocument()
    })

    it('should handle undefined interface name', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: undefined }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // Should still render the row but with empty interface name
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument()
    })
  })

  describe('Core Access feature toggle', () => {
    beforeEach(() => {
      mockUseIsEdgeFeatureReady.mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    })

    afterEach(() => {
      mockUseIsEdgeFeatureReady.mockReset()
    })

    it('should show core port and access port columns when FF is on', async () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={mockClusterConfigWizardData.lagSettings}
            portData={mockClusterConfigWizardData.portSettings}
            portSubInterfaceData={mockClusterConfigWizardData.portSubInterfaces as InterfaceSettingsFormType['portSubInterfaces']}
            lagSubInterfaceData={mockClusterConfigWizardData.lagSubInterfaces as unknown as InterfaceSettingsFormType['portSubInterfaces']}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('columnheader', { name: 'Core Port' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Access Port' })).toBeVisible()
    })

    it('should not show core port and access port columns when FF is off', () => {
      mockUseIsEdgeFeatureReady.mockReturnValue(false)

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            lagData={mockClusterConfigWizardData.lagSettings}
            portData={mockClusterConfigWizardData.portSettings}
            portSubInterfaceData={mockClusterConfigWizardData.portSubInterfaces as InterfaceSettingsFormType['portSubInterfaces']}
            lagSubInterfaceData={mockClusterConfigWizardData.lagSubInterfaces as unknown as InterfaceSettingsFormType['portSubInterfaces']}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.queryByRole('columnheader', { name: 'Core Port' })).not.toBeInTheDocument()
      expect(screen.queryByRole('columnheader', { name: 'Access Port' })).not.toBeInTheDocument()
    })

    it('should render CheckMark for enabled core ports', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1,
              corePortEnabled: true,
              accessPortEnabled: false
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      const row = screen.getByRole('row', { name: 'Port1 LAN STATIC 1.1.1.1 255.255.255.0 1' })
      // Should show CheckMark for core port
      const checkMark = within(row).getByTestId('CheckMark')
      expect(checkMark).toBeInTheDocument()
    })

    it('should render CheckMark for enabled access ports', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1,
              corePortEnabled: false,
              accessPortEnabled: true
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      const row = screen.getByRole('row', { name: 'Port1 LAN STATIC 1.1.1.1 255.255.255.0 1' })
      // Should show CheckMark for access port
      const checkMark = within(row).getByTestId('CheckMark')
      expect(checkMark).toBeInTheDocument()
    })

    it('should not render CheckMark for disabled ports', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1,
              corePortEnabled: false,
              accessPortEnabled: false
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      const row = screen.getByRole('row', { name: 'Port1 LAN STATIC 1.1.1.1 255.255.255.0 1' })
      const checkMarks = within(row).queryAllByTestId('CheckMark')
      expect(checkMarks.length).toBe(0)
    })
  })

  describe('Table structure and data', () => {
    it('should render all required columns', () => {
      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('columnheader', { name: 'RUCKUS Edge' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Interface Name' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Port Type' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'IP Type' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'IP Address' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Subnet Mask' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'VLAN' })).toBeVisible()
    })

    it('should generate correct row keys', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 123
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      // The row key should be: edge1-Port1-123
      expect(screen.getByText('1.1.1.1')).toBeInTheDocument()
    })

    it('should handle mixed data types (STATIC and DHCP)', () => {
      const portSubInterfaceData = {
        edge1: {
          port_id_0: [
            {
              id: '1',
              ip: '1.1.1.1',
              ipMode: 'STATIC',
              portType: 'LAN',
              subnet: '255.255.255.0',
              vlan: 1
            },
            {
              id: '2',
              ip: '2.2.2.2',
              ipMode: 'DHCP',
              portType: 'WAN',
              subnet: '255.255.255.0',
              vlan: 2
            }
          ]
        }
      }

      const portData = {
        edge1: {
          port1: [{ id: 'port_id_0', interfaceName: 'port1' }]
        }
      }

      render(
        <ClusterConfigWizardContext.Provider value={defaultCxtData}>
          <SubInterfaceTable
            portData={portData}
            portSubInterfaceData={portSubInterfaceData}
          />
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByRole('row', { name: 'Port1 LAN STATIC 1.1.1.1 255.255.255.0 1' })).toBeVisible()
      expect(screen.getByRole('row', { name: 'Port1 WAN DHCP 2' })).toBeVisible()
    })
  })
})
