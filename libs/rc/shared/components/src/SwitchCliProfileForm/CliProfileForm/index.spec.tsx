import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import { StepsForm }                                                            from '@acx-ui/components'
import { Features, useIsSplitOn }                                               from '@acx-ui/feature-toggle'
import { switchApi, venueApi }                                                  from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo, SwitchRbacUrlsInfo, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { Provider, store }                                                      from '@acx-ui/store'
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

jest.mock('../../SwitchCli/styledComponents', () => {
  const UIComps = jest.requireActual('../../SwitchCli/styledComponents')
  return {
    ...UIComps,
    Select: ({ children }:React.PropsWithChildren) =>
      <div data-testid='rc-Select'>
        <UIComps.Select>{children}</UIComps.Select>
      </div> }
})

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
  const mockedAdd = jest.fn()
  const mockedUpdate = jest.fn()
  const mockedAssociate = jest.fn()
  const mockedDisassociate = jest.fn()
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
      rest.post(SwitchUrlsInfo.getProfiles.url,
        (_, res, ctx) => res(ctx.json({ data: profiles }))
      ),
      rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
        (_, res, ctx) => res(ctx.json(configExamples))
      ),
      rest.get(SwitchUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.post(SwitchUrlsInfo.addSwitchConfigProfile.url,
        (_, res, ctx) => {
          mockedAdd()
          return res(ctx.json({ requestId: 'request-id' }))
        }
      ),
      rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
        (_, res, ctx) => res(ctx.json(cliProfile))
      ),
      rest.put(SwitchUrlsInfo.updateSwitchConfigProfile.url,
        (_, res, ctx) => {
          mockedUpdate()
          return res(ctx.json({ requestId: 'request-id' }))
        }
      ),
      rest.post(SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json([]))
      ),
      rest.get(SwitchRbacUrlsInfo.getCliFamilyModels.url,
        (_, res, ctx) => res(ctx.json(familyModels))
      ),
      rest.put(SwitchRbacUrlsInfo.associateSwitchProfile.url,
        (_, res, ctx) => {
          mockedAssociate()
          return res(ctx.json({ requestId: 'request-id' }))
        }
      ),
      rest.delete(SwitchRbacUrlsInfo.disassociateSwitchProfile.url,
        (_, res, ctx) => {
          mockedDisassociate()
          return res(ctx.json({ requestId: 'request-id' }))
        }
      )
    )
  })
  afterEach(() => {
    onFinishSpy.mockClear()
    mockedAdd.mockClear()
    mockedUpdate.mockClear()
    mockedAssociate.mockClear()
    mockedDisassociate.mockClear()
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

  describe('RBAC', () => {
    describe('Edit mode', () => {
      const params = {
        tenantId: 'tenant-id',
        action: 'edit',
        configType: 'profiles',
        profileId: '4515bc6524544cc79303cc6a6443f6c4'
      }

      it('should update correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
      })
      it('should update and associate with venues correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
        await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })

        await screen.findByRole('heading', { level: 3, name: 'Venues' })
        expect(await screen.findAllByRole('row')).toHaveLength(5)

        const row = await screen.findByRole('row', { name: /test1/i })
        await userEvent.click(await within(row).findByRole('checkbox'))
        await waitFor(async () => {
          expect(await within(row).findByRole('checkbox')).toBeChecked()
        })

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        await waitFor(() => expect(mockedAssociate).toBeCalled())
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(1)
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
      })

      it('Should update and disassociate with venues correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
        expect(await screen.findByText(/Once the CLI Configuration profile/)).toBeVisible()
        await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })

        await screen.findByRole('heading', { level: 3, name: 'Venues' })
        expect(await screen.findAllByRole('row')).toHaveLength(5)

        const row = await screen.findByRole('row', { name: /My-Venue/i })
        await userEvent.click(await within(row).findByRole('checkbox'))
        await waitFor(async () => {
          expect(await within(row).findByRole('checkbox')).not.toBeChecked()
        })

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedDisassociate).toBeCalled())
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedDisassociate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('Switch level CLI profile', () => {
    describe('Edit mode', () => {
      const params = {
        tenantId: 'tenant-id',
        action: 'edit',
        configType: 'profiles',
        profileId: '4515bc6524544cc79303cc6a6443f6c4'
      }

      beforeEach(() => {
        mockServer.use(
          rest.post(SwitchUrlsInfo.getSwitchList.url,
            (_, res, ctx) => res(ctx.json({
              data: [{
                id: 'FMF3250Q04R',
                serialNumber: 'FMF3250Q04R',
                model: 'ICX7150-C08P',
                name: 'FMF3250Q04R',
                deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
                venueName: 'My-Venue',
                venueId: 'a98653366d2240b9ae370e48fab3a9a1',
                tenantId: 'tenant-id'
              }, {
                id: 'FMF3250Q05R',
                serialNumber: 'FMF3250Q05R',
                model: 'ICX7150-C08P',
                name: 'FMF3250Q05R',
                deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
                venueName: 'My-Venue',
                venueId: 'a98653366d2240b9ae370e48fab3a9a1',
                tenantId: 'tenant-id'
              }, {
                id: 'FMF3250Q06R',
                serialNumber: 'FMF3250Q06R',
                model: 'ICX7150-C08P',
                name: 'FMF3250Q06R - REAL',
                deviceStatus: SwitchStatusEnum.NEVER_CONTACTED_CLOUD,
                venueName: 'My-Venue',
                venueId: 'a98653366d2240b9ae370e48fab3a9a1',
                tenantId: 'tenant-id'
              }, {
                id: 'FMF3250Q07R',
                serialNumber: 'FMF3250Q07R',
                model: 'ICX7150-C08P',
                name: 'ICX7150-C08P Switch',
                deviceStatus: SwitchStatusEnum.OPERATIONAL,
                venueName: 'My-Venue',
                venueId: 'a98653366d2240b9ae370e48fab3a9a1',
                tenantId: 'tenant-id'
              }]
            }))
          ),
          rest.get(SwitchUrlsInfo.getSwitchConfigProfile.url,
            (_, res, ctx) => res(ctx.json({
              ...cliProfile,
              venueCliTemplate: {
                ...cliProfile.venueCliTemplate,
                switchModels: 'ICX7150-48,ICX7150-24F,ICX7550-24P,ICX7150-C08P',
                variables: [{
                  name: 'iptest',
                  ipAddressEnd: '1.1.1.100',
                  ipAddressStart: '1.1.1.1',
                  rangeEnd: 355,
                  rangeStart: 256,
                  subMask: '255.255.254.0',
                  type: 'ADDRESS',
                  switchVariables: [
                    { serialNumbers: ['FMF3250Q05R'], value: '1.1.1.1' },
                    { serialNumbers: ['FMF3250Q07R'], value: '1.1.1.10' }
                  ]
                }, {
                  name: 'test', type: 'RANGE', rangeStart: '3', rangeEnd: '4',
                  switchVariables: [{ serialNumbers: ['FMF3250Q06R'], value: '3' }]
                }, {
                  name: 'stringtest', type: 'STRING', value: 'test-string'
                }, {
                  name: 'stringtest2', type: 'STRING', value: 'test-string',
                  switchVariables: [
                    { serialNumbers: ['FMF3250Q04R'], value: 'a' },
                    { serialNumbers: ['FMF3250Q05R'], value: 'b' },
                    { serialNumbers: ['FMF3250Q06R'], value: 'c' }
                  ]
                }]
              }
            }))
          )
        )
      })

      it('should update correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()
        expect(screen.queryByText(/Once the CLI Configuration profile/)).toBeNull()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
      })

      it('should render switch settings drawer correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        expect(await screen.findAllByText('Switches with custom settings')).toHaveLength(3)

        // range variable
        await userEvent.click(await screen.findByRole('button', { name: '2 Switch(es)' }))
        let dialog = await screen.findByRole('dialog')
        let rows = await within(dialog).findAllByRole('row')
        expect(rows).toHaveLength(3)
        const closeButton = screen.queryByRole('button', { name: 'Close' })
        await userEvent.click(closeButton!)

        // string variable
        await userEvent.click(await screen.findByRole('button', { name: '3 Switch(es)' }))
        dialog = await screen.findByRole('dialog')
        rows = await within(dialog).findAllByRole('row')
        expect(rows).toHaveLength(4)
      })

      it('should close switch settings drawer correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        expect(await screen.findAllByText('Switches with custom settings')).toHaveLength(3)

        // range variable
        await userEvent.click(await screen.findByRole('button', { name: '1 Switch(es)' }))
        let dialog = await screen.findByRole('dialog')
        expect(await within(dialog).findByText('Switches with custom settings')).toBeVisible()
        expect(await within(dialog).findByText('FMF3250Q06R - REAL (FMF3250Q06R)')).toBeVisible()
        expect(await within(dialog).findByText('My-Venue')).toBeVisible()
        const closeButton = screen.queryByRole('button', { name: 'Close' })
        await userEvent.click(closeButton!)
        await waitFor(async () => {
          expect(screen.queryByText('FMF3250Q06R - REAL (FMF3250Q06R)')).toBeNull()
        })
      })

      it('should render edit variable modal correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await screen.findByText('CLI commands')

        // open edit variable modal
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        await screen.findAllByText(/iptest/)
        const editVarBtns = await screen.findAllByTestId('edit-var-btn')
        await userEvent.click(editVarBtns[0]) // IP address
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

        const dialog = await screen.findByRole('dialog')
        await screen.findByText('Edit Variable')
        expect(within(dialog).queryByRole('button', { name: 'Customize' })).toBeNull()
        expect(await within(dialog).findAllByText(/IP Address/)).toHaveLength(4)

        await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
        await waitFor(() => {
          expect(dialog).not.toBeVisible()
        })
      })

      it('should edit custom variable correctly (preprovisioned switch)', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await screen.findByText('CLI commands')

        // open edit variable modal
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        await screen.findAllByText(/iptest/)
        const editVarBtns = await screen.findAllByTestId('edit-var-btn')
        await userEvent.click(editVarBtns[1]) // Range
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

        const dialog = await screen.findByRole('dialog')
        await screen.findByText('Edit Variable')
        expect(within(dialog).queryByRole('button', { name: 'Customize' })).toBeNull()

        const customizedForm = await within(dialog).findByTestId('customized-form')
        const customizedInput = await within(customizedForm).findByTestId('customized-input-0')
        await userEvent.clear(customizedInput)
        await userEvent.type(customizedInput, '4')
        await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))

        await waitFor(() => {
          expect(dialog).not.toBeVisible()
        })
      })

      it('should edit custom variable correctly (preprovisioned/configured switch)', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await screen.findByText('CLI commands')

        // open edit variable modal
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        await screen.findAllByText(/iptest/)
        const editVarBtns = await screen.findAllByTestId('edit-var-btn')
        await userEvent.click(editVarBtns[0]) // IP Address
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

        const dialog = await screen.findByRole('dialog')
        await screen.findByText('Edit Variable')
        expect(within(dialog).queryByRole('button', { name: 'Customize' })).toBeNull()

        const customizedForm = await within(dialog).findByTestId('customized-form')
        const customizedInput = await within(customizedForm).findByTestId('customized-input-0')
        expect(await within(customizedForm).findByText('Online Devices')).toBeVisible()
        expect(await within(customizedForm).findByText('Devices to be provisioned')).toBeVisible()
        expect(customizedInput).not.toBeDisabled()

        await userEvent.clear(customizedInput)
        await userEvent.type(customizedInput, '1.1.1.9')
        await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))

        await waitFor(() => {
          expect(dialog).not.toBeVisible()
        })
      })

      it('should customize variable correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'CLI Configuration' }))
        await screen.findByText('CLI commands')

        // open edit variable modal
        await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
        await screen.findAllByText(/iptest/)
        const editVarBtns = await screen.findAllByTestId('edit-var-btn')
        await userEvent.click(editVarBtns[2]) // String
        await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

        const dialog = await screen.findByRole('dialog')
        await screen.findByText('Edit Variable')
        expect(await within(dialog).findByRole('button', { name: 'Customize' })).toBeVisible()
        await userEvent.click(await within(dialog).findByRole('button', { name: 'Customize' }))
        expect(await within(dialog).findByText('Add Switch')).toBeVisible()

        const customizedForm = await within(dialog).findByTestId('customized-form')
        const customizedSelect = await within(customizedForm).findAllByTestId('rc-Select')
        await userEvent.click(customizedSelect[0])

        await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
        expect(await within(dialog).findByText('Please enter Switch')).toBeVisible()
        await userEvent.click(await within(dialog).findByRole('deleteBtn'))
        await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))

        await waitFor(() => {
          expect(dialog).not.toBeVisible()
        })
        expect(await screen.findAllByRole('button', { name: '1 Switch(es)' })).toHaveLength(1)
      })

      it('should render messages correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_LEVEL_CLI_PROFILE)
        render(<Provider><CliProfileForm /></Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/cli/:profileId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Configuration Profile')).toBeVisible()

        await userEvent.click(await screen.findByRole('button', { name: 'Venues' }))
        await screen.findByRole('heading', { level: 3, name: 'Venues' })
        expect(await screen.findByText(
          /were selected during variable customization in the previous step/
        )).toBeVisible()
      })
    })
  })
})



