
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }  from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { useNavigateToPath }      from '@acx-ui/react-router-dom'

import { useCreateCallQoeTestMutation } from '../services'

import { VideoCallQoeCreateForm }  from './VideoCallQoeCreateForm'
import { VideoCallQoeDetailsForm } from './VideoCallQoeDetailsForm'

export function VideoCallQoeForm () {
  const { $t } = useIntl()
  const [ link, setLink ] = useState('')
  const navigateToList = useNavigateToPath('/analytics/videoCallQoe')
  const breadcrumb = [
    ...(useIsSplitOn(Features.NAVBAR_ENHANCEMENT) ? [
      { text: $t({ defaultMessage: 'AI Assurance' }) },
      { text: $t({ defaultMessage: 'Network Assurance' }) }
    ]:[]),
    { text: $t({ defaultMessage: 'Video Call QoE' }), link: '/analytics/videoCallQoe' }]

  const [ submit ] = useCreateCallQoeTestMutation()

  return <>
    <PageHeader title={!link
      ? $t({ defaultMessage: 'Create Test Call' })
      : $t({ defaultMessage: 'Test Call Details' })}
    breadcrumb={breadcrumb} />
    <StepsForm
      onFinish={async (values: { name: string }) => {
        const response = await submit(values).unwrap()
        setLink(response?.meetings[0]?.joinUrl)
      }}
      onCancel={navigateToList}
      buttonLabel={{
        submit: link ? '': $t({ defaultMessage: 'Add' }),
        cancel: link ? $t({ defaultMessage: 'Done' }) : $t({ defaultMessage: 'Cancel' })
      }}
    >
      {
        <StepsForm.StepForm
          children={link?
            <VideoCallQoeDetailsForm link={link}/>
            :
            <VideoCallQoeCreateForm />
          }/>
      }

    </StepsForm>
  </>
}
