
import { Space }     from 'antd'
import { useParams } from 'react-router-dom'

import { Loader }                                                              from '@acx-ui/components'
import { NetworkSegmentationDetailTableGroup, NetworkSegmentationServiceInfo } from '@acx-ui/rc/components'
import { useGetNetworkSegmentationViewDataListQuery }                          from '@acx-ui/rc/services'

export const NetworkSegmentation = () => {

  const { venueId } = useParams()

  const {
    nsgId,
    isNsgViewDataLoading
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { venueInfoIds: [venueId] }
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
            <NetworkSegmentationServiceInfo nsgId={nsgId || ''} />
            <NetworkSegmentationDetailTableGroup nsgId={nsgId || ''} />
          </Space>
      }
    </Loader>
  )

}