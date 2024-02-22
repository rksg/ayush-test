import { useState } from 'react'

import { Select, Button, Row, Col } from 'antd'
import { DefaultOptionType }        from 'antd/lib/select'
import _                            from 'lodash'
import { useIntl }                  from 'react-intl'

import { Modal }                 from '@acx-ui/components'
import { MsgCategory, TemplateGroup } from '@acx-ui/rc/utils'

import { TemplatePreview } from './TemplatePreview'

interface OnChangeHandler {
  // eslint-disable-next-line
  (e: any): void;
}

export interface TemplateSelectorProps {
  value?: string,
  onChange?: OnChangeHandler,
  templateGroups: TemplateGroup[] | undefined
  msgCategory: MsgCategory | undefined
  placeholder?: string,
  options: DefaultOptionType[]
}

export function TemplateSelect (props: TemplateSelectorProps) {
  const { $t } = useIntl()

  const {
    value,
    onChange,
    templateGroups,
    msgCategory,
    placeholder,
    options
  } = props

  // Preview Modal Management ///////////////////////
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewTemplateGroup, setPreviewTemplateGroup] = useState<TemplateGroup | undefined>(undefined)

  const showModal = () => {
    if(value) {
      let selectedEmailTemplateId = value.split(',')[1]
      // this works because a template can only belong to a single group
      let previewGroup = templateGroups?.find(g => g.emailTemplateId === selectedEmailTemplateId)
      setPreviewTemplateGroup(previewGroup)
    } else { 
      setPreviewTemplateGroup(undefined)
    }
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const getTemplatePreviewTitle = () => {
    if(msgCategory) {
      if(msgCategory?.name) {
        return msgCategory?.name 
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
            emailTemplateScopeId={msgCategory?.emailTemplateScopeId}
            smsTemplateScopeId={msgCategory?.smsTemplateScopeId}
            templateGroup={previewTemplateGroup} />
        </Modal>
      </Col>
    </Row>
  )
}
