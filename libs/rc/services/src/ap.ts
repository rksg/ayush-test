import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import {
  ApRadioBands,
  CommonUrlsInfo,
  createHttpRequest,
  RequestPayload
} from '@acx-ui/rc/utils'


export const baseApApi = createApi({
  baseQuery: fetchBaseQuery(),
  reducerPath: 'apApi',
  tagTypes: ['Ap'],
  refetchOnMountOrArgChange: true,
  endpoints: () => ({ })
})

export interface Ap {
  apStatusData: any
}

export interface ApTableResult <ResultItemType> {
  data: ResultItemType[]
  page: number
  totalCount: number
  channelColumnStatus: any
}

export const apApi = baseApApi.injectEndpoints({
  endpoints: (build) => ({
    apList: build.query<ApTableResult<Ap>, RequestPayload>({
      query: ({ params, payload }) => {
        const apListReq = createHttpRequest(CommonUrlsInfo.getApsList, params)
        return{
          ...apListReq,
          body: payload
        }
      }
      ,
      transformResponse (result: ApTableResult<Ap>) {
        let channelColumnStatus = {
          channel24: true,
          channel50: false,
          channelL50: false,
          channelU50: false,
          channel60: false

        }

        result.data = result.data.map(item => {
          if (item.apStatusData?.APRadio) {
            const apRadioArray = item.apStatusData.APRadio
            const apRadioU50 = apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
              item.band === ApRadioBands.band50 && item.radioId === 2)

            const apRadioObject = {
              apRadio24: apRadioArray.find((item: { band: ApRadioBands }) =>
                item.band === ApRadioBands.band24),
              apRadioU50: apRadioU50,
              apRadio50: !apRadioU50 &&
                apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
                  item.band === ApRadioBands.band50 && item.radioId === 1),
              apRadio60: !apRadioU50 &&
                apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
                  item.radioId === 2),
              apRadioL50: apRadioU50 &&
                apRadioArray.find((item: { band: ApRadioBands, radioId: number }) =>
                  item.band === ApRadioBands.band50 && item.radioId === 1)
            }

            const channel = {
              channel24: apRadioObject.apRadio24?.channel,
              channel50: apRadioObject.apRadio50?.channel,
              channelL50: apRadioObject.apRadioL50?.channel,
              channelU50: apRadioObject.apRadioU50?.channel,
              channel60: apRadioObject.apRadio60?.channel
            }

            channelColumnStatus = {
              channel24: true,
              channel50: Boolean(channel.channel50) || channelColumnStatus.channel50,
              channelL50: Boolean(channel.channelL50) || channelColumnStatus.channelL50,
              channelU50: Boolean(channel.channelU50) || channelColumnStatus.channelU50,
              channel60: Boolean(channel.channel60) || channelColumnStatus.channel60
            }

            return { ...item, ...channel }

          } else {
            return item
          }

        })


        return { ...result, channelColumnStatus }
      }
    })
  })
})

export const {
  useApListQuery
} = apApi



// if (ap.apStatusData && ap.apStatusData.APRadio) {
//   const apRadio24 = _.find(ap.apStatusData.APRadio, r => r.band === ApRadioBands.band24);
//   const apRadioU50 = _.find(ap.apStatusData.APRadio, r => r.band === ApRadioBands.band50 && r.radioId === 2);
//   const apRadio50 = !apRadioU50 &&_.find(ap.apStatusData.APRadio, r => r.band === ApRadioBands.band50 && r.radioId === 1);
//   const apRadio60 = !apRadioU50 && _.find(ap.apStatusData.APRadio, r => r.radioId === 2);
//   const apRadioL50 = apRadioU50 && _.find(ap.apStatusData.APRadio, r => r.band === ApRadioBands.band50 && r.radioId === 1);
//   ap.channel24 = apRadio24 ? apRadio24.channel : null;
//   ap.channel50 = apRadio50 ? apRadio50.channel : null;
//   if (!this.channelColunnnShow[1] && apRadio50) this.channelColunnnShow[1] = true;
//   ap.channelL50 = apRadioL50 ? apRadioL50.channel : null;
//   if (!this.channelColunnnShow[2] && apRadioL50) this.channelColunnnShow[2] = true;
//   ap.channelU50 = apRadioU50 ? apRadioU50.channel : null;
//   if (!this.channelColunnnShow[3] && apRadioU50) this.channelColunnnShow[3] = true;
//   ap.channel60 = apRadio60 ? apRadio60.channel : null;
//   if (!this.channelColunnnShow[4] && apRadio60) this.channelColunnnShow[4] = true;
// } else {
//   this.channelColunnnShow[1] = true;
// }


// <div class="rf-channels-column-content text-center" [ngStyle]="{'grid-template-columns': channelGridRowStyle}">
// <span>{{row['channel24'] || '--'}}</span>
// <span *ngIf="channelColunnnShow[1]">{{row['channel50'] || '--'}}</span>
// <span *ngIf="channelColunnnShow[2]">{{row['channelL50'] || '--'}}</span>
// <span *ngIf="channelColunnnShow[3]">{{row['channelU50'] || '--'}}</span>
// <span *ngIf="channelColunnnShow[4]">{{row['channel60'] || '--'}}</span>
// </div>
