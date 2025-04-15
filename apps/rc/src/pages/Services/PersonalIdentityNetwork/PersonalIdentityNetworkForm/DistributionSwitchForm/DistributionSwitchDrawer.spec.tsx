import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { StepsForm }                    from '@acx-ui/components'
import { EdgePinFixtures, EdgePinUrls } from '@acx-ui/rc/utils'
import { Provider }                     from '@acx-ui/store'
import {
  mockServer, render, renderHook,
  screen, waitFor, within
} from '@acx-ui/test-utils'

import { DistributionSwitchDrawer, validateLoopbackIpUnique } from './DistributionSwitchDrawer'

const { mockPinSwitchInfoData, mockPinData } = EdgePinFixtures

describe('DistributionSwitchDrawer', () => {
  const params = {
    tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac',
    serviceId: 'testServiceId'
  }
  const path = '/:tenantId/t/services/personalIdentityNetwork/:serviceId/edit'

  it('Should render successfully', async () => {
    const user = userEvent.setup()
    render(
      <Provider>
        <StepsForm>
          <StepsForm.StepForm>
            <DistributionSwitchDrawer open={true}
              availableSwitches={mockPinSwitchInfoData.distributionSwitches} />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path }
      })

    await screen.findByText(/Add Distribution Switch/i)

    await user.click(await screen.findByRole('button', { name: 'Select' }))

    await screen.findByText(/Available Access Switch/i)
  })

  it('Should edit successfully', async () => {
    const user = userEvent.setup()
    const saveSpy = jest.fn()

    mockServer.use(
      rest.post(
        EdgePinUrls.validateDistributionSwitchInfo.url,
        (req, res, ctx) => res(ctx.json({ valid: true }))
      )
    )

    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    formRef.current.setFieldsValue({
      venueId: mockPinData.venueId,
      edgeClusterId: mockPinData.edgeClusterInfo.edgeClusterId,
      distributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
      originalDistributionSwitchInfos: mockPinSwitchInfoData.distributionSwitches,
      accessSwitchInfos: mockPinSwitchInfoData.accessSwitches,
      originalAccessSwitchInfos: mockPinSwitchInfoData.accessSwitches
    })

    render(
      <Provider>
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <DistributionSwitchDrawer open={true}
              onSaveDS={saveSpy}
              editRecord={{
                ...mockPinSwitchInfoData.distributionSwitches[0],
                accessSwitches: mockPinSwitchInfoData.accessSwitches
              }}
              availableSwitches={mockPinSwitchInfoData.accessSwitches} />
          </StepsForm.StepForm>
        </StepsForm>
      </Provider>, {
        route: { params, path }
      })
    const dsInput = await screen.findByRole('textbox',{ name: 'Distribution Switch' })
    expect(dsInput).toHaveValue('FMN4221R00H---DS---3')

    expect(screen.getByRole('textbox', {
      name: 'Loopback Interface IP Address' })).toHaveValue('1.2.3.4')

    await user.click(await screen.findByRole('button', { name: 'Select' }))

    const dialog = await screen.findByRole('dialog', { name: /Select Access Switches/i })
    await within(dialog).findByText(/FEK3224R09N---AS---3/i)

    await user.click(await within(dialog).findByRole('button', { name: 'Apply' }))
    await waitFor(() => expect(dialog).not.toBeVisible())

    await user.click(await screen.findByRole('button', { name: 'Save' }))

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1))
  })
})

describe('validateLoopbackIpUnique', () => {
  it('Should reject if IP is already used by another distribution switch', async () => {
    // Create a new array with two distribution switches based on the mock data
    const distributionSwitchInfos = [...mockPinSwitchInfoData.distributionSwitches]

    // Test when IP is already used by another switch
    await expect(validateLoopbackIpUnique('1.2.3.4', 'ds3', distributionSwitchInfos))
      .rejects.toBeDefined()

    // Test when IP is used by the current switch being edited
    await expect(
      validateLoopbackIpUnique(
        '1.2.3.4',
        distributionSwitchInfos[0].id,
        distributionSwitchInfos
      )
    ).resolves.toEqual(undefined)

    // Test when IP is not used by any switch
    await expect(validateLoopbackIpUnique('1.2.3.6', 'ds3', distributionSwitchInfos))
      .resolves.toEqual(undefined)

    // Test with empty IP
    await expect(validateLoopbackIpUnique('', 'ds3', distributionSwitchInfos))
      .resolves.toEqual(undefined)
  })
})
