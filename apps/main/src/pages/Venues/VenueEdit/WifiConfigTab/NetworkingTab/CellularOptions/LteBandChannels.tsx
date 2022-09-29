import { useState, useEffect, useContext } from 'react'

import {
  Select,
  Switch,
  Row,
  Col,
  Space,
  Checkbox
} from 'antd'
import { isEqual } from 'lodash'
import { useIntl } from 'react-intl'

import { Button, StepsForm, Table, TableProps, Loader, showToast, Subtitle } from '@acx-ui/components'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'


export function LteBandChannels () {
  const onChange = (checkedValues: CheckboxValueType[]) => {
    console.log('checked = ', checkedValues);
  };
  
  const plainOptions = ['Apple', 'Pear', 'Orange'];
  const options = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Pear', value: 'Pear' },
    { label: 'Orange', value: 'Orange' },
  ];
  const optionsWithDisabled = [
    { label: 'Apple', value: 'Apple' },
    { label: 'Pear', value: 'Pear' },
    { label: 'Orange', value: 'Orange', disabled: false },
  ];
  return (
  <>
    <Checkbox.Group options={plainOptions} defaultValue={['Apple']} onChange={onChange} />
    <br />
    <br />
    <Checkbox.Group options={options} defaultValue={['Pear']} onChange={onChange} />
    <br />
    <br />
    <Checkbox.Group
      options={optionsWithDisabled}
      disabled
      defaultValue={['Apple']}
      onChange={onChange}
    />
  </>

  )
}
