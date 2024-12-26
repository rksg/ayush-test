import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                           from '@acx-ui/components'
import { render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { NetworkTopologyForm } from '.'

describe('PersonalIdentityNetworkForm - NetworkTopologyForm', () => {
  it('should render correctly', async () => {
    render(
      <StepsForm>
        <StepsForm.StepForm>
          <NetworkTopologyForm />
        </StepsForm.StepForm>
      </StepsForm>
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
  })

  it('the value of the network topology card should be correct', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <StepsForm form={formRef.current}>
        <StepsForm.StepForm>
          <NetworkTopologyForm />
        </StepsForm.StepForm>
      </StepsForm>
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
})