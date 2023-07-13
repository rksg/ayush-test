/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }        from '@acx-ui/components'
import {
  DistributionSwitch,
  NetworkSegmentationUrls
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

import {
  mockNsgSwitchInfoData
} from '../../__tests__/fixtures'

import { DistributionSwitchForm } from './'

const createNsgPath = '/:tenantId/services/networkSegmentation/create'
const updateNsgPath = '/:tenantId/services/networkSegmentation/:serviceId/edit'

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


describe('DistributionSwitchForm', () => {
  let params: { tenantId: string, serviceId: string }

  const requestSpy = jest.fn()
  beforeEach(() => {
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
      originalDistributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockNsgSwitchInfoData.accessSwitches,
      originalAccessSwitchInfos: mockNsgSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsForm form={formRef.current}><DistributionSwitchForm /></StepsForm>
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    const row = await screen.findByRole('row', { name: /FMN4221R00H---DS---3/i })
    await user.click(await within(row).findByRole('radio'))
    const alert = await screen.findByRole('alert')
    await user.click(await within(alert).findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByTestId('DistributionSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    await user.click(await within(alert).findByRole('button', { name: 'Delete' }))

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
