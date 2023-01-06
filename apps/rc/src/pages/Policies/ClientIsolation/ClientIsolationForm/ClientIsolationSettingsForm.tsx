import { Col, Form, Input, Row, Space } from 'antd'
import { useIntl }                      from 'react-intl'
import { useParams }                    from 'react-router-dom'

import { useLazyGetClientIsolationListQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  ClientIsolationClient
} from '@acx-ui/rc/utils'

import { ClientIsolationAllowListTable } from './ClientIsolationAllowListTable'
import * as UI                           from './styledComponents'

const MAX_CLIENT_COUNT = 64

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
          <Space direction='vertical' size={2}>
            <UI.TableLabel>
              {$t(
                { defaultMessage: 'Client Entries ({count})' },
                { count: allowlist ? allowlist.length : 0 }
              )}
            </UI.TableLabel>
            <UI.TableSubLabel>
              {$t(
                { defaultMessage: 'Up to {maxClientCount} clients may be added' },
                { maxClientCount: MAX_CLIENT_COUNT }
              )}
            </UI.TableSubLabel>
          </Space>
          <Form.Item
            name='allowlist'
            rules={[
              { required: true }
            ]}
          >
            <ClientIsolationAllowListTable
              allowList={allowlist}
              setAllowList={handleSetAllowList}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  )
}
