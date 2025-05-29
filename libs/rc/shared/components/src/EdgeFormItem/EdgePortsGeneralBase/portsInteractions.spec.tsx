import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import {
  ClusterNetworkSettings,
  EdgePortConfigFixtures,
  EdgePortInfo,
  EdgeGeneralFixtures,
  EdgeClusterStatus
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  render,
  screen,
  waitFor
} from '@acx-ui/test-utils'

import { transformApiDataToFormListData } from './utils'

import { EdgePortsGeneralBase } from '.'

jest.mock('@acx-ui/utils', () => {
  const reactIntl = jest.requireActual('react-intl')
  const intl = reactIntl.createIntl({
    locale: 'en'
  })
  return {
    ...jest.requireActual('@acx-ui/utils'),
    getIntl: () => intl
  }
})

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, onChange, ...props }: React.PropsWithChildren<{
    onChange?: (value: string) => void,
  }>) => {
    return (
      <select onChange={(e) => onChange?.(e.target.value)} value='' {...props}>
        {children ? children : null}
      </select>
    )
  }
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('../../useEdgeActions', () => ({
  useIsEdgeFeatureReady: jest.fn()
}))

const {
  mockEdgePortConfigWithStatusIpWithoutCorePort,
  mockPortInfo
} = EdgePortConfigFixtures
// eslint-disable-next-line max-len
const formPortConfigWithStatusIpWithoutCorePort = transformApiDataToFormListData(mockEdgePortConfigWithStatusIpWithoutCorePort.ports)

const { mockEdgeClusterList } = EdgeGeneralFixtures

const mockedOnTabChange = jest.fn()

const mockedProps = {
  clusterInfo: mockEdgeClusterList.data[0] as EdgeClusterStatus,
  statusData: mockPortInfo as EdgePortInfo[],
  isEdgeSdLanRun: false,
  activeTab: '',
  onTabChange: mockedOnTabChange,
  fieldHeadPath: []
}

describe('EditEdge ports - ports general - user actions', () => {

  describe('subnet overlap', () => {

    const MockedComponent = (props: { vipConfig?: ClusterNetworkSettings['virtualIpSettings'] })=>
      <Provider>
        <Form initialValues={formPortConfigWithStatusIpWithoutCorePort}>
          <EdgePortsGeneralBase {...mockedProps} {...props} />
          <button>Submit</button>
        </Form>
      </Provider>


    it('should not check subnet overlapped on DHCP port', async () => {
      render(<MockedComponent />)

      await userEvent.click(screen.getByRole('tab', { name: 'Port2' }))
      const ipInput1 = screen.getByRole('textbox', { name: 'IP Address' })
      await userEvent.clear(ipInput1)
      await userEvent.type(ipInput1, '1.1.1.1')
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      await screen.findAllByText('The ports have overlapping subnets')

      // change Port2 port type from LAN to WAN
      const portTypeSelect = screen.getByRole('combobox', { name: 'Port Type' })
      await userEvent.selectOptions(portTypeSelect,
        await screen.findByRole('option', { name: 'WAN' }))

      // change Port2 ip mode to DHCP
      const ipModeRadio = await screen.findByRole('radio', { name: 'DHCP' })
      await userEvent.click(ipModeRadio)
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      // eslint-disable-next-line max-len
      await waitFor(() => expect(screen.queryAllByText('The ports have overlapping subnets').length).toBe(0))
    })
  })
})