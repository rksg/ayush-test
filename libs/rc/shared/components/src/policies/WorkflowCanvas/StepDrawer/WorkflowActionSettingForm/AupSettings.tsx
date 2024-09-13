import React from 'react'

import { Checkbox, Form, Input } from 'antd'
import { useIntl }               from 'react-intl'

import { ActionType, whitespaceOnlyRegExp } from '@acx-ui/rc/utils'

import { CommonActionSettings } from './CommonActionSettings'

export function AupSettings () {
  const { $t } = useIntl()

  return (<>
    <CommonActionSettings actionType={ActionType.AUP} />

    <Form.Item
      name={'title'}
      label={$t({ defaultMessage: 'Title' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 100 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'messageHtml'}
      label={$t({ defaultMessage: 'Message' })}
      rules={[
        { required: true },
        { min: 1 },
        { max: 1000 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input.TextArea rows={8} />
    </Form.Item>

    <Form.Item
      name={'bottomLabel'}
      label={$t({ defaultMessage: 'Bottom Label' })}
      rules={[{ max: 1000 }]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'checkboxDefaultState'}
      label={$t({ defaultMessage: 'Checkbox Default State' })}
      valuePropName={'checked'}
    >
      <Checkbox />
    </Form.Item>

    <Form.Item
      name={'checkboxText'}
      label={$t({ defaultMessage: 'Acceptance Checkbox Label' })}
      rules={[
        { required: true },
        { max: 100 },
        { validator: (_, value) => whitespaceOnlyRegExp(value) }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'checkboxHighlightColor'}
      label={$t({ defaultMessage: 'Checkbox Highlight Color' })}
      rules={[
        { required: true }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'backButtonText'}
      label={$t({ defaultMessage: 'Back Button Label' })}
      rules={[
        { required: true },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>

    <Form.Item
      name={'continueButtonText'}
      label={$t({ defaultMessage: 'Continue Button Label' })}
      rules={[
        { required: true },
        { max: 20 }
      ]}
    >
      <Input />
    </Form.Item>

    {/* Different type of AUP settings */}
    <Form.Item
      hidden
      name={'useAupFile'}
      label={$t({ defaultMessage: 'useAupFile' })}
      valuePropName={'checked'}
    >
      <Checkbox />
    </Form.Item>

  </>)
}
