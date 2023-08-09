/* eslint-disable max-len */
import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }               from '@acx-ui/components'
import { NetworkSegmentationUrls } from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  within,
  waitFor
} from '@acx-ui/test-utils'

import {
  mockNsgSwitchInfoData,
  webAuthList
} from '../../__tests__/fixtures'

import { AccessSwitchForm } from './'

const updateNsgPath = '/:tenantId/services/networkSegmentation/:serviceId/edit'

type MockDrawerProps = React.PropsWithChildren<{
  open: boolean
  onSave: () => void
  onClose: () => void
}>
jest.mock('./AccessSwitchDrawer', () => ({
  AccessSwitchDrawer: ({ onSave, onClose, open }: MockDrawerProps) =>
    open && <div data-testid={'AccessSwitchDrawer'}>
      <button onClick={(e)=>{
        e.preventDefault()
        onSave()
      }}>Save</button>
      <button onClick={()=>onClose()}>Cancel</button>
    </div>
}))

describe('AccessSwitchForm', () => {
  let params: { tenantId: string, serviceId: string }
  beforeEach(() => {
    params = {
      tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
      serviceId: 'testServiceId'
    }

    mockServer.use(
      rest.post(
        NetworkSegmentationUrls.getWebAuthTemplateList.url,
        (req, res, ctx) => res(ctx.json({ data: webAuthList }))
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
        <StepsForm form={formRef.current}><AccessSwitchForm /></StepsForm>
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    const row = await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    await user.click(await within(row).findByRole('checkbox'))

    const alert = await screen.findByRole('alert')
    await user.click(await within(alert).findByRole('button', { name: 'Edit' }))

    const dialog = await screen.findByTestId('AccessSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should edit by button correctly', async () => {
    const user = userEvent.setup()
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue({
      venueId: 'venueId',
      edgeId: 'edgeId',
      distributionSwitchInfos: mockNsgSwitchInfoData.distributionSwitches,
      accessSwitchInfos: [{
        id: mockNsgSwitchInfoData.accessSwitches[0].id,
        name: mockNsgSwitchInfoData.accessSwitches[0].name,
        distributionSwitchId: mockNsgSwitchInfoData.accessSwitches[0].distributionSwitchId
      }]
    })

    render(
      <Provider>
        <StepsForm form={formRef.current}><AccessSwitchForm /></StepsForm>
      </Provider>, {
        route: { params, path: updateNsgPath }
      })
    const row = await screen.findByRole('row', { name: /FEK3224R09N---AS---3/i })
    const buttons = await within(row).findAllByRole('button')
    await user.click(buttons[0])

    const dialog = await screen.findByTestId('AccessSwitchDrawer')
    await user.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(dialog).not.toBeVisible())
  })
})
