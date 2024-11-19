import { useIntl } from 'react-intl'

import { Drawer } from '@acx-ui/components'

import { CertificateAuthorityForm } from '../CertificateTemplate'

interface CertificateAuthorityDrawerProps {
    visible: boolean,
    setVisible: (v: boolean) => void,
    handleSave: (id?: string) => void
}

const CertificateAuthorityDrawer = (props: CertificateAuthorityDrawerProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, handleSave } = props

  const content = <CertificateAuthorityForm modalMode={true} modalCallBack={handleSave}/>

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Certificate Authority' })}
      visible={visible}
      width={500}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default CertificateAuthorityDrawer