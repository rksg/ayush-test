import React from 'react'

import { Steps, Space } from 'antd'
import _                from 'lodash'
import toArray          from 'rc-util/lib/Children/toArray'
import { useIntl }      from 'react-intl'

import { Button }                       from '../Button'
import { StepsForm as ProAntStepsForm } from '../StepsFormProAnt'

import * as UI from './styledComponents'

import type { ButtonProps }              from '../Button'
import type {
  StepsFormProps as ProAntStepsFormProps,
  StepFormProps as ProAntStepFormProps
} from '../StepsFormProAnt'
import type { ProFormInstance } from '@ant-design/pro-form'

export type { ProFormInstance as StepsFormLegacyInstance }

const { useImperativeHandle, useRef, useState } = React

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StepsFormLegacyProps <FormValue = any> =
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

    buttonLabel?: {
      next?: string
      submit?: string
      pre?: string
      cancel?: string
    }
  }

export type StepFormLegacyProps <FormValue> = Omit<
  ProAntStepFormProps<FormValue>,
  'requiredMark' |
  // omitted and replace with ReactNode as we don't support using RenderProps for now
  'children'> & { children?: React.ReactNode }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function StepsFormLegacy <FormValue = any> (
  props: React.PropsWithChildren<StepsFormLegacyProps<FormValue>>
) {
  const {
    children,
    editMode,
    current: propCurrent,
    formRef: propFormRef,
    onCancel,
    ...otherProps
  } = props
  const { $t } = useIntl()
  const formRef = useRef()
  const [current, setStep] = useState(propCurrent ?? 0)

  const buttonLabel = {
    ...{
      next: $t({ defaultMessage: 'Next' }),
      submit: editMode ? $t({ defaultMessage: 'Finish' }) : $t({ defaultMessage: 'Add' }),
      pre: $t({ defaultMessage: 'Back' }),
      cancel: $t({ defaultMessage: 'Cancel' })
    },
    ...props.buttonLabel
  }

  useImperativeHandle(propFormRef, () => formRef.current)

  const _children = toArray(children)
  const items = _children.map((child, index) => {
    const itemProps = child.props as StepFormLegacyProps<FormValue>

    return React.cloneElement(child, {
      ...itemProps,
      key: itemProps.name ?? index.toString(),
      state: index < current ? 'finish' : index === current ? 'active' : 'wait'
    })
  })

  const onCurrentChange = (next: number) => {
    setStep(next)
    if (otherProps.onCurrentChange) otherProps.onCurrentChange(next)
  }

  const stepsRender: ProAntStepsFormProps['stepsRender'] = () => (<UI.StepsContainer>
    <Steps current={current} progressDot direction='vertical'>
      {_children.map((child, index) => {
        const title = child.props.title
        const onStepClick = (editMode || current > index) && current !== index
          ? setStep
          : undefined
        const key = child.props.name ?? child.props.step ?? String(index)
        // Temporary measure until ACX-13452 is fixed by moving to StepsForm
        return <Steps.Step {...{ key, title, onStepClick, disabled: editMode }} />
      })}
    </Steps>
  </UI.StepsContainer>)

  const stepsFormRender: ProAntStepsFormProps['stepsFormRender'] = (form, submitter) => (
    <>
      {form}
      <UI.ActionsContainer>
        <Space align='center' size={12}>{submitter}</Space>
      </UI.ActionsContainer>
    </>
  )

  const cancelButton = <Button
    key='cancel'
    onClick={() => onCancel?.()}
    children={buttonLabel.cancel}
  />

  function submitter (
    stepCount: number
  ): ProAntStepsFormProps<FormValue>['submitter'] {
    return {
      render (props, dom) {
        const domArray = Array.from(dom)

        const submit = domArray.pop() as React.ReactElement<ButtonProps>
        const submitKey = stepCount - 1 === props.step ? 'submit' : 'next'
        const submitButton = <Button
          {...submit.props}
          key={submitKey}
          type='primary'
          children={buttonLabel[submitKey]}
        />

        const back = domArray.pop() as React.ReactElement<ButtonProps>
        const backButton = <Button
          {...back?.props || {}}
          key='pre'
          children={buttonLabel.pre}
          disabled={props.step === 0}
        />

        return stepCount > 1
          ? [
            cancelButton,
            <Space align='center' size={12} key='back-submit'>
              {props.step === 0 ? submitButton : [backButton, submitButton]}
            </Space>
          ]
          : [submitButton, cancelButton]
      }
    }
  }

  return (
    <UI.Wrapper singleStep={items.length === 1} editMode={editMode}>
      <ProAntStepsForm<FormValue>
        {...otherProps}
        {...{ current, onCurrentChange, stepsRender, stepsFormRender, formRef }}
        children={items}
        submitter={submitter(items.length)}
      />
    </UI.Wrapper>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StepForm <FormValue = any> (
  props: Omit<StepFormLegacyProps<FormValue>, 'requireMark' | 'validateTrigger'>
) {
  const keys = ['state']
  const formProps = _.omit(props, keys)

  return <ProAntStepsForm.StepForm<FormValue>
    {...formProps}
    requiredMark={true}
  >{props.children}
  </ProAntStepsForm.StepForm>
}

StepsFormLegacy.StepForm = StepForm
StepsFormLegacy.Title = UI.Title
StepsFormLegacy.SectionTitle = UI.SectionTitle
StepsFormLegacy.FieldLabel = UI.FieldLabel
StepsFormLegacy.MultiSelect = UI.MultiSelect
