import { Form, Typography } from 'antd'
import TextArea             from 'antd/lib/input/TextArea'
import { useIntl }          from 'react-intl'
import styled               from 'styled-components'

import { Drawer }       from '@acx-ui/components'
import { SpaceWrapper } from '@acx-ui/rc/components'

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
  const [form] = Form.useForm()
  const linebreakRecoveryCode = recoveryCode.join('\n')

  const onClose = () => {
    setVisible(false)
    form.resetFields()
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
      <SpaceWrapper
        full
        direction='vertical'
        justifycontent='flex-start'
      >
        <Typography.Text>
          { $t({ defaultMessage: 'These codes can be used to access your account if you have ' +
      'trouble receiving the security code on phone. Make sure you copy them and store them ' +
      'in a safe place.' }) }
        </Typography.Text>
        <TextArea
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
        <SpaceWrapper full justifycontent='flex-end'>
          <Typography.Link
            onClick={handleClickCopyCodes}
            copyable={{
              text: linebreakRecoveryCode
            }}>
            {$t({ defaultMessage: 'Copy Codes' })}
          </Typography.Link>
        </SpaceWrapper>
      </SpaceWrapper>
    </Drawer>
  )
})`${UI.RecoveryCodesDrawerStyle}`