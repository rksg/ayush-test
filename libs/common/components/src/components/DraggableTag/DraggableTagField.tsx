import { Form } from 'antd'

import {
  DraggableTag,
  DraggableTagSelector,
  DraggableTagSelectorProps
} from './DraggableTagSelector'
import {
  validateTagIsAlphanumeric,
  validateTagIsUnique,
  validateTagMaxLength
} from './validator'

import type { Rule, RuleObject } from 'antd/lib/form'

// eslint-disable-next-line max-len
type Props = Omit<DraggableTagSelectorProps, 'values' | 'status' | 'customTagRules'> & {
  name: string
  rules?: Rule[]
  customTags?: {
    maxLength?: number
    customRules?: Rule[]
  }
  readonly?: boolean
}

const DEFAULT_MAX_LENGTH = 24
// eslint-disable-next-line max-len
export const DraggableTagField = ({ name, rules = [], customTags, onChange, readonly = false, ...rest }: Props) => {
  const form = Form.useFormInstance()
  const maxLength = customTags?.maxLength ?? DEFAULT_MAX_LENGTH
  const customRules = customTags?.customRules ?? []
  const customTagRules = [
    /* eslint-disable max-len */
    { validator: (_: RuleObject, val: DraggableTag[]) => validateTagIsAlphanumeric(val) },
    { validator: (_: RuleObject, val: DraggableTag[]) => validateTagIsUnique(form.getFieldValue(name), val) },
    { validator: (_: RuleObject, val: DraggableTag[]) => validateTagMaxLength(val, maxLength) },
    ...customRules
    /* eslint-enable max-len */
  ] as RuleObject[]

  return (
    <Form.Item
      name={name}
      rules={[
        {
          validator: async (_, tags: DraggableTag[]) => {
            let errorMsg = ''
            const customTags = tags.filter(t => t.isCustom)
            for (let i = 0; i < customTags.length; i++) {
              const tag = customTags[i]
              for (const rule of customTagRules) {
                try {
                  const { id, value } = tag
                  await rule.validator?.(_, [{ id, value }], () => {})
                } catch (err) {
                  errorMsg = err as string
                  break
                }
              }
            }
            return errorMsg
              ? Promise.reject(new Error(errorMsg))
              : Promise.resolve()
          }
        },
        ...rules
      ]}
      hasFeedback
      dependencies={[name]}
      validateFirst
      noStyle
    >
      <Form.Item shouldUpdate={(prev, curr) => prev !== curr} noStyle>
        {() => {
          const values = form.getFieldValue(name)
          const errors = form.getFieldError(name)
          const status = errors.length > 0 ? 'error' : ''
          return (
            <DraggableTagSelector
              {...rest}
              values={values}
              onChange={(val) => {
                onChange?.(val)
                form.setFieldsValue({ [name]: val })
                form.validateFields([name])
              }}
              status={status}
              customTagRules={customTagRules}
              readonly={readonly}
            />
          )
        }}
      </Form.Item>
    </Form.Item>
  )
}
