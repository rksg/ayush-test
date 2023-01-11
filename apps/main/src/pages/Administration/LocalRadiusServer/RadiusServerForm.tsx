import { useEffect, useState } from 'react'

import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps }              from '@acx-ui/components'
import { useGetRadiusClientConfigQuery, useUpdateRadiusClientConfigMutation } from '@acx-ui/rc/services'
import { ClientConfig }                                                       from '@acx-ui/rc/utils'

import { IpAddressDrawer } from './IpAddressDrawer'

interface clientConfig {
  secret ?: string
  ipAddress ?: string[]
}

export function RadiusServerForm () {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  const [ changePassword, setChangePassword ] = useState<boolean>(false)
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editIpaddress, setEditIpaddress] = useState('')

  const [form] = Form.useForm()

  const queryResult = useGetRadiusClientConfigQuery({})
  const data = queryResult.data
  const [updateConfig, updateConfigState] = useUpdateRadiusClientConfigMutation()

  useEffect(() => {
    if(data) {
      form.setFieldValue('secret', data?.secret)
    }
  }, [data, form])

  const generatePassword = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let password = ''
    for (let i = 0; i <= 9; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length)
      password += chars.substring(randomNumber, randomNumber+1)
    }
    return password
  }

  const onSubmit = async (data: clientConfig) => {
    try {
      const payload = {
        secret: data.secret
      }
      await updateConfig({ payload }).unwrap()
      setChangePassword(false)
    } catch (error){
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const ipTableRowActions: TableProps<{ ipAddress:string }>['rowActions'] = [{
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Edit' }),
    onClick: (selectedRows, clearSelection) => {
      setEditIpaddress(selectedRows[0].ipAddress)
      setVisible(true)
      setIsEditMode(true)
      clearSelection()
    }
  },
  {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: (rows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'IP address' }),
          entityValue: rows[0].ipAddress
        },
        onOk: () => {
          const payload = {
            ipAddress: [...data?.ipAddress ?? []].filter((e) => e !== rows[0].ipAddress)
          }
          updateConfig({ payload }).then(clearSelection)
        }
      })
    }
  }]

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
                      loading={updateConfigState.isLoading}
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
                    columns={[
                      {
                        title: 'ipAddress',
                        dataIndex: 'ipAddress',
                        key: 'ipAddress'
                      }
                    ]}
                    dataSource={data?.ipAddress?.map( e => { return { key: e, ipAddress: e }})}
                    showHeader={false}
                    rowSelection={{ type: 'radio' }}
                    rowActions={ipTableRowActions}
                    type={'form'}
                    actions={[{
                      label: 'Add IP Address',
                      onClick: () => {
                        setVisible(true)
                        setIsEditMode(false)
                      }
                    }]}
                  />
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Col>
        <IpAddressDrawer
          visible={visible}
          setVisible={setVisible}
          editMode={isEditMode}
          clientConfig={data?? {} as ClientConfig}
          editIpAddress={isEditMode ? editIpaddress : ''}
        />
      </Row>
    </Loader>
  )
}
