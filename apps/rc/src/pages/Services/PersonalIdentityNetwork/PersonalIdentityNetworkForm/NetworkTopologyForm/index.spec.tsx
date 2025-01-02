import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                                   from '@acx-ui/components'
import { render, renderHook, screen, waitFor, within } from '@acx-ui/test-utils'

import { mockContextData }                    from '../../__tests__/fixtures'
import { PersonalIdentityNetworkFormContext } from '../PersonalIdentityNetworkFormContext'

import { NetworkTopologyForm } from '.'

jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  EdgeCompatibilityDrawer: () => <div data-testid='EdgeCompatibilityDrawer' />
}))

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Spin: ({ children, spinning }: React.PropsWithChildren
  & { spinning: boolean }) => <div>
    {spinning ? <div data-testid='antd-spinning' children={children} /> : children}
  </div>
}))

describe('PersonalIdentityNetworkForm - NetworkTopologyForm', () => {
  it('should render correctly', async () => {
    render(
      <PersonalIdentityNetworkFormContext.Provider
        value={mockContextData}
      >
        <StepsForm>
          <StepsForm.StepForm>
            <NetworkTopologyForm />
          </StepsForm.StepForm>
        </StepsForm>
      </PersonalIdentityNetworkFormContext.Provider>
    )
    const images = screen.getAllByRole('img')
    expect(images[0].getAttribute('src')).toBe('wireless-topology.svg')
    expect(images[1].getAttribute('src')).toBe('2-tier-topology.svg')
    expect(images[2].getAttribute('src')).toBe('3-tier-topology.svg')
    // eslint-disable-next-line max-len
    expect(screen.getByText('Select the network topology for this venue and ensure device compatibility.')).toBeVisible()
    expect(screen.getByText('Wireless topology')).toBeVisible()
    expect(screen.getByText('2-tier topology')).toBeVisible()
    expect(screen.getByText('3-tier topology')).toBeVisible()
    expect(screen.getByTestId('EdgeCompatibilityDrawer')).toBeVisible()
  })

  it('the value of the network topology card should be correct', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <PersonalIdentityNetworkFormContext.Provider
        value={mockContextData}
      >
        <StepsForm form={formRef.current}>
          <StepsForm.StepForm>
            <NetworkTopologyForm />
          </StepsForm.StepForm>
        </StepsForm>
      </PersonalIdentityNetworkFormContext.Provider>
    )
    const options = screen.getAllByRole('radio')
    await userEvent.click(options[0])
    // eslint-disable-next-line max-len
    await waitFor(() => expect(formRef.current.getFieldValue('networkTopologyType')).toBe('Wireless'))
    await userEvent.click(options[1])
    await waitFor(() => expect(formRef.current.getFieldValue('networkTopologyType')).toBe('2-Tier'))
    await userEvent.click(options[2])
    await waitFor(() => expect(formRef.current.getFieldValue('networkTopologyType')).toBe('3-Tier'))
  })

  // eslint-disable-next-line max-len
  it('2-tier and 3-tier topology should be disabled when there is no compatible switch', async () => {
    render(
      <PersonalIdentityNetworkFormContext.Provider
        value={{ ...mockContextData, switchList: [{ id: '1', model: 'ICX7000-48P' }] }}
      >
        <StepsForm>
          <StepsForm.StepForm>
            <NetworkTopologyForm />
          </StepsForm.StepForm>
        </StepsForm>
      </PersonalIdentityNetworkFormContext.Provider>
    )
    const disabledFrame = screen.getAllByTestId('antd-spinning')
    expect(disabledFrame.length).toBe(2)
    expect(within(disabledFrame[0]).getByRole('radio').getAttribute('value')).toBe('2-Tier')
    expect(within(disabledFrame[1]).getByRole('radio').getAttribute('value')).toBe('3-Tier')
  })
})