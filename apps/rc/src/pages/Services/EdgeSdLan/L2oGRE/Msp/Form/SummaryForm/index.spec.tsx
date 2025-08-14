import { Form } from 'antd'

import { StepsForm }                  from '@acx-ui/components'
import { render, renderHook, screen } from '@acx-ui/test-utils'

import { EdgeSdLanContext, EdgeSdLanContextType }       from '../../../Form/EdgeSdLanContextProvider'
import { ApplyTo }                                      from '../../../shared/type'
import { MspEdgeSdLanContext, MspEdgeSdLanContextType } from '../MspEdgeSdLanContextProvider'

import { SummaryForm } from '.'

const defaultContext = {} as EdgeSdLanContextType
const defaultMspContext = {} as MspEdgeSdLanContextType

describe('SummaryForm - MSP', () => {
  it('should render correctly with my account and my customers', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_ACCOUNT, ApplyTo.MY_CUSTOMERS]
      })
      return form
    })

    render(
      <EdgeSdLanContext.Provider value={defaultContext}>
        <MspEdgeSdLanContext.Provider value={defaultMspContext}>
          <StepsForm form={result.current}>
            <SummaryForm />
          </StepsForm>
        </MspEdgeSdLanContext.Provider>
      </EdgeSdLanContext.Provider>
    )

    expect(screen.getByText('Own Account')).toBeVisible()
    expect(screen.getByText('Customers')).toBeVisible()
    expect(screen.getByText('Venues & Networks (0)')).toBeVisible()
    expect(screen.getByText('Venue Templates & Network Templates (0)')).toBeVisible()
  })

  it('should render correctly with my account only', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_ACCOUNT]
      })
      return form
    })

    render(
      <EdgeSdLanContext.Provider value={defaultContext}>
        <MspEdgeSdLanContext.Provider value={defaultMspContext}>
          <StepsForm form={result.current}>
            <SummaryForm />
          </StepsForm>
        </MspEdgeSdLanContext.Provider>
      </EdgeSdLanContext.Provider>
    )

    expect(screen.getByText('Venues & Networks (0)')).toBeVisible()
    expect(screen.queryByText('Venue Templates & Network Templates (0)')).not.toBeInTheDocument()
  })

  it('should render correctly with my customers only', () => {
    const { result } = renderHook(() => {
      const [form] = Form.useForm()
      form.setFieldsValue({
        applyTo: [ApplyTo.MY_CUSTOMERS]
      })
      return form
    })

    render(
      <EdgeSdLanContext.Provider value={defaultContext}>
        <MspEdgeSdLanContext.Provider value={defaultMspContext}>
          <StepsForm form={result.current}>
            <SummaryForm />
          </StepsForm>
        </MspEdgeSdLanContext.Provider>
      </EdgeSdLanContext.Provider>
    )

    expect(screen.queryByText('Venues & Networks (0)')).not.toBeInTheDocument()
    expect(screen.getByText('Venue Templates & Network Templates (0)')).toBeVisible()
  })
})