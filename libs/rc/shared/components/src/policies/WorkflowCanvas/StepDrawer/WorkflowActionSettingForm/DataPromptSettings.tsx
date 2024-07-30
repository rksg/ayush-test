import React, { useState } from 'react'

import { Divider, Form, Input, Switch } from 'antd'
import { useIntl }                      from 'react-intl'

import { ActionType, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'
import { DataPromptField }      from './DataPromptField'
import { FieldLabel }           from './styledComponents'

export function DataPromptSettings () {
  const { $t } = useIntl()
  const [showTitle, setShowTitle] = useState(true)
  const [showIntroText, setShowIntroText] = useState(true)
  return (
    <>
      <CommonActionSettings actionType={ActionType.DATA_PROMPT} />
      <FieldLabel width='555px' >
        {$t({ defaultMessage: 'Title' })}
        <Form.Item key='displayTitle'
          data-testid={'displayTitle'}
          name={'displayTitle'}
          valuePropName={'checked'}
        >
          <Switch data-testid={'switch-title'}
            onChange={setShowTitle}/>
        </Form.Item>
      </FieldLabel>
      <Form.Item key={'title'}
        hidden={!showTitle}
        name={'title'}
        rules={[
          { required: true },
          { min: 1 },
          { max: 100 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input data-testid={'title'}/>
      </Form.Item>

      <FieldLabel width='555px'>
        {$t({ defaultMessage: 'Intro text' })}
        <Form.Item key='displayMessageHtml'
          data-testid={'displayMessageHtml'}
          name={'displayMessageHtml'}
          valuePropName={'checked'}
        >
          <Switch data-testid={'switch-messageHtml'}
            onChange={setShowIntroText}/>
        </Form.Item>
      </FieldLabel>
      <Form.Item key='messageHtml'
        hidden={!showIntroText}
        name={'messageHtml'}
        rules={[
          { required: true },
          { min: 1 },
          { max: 1000 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input.TextArea rows={8}
          data-testid={'messageHtml'} />
      </Form.Item>

      <Divider dashed={true} />
      <DataPromptField />
      <Form.Item
        name={'backButtonText'}
        hidden={true}
      />
      <Form.Item
        name={'continueButtonText'}
        hidden={true}
      />
      <Form.Item
        name={'displayBackButton'}
        hidden={true}
      />
      <Form.Item
        name={'displayContinueButton'}
        hidden={true}
      />
    </>
  )
}
