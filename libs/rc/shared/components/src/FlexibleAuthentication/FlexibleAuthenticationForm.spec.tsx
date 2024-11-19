/* eslint-disable max-len */
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

import { flexAuthList }               from './__tests__/fixtures'
import { FlexibleAuthenticationForm } from './FlexibleAuthenticationForm'

import {
  AuthenticationType,
  AuthFailAction,
  AuthTimeoutAction,
  PortControl
} from './index'

jest.mock('antd', () => {
  const antd = jest.requireActual('antd')
  // @ts-ignore
  const Select = ({ children, onChange, id, options, ...otherProps }) => {
    if (options) {
      return <select
        role='combobox'
        onChange={e => onChange(e.target.value)}
        {...otherProps}>
        {options.map((option: { value: string }) =>
          <option key={option.value} value={option.value}>{option.value}</option>)}
      </select>
    }
    return <select
      role='combobox'
      onChange={e => onChange(e.target.value)}
      {...otherProps}>
      {children}
    </select>
  }

  // @ts-ignore
  Select.Option = ({ children, options, ...otherProps }) => {
    return <option role='option' {...otherProps}>{children}</option>
  }

  return { ...antd, Select }
})

const mockedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}))

describe('FlexibleAuthenticationForm', ()=>{
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
    const params = {
      tenantId: 'tenant-id'
    }
    const mockedFinish = jest.fn()
    const addProfilePath = '/:tenantId/' + getPolicyRoutePath({
      type: PolicyType.FLEX_AUTH,
      oper: PolicyOperation.CREATE
    })

    beforeEach(() => {
      mockedFinish.mockClear()
    })

    it('should render correctly', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
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
      expect(await screen.findByText('Add Authentication')).toBeVisible()
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

    it('should validate vlans correctly', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
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
      expect(await screen.findByText('Add Authentication')).toBeVisible()
      await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
      await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')

      await userEvent.selectOptions(await screen.findByTestId('fail-action-select'), AuthFailAction.RESTRICTED_VLAN)
      await userEvent.selectOptions(await screen.findByTestId('timeout-action-select'), AuthTimeoutAction.CRITICAL_VLAN)

      const button = await screen.findByRole('button', { name: 'Add' })
      await userEvent.click(button)
      expect(mockedFinish).not.toBeCalled()

      expect(
        await screen.findAllByText('Enter a valid number between 1 and 4095, except 4087, 4090, 4091, 4092, 4094')
      ).toHaveLength(2)

      await userEvent.type(await screen.findByLabelText(/Restricted VLAN/),'1')
      await userEvent.type(await screen.findByLabelText(/Critical VLAN/),'1')
      expect(await screen.findByLabelText(/Critical VLAN/)).toHaveValue('1')

      // TODO
      // await userEvent.click(button)
      // expect(
      //   await screen.findAllByText('VLAN ID can not be the same as Auth Default VLAN')
      // ).toHaveLength(2)

      await userEvent.type(await screen.findByLabelText(/Restricted VLAN/),'2')
      await userEvent.type(await screen.findByLabelText(/Critical VLAN/),'2')

      await userEvent.click(button)
      expect(mockedFinish.mock.calls[0][0]).toStrictEqual({
        authFailAction: 'restricted_vlan',
        authTimeoutAction: 'critical_vlan',
        authenticationType: '802.1x',
        dot1xPortControl: 'auto',
        profileName: 'Profile-1',
        authDefaultVlan: '1',
        criticalVlan: '12',
        restrictedVlan: '12'
      })
    })

    it('should navigate to the profile list correctly when cancel button is clicked', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
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
      expect(await screen.findByText('Add Authentication')).toBeVisible()
      await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
      await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')

      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
      expect(mockedNavigate).toHaveBeenCalledWith('/tenant-id/t/policies/authentication/list')
    })

    describe('Handle the visibility of form items', ()=>{
      it('initial', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
        await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')

        expect(await screen.findByLabelText(/Auth Default VLAN/)).toBeVisible()
        expect(screen.queryByTestId('change-auth-order-switch')).toBeNull()
        expect(await screen.findByTestId('authentication-type-select')).toHaveValue(AuthenticationType._802_1X)
        expect(await screen.findByTestId('port-control-select')).toHaveValue(PortControl.AUTO)
        expect(await screen.findByTestId('fail-action-select')).toHaveValue(AuthFailAction.BLOCK)
        expect(await screen.findByTestId('timeout-action-select')).toHaveValue(AuthTimeoutAction.NONE)
        expect(await screen.findByLabelText(/Guest VLAN/)).toBeVisible()
      })

      it('select "Type" and set it to "MAC-AUTH"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
        await userEvent.type(await screen.findByLabelText(/Auth Default VLAN/),'1')
        expect(await screen.findByTestId('fail-action-select')).toBeVisible()
        expect(await screen.findByTestId('timeout-action-select')).toBeVisible()

        const failActionField = await screen.findByTestId('fail-action-select')
        // eslint-disable-next-line testing-library/no-node-access
        expect(failActionField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('authentication-type-select'), AuthenticationType.MACAUTH)
        const portControl = await screen.findByTestId('port-control-select')
        expect(portControl).toHaveValue(PortControl.NONE)
        expect(portControl).toBeDisabled()

        const hiddenFieldLabel = ['restricted-vlan-input', 'critical-vlan-input']
        for (let i = 0; i < hiddenFieldLabel.length; i++) {
          const field = await screen.findByTestId(hiddenFieldLabel[i])
          // eslint-disable-next-line testing-library/no-node-access
          expect(field?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
        }
      })

      it('select "Type" and set it to "802.1x and MAC-AUTH"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')

        expect(screen.queryByTestId('change-auth-order-switch')).toBeNull()
        expect(await screen.findByTestId('fail-action-select')).toBeVisible()
        expect(await screen.findByTestId('timeout-action-select')).toBeVisible()

        const failActionField = await screen.findByTestId('fail-action-select')
        // eslint-disable-next-line testing-library/no-node-access
        expect(failActionField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('authentication-type-select'), AuthenticationType._802_1X_AND_MACAUTH)
        const portControl = await screen.findByTestId('port-control-select')
        expect(portControl).toHaveValue(PortControl.AUTO)
        expect(portControl).toBeDisabled()
        expect(await screen.findByTestId('change-auth-order-switch')).toBeVisible()
      })

      it('select "Port Control" and set it to "AUTO"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
        await userEvent.selectOptions(await screen.findByTestId('port-control-select'), PortControl.FORCE_AUTHORIZED)

        const hiddenFieldLabel = ['restricted-vlan-input', 'critical-vlan-input']
        for (let i = 0; i < hiddenFieldLabel.length; i++) {
          const field = await screen.findByTestId(hiddenFieldLabel[i])
          // eslint-disable-next-line testing-library/no-node-access
          expect(field?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
        }

        await userEvent.selectOptions(await screen.findByTestId('port-control-select'), PortControl.AUTO)
        const authVlanField = await screen.findByTestId('auth-vlan-input')
        // eslint-disable-next-line testing-library/no-node-access
        expect(authVlanField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')
      })

      it('select "Port Control" and set it to "Force Authorized"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
        await userEvent.selectOptions(await screen.findByTestId('port-control-select'), PortControl.FORCE_AUTHORIZED)

        const hiddenFieldLabel = ['restricted-vlan-input', 'critical-vlan-input']
        for (let i = 0; i < hiddenFieldLabel.length; i++) {
          const field = await screen.findByTestId(hiddenFieldLabel[i])
          // eslint-disable-next-line testing-library/no-node-access
          expect(field?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
        }
      })

      it('select "Port Control" and set it to "Force Unauthorized"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')
        await userEvent.selectOptions(await screen.findByTestId('port-control-select'), PortControl.FORCE_UNAUTHORIZED)

        const hiddenFieldLabel = ['restricted-vlan-input', 'critical-vlan-input']
        for (let i = 0; i < hiddenFieldLabel.length; i++) {
          const field = await screen.findByTestId(hiddenFieldLabel[i])
          // eslint-disable-next-line testing-library/no-node-access
          expect(field?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
        }
      })

      it('select "Fail Action" and set it to "BLOCK"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')

        await userEvent.selectOptions(await screen.findByTestId('fail-action-select'), AuthFailAction.RESTRICTED_VLAN)
        const restrictedVlanField = await screen.findByTestId('restricted-vlan-input')
        // eslint-disable-next-line testing-library/no-node-access
        expect(restrictedVlanField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('fail-action-select'), AuthFailAction.BLOCK)
        // eslint-disable-next-line testing-library/no-node-access
        expect(restrictedVlanField?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
      })

      it('select "Fail Action" and set it to "Restricted VLAN"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')

        const restrictedVlanField = await screen.findByTestId('restricted-vlan-input')
        // eslint-disable-next-line testing-library/no-node-access
        expect(restrictedVlanField?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('fail-action-select'), AuthFailAction.RESTRICTED_VLAN)
        // eslint-disable-next-line testing-library/no-node-access
        expect(restrictedVlanField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')
      })

      it('select "Timeout Action" and set it to "Success"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')

        const criticalVlanField = await screen.findByTestId('critical-vlan-input')
        // eslint-disable-next-line testing-library/no-node-access
        expect(criticalVlanField?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('timeout-action-select'), AuthTimeoutAction.SUCCESS)
        // eslint-disable-next-line testing-library/no-node-access
        expect(criticalVlanField?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')
      })

      it('select "Timeout Action" and set it to "Critical VLAN"', async () => {
        const { result: formRef } = renderHook(() => {
          const [ form ] = Form.useForm()
          return form
        })
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
        expect(await screen.findByText('Add Authentication')).toBeVisible()
        await userEvent.type(await screen.findByLabelText(/Profile Name/),'Profile-1')

        const criticalVlanField = await screen.findByTestId('critical-vlan-input')
        // eslint-disable-next-line testing-library/no-node-access
        expect(criticalVlanField?.closest('.ant-form-item')).toHaveClass('ant-form-item-hidden')

        await userEvent.selectOptions(await screen.findByTestId('timeout-action-select'), AuthTimeoutAction.CRITICAL_VLAN)
        // eslint-disable-next-line testing-library/no-node-access
        expect(criticalVlanField?.closest('.ant-form-item')).not.toHaveClass('ant-form-item-hidden')
      })
    })

  })

  describe('Edit mode', ()=>{
    const params = {
      tenantId: 'tenant-id',
      policyId: '7de28fc02c0245648dfd58590884bad2'
    }
    const mockedFinish = jest.fn()
    const editProfilePath = '/:tenantId/' + getPolicyRoutePath({
      type: PolicyType.FLEX_AUTH,
      oper: PolicyOperation.EDIT
    })

    it('should render correctly', async () => {
      const { result: formRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })
      render(
        <Provider>
          <FlexibleAuthenticationForm
            editMode={true}
            data={flexAuthList.data[0]}
            form={formRef.current}
            onFinish={mockedFinish}
          />
        </Provider>, {
          route: { params, path: editProfilePath }
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
      expect(mockedFinish.mock.calls[0][0]).toStrictEqual({
        ...flexAuthList.data[0],
        guestVlan: '3'
      })
    })
  })

})
