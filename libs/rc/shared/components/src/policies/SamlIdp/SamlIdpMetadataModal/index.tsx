import { Button, Form } from 'antd'
import TextArea         from 'antd/lib/input/TextArea'
import { useIntl }      from 'react-intl'

import { cssStr, Modal }          from '@acx-ui/components'
import { SamlIdpProfileFormType } from '@acx-ui/rc/utils'

interface SamlIdpMetadataModalProps {
  samlIdpData: SamlIdpProfileFormType
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const SamlIdpMetadataModal = (props: SamlIdpMetadataModalProps) => {
  const { $t } = useIntl()
  const { samlIdpData, visible, setVisible } = props
  return (

    <Modal
      title={$t({ defaultMessage: 'IdP Metadata' })}
      visible={visible}
      width={800}
      onCancel={() => {
        setVisible(false)
      }}
      footer={
        <Button
          type='primary'
          onClick={() => {
            setVisible(false)
          }}
        >
          {$t({ defaultMessage: 'OK' })}
        </Button>
      }
    >
      <TextArea
        style={{
          width: '100%',
          height: 500,
          marginBottom: '16px',
          backgroundColor: cssStr('--acx-neutrals-10')
        }}
        value={samlIdpData.metadataContent}
        readOnly
      ></TextArea>
      {samlIdpData.metadataUrl&&
        <Form.Item
          label={$t({ defaultMessage: 'Metadata Source URL' })}
          children={
            <span>{samlIdpData.metadataUrl}</span>
          }
        />
      }
    </Modal>
  )
}