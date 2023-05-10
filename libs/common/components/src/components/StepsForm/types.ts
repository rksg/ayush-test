import type { FormProps } from 'antd'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StepsFormProps <T = any> = Omit<
  FormProps<T>,
  'onFinish' | 'children'
> & {
  children: React.ReactNode

  editMode?: boolean

  onCancel?: (values: T) => void
  onFinish?: (values: T) => Promise<boolean | void>

  initialValues?: Partial<T>

  buttonLabel?: {
    next?: string
    submit?: string
    pre?: string
    cancel?: string
  }
}

// declare type BaseFormProps = Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'children'>;
export type StepFormProps <T> = Omit<
  FormProps<T>,
  'onFinish'
  // omitted as we don't want to deal with render prop
  | 'children'
  // omitted in favor of single initial value from the root
  | 'initialValues'

// List of props being use in the project
//   'title'
// | 'name'
// | 'onValuesChange' // ??
// | 'data-testid' // ??
// | 'initialValues' // ??
// | 'onFinish' // ??
// | 'layout' // ??
> & {
  children: React.ReactNode

  onFinish?: (values: T) => Promise<boolean | void>
}

export type InternalStepFormProps <T> = StepFormProps<T> & { step: number, name: string }
