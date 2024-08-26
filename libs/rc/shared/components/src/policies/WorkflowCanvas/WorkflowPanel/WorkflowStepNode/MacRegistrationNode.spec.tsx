
import userEvent             from '@testing-library/user-event'
import { rest }              from 'msw'
import { ReactFlowProvider } from 'reactflow'

import { serviceApi }                                    from '@acx-ui/rc/services'
import { MacRegListUrlsInfo, PersonaUrls, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider, store }                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedDpskEnrollmentAction,
  mockedMacRegData,
  mockedIdentityGroupData } from './__tests__/fixtures'
import { MacRegistrationNode } from './MacRegistrationNode'

describe('MacRegistrationNode', () => {

  const enrollmentActionIdWithoutData = 'no-data-test-id'
  const enrollmentActionIdWithData = 'has-data-test-id'

  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WorkflowUrls.getActionById.url,
        (req, res, ctx) => {
          if(req.params.actionId === enrollmentActionIdWithData) {
            return res(ctx.json(mockedDpskEnrollmentAction))
          } else {
            return res(ctx.status(404))
          }
        }
      ),
      rest.get(
        MacRegListUrlsInfo.getMacRegistrationPool.url,
        (req, res, ctx) => res(ctx.json(mockedMacRegData))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedIdentityGroupData))
      )
    )
  })

  it('should show the MacReg Node WITHOUT details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <MacRegistrationNode id='test-id'
            data={{ id: 'test-id', enrollmentActionId: enrollmentActionIdWithoutData }}
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


    const dpskIcon = await screen.findByTestId('MacRegActionTypeIcon')
    expect(dpskIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('Mac Registration')
    expect(popover).toHaveTextContent('Identity Group')

    const noneText = await screen.findAllByText('None')
    expect(noneText.length).toBe(2)

  })

  it('should show the MacReg Node WITH details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <MacRegistrationNode id='test-id'
            data={{ id: 'test-id', enrollmentActionId: enrollmentActionIdWithData }}
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

    const macRegIcon = await screen.findByTestId('MacRegActionTypeIcon')
    expect(macRegIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover)
      .toHaveTextContent('Identity GroupMy Identity Group for TestingMac Registration ListNone')
  })

})
