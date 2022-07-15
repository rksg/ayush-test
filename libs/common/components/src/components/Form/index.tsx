import {  useState } from 'react'

import { Form as AntForm, Input } from 'antd'
import { RuleObject }             from 'antd/lib/form'
import _                          from 'lodash'

import * as UI from './styledComponents'

import type { FormItemProps as AntFormItemProps } from 'antd/lib/form/FormItem'
type ValidateStatus = Parameters<typeof AntForm.Item>[0]['validateStatus']

interface RemoteValidation<T> {
  queryResult: T[],
  message: string,
  isValidating: boolean,
  validator: (result: T[], value: string) => boolean,
  updateQuery: (value: string) => void
}

export enum ValidateStatusEnum {
  VALIDATING = 'validating',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface FormVItemProps<T> extends AntFormItemProps {
  value?: string
  placeholder?: string,
  remoteValidation: RemoteValidation<T>
}

export function FormValidationItem<T> ({
  name,
  label,
  value = '',
  placeholder,
  rules = [],
  remoteValidation
}: FormVItemProps<T>) {
  const [status, setStatus] = useState<ValidateStatus>('')
  const [oldValue, setOldValue] = useState<string>(value)

  const suffixIcon = (status: ValidateStatus) => {
    switch (status) {
      case ValidateStatusEnum.VALIDATING:
        return <UI.LoadingSolidIcon />
      case ValidateStatusEnum.SUCCESS:
        return <UI.SuccessSolidIcon />
      default:
        // set empty element to keep dom structure
        return <i />
    }
  }

  const remoteValidator = (rule: RuleObject, value: string) => {
    let isValid = true
    const { queryResult, isValidating, updateQuery, validator }: RemoteValidation<T> =
      remoteValidation
    if (value !== oldValue) {
      updateQuery(value)
      setOldValue(value)
      setStatus(ValidateStatusEnum.VALIDATING)
    } else if (!isValidating && value) {
      isValid = validator(queryResult, value)
      setStatus(isValid ? ValidateStatusEnum.SUCCESS : ValidateStatusEnum.ERROR)
    }

    if (!isValid) {
      return Promise.reject(new Error(rule.message?.toString()))
    }
    return Promise.resolve()
  }

  return <UI.Wrapper>
    <AntForm.Item
      name={name}
      label={label}
      rules={_.compact([
        ...rules,
        remoteValidation && {
          validator: remoteValidator,
          message: remoteValidation?.message
        }
      ])}
      validateFirst
      validateTrigger='onBlur'
      validateStatus={status}
    >
      <Input
        value={value}
        placeholder={placeholder}
        suffix={suffixIcon(status)}
        onBlur={() => {
          setStatus('')
        }}
      />
    </AntForm.Item>
  </UI.Wrapper>
}

