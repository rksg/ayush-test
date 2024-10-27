import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { switchApi }   from '@acx-ui/rc/services'
import {
  SwitchUrlsInfo,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
} from '@acx-ui/rc/utils'
import { store, Provider }                                                            from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor, waitForElementToBeRemoved } from '@acx-ui/test-utils'

import { flexAuthList }               from './__test__/fixtures'
import { FlexibleAuthenticationForm } from './FlexibleAuthenticationForm'

describe('FlexibleAuthenticationForm', ()=>{
  let params: { tenantId: string }
  params = {
    tenantId: 'tenant-id'
  }
  const addProfilePath = '/:tenantId/' + getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.CREATE
  })

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(
        SwitchUrlsInfo.getFlexAuthenticationProfiles.url,
        (req, res, ctx) => res(ctx.json(flexAuthList))
      )
    )
  })

  describe('Add mode', ()=>{
    it('should render correctly', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
      const mockedFinish = jest.fn()

      render(
        <Provider>
          <FlexibleAuthenticationForm
            form={formRef.current}
            onFinish={mockedFinish}
          />
        </Provider>, {
          route: { params, path: addProfilePath }
        }
      )

      await waitForElementToBeRemoved(() => screen.queryAllByRole('img', { name: 'loader' }))
      expect(await screen.findByText('Add Flexible Authentication')).toBeVisible()
      await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
      await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')
      await userEvent.type(await screen.findByLabelText(/Guest VLAN/),'1')

      const button = await screen.findByRole('button', { name: 'Add' })
      await userEvent.click(button)
      expect(mockedFinish).not.toBeCalled()

      expect(
        await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')
      ).toBeVisible()

      await userEvent.type(await screen.findByLabelText(/Guest VLAN/),'9')

      await userEvent.click(button)
      expect(mockedFinish).toBeCalled()
    })
  })

  describe('Edit mode', ()=>{
    it('should render correctly', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
      const mockedFinish = jest.fn()

      render(
        <Provider>
          <FlexibleAuthenticationForm
            editMode={true}
            data={flexAuthList.data[0]}
            form={formRef.current}
            onFinish={mockedFinish}
          />
        </Provider>, {
          route: { params, path: addProfilePath }
        }
      )

      expect(await screen.findByLabelText(/Profile Name/)).toHaveValue('Profile01--auth10-guest5')

      const guestVlanInput = await screen.findByLabelText(/Guest VLAN/)
      expect(guestVlanInput).not.toBeDisabled()
      await userEvent.clear(guestVlanInput)
      await userEvent.type(guestVlanInput, '10')
      await waitFor(async () => {
        expect(
          await screen.findByText('VLAN ID can not be the same as Auth Default VLAN')
        ).toBeVisible()
      })

      await userEvent.clear(guestVlanInput)
      await userEvent.type(guestVlanInput, '3')

      const button = await screen.findByRole('button', { name: 'Apply' })
      await userEvent.click(button)
      expect(mockedFinish).toBeCalled()
    })
  })

})
