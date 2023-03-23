import { useEffect, useState } from 'react'

import { Form, Select, FormItemProps, Spin, Button, Row, Col } from 'antd'
import _                                     from 'lodash'
import { useIntl }                           from 'react-intl'

import { useGetTemplateSelectionContentQuery } from '@acx-ui/rc/services'

import { templateNames, templateScopeLabels } from './MsgTemplateLocalizedMessages'
import { Loader, Modal } from '@acx-ui/components'
import { Template } from '@acx-ui/rc/utils'
import { TemplatePreview } from './TemplatePreview'

export interface TemplateSelectorProps {
  formItemProps?: FormItemProps,
  placeholder?: string,
  scopeId: string,
  registrationId: string
}

export function TemplateSelector (props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    scopeId,
    registrationId,
    placeholder = $t({ defaultMessage: 'Select Template...' })
  } = props

  const templateDataRequest = useGetTemplateSelectionContentQuery(
    { params: { templateScopeId: scopeId, registrationId: registrationId } })


  const [templateOptions, setTemplateOptions] = useState<Array<{ value:string, label:string }>>([])

  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.scopeId + 'templateId',
    ...props.formItemProps
  }

  const [formItemLabel, setFormItemLabel] = useState($t({ defaultMessage: 'Loading Templates...' }))
  const [isPreviewAvailable, setPreviewAvailable] = useState(false)

  // Setup form options ////
  useEffect(() => {
    if(!templateDataRequest.isSuccess) {
      return
    }

    let options = templateDataRequest.data?.templates.map((t) =>
      ({ value: t.id,
        label: (t.userProvidedName?
          t.userProvidedName : $t(_.get(templateNames, t.nameLocalizationKey))) }))
    setTemplateOptions(options)
  }, [templateDataRequest.isSuccess, templateDataRequest.data?.templates])

  // Set intitial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)
    let initialTemplateId = templateDataRequest.data?.defaultTemplateId

    if(!currentFormValue && initialTemplateId) {
      let initialSelection =
        templateOptions.find(t => t.value === templateDataRequest.data?.defaultTemplateId)

      form.setFieldValue(formItemProps.name, initialSelection)
      setPreviewAvailable(true)
    }
  }, [templateDataRequest.data?.defaultTemplateId,
    templateDataRequest.data?.templates, templateOptions])

  const [componentMode, setComponentMode] = useState<'LOADING' | 'ERROR' | 'LOADED'>('LOADING')

  // Set component data loading state
  useEffect(() => {
    if(templateDataRequest.isLoading) {
      setComponentMode('LOADING')
    } else if(templateDataRequest.isError) {
      setComponentMode('ERROR')
    } else if(templateDataRequest.isSuccess) {
      setComponentMode('LOADED')
    }
  }, [templateDataRequest.isLoading, templateDataRequest.isError, templateDataRequest.isSuccess])

  // Set Form Item Label
  useEffect(() => {
    if(componentMode === 'LOADED' && templateDataRequest.data?.templateScopeNameKey) {
      setFormItemLabel(
        $t(_.get(templateScopeLabels, templateDataRequest.data.templateScopeNameKey)))
    } else {
      setFormItemLabel($t({ defaultMessage: 'Loading Templates...' }))
    }
  }, [templateDataRequest.data?.templateScopeNameKey, componentMode])


  // Preview Modal Management ///////////////////////
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | undefined>(undefined);

  const showModal = () => {
    let selectedOption = form.getFieldValue(formItemProps.name)
    let previewTemplate = templateDataRequest.data?.templates.find(t => t.id === selectedOption.value)
    setPreviewTemplate(previewTemplate)
    setIsModalOpen(true)
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  // RENDER //////////////////////////////////////////////////////
  return (
    <Loader states={[templateDataRequest]}>
      <Row>
        <Col flex="auto">
          <Form.Item {...formItemProps}
            label={formItemLabel}>
            <Select
              placeholder={placeholder}
              options={templateOptions}
              onSelect={(item:unknown, option:unknown) => {
                form.setFieldValue(formItemProps.name, option)
                form.validateFields()
                setPreviewAvailable(option? true : false)
              }}
            />
          </Form.Item>
        </Col>
        <Col>
          <Button disabled={!isPreviewAvailable} type="link" size="small" onClick={showModal}>
            {$t({defaultMessage: 'Preview'})}
          </Button>
          <Modal 
            title={ previewTemplate ? 
              (previewTemplate.userProvidedName ? 
                previewTemplate.userProvidedName : 
                $t(_.get(templateNames, previewTemplate.nameLocalizationKey)))
              : $t({defaultMessage: "Template Preview Unavailable"})} 
            visible={isModalOpen}
            onCancel={handleCancel}
            footer={[]}>
              <TemplatePreview templateType={templateDataRequest.data?.templateScopeType} template={previewTemplate} />
          </Modal>
        </Col>
      </Row>
    </Loader>
  )
}
