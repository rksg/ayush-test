import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { StepsForm }                                                     from '@acx-ui/components'
import { Features }                                                      from '@acx-ui/feature-toggle'
import { EdgeClusterStatus, EdgeGeneralFixtures, useIsEdgeFeatureReady } from '@acx-ui/rc/utils'
import { render, screen }                                                from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import { transformFromApiToFormData } from '../utils'

import { SubInterfaceForm } from './SubInterfaceForm'

jest.mock('../SubInterfaceSettings/SubInterfaceSettingsForm', () => ({
  SubInterfaceSettingsForm: () => <div data-testid='SubInterfaceSettingsForm' />
}))

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const mockedClusterInfo = mockEdgeClusterList.data[0] as EdgeClusterStatus

const mockedHaWizardNetworkSettings = transformFromApiToFormData(mockedHaNetworkSettings)

describe('InterfaceSettings - SubInterfaceForm', () => {
  afterEach(() => {
    jest.mocked(useIsEdgeFeatureReady).mockReset()
  })

  it('should render correctly', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        clusterNetworkSettings: mockedHaNetworkSettings,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm initialValues={mockedHaWizardNetworkSettings}>
          <StepsForm.StepForm>
            <SubInterfaceForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('Sub-interface Settings')).toBeVisible()
    expect(screen.getByTestId('SubInterfaceSettingsForm')).toBeVisible()
  })

  it('should render correctly when all are data empty', async () => {
    const mockInvalidData = cloneDeep(mockedHaNetworkSettings)
    mockInvalidData.portSettings = []
    mockInvalidData.lagSettings = []
    mockInvalidData.subInterfaceSettings = undefined

    // eslint-disable-next-line max-len
    const mockedInvalidGatewayWizardNetworkSettings = transformFromApiToFormData(mockInvalidData)
    mockedInvalidGatewayWizardNetworkSettings.portSettings = undefined
    mockedInvalidGatewayWizardNetworkSettings.lagSettings = undefined

    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockedClusterInfo,
        clusterNetworkSettings: mockInvalidData,
        isLoading: false,
        isFetching: false
      }}>
        <StepsForm initialValues={mockedInvalidGatewayWizardNetworkSettings}>
          <StepsForm.StepForm>
            <SubInterfaceForm />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('Sub-interface Settings')).toBeVisible()
    expect(screen.getByTestId('SubInterfaceSettingsForm')).toBeVisible()
  })

  describe('clusterGatewayValidate', () => {
    // eslint-disable-next-line max-len
    it('should correctly validate gateway existed with validateEdgeClusterLevelGateway', async () => {
      const mockOnFinish = jest.fn()
      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          clusterNetworkSettings: mockedHaNetworkSettings,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm initialValues={mockedHaWizardNetworkSettings} onFinish={mockOnFinish}>
            <StepsForm.StepForm>
              <SubInterfaceForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByText('Sub-interface Settings')).toBeVisible()
      expect(screen.getByTestId('SubInterfaceSettingsForm')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))
      expect(mockOnFinish).toBeCalled()
    })

    it('should block submit when core port / WAN port not existed', async () => {
      const targetSerialNumber = mockedClusterInfo.edgeList![1].serialNumber
      const mockInvalidGateway = cloneDeep(mockedHaNetworkSettings)
      // eslint-disable-next-line max-len
      const targetPortIdx = mockInvalidGateway.portSettings.findIndex(port => port.serialNumber === targetSerialNumber)
      mockInvalidGateway.portSettings[targetPortIdx].ports[1].corePortEnabled = false
      // eslint-disable-next-line max-len
      const mockedInvalidGatewayWizardNetworkSettings = transformFromApiToFormData(mockInvalidGateway)

      const mockOnFinish = jest.fn()
      render(
        <ClusterConfigWizardContext.Provider value={{
          clusterInfo: mockedClusterInfo,
          clusterNetworkSettings: mockInvalidGateway,
          isLoading: false,
          isFetching: false
        }}>
          <StepsForm
            initialValues={mockedInvalidGatewayWizardNetworkSettings}
            onFinish={mockOnFinish}
          >
            <StepsForm.StepForm>
              <SubInterfaceForm />
            </StepsForm.StepForm>
          </StepsForm>
        </ClusterConfigWizardContext.Provider>
      )

      expect(screen.getByText('Sub-interface Settings')).toBeVisible()
      expect(screen.getByTestId('SubInterfaceSettingsForm')).toBeVisible()
      await userEvent.click(screen.getByRole('button', { name: 'Add' }))

      const error = await screen.findByRole('alert')
      expect(error).toBeVisible()
      // eslint-disable-next-line max-len
      expect(error).toHaveTextContent('Each Edge at least one port must be enabled and configured to WAN or Core port to form a cluster.')
      expect(mockOnFinish).toBeCalledTimes(0)
    })

    describe('when core access separation enabled', () => {
      beforeEach(() => {
        // eslint-disable-next-line max-len
        jest.mocked(useIsEdgeFeatureReady).mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
      })

      // eslint-disable-next-line max-len
      it('should block submit when core and access port not existed at same time', async () => {
        const targetSerialNumber = mockedClusterInfo.edgeList![1].serialNumber
        const mockInvalidCoreAccess = cloneDeep(mockedHaNetworkSettings)
        // eslint-disable-next-line max-len
        const targetPortIdx = mockInvalidCoreAccess.portSettings.findIndex(port => port.serialNumber === targetSerialNumber)
        mockInvalidCoreAccess.portSettings[targetPortIdx].ports[1].corePortEnabled = false
        // eslint-disable-next-line max-len
        const mockedInvalidCoreAccessWizardNetworkSettings = transformFromApiToFormData(mockInvalidCoreAccess)

        const mockOnFinish = jest.fn()
        render(
          <ClusterConfigWizardContext.Provider value={{
            clusterInfo: mockedClusterInfo,
            clusterNetworkSettings: mockInvalidCoreAccess,
            isLoading: false,
            isFetching: false
          }}>
            <StepsForm
              initialValues={mockedInvalidCoreAccessWizardNetworkSettings}
              onFinish={mockOnFinish}
            >
              <StepsForm.StepForm>
                <SubInterfaceForm />
              </StepsForm.StepForm>
            </StepsForm>
          </ClusterConfigWizardContext.Provider>
        )

        expect(screen.getByText('Sub-interface Settings')).toBeVisible()
        expect(screen.getByTestId('SubInterfaceSettingsForm')).toBeVisible()
        await userEvent.click(screen.getByRole('button', { name: 'Add' }))

        const error = await screen.findByRole('alert')
        expect(error).toBeVisible()
        expect(error).toHaveTextContent('Core and Access ports must be configured simultaneously.')
        expect(mockOnFinish).toBeCalledTimes(0)
      })
    })
  })
})