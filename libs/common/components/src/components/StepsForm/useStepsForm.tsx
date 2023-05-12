import React, { useState } from 'react'

import { Col, Form, Row, Space, Steps }    from 'antd'
import _                                   from 'lodash'
import { useIntl }                         from 'react-intl'
import { useStepsForm as useStepsFormAnt } from 'sunflower-antd'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { InternalStepFormProps }               from './types'
import type { FormInstance, FormProps, StepsProps } from 'antd'
import type { UseStepsFormConfig }                  from 'sunflower-antd'

function isPromise <T> (value: unknown): value is Promise<T> {
  return Boolean((value as Promise<unknown>).then)
}

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

export function useStepsForm <T> ({
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
  const [disabled, setDisabled] = useState(!editMode)
  const formConfig = useStepsFormAnt({
    ...config,
    submit: onFinish,
    total,
    isBackValidate: Boolean(editMode)
  } as UseStepsFormConfig)
  const form = formConfig.form as FormInstance<T>
  const props = formConfig.formProps as FormProps<T>
  const currentStep = steps[formConfig.current]
  function guardSubmit (callback: (done: () => void) => void) {
    setSubmitting(true)
    callback(() => setSubmitting(false))
  }

  function handleAsyncSubmit <T> (promise: Promise<T>) {
    const timeout = setTimeout(setLoading, 50, true)
    return promise
      .catch(() => {/* do nothing */})
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
        setSubmitting(false)
      })
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
        const result = formConfig.gotoStep(n)
        if (isPromise(result)) result.catch(() => { /* mute validation error */ }).finally(done)
        else done()
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
    layout: 'vertical',
    ...config,
    ...props,
    ..._.omit(currentStep.props, 'children'),
    // Unable to take from props.initialValues
    // due to it is done via useEffect, which result in delayed
    initialValues: config.defaultFormValues,
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
    apply: $t({ defaultMessage: 'Apply' }),
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
    apply: <Button
      type='secondary'
      loading={loading}
      onClick={() => submit()}
      children={labels.apply}
      disabled={disabled}
    />,
    submit: labels.submit.length === 0? null: formConfig.current < steps.length - 1
      ? <Button
        type='secondary'
        loading={loading}
        onClick={() => newConfig.gotoStep(formConfig.current + 1)}
        children={labels.next}
        disabled={disabled}
      />
      : <Button
        type='secondary'
        loading={loading}
        onClick={() => submit()}
        children={labels.submit}
        disabled={disabled}
      />
  }

  let buttonsLayout: React.ReactNode
  if (steps.length > 1 && !editMode) {
    buttonsLayout = <>
      {buttons.cancel}
      <Space align='center' size={12}>
        {buttons.pre}
        {buttons.submit}
      </Space>
    </>
  } else buttonsLayout = <>
    {editMode ? buttons.apply : buttons.submit}
    {buttons.cancel}
  </>

  const buttonEls = <>
    <UI.ActionsContainerGlobalOverride />
    <UI.ActionsContainer data-testid='steps-form-actions'>
      <Space
        align={editMode ? 'start' : 'center'}
        size={12}
        style={{ marginLeft: editMode ? `calc((
          100% - var(--acx-sider-width) -
          var(--acx-content-horizontal-space) * 2
        ) * 4 / 24 + var(--acx-content-horizontal-space))` : undefined }}
        children={buttonsLayout}
      />
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
    <Form {...newConfig.formProps}
      onFieldsChange={(...props) => {
        newConfig.formProps.onFieldsChange?.(...props)
        setDisabled(form.getFieldsError().filter(({ errors }) => errors.length).length > 0)
      }}>
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
