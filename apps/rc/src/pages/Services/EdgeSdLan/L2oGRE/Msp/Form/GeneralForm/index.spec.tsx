import userEvent from '@testing-library/user-event'

import { StepsForm }                                                        from '@acx-ui/components'
import { EdgeTunnelProfileFixtures, TunnelProfileViewData, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                         from '@acx-ui/store'
import { MockSelect, MockSelectProps, render, screen }                      from '@acx-ui/test-utils'

import { EdgeSdLanContext }    from '../../../Form/EdgeSdLanContextProvider'
import { MspEdgeSdLanContext } from '../MspEdgeSdLanContextProvider'

import { GeneralForm } from '.'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')
  const Select = (props: MockSelectProps) => {
    const { allowClear, ...rest } = props as MockSelectProps & { allowClear?: boolean }
    return <MockSelect {...rest}/>
  }
  // @ts-ignore
  Select.Option = ({ children, ...otherProps }) =>
    <option role='option' {...otherProps}>{children}</option>

  return { ...antd, Select }
})

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

jest.mock('@acx-ui/rc/services', () => ({
  ...jest.requireActual('@acx-ui/rc/services'),
  useGetEdgeFeatureSetsQuery: jest.fn().mockReturnValue({
    requiredFw: '2.5.0.1',
    isLoading: false
  }),
  useGetEdgeListQuery: jest.fn().mockReturnValue({
    nodesData: [
      {
        serialNumber: '1234567890',
        firmwareVersion: '2.5.0.1'
      }
    ],
    isFwVerFetching: false
  })
}))

const { mockedTunnelProfileViewData } = EdgeTunnelProfileFixtures

const defaultContext = {
  allSdLans: [],
  allPins: [],
  allSoftGreVenueMap: {},
  associatedEdgeClusters: [
    {
      clusterId: 'edge-cluster-1',
      hasCorePort: true
    }
  ],
  availableTunnelProfiles: mockedTunnelProfileViewData.data as TunnelProfileViewData[]
}

const defaultMspContext = {
  availableTunnelTemplates: mockedTunnelProfileViewData.data as TunnelProfileViewData[],
  associatedEdgeClusters: [
    {
      clusterId: 'edge-cluster-1',
      hasCorePort: true
    }
  ]
}

describe('GeneralForm - MSP', () => {
  it('should render correctly', () => {
    render(
      <EdgeSdLanContext.Provider
        value={defaultContext}
      >
        <MspEdgeSdLanContext.Provider
          value={defaultMspContext}
        >
          <StepsForm>
            <StepsForm.StepForm>
              <GeneralForm />
            </StepsForm.StepForm>
          </StepsForm>
        </MspEdgeSdLanContext.Provider>
      </EdgeSdLanContext.Provider>,
      { route: { path: '' } }
    )

    expect(screen.getByText('General')).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'Service Name' })).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'My Account' })).toBeVisible()
    expect(screen.getByRole('checkbox', { name: 'My Customers' })).toBeVisible()
  })

  it('should show tunnel selection when my account is selected', async () => {
    render(
      <Provider>
        <EdgeSdLanContext.Provider
          value={defaultContext}
        >
          <MspEdgeSdLanContext.Provider
            value={defaultMspContext}
          >
            <StepsForm>
              <StepsForm.StepForm>
                <GeneralForm />
              </StepsForm.StepForm>
            </StepsForm>
          </MspEdgeSdLanContext.Provider>
        </EdgeSdLanContext.Provider>
      </Provider>,
      { route: { path: '' } }
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'My Account' }))
    // eslint-disable-next-line max-len
    const tunnelProfileSelect = await screen.findByRole('combobox', { name: 'Tunnel Profile (AP to Cluster)' })
    expect(tunnelProfileSelect).toBeVisible()
    await userEvent.selectOptions(tunnelProfileSelect, 'tunnelProfile1')
    expect(await screen.findByText('Destination RUCKUS Edge cluster')).toBeVisible()
    expect(await screen.findByText('Cluster Firmware Version: 2.5.0.1')).toBeVisible()
  })

  it('should show tunnel template selection when my customers is selected', async () => {
    render(
      <Provider>
        <EdgeSdLanContext.Provider
          value={defaultContext}
        >
          <MspEdgeSdLanContext.Provider
            value={defaultMspContext}
          >
            <StepsForm>
              <StepsForm.StepForm>
                <GeneralForm />
              </StepsForm.StepForm>
            </StepsForm>
          </MspEdgeSdLanContext.Provider>
        </EdgeSdLanContext.Provider>
      </Provider>,
      { route: { path: '' } }
    )

    await userEvent.click(screen.getByRole('checkbox', { name: 'My Customers' }))
    // eslint-disable-next-line max-len
    const tunnelProfileSelect = await screen.findByRole('combobox', { name: 'Tunnel Profile Template (AP to Cluster)' })
    expect(tunnelProfileSelect).toBeVisible()
    await userEvent.selectOptions(tunnelProfileSelect, 'tunnelProfile1')
    expect(await screen.findByText('Destination RUCKUS Edge cluster')).toBeVisible()
    expect(await screen.findByText('Cluster Firmware Version: 2.5.0.1')).toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should show error message when tunnel profile and template have different configuration parameters', async () => {
    render(
      <Provider>
        <EdgeSdLanContext.Provider
          value={defaultContext}
        >
          <MspEdgeSdLanContext.Provider
            value={{
              ...defaultMspContext,
              availableTunnelTemplates: [
                {
                  id: 'tunnelProfile2',
                  name: 'Tunnel Profile 2',
                  destinationEdgeClusterId: 'edge-cluster-1',
                  tunnelType: TunnelTypeEnum.VXLAN_GPE
                }
              ] as TunnelProfileViewData[]
            }}
          >
            <StepsForm>
              <StepsForm.StepForm>
                <GeneralForm />
              </StepsForm.StepForm>
            </StepsForm>
          </MspEdgeSdLanContext.Provider>
        </EdgeSdLanContext.Provider>
      </Provider>,
      { route: { path: '' } }
    )

    await userEvent.type(screen.getByRole('textbox', { name: 'Service Name' }), 'test')
    await userEvent.click(screen.getByRole('checkbox', { name: 'My Account' }))
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Tunnel Profile (AP to Cluster)' }),
      'tunnelProfile1'
    )
    await userEvent.click(screen.getByRole('checkbox', { name: 'My Customers' }))
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Tunnel Profile Template (AP to Cluster)' }),
      'Tunnel Profile 2'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    // eslint-disable-next-line max-len
    expect(await screen.findByText('Tunnel profile and template must have identical configuration parameters')).toBeVisible()
  })
})