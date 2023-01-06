import { Col, Form, Input, Row } from 'antd'
import { useIntl }               from 'react-intl'
import { useParams }             from 'react-router-dom'

import { useLazyGetClientIsolationListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  ClientIsolationClient
} from '@acx-ui/rc/utils'

import { ClientIsolationClientsTable } from './ClientIsolationAllowListTable'

export default function ClientIsolationSettingsForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const params = useParams()
  const allowlist = Form.useWatch('allowlist')
  const id = Form.useWatch<string>('id', form)
  const [ clientIsolationList ] = useLazyGetClientIsolationListQuery()

  const nameValidator = async (value: string) => {
    const list = (await clientIsolationList({ params }).unwrap())
      .filter(clientIsolation => clientIsolation.id !== id)
      .map(clientIsolation => ({ name: clientIsolation.name }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Client Isolation Policy' }))
  }

  const handleSetAllowList = (allowlist: ClientIsolationClient[]) => {
    form.setFieldValue('allowlist', allowlist)
  }

  return (
    <>
      <Row gutter={20}>
        <Col span={8}>
          <Form.Item name='id' noStyle>
            <Input type='hidden' />
          </Form.Item>
          <Form.Item
            name='name'
            label={$t({ defaultMessage: 'Policy Name' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => nameValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          <Form.Item
            name='description'
            label={$t({ defaultMessage: 'Description' })}
            rules={[
              { max: 64 }
            ]}
            children={<Input.TextArea rows={2} maxLength={64} />}
          />
        </Col>
      </Row>
      <Row gutter={20}>
        <Col span={10}>
          <Form.Item
            name='allowlist'
            label={$t(
              { defaultMessage: 'Client Entries ({count})' },
              { count: allowlist ? allowlist.length : 0 }
            )}
            rules={[
              { required: true }
            ]}
          >
            <ClientIsolationClientsTable
              allowList={allowlist}
              setAllowList={handleSetAllowList}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
