import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm } from '@acx-ui/components'
import { edgeApi }   from '@acx-ui/rc/services'
import {
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { SettingsForm } from '.'

const { mockedSdLanDataListP2 } = EdgeSdLanFixtures
const { mockEdgeClusterList } = EdgeGeneralFixtures

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    options,
    loading,
    ...props
  }: React.PropsWithChildren<{
    options: Array<{ label: string, value: unknown }>,
    loading: boolean,
    onChange?: (value: string) => void }>) => {
    return (loading
      ? <div role='img' data-testid='loadingIcon'>Loading</div>
      : <select {...props}
        onChange={(e) => {
          props.onChange?.(e.target.value)}
        }>
        {/* Additional <option> to ensure it is possible to reset value to empty */}
        <option value={undefined}></option>
        {children}
        {options?.map((option, index) => (
          <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
        ))}
      </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useHelpPageLink: () => ''
}))

const mockedSetFieldsValue = jest.fn()
const mockedReqClusterList = jest.fn()

describe('Edge SD-LAN form: settings', () => {
  beforeEach(() => {
    mockedSetFieldsValue.mockClear()
    mockedReqClusterList.mockClear()

    store.dispatch(edgeApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeClusterStatusList.url,
        (req, res, ctx) => {
          mockedReqClusterList(req.body)
          return res(ctx.json(mockEdgeClusterList))
        }
      )
    )
  })

  it('should render correctly without DMZ enabled', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await checkBasicSettings()

    // default DMZ is not enabled
    expect(await within(formBody).findByRole('switch')).not.toBeChecked()
  })

  it('should render correctly with DMZ enabled', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await checkBasicSettings()

    // turn on DMZ
    await userEvent.click(await within(formBody).findByRole('switch'))
    // select DMZ edge
    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' }),
      'clusterId_5')
    expect(mockedSetFieldsValue).toBeCalledWith({
      guestEdgeClusterName: 'Edge Cluster 5',
      guestEdgeClusterVenueId: '0000000005'
    })
  })

  it('Input invalid service name should show error message', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await checkBasicSettings()

    // default DMZ is not enabled
    expect(await within(formBody).findByRole('switch')).not.toBeChecked()

    const nameField = screen.getByRole('textbox', { name: 'Service Name' })
    await userEvent.type(nameField, '``')
    // eslint-disable-next-line max-len
    expect(await screen.findByText('Avoid spaces at the beginning/end, and do not use "`" or "$(" characters.'))
      .toBeVisible()
  })

  // eslint-disable-next-line max-len
  it('should filter out edges which is already bound with a SD-LAN service in create mode', async () => {
    const mockedSdLanDuplicateEdge = [{ ...mockedSdLanDataListP2[0] }]
    mockedSdLanDuplicateEdge[0].edgeClusterId = mockEdgeClusterList.data[4].clusterId

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDuplicateEdge }))
      )
    )

    render(<Provider>
      <StepsForm>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody).findAllByTestId('loadingIcon'))

    await screen.findByText('Cluster')
    await waitFor(() => {
      expect(mockedReqClusterList).toBeCalledWith({
        fields: ['name', 'venueId', 'clusterId', 'clusterStatus', 'hasCorePort'],
        pageSize: 10000
      })
    })
    expect(screen.queryByRole('option', { name: 'Smart Edge 5' })).toBeNull()
  })
  it('should be able to configure guest cluster when it is empty in edit mode', async () => {
    const expectedClusterId = 'clusterId_5'
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue({
        id: 'mocked-sd-lan-2',
        edgeClusterId: expectedClusterId,
        isGuestTunnelEnabled: false
      })
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current} editMode>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    const icons = await within(formBody).findAllByTestId('loadingIcon')
    await waitForElementToBeRemoved(icons)
    const dmzToggleBtn = await within(formBody).findByRole('switch')
    // default DMZ is not enabled
    expect(dmzToggleBtn).not.toBeChecked()
    // turn on DMZ
    await userEvent.click(dmzToggleBtn)
    const dmzSelector = await within(formBody).findByRole('combobox', { name: 'DMZ Cluster' })
    expect(dmzSelector).not.toBeDisabled()
    expect(dmzSelector).toBeVisible()
    expect(within(dmzSelector)
      .queryByRole('option', { name: 'Edge Cluster 5' })).toBeNull()
    expect(within(dmzSelector)
      .getByRole('option', { name: 'Edge Cluster 3' })).toBeValid()
  })

  it('should validate cluster doesnot configure core port ready', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldsValue').mockImplementation(mockedSetFieldsValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await checkBasicSettings()

    const alert = await within(formBody).findByRole('alert')
    expect(alert).toHaveTextContent('selected cluster must set up a Core port or LAG')
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')

  // wait edge options loaded
  await waitForElementToBeRemoved(await within(formBody)
    .findAllByTestId('loadingIcon'))

  // select edge
  await userEvent.selectOptions(
    await within(formBody).findByRole('combobox', { name: 'Cluster' }),
    'clusterId_2')

  // ensure related data to set into form
  expect(mockedSetFieldsValue).toBeCalledWith({
    edgeClusterName: 'Edge Cluster 2',
    venueId: '0000000002'
  })
}