
import { Space }     from 'antd'
import { useParams } from 'react-router-dom'

import { Loader }                                                                      from '@acx-ui/components'
import { PersonalIdentityNetworkDetailTableGroup, PersonalIdentityNetworkServiceInfo } from '@acx-ui/rc/components'
import { useGetEdgePinViewDataListQuery }                                              from '@acx-ui/rc/services'

export const EdgePin = () => {

  const { venueId } = useParams()

  const {
    nsgId,
    isNsgViewDataLoading
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id'],
      filters: { venueId: [venueId] }
    }
  }, {
    skip: !!!venueId,
    selectFromResult: ({ data, isLoading }) => {
      return {
        nsgId: data?.data[0]?.id,
        isNsgViewDataLoading: isLoading
      }
    }
  })

  return (
    <Loader states={[{
      isLoading: isNsgViewDataLoading,
      isFetching: false
    }]}>
      {
        nsgId &&
          <Space direction='vertical'>
            <PersonalIdentityNetworkServiceInfo nsgId={nsgId || ''} />
            <PersonalIdentityNetworkDetailTableGroup nsgId={nsgId || ''} />
          </Space>
      }
    </Loader>
  )

}
