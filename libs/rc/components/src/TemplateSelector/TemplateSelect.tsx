import { useState } from 'react'

import { Select, Button, Row, Col } from 'antd'
import { DefaultOptionType }        from 'antd/lib/select'
import _                            from 'lodash'
import { useIntl }                  from 'react-intl'

import { Modal }                 from '@acx-ui/components'
import { Button as ACXButton }   from '@acx-ui/components'
import { MessageType, Template } from '@acx-ui/rc/utils'

import { templateNames }   from './msgTemplateLocalizedMessages'
import { TemplatePreview } from './TemplatePreview'

interface OnChangeHandler {
  // eslint-disable-next-line
  (e: any): void;
}

export interface TemplateSelectorProps {
  value?: string,
  onChange: OnChangeHandler,
  templateType: MessageType | undefined,
  templates: Template[] | undefined
  placeholder?: string,
  options: DefaultOptionType[]
}

export function TemplateSelect (props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    value,
    onChange,
    templateType,
    templates,
    placeholder,
    options
  } = props

  // Preview Modal Management ///////////////////////
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Template | undefined>(undefined)

  const showModal = () => {
    let selectedOptionId = value
    let previewTemplate = templates?.find(t => t.id === selectedOptionId)
    setPreviewTemplate(previewTemplate)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const getTemplatePreviewTitle = () => {
    if(previewTemplate) {
      if(previewTemplate.userProvidedName) {
        return $t({ defaultMessage: 'Preview: {name}' }, { name: previewTemplate.userProvidedName })
      } else {
        return $t({ defaultMessage: 'Preview: {name}' },
          { name: $t(_.get(templateNames, previewTemplate.nameLocalizationKey)) })
      }
    }

    return $t({ defaultMessage: 'Template Preview Unavailable' })
  }

  // RENDER //////////////////////////////////////////////////////
  return (
    <Row>
      <Col flex='auto'>
        <Select
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          options={options} />
      </Col>
      <Col>
        <Button disabled={!value} type='link' size='small' onClick={showModal}>
          {$t({ defaultMessage: 'Preview' })}
        </Button>
        <Modal
          title={getTemplatePreviewTitle()}
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
            templateType={templateType}
            template={previewTemplate} />
        </Modal>
      </Col>
    </Row>
  )
}
