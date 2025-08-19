import { Form, Input } from 'antd'
import { cloneDeep }   from 'lodash'

import { StepsForm, StepsFormProps } from '@acx-ui/components'
import {
  ClusterHighAvailabilityModeEnum,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeTunnelProfileFixtures,
  TunnelProfileViewData
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  renderHook,
  screen
} from '@acx-ui/test-utils'

import { EdgeSdLanContext, EdgeSdLanContextType } from '../EdgeSdLanContextProvider'

import { GeneralForm } from '.'

const { mockedMvSdLanDataList } = EdgeSdLanFixtures
const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures
const mockEdgeClusterList = cloneDeep(EdgeGeneralFixtures.mockEdgeClusterList)
mockEdgeClusterList.data[4].highAvailabilityMode = ClusterHighAvailabilityModeEnum.ACTIVE_STANDBY

const edgeMvSdlanContextValues = {
  allSdLans: mockedMvSdLanDataList,
  allPins: [],
  availableTunnelProfiles: mockedTunnelProfileViewData.data as unknown as TunnelProfileViewData[]
} as unknown as EdgeSdLanContextType

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

const mockeTunnelProfileFormItem = <Form.Item
  name='tunnelProfileId'
  data-testid='TunnelProfileFormItem'
  children={<Input />}
/>
jest.mock('../../shared/TunnelProfileFormItem', () => ({
  TunnelProfileFormItem: () => mockeTunnelProfileFormItem
}))

jest.mock('../../shared/ClusterFirmwareInfo', () => ({
  ClusterFirmwareInfo: () => <div data-testid='ClusterFirmwareInfo'>ClusterFirmwareInfo</div>
}))

// eslint-disable-next-line max-len
type MockedTargetComponentType = Pick<StepsFormProps, 'form' | 'editMode'> & {
  ctxValues?: EdgeSdLanContextType
}
const MockedTargetComponent = (props: MockedTargetComponentType) => {
  const { form, editMode, ctxValues } = props
  return <Provider>
    <EdgeSdLanContext.Provider value={ctxValues ?? edgeMvSdlanContextValues}>
      <StepsForm form={form} editMode={editMode}>
        <GeneralForm />
      </StepsForm>
    </EdgeSdLanContext.Provider>
  </Provider>
}

describe('Edge SD-LAN form: General', () => {
  it('should render correctly', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        tunnelProfileId: 'tunnelProfileId1'
      })
      return form
    })
    render(<MockedTargetComponent form={stepFormRef.current} />)

    expect(screen.getByRole('textbox', { name: 'Service Name' })).toBeVisible()
    expect(screen.getByTestId('TunnelProfileFormItem')).toBeVisible()
    expect(screen.getByTestId('ClusterFirmwareInfo')).toBeVisible()
    expect(screen.getByText('topology-vertical.svg')).toBeVisible()
  })
})
