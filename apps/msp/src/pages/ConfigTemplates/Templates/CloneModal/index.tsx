import { useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Modal }                                                                                                             from '@acx-ui/components'
import { useCloneTemplateMutation, useGetConfigTemplateListQuery }                                                           from '@acx-ui/rc/services'
import { AllowedCloneTemplateTypes, allowedCloneTemplateTypesSet, checkObjectNotExists, ConfigTemplate, ConfigTemplateType } from '@acx-ui/rc/utils'

interface ConfigTemplateCloneModalProps {
  selectedTemplate: ConfigTemplate
  setVisible: (visible: boolean) => void
}

export function ConfigTemplateCloneModal (props: ConfigTemplateCloneModalProps) {
  const { setVisible, selectedTemplate } = props
  const [ saveDisabled, setSaveDisabled ] = useState(true)
  const [ form ] = Form.useForm()
  const { $t } = useIntl()
  const { canClone } = useCloneConfigTemplate()
  const { data: templateList, isLoading } = useGetConfigTemplateListQuery({
    params: {}, payload: { fields: ['name'], page: 1, pageSize: 10000 }
  })
  const [ cloneTemplate ] = useCloneTemplateMutation()

  useEffect(() => {
    if (!templateList) return

    form.validateFields()
  }, [templateList])

  const handleSave = async () => {
    if (!canClone(selectedTemplate.type)) return

    try {
      await cloneTemplate({
        payload: {
          type: selectedTemplate.type,
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
    const list = (templateList?.data ?? []).map(n => ({ name: n.name }))
    return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'Template' }))
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
    okButtonProps={{ disabled: saveDisabled || isLoading }}
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
        hasFeedback
        initialValue={selectedTemplate.name + ' - CLONE'}
        children={<Input/>}
      />
    </Form>
  </Modal>
}

export function useCloneConfigTemplate () {
  const [ visible, setVisible ] = useState(false)

  // eslint-disable-next-line max-len
  const canClone = (templateType?: ConfigTemplateType): templateType is AllowedCloneTemplateTypes => {
    if (!templateType) return false
    return allowedCloneTemplateTypesSet.has(templateType)
  }

  return {
    canClone,
    visible,
    setVisible
  }
}
