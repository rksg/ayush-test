import { useEffect, useState } from 'react'

import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { Loader, showToast, Table }                                           from '@acx-ui/components'
import { useGetRadiusClientConfigQuery, useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig }                                                       from '@acx-ui/rc/utils'

import { IpAddressDrawer } from './IpAddressDrawer'

export function RadiusServerForm () {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  const [ changePassword, setChangePassword ] = useState<boolean>(false)
  const [visible, setVisible] = useState(false)

  const [form] = Form.useForm()

  const queryResult = useGetRadiusClientConfigQuery({})
  const data = queryResult.data
  const [updateConfig] = useUpdateRadiusClientConfigMutation()

  useEffect(() => {
    if(data) {
      form.setFieldValue('secret', data?.secret)
    }
  }, [data, form])

  const useColumns = [
    {
      title: 'ipAddress',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    }
  ]

  const generatePassword = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let password = ''
    for (let i = 0; i <= 9; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length)
      password += chars.substring(randomNumber, randomNumber +1)
    }
    return password
  }

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        secret: data.secret
      }
      await updateConfig({ payload }).unwrap()
      setChangePassword(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return(
    <Loader states={[queryResult]}>
      <Row>
        <Col span={10}>
          <Form layout='vertical' onFinish={onSubmit} form={form}>
            <Form.Item label={$t({ defaultMessage: 'RADIUS Host' })}>
              <Paragraph>radius.yourdomain.com (202.202.13.4)</Paragraph>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Authentication Port' })}>
              <Paragraph>11948</Paragraph>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Accounting Port' })}>
              <Paragraph>11949</Paragraph>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Shared Secret' })}>
              <Space>
                <Form.Item name='secret'
                  noStyle
                  rules={[
                    { required: true, message: $t({ defaultMessage: 'Please enter secret' }) }
                  ]}>
                  {
                    !changePassword ?
                      <Input.Password
                        readOnly={true}
                        bordered={false} />
                      :
                      <Input />}
                </Form.Item>
                { !changePassword ?
                  <Button type='link'
                    onClick={() => setChangePassword(true)}>
                    {$t({ defaultMessage: 'Change' })}</Button>
                  : <>
                    <Button type='link'
                      onClick={() => {
                        form.setFieldValue('secret', generatePassword())
                      }}>
                      {$t({ defaultMessage: 'Generate New Passphrase' })}</Button>
                    <Button type='link'
                      htmlType='submit'>{
                        $t({ defaultMessage: 'Save' })}</Button>
                    <Button type='link'
                      onClick={() => {
                        form.setFieldValue('secret', data?.secret)
                        setChangePassword(false)
                      }}>
                      {$t({ defaultMessage: 'Cancel' })}</Button>
                  </>
                }
              </Space>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Incoming IP Address(es)' })}>
              <Row>
                <Col span={10}>
                  <Table
                    columns={useColumns}
                    dataSource={data?.ipAddress?.map( e => { return { key: e, ipAddress: e }})}
                    showHeader={false}
                    type='form'
                  />
                </Col>
              </Row>
            </Form.Item>
            <Form.Item>
              <Button type='link' onClick={() => setVisible(true)}>
                {$t({ defaultMessage: 'Add IP Address' })}</Button>
            </Form.Item>
          </Form>
        </Col>
        <IpAddressDrawer
          visible={visible}
          setVisible={setVisible}
          editMode={false}
          clientConfig={data?? {} as ClientConfig}
        />
      </Row>
    </Loader>
  )
}
