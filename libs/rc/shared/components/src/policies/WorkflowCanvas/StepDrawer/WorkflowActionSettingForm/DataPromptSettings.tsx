import React, { useState } from 'react'

import { Divider, Form, Input, Switch } from 'antd'
import { useIntl }                      from 'react-intl'

import { ActionType, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

import { ActionHiddenFields }   from './ActionHiddenFields'
import { CommonActionSettings } from './CommonActionSettings'
import { DataPromptField }      from './DataPromptField'

export function DataPromptSettings () {
  const { $t } = useIntl()
  const [showTitle, setShowTitle] = useState(true)
  const [showIntroText, setShowIntroText] = useState(true)
  return (
    <>
      <CommonActionSettings actionType={ActionType.DATA_PROMPT} />
      <div key={'title-switch'}
        style={{ display: 'flex', flexDirection: 'row',
          marginBottom: '5px', padding: '2px' }}>
        <label htmlFor='Title' style={{ width: '100%' }}>
          {$t({ defaultMessage: 'Title' })}
        </label>
        <Switch checked={showTitle} onChange={setShowTitle} />
      </div>
      <Form.Item
        name={'title'}
        hidden={!showTitle}
        rules={[
          { required: true },
          { min: 1 },
          { max: 100 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input />
      </Form.Item>
      <div key={'introText-switch'}
        style={{ display: 'flex', flexDirection: 'row',
          marginBottom: '5px', padding: '2px' }}>
        <label htmlFor='Title' style={{ width: '100%' }}>
          {$t({ defaultMessage: 'Intro text' })}
        </label>
        <Switch checked={showIntroText} onChange={setShowIntroText} />
      </div>
      <Form.Item
        name={'messageHtml'}
        label={$t({ defaultMessage: 'Intro text' })}
        hidden={!showIntroText}
        rules={[
          { required: true },
          { min: 1 },
          { max: 1000 },
          { validator: (_, value) => whitespaceOnlyRegExp(value) }
        ]}
      >
        <Input.TextArea rows={8} />
      </Form.Item>
      <Divider dashed={true} />
      <DataPromptField />
      <ActionHiddenFields />
    </>
  )
}
