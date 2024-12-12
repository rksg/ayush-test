
import userEvent             from '@testing-library/user-event'
import { rest }              from 'msw'
import { ReactFlowProvider } from 'reactflow'

import { serviceApi }                                             from '@acx-ui/rc/services'
import { DpskUrls, PersonaUrls, WorkflowPanelMode, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                        from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedDpskEnrollmentAction,
  mockedDpskData,
  mockedIdentityGroupData,
  mockedDpskActionInvalid } from './__tests__/fixtures'
import { DpskNode } from './DpskNode'

describe('DpskNode', () => {

  const enrollmentActionIdWithoutData = 'no-data-test-id'

  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WorkflowUrls.getActionById.url,
        (req, res, ctx) => {
          if(req.params.actionId === mockedDpskEnrollmentAction.id) {
            return res(ctx.json(mockedDpskEnrollmentAction))
          } else if (req.params.actionId === mockedDpskActionInvalid.id) {
            return res(ctx.json(mockedDpskActionInvalid))
          } else {
            return res(ctx.status(404))
          }
        }
      ),
      rest.get(
        DpskUrls.getDpsk.url,
        (req, res, ctx) => res(ctx.json(mockedDpskData))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedIdentityGroupData))
      )
    )
  })

  afterEach(() => mockServer.resetHandlers())
  afterAll(() => mockServer.close())

  it('should show the DPSK Node WITHOUT details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <DpskNode id='test-id'
            data={{
              id: 'test-id',
              enrollmentActionId: enrollmentActionIdWithoutData,
              mode: WorkflowPanelMode.Design
            }}
            selected={false}
            type={''}
            zIndex={0}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}/>
        </ReactFlowProvider>
      </Provider>
    )

    const label = await screen.findByText('Provide DPSK')
    expect(label).toBeVisible()

    const dpskIcon = await screen.findByTestId('DpskActionTypeIcon')
    expect(dpskIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('DPSK Service')
    expect(popover).toHaveTextContent('Identity Group')

    const noneText = await screen.findAllByText('None')
    expect(noneText.length).toBe(2)

  })

  it('should show the DPSK Node WITHOUT details when INVALID', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <DpskNode id='test-id'
            data={{
              id: 'test-id',
              enrollmentActionId: mockedDpskActionInvalid.id,
              mode: WorkflowPanelMode.Design
            }}
            selected={false}
            type={''}
            zIndex={0}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}/>
        </ReactFlowProvider>
      </Provider>
    )

    const label = await screen.findByText('Provide DPSK')
    expect(label).toBeVisible()

    const dpskIcon = await screen.findByTestId('DpskActionTypeIcon')
    expect(dpskIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('DPSK Service')
    expect(popover).toHaveTextContent('Identity Group')

    const noneText = await screen.findAllByText('None')
    expect(noneText.length).toBe(2)

  })

  it.skip('should show the DPSK Node WITH details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <DpskNode id='test-id'
            data={{
              id: 'test-id',
              enrollmentActionId: mockedDpskEnrollmentAction.id,
              mode: WorkflowPanelMode.Design
            }}
            selected={false}
            type={''}
            zIndex={0}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}/>
        </ReactFlowProvider>
      </Provider>
    )

    const label = await screen.findByText('Provide DPSK')
    expect(label).toBeVisible()

    const dpskIcon = await screen.findByTestId('DpskActionTypeIcon')
    expect(dpskIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('DPSK Service')
    expect(popover).toHaveTextContent(mockedDpskData.name)
    expect(popover).toHaveTextContent('Identity Group')
    expect(popover).toHaveTextContent(mockedIdentityGroupData.name)
  })

  it('should not render Details in Default panel mode', () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <DpskNode id='test-id'
            data={{
              id: 'test-id',
              enrollmentActionId: enrollmentActionIdWithoutData,
              mode: WorkflowPanelMode.Default
            }}
            selected={false}
            type={''}
            zIndex={0}
            isConnectable={false}
            xPos={0}
            yPos={0}
            dragging={false}/>
        </ReactFlowProvider>
      </Provider>
    )

    expect(screen.queryByText('Details')).toBeNull()
  })

})
