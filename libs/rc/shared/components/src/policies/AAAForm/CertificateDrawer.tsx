import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { WifiOperatorForm } from '../WifiOperator'

interface CertificateDrawerProps {
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleSave: (id?: string) => void
    // fixedServerCert?: boolean
}

const CertificateDrawer = (props: CertificateDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  // TODO waiting CertificateForm dev done to replacing
  const content = <WifiOperatorForm modalMode={true} editMode={false} modalCallBack={handleSave} />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Generate Certificate' })}
      visible={visible}
      width={450}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default CertificateDrawer