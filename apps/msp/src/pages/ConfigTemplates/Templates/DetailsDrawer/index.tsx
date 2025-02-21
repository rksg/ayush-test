import { useIntl } from 'react-intl'

import { Button, Drawer }                                             from '@acx-ui/components'
import { Features }                                                   from '@acx-ui/feature-toggle'
import { AccessControlSubPolicyVisibility, withTemplateFeatureGuard } from '@acx-ui/rc/components'
import { ConfigTemplate }                                             from '@acx-ui/rc/utils'

import { DetailsContent } from './DetailsContent'

interface DetailsDrawerProps {
  setVisible: (visible: boolean) => void
  selectedTemplate: ConfigTemplate
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
}

export function DetailsDrawer (props: DetailsDrawerProps) {
  const { setVisible, selectedTemplate, setAccessControlSubPolicyVisible } = props
  const { $t } = useIntl()

  const onClose = () => {
    setVisible(false)
  }

  return (<Drawer
    title={$t({ defaultMessage: 'Template Details' })}
    visible={true}
    onClose={onClose}
    footer={<div>
      <Button onClick={onClose}>{$t({ defaultMessage: 'Close' })}</Button>
    </div>}
    destroyOnClose={true}
    width={500}
  >
    <DetailsContent
      template={selectedTemplate}
      setAccessControlSubPolicyVisible={setAccessControlSubPolicyVisible}
    />
  </Drawer>)
}

export const ProtectedDetailsDrawer = withTemplateFeatureGuard({
  WrappedComponent: DetailsDrawer,
  featureId: Features.CONFIG_TEMPLATE_NAME_DRAWER
})
