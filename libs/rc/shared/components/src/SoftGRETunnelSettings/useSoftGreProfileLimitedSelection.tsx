import { useEffect, useState, useReducer } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import { omit, isEqual }     from 'lodash'

import { useGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import {
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  Voter,
  VoteTallyBoard } from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export const useSoftGreProfileLimitedSelection = (
  venueId: string
) => {

  const params = useParams()

  const [ softGREProfileOptionList, setSoftGREProfileOptionList] = useState<DefaultOptionType[]>([])
  const [ voteTallyBoard, setVoteTallyBoard ] = useState<VoteTallyBoard[]>([])

  const softGreViewDataList = useGetSoftGreViewDataListQuery({
    params,
    payload: {}
  })

  useEffect(() => {
    const softGreProfileList = softGreViewDataList.data?.data ?? []

    if(softGreProfileList.length > 0) {
      setSoftGREProfileOptionList(softGreProfileList.map((softGreProfile) => {
        return { label: softGreProfile.name, value: softGreProfile.id }
      }))
      console.log('softGREProfileOptionList')
      console.log(softGREProfileOptionList)
      setVoteTallyBoard(softGreProfileList.map((softGreProfile) => {
        let vote = softGreProfile.activations.filter(act=> act.venueId === venueId).length
                          + softGreProfile.venueActivations.filter(venue => venue.venueId === venueId).length
                          + softGreProfile.apActivations.filter(ap => ap.venueId === venueId).length
        const voters = [] as Voter[]
        softGreProfile.venueActivations
          .filter(venue => venue.venueId === venueId)
          .forEach((venue) => {
            voters.push({
              model: venue.apModel,
              portId: venue.portId
            })
          })
        softGreProfile.apActivations
          .filter(ap => ap.venueId === venueId)
          .forEach((ap) => {
            voters.push({
              serialNumber: ap.apSerialNumber,
              portId: ap.portId
            })
          })
        return { softGreProfileId: softGreProfile.id, vote, voters } as VoteTallyBoard
      })
      )
      console.log('voteTallyBoard')
      console.log(voteTallyBoard)
    }
  }, [softGreViewDataList])

  useEffect(() => {
    const popularSoftGreProfiles = voteTallyBoard.filter(board => board.vote > 0)
    if (popularSoftGreProfiles.length >= 3) {
      // 要加上只有一個的邏輯
      setSoftGREProfileOptionList(softGREProfileOptionList.map((option) => {
        if (!popularSoftGreProfiles.find(board => board.softGreProfileId === option.value)){
          return { ...option, disabled: true }
        }
        return option
      }))
    } else {
      setSoftGREProfileOptionList(softGREProfileOptionList.map((option) => {
        return omit(option, 'disabled') as DefaultOptionType
      }))
    }
  }, [voteTallyBoard])

  const findVoter = (voter: Voter) => {
    let isFound = false
    let softGreProfileId = ''
    let voterIndex = undefined

    voteTallyBoard.forEach((board) => {
      board.voters.forEach((existedVoter) => {
        console.log(`existedVoter:${JSON.stringify(existedVoter)}`)
        console.log(`voter:${JSON.stringify(voter)}`)
        if(isEqual(existedVoter, voter)) {
          isFound = true
          softGreProfileId = board.softGreProfileId
        }
      })
    })
    console.log('findVoter call, found? :' + isFound)
    return { isFound, softGreProfileId, voterIndex }
  }

  const deleteVoter = (voter: Voter) => {
    console.log('deleteVoter call')
    const { isFound, softGreProfileId } = findVoter(voter)
    if (isFound) {
      const newVoteTallyBoard = voteTallyBoard.map((board) => {
        if  (softGreProfileId === board.softGreProfileId) {
          return {
            softGreProfileId,
            vote: board.vote - 1,
            voters: board.voters.filter((v) => !isEqual(v, voter))
          }
        } else {
          return board
        }
      })
      console.log(newVoteTallyBoard)
      setVoteTallyBoard(newVoteTallyBoard)
    }
  }

  const addVoter = (id?: string, voter?: Voter) => {
    console.log('addVoter call')
    const newVoteTallyBoard = voteTallyBoard.map((board) => {
      if  (id === board.softGreProfileId && voter) {
        return {
          softGreProfileId: id,
          vote: board.vote + 1,
          voters: [ ...board.voters, voter ]
        }
      } else {
        return board
      }
    })
    console.log(newVoteTallyBoard)
    setVoteTallyBoard(newVoteTallyBoard)
  }

  const actionRunner =
    (current: SoftGreDuplicationChangeDispatcher, next: SoftGreDuplicationChangeDispatcher) => {
      switch(next.state){
        case SoftGreDuplicationChangeState.Init:
          break
        case SoftGreDuplicationChangeState.OnChangeSoftGreProfile:
          console.log('OnChangeSoftGreProfile')
          // 縣刪除原本的board資料
          deleteVoter(next.voter)
          // 然後增加board資料
          addVoter(next?.softGreProfileId, next.voter)
          break
        case SoftGreDuplicationChangeState.TurnOnSoftGre:
          break
        case SoftGreDuplicationChangeState.TurnOffSoftGre:
          console.log('TurnOffSoftGre')
          // 縣刪除原本的board資料
          deleteVoter(next.voter)
          break
        case SoftGreDuplicationChangeState.TurnOnLanPort:
          break
        case SoftGreDuplicationChangeState.TurnOffLanPort:
          console.log('TurnOffLanPort')
          // 縣刪除原本的board資料
          deleteVoter(next.voter)
          break
      }
      return next
    }


  // eslint-disable-next-line
  const [duplicationChangeState, duplicationChangeDispatch] = useReducer(actionRunner, {
    state: SoftGreDuplicationChangeState.Init,
    voter: {
      portId: 0
    }
  })

  return { softGREProfileOptionList, duplicationChangeDispatch }

}
