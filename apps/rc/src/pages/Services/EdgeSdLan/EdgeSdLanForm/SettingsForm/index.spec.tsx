import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { StepsForm }  from '@acx-ui/components'
import {
  CommonUrlsInfo,
  EdgeSdLanUrls,
  EdgeStatusEnum,
  EdgeUrlsInfo,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList, mockedTunnelProfileViewData, mockedVenueList, mockEdgePortConfig, mockedSdLanDataList } from '../../__tests__/fixtures'

import { SettingsForm } from '.'

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
    const icons = await within(formBody).findAllByTestId('loadingIcon')
    await waitForElementToBeRemoved(icons)

    const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })

    await userEvent.selectOptions(
      venueDropdown,
      'venue_00002')

    await waitForElementToBeRemoved(await within(formBody)
      .findAllByTestId('loadingIcon'))

    expect(mockedSetFieldValue).toBeCalledWith('venueName', 'airport')
    expect(mockedSetFieldValue).toBeCalledWith('edgeId', undefined)

    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'SmartEdge' }),
      '0000000002')

    expect(mockedSetFieldValue).toBeCalledWith('edgeName', 'Smart Edge 2')
    expect(within(formBody).queryByTestId('rc-CorePortFormItem')).toBeValid()

    await waitFor(() => {
      expect(mockedSetFieldValue).toBeCalledWith('corePortMac', '00:0c:29:b6:ad:04')
    })
    expect(mockedSetFieldValue).toBeCalledWith('corePortName', 'Port 1')

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
      expect(mockedSetFieldValue).toBeCalledWith('corePortName', 'Port 1')
    })
    expect(mockedSetFieldValue).toBeCalledWith('corePortMac', '00:0c:29:b6:ad:04')
  })

  it('Input invalid service name should show error message', async () => {
    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(<Provider>
      <StepsForm form={stepFormRef.current}>
        <SettingsForm />
      </StepsForm>
    </Provider>)

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
  })
})
