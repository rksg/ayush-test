import React, { ReactNode, useState } from 'react'

import {  EyeOutlined, EyeInvisibleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Input, Form, Tooltip, Row, Col }                             from 'antd'
import styled                                                         from 'styled-components/macro'

import * as UI from './styledComponents'

import type { FormItemProps } from 'antd'

interface MultiPartyPasswordProps extends Pick<FormItemProps, 'rules'>{
  className?: string;
  data: string[];
  label: string;
  tooltip?: string;
  onChange?: (idx: number, passphrase: string[]) => void;
  onValidated?: (isValid: boolean) => void;
  children?: ReactNode;
}

export const MultiPartyPassword = styled((props: MultiPartyPasswordProps) => {
  const { className, data, label, tooltip, rules, onChange, onValidated } = props
  const [ form ] = Form.useForm()
  const [ passphraseVisible, setPassphraseVisible ] = useState(false)

  const handlePassphraseVisible = () => {
    setPassphraseVisible(!passphraseVisible)
  }

  const handleChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target?.value.trim()
    const newData:string[] = [...data]
    newData[idx] = newVal

    if (onChange)
      onChange(idx, newData)

    form.validateFields().then(() => {
      if (onValidated)
        onValidated(true)
    }).catch(() => {
      if (onValidated)
        onValidated(false)
    })
  }

  const PassphraseIcon = passphraseVisible ? EyeInvisibleOutlined: EyeOutlined

  return (
    <Form
      className={className}
      form={form}
      labelAlign='left'
      fields={
        data.map(
          (item, idx) => ({ name: `pwdg_${idx}`, value: item })
        )}
    >
      <Form.Item
        label={label}
      >
        <Row justify='space-between' gutter={[8, 0]}>
          {data.map((item:string, idx: number) => {
            return (
              <Col span={5} key={`pwdg_${idx}`}>
                <Form.Item
                  name={`pwdg_${idx}`}
                  noStyle
                  hasFeedback
                  validateFirst
                  rules={rules}
                >
                  <Input
                    data-testid={`pwdg_${idx}`}
                    type={passphraseVisible ? 'text' : 'password'}
                    onChange={handleChange(idx)}
                  />
                </Form.Item>
              </Col>)
          })}

          <Col span={4} className='passwordGroupEndIcons'>
            <PassphraseIcon
              className='ant-input-password-icon'
              onClick={handlePassphraseVisible}
            />

            { tooltip &&
              <Tooltip
                placement='topRight'
                title={tooltip}
              >
                <QuestionCircleOutlined />
              </Tooltip>
            }
          </Col>
        </Row>
      </Form.Item>

      {props.children}
    </Form>
  )
})`${UI.passwordsGroupStyles}`