import { useEffect, useState } from 'react'

import { Button, Col, Form, Input, Row, Space, Typography } from 'antd'
import { useIntl }                                          from 'react-intl'

import { Table } from '@acx-ui/components'


export function RadiusServerForm () {
  const { $t } = useIntl()
  const { Paragraph } = Typography
  const [ changePassword, setChangePassword ] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<string>('')
  const [originalPassword, setOriginalPassword] = useState<string>('111111111')

  useEffect(() => {
    setShowPassword(originalPassword)
  }, [originalPassword])

  const useColumns = [
    {
      title: 'address',
      dataIndex: 'address',
      key: 'address'
    }
  ]

  const generatePassword = () => {
    setShowPassword(_uuid())
  }

  const _uuid = () => {
    function s4 () {
      return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }

  return(
    <Row>
      <Col span={10}>
        <Form layout='vertical'>
          <Form.Item label={$t({ defaultMessage: 'RADIUS Host' })}>
            <Paragraph>radius.yourdomain.com (202.467.13.4)</Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Authentication Port' })}>
            <Paragraph>11948</Paragraph>
          </Form.Item>
          <Form.Item label={$t({ defaultMessage: 'Accounting Port' })}>
            <Paragraph>11949</Paragraph>
          </Form.Item>
          <Form.Item
            label={$t({ defaultMessage: 'Shared Secret' })}>
            <Space>
              {/* eslint-disable-next-line max-len */}
              <Input.Password value={showPassword}
                onChange={(e) => {
                  changePassword && setShowPassword(e.target.value)
                }}/>
              { !changePassword ?
                // eslint-disable-next-line max-len
                <Button type='link' onClick={() => setChangePassword(true)}>{$t({ defaultMessage: 'Change' })}</Button>
                : <>
                  {/* eslint-disable-next-line max-len */}
                  <Button type='link' onClick={generatePassword}>{$t({ defaultMessage: 'Generate New Passphrase' })}</Button>
                  {/* eslint-disable-next-line max-len */}
                  <Button type='link'
                    onClick={() => {
                      setOriginalPassword(showPassword)
                      setChangePassword(false)
                    }
                    }>{$t({ defaultMessage: 'Save' })}</Button>
                  {/* eslint-disable-next-line max-len */}
                  <Button type='link'
                    onClick={() => {
                      setShowPassword(originalPassword)
                      setChangePassword(false)}}>
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
                  dataSource={[]}
                  showHeader={false}
                  type='form'
                />
              </Col>
            </Row>
          </Form.Item>
          <Form.Item>
            <Button type='link'>{$t({ defaultMessage: 'Add IP Address' })}</Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}
