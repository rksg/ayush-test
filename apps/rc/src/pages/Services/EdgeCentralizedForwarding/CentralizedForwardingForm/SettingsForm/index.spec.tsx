import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

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
  waitForElementToBeRemoved,
  within
} from '@acx-ui/test-utils'

import { mockEdgeList, mockedTunnelProfileViewData, mockedVenueList } from '../../__tests__/fixtures'

import { SettingsForm } from './'

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

describe('Edge centrailized forwarding form: settings', () => {
  beforeEach(() => {
    mockedSetFieldValue.mockClear()

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json(mockedVenueList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (_, res, ctx) => res(ctx.json(mockEdgeList))
      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (_, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
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
    // TODO: waiting for API
    expect(mockedSetFieldValue).toBeCalledWith('corePortId', 'port_2')
    expect(within(formBody).queryByTestId('rc-CorePortFormItem')).toBeValid()

    await userEvent.selectOptions(
      await within(formBody).findByRole('combobox', { name: 'Tunnel Profile' }),
      'tunnelProfileId2')
    expect(mockedSetFieldValue).toBeCalledWith('tunnelProfileName', 'tunnelProfile2')
  })
})
