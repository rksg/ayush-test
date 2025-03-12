
import userEvent             from '@testing-library/user-event'
import { rest }              from 'msw'
import { ReactFlowProvider } from 'reactflow'

import { serviceApi }                                                    from '@acx-ui/rc/services'
import { CertificateUrls, PersonaUrls, WorkflowPanelMode, WorkflowUrls } from '@acx-ui/rc/utils'
import { Provider, store }                                               from '@acx-ui/store'
import {
  mockServer,
  render,
  screen
} from '@acx-ui/test-utils'

import { mockedCertTempEnrollmentAction,
  mockedCertTempData,
  mockedIdentityGroupData,
  mockedCertTempActionInvalid } from './__tests__/fixtures'
import { CertTemplateNode } from './CertTemplateNode'

describe('CertTemplateNode', () => {

  const enrollmentActionIdWithoutData = 'no-data-test-id'
  const enrollmentActionIdWithData = 'has-data-test-id'

  beforeEach(() => {
    store.dispatch(serviceApi.util.resetApiState())
    mockServer.use(
      rest.get(
        WorkflowUrls.getActionById.url,
        (req, res, ctx) => {
          if(req.params.actionId === enrollmentActionIdWithData) {
            return res(ctx.json(mockedCertTempEnrollmentAction))
          } else if (req.params.actionId === mockedCertTempActionInvalid.id) {
            return res(ctx.json(mockedCertTempActionInvalid))
          } else {
            return res(ctx.status(404))
          }
        }
      ),
      rest.get(
        CertificateUrls.getCertificateTemplate.url,
        (req, res, ctx) => res(ctx.json(mockedCertTempData))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (req, res, ctx) => res(ctx.json(mockedIdentityGroupData))
      )
    )
  })

  it('should show the Certificate Node WITHOUT details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <CertTemplateNode id='test-id'
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

    const label = await screen.findByText('Install a Certificate')
    expect(label).toBeVisible()

    const certIcon = await screen.findByTestId('CertTemplateActionTypeIcon')
    expect(certIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('Certificate Service')
    expect(popover).toHaveTextContent('Identity Group')

    const noneText = await screen.findAllByText('None')
    expect(noneText.length).toBe(2)

  })

  it('should show the Certificate Node WITH details', async () => {

    render(
      <Provider>
        <ReactFlowProvider>
          <CertTemplateNode id='test-id'
            data={{
              id: 'test-id',
              enrollmentActionId: enrollmentActionIdWithData,
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

    const label = await screen.findByText('Install a Certificate')
    expect(label).toBeVisible()

    const certIcon = await screen.findByTestId('CertTemplateActionTypeIcon')
    expect(certIcon).toBeVisible()

    const detailsPopoverLabel = await screen.findByText('Details')
    await userEvent.hover(detailsPopoverLabel)

    const popover = await screen.findByRole('tooltip')
    expect(popover).toHaveTextContent('Certificate Service')
    expect(popover).toHaveTextContent(mockedCertTempData.name)
    expect(popover).toHaveTextContent('Identity Group')
    expect(popover).toHaveTextContent(mockedIdentityGroupData.name)
  })

  it('should not render Details in Default panel mode', () => {
    render(
      <Provider>
        <ReactFlowProvider>
          <CertTemplateNode id='test-id'
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
