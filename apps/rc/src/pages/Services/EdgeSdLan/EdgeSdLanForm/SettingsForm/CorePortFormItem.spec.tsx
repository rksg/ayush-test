import userEvent from '@testing-library/user-event'
import { rest }  from 'msw'

import { StepsForm }    from '@acx-ui/components'
import { EdgeUrlsInfo } from '@acx-ui/rc/utils'
import { Provider }     from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  waitFor,
  within
} from '@acx-ui/test-utils'

import { mockEdgePortConfig, mockEdgePortStatus } from '../../__tests__/fixtures'

import { CorePortFormItem } from './CorePortFormItem'

jest.mock('./styledComponents', () => {
  const UIComps = jest.requireActual('./styledComponents')
  return {
    ...UIComps,
    AlertText: ({ children }:React.PropsWithChildren) =>
      <div data-testid='rc-AlertText'>
        <UIComps.AlertText>{children}</UIComps.AlertText>
      </div> }
})

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgePortsGeneral: () => <div data-testid='rc-EdgePortsGeneral'></div>
}))

const { click } = userEvent

describe('Edge centrailized forwarding form: CorePortFormItem', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        EdgeUrlsInfo.getEdgePortStatusList.url,
        (_, res, ctx) => res(ctx.json({ data: mockEdgePortStatus }))
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
    await within(dialog).findByTestId('rc-EdgePortsGeneral')
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
          />
        </StepsForm.StepForm>
      </StepsForm>
    </Provider>)

    let formBody = await screen.findByTestId('steps-form-body')
    await within(formBody).findByText('Core Port: N/A')
    // eslint-disable-next-line testing-library/no-node-access
    expect((await within(formBody).findByTestId('rc-AlertText')).children[0].innerHTML).toBe('')
  })
})
