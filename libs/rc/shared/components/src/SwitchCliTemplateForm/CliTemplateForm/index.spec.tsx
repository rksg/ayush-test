import userEvent       from '@testing-library/user-event'
import { Form, Modal } from 'antd'
import { rest }        from 'msw'

import { StepsForm }                                          from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { switchApi }                                          from '@acx-ui/rc/services'
import { CommonUrlsInfo, SwitchUrlsInfo, SwitchRbacUrlsInfo } from '@acx-ui/rc/utils'
import { Provider, store }                                    from '@acx-ui/store'
import {
  mockServer,
  render,
  renderHook,
  screen,
  fireEvent,
  within,
  waitFor
} from '@acx-ui/test-utils'

import { CliStepConfiguration } from '../../SwitchCli/CliStepConfiguration'
import { CliStepNotice }        from '../../SwitchCli/CliStepNotice'

import {
  cliTemplate,
  cliTemplateWith200Variables,
  configExamples,
  switchlist,
  templates,
  venues
} from './__tests__/fixtures'
import { CliStepSummary }  from './CliStepSummary'
import { CliStepSwitches } from './CliStepSwitches'

import { CliTemplateForm } from '.'

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

async function addVariable (variableName: string, type: string) {
  await userEvent.click(await screen.findByRole('button', { name: 'Add Variable' }))
  const dialog = await screen.findByRole('dialog')

  await userEvent.type(await within(dialog).findByTestId('variable-name'), variableName)
  fireEvent.mouseDown(await within(dialog).findByRole('combobox'))

  if (type === 'address') {
    const options = await screen.findAllByText(/Address/)
    await userEvent.click(options[0])
    await userEvent.type(await within(dialog).findByTestId('start-ip'), '1.1.1.1')
    await userEvent.type(await within(dialog).findByTestId('end-ip'), '1.1.20.1')
    await userEvent.type(await within(dialog).findByTestId('mask'), '255.255.255.0')
    await userEvent.clear(await within(dialog).findByTestId('end-ip'))
    await userEvent.type(await within(dialog).findByTestId('end-ip'), '1.1.1.10')
  } else if (type === 'range') {
    const options = await screen.findAllByText(/Range/)
    await userEvent.click(options[0])
    await userEvent.type(await within(dialog).findByTestId('start-value'), '2')
    await userEvent.type(await within(dialog).findByTestId('end-value'), '1')
    await userEvent.type(await within(dialog).findByTestId('start-value'), '5')
    await userEvent.type(await within(dialog).findByTestId('end-value'), '2')
    await userEvent.type(await within(dialog).findByTestId('end-value'), '7')
  } else if (type === 'string') {
    const options = await screen.findAllByText(/String/)
    await userEvent.click(options[0])
    await userEvent.type(await within(dialog).findByTestId('string'), 'test string')
  }

  await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
}

