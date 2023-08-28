import { Form } from 'antd'
import _        from 'lodash'

import { StepsForm }      from '@acx-ui/components'
import { DdosAttackType } from '@acx-ui/rc/utils'
import {
  render,
  renderHook,
  screen } from '@acx-ui/test-utils'

import { FirewallFormModel } from '..'
import { mockFirewall }      from '../../__tests__/fixtures'

import { SummaryForm } from './'

const mockedSetFieldValue = jest.fn()
const mockedGetFieldValue = jest.fn()

// jest.mock('@acx-ui/components', () => ({
//   ...jest.requireActual('@acx-ui/components'),
//   useStepFormContext: () => ({
//     form: {
//       getFieldValue: mockedGetFieldValue.mockReturnValue(mockedDefaultValue),
//       setFieldValue: mockedSetFieldValue
//     }
//   })
// }))

describe('Summary form', () => {
  beforeEach(() => {
    mockedGetFieldValue.mockReset()
    mockedSetFieldValue.mockReset()
  })

  it('should correctly display DDoS rule summary', async () => {
    const mockedData: FirewallFormModel = _.cloneDeep(mockFirewall)
    mockedData.ddosRateLimitingEnabled = true
    mockedData.ddosRateLimitingRules = [{
      ddosAttackType: DdosAttackType.ICMP,
      rateLimiting: 12
    }]
    mockedData.statefulAclEnabled = false

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)

    const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((ddosResult.parentNode as HTMLDivElement).textContent)
      .toBe('DDoS Rate-limitingON (1 Rule)')

    const aclResult = await screen.findByText(/Stateful ACL/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((aclResult.parentNode as HTMLDivElement).textContent)
      .toBe('Stateful ACLOFF')

    expect(screen.getByText('SmartEdge (0)')).not.toBeNull()
  })

  it('should correctly display statefulACL rule summary', async () => {
    const mockedData: FirewallFormModel = _.cloneDeep(mockFirewall)
    mockedData.ddosRateLimitingRules = []
    mockedData.selectedEdges = [{
      name: 'Smart Edge 3',
      serialNumber: '0000000003'
    }]

    const { result: stepFormRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldsValue(mockedData)
      return form
    })

    render(<StepsForm form={stepFormRef.current}>
      <SummaryForm />
    </StepsForm>)

    const ddosResult = await screen.findByText(/DDoS Rate-limiting/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((ddosResult.parentNode as HTMLDivElement).textContent)
      .toBe('DDoS Rate-limitingOFF')

    const aclResult = await screen.findByText(/Stateful ACL/)
    // eslint-disable-next-line testing-library/no-node-access
    expect((aclResult.parentNode as HTMLDivElement).textContent)
      .toBe('Stateful ACLON (1 ACL)')

    expect(screen.getByText('SmartEdge (1)')).not.toBeNull()
    expect(screen.getByText('Smart Edge 3')).not.toBeNull()
  })
})
