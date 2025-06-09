import { useIntl } from 'react-intl'

import { Modal, ModalType }   from '@acx-ui/components'
import { ConfigTemplateType } from '@acx-ui/rc/utils'

import { getConfigTemplateTypeLabel } from '../Templates/templateUtils'

import { overrideComponentMap } from './contentsMap'
import { OverrideEntitiyType }  from './types'

export { overrideDisplayViewMap } from './contentsMap'
export {
  OverrideValuesPerMspEcType, transformOverrideValues, useConfigTemplateOverride
} from './utils'

export interface ConfigTemplateOverrideModalProps {
  templateId: string
  templateType: ConfigTemplateType
  existingOverrideValues?: OverrideEntitiyType
  onCancel: () => void
  updateOverrideValue: (values: OverrideEntitiyType) => void
}

export function ConfigTemplateOverrideModal (props: ConfigTemplateOverrideModalProps) {
  const { templateType, ...rest } = props
  const { $t } = useIntl()

  const Content = overrideComponentMap[templateType]

  if (!Content) return null

  return <Modal
    title={
      $t(
        { defaultMessage: 'Override {templateType} Template' },
        { templateType: getConfigTemplateTypeLabel(templateType) }
      )
    }
    visible={true}
    type={ModalType.ModalStepsForm}
    mask={true}
    width={700}
    children={<Content {...rest} />}
    destroyOnClose={true}
  />
}
