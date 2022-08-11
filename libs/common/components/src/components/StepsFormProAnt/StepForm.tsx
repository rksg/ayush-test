// Copied from https://github.com/ant-design/pro-components/blob/03f8c790168f666c212f64413929a2c594555d0d/packages/form/src/layouts/StepsForm/StepForm.tsx
// TODO: Upgrade `@ant-design/pro-form` after https://github.com/ant-design/pro-components/pull/5668
// is merged and new version released. This file can then be removed.

import { useContext, useEffect, useImperativeHandle, useRef } from 'react'

import { BaseForm } from '@ant-design/pro-form/lib/BaseForm'

import { StepsFormProvide } from './index'

import type { CommonFormProps }         from '@ant-design/pro-form/lib/BaseForm'
import type { FormInstance, FormProps } from 'antd'
import type { StepProps }               from 'rc-steps/lib/Step'

export type StepFormProps<T = Record<string, any>> = {
  step?: number;
  stepProps?: StepProps;
  index?: number;
} & Omit<FormProps<T>, 'onFinish' | 'form'> &
  Omit<CommonFormProps<T>, 'submitter' | 'form'>

function StepForm<T = Record<string, any>> (props: StepFormProps<T>) {
  const formRef = useRef<FormInstance | undefined>()
  const context = useContext(StepsFormProvide)
  const { onFinish, step, formRef: propFormRef, title, stepProps, ...restProps } = props

  /** 重置 formRef */
  useImperativeHandle(propFormRef, () => formRef.current)

  /** Dom 不存在的时候解除挂载 */
  useEffect(() => {
    if (!(props.name || props.step)) return
    const name = (props.name || props.step)!.toString()
    context?.regForm(name, props)
    return () => {
      context?.unRegForm(name)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (context && context?.formArrayRef) {
    context.formArrayRef.current[step || 0] = formRef
  }

  return (
    <BaseForm
      formRef={formRef}
      onFinish={async (values) => {
        if (restProps.name) {
          context?.onFormFinish(restProps.name, values)
        }
        if (onFinish) {
          context?.setLoading(true)
          // 如果报错，直接抛出
          const success = await onFinish?.(values)

          if (success) {
            context?.next()
          }
          context?.setLoading(false)
          return
        }

        if (!context?.lastStep) context?.next()
      }}
      layout='vertical'
      {...restProps}
    />
  )
}

export default StepForm
