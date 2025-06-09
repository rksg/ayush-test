
import { StepsForm }              from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }  from '@acx-ui/rc/components'
import { EdgeGeneralFixtures }    from '@acx-ui/rc/utils'
import { render, screen }         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext, ClusterConfigWizardContextType } from '../../ClusterConfigWizardDataProvider'

import { Summary } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('./LagTable', () => ({
  LagTable: () => <div data-testid='LagTable' />
}))
jest.mock('./PortGeneralTable', () => ({
  PortGeneralTable: () => <div data-testid='PortGeneralTable' />
}))
jest.mock('./VipDisplayForm', () => ({
  VipDisplayForm: () => <div data-testid='VipDisplayForm' />
}))
jest.mock('./HaDisplayForm', () => ({
  HaDisplayForm: () => <div data-testid='HaDisplayForm' />
}))
jest.mock('./SubInterfaceTable', () => ({
  SubInterfaceTable: () => <div data-testid='SubInterfaceTable' />
}))
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('InterfaceSettings - Summary', () => {
  beforeEach(() => {
    jest.mocked(useIsSplitOn).mockReturnValue(false)
  })
  it('should correctly render', async () => {
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0]
      } as ClusterConfigWizardContextType}>
        <StepsForm>
          <StepsForm.StepForm>
            <Summary />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(screen.getByTestId('VipDisplayForm')).toBeVisible()
  })

  it('should show HA setting when FF is on', async () => {
    jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.EDGE_HA_AA_TOGGLE)
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0]
      } as ClusterConfigWizardContextType}>
        <StepsForm>
          <StepsForm.StepForm>
            <Summary />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(screen.getByTestId('HaDisplayForm')).toBeVisible()
  })

  it('should show SubInterfaceTable when Core Access FF is on', async () => {
    jest.mocked(useIsEdgeFeatureReady)
      .mockImplementation(ff => ff === Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
    render(
      <ClusterConfigWizardContext.Provider value={{
        clusterInfo: mockEdgeClusterList.data[0]
      } as ClusterConfigWizardContextType}>
        <StepsForm>
          <StepsForm.StepForm>
            <Summary />
          </StepsForm.StepForm>
        </StepsForm>
      </ClusterConfigWizardContext.Provider>
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(screen.getByTestId('SubInterfaceTable')).toBeVisible()
  })
})