import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal }                                                                                                                    from '@acx-ui/components'
import { useCloneTemplateMutation, useGetConfigTemplateListQuery }                                                                  from '@acx-ui/rc/services'
import { AllowedCloneTemplateTypes, allowedCloneTemplateTypesSet, ConfigTemplate, ConfigTemplateCloneUrlsInfo, ConfigTemplateType } from '@acx-ui/rc/utils'
import { hasAllowedOperations }                                                                                                     from '@acx-ui/user'
import { getOpsApi }                                                                                                                from '@acx-ui/utils'

interface ConfigTemplateCloneModalProps {
  selectedTemplate: ConfigTemplate
  setVisible: (visible: boolean) => void
}

export function ConfigTemplateCloneModal (props: ConfigTemplateCloneModalProps) {
  const { setVisible, selectedTemplate } = props
  const [ saveDisabled, setSaveDisabled ] = useState(true)
  const [ form ] = Form.useForm()
  const { $t } = useIntl()
  const { data: templateList, isLoading: isTemplateListLoading } = useGetConfigTemplateListQuery({
    params: {}, payload: {
      filters: { type: [selectedTemplate.type] },
      fields: ['name'], page: 1, pageSize: 10000
    }
  })
  const [ cloneTemplate ] = useCloneTemplateMutation()

  useEffect(() => {
    if (!templateList) return

    form.validateFields()
  }, [templateList])

  const handleSave = async () => {
    try {
      await cloneTemplate({
        payload: {
          type: selectedTemplate.type as AllowedCloneTemplateTypes,
          templateId: selectedTemplate.id!,
          name: form.getFieldValue('name')
        }
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
    setVisible(false)
  }

  const handleCancel = () => {
    setVisible(false)
  }

  const nameValidator = (value: string) => {
    const isNameExisting = (templateList?.data ?? []).some(t => t.name === value)
    if (isNameExisting) {
      return Promise.reject($t({ defaultMessage: 'The name already exists' }))
    }
    return Promise.resolve()
  }

  const onFieldsChange = () => {
    setSaveDisabled(form.getFieldsError().some(item => item.errors.length > 0))
  }

  return <Modal
    title={$t({ defaultMessage: 'Clone Template' })}
    visible={true}
    mask={true}
    destroyOnClose={true}
    width={400}
    okText={$t({ defaultMessage: 'Save' })}
    okButtonProps={{ disabled: saveDisabled || isTemplateListLoading }}
    onOk={handleSave}
    onCancel={handleCancel}
  >
    <Form form={form} layout='vertical' onFieldsChange={onFieldsChange}>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'Template Name' })}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => nameValidator(value) }
        ]}
        validateFirst
        initialValue={selectedTemplate.name + ' - CLONE'}
        children={<Input/>}
      />
    </Form>
  </Modal>
}

// eslint-disable-next-line max-len
const isAllowedCloneTemplateTypes = (templateType: ConfigTemplateType): templateType is AllowedCloneTemplateTypes => {
  return allowedCloneTemplateTypesSet.has(templateType)
}

export function useCloneConfigTemplate () {
  const [ visible, setVisible ] = useState(false)

  // eslint-disable-next-line max-len
  const canClone = (templateType?: ConfigTemplateType): templateType is AllowedCloneTemplateTypes => {
    if (!templateType || !isAllowedCloneTemplateTypes(templateType)) return false

    return hasAllowedOperations([getOpsApi(ConfigTemplateCloneUrlsInfo[templateType])])
  }

  return {
    canClone,
    visible,
    setVisible
  }
}
