import { useContext } from 'react'

import {
  Form,
  Switch,
  Space
} from 'antd'
import { useIntl } from 'react-intl'


import { Subtitle, Tooltip }          from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { NetworkTypeEnum }            from '@acx-ui/rc/utils'

import AAAInstance        from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'



const { useWatch } = Form

export function CloudpathServerForm () {
  const { $t } = useIntl()
  const { data } = useContext(NetworkFormContext)


  const proxyServiceTooltip = <Tooltip
    placement='bottom'
    children={<QuestionMarkCircleOutlined />}
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
    })}
  />
  const enableAccountingService = useWatch('enableAccountingService')
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        {(data?.type===NetworkTypeEnum.AAA || data?.type===NetworkTypeEnum.OPEN)&&
        <Form.Item>
          <Form.Item
            noStyle
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch/>}
          />
          <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
          {proxyServiceTooltip}
        </Form.Item>}
      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item
          name='enableAccountingService'
          valuePropName='checked'
          initialValue={false}
          children={<Switch/>}
        />
        {enableAccountingService &&
        <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
          {(data?.type===NetworkTypeEnum.AAA || data?.type===NetworkTypeEnum.OPEN)&&
          <Form.Item>
            <Form.Item
              noStyle
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch/>}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>}
        </>
        }
      </div>
    </Space>
  )
}
