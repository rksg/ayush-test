import React, { ReactNode, useState } from 'react'

import { Col, Form, Row, Space, Steps, Tooltip } from 'antd'
import _                                         from 'lodash'
import { ValidateErrorEntity }                   from 'rc-field-form/es/interface'
import { useIntl }                               from 'react-intl'
import { useStepsForm as useStepsFormAnt }       from 'sunflower-antd'

import { Button, ButtonProps } from '../Button'

import * as UI from './styledComponents'

import type { InternalStepFormProps, StepsFormGotoStepFn }      from './types'
import type { AlertProps, FormInstance, FormProps, StepsProps } from 'antd'
import type { UseStepsFormConfig }                              from 'sunflower-antd'

export const enum StepsFormActionButtonEnum {
  PRE = 'pre',
  NEXT = 'next',
  SUBMIT = 'submit'
}

function isPromise <T> (value: unknown): value is Promise<T> {
  return Boolean((value as Promise<unknown>).then)
}

type UseStepsFormParam <T> = Omit<
  UseStepsFormConfig,
  'form' | 'defaultFormValues' | 'current' | 'submit'
> & {
  editMode?: boolean
  hasPrerequisiteStep?: boolean
  form?: FormInstance<T>
  defaultFormValues?: Partial<T>
  current?: number
  onFinish?: (values: T, gotoStep: StepsFormGotoStepFn) => Promise<boolean | void>
  onFinishFailed?: (errorInfo: ValidateErrorEntity) => void
  onCancel?: (values: T) => void
  disabled?: boolean

  steps: React.ReactElement<InternalStepFormProps<T>>[]

  buttonLabel?: {
    next?: string
    submit?: string
    pre?: string
    cancel?: string
    apply?: string
  }

  buttonProps?: {
    apply?: {
      disabled?: boolean
      tooltip?: string | React.ReactNode
    }
  }

  customSubmit?: {
    label: string,
    onCustomFinish: (values: T, gotoStep: StepsFormGotoStepFn) => Promise<boolean | void>
  }

  alert?: {
    type: AlertProps['type']
    message: ReactNode
  }
}

