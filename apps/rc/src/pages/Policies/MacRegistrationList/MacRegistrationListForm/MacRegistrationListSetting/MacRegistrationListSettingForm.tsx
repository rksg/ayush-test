import { Form, Input, Col, Row, Select, Switch, Space } from 'antd'
import { useIntl }                                      from 'react-intl'

import { Button, SelectionControl } from '@acx-ui/components'
import { ExpirationDateSelector }   from '@acx-ui/rc/components'
import { useLazyMacRegListsQuery }  from '@acx-ui/rc/services'
import { checkObjectNotExists }     from '@acx-ui/rc/utils'
import { useParams }                from '@acx-ui/react-router-dom'

export function MacRegistrationListSettingForm () {
  const { $t } = useIntl()
  const [ macRegList ] = useLazyMacRegListsQuery()
  const { policyId } = useParams()

  const nameValidator = async (value: string) => {
    const list = (await macRegList({
      params: { policyId },
      page: '1',
      pageSize: '10000'
    }).unwrap()).data.filter(n => n.id !== policyId)
      .map(n => ({ name: n.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Mac Registration List' }))
  }

  return (
    <Row>
      <Col span={10}>
        <Form.Item name='name'
          label={$t({ defaultMessage: 'Name' })}
          rules={[
            { required: true },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input/>}
        />
        <ExpirationDateSelector
          inputName={'expiration'}
          label={$t({ defaultMessage: 'List Expiration' })}
        />
        <Form.Item name='autoCleanup'
          valuePropName='checked'
          initialValue={true}
          label={$t({ defaultMessage: 'Automatically clean expired entries' })}>
          <Switch/>
        </Form.Item>
        <Form.Item name='defaultAccess'
          label={$t({ defaultMessage: 'Default Access' })}
          initialValue='ACCEPT'
          rules={[{ required: true }]}
        >
          <SelectionControl
            options={[{ value: 'ACCEPT', label: $t({ defaultMessage: 'ACCEPT' }) },
              { value: 'REJECT', label: $t({ defaultMessage: 'REJECT' }) }]}
          />
        </Form.Item>
      </Col>
      <Col span={24}>
        <Form.Item name='access_policy_set'
          label={$t({ defaultMessage: 'Access Policy Set' })}
          rules={[
            { required: false,
              message: $t({ defaultMessage: 'Please choose Access Policy Set' }) }
          ]}
        >
          <Space direction='horizontal'>
            <Select style={{ width: 200 }} placeholder={$t({ defaultMessage: 'Select...' })}/>
            <Button type='link'>
              {$t({ defaultMessage: 'Add Access Policy Set' })}
            </Button>
          </Space>
        </Form.Item>
      </Col>
    </Row>
  )
}
