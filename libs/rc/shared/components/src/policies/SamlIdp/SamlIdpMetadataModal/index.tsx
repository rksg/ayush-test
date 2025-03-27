import { Modal, Button } from 'antd'
import TextArea          from 'antd/lib/input/TextArea'
import { useIntl }       from 'react-intl'

interface SamlIdpMetadataModalProps {
    metadata: string
    visible: boolean
    setVisible: (visible: boolean) => void
}

export const SamlIdpMetadataModal = (props: SamlIdpMetadataModalProps) => {
  const { $t } = useIntl()
  const { metadata, visible, setVisible } = props
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
        style={{ width: '100%', height: 500 }}
        value={metadata}
        readOnly
      ></TextArea>
    </Modal>
  )
}