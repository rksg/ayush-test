
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { PageHeader, StepsFormNew } from '@acx-ui/components'
import { useNavigateToPath }        from '@acx-ui/react-router-dom'

import { useCreateCallQoeTestMutation, useDeleteCallQoeTestMutation } from '../services'

import { VideoCallQoeFormCreate }  from './VideoCallQoeFormCreate'
import { VideoCallQoeFormSummary } from './VideoCallQoeFormSummary'

export function VideoCallQoeForm () {
  const { $t } = useIntl()
  const [ link, setLink ] = useState('')
  const [ id, setId ] = useState(-1)
  const navigateToList = useNavigateToPath('/serviceValidation/videoCallQoe')
  const breadcrumb = [{
    text: $t({ defaultMessage: 'Video Call QoE' }),
    link: '/serviceValidation/videoCallQoe'
  }]

  const [ submit ] = useCreateCallQoeTestMutation()
  const [deleteCallQoeTest] = useDeleteCallQoeTestMutation()

  return <>
    <PageHeader title={$t({ defaultMessage: 'Create Test' })} breadcrumb={breadcrumb} />
    <StepsFormNew
      onFinish={async (values: { name: string }) => {
        const response = await submit(values).unwrap()
        setLink(response?.meetings[0]?.joinUrl)
        setId(response?.id)

        // await deleteCallQoeTest({ id: 28 }).unwrap()
        //console.log('## Response received:', response)
      }}
      //onCancel={navigateToList}
      onCancel={async () => {
        console.log('Deleting test id: ', id)
        await deleteCallQoeTest({ id }).unwrap()
        //await deleteCallQoeTest({ id: 61 }).unwrap()
        navigateToList()
      }
      }
      buttonLabel={{
        submit: link ? '': $t({ defaultMessage: 'Add' }),
        cancel: link? $t({ defaultMessage: 'Back' }) :$t({ defaultMessage: 'Cancel' })
      }}
    >
      {
        <StepsFormNew.StepForm
          children={link?
            <VideoCallQoeFormSummary link={link}/>
            :
            <VideoCallQoeFormCreate />
          }/>
      }

    </StepsFormNew>
  </>
}
