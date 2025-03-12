import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { ActionType, WorkflowUrls }                    from '@acx-ui/rc/utils'
import { Provider }                                    from '@acx-ui/store'
import { mockServer, render, screen, waitFor, within } from '@acx-ui/test-utils'

import { RequiredDependency } from '../WorkflowPanel'

import { ActionCardProps } from './ActionCard'
import ActionsLibrary      from './ActionsLibrary'

const mockedDefinitionList = {
  content: [
    {
      id: `id-${ActionType.AUP}`,
      actionType: ActionType.AUP
    },
    {
      id: `id-${ActionType.DISPLAY_MESSAGE}`,
      actionType: ActionType.DISPLAY_MESSAGE
    },
    {
      id: `id-${ActionType.DATA_PROMPT}`,
      actionType: ActionType.DATA_PROMPT
    }
  ]
}

// Mock the ActionCard component to wrap it with a div containing data-testid
jest.mock('./ActionCard', () => {
  const OriginalActionCard = jest.requireActual('./ActionCard').default
  return (props: ActionCardProps) => (
    <div data-testid={props.actionType}>
      <OriginalActionCard {...props} />
    </div>
  )
})

describe('ActionsLibrary', () => {
  const spyDefQuery = jest.fn()

  beforeEach(() => {
    spyDefQuery.mockClear()

    mockServer.use(
      rest.get(
        WorkflowUrls.getWorkflowActionDefinitions.url.split('?')[0],
        (_, res, ctx) => {
          spyDefQuery()
          return res(ctx.json(mockedDefinitionList))
        }
      )
    )
  })

  it('should denied DataPrompt Card due to required dependency(ONE_OF) on AUP', async () => {
    const mockedOneOfRelationshipMap: Partial<Record<ActionType, RequiredDependency>> = {
      [ActionType.DATA_PROMPT]: {
        type: 'ONE_OF',
        required: new Set([ActionType.AUP])
      }
    }

    render(<Provider>
      <ActionsLibrary
        onClickAction={jest.fn()}
        relationshipMap={mockedOneOfRelationshipMap}
      />
    </Provider>)

    await waitFor(() => expect(spyDefQuery).toHaveBeenCalled())

    expect(within(screen.getByTestId(ActionType.AUP))
      .getByRole('button', { name: /add/i })).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DATA_PROMPT))
      .getByRole('button', { name: /add/i })).not.toBeEnabled()
  })

  it('should denied DataPrompt Card due to required dependency(ALL) on AUP', async () => {
    const mockedOneOfRelationshipMap: Partial<Record<ActionType, RequiredDependency>> = {
      [ActionType.DATA_PROMPT]: {
        type: 'ALL',
        required: new Set([ActionType.AUP, ActionType.DISPLAY_MESSAGE])
      }
    }

    render(<Provider>
      <ActionsLibrary
        onClickAction={jest.fn()}
        relationshipMap={mockedOneOfRelationshipMap}
        existingActionTypes={new Set([ActionType.AUP, ActionType.DATA_PROMPT])}
      />
    </Provider>)

    await waitFor(() => expect(spyDefQuery).toHaveBeenCalled())

    expect(within(screen.getByTestId(ActionType.AUP))
      .getByRole('button', { name: /add/i })).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DATA_PROMPT))
      .getByRole('button', { name: /add/i })).not.toBeEnabled()
  })

  it('should allow all of ActionType due to no restrict', async () => {
    const spyOnClickAction = jest.fn()
    render(<Provider>
      <ActionsLibrary
        onClickAction={spyOnClickAction}
        relationshipMap={{}}
      />
    </Provider>)

    await waitFor(() => expect(spyDefQuery).toHaveBeenCalled())

    const targetButton = within(screen.getByTestId(ActionType.AUP))
      .getByRole('button', { name: /add/i })

    expect(targetButton).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DATA_PROMPT))
      .getByRole('button', { name: /add/i })).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DISPLAY_MESSAGE))
      .getByRole('button', { name: /add/i })).toBeEnabled()

    await userEvent.click(targetButton)
    expect(spyOnClickAction).toHaveBeenCalledWith(ActionType.AUP)
  })

  it('should allow DataPrompt Card although there is ONE_OF dependency', async () => {
    const mockedOneOfRelationshipMap: Partial<Record<ActionType, RequiredDependency>> = {
      [ActionType.DATA_PROMPT]: {
        type: 'ONE_OF',
        required: new Set([ActionType.AUP])
      }
    }

    render(<Provider>
      <ActionsLibrary
        onClickAction={jest.fn()}
        relationshipMap={mockedOneOfRelationshipMap}
        existingActionTypes={new Set([ActionType.AUP])}
      />
    </Provider>)

    await waitFor(() => expect(spyDefQuery).toHaveBeenCalled())

    expect(within(screen.getByTestId(ActionType.AUP))
      .getByRole('button', { name: /add/i })).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DATA_PROMPT))
      .getByRole('button', { name: /add/i })).toBeEnabled()
    expect(within(screen.getByTestId(ActionType.DISPLAY_MESSAGE))
      .getByRole('button', { name: /add/i })).toBeEnabled()
  })

})
