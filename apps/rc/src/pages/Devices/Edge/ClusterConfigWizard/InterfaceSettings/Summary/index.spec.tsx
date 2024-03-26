import { Form } from 'antd'

import { StepsForm }                        from '@acx-ui/components'
import { EdgeIpModeEnum, EdgePortTypeEnum } from '@acx-ui/rc/utils'
import { render, renderHook, screen }       from '@acx-ui/test-utils'

import { Summary } from '.'

jest.mock('./LagTable', () => ({
  ...jest.requireActual('./LagTable'),
  LagTable: () => <div data-testid='LagTable' />
}))
jest.mock('./PortGeneralTable', () => ({
  ...jest.requireActual('./PortGeneralTable'),
  PortGeneralTable: () => <div data-testid='PortGeneralTable' />
}))
jest.mock('./VipCard', () => ({
  ...jest.requireActual('./VipCard'),
  VipCard: () => <div data-testid='VipCard' />
}))

describe('InterfaceSettings - Summary', () => {
  it('should correctly render', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      form.setFieldValue('vipConfig', [
        {
          interfaces: {
            'serialNumber-1': {
              serialNumber: 'serialNumber-1',
              id: 'portId-1',
              portName: 'port1',
              ipMode: EdgeIpModeEnum.DHCP,
              mac: '00:00:00:00',
              portType: EdgePortTypeEnum.WAN,
              isCorePort: false,
              isLag: false,
              isLagMember: false,
              portEnabled: true
            }
          },
          vip: '192.168.0.23'
        }
      ])
      form.setFieldValue('timeout', 3)
      return form
    })
    render(
      <StepsForm form={formRef.current}>
        <StepsForm.StepForm>
          <Summary />
        </StepsForm.StepForm>
      </StepsForm>
    )

    expect(screen.getByText('Summary')).toBeVisible()
    expect(screen.getByTestId('LagTable')).toBeVisible()
    expect(screen.getByTestId('PortGeneralTable')).toBeVisible()
    expect(await screen.findByTestId('VipCard')).toBeVisible()
    expect(await screen.findByText('HA Timeout')).toBeVisible()
    expect(await screen.findByText('3 seconds')).toBeVisible()
  })
})