import { useEffect, useState } from 'react'

import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { showToast, Table }                                                   from '@acx-ui/components'
import { useGetRadiusClientConfigQuery, useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'

import { IpAddressDrawer } from './IpAddressDrawer'


export function RadiusServerForm () {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  const [ changePassword, setChangePassword ] = useState<boolean>(false)
  const [visible, setVisible] = useState(false)

  const [form] = Form.useForm()

  const data = useGetRadiusClientConfigQuery({}).data
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
    form.setFieldValue('secret', _uuid())
  }

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        secret: data.secret
      }
      await updateConfig(
        {
          payload
        }).unwrap()
      setChangePassword(false)
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const _uuid = () => {
    function s4 () {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }

  // @ts-ignore
  return(
    <Row>
      <Col span={10}>
        <Form layout='vertical' onFinish={onSubmit} form={form}>
          <Form.Item label={$t({ defaultMessage: 'RADIUS Host' })}>
            <Paragraph>radius.yourdomain.com (202.467.13.4)</Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Authentication Port' })}>
            <Paragraph>11948</Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Accounting Port' })}>
            <Paragraph>11949</Paragraph>
          </Form.Item>
          <Space>
            <Form.Item
              label={$t({ defaultMessage: 'Shared Secret' })}
              name='secret'
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter secret' }) }
              ]}
              children={<Input.Password
                readOnly={!changePassword}
                bordered={changePassword}
              />}
            />
            { !changePassword ?
            // eslint-disable-next-line max-len
              <Button type='link' onClick={() => setChangePassword(true)}>{$t({ defaultMessage: 'Change' })}</Button>
              : <>
                {/* eslint-disable-next-line max-len */}
                <Button type='link' onClick={generatePassword}>{$t({ defaultMessage: 'Generate New Passphrase' })}</Button>
                {/* eslint-disable-next-line max-len */}
                <Button type='link'
                  htmlType='submit'>{$t({ defaultMessage: 'Save' })}</Button>
                {/* eslint-disable-next-line max-len */}
                <Button type='link'
                  onClick={() => {
                    form.setFieldValue('secret', data?.secret)
                    setChangePassword(false)
                  }}>
                  {$t({ defaultMessage: 'Cancel' })}</Button>
              </>
            }
          </Space>
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
      />
    </Row>
  )
}
