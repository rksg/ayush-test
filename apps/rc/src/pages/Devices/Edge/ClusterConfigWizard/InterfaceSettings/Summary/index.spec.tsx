
import { StepsForm }              from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgeGeneralFixtures }    from '@acx-ui/rc/utils'
import { render, screen }         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext, ClusterConfigWizardContextType } from '../../ClusterConfigWizardDataProvider'

import { Summary } from '.'

const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('./LagTable', () => ({
  ...jest.requireActual('./LagTable'),
  LagTable: () => <div data-testid='LagTable' />
}))
jest.mock('./PortGeneralTable', () => ({
  ...jest.requireActual('./PortGeneralTable'),
  PortGeneralTable: () => <div data-testid='PortGeneralTable' />
}))
jest.mock('./VipDisplayForm', () => ({
  ...jest.requireActual('./VipDisplayForm'),
  VipDisplayForm: () => <div data-testid='VipDisplayForm' />
}))
jest.mock('./HaDisplayForm', () => ({
  ...jest.requireActual('./HaDisplayForm'),
  HaDisplayForm: () => <div data-testid='HaDisplayForm' />
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
})