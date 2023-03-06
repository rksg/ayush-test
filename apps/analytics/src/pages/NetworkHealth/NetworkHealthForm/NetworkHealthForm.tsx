import { useCallback } from 'react'

import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { PageHeader, StepsFormNew, showToast } from '@acx-ui/components'
import { useNavigateToPath }                   from '@acx-ui/react-router-dom'

import * as contents          from '../contents'
import {
  specToDto,
  useNetworkHealthSpecMutation,
  useMutationResponseEffect
} from '../services'
import {
  Band,
  ClientType,
  MutationResponse,
  NetworkHealthFormDto
} from '../types'

import { NetworkHealthFormAPsSelection } from './NetworkHealthFormAPsSelection'
import { NetworkHealthFormSettings }     from './NetworkHealthFormSettings'
import { NetworkHealthFormSummary }      from './NetworkHealthFormSummary'

export const initialValues: NetworkHealthFormDto = {
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

export function NetworkHealthForm () {
  const { $t } = useIntl()
  const navigateToList = useNavigateToPath('/serviceValidation/networkHealth')
  const breadcrumb = [{
    text: $t({ defaultMessage: 'Network Health' }),
    link: '/serviceValidation/networkHealth'
  }]

  const { editMode, spec, submit, response } = useNetworkHealthSpecMutation()

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
    <StepsFormNew
      editMode={editMode}
      initialValues={specToDto(spec.data) ?? initialValues}
      onFinish={async (values) => { await submit(values).unwrap() }}
      onCancel={navigateToList}
    >
      <StepsFormNew.StepForm
        title={$t(contents.steps.settings)}
        children={<NetworkHealthFormSettings />}
      />
      <StepsFormNew.StepForm
        title={$t(contents.steps.apsSelection)}
        children={<NetworkHealthFormAPsSelection />}
      />
      {!editMode ? <StepsFormNew.StepForm
        title={$t(contents.steps.summary)}
        children={<NetworkHealthFormSummary />}
      /> : null}
    </StepsFormNew>
  </>
}
