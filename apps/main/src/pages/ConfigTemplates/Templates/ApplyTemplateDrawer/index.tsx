
import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, Descriptions, Modal } from '@acx-ui/components'
import {
  ConfigTemplateOverrideModal,
  useConfigTemplateOverride,
  CommonConfigTemplateDrawerProps,
  transformOverrideValues,
  overrideDisplayViewMap
} from '@acx-ui/main/components'
import { useApplyRecConfigTemplateMutation } from '@acx-ui/rc/services'


export const ApplyTemplateModal = (props: CommonConfigTemplateDrawerProps) => {
  const targetId = 'MOCKED-TARGET-ID'
  const { $t } = useIntl()
  const { setVisible, selectedTemplate } = props
  const [ applyConfigTemplate, { isLoading: isApplying } ] = useApplyRecConfigTemplateMutation()
  const {
    overrideModalVisible,
    overrideValues,
    setOverrideModalVisible,
    isOverridable,
    createOverrideModalProps
  } = useConfigTemplateOverride(selectedTemplate, [{ id: targetId }])
  const canBeOverriden = isOverridable(selectedTemplate)

  const OverrideView = overrideDisplayViewMap[selectedTemplate.type]
  const overrideValue = overrideValues?.[targetId]

  const onClose = () => {
    setVisible(false)
  }

  const onApply = async () => {
    try {
      await applyConfigTemplate({
        params: { templateId: selectedTemplate.id },
        payload: transformOverrideValues(overrideValue)
      }).unwrap()
      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const onOverride = () => {
    setOverrideModalVisible(true)
  }

  const footer = <div>
    <Button onClick={() => onClose()}>
      {$t({ defaultMessage: 'Cancel' })}
    </Button>
    {canBeOverriden && <Button onClick={onOverride} type='primary'>
      {$t({ defaultMessage: 'Override Template' })}
    </Button>}
    <Button onClick={onApply} type='primary' loading={isApplying}>
      {$t({ defaultMessage: 'Apply' })}
    </Button>
  </div>

  return (
    <>
      <Modal
        title={$t({ defaultMessage: 'Apply Template' })}
        visible={true}
        onCancel={onClose}
        footer={footer}
        destroyOnClose={true}
        width={480}
      >
        <Space direction='vertical' size='small'>
          {/* eslint-disable-next-line max-len */}
          {$t({ defaultMessage: 'Applying this template will create a new configuration instance. Do you want to proceed?' })}
          {OverrideView && overrideValue && <Descriptions layout='vertical'>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Template Override Value' })}
              children={<OverrideView entity={overrideValue} />}
            />
          </Descriptions>}
        </Space>
      </Modal>
      {overrideModalVisible &&
        <ConfigTemplateOverrideModal {...createOverrideModalProps()} />
      }
    </>
  )
}
