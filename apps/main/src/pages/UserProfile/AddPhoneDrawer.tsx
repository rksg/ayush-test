import { useState } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { Button, Drawer }                            from '@acx-ui/components'
import { PhoneInput }                                from '@acx-ui/rc/components'
import { generalPhoneRegExp }                        from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'
import { UserProfile, useUpdateUserProfileMutation } from '@acx-ui/user'

interface AddPhoneDrawerProps {
    profile?: UserProfile
    visible: boolean
    setVisible: (visible: boolean) => void
}

const AddPhoneDrawer = (props: AddPhoneDrawerProps) => {
  const { profile, visible, setVisible } = props
  const { $t } = useIntl()
  const { tenantId } = useParams()

  const [form] = Form.useForm()
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const [isValid, setIsValid] = useState(profile?.phoneNumber ? true : false)

  const setPhoneValue = (phoneNumber: string) => {
    form.setFieldValue('phoneNumber', phoneNumber)
    form.validateFields(['phoneNumber'])
      .then(() => setIsValid(true))
      .catch(() => setIsValid(false))
  }

  const handleSubmit = async () => {
    try {
      await form.validateFields(['phoneNumber'])
      const payload = { ...profile, phoneNumber: form.getFieldValue('phoneNumber') }
      await updateUserProfile({ payload: payload, params: { tenantId } })
      setVisible(false)
    }
    catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return <Drawer
    width={430}
    title={profile?.phoneNumber
      ? $t({ defaultMessage: 'Edit Phone Number' })
      : $t({ defaultMessage: 'Add Phone Number' })}
    visible={visible}
    onClose={() => setVisible(false)}
    footer={
      <div>
        <Button
          disabled={!isValid}
          onClick={handleSubmit}
          type='primary'
        >
          {profile?.phoneNumber ? $t({ defaultMessage: 'Save' })
            : $t({ defaultMessage: 'Add' }) }
        </Button>
        <Button onClick={() => setVisible(false)}>
          {$t({ defaultMessage: 'Cancel' })}
        </Button>
      </div>
    }>
    <Form
      form={form}
      layout='vertical'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Mobile Phone' })}
      >
        <Row align='middle' justify='space-between'>
          <Col span={18}>
            <Form.Item
              name='phoneNumber'
              label={$t({ defaultMessage: 'Mobile Phone' })}
              rules={[
                { required: true },
                { validator: (_, value) => generalPhoneRegExp(value) }
              ]}
              noStyle
              initialValue={profile?.phoneNumber}
              validateFirst
            >
              <PhoneInput name={'phoneNumber'} callback={setPhoneValue} onTop={true} />
            </Form.Item>
          </Col>
        </Row>
      </Form.Item>
    </Form>
  </Drawer>
}

export default AddPhoneDrawer