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
  // TODO: handleSave implementation
  //const { visible, setVisible, handleSave } = props
  const { visible, setVisible } = props

  const content = <CertificateAuthorityForm />

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add' })}
      visible={visible}
      width={450}
      children={content}
      onClose={handleClose}
      destroyOnClose={true}
    />
  )
}

export default CertificateAuthorityDrawer