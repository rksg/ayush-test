import { useIntl } from 'react-intl'

import { Drawer }                       from '@acx-ui/components'
import { ExtendedKeyUsages, KeyUsages } from '@acx-ui/rc/utils'

import { ServerClientCertificateForm } from '../CertificateTemplate/ServerClientCertificateForm'

interface CertificateDrawerProps {
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleSave: (id?: string) => void
    width?: number
    keyUsages?: KeyUsages[]
    extendedKeyUsages?: ExtendedKeyUsages[]
}

const CertificateDrawer = (props: CertificateDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave, width=500, keyUsages, extendedKeyUsages } = props

  const content = <ServerClientCertificateForm
    modalMode={true}
    modalCallBack={handleSave}
    keyUsages={keyUsages}
    extendedKeyUsages={extendedKeyUsages}
  />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Generate Certificate' })}
      visible={visible}
      width={width}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default CertificateDrawer