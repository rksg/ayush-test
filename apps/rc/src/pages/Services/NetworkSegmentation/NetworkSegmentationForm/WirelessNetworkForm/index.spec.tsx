/* eslint-disable max-len */

import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }  from '@acx-ui/components'
import {
  CommonUrlsInfo,
  NetworkSegmentationUrls,
  TunnelProfileUrls
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockedTunnelProfileViewData }     from '../../../../Policies/TunnelProfile/__tests__/fixtures'
import {
  mockDeepNetworkList,
  mockNetworkGroup, mockNetworkSaveData,
  mockNsgStatsList, mockVenueNetworkData
} from '../../__tests__/fixtures'


import { WirelessNetworkForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
}>
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children, onChange, options, ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedFinishFn = jest.fn()

const createNsgPath = '/:tenantId/services/networkSegmentation/create'

describe('NetworkSegmentation - GeneralSettingsForm', () => {
  let params: { tenantId: string, serviceId: string }
  const mockedGetNetworkDeepList = jest.fn()

  beforeEach(() => {
    mockedGetNetworkDeepList.mockReset()
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        CommonUrlsInfo.getVenueNetworkList.url,
        (req, res, ctx) => res(ctx.json(mockVenueNetworkData))
      ),
      rest.post(
        CommonUrlsInfo.networkActivations.url,
        (req, res, ctx) => res(ctx.json(mockNetworkSaveData))
      ),
      rest.post(
        CommonUrlsInfo.venueNetworkApGroup.url,
        (req, res, ctx) => res(ctx.json(mockNetworkGroup))
      ),
      rest.post(
        CommonUrlsInfo.getNetworkDeepList.url,
        (req, res, ctx) => {
          mockedGetNetworkDeepList()
          return res(ctx.json(mockDeepNetworkList))
        }
      ),
      rest.post(
        TunnelProfileUrls.createTunnelProfile.url,
        (req, res, ctx) => res(ctx.status(202))

      ),
      rest.post(
        TunnelProfileUrls.getTunnelProfileViewDataList.url,
        (req, res, ctx) => res(ctx.json(mockedTunnelProfileViewData))
      ),
      rest.post(
        NetworkSegmentationUrls.getNetworkSegmentationStatsList.url,
        (req, res, ctx) => res(ctx.json(mockNsgStatsList))
      )
    )
  })

  it('Step3 - Wireless network success', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('venueId', 'testVenueId1')
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm form={formRef.current} onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <WirelessNetworkForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })

    // wait for api all responded because `GetNetworkDeepList` will trigger multiple requests
    await waitFor(() => {
      expect(mockedGetNetworkDeepList).toBeCalled()
    })
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Tunnel Profile' }),
      await screen.findByRole('option', { name: 'Default' })
    )

    const checkboxs = await screen.findAllByRole('checkbox', { name: /Network /i })
    const usedNetowrkIds = mockNsgStatsList.data.flatMap(item => item.networkIds)
    const unusedNetworkOptions = mockNetworkGroup.response.length - usedNetowrkIds.length
    expect(checkboxs.length).toBe(unusedNetworkOptions)
    await user.click(await screen.findByRole('checkbox', { name: 'Network 1' }))
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[1])
  })

  it('Step3 - Wireless network will be not block by empty list', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('venueId', 'testVenueId1')
      return form
    })
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm form={formRef.current} onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <WirelessNetworkForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })

    // wait for api all responded because `GetNetworkDeepList` will trigger multiple requests
    await waitFor(() => {
      expect(mockedGetNetworkDeepList).toBeCalled()
    })
    await screen.findByRole('checkbox', { name: 'Network 1' })
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[1])
  })

  it('Add tunnel profile', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <WirelessNetworkForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0])
    const tunnelDialog = await screen.findByRole('dialog')
    const policyNameField = within(tunnelDialog).getByRole('textbox', { name: 'Profile Name' })
    await user.type(policyNameField, 'TestTunnel')
    await user.click(within(tunnelDialog).getByRole('radio', { name: 'Auto' }))
    await user.click(within(tunnelDialog).getByRole('button', { name: 'Add' }))
  })

  it('Click cancel in dialog will close dialog', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm onFinish={mockedFinishFn}>
          <StepsForm.StepForm>
            <WirelessNetworkForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>,
      { route: { params, path: createNsgPath } })
    const addButtons = await screen.findAllByRole('button', { name: 'Add' })
    await user.click(addButtons[0])
    const tunnelDialog = await screen.findByRole('dialog')
    await user.click(within(tunnelDialog).getByRole('button', { name: 'Cancel' }))
  })
})
