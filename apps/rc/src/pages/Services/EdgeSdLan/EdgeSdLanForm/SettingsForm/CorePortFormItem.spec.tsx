
import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }                                                                               from '@acx-ui/components'
import { useIsSplitOn }                                                                            from '@acx-ui/feature-toggle'
import { EdgeUrlsInfo, EdgePortConfigFixtures, EdgeLagFixtures, EdgeSdLanUrls, EdgeSdLanFixtures } from '@acx-ui/rc/utils'
import { Provider }                                                                                from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { CorePortFormItem } from './CorePortFormItem'

const { mockEdgePortConfig, mockEdgePortStatus } = EdgePortConfigFixtures
const { mockedEdgeLagList, mockEdgeLagStatusList } = EdgeLagFixtures
const { mockedSdLanDataList } = EdgeSdLanFixtures

jest.mock('@acx-ui/utils', () => ({
  ...jest.requireActual('@acx-ui/utils'),
  useTenantId: () => 'mocked_tenant_id'
}))
jest.mock('./styledComponents', () => {
  const UIComps = jest.requireActual('./styledComponents')
  return {
    ...UIComps,
    AlertText: ({ children }:React.PropsWithChildren) =>
      <div data-testid='rc-AlertText'>
        <UIComps.AlertText>{children}</UIComps.AlertText>
      </div> }
})

const { click } = userEvent

describe('Edge centrailized forwarding form: CorePortFormItem', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
      ),
      rest.get(
        EdgeUrlsInfo.getPortConfig.url,
        (req, res, ctx) => res(ctx.json(mockEdgePortConfig))
      ),
      rest.patch(
        EdgeUrlsInfo.updatePortConfig.url,
        (req, res, ctx) => res(ctx.status(202))
      ),
      rest.get(
        EdgeUrlsInfo.getEdgeLagList.url,
        (req, res, ctx) => res(ctx.json(mockedEdgeLagList))
      ),
      rest.post(
        EdgeUrlsInfo.getEdgeLagStatusList.url,
        (_req, res, ctx) => res(ctx.json(mockEdgeLagStatusList))
      ),
      rest.post(
        EdgeSdLanUrls.getEdgeSdLanViewDataList.url,
        (_, res, ctx) => res(ctx.json({ data: mockedSdLanDataList }))
      )
    )
  })

  it('should render correctly', async () => {
    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <CorePortFormItem
            data='00:0c:29:b6:ad:04'
            name='port0'
            edgeId='0000000002'
            edgeName='Smart Edge 2'
            portsData={mockEdgePortConfig.ports}
            isLagCorePort={false}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: port0')
  })

  it('should display N/A when core port is not defined', async () => {
    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <CorePortFormItem
            data=''
            name=''
            edgeId='0000000003'
            edgeName='Smart Edge 3'
            portsData={mockEdgePortConfig.ports}
            isLagCorePort={false}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: N/A')
    await click(await within(formBody).findByText('SmartEdge\'s Port configuration'))
    await waitFor(async () => expect(await screen.findByRole('dialog')).toBeVisible())
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Smart Edge 3')).toBeValid()
    await click(await within(dialog).findByRole('button', { name: 'Cancel' }))
    await waitFor(() => expect(dialog).not.toBeVisible())
  })

  it('should display nothing when edgeId undefined or core port is defined', async () => {
    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <CorePortFormItem
            data='00:0c:29:b6:ad:04'
            name='port0'
            edgeId={undefined}
            edgeName=''
            portsData={mockEdgePortConfig.ports}
            isLagCorePort={false}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    let formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: N/A')
    // eslint-disable-next-line testing-library/no-node-access
    expect((await within(formBody).findByTestId('rc-AlertText')).children[0].innerHTML).toBe('')
  })

  it('Unsaved changes modal pop up wihtout error - discard', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <CorePortFormItem
            data=''
            name=''
            edgeId='0000000003'
            edgeName='Smart Edge 3'
            portsData={mockEdgePortConfig.ports}
            isLagCorePort={false}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: N/A')
    await click(await within(formBody).findByText('SmartEdge\'s Port configuration'))
    await waitFor(async () => expect(await screen.findByRole('dialog')).toBeVisible())
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Smart Edge 3')).toBeValid()
    await screen.findByRole('tab', { name: 'Ports General' })
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '2')
    await userEvent.click(await screen.findByRole('tab', { name: 'LAG' }))
    const msg = await screen.findByText('You Have Unsaved Changes')
    await userEvent.click(await screen.findByRole('button', { name: 'Discard Changes' }))
    await waitFor(() => expect(msg).not.toBeVisible())
  })

  it('Unsaved changes modal pop up wihtout error - save', async () => {
    jest.mocked(useIsSplitOn).mockReturnValue(true)

    render(<Provider>
      <StepsForm>
        <StepsForm.StepForm>
          <CorePortFormItem
            data=''
            name=''
            edgeId='0000000003'
            edgeName='Smart Edge 3'
            portsData={mockEdgePortConfig.ports}
            isLagCorePort={false}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    const formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: N/A')
    await click(await within(formBody).findByText('SmartEdge\'s Port configuration'))
    await waitFor(async () => expect(await screen.findByRole('dialog')).toBeVisible())
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).queryByText('Smart Edge 3')).toBeValid()
    await screen.findByRole('tab', { name: 'Ports General' })
    await userEvent.type(await screen.findByRole('textbox', { name: 'IP Address' }), '2')
    await userEvent.click(await screen.findByRole('tab', { name: 'LAG' }))
    const msg = await screen.findByText('You Have Unsaved Changes')
    await userEvent.click(await screen.findByRole('button', { name: 'Save Changes' }))
    await waitFor(() => expect(msg).not.toBeVisible())
  })
})
