import { useIntl }   from 'react-intl'
import { NodeProps } from 'reactflow'

import { DpskActionTypeIcon }              from '@acx-ui/icons'
import { ActionNodeDisplay, WorkflowStep } from '@acx-ui/rc/utils'

import BaseStepNode       from './BaseStepNode'
import BasicActionContent from './BasicActionContent'
import { useGetActionByIdQuery } from '@acx-ui/rc/services'
import { Space } from 'antd'
import { PopoverContent, PopoverTitle } from './styledComponents'
import { Spacer } from 'libs/analytics/components/src/Users/styledComponents'



export function DpskNode (props: NodeProps<WorkflowStep>) {
  const { $t } = useIntl()

  const {data, isLoading} = useGetActionByIdQuery({params:{actionId: props.data.enrollmentActionId}})

  return (
    <BaseStepNode {...{...props, data: {test: 'test'}}}>
      <BasicActionContent
        icon={<DpskActionTypeIcon />}
        title={$t(ActionNodeDisplay.DPSK)}
        content={
          <Space direction='vertical' size={6}>
            <PopoverTitle>
              {$t({defaultMessage: 'Identity Group'})}
            </PopoverTitle>
            <PopoverContent>
              TODO: IG-group-name longer to test something
            </PopoverContent>
            <Spacer />
            <PopoverTitle>
              {$t({defaultMessage: 'DPSK Service'})}
            </PopoverTitle>
            <PopoverContent>
              TODO: id-for-dpsk
            </PopoverContent>
          </Space>}
      />
      
      {/* // from data identityId and dpskId */}
    </BaseStepNode>
  )
}


/*{
    "name": "DPSK-0639444f-8bfa-4de1-aabc-217d61d9f5bd",
    "description": null,
    "actionType": "DPSK",
    "id": "65d2f63d-b773-45f6-b81d-a2cb832e3841",
    "parentActionId": "65d2f63d-b773-45f6-b81d-a2cb832e3841",
    "version": 0,
    "dpskPoolId": null,
    "identityGroupId": "50a752a6-e6b0-450f-89fa-583d0c17ecf9",
    "identityId": null,
    "emailNotification": false,
    "smsNotification": false,
    "qrCodeDisplay": false,
    "_links": {
        "self": {
            "href": "https://api.dev.ruckus.cloud/enrollmentActions/65d2f63d-b773-45f6-b81d-a2cb832e3841"
        }
    }
}*/