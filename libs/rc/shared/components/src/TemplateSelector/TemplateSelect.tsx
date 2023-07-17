import { useState } from 'react'

import { Select, Button, Row, Col } from 'antd'
import { DefaultOptionType }        from 'antd/lib/select'
import _                            from 'lodash'
import { useIntl }                  from 'react-intl'

import { Modal }                 from '@acx-ui/components'
import { MessageType, Template } from '@acx-ui/rc/utils'

import { templateNames }   from './msgTemplateLocalizedMessages'
import { TemplatePreview } from './TemplatePreview'

interface OnChangeHandler {
  // eslint-disable-next-line
  (e: any): void;
}

export interface TemplateSelectorProps {
  value?: string,
  onChange?: OnChangeHandler,
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
    let previewTemplate = templates?.find(t => t.id === value)
    setPreviewTemplate(previewTemplate)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const getTemplatePreviewTitle = () => {
    if(previewTemplate) {
      if(previewTemplate.userProvidedName) {
        return $t({ defaultMessage: 'Preview: {name}' }, { name: previewTemplate.userProvidedName })
      } else if(_.get(templateNames, previewTemplate.nameLocalizationKey)) {
        return $t({ defaultMessage: 'Preview: {name}' },
          { name: $t(_.get(templateNames, previewTemplate.nameLocalizationKey)) })
      } else {
        return $t({ defaultMessage: 'Template Preview' })
      }
    }

    return $t({ defaultMessage: 'Template Preview Unavailable' })
  }

  // RENDER //////////////////////////////////////////////////////
  return (
    <Row align={'middle'}>
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
          cancelButtonProps={{ style: { display: 'none' } }}
          onOk={handleModalClose}
          onCancel={handleModalClose}>
          <TemplatePreview
            templateType={templateType}
            template={previewTemplate} />
        </Modal>
      </Col>
    </Row>
  )
}
