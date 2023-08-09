import { useCallback } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, StepsForm, showToast } from '@acx-ui/components'
import { useIsSplitOn, Features }           from '@acx-ui/feature-toggle'
import { useNavigateToPath }                from '@acx-ui/react-router-dom'

import * as contents          from '../contents'
import {
  specToDto,
  useServiceGuardSpecMutation,
  useMutationResponseEffect
} from '../services'
import {
  Band,
  ClientType,
  MutationResponse,
  ServiceGuardFormDto
} from '../types'

import { ServiceGuardFormAPsSelection } from './ServiceGuardFormAPsSelection'
import { ServiceGuardFormSettings }     from './ServiceGuardFormSettings'
import { ServiceGuardFormSummary }      from './ServiceGuardFormSummary'

export const initialValues: ServiceGuardFormDto = {
  clientType: ClientType.VirtualClient,
  schedule: {
    type: 'service_guard',
    timezone: moment.tz.guess(),
    frequency: null,
    day: null,
    hour: null
  },
  configs: [{
    radio: Band.Band2_4,
    speedTestEnabled: false
  }],
  isDnsServerCustom: false
}

export function ServiceGuardForm () {
  const { $t } = useIntl()
  const navigateToList = useNavigateToPath('/analytics/serviceValidation')
  const breadcrumb = [
    ...(useIsSplitOn(Features.NAVBAR_ENHANCEMENT) ? [
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'Network Assurance' }) }
    ]:[]),
    {
      text: $t({ defaultMessage: 'Service Validation' }),
      link: '/analytics/serviceValidation'
    }
  ]

  const { editMode, spec, submit, response } = useServiceGuardSpecMutation()

  const title = editMode
    ? $t({ defaultMessage: 'Edit Test' })
    : $t({ defaultMessage: 'Create Test' })

  useMutationResponseEffect(response, useCallback((response: MutationResponse) => {
    showToast({
      type: 'success',
      content: response.originalArgs?.id
        ? $t(contents.messageMapping.TEST_UPDATED)
        : $t(contents.messageMapping.TEST_CREATED)
    })
    navigateToList()
  }, [$t, navigateToList]))

  return <>
    <PageHeader title={title} breadcrumb={breadcrumb} />
    <StepsForm
      editMode={editMode}
      initialValues={specToDto(spec.data) ?? initialValues}
      onFinish={async (values) => { await submit(values).unwrap() }}
      onCancel={navigateToList}
    >
      <StepsForm.StepForm
        title={$t(contents.steps.settings)}
        children={<ServiceGuardFormSettings />}
      />
      <StepsForm.StepForm
        title={$t(contents.steps.apsSelection)}
        children={<ServiceGuardFormAPsSelection />}
      />
      {!editMode ? <StepsForm.StepForm
        title={$t(contents.steps.summary)}
        children={<ServiceGuardFormSummary />}
      /> : null}
    </StepsForm>
  </>
}
