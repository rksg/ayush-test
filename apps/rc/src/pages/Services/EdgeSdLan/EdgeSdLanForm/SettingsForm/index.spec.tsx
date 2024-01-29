import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }                                         from '@acx-ui/components'
import { useIsSplitOn }                                      from '@acx-ui/feature-toggle'
import { edgeApi, edgeSdLanApi, tunnelProfileApi, venueApi } from '@acx-ui/rc/services'
import {
  CommonUrlsInfo,
  EdgeGeneralFixtures,
  EdgeSdLanFixtures,
  EdgePortConfigFixtures,
  EdgeSdLanUrls,
  EdgeStatusEnum,
  EdgeUrlsInfo,
  TunnelProfileUrls,
  EdgeTunnelProfileFixtures,
  EdgeLagFixtures
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  act,
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

const { mockedSdLanDataList } = EdgeSdLanFixtures
const { mockEdgeList } = EdgeGeneralFixtures
const { mockEdgePortConfig, mockEdgeOnlyLanPortConfigWithoutCorePort } = EdgePortConfigFixtures
const {
  mockedTunnelProfileViewData
} = EdgeTunnelProfileFixtures

const { mockedEdgeLagList } = EdgeLagFixtures

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

jest.mock('./CorePortFormItem', () => ({
  CorePortFormItem: (props: { data: string }) => <div data-testid='rc-CorePortFormItem'>
    {props.data}
  </div>
}))

const mockedSetFieldValue = jest.fn()
const mockedReqVenuesList = jest.fn()
const mockedReqEdgesList = jest.fn()

describe('Edge centrailized forwarding form: settings', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear()
    mockedReqVenuesList.mockClear()
    mockedReqEdgesList.mockClear()

    store.dispatch(edgeApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    store.dispatch(tunnelProfileApi.util.resetApiState())
    store.dispatch(edgeSdLanApi.util.resetApiState())

    mockServer.use(
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      ),
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => {
          mockedReqVenuesList(req.body)
          return res(ctx.json(mockedVenueList))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => {
          mockedReqEdgesList(req.body)
          return res(ctx.json(mockEdgeList))
        }
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (_, res, ctx) => {
          return res(ctx.json(mockEdgePortConfig))
        }
      )
    )
  })

  it('should render correctly', async () => {
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
    await checkBasicAddSettings()
    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'Tunnel Profile' }),
      'tunnelProfileId2')
    expect(mockedSetFieldValue).toBeCalledWith('tunnelProfileName', 'tunnelProfile2')
  })

  it('should query specific venue and edge when edit mode', async () => {
    const expectedVenueId = 'mocked_venue_id'
    const expectedEdgeId = 'mocked_edge'

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current} editMode>
        <SettingsForm />
      </StepsForm>
    </Provider>)

    act(() => {
      stepFormRef.current.setFieldValue('venueId', expectedVenueId)
      stepFormRef.current.setFieldValue('edgeId', expectedEdgeId)
    })
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    const formBody = await screen.findByTestId('steps-form-body')
    const icons = await within(formBody).findAllByTestId('loadingIcon')
    await waitForElementToBeRemoved(icons)
    const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
    expect(venueDropdown).toBeDisabled()
    expect(mockedReqVenuesList).toBeCalledWith({
      fields: ['name', 'id', 'edges'],
      filters: { id: [expectedVenueId] }
    })

    await waitFor(() => {
      expect(mockedReqEdgesList).toBeCalledWith({
        fields: ['name', 'serialNumber', 'venueId'],
        filters: {
          venueId: [expectedVenueId],
          serialNumber: [expectedEdgeId],
          deviceStatus: Object.values(EdgeStatusEnum)
            .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
        }
      })
    })

    await waitFor(() => {
      expect(mockedSetFieldValue).toBeCalledWith('corePortName', 'Port2')
    })
    expect(mockedSetFieldValue).toBeCalledWith('corePortMac', 'port2')
    await within(formBody).findByRole('option', { name: 'tunnelProfile2' })
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
    await checkBasicAddSettings()
    await within(formBody).findByRole('option', { name: 'tunnelProfile2' })
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
    const mockedSdLanDuplicateEdge = [{ ...mockedSdLanDataList[0] }]
    mockedSdLanDuplicateEdge[0].edgeId = mockEdgeList.data[4].serialNumber

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

    const icon = await within(formBody).findByTestId('loadingIcon')
    await waitForElementToBeRemoved(icon)

    await screen.findByText('SmartEdge')
    await waitFor(() => {
      expect(mockedReqEdgesList).toBeCalledWith({
        fields: ['name', 'serialNumber', 'venueId'],
        filters: {
          venueId: [mockedVenueList.data[4].id],
          deviceStatus: Object.values(EdgeStatusEnum)
            .filter(v => v !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD)
        }
      })
    })
    expect(screen.queryByRole('option', { name: 'Smart Edge 5' })).toBeNull()
    await within(formBody).findByRole('option', { name: 'tunnelProfile2' })
  })

  describe('LAG enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)

      mockServer.use(
        rest.get(
          EdgeUrlsInfo.getPortConfig.url,
          (_, res, ctx) => {
            return res(ctx.json(mockEdgeOnlyLanPortConfigWithoutCorePort))
          }
        ),
        rest.get(
          EdgeUrlsInfo.getEdgeLagList.url,
          (_, res, ctx) => res(ctx.json(mockedEdgeLagList))
        )
      )
    })

    it('should render correctly handle LAG core port', async () => {
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
      const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
      await userEvent.selectOptions(
        venueDropdown,
        'venue_00002')

      expect(mockedSetFieldValue).toBeCalledWith('venueName', 'airport')
      expect(mockedSetFieldValue).toBeCalledWith('edgeId', undefined)
      expect(within(formBody).queryByTestId('rc-CorePortFormItem')).toBeNull()

      await userEvent.selectOptions(
        await within(formBody).findByRole('combobox', { name: 'SmartEdge' }),
        '0000000002')

      expect(mockedSetFieldValue).toBeCalledWith('edgeName', 'Smart Edge 2')
      expect(within(formBody).queryByTestId('rc-CorePortFormItem')).toBeValid()

      await waitFor(() => {
        expect(mockedSetFieldValue).toBeCalledWith('isLagCorePort', true)
      })
      expect(mockedSetFieldValue).toBeCalledWith('corePortMac', 1)
      expect(mockedSetFieldValue).toBeCalledWith('corePortName', 'LAG 1')
      await within(formBody).findByRole('option', { name: 'tunnelProfile2' })
    })
  })
})

const checkBasicAddSettings = async () => {
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
  expect(mockedSetFieldValue).toBeCalledWith('edgeId', undefined)

  // select edge
  await userEvent.selectOptions(
    await within(formBody).findByRole('combobox', { name: 'SmartEdge' }),
    '0000000002')

  // ensure related data to set into form
  expect(mockedSetFieldValue).toBeCalledWith('edgeName', 'Smart Edge 2')
  await waitFor(() => {
    expect(mockedSetFieldValue).toBeCalledWith('corePortMac', 'port2')
  })
  expect(mockedSetFieldValue).toBeCalledWith('corePortName', 'Port2')
}