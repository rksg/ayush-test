import {
  Space,
  Form,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle }                              from '@acx-ui/components'
import { ToggleButton }                          from '@acx-ui/rc/components'
import { AaaServerOrderEnum, AaaServerTypeEnum } from '@acx-ui/rc/utils'

import { IpPortSecretForm } from './IpPortSecretForm'
export function AuthAccServerSetting () {
  const intl = useIntl()
  const { useWatch } = Form
  const [
    enableSecondaryAuthServer,
    enableAccountingService,
    enableSecondaryAcctServer
  ] = [
    useWatch<boolean>(['enableSecondaryAuthServer']),
    useWatch<boolean>(['enableAccountingService']),
    useWatch<boolean>(['enableSecondaryAcctServer'])
  ]
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <IpPortSecretForm
          serverType={AaaServerTypeEnum.AUTHENTICATION}
          order={AaaServerOrderEnum.PRIMARY}
        />
        <Form.Item noStyle name='enableSecondaryAuthServer'>
          <ToggleButton
            enableText={intl.$t({ defaultMessage: 'Remove Secondary Server' })}
            disableText={intl.$t({ defaultMessage: 'Add Secondary Server' })}
          />
        </Form.Item>

        {enableSecondaryAuthServer &&
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.AUTHENTICATION}
            order={AaaServerOrderEnum.SECONDARY}
          />
        }
      </div>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch />
        </Form.Item>

        {enableAccountingService && (<>
          <IpPortSecretForm
            serverType={AaaServerTypeEnum.ACCOUNTING}
            order={AaaServerOrderEnum.PRIMARY}
          />

          <Form.Item noStyle name='enableSecondaryAcctServer'>
            <ToggleButton
              enableText={intl.$t({ defaultMessage: 'Remove Secondary Server' })}
              disableText={intl.$t({ defaultMessage: 'Add Secondary Server' })}
            />
          </Form.Item>

          {enableSecondaryAcctServer &&
            <IpPortSecretForm
              serverType={AaaServerTypeEnum.ACCOUNTING}
              order={AaaServerOrderEnum.SECONDARY}
            />
          }
        </>)}
      </div>
    </Space>
  )
}
