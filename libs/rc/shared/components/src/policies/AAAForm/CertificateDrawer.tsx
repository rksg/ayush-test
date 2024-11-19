import { useIntl } from 'react-intl'

import { Drawer }            from '@acx-ui/components'
import { ExtendedKeyUsages } from '@acx-ui/rc/utils'

import { ServerClientCertificateForm } from '../CertificateTemplate'

interface CertificateDrawerProps {
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleSave: (id?: string) => void
    extendedKeyUsages?: ExtendedKeyUsages[]
}

const CertificateDrawer = (props: CertificateDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  const content = <ServerClientCertificateForm
    modalMode={true}
    modalCallBack={handleSave}
    extendedKeyUsages={props?.extendedKeyUsages}/>

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Generate Certificate' })}
      visible={visible}
      width={500}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default CertificateDrawer