import { rest } from 'msw'
import { Path } from 'react-router-dom'

import { useIsSplitOn }                                                                                                              from '@acx-ui/feature-toggle'
import { ActionType, AupAction, GenericActionData, StepType, UIConfiguration, WorkflowActionDefinition, WorkflowStep, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                  from '@acx-ui/store'
import { mockServer, render, screen, waitFor, waitForElementToBeRemoved }                                                            from '@acx-ui/test-utils'

import { WorkflowActionPreview } from './WorkflowActionPreview'

const config: UIConfiguration = {
  disablePoweredBy: false,
  uiColorSchema: {
    fontHeaderColor: 'var(--acx-neutrals-100)',
    backgroundColor: 'var(--acx-primary-white)',
    fontColor: 'var(--acx-neutrals-100)',

    buttonFontColor: 'var(--acx-primary-white)',
    buttonColor: 'var(--acx-accents-orange-50)'
  },
  uiStyleSchema: {
    logoRatio: 1,
    titleFontSize: 16,
    logoImageFileName: 'logo',
    backgroundImageName: 'bgImage'
  },
  welcomeName: '',
  welcomeTitle: ''
}

const actionDefinitions: WorkflowActionDefinition[] = [
  {
    actionType: ActionType.AUP,
    id: 'actionId1',
    name: 'action1',
    category: '',
    isSplit: false
  },
  {
    actionType: ActionType.DATA_PROMPT,
    id: 'actionId2',
    name: 'action2',
    category: '',
    isSplit: false
  },
  {
    actionType: ActionType.DISPLAY_MESSAGE,
    id: 'actionId3',
    name: 'action3',
    category: '',
    isSplit: false
  }
]

const steps: WorkflowStep[] = [
  {
    id: 'id1',
    type: StepType.Basic,
    enrollmentActionId: 'id',
    actionDefinitionId: 'actionId1',
    actionType: ActionType.AUP
  },
  {
    id: 'id2',
    type: StepType.Basic,
    enrollmentActionId: '',
    actionDefinitionId: 'actionId2',
    actionType: ActionType.DATA_PROMPT
  },
  {
    id: 'id1',
    type: StepType.Basic,
    enrollmentActionId: '',
    actionDefinitionId: 'actionId3',
    actionType: ActionType.DISPLAY_MESSAGE
  }
]

const actionData: GenericActionData = {
  id: 'id1',
  name: 'id1',
  version: 1,
  description: '',
  actionType: ActionType.AUP,
  title: '',
  messageHtml: '',
  checkboxText: '',
  bottomLabel: '',
  backButtonText: '',
  continueButtonText: '',
  displayBackButton: false,
  displayContinueButton: false
}


const mockedUseNavigate = jest.fn()
const mockedTenantPath: Path = {
  pathname: 't/__tenantId__',
  search: '',
  hash: ''
}

jest.mock('@acx-ui/react-router-dom', () => ({
  ...jest.requireActual('@acx-ui/react-router-dom'),
  useNavigate: () => mockedUseNavigate,
  useTenantLink: (): Path => mockedTenantPath
}))



describe('Workflow Action Preview', () => {
  const getUIConfigApi = jest.fn()
  const getUIConfigImageApi = jest.fn()
  const getDefinitionApi = jest.fn()
  const getStepsApi = jest.fn()
  const getActionApi = jest.fn()
  jest.mocked(useIsSplitOn).mockReturnValue(true)
  const params = { tenantId: 't1', policyId: 'id' }
  beforeEach(async () => {
    getUIConfigApi.mockClear()
    getUIConfigImageApi.mockClear()
    getDefinitionApi.mockClear()
    getStepsApi.mockClear()
    getActionApi.mockClear()
    jest.mocked(useIsSplitOn).mockReturnValue(true)
    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowUIConfig.url,
        (req, res, ctx) => {
          getUIConfigApi()
          return res(ctx.json(config))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowUIConfigImage.url,
        (reg, res, ctx) => {
          getUIConfigImageApi()
          return res(ctx.json({ fileUrl: 'fileUrl' }))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (req, res, ctx) => {
          getDefinitionApi()
          return res(ctx.json({ content: actionDefinitions }))
        }
      ),
      rest.get(
        WorkflowUrls.getWorkflowStepsById.url.split('?')[0],
        (req, res, ctx) => {
          getStepsApi()
          return res(ctx.json({ content: steps }))
        }
      ),
      rest.get(
        WorkflowUrls.getActionById.url,
        (req, res, ctx) => {
          getActionApi()
          return res(ctx.json(actionData))
        }
      )
    )
  })

  it('should render correctly without step and action data', async () => {
    render(<Provider>
      <WorkflowActionPreview workflowId='id'/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Portal Design')
    await waitFor(() => expect(getUIConfigApi).toHaveBeenCalled())
    await waitFor(() => expect(getUIConfigImageApi).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(getDefinitionApi).toHaveBeenCalled())
    await waitFor(() => expect(getStepsApi).toHaveBeenCalled())
  })

  it('should render correctly with step', async () => {
    render(<Provider>
      <WorkflowActionPreview workflowId='id' step={steps[0]}/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Portal Design')
    await waitFor(() => expect(getUIConfigApi).toHaveBeenCalled())
    await waitFor(() => expect(getUIConfigImageApi).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(getActionApi).toHaveBeenCalled())
  })

  it('should render correctly with action data', async () => {
    render(<Provider>
      <WorkflowActionPreview workflowId='id' actionData={actionData}/>
    </Provider>, {
      route: { params }
    })

    await waitForElementToBeRemoved(() => screen.queryByRole('img', { name: 'loader' }))
    await screen.findByText('Portal Design')
    await waitFor(() => expect(getUIConfigApi).toHaveBeenCalled())
    await waitFor(() => expect(getUIConfigImageApi).toHaveBeenCalledTimes(2))
  })
})
