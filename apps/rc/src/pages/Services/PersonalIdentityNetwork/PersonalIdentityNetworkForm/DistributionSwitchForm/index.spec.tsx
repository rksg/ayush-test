/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm } from '@acx-ui/components'
import { pinApi }    from '@acx-ui/rc/services'
import {
  DistributionSwitch,
  EdgePinFixtures,
  EdgeUrlsInfo,
  EdgePinUrls
} from '@acx-ui/rc/utils'
import { Provider, store } from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import {
  mockContextData
} from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { DistributionSwitchForm } from './'

const createPinPath = '/:tenantId/services/personalIdentityNetwork/create'
const updatePinPath = '/:tenantId/services/personalIdentityNetwork/:serviceId/edit'
const { mockPinSwitchInfoData } = EdgePinFixtures

type MockDrawerProps = React.PropsWithChildren<{
  open: boolean
  onSaveDS: (values: DistributionSwitch) => void
  onClose: () => void
}>
jest.mock('./DistributionSwitchDrawer', () => ({
  DistributionSwitchDrawer: ({ onSaveDS, onClose, open }: MockDrawerProps) =>
    open && <div data-testid={'DistributionSwitchDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSaveDS(mockPinSwitchInfoData.distributionSwitches[0])
      }}>Save</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

jest.mock('./StaticRouteModal', () => ({
  StaticRouteModal: () => <div data-testid='static-route-modal' />
}))

jest.mock('@acx-ui/rc/components', () => ({
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('PersonalIdentityNetworkForm - DistributionSwitchForm', () => {
  let params: { tenantId: string, serviceId: string }

  const requestSpy = jest.fn()
  beforeEach(() => {
    store.dispatch(pinApi.util.resetApiState())

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    requestSpy.mockClear()

    mockServer.use(
      rest.post(
        EdgePinUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeList.url,
        (req, res, ctx) => res(ctx.json({ data: [] }))
      )
    )
  })

  it('should edit correctly', async () => {
    const user = userEvent.setup()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      edgeClusterId: 'edgeId',
      distributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockPinSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={{ ...mockContextData, refetchSwitchesQuery: requestSpy }}
        >
          <StepsForm form={formRef.current}><DistributionSwitchForm /></StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params, path: updatePinPath }
      })

    const row = await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await within(row).findByRole('radio'))
    await user.click(await screen.findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByTestId('DistributionSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(requestSpy).toHaveBeenCalledTimes(2))
  })

  it('should add DS correctly', async () => {
    const user = userEvent.setup()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      edgeClusterId: 'edgeId'
    })

    render(
      <Provider>
        <PersonalIdentityNetworkFormContext.Provider
          value={mockContextData}
        >
          <StepsForm form={formRef.current}><DistributionSwitchForm /></StepsForm>
        </PersonalIdentityNetworkFormContext.Provider>
      </Provider>, {
        route: { params, path: createPinPath }
      })
    const createBtn = await screen.findByRole('button', { name: 'Add Distribution Switch' })
    await user.click(createBtn)

    const dialog = await screen.findByTestId('DistributionSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})