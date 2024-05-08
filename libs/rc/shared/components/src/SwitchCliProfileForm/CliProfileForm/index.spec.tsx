import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import { StepsForm }                      from '@acx-ui/components'
import { switchApi, venueApi }            from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  fireEvent,
  within,
  waitFor
} from '@acx-ui/test-utils'

import {
  cliProfile,
  configExamples,
  familyModels,
  profiles,
  venues
} from './__tests__/fixtures'
import { CliStepModels }  from './CliStepModels'
import { CliStepSummary } from './CliStepSummary'
import { CliStepVenues }  from './CliStepVenues'

import { CliProfileForm } from '.'

const mockedUsedNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedUsedNavigate
}))

window.focus = jest.fn()
document.elementFromPoint = jest.fn()
document.createRange = () => {
  const range = new Range()
  range.getBoundingClientRect = jest.fn()
  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn()
    }
  }
  return range
}

const clearToast = async () => {
  const toast = await screen.findByTestId('toast-content')
  await userEvent.click(await within(toast).findByRole('img', { name: 'close' }))
  expect(toast).not.toBeVisible()
}

describe('Cli Profile Form', () => {
  const onFinishSpy = jest.fn()
  const mockedUpdate = jest.fn()
  const params = {
    tenantId: 'tenant-id',
    action: 'add',
    configType: 'profiles'
  }
  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    store.dispatch(venueApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenuesList.url,
        (_, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.post(CommonUrlsInfo.getConfigProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: profiles }))
      ),
      rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
        (_, res, ctx) => res(ctx.json(configExamples))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(cliProfile))
      ),
      rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
        (_, res, ctx) => {
          mockedUpdate()
          return res(ctx.json({ requestId: 'request-id' }))
        }
      )
    )
  })
  afterEach(() => {
    onFinishSpy.mockClear()
    mockedUpdate.mockClear()
    Modal.destroyAll()
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><CliProfileForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/cli/:action' }
    })

    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Wired Network Profiles')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /configuration profiles/i
    })).toBeTruthy()
  })

  describe('Models Step', () => {
    it('should render correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepModels />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      await screen.findByText('Select switch models')
      fireEvent.change(
        await screen.findByLabelText(/Profile Name/), { target: { value: 'testCliProfile' } }
      )
      await userEvent.click(await screen.findByLabelText('ICX7150-24'))
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        models: ['ICX7150-24'],
        name: 'testCliProfile',
        selectedFamily: ['ICX7150', 'ICX7550', 'ICX7650', 'ICX7850', 'ICX8200']
      })
    })
    it('should select at least one model', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepModels />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      await screen.findByText('Select switch models')
      fireEvent.change(
        await screen.findByLabelText(/Profile Name/), { target: { value: 'testCliProfile' } }
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
      await screen.findByText('39 Models selected')
      await userEvent.click(await screen.findByRole('button', { name: 'Deselect All' }))
      await screen.findByText('0 Models selected')

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).not.toBeCalled()
    })
    it('should handle family models changed', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepModels />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      await screen.findByText('Select switch models')
      fireEvent.change(
        await screen.findByLabelText(/Profile Name/), { target: { value: 'testCliProfile' } }
      )
      const options = await screen.findAllByRole('checkbox')
      expect(options).toHaveLength(44) // family model group 4 + model 26
      await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
      await screen.findByText('39 Models selected')
      await userEvent.click(options[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Deselect All' }))
      await screen.findByText('11 Models selected')
    })
  })

  describe('Venues Step', () => {
    it('should render correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepVenues />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      await screen.findByText(/Select venues:/)
      const row1 = await screen.findByRole('row', { name: /My-Venue/i })
      await userEvent.click(await within(row1).findByRole('checkbox'))
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        venues: ['a98653366d2240b9ae370e48fab3a9a1']
      })
    })
  })

  describe('Summary Step', () => {
    it('should render correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepSummary />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      expect(await screen.findByText('Profile Name')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).toBeCalledTimes(1)
    })

    it('should submit correctly', async () => {
      const { result: stepFormRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })

      const values = {
        agree: 'agree',
        cli: 'manager registrartest',
        cliValid: { valid: true, tooltip: '' },
        models: ['ICX7150-24'],
        name: 'testCliProfile',
        overwrite: true,
        selectedFamily: ['ICX7150', 'ICX7550', 'ICX7650', 'ICX7850', 'ICX8200'],
        variables: [],
        venues: ['a98653366d2240b9ae370e48fab3a9a1']
      }

      stepFormRef.current.setFieldsValue(values)

      render(
        <Provider>
          <StepsForm form={stepFormRef.current} onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepSummary />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, {
          route: { params, path: '/:tenantId/t/networks/wired/:configType/cli/:action' }
        }
      )

      expect(await screen.findByText('Profile Name')).toBeVisible()
      expect(await screen.findByText('Profile Name')).toBeVisible()
      expect(await screen.findByText('ICX7150-24')).toBeVisible()
      expect(await screen.findByText('My-Venue')).toBeVisible()
      expect(await screen.findByText('manager registrartest')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual(values)
    })
  })

  describe('Add mode', () => {
    it.todo('should add profile correctly')
    it.todo('should handle error occurred')
  })

  describe('Edit mode', () => {
    const params = {
      tenantId: 'tenant-id',
      action: 'edit',
      configType: 'profiles',
      profileId: '4515bc6524544cc79303cc6a6443f6c4'
    }

    it('should render correctly', async () => {
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

      await screen.findByRole('heading', { level: 3, name: 'Venues' })
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedUpdate).toBeCalled()
    })

    it('should select at least one model', async () => {
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Models' }))

      await screen.findByRole('heading', { level: 3, name: 'Models' })
      await userEvent.click(await screen.findByRole('button', { name: 'Select All' }))
      await screen.findByText('39 Models selected')
      await userEvent.click(await screen.findByRole('button', { name: 'Deselect All' }))
      await screen.findByText('0 Models selected')
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedUpdate).not.toBeCalled()
      expect(await screen.findByText(/Please select at least one model/)).toBeVisible()
      await clearToast()
    })

    it('should handle CLI commands with undefined variables', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
          (_, res, ctx) => res(ctx.json({
            ...cliProfile,
            venueCliTemplate: {
              ...cliProfile.venueCliTemplate,
              cli: 'manager registrar ${test2}'
            }
          }))
        )
      )
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')
      await userEvent.click(addExampleBtns[0])
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedUpdate).not.toBeCalled()
      expect(await screen.findByText(/Please define variable\(s\) in CLI commands/)).toBeVisible()
      await clearToast()
    })

    it('should handle CLI commands with undefined attributes', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
          (_, res, ctx) => res(ctx.json({
            ...cliProfile,
            venueCliTemplate: {
              ...cliProfile.venueCliTemplate,
              cli: 'manager registrar test'
            }
          }))
        )
      )
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')
      await userEvent.click(addExampleBtns[1])
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedUpdate).not.toBeCalled()
      expect(await screen.findByText(/Please define attribute\(s\) in CLI commands/)).toBeVisible()
      await clearToast()
    })

    it('should handle error occurred', async () => {
      mockServer.use(
        rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({ errors: [{ code: 'xxxx' }] }))
        )
      )
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      await screen.findByRole('heading', { level: 3, name: 'Venues' })
      expect(await screen.findAllByRole('row')).toHaveLength(5)
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(mockedUpdate).not.toBeCalled()
    })

    it('should redirect to list table after clicking cancel button', async () => {
      render(<Provider><CliProfileForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
      })
      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })
  })
})



