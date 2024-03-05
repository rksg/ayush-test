import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }         from '@acx-ui/components'
import { edgeApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgeSdLanUrls,
  EdgeStatusEnum,
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

import { mockedVenueList } from '../../__tests__/fixtures'

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

const mockedSetFieldValue = jest.fn()
const mockedReqVenuesList = jest.fn()
const mockedReqClusterList = jest.fn()

describe('Edge SD-LAN form: settings', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear()
    mockedReqVenuesList.mockClear()
    mockedReqClusterList.mockClear()

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataListP2 }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => {
          mockedReqVenuesList(req.body)
          return res(ctx.json(mockedVenueList))
        }
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
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
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
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
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
    expect(mockedSetFieldValue).toBeCalledWith('guestEdgeClusterName', 'Edge Cluster 5')
  })

  it('should query specific venue and edge when edit mode', async () => {
    const expectedVenueId = 'venue_00005'
    const expectedClusterId = 'clusterId_5'

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('venueId', expectedVenueId)
      form.setFieldValue('edgeClusterId', expectedClusterId)
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current} editMode>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody).findAllByTestId('loadingIcon'))

    const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
    expect(venueDropdown).toBeDisabled()
    expect(mockedReqVenuesList).toBeCalledWith({
      fields: ['name', 'id', 'edges'],
      filters: { id: [expectedVenueId] }
    })
    await waitFor(() => {
      expect(mockedSetFieldValue).toBeCalledWith('venueName', 'SG office')
    })

    await waitFor(() => {
      expect(mockedReqClusterList).toBeCalledWith({
        fields: ['name', 'clusterId', 'venueId', 'clusterStatus'],
        filters: {
          venueId: [expectedVenueId],
          clusterId: [expectedClusterId],
          clusterStatus: Object.values(EdgeStatusEnum)
            .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
        }
      })
    })
  })

  it('Input invalid service name should show error message', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      jest.spyOn(form, 'setFieldValue').mockImplementation(mockedSetFieldValue)
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
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    const mockedSdLanDuplicateEdge = [{ ...mockedSdLanDataListP2[0] }]
    mockedSdLanDuplicateEdge[0].edgeClusterId = mockEdgeClusterList.data[4].clusterId

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDuplicateEdge }))
      )
    )

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await waitForElementToBeRemoved(await within(formBody).findAllByTestId('loadingIcon'))
    const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
    await userEvent.selectOptions(
      venueDropdown,
      'venue_00005')

    await waitForElementToBeRemoved(await within(formBody).findByTestId('loadingIcon'))

    await screen.findByText('Cluster')
    await waitFor(() => {
      expect(mockedReqClusterList).toBeCalledWith({
        fields: ['name', 'clusterId', 'venueId', 'clusterStatus'],
        filters: {
          venueId: [mockedVenueList.data[4].id],
          clusterStatus: Object.values(EdgeStatusEnum)
            .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
        }
      })
    })
    expect(screen.queryByRole('option', { name: 'Smart Edge 5' })).toBeNull()
  })
})

const checkBasicSettings = async () => {
  const formBody = await screen.findByTestId('steps-form-body')
  const icons = await within(formBody).findAllByTestId('loadingIcon')
  await waitForElementToBeRemoved(icons)
  // select venue
  const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
  await userEvent.selectOptions(
    venueDropdown,
    'venue_00002')

  // wait edge options loaded
  await waitForElementToBeRemoved(await within(formBody)
    .findAllByTestId('loadingIcon'))

  expect(mockedSetFieldValue).toBeCalledWith('venueName', 'airport')
  expect(mockedSetFieldValue).toBeCalledWith('edgeClusterId', undefined)

  // select edge
  await userEvent.selectOptions(
    await within(formBody).findByRole('combobox', { name: 'Cluster' }),
    'clusterId_2')

  // ensure related data to set into form
  expect(mockedSetFieldValue).toBeCalledWith('edgeClusterName', 'Edge Cluster 2')
}