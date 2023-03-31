import { useEffect, useMemo, useState } from 'react'

import { Form, Select, FormItemProps, Button, Row, Col } from 'antd'
import _                                                 from 'lodash'
import { useIntl }                                       from 'react-intl'

import { Loader, Modal }                       from '@acx-ui/components'
import { useGetTemplateSelectionContentQuery } from '@acx-ui/rc/services'
import { Template }                            from '@acx-ui/rc/utils'

import { templateNames, templateScopeLabels } from './msgTemplateLocalizedMessages'
import { TemplatePreview }                    from './TemplatePreview'

import { Button as ACXButton } from '@acx-ui/components'

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

  const form = Form.useFormInstance()

  const formItemProps = {
    name: props.scopeId + 'templateId',
    ...props.formItemProps
  }

  const [isPreviewAvailable, setPreviewAvailable] = useState(false)

  // Generate form data from data request
  const { templateOptions, scopeLabel, initialOption } = useMemo(() => {
    if (!templateDataRequest.isSuccess) {
      return { templateOptions: [],
        scopeLabel: $t({ defaultMessage: 'Loading Templates...' }),
        initialOption: undefined }
    }

    const templateOptions = templateDataRequest.data?.templates.map((t) =>
      ({ value: t.id,
        label: (t.userProvidedName?
          t.userProvidedName : $t(_.get(templateNames, t.nameLocalizationKey))) }))

    const scopeLabel = templateDataRequest.data?.templateScopeNameKey ?
      $t(_.get(templateScopeLabels, templateDataRequest.data.templateScopeNameKey))
      : $t({ defaultMessage: 'Loading Templates...' })

    const initialOption = templateDataRequest.data?.defaultTemplateId ?
      templateOptions.find(t => t.value === templateDataRequest.data?.defaultTemplateId)
      : undefined


    return {
      templateOptions,
      scopeLabel,
      initialOption
    }
  }, [templateDataRequest.data])

  // Set intitial selected value
  useEffect(() => {
    let currentFormValue = form.getFieldValue(formItemProps.name)

    if(!currentFormValue && initialOption) {
      form.setFieldValue(formItemProps.name, initialOption)
      setPreviewAvailable(true)
    }
  }, [initialOption, templateOptions])

  // Preview Modal Management ///////////////////////
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | undefined>(undefined)

  const showModal = () => {
    let selectedOption = form.getFieldValue(formItemProps.name)
    let previewTemplate =
      templateDataRequest.data?.templates.find(t => t.id === selectedOption.value)
    setPreviewTemplate(previewTemplate)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  // RENDER //////////////////////////////////////////////////////
  return (
    <Loader style={{ height: 'auto', minHeight: 45 }} states={[templateDataRequest]}>
      <Row>
        <Col flex='auto'>
          <Form.Item {...formItemProps}
            label={scopeLabel}>
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
          <Button disabled={!isPreviewAvailable} type='link' size='small' onClick={showModal}>
            {$t({ defaultMessage: 'Preview' })}
          </Button>
          <Modal
            title={previewTemplate ?
              (previewTemplate.userProvidedName ?
                previewTemplate.userProvidedName :
                $t(_.get(templateNames, previewTemplate.nameLocalizationKey)))
              : $t({ defaultMessage: 'Template Preview Unavailable' })}
            visible={isModalOpen}
            onCancel={handleCancel}
            footer={[
              <ACXButton
                style={{ width: '83px' }}
                key='okBtn'
                type='secondary'
                onClick={handleCancel}>
                {$t({ defaultMessage: 'OK' })}
              </ACXButton>]}>
            <TemplatePreview
              templateType={templateDataRequest.data?.templateScopeType}
              template={previewTemplate} />
          </Modal>
        </Col>
      </Row>
    </Loader>
  )
}
