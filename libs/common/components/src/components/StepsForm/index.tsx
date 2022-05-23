import React from 'react'

import { StepsForm as ProAntStepsForm } from '@ant-design/pro-form'
import { useIntl }                      from '@ant-design/pro-provider'
import { Steps, Space, Button, Row }    from 'antd'
import _                                from 'lodash'
import toArray                          from 'rc-util/lib/Children/toArray'

import * as UI from './styledComponents'

import type {
  ProFormInstance,
  StepsFormProps as ProAntStepsFormProps,
  StepFormProps as ProAntStepFormProps
} from '@ant-design/pro-form'
import type { ButtonProps } from 'antd'

export type { ProFormInstance as StepsFormInstance }

const { useImperativeHandle, useRef, useState } = React

type StepsFormProps <FormValue = any> =
  Omit<ProAntStepsFormProps<FormValue>, 'stepsProps' | 'submitter'> &
  {
    /**
     * Uses to toggle edit mode which enable user to switch to any steps,
     * where in non-edit mode user can only go back to previous steps
     */
    editMode?: boolean

    /**
     * Uses to cancel or reset current form action
     */
    onCancel?: () => void
  }

type StepFormProps <FormValue> = Omit<ProAntStepFormProps<FormValue>, 'requiredMark'>

type InternalStepFormProps <FormValue> = StepFormProps<FormValue> & {
  /**
   * Action handler to goto current step
   */
  onGotoStep: () => void

  /**
   * State of current step
   */
  state: 'finish' | 'active' | 'wait'

  isLastStep: boolean
}

export function StepsForm <FormValue = any> (
  props: React.PropsWithChildren<StepsFormProps<FormValue>>
) {
  const {
    children,
    editMode,
    current: propCurrent,
    formRef: propFormRef,
    onCancel,
    ...otherProps
  } = props
  const intl = useIntl()
  const formRef = useRef()
  const [current, setStep] = useState(typeof propCurrent === 'number' ? propCurrent : 0)

  useImperativeHandle(propFormRef, () => formRef.current)

  const items = toArray(children).map((child, index, { length }) => {
    const itemProps = child.props as StepFormProps<FormValue>

    return React.cloneElement(child, {
      ...itemProps,
      key: itemProps.name ?? index.toString(),
      onGotoStep: () => setStep(index),
      state: index < current ? 'finish' : index === current ? 'active' : 'wait',
      isLastStep: length - 1 === index
    })
  })

  const onCurrentChange = (next: number) => {
    setStep(next)
    if (otherProps.onCurrentChange) otherProps.onCurrentChange(next)
  }

  const stepsRender: ProAntStepsFormProps['stepsRender'] = (steps) => (
    <UI.StepsContainer>
      <Steps current={current} progressDot direction='vertical'>
        {steps.map(({ key, title }, index) => {
          const onStepClick = (editMode || current > index) && current !== index
            ? setStep
            : undefined
          return <Steps.Step {...{ key, title, onStepClick }} />
        })}
      </Steps>
    </UI.StepsContainer>
  )

  const stepsFormRender: ProAntStepsFormProps['stepsFormRender'] = (form, submitter) => (
    <>
      <UI.Container>{form}</UI.Container>
      <UI.ActionsContainer>
        <Space align='center' size={12}>{submitter}</Space>
      </UI.ActionsContainer>
    </>
  )

  const cancel = <Button
    key='cancel'
    onClick={() => onCancel?.()}
    children={intl.getMessage('stepsForm.cancel', 'Cancel')}
  />

  const submitter: ProAntStepsFormProps<FormValue>['submitter'] = {
    render (_, submitterDom) {
      const button = Array.from(submitterDom).pop() as React.ReactElement<ButtonProps>
      const key = button.key as 'next' | 'submit'
      const messages = {
        next: 'Next',
        submit: 'Finish'
      }
      const submitButton = React.cloneElement(button, {
        ...button.props,
        children: intl.getMessage(`stepsForm.${key}`, messages[key])
      })
      return [cancel, submitButton]
    }
  }

  return (
    <UI.Wrapper editMode={editMode}>
      <ProAntStepsForm<FormValue>
        {...otherProps}
        {...{ current, onCurrentChange, stepsRender, stepsFormRender, formRef }}
        children={items}
        submitter={submitter}
      />
    </UI.Wrapper>
  )
}

function StepForm <FormValue = any> (
  props: StepFormProps<FormValue>
) {
  const keys = ['onGotoStep', 'state', 'isLastStep']
  const internalProps = _.pick(props, keys) as InternalStepFormProps<FormValue>
  const formProps = _.omit(props, keys)

  return <ProAntStepsForm.StepForm<FormValue>
    {...formProps}
    requiredMark={false}
  >
    <Row>
      <UI.FormContainer
        $state={internalProps.state}
        span={24}
        children={props.children}
      />
    </Row>
  </ProAntStepsForm.StepForm>
}

StepsForm.StepForm = StepForm
StepsForm.Title = UI.Title
