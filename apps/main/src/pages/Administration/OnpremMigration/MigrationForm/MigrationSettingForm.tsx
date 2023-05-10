import React, { useContext } from 'react'

import {
  Col,
  Form,
  Input,
  Row,
  Typography
} from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'
import styled        from 'styled-components/macro'

import { StepsFormLegacy }             from '@acx-ui/components'
import { useGetSyslogPolicyListQuery } from '@acx-ui/rc/services'
import {
  MigrationActionTypes
} from '@acx-ui/rc/utils'

import MigrationContext from '../MigrationContext'

import * as UI from './styledComponents'

type MigrationSettingFormProps = {
  className?: string
}

const MigrationSettingForm = styled((props: MigrationSettingFormProps) => {
  const { $t } = useIntl()
  const { className } = props
  const params = useParams()
  const edit = false

  const {
    state, dispatch
  } = useContext(MigrationContext)

  const { data } = useGetSyslogPolicyListQuery({ params: params })

  const handlePolicyName = (policyName: string) => {
    dispatch({
      type: MigrationActionTypes.POLICYNAME,
      payload: {
        policyName: policyName
      }
    })
  }


  return (
    <Row gutter={20} className={className}>
      <Col span={10}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Migration' })}</StepsFormLegacy.Title>
        <Typography.Text>
          {// eslint-disable-next-line max-len
            $t({ defaultMessage: 'Migration assistant will migrate ZoneDirector configuration from the selected backup file and create a new venue.' })}
        </Typography.Text>
        <Form.Item
          name='venueName'
          label={$t({ defaultMessage: 'New Venue Name' })}
          rules={[
            { min: 2 },
            { max: 32 },
            { validator: async (rule, value) => {
              if (!edit && value
                  && data?.findIndex((policy) => policy.name === value) !== -1) {
                return Promise.reject(
                  $t({ defaultMessage: 'The venue with that name already exists' })
                )
              }
              return Promise.resolve()
            } }
          ]}
          validateFirst
          hasFeedback
          initialValue={state.policyName}
          children={<Input
            data-testid='name'
            style={{ width: '380px' }}
            onChange={(event => {handlePolicyName(event.target.value)})}
          />}
        />
        <Form.Item
          name='description'
          label={$t({ defaultMessage: 'Description' })}
          children={<Input
            data-testid='description'
            style={{ width: '380px' }}
            onChange={(event => {handlePolicyName(event.target.value)})}
          />}
        />
        <Form.Item
          name='address'
          label={$t({ defaultMessage: 'Address' })}
          children={<Input
            data-testid='address'
            style={{ width: '380px' }}
            onChange={(event => {handlePolicyName(event.target.value)})}
          />}
        />
        <Typography.Text>
          {$t({ defaultMessage: 'Note: WLAN configuration won’t be migrated' })}
        </Typography.Text>
      </Col>
    </Row>
  )
})`${UI.styles}`

export { MigrationSettingForm }
