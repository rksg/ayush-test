import { Col, Form, Row, Typography } from 'antd'
import { useIntl }                    from 'react-intl'

import { Button, showActionModal } from '@acx-ui/components'
import { SpaceWrapper }            from '@acx-ui/rc/components'
import { useDeleteTenantMutation } from '@acx-ui/rc/services'
import { userLogout, useTenantId } from '@acx-ui/utils'

import { MessageMapping } from '../MessageMapping'

import * as UI from './styledComponents'

const DeleteAccountFormItem = () => {
  const { $t } = useIntl()
  const params = { tenantId: useTenantId() }

  const [deleteTenant]
  = useDeleteTenantMutation()

  const showDeleteActionModal = () => {
    const title = $t({ defaultMessage: 'Delete Account' })
    showActionModal({
      type: 'confirm',
      title: title,
      customContent: {
        action: 'DELETE',
        entityName: $t({ defaultMessage: 'account' }),
        entityValue: $t({ defaultMessage: 'Account Name' }),
        extraContent: $t(MessageMapping.delete_account_modal_msg, { space: <span> </span> }),
        confirmationText: $t({ defaultMessage: 'Delete' })
      },
      okText: $t({ defaultMessage: 'Delete Customer' }),
      onOk: async () => {
        try {
          await deleteTenant({ params }).unwrap()
        } catch (error) {
          console.log(error) // eslint-disable-line no-console
        }
        userLogout()
      }
    })
  }

  return ( <Row gutter={24}>
    <Col span={24}>
      <UI.LabelWrapper>
        <Form.Item
          colon={false}
          label={<>
            {$t({ defaultMessage: 'Delete Account' })}
          </>}/>
      </UI.LabelWrapper>
      <Typography.Paragraph>
        {$t(MessageMapping.delete_account_description_1, { br: <br/> })}
      </Typography.Paragraph>
      <SpaceWrapper full className='indent' justifycontent='flex-start' style={{ height: 'auto' }}>
        <Typography.Paragraph>
          {$t(MessageMapping.delete_account_description_2, { br: <br/> })}
        </Typography.Paragraph>
      </SpaceWrapper>
      <UI.DeleteButtonWrapper>
        <Button onClick={showDeleteActionModal}>{$t({ defaultMessage: 'Delete Account' })}</Button>
      </UI.DeleteButtonWrapper>
    </Col>
  </Row>)
}
export { DeleteAccountFormItem }
