import React, { createContext, useContext } from 'react'

import { Form }         from 'antd'
import { FormInstance } from 'antd'
import _                from 'lodash'
import toArray          from 'rc-util/lib/Children/toArray'

import { noDataDisplay } from '@acx-ui/utils'

import * as UI                                                  from './styledComponents'
import { InternalStepFormProps, StepFormProps, StepsFormProps } from './types'
import { useStepsForm }                                         from './useStepsForm'

interface IStepsFormContext <T> {
  form: FormInstance<T>
  current: number
  editMode: boolean
  initialValues?: Partial<T>
}

// https://stackoverflow.com/a/61020816/499975
export const createStepsFormContext = _.once(<T,>() => createContext({} as IStepsFormContext<T>))
export function useStepFormContext <T> () {
  return useContext(createStepsFormContext<T>())
}

export function StepsForm <T> ({ editMode, ...props }: StepsFormProps<T>) {
  const StepsFormContext = createStepsFormContext<T>()
  const children = toArray(props.children)
    .map((child: React.ReactElement<InternalStepFormProps<T>>, step) => {
      const name = child.props.name || `${step}`
      return React.cloneElement(child, {
        ...child.props, name, step, key: name
      })
    })

  const [form] = Form.useForm(props.form)
  const config = useStepsForm<T>({
    ..._.omit(props, 'children'),
    form,
    steps: children,
    editMode: editMode,
    defaultFormValues: props.initialValues,
    buttonLabel: props.buttonLabel,
    onFinish: props.onFinish,
    onCancel: props.onCancel,
    onFinishFailed: props.onFinishFailed
  })

  const context = {
    form,
    current: config.current,
    editMode: Boolean(editMode),
    initialValues: props.initialValues
  }

  return <StepsFormContext.Provider
    value={context}
    children={config.elements.stepsForm}
  />
}

function StepForm <T> (props: StepFormProps<T>) {
  const { step } = props as InternalStepFormProps<T>
  const { current } = useStepFormContext<T>()

  if (step !== current) return null

  // Needed to avoid type error
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{props.children}</>
}

StepsForm.StepForm = StepForm
StepsForm.Title = UI.Title
StepsForm.SectionTitle = UI.SectionTitle
StepsForm.FieldLabel = UI.FieldLabel
StepsForm.MultiSelect = UI.MultiSelect

export type FieldSummaryProps <T = unknown> = {
  value?: T
  convert?: (value?: T) => React.ReactNode
}

StepsForm.FieldSummary = function FieldSummary <T> ({ value, convert }: FieldSummaryProps<T>) {
  convert = convert ?? ((value) => String(value ?? noDataDisplay))
  return <span>{convert(value)}</span>
}