export function useStepsForm <T> ({
  editMode,
  steps,
  buttonLabel = {},
  buttonProps = {},
  onFinish,
  onCancel,
  onFinishFailed,
  customSubmit,
  alert,
  hasPrerequisiteStep = false,
  ...config
}: UseStepsFormParam<T>) {
  const { $t } = useIntl()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // states for customSubmit
  const [customSubmitLoading, setCustomSubmitLoading] = useState(false)
  const [customSubmitting, setCustomSubmitting] = useState(false)
  const formConfig = useStepsFormAnt({
    ...config,
    submit: (formValues: unknown) => onFinish?.(formValues as T, gotoStep),
    total: steps.length,
    isBackValidate: Boolean(editMode)
  } as UseStepsFormConfig)
  const form = formConfig.form as FormInstance<T>
  const props = formConfig.formProps as FormProps<T>
  const currentStep = steps[formConfig.current]
  const isSubmitting = submitting || customSubmitting
  const isFirstStep = formConfig.current === 0
  const isLastStep = formConfig.current === steps.length - 1
  const isPrerequisiteStep = hasPrerequisiteStep && !editMode && isFirstStep

  function guardSubmit (callback: (done: () => void) => void) {
    setSubmitting(true)
    callback(() => setSubmitting(false))
  }

  function validationFailedHandler (errorInfo: ValidateErrorEntity) {
    // eslint-disable-next-line no-console
    const errorHandler = currentStep?.props.onFinishFailed || console.log
    errorHandler(errorInfo)
  }

  function handleAsyncSubmit <T> (promise: Promise<T>) {
    const timeout = setTimeout(setLoading, 50, true)
    return promise
      .catch(validationFailedHandler)
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

  function onCurrentStepFinish (
    values: T,
    callback: () => void,
    event?: React.MouseEvent
  ) {
    let promise: Promise<boolean | void> = Promise.resolve(true)

    if (currentStep?.props.onFinish) {
      promise = handleAsyncSubmit(currentStep?.props.onFinish?.(values, event))
    }
    promise.then(ok => {
      if (typeof ok === 'boolean' && !ok) return
      callback()
    })
  }

  function gotoStep (n: number, event?: React.MouseEvent) {
    const values = form.getFieldsValue(true)
    guardSubmit((done) => {
      onCurrentStepFinish(values, () => {
        const result = formConfig.gotoStep(n)
        if (isPromise(result)) result.catch(() => { /* mute validation error */ }).finally(done)
        else done()
      }, event)
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

  // customSubmit's StepsForm submit handler
  // this is not related to current step's submit
  const customSubmitHandler = () => {
    const values = form.getFieldsValue(true)
    setCustomSubmitting(true)
    onCurrentStepFinish(values, () => {
      const timeout = setTimeout(setCustomSubmitLoading, 50, true)
      form.validateFields()
        .then(() => customSubmit?.onCustomFinish?.(values, gotoStep))
        .catch(validationFailedHandler)
        .finally(() => {
          clearTimeout(timeout)
          setCustomSubmitLoading(false)
          setCustomSubmitting(false)
        })
    })
  }

  const formProps: FormProps<T> = {
    layout: 'vertical',
    // omit defaultFormValues for preventing warning: React does not recognize the `defaultFormValues` prop on a DOM element.
    ..._.omit(config, 'defaultFormValues'),
    // ..._.omit(props, 'onFinish'),
    ...props,
    // omit name for preventing prefix of id
    ..._.omit(currentStep.props, ['children', 'name', 'title']),
    // Unable to take from props.initialValues
    // due to it is done via useEffect, which result in delayed
    initialValues: config.defaultFormValues,
    requiredMark: true,
    preserve: true,
    disabled: isSubmitting || config.disabled,
    onFinishFailed: onFinishFailed
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

  const stepsEls = <UI.Steps {...stepsProps} $editMode={editMode}>
    {steps.map(({ props }) => <Steps.Step
      key={props.name}
      title={props.title}
      disabled={isSubmitting || (!editMode && newConfig.current < props.step)}
    />)}
  </UI.Steps>

  const labels = {
    next: isPrerequisiteStep ? $t({ defaultMessage: 'Start' }) : $t({ defaultMessage: 'Next' }),
    apply: $t({ defaultMessage: 'Apply' }),
    submit: $t({ defaultMessage: 'Add' }),
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
      value={StepsFormActionButtonEnum.PRE}
      onClick={(e) => newConfig.gotoStep(formConfig.current - 1, e)}
      children={labels.pre}
      hidden={isFirstStep}
    />,
    // TODO:
    // - handle disable when validation not passed
    apply: labels.apply.length === 0
      ? null
      : <ApplyButton
        loading={loading}
        disabled={customSubmitLoading || buttonProps.apply?.disabled}
        onClick={() => submit()}
        children={labels.apply}
        tooltip={buttonProps.apply?.tooltip}
      />,
    submit: labels.submit.length === 0 ? null : (!isLastStep
      ? <Button
        type='primary'
        value={StepsFormActionButtonEnum.NEXT}
        loading={loading}
        onClick={(e) => newConfig.gotoStep(formConfig.current + 1, e)}
        children={labels.next}
      />
      : <Button
        type='primary'
        value={StepsFormActionButtonEnum.SUBMIT}
        loading={loading}
        disabled={customSubmitLoading}
        onClick={() => submit()}
        children={labels.submit}
      />),
    customSubmit: customSubmit && (isLastStep || editMode)
      ? <Button
        type='primary'
        value={StepsFormActionButtonEnum.SUBMIT}
        loading={customSubmitLoading}
        disabled={loading}
        onClick={() => customSubmitHandler()}
        children={customSubmit.label}
      />
      : undefined
  }

  let buttonsLayout: React.ReactNode
  if (steps.length > 1 && !editMode) {
    buttonsLayout = <>
      {buttons.cancel}
      <Space align='center' size={12}>
        {buttons.pre}
        {buttons.customSubmit}
        {buttons.submit}
      </Space>
    </>
  } else buttonsLayout = <>
    {buttons.customSubmit}
    {editMode ? buttons.apply : buttons.submit}
    {buttons.cancel}
  </>

  const buttonEls = <UI.ActionsContainer data-testid='steps-form-actions'>
    <UI.ActionsButtons
      $editMode={!!editMode}
      $multipleSteps={steps.length > 1}
      children={buttonsLayout}
    />
  </UI.ActionsContainer>

  const alertEl = alert?.message && alert?.type && <UI.AlertContainer
    data-testid='steps-form-alert'
    {...alert}
  />

  const currentStepEl = steps[newConfig.current]

  const formLayout = steps.length > 1 && !isPrerequisiteStep
    ? <>
      <Col span={4} data-testid='steps-form-steps'>{stepsEls}</Col>
      <Col span={20} data-testid='steps-form-body'>{currentStepEl}</Col>
    </>
    : <Col span={24} data-testid='steps-form-body'>{currentStepEl}</Col>

  const stepsFormEl = <UI.Wrapper data-testid='steps-form'>
    <Form {...newConfig.formProps}>
      <Row gutter={20}>{formLayout}</Row>
      { alert ? alertEl : null}
      {buttonEls}
    </Form>
  </UI.Wrapper>

  const elements = {
    steps: stepsEls,
    actionButtons: buttonEls,
    currentStep: currentStepEl,
    stepsForm: stepsFormEl
  }

  return { ...newConfig, elements }
}

type ApplyButtonProps = ButtonProps & { tooltip?: string | React.ReactNode }
function ApplyButton (props: ApplyButtonProps) {
  const { loading, disabled, children, onClick, tooltip } = props

  const button = <Button
    type='primary'
    value={StepsFormActionButtonEnum.SUBMIT}
    loading={loading}
    disabled={disabled}
    onClick={onClick}
    children={children}
  />

  return tooltip ? <Tooltip title={tooltip}><span>{button}</span></Tooltip> : button
}
