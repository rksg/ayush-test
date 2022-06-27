import {  useState } from 'react'

import { Form as AntForm, Input } from 'antd'
import { RuleObject }             from 'antd/lib/form'
import _                          from 'lodash'

import { UseQueryResult } from '@acx-ui/types'

import * as UI from './styledComponents'

import type { FormItemProps as AntFormItemProps } from 'antd/lib/form/FormItem'
type ValidateStatus = Parameters<typeof AntForm.Item>[0]['validateStatus']

interface remoteValidation {
  listQuery: UseQueryResult<any>,
  payload?: {
    fields?: string[]
    filters?: object
    pageSize?: number
    searchString: string
    searchTargetFields?: string[] 
  },
  message: string,
  updateQuery?: any
}

export const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 }
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 }
  }
}

export enum ValidateStatusEnum {
  VALIDATING = 'validating',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning'
}

export interface FormVItemProps extends AntFormItemProps {
  value?: string
  placeholder?: string,
  remoteValidation?: remoteValidation
}

export const checkObjectExists = (
  list: any[],
  propName: string,
  propValue: string
) => {
  return list.filter(l => l[propName] === propValue).length > 0
}

export function FormValidationItem (props: FormVItemProps) {
  const [status, setStatus] = useState<ValidateStatus>('')
  const { rules=[], remoteValidation = null } = { ...props }

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
    let isInvalid = false
    if (value !== remoteValidation?.payload?.searchString) {
      remoteValidation?.updateQuery(value)
      setStatus(ValidateStatusEnum.VALIDATING)
    } else if (!remoteValidation.listQuery.isFetching && value) {
      const datalist = remoteValidation.listQuery?.data?.data || []
      isInvalid = checkObjectExists(datalist, 'name', value)
      setStatus(isInvalid ? ValidateStatusEnum.ERROR : ValidateStatusEnum.SUCCESS)
    }
    if (isInvalid) {
      return Promise.reject(new Error(rule.message?.toString()))
    }
    return Promise.resolve()
  }

  return <UI.Wrapper>
    <AntForm.Item
      name={props.name}
      label={props.label}
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
        value={props.value}
        placeholder={props.placeholder}
        suffix={suffixIcon(status)}
        onBlur={() => {
          setStatus('')
        }}
      />
    </AntForm.Item>
  </UI.Wrapper>
}

