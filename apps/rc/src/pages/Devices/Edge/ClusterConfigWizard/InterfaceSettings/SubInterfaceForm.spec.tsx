import { StepsForm }                              from '@acx-ui/components'
import { EdgeClusterStatus, EdgeGeneralFixtures } from '@acx-ui/rc/utils'
import { render, screen }                         from '@acx-ui/test-utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { SubInterfaceForm }           from './SubInterfaceForm'
import { transformFromApiToFormData } from './utils'

jest.mock('../SubInterfaceSettings/SubInterfaceSettingsForm', () => ({
  SubInterfaceSettingsForm: () => <div data-testid='SubInterfaceSettingsForm' />
}))

const { mockEdgeClusterList, mockedHaNetworkSettings } = EdgeGeneralFixtures
const mockedClusterInfo = mockEdgeClusterList.data[0] as EdgeClusterStatus

const mockedHaWizardNetworkSettings = transformFromApiToFormData(mockedHaNetworkSettings)

describe('InterfaceSettings - SubInterfaceForm', () => {
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
})