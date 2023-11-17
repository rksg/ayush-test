import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'
import { act }   from 'react-dom/test-utils'

import { StepsForm }  from '@acx-ui/components'
import {
  CommonUrlsInfo,
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

import { mockEdgeList, mockedTunnelProfileViewData, mockedVenueList, mockEdgePortConfig } from '../../__tests__/fixtures'

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
  CorePortFormItem: () => <div data-testid='rc-CorePortFormItem'></div>
}))

const mockedSetFieldValue = jest.fn()
const mockedReqVenuesList = jest.fn()

describe('Edge centrailized forwarding form: settings', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear()
    mockedReqVenuesList.mockClear()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (req, res, ctx) => {
          mockedReqVenuesList(req.body)
          return res(ctx.json(mockedVenueList))
        }
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (_, res, ctx) => res(ctx.json(mockEdgePortConfig))
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
    const icons = await within(formBody)
      .findAllByTestId('loadingIcon')
    expect(icons.length).toBe(2)
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

  it('should query specific venue when edit mode', async () => {
    const expectedVenueId = 'mocked_venue_id'

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
    })
    jest.spyOn(stepFormRef.current, 'setFieldValue').mockImplementation(mockedSetFieldValue)

    const formBody = await screen.findByTestId('steps-form-body')
    const icons = await within(formBody)
      .findAllByTestId('loadingIcon')
    expect(icons.length).toBe(2)
    await waitForElementToBeRemoved(icons)

    const venueDropdown = await within(formBody).findByRole('combobox', { name: 'Venue' })
    expect(venueDropdown).toBeDisabled()
    expect(mockedReqVenuesList).toBeCalledWith({
      fields: ['name', 'id', 'edges'],
      filters: { id: [expectedVenueId] }
    })

    expect(mockedSetFieldValue).toBeCalledWith('corePortMac', undefined)
    expect(mockedSetFieldValue).toBeCalledWith('corePortName', undefined)
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
})
