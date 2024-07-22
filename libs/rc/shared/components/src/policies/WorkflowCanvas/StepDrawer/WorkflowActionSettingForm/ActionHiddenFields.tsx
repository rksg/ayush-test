import React from 'react'

import { Form } from 'antd'


export function ActionHiddenFields () {

  return (
    <>
      <Form.Item
        name={'backButtonText'}
        hidden={true}
      />
      <Form.Item
        name={'continueButtonText'}
        hidden={true}
      />
      <Form.Item
        name={'displayBackButton'}
        hidden={true}
      />
      <Form.Item
        name={'displayContinueButton'}
        hidden={true}
      />
    </>
  )
}
