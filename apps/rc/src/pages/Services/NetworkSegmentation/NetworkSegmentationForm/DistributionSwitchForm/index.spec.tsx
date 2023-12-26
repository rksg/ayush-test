/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }        from '@acx-ui/components'
import { nsgApi }           from '@acx-ui/rc/services'
import {
  DistributionSwitch,
  EdgeUrlsInfo,
  NetworkSegmentationUrls
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
  mockNsgSwitchInfoData
} from '../../__tests__/fixtures'

import { StaticRouteModal } from './StaticRouteModal'

import { DistributionSwitchForm } from './'

const createNsgPath = '/:tenantId/services/personalIdentityNetwork/create'
const updateNsgPath = '/:tenantId/services/personalIdentityNetwork/:serviceId/edit'

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
        onSaveDS(mockNsgSwitchInfoData.distributionSwitches[0])
      }}>Save</button>
      <button onClick={(e)=>{
        e.preventDefault()
        onClose()
      }}>Cancel</button>
    </div>
}))

jest.mock('../../../../Devices/Edge/EdgeDetails/EditEdge/StaticRoutes', () => ({
  ...jest.requireActual('../../../../Devices/Edge/EdgeDetails/EditEdge/StaticRoutes'),
  default: () => <div data-testid={'StaticRoutes'}></div>
}))


describe('DistributionSwitchForm', () => {
  let params: { tenantId: string, serviceId: string }

  const requestSpy = jest.fn()
  beforeEach(() => {
    store.dispatch(nsgApi.util.resetApiState())

    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    requestSpy.mockClear()

    mockServer.use(
      rest.get(
        NetworkSegmentationUrls.getAvailableSwitches.url,
        (req, res, ctx) => {
          requestSpy()
          return res(ctx.json({ switchViewList: [
            ...mockNsgSwitchInfoData.distributionSwitches,
            ...mockNsgSwitchInfoData.accessSwitches
          ] }))
        }
      ),
      rest.get(
        EdgeUrlsInfo.getEdge.url,
        (req, res, ctx) => res(ctx.json({ serialNumber: '0000000001', name: 'Smart Edge 1' }))
      ),
      rest.post(
        NetworkSegmentationUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ response: { valid: true } }))
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
      venueId: 'venueId',
      edgeId: 'edgeId',
      distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsForm form={formRef.current}><DistributionSwitchForm /></StepsForm>
      </Provider>, {
        route: { params, path: updateNsgPath }
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
      venueId: 'venueId',
      edgeId: 'edgeId'
    })

    render(
      <Provider>
        <StepsForm form={formRef.current}><DistributionSwitchForm /></StepsForm>
      </Provider>, {
        route: { params, path: createNsgPath }
      })
    const createBtn = await screen.findByRole('button', { name: 'Add Distribution Switch' })
    await user.click(createBtn)

    const dialog = await screen.findByTestId('DistributionSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})

describe('StaticRouteModal', () => {
  it('Should render successfully', async () => {
    render(<StaticRouteModal edgeId='0000000001' edgeName='Smart Edge 1' />)

    await userEvent.click(await screen.findByRole('button', { name: 'Static Route' }))

    const form = await screen.findByTestId('StaticRoutes')
    await waitFor(() => expect(form).toBeVisible())

    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))

    expect(form).not.toBeVisible()
  })
})