describe('Cli Template Form', () => {
  const onFinishSpy = jest.fn()
  const mockedUpdate = jest.fn()
  const mockedAssociate = jest.fn()
  const mockedDisassociate = jest.fn()
  const params = {
    tenantId: 'tenant-id', action: 'add', configType: 'onDemandCli'
  }
  const formValue = {
    cli: `
manager active-list {ip-address} [ip-address2] [ip-address3]
`,
    cliValid: {
      tooltip: '',
      valid: true
    },
    name: 'test-template',
    variables: []
  }

  beforeEach(() => {
    store.dispatch(switchApi.util.resetApiState())
    mockServer.use(
      rest.post(CommonUrlsInfo.getVenues.url,
        (_, res, ctx) => res(ctx.json({ data: venues }))
      ),
      rest.post(SwitchUrlsInfo.getCliTemplates.url,
        (_, res, ctx) => res(ctx.json({ data: templates }))
      ),
      rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
        (_, res, ctx) => res(ctx.json(configExamples))
      ),
      rest.post(SwitchUrlsInfo.getSwitchList.url,
        (_, res, ctx) => res(ctx.json({ data: switchlist }))
      ),
      rest.post(SwitchUrlsInfo.addCliTemplate.url,
        (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
      )
    )
  })
  afterEach(() => {
    onFinishSpy.mockClear()
    mockedUpdate.mockClear()
    mockedAssociate.mockClear()
    mockedDisassociate.mockClear()
    Modal.destroyAll()
  })

  it('should render breadcrumb correctly', async () => {
    render(<Provider><CliTemplateForm /></Provider>, {
      route: { params, path: '/:tenantId/networks/wired/:configType/add' }
    })
    expect(await screen.findByText('Wired')).toBeVisible()
    expect(await screen.findByText('Wired Network Profiles')).toBeVisible()
    expect(screen.getByRole('link', {
      name: /on\-demand cli configuration/i
    })).toBeTruthy()
  })

  describe('Important Notice Step', () => {
    it('should render correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepNotice />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      expect(await screen.findByText(/Read this before you start/)).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).not.toBeCalledTimes(1)
      expect(await screen.findByText(/Please type “AGREE”/)).toBeVisible()

      await userEvent.type(
        await screen.findByLabelText(/Please type “AGREE” here to continue/), 'agree'
      )
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).toBeCalledTimes(1)
    })
  })

  describe('CLI Configuration Step', () => {
    it('should add range variable correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      const fontOptions = await screen.findAllByRole('radio')
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')

      fireEvent.change(
        await screen.findByLabelText(/Template Name/), { target: { value: 'test-template' } }
      )
      await userEvent.click(addExampleBtns[0])
      await userEvent.click(fontOptions[0])

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      await addVariable('var1', 'range')
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        ...formValue,
        variables: [{
          name: 'var1',
          rangeEnd: '127',
          rangeStart: '25',
          type: 'RANGE',
          value: '25:127'
        }]
      })
    })

    it('should add address variable correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      const fontOptions = await screen.findAllByRole('radio')
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')

      fireEvent.change(
        await screen.findByLabelText(/Template Name/), { target: { value: 'test-template' } }
      )
      await userEvent.click(addExampleBtns[0])
      await userEvent.click(fontOptions[0])

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      await addVariable('var1', 'address')
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        ...formValue,
        variables: [{
          ipAddressEnd: '1.1.1.10',
          ipAddressStart: '1.1.1.1',
          name: 'var1',
          subMask: '255.255.255.0',
          type: 'ADDRESS',
          value: '1.1.1.1_1.1.1.10_255.255.255.0'
        }]
      })
    })

    it('should add string variable correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      const fontOptions = await screen.findAllByRole('radio')
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')

      fireEvent.change(
        await screen.findByLabelText(/Template Name/), { target: { value: 'test-template' } }
      )
      await userEvent.click(addExampleBtns[0])
      await userEvent.click(fontOptions[0])

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      await addVariable('var1', 'string')
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        ...formValue,
        variables: [{
          name: 'var1',
          string: 'test string',
          type: 'STRING',
          value: 'test string'
        }]
      })
    })

    it('should add variable to CLI editor correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      await userEvent.type(await screen.findByLabelText(/Template Name/), 'test-template')

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      await addVariable('var1', 'string')

      await screen.findByText('test string')
      const addVarBtns = await screen.findAllByTestId('add-var-btn')
      await userEvent.click(addVarBtns[0])
      await screen.findByText('${var1}')
    })

    it('should filter variables correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      await userEvent.type(await screen.findByLabelText(/Template Name/), 'test-template')

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      const tabPanel = await screen.findByRole('tabpanel', { hidden: false })
      fireEvent.mouseDown(await within(tabPanel).findByRole('combobox'))
      const options = await screen.findAllByText(/Range/)
      await userEvent.click(options[0])
    })

    it('should handle CLI valiation', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepConfiguration />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      await screen.findByText('CLI commands')
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')

      await userEvent.type(await screen.findByLabelText(/Template Name/), 'test-template')
      await userEvent.click(addExampleBtns[1])
      await screen.findByText(/ip arp inspection vlan/)

      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).toBeCalledTimes(0)
    })

  })

  describe('Switches Step', () => {
    it('should render correctly', async () => {
      render(
        <Provider>
          <StepsForm onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepSwitches />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      expect(await screen.findByText(/Select the venues or specific switches/)).toBeVisible()
      await userEvent.click(await screen.findByText('My-Venue'))

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      const row = await screen.findByRole('row', { name: /7150stack/i })
      await userEvent.click(await within(row).findByRole('checkbox'))
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual({
        applySwitch: {
          a98653366d2240b9ae370e48fab3a9a1: [{
            id: '58:fb:96:0e:82:8a',
            name: '7150stack',
            venueName: 'My-Venue'
          }]
        },
        venueSwitches: {
          a98653366d2240b9ae370e48fab3a9a1: [
            '58:fb:96:0e:82:8a'
          ]
        }
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
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      expect(await screen.findByText('Template Name')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      expect(onFinishSpy).toBeCalledTimes(1)
    })

    it('should submit value correctly', async () => {
      const { result: stepFormRef } = renderHook(() => {
        const [ form ] = Form.useForm()
        return form
      })

      const values = {
        ...formValue,
        applyNow: true,
        reload: true,
        applySwitch: {
          a98653366d2240b9ae370e48fab3a9a1: [{
            id: '58:fb:96:0e:82:8a',
            name: '7150stack',
            venueName: 'My-Venue'
          }]
        },
        venueSwitches: {
          a98653366d2240b9ae370e48fab3a9a1: [
            '58:fb:96:0e:82:8a'
          ]
        }
      }

      stepFormRef.current.setFieldsValue(values)

      render(
        <Provider>
          <StepsForm form={stepFormRef.current} onFinish={onFinishSpy}>
            <StepsForm.StepForm>
              <CliStepSummary />
            </StepsForm.StepForm>
          </StepsForm>
        </Provider>, { route: { params, path: '/:tenantId/networks/wired/:configType/add' } }
      )

      expect(await screen.findByText('Template Name')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Add' }))
      const call = onFinishSpy.mock.calls[0]
      expect(call[0]).toStrictEqual(values)
    })
  })

  describe('Edit mode', () => {
    const params = {
      tenantId: 'tenant-id', action: 'edit', configType: 'onDemandCli',
      templateId: 'f14c4116e30743bfa3180ba4b68cd069'
    }
    beforeEach(() => {
      store.dispatch(switchApi.util.resetApiState())
      mockServer.use(
        rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
          (_, res, ctx) => res(ctx.json(configExamples))
        ),
        rest.get(SwitchUrlsInfo.getCliTemplate.url,
          (_, res, ctx) => res(ctx.json(cliTemplate))
        ),
        rest.put(SwitchUrlsInfo.updateCliTemplate.url,
          (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
        )
      )
    })

    it('should render correctly', async () => {
      render(<Provider>
        <CliTemplateForm />
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      expect(await screen.findByText(/Read this before you start/)).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')
      await screen.findByText('test CLI commands')
      // trigger tooltip
      fireEvent.mouseOver(await screen.findByTestId('tooltip-example'))
      await screen.findByText(/Click on the template to add it to the CLI configuration/)

      await userEvent.click(await screen.findByText('Switches'))
      await screen.findByRole('heading', { level: 3, name: 'Switches' })
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
    })

    it('should handle CLI valiation', async () => {
      render(<Provider>
        <CliTemplateForm />
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      expect(await screen.findByText(/Read this before you start/)).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')
      const addExampleBtns = await screen.findAllByTestId('add-example-btn')

      await userEvent.type(await screen.findByLabelText(/Template Name/), 'test-template')
      await userEvent.click(addExampleBtns[1])
      await screen.findByText(/ip arp inspection vlan/)

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(await screen.findByText(/Please define attribute/i)).toBeVisible()
    })
    it('should close edit variable modal correctly', async () => {
      render(<Provider>
        <CliTemplateForm />
      </Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')

      // open edit variable modal
      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      await screen.findAllByText(/testaaa/)
      const editVarBtns = await screen.findAllByTestId('edit-var-btn')
      await userEvent.click(editVarBtns[0])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

      const dialog = await screen.findByRole('dialog')
      await screen.findByText('Edit Variable')
      await userEvent.click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    })
    it('should edit variable correctly', async () => {
      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')

      // open edit variable modal
      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      const editVarBtns = await screen.findAllByTestId('edit-var-btn')
      await userEvent.click(editVarBtns[1])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }))

      const dialog = await screen.findByRole('dialog')
      await screen.findByText('Edit Variable')
      await userEvent.type(await within(dialog).findByTestId('end-value'), '88')
      await userEvent.click(await within(dialog).findByRole('button', { name: 'OK' }))
    })

    it('should delete variable correctly', async () => {
      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')

      await userEvent.click(await screen.findByRole('tab', { name: 'Variables' }))
      const editVarBtns = await screen.findAllByTestId('edit-var-btn')
      expect(editVarBtns).toHaveLength(2)
      await userEvent.click(editVarBtns[1])
      await userEvent.click(await screen.findByRole('menuitem', { name: 'Delete' }))
      expect(await screen.findAllByTestId('edit-var-btn')).toHaveLength(1)

      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
      expect(await screen.findByText(/Please define variable/i)).toBeVisible()
    })

    it('should limit the number of variables', async () => {
      mockServer.use(
        rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
          (_, res, ctx) => res(ctx.json(configExamples))
        ),
        rest.get(SwitchUrlsInfo.getCliTemplate.url,
          (_, res, ctx) => res(ctx.json(cliTemplateWith200Variables))
        ),
        rest.put(SwitchUrlsInfo.updateCliTemplate.url,
          (_, res, ctx) => res(ctx.json({ requestId: 'request-id' }))
        )
      )

      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })

      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')
      expect(await screen.findByText(/manager active-list/)).toBeVisible()

      const variablesTab = await screen.findByRole('tab', { name: 'Variables' })
      await userEvent.click(variablesTab)
      expect(variablesTab.getAttribute('aria-selected')).toBeTruthy()

      const tabPanel = await screen.findByRole('tabpanel', { hidden: false })
      expect(await within(tabPanel).findByText('v200')).toBeVisible()

      const addVariableBtn = await screen.findByTestId('add-variable-btn')
      expect(addVariableBtn).toBeDisabled()
    })

    it('should import CLI from file correctly', async () => {
      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')

      await userEvent.click(await screen.findByRole('button', { name: 'Import from file' }))
      const drawer = await screen.findByRole('dialog')
      await within(drawer).findByText('Import from file')
      await userEvent.click(await within(drawer).findByRole('button', { name: 'Cancel' }))
    })

    it('should handle error occurred', async () => {
      const spyLog = jest.spyOn(console, 'log')
      spyLog.mockReset()
      mockServer.use(
        rest.put(SwitchUrlsInfo.updateCliTemplate.url,
          (_, res, ctx) => res(ctx.status(404), ctx.json({ errors: [{ code: 'xxxx' }] }))
        )
      )

      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })

      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByText('CLI Configuration'))

      await screen.findByRole('heading', { level: 3, name: 'CLI Configuration' })
      await screen.findByText('CLI commands')
      await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))

      await waitFor(() => {
        expect(spyLog).toBeCalledTimes(1)
      })
    })

    it('should redirect to list table after clicking cancel button', async () => {
      render(<Provider><CliTemplateForm /></Provider>, {
        route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
      })
      await waitFor(() => {
        expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
      })
      expect(await screen.findByText('Edit CLI Template')).toBeVisible()
      await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }))
    })
  })

  describe('RBAC', () => {
    describe('Edit mode', () => {
      const params = {
        tenantId: 'tenant-id', action: 'edit', configType: 'onDemandCli',
        templateId: 'f14c4116e30743bfa3180ba4b68cd069'
      }
      const templatesData = {
        ...templates,
        variables: [{
          name: 'testaaa', type: 'STRING', value: 'aaaa'
        }, {
          name: 'test', type: 'RANGE', rangeStart: 3, rangeEnd: 44
        }]
      }
      beforeEach(() => {
        store.dispatch(switchApi.util.resetApiState())
        mockServer.use(
          rest.get(SwitchUrlsInfo.getCliConfigExamples.url,
            (_, res, ctx) => res(ctx.json(configExamples))
          ),
          rest.get(SwitchUrlsInfo.getCliTemplate.url,
            (_, res, ctx) => res(ctx.json(cliTemplate))
          ),
          rest.post(SwitchUrlsInfo.getCliTemplates.url,
            (_, res, ctx) => res(ctx.json({ data: templatesData }))
          ),
          rest.put(SwitchUrlsInfo.updateCliTemplate.url,
            (_, res, ctx) => {
              mockedUpdate()
              return res(ctx.json({ requestId: 'request-id' }))
            }
          ),
          rest.post(SwitchRbacUrlsInfo.getSwitchList.url,
            (_, res, ctx) => res(ctx.json({ data: switchlist }))
          ),
          rest.put(SwitchRbacUrlsInfo.associateCliTemplate.url,
            (_, res, ctx) => {
              mockedAssociate()
              return res(ctx.json({ requestId: 'request-id' }))
            }
          ),
          rest.delete(SwitchRbacUrlsInfo.disassociateCliTemplate.url,
            (_, res, ctx) => {
              mockedDisassociate()
              return res(ctx.json({ requestId: 'request-id' }))
            }
          )
        )
      })

      it('should update correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider>
          <CliTemplateForm />
        </Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Template')).toBeVisible()
        expect(await screen.findByText(/Read this before you start/)).toBeVisible()

        await userEvent.click(await screen.findByText('CLI Configuration'))
        await userEvent.click(await screen.findByText('Switches'))
        await userEvent.click(await screen.findByText('My-Venue'))

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findAllByRole('row')).toHaveLength(3)

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
      })

      it('should update and associate with switch correctly', async () => {
        mockServer.use(
          rest.get(SwitchUrlsInfo.getCliTemplate.url,
            (_, res, ctx) => res(ctx.json({
              ...cliTemplate,
              venueSwitches: [{
                ...cliTemplate.venueSwitches[0],
                switches: ['c0:c5:20:aa:32:79']
              }, {
                id: '721755be58084157a10a55e0a15007fe',
                switches: ['58:fb:96:0e:bc:f8'],
                venueId: '9417693931ab409ca41ecf9b36f516be'
              }]
            }))
          )
        )
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider>
          <CliTemplateForm />
        </Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Template')).toBeVisible()
        expect(await screen.findByText(/Read this before you start/)).toBeVisible()

        await userEvent.click(await screen.findByText('Switches'))
        await userEvent.click(await screen.findByText('My-Venue'))
        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findAllByRole('row')).toHaveLength(3)
        const row = await screen.findByRole('row', { name: /7150stack/i })
        await userEvent.click(await within(row).findByRole('checkbox'))

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        await waitFor(() => expect(mockedAssociate).toBeCalled())
        expect(mockedDisassociate).toHaveBeenCalledTimes(0)
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(1)
      })

      it('should update and disassociate with switch correctly', async () => {
        jest.mocked(useIsSplitOn).mockImplementation(ff => ff === Features.SWITCH_RBAC_API)

        render(<Provider>
          <CliTemplateForm />
        </Provider>, {
          route: { params, path: '/:tenantId/networks/wired/:configType/:templateId/:action' }
        })

        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findByText('Edit CLI Template')).toBeVisible()
        expect(await screen.findByText(/Read this before you start/)).toBeVisible()

        await userEvent.click(await screen.findByText('Switches'))
        await userEvent.click(await screen.findByText('My-Venue'))
        await waitFor(() => {
          expect(screen.queryByRole('img', { name: 'loader' })).not.toBeInTheDocument()
        })
        expect(await screen.findAllByRole('row')).toHaveLength(3)
        const row = await screen.findByRole('row', { name: /7150stack/i })
        await userEvent.click(await within(row).findByRole('checkbox'))

        await userEvent.click(await screen.findByRole('button', { name: 'Apply' }))
        await waitFor(() => expect(mockedDisassociate).toBeCalled())
        await waitFor(() => expect(mockedUpdate).toBeCalled())
        expect(mockedDisassociate).toHaveBeenCalledTimes(1)
        expect(mockedUpdate).toHaveBeenCalledTimes(1)
        expect(mockedAssociate).toHaveBeenCalledTimes(0)
      })
    })
  })
})
