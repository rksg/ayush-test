import React, { useState } from 'react'

import {  EyeOutlined, EyeInvisibleOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import { Input, Form, Typography, Tooltip }                           from 'antd'
import { useIntl }                                                    from 'react-intl'
import { useParams }                                                  from 'react-router-dom'
import styled                                                         from 'styled-components/macro'

import { Drawer, Button, showToast }    from '@acx-ui/components'
import {
  useUpdateRecoveryPassphraseMutation
} from '@acx-ui/rc/services'

import { MessageMapping } from '../MessageMapping'

interface ChangePassphraseDrawerProps {
  className?: string,
  data: string,
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const ChangePassphraseDrawer = styled((props: ChangePassphraseDrawerProps) => {
  const { $t } = useIntl()
  const { className, data, visible, setVisible } = props
  const { tenantId } = useParams()
  const [ passphraseVisible, setPassphraseVisible ] = useState(false)
  const [ isChanged, setIsChanged ] = useState(false)
  const [ isValid, setIsValid ] = useState(false)
  const [ passphrase, setPassphrase ] = useState('')
  const [ form ] = Form.useForm()

  const [updateRecoveryPassphrase, { isLoading: isUpdatingRecoveryPassphrase }]
    = useUpdateRecoveryPassphraseMutation()

  const onClose = () => {
    setVisible(false)
  }

  const handlePassphraseVisible = () => {
    setPassphraseVisible(!passphraseVisible)
  }

  const onSubmitChange = async () => {
    if (!passphrase) return


    updateRecoveryPassphrase({
      params: { tenantId },
      payload: { psk: passphrase.split(' ').join('') }
    }).then(() => {
      setVisible(false)
    }).catch(() => {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    })

  }

  const handleChange = (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target?.value.trim()
    const newData = passphrase.split(' ').fill(newVal, idx, idx+1).join(' ')
    setPassphrase(newData)
    setIsChanged(true)

    form.validateFields().then(() => {
      setIsValid(true)
    }).catch(() => {
      setIsValid(false)
    })
  }

  React.useEffect(() => {
    setPassphrase(data)
  }, [data])

  const PassphraseIcon = passphraseVisible ? EyeOutlined : EyeInvisibleOutlined
  const passphraseData = passphrase.split(' ')

  return (
    <Drawer
      className={className}
      title={$t({ defaultMessage: 'Change Recovery Network Passphrase' })}
      visible={visible}
      onClose={onClose}
      width='550px'
      destroyOnClose={true}
      footer={
        <div>
          <Button
            disabled={!isChanged || !isValid}
            loading={isUpdatingRecoveryPassphrase}
            onClick={onSubmitChange}
            type={'secondary'}
          >
            {$t({ defaultMessage: 'Change' })}
          </Button>
          <Button onClick={onClose}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        labelAlign='left'
        fields={
          passphraseData.map(
            (item, idx) => ({ name: `recovery_pass_${idx}`, value: item })
          )}
      >
        <Form.Item
          label={$t({ defaultMessage: 'Recovery Network Passphrase' })}
        >
          <div className='inputsWrapper'>
            {passphraseData.map(
              (item:string, idx: number) => {
                return (
                  <Form.Item
                    key={`recovery_pass_${idx}`}
                    name={`recovery_pass_${idx}`}
                    noStyle
                    hasFeedback
                    rules={[
                      { required: true, message: $t({ defaultMessage: 'This field is required' }) },
                      { len: 4,
                      // eslint-disable-next-line max-len
                        message: $t({ defaultMessage: 'Passphrase part must be exactly 4 digits long' }) }
                    ]}
                    validateFirst
                  >
                    <Input
                      data-testid={`recovery_pass_${idx}`}
                      type={passphraseVisible ? 'text' : 'password'}
                      onChange={handleChange(idx)}
                    />
                  </Form.Item>)
              }
            )}
            <PassphraseIcon className='ant-input-password-icon' onClick={handlePassphraseVisible} />
            <Tooltip placement='topRight' title={$t({ defaultMessage: 'Must be 16 digits long' })}>
              <QuestionCircleOutlined />
            </Tooltip>
          </div>
        </Form.Item>

        <Typography.Paragraph className='greyText'>
          {$t(MessageMapping.change_recovery_passphrase_description)}
        </Typography.Paragraph>
      </Form>
    </Drawer>
  )
})`
  .ant-drawer-footer {
    justfy-content: flex-start;
    & > div {
      display: flex;
      flex-direction: revert;
    }
    & > div > .ant-btn + .ant-btn {
      margin: 0;
      margin-right: 12px;
    }
  }

  .ant-drawer-body .ant-form-item-control .ant-form-item-explain-error:not(:first-child) {
    display: none;
  }

  .inputsWrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;

    & input {
      width: 55px;
    }
  }

  .greyText {
    color: var(--acx-neutrals-50);
  }

  & span[role="img"].anticon {
    color: var(--acx-accents-blue-50);
  }
`