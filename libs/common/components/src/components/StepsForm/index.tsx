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

export type { ProFormInstance as StepsFormInstance }

const { useImperativeHandle, useRef, useState } = React

export type StepsFormProps <FormValue = any> =
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

export type StepFormProps <FormValue> = Omit<
  ProAntStepFormProps<FormValue>,
  'requiredMark' |
  // omitted and replace with ReactNode as we don't support using RenderProps for now
  'children'> & { children?: React.ReactNode }

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
  const { $t } = useIntl()
  const formRef = useRef()
  const [current, setStep] = useState(propCurrent ?? 0)

  useImperativeHandle(propFormRef, () => formRef.current)

  const _children = toArray(children)
  const items = _children.map((child, index) => {
    const itemProps = child.props as StepFormProps<FormValue>

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

  const stepsRender: ProAntStepsFormProps['stepsRender'] = () => (
    <UI.StepsContainer>
      <Steps current={current} progressDot direction='vertical'>
        {_children.map((child, index) => {
          const title = child.props.title
          const onStepClick = (editMode || current > index) && current !== index
            ? setStep
            : undefined
          const key = child.props.name ?? child.props.step ?? String(index)
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

  const buttonLabel = {
    next: $t({ defaultMessage: 'Next' }),
    submit: $t({ defaultMessage: 'Finish' }),
    cancel: $t({ defaultMessage: 'Cancel' })
  }

  const cancel = <Button
    key='cancel'
    onClick={() => onCancel?.()}
    children={buttonLabel.cancel}
  />

  const submitter: ProAntStepsFormProps<FormValue>['submitter'] = {
    render (_, submitterDom) {
      const button = Array.from(submitterDom).pop() as React.ReactElement<ButtonProps>
      const key = button.key as 'next' | 'submit'

      const submitButton = <Button
        {...button.props}
        key={key}
        type='secondary'
        children={buttonLabel[key]}
      />
      return [submitButton, cancel]
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
  props: Omit<StepFormProps<FormValue>, 'requireMark' | 'validateTrigger'>
) {
  const keys = ['state']
  const formProps = _.omit(props, keys)

  return <ProAntStepsForm.StepForm<FormValue>
    {...formProps}
    requiredMark={true}
    validateTrigger={'onBlur'}
  >{props.children}
  </ProAntStepsForm.StepForm>
}

StepsForm.StepForm = StepForm
StepsForm.Title = UI.Title
