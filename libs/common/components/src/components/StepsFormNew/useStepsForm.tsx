import React, { useState } from 'react'

import { Col, Form, Row, Space, Steps } from 'antd'
import { useIntl }                      from 'react-intl'
import { useStepsForm }                 from 'sunflower-antd'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { InternalStepFormProps }               from './types'
import type { FormInstance, FormProps, StepsProps } from 'antd'
import type { UseStepsFormConfig }                  from 'sunflower-antd'

type UseStepsFormParam <T> = Omit<
  UseStepsFormConfig,
  'form' | 'defaultFormValues' | 'current' | 'submit'
> & {
  editMode?: boolean
  form?: FormInstance<T>
  defaultFormValues?: Partial<T>
  current?: number
  onFinish?: (values: T) => Promise<boolean | void>
  onCancel?: (values: T) => void

  steps: React.ReactElement<InternalStepFormProps<T>>[]

  buttonLabel?: {
    next?: string
    submit?: string
    pre?: string
    cancel?: string
  }
}

export { useStepsFormNew as useStepsForm }

function useStepsFormNew <T> ({
  editMode,
  steps,
  buttonLabel = {},
  onFinish,
  onCancel,
  ...config
}: UseStepsFormParam<T>) {
  const { $t } = useIntl()
  const total = steps.length
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const formConfig = useStepsForm({
    ...config,
    submit: onFinish,
    total
  } as UseStepsFormConfig)
  const form = formConfig.form as FormInstance<T>
  const props = formConfig.formProps as FormProps<T>
  const currentStep = steps[formConfig.current]
  function guardSubmit (callback: (done: () => void) => void) {
    setSubmitting(true)
    callback(() => setSubmitting(false))
  }

  async function handleAsyncSubmit <T> (promise: Promise<T>) {
    const timeout = setTimeout(setLoading, 50, true)
    const value = await promise
    clearTimeout(timeout)
    setLoading(false)
    return value
  }

  function cancel () {
    const values = form.getFieldsValue(true)
    onCancel?.(values)
  }

  function onCurrentStepFinish (values: T, callback: () => void) {
    let promise: Promise<boolean | void> = Promise.resolve(true)

    if (currentStep?.props.onFinish) {
      promise = handleAsyncSubmit(currentStep?.props.onFinish?.(values))
    }
    promise.then(ok => {
      if (typeof ok === 'boolean' && !ok) return
      callback()
    })
  }

  function gotoStep (n: number) {
    const values = form.getFieldsValue(true)
    guardSubmit((done) => {
      onCurrentStepFinish(values, () => {
        formConfig.gotoStep(n)
          .catch(() => { /* mute validation error */ })
          .finally(done)
      })
    })
  }

  const submit = () => {
    const values = form.getFieldsValue(true)
    guardSubmit((done) => {
      onCurrentStepFinish(values, () => {
        handleAsyncSubmit(formConfig.submit())
          .finally(done)
      })
    })
  }

  const formProps: FormProps<T> = {
    // TODO:
    // combine props & currentStep?.props
    ...props,
    // Unable to take from props.initialValues
    // due to it is done via useEffect, which result in delayed
    initialValues: config.defaultFormValues,
    layout: 'vertical',
    requiredMark: true,
    preserve: true,
    validateTrigger: 'onBlur',
    disabled: submitting
  }

  const stepsProps: StepsProps = {
    ...formConfig.stepsProps,
    direction: 'vertical',
    progressDot: true,
    onChange (n) { gotoStep(n) }
  }

  const newConfig = {
    ...formConfig,
    gotoStep,
    formProps,
    stepsProps
  }

  const stepsEls = <>
    <UI.StepsGlobalOverride />
    <UI.Steps {...stepsProps} $editMode={editMode}>
      {steps.map(({ props }) => <Steps.Step
        key={props.name}
        title={props.title}
        disabled={submitting || (!editMode && newConfig.current < props.step)}
      />)}
    </UI.Steps>
  </>

  const labels = {
    next: $t({ defaultMessage: 'Next' }),
    submit: $t({ defaultMessage: 'Finish' }),
    pre: $t({ defaultMessage: 'Back' }),
    cancel: $t({ defaultMessage: 'Cancel' }),
    ...buttonLabel
  }

  const buttons = {
    cancel: <Button
      onClick={() => cancel()}
      children={labels.cancel}
    />,
    pre: <Button
      onClick={() => newConfig.gotoStep(formConfig.current - 1)}
      children={labels.pre}
      disabled={formConfig.current === 0}
    />,
    // TODO:
    // - handle disable when validation not passed
    submit: formConfig.current < steps.length - 1
      ? <Button
        type='secondary'
        loading={loading}
        onClick={() => newConfig.gotoStep(formConfig.current + 1)}
        children={labels.next}
      />
      : <Button
        type='secondary'
        loading={loading}
        onClick={() => submit()}
        children={labels.submit}
      />
  }

  const buttonsLayout = steps.length > 1
    ? <>
      {buttons.cancel}
      <Space align='center' size={12}>
        {buttons.pre}
        {buttons.submit}
      </Space>
    </>
    : <>
      {buttons.submit}
      {buttons.cancel}
    </>

  const buttonEls = <>
    <UI.ActionsContainerGlobalOverride />
    <UI.ActionsContainer data-testid='steps-form-actions'>
      <Space align='center' size={12}>
        {buttonsLayout}
      </Space>
    </UI.ActionsContainer>
  </>

  const currentStepEl = steps[newConfig.current]

  const formEl = <Form {...newConfig.formProps}>
    {currentStepEl}
  </Form>

  const formLayout = steps.length > 1
    ? <>
      <Col span={4} data-testid='steps-form-steps'>{stepsEls}</Col>
      <Col span={20} data-testid='steps-form-body'>{currentStepEl}</Col>
    </>
    : <Col span={24} data-testid='steps-form-body'>{currentStepEl}</Col>

  const stepsFormEl = <UI.Wrapper data-testid='steps-form'>
    <Form {...newConfig.formProps}>
      <Row>{formLayout}</Row>
      {buttonEls}
    </Form>
  </UI.Wrapper>

  const elements = {
    steps: stepsEls,
    actionButtons: buttonEls,
    currentStep: currentStepEl,
    form: formEl,
    stepsForm: stepsFormEl
  }

  return { ...newConfig, elements }
}
