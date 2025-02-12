import { useIntl }                  from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { Button, Drawer }                                                                                                         from '@acx-ui/components'
import { ACCESS_CONTROL_SUB_POLICY_INIT_STATE, AccessControlSubPolicyVisibility, isAccessControlSubPolicy, subPolicyMappingType } from '@acx-ui/rc/components'
import { ConfigTemplate, getConfigTemplateEditPath, PolicyType }                                                                  from '@acx-ui/rc/utils'
import { useTenantLink }                                                                                                          from '@acx-ui/react-router-dom'

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
  const doEdit = useEditTemplate(selectedTemplate, setAccessControlSubPolicyVisible)

  const onClose = () => {
    setVisible(false)
  }

  const onConfigure = () => {
    onClose()
    doEdit()
  }

  return (<Drawer
    title={$t({ defaultMessage: 'Template Details' })}
    visible={true}
    onClose={onClose}
    footer={<div>
      <Button type='primary' onClick={onConfigure}>{$t({ defaultMessage: 'Configure' })}</Button>
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

function useEditTemplate (
  template: ConfigTemplate,
  // eslint-disable-next-line max-len
  setAccessControlSubPolicyVisible: (accessControlSubPolicyVisibility: AccessControlSubPolicyVisibility) => void
) {
  const navigate = useNavigate()
  const mspTenantLink = useTenantLink('', 'v')
  const location = useLocation()

  const doEdit = () => {
    if (isAccessControlSubPolicy(template.type)) {
      setAccessControlSubPolicyVisible({
        ...ACCESS_CONTROL_SUB_POLICY_INIT_STATE,
        [subPolicyMappingType[template.type] as PolicyType]: {
          visible: true, id: template.id
        }
      })
    } else {
      const editPath = getConfigTemplateEditPath(template.type, template.id!)
      navigate(`${mspTenantLink.pathname}/${editPath}`, { state: { from: location } })
    }
  }

  return doEdit
}
