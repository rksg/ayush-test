import { Input, Space, Typography } from 'antd'
import { useIntl }                  from 'react-intl'
import styled                       from 'styled-components'

import { Drawer } from '@acx-ui/components'

import * as UI from './styledComponents'

interface RecoveryCodeDrawerProps {
  className?: string;
  visible: boolean
  setVisible: (visible: boolean) => void
  recoveryCode: string[]
}

export const RecoveryCodes = styled((props: RecoveryCodeDrawerProps) => {
  const { $t } = useIntl()

  const { className, visible, setVisible, recoveryCode } = props
  const linebreakRecoveryCode = recoveryCode.join('\n')

  const onClose = () => {
    setVisible(false)
  }

  const handleClickCopyCodes = () => {
    navigator.clipboard.writeText(linebreakRecoveryCode)
  }

  return (
    <Drawer
      className={className}
      title={$t({ defaultMessage: 'Recovery Codes' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose
      width={336}
    >
      <Space direction='vertical' style={{ width: '100%' }}>
        <Typography.Text>
          { $t({ defaultMessage: 'These codes can be used to access your account if you have ' +
        'trouble receiving the security code on phone. Make sure you copy them and store them ' +
        'in a safe place.' }) }
        </Typography.Text>
        <Input.TextArea
          value={linebreakRecoveryCode}
          style={{
            fontSize: '12px',
            resize: 'none',
            marginTop: '15px',
            height: '104px',
            borderRadius: '4px'
          }}
          autoSize={false}
          readOnly={true}
        />
        <Typography.Link
          style={{ float: 'right' }}
          onClick={handleClickCopyCodes}
          copyable={{
            text: linebreakRecoveryCode
          }}>
          {$t({ defaultMessage: 'Copy Codes' })}
        </Typography.Link>
      </Space>
    </Drawer>
  )
})`${UI.RecoveryCodesDrawerStyle}`
