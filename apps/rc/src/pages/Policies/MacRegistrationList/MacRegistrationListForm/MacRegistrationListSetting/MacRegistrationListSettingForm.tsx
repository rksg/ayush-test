import { Form, Input, Col,  Row, Select, Switch } from 'antd'
import { useIntl }                                from 'react-intl'

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
    const list = (await macRegList({}).unwrap()).data.filter(n => n.id !== policyId)
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
        <Form.Item name='autoCleanup'
          valuePropName='checked'
          initialValue={true}
          label={$t({ defaultMessage: 'Automatically clean expired entries' })}>
          <Switch/>
        </Form.Item>
        <Form.Item name='defaultAccess'
          label={$t({ defaultMessage: 'Default Access' })}
          initialValue={'accept'}>
          <SelectionControl
            options={[{ value: 'accept', label: $t({ defaultMessage: 'ACCEPT' }) },
              { value: 'reject', label: $t({ defaultMessage: 'REJECT' }) }]}
          />
        </Form.Item>
        <ExpirationDateSelector
          inputName={'expiration'}
          label={$t({ defaultMessage: 'List Expiration' })}
        />
      </Col>
      <Col span={24}>
        <Row align='middle'>
          <Col span={10}>
            <Form.Item name='access_policy_set'
              label={$t({ defaultMessage: 'Access Policy Set' })}
              rules={[
                { required: false,
                  message: $t({ defaultMessage: 'Please choose Access Policy Set' }) }
              ]}
              children={<Select placeholder={$t({ defaultMessage: 'Select...' })}/>}/>
          </Col>
          <Col offset={1}>
            <Button type='link'>
              {$t({ defaultMessage: 'Add Access Policy Set' })}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}
