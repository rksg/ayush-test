import { useEffect, useState } from 'react'

import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { Loader, showActionModal, showToast, Table, TableProps, PasswordInput } from '@acx-ui/components'
import {
  useGetRadiusClientConfigQuery,
  useGetRadiusServerSettingQuery,
  useUpdateRadiusClientConfigMutation
} from '@acx-ui/rc/services'
import { ClientConfig }              from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import { IpAddressDrawer } from './IpAddressDrawer'

export function RadiusServerForm () {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  const [ changePassword, setChangePassword ] = useState<boolean>(false)
  const [visible, setVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editIpaddress, setEditIpaddress] = useState('')

  const [form] = Form.useForm()

  // eslint-disable-next-line max-len
  const { data: queryResultData, isLoading: queryResultDataLoading } = useGetRadiusClientConfigQuery({})
  // eslint-disable-next-line max-len
  const { data: serverSettingData, isLoading: queryServerSettingDataLoading } = useGetRadiusServerSettingQuery({})
  const [updateConfig, updateConfigState] = useUpdateRadiusClientConfigMutation()
  const [ isChanged, setIsChanged ] = useState(false)

  useEffect(() => {
    if(queryResultData) {
      form.setFieldValue('secret', queryResultData?.secret)
    }
  }, [queryResultData, form])

  const generatePassword = () => {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let password = ''
    for (let i = 0; i <= 9; i++) {
      let randomNumber = Math.floor(Math.random() * chars.length)
      password += chars.substring(randomNumber, randomNumber+1)
    }
    return password
  }

  const onSubmit = async (data: ClientConfig) => {
    try {
      const payload = {
        secret: data.secret
      }
      await updateConfig({ payload }).unwrap()
      setChangePassword(false)
      setIsChanged(false)

      showToast({
        type: 'success',
        content: $t(
          { defaultMessage: 'Shared Secret was changed' }
        )
      })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
    onClick: ([{ ipAddress }], clearSelection) => {
      showActionModal({
        type: 'confirm',
        customContent: {
          action: 'DELETE',
          entityName: $t({ defaultMessage: 'IP address' }),
          entityValue: ipAddress
        },
        onOk: () => {
          const payload = {
            ipAddress: [...queryResultData?.ipAddress ?? []].filter((e) => e !== ipAddress)
          }
          updateConfig({ payload }).unwrap()
            .then(() => {
              showToast({
                type: 'success',
                content: $t(
                  // eslint-disable-next-line max-len
                  { defaultMessage: 'IP Address {ipAddress} was deleted' },
                  { ipAddress }
                )
              })
              clearSelection()
            }).catch((error) => {
              showToast({
                type: 'error',
                content: error.data.message
              })
            })
        }
      })
    }
  }]

  return(
    <Loader states={[{
      isLoading: queryResultDataLoading || queryServerSettingDataLoading,
      isFetching: updateConfigState.isLoading
    }]}>
      <Row>
        <Col span={10}>
          <Form layout='vertical' onFinish={onSubmit} form={form}>
            <Form.Item label={$t({ defaultMessage: 'RADIUS Host' })}>
              <Paragraph>{serverSettingData?.host}</Paragraph>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Authentication Port' })}>
              <Paragraph>{serverSettingData?.authenticationPort.toString()}</Paragraph>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Accounting Port' })}>
              <Paragraph>{serverSettingData?.accountingPort.toString()}</Paragraph>
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
                      <PasswordInput
                        readOnly={true}
                        bordered={false} />
                      :
                      <Input onChange={() => setIsChanged(true)}/>}
                </Form.Item>
                { !changePassword ?
                  <Button type='link'
                    onClick={() => setChangePassword(true)}>
                    {$t({ defaultMessage: 'Change' })}</Button>
                  : <>
                    <Button type='link'
                      onClick={() => {
                        form.setFieldValue('secret', generatePassword())
                        setIsChanged(true)
                      }}>
                      {$t({ defaultMessage: 'Generate New Passphrase' })}</Button>
                    <Button type='link'
                      disabled={!isChanged}
                      htmlType='submit'>{
                        $t({ defaultMessage: 'Save' })}</Button>
                    <Button type='link'
                      loading={updateConfigState.isLoading}
                      onClick={() => {
                        form.setFieldValue('secret', queryResultData?.secret)
                        setChangePassword(false)
                        setIsChanged(false)
                      }}>
                      {$t({ defaultMessage: 'Cancel' })}</Button>
                  </>
                }
              </Space>
            </Form.Item>
            <Form.Item label={$t({ defaultMessage: 'Incoming IP Address(es)' })}>
              <Table
                columns={[
                  {
                    title: 'ipAddress',
                    dataIndex: 'ipAddress',
                    key: 'ipAddress'
                  }
                ]}
                // eslint-disable-next-line max-len
                dataSource={queryResultData?.ipAddress?.map( e => { return { key: e, ipAddress: e }})}
                showHeader={false}
                rowSelection={hasAccess() && { type: 'radio' }}
                rowActions={filterByAccess(ipTableRowActions)}
                type={'form'}
                actions={filterByAccess([{
                  label: $t({ defaultMessage: 'Add IP Address' }),
                  onClick: () => {
                    setVisible(true)
                    setIsEditMode(false)
                  }
                }])}
              />
            </Form.Item>
          </Form>
        </Col>
        <IpAddressDrawer
          visible={visible}
          setVisible={setVisible}
          editMode={isEditMode}
          clientConfig={queryResultData?? {} as ClientConfig}
          editIpAddress={isEditMode ? editIpaddress : ''}
        />
      </Row>
    </Loader>
  )
}
