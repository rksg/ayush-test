import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { ApplyTo } from '../GeneralForm'

import { NetworkSelectionForm } from '.'

jest.mock('../../../Form/NetworkSelectionForm/VenueNetworkTable', () => ({
  EdgeSdLanVenueNetworksTable: () => <div data-testid='EdgeSdLanVenueNetworksTable'></div>
}))
jest.mock('./VenueTemplateNetworkTable', () => ({
  // eslint-disable-next-line max-len
  EdgeSdLanVenueNetworksTemplateTable: () => <div data-testid='EdgeSdLanVenueNetworksTemplateTable'></div>
}))

describe('NetworkSelectionForm - MSP', () => {
  it('should render correctly with my account and my customers', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_ACCOUNT, ApplyTo.MY_CUSTOMERS]
      })
      return form
    })

    render(
      <StepsForm form={result.current}>
        <NetworkSelectionForm />
      </StepsForm>
    )

    // eslint-disable-next-line max-len
    expect(screen.getByRole('tab', { name: 'Own Account' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('EdgeSdLanVenueNetworksTable')).toBeVisible()
    const myCustomersTab = screen.getByRole('tab', { name: 'My Customers' })
    await userEvent.click(myCustomersTab)
    expect(myCustomersTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTestId('EdgeSdLanVenueNetworksTemplateTable')).toBeVisible()
  })

  it('should render correctly with my account only', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_ACCOUNT]
      })
      return form
    })

    render(
      <StepsForm form={result.current}>
        <NetworkSelectionForm />
      </StepsForm>
    )

    expect(screen.getByTestId('EdgeSdLanVenueNetworksTable')).toBeVisible()
    expect(screen.queryByTestId('EdgeSdLanVenueNetworksTemplateTable')).not.toBeInTheDocument()
  })

  it('should render correctly with my customers only', async () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_CUSTOMERS]
      })
      return form
    })

    render(
      <StepsForm form={result.current}>
        <NetworkSelectionForm />
      </StepsForm>
    )

    expect(screen.queryByTestId('EdgeSdLanVenueNetworksTable')).not.toBeInTheDocument()
    expect(screen.getByTestId('EdgeSdLanVenueNetworksTemplateTable')).toBeVisible()
  })
})