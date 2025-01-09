import { useEffect, useState, useReducer } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import { omit, isEqual }     from 'lodash'

import { useLazyGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
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
  const [ isTheOnlyVoter, setIsTheOnlyVoter] = useState<boolean>(false)

  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()

  useEffect(() => {
    const setData = async () => {
      const softGreProfileList = (await getSoftGreViewDataList({
        params,
        payload: {}
      }).unwrap()).data
      if(softGreProfileList.length > 0) {
        setSoftGREProfileOptionList(softGreProfileList.map((softGreProfile) => {
          return { label: softGreProfile.name, value: softGreProfile.id }
        }))
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
          return {
            softGreProfileId: softGreProfile.id,
            name: softGreProfile.name,
            vote,
            voters
          } as VoteTallyBoard
        })
        )
      }
    }
    setData()
  }, [])

  useEffect(() => {
    const popularSoftGreProfiles = voteTallyBoard.filter(board => board.vote > 0)
    if (popularSoftGreProfiles.length >= 3 && !isTheOnlyVoter) {
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
  }, [voteTallyBoard, isTheOnlyVoter])

  const findVoter = (voter: Voter) => {
    let isFound = false
    let softGreProfileId = ''
    let voterIndex = undefined
    let isFoundTheOnlyVoter = false

    voteTallyBoard.forEach((board) => {
      board.voters.forEach((existedVoter) => {
        console.log(`existedVoter:${JSON.stringify(existedVoter)}`)
        console.log(`voter:${JSON.stringify(voter)}`)
        if(isEqual(existedVoter, voter)) {
          isFound = true
          softGreProfileId = board.softGreProfileId
          if (board.vote === 1) {
            isFoundTheOnlyVoter = true
          }
        }
      })
    })
    console.log('findVoter call, found? :' + isFound)
    return { isFound, softGreProfileId, voterIndex, isFoundTheOnlyVoter }
  }

  const deleteVoter = (boards: VoteTallyBoard[], voter: Voter) => {
    console.log('deleteVoter call')
    const { isFound, softGreProfileId } = findVoter(voter)
    if (isFound) {
      const newVoteTallyBoard = boards.map((board) => {
        if  (softGreProfileId === board.softGreProfileId) {
          return {
            softGreProfileId,
            name: board.name,
            vote: board.vote - 1,
            voters: board.voters.filter((v) => !isEqual(v, voter))
          }
        } else {
          return board
        }
      })
      console.table(newVoteTallyBoard)
      return newVoteTallyBoard
    }
    return boards
  }

  const deleteVoters = (boards: VoteTallyBoard[], voters?: Voter[]) => {
    console.log('deleteVoters call')
    if (!voters) return boards
    voters.forEach((voter) => {
      const { isFound, softGreProfileId } = findVoter(voter)
      if (isFound) {
        boards.forEach((board) => {
          if (softGreProfileId === board.softGreProfileId) {
            board.vote -= 1
            board.voters = board.voters.filter((v) => !isEqual(v, voter))
          }
        })
      }
    })
    console.table(boards)
    return boards
  }

  const addVoter = (boards: VoteTallyBoard[], id?: string, voter?: Voter) => {
    console.log('addVoter call')
    if (!id) return boards
    const newVoteTallyBoard = boards.map((board) => {
      if  (id === board.softGreProfileId && voter) {
        return {
          softGreProfileId: id,
          name: board.name,
          vote: board.vote + 1,
          voters: [ ...board.voters, voter ]
        }
      } else {
        return board
      }
    })
    console.table(newVoteTallyBoard)
    return newVoteTallyBoard
  }

  const actionRunner =
    (current: SoftGreDuplicationChangeDispatcher, next: SoftGreDuplicationChangeDispatcher) => {
      switch (next.state) {
        case SoftGreDuplicationChangeState.Init:
          console.log('Init')
          break
        case SoftGreDuplicationChangeState.OnChangeSoftGreProfile:
          console.log('OnChangeSoftGreProfile')
          // 縣刪除原本的board資料
          const deleted = deleteVoter(voteTallyBoard, next.voter)
          // 然後增加board資料
          const added = addVoter(deleted, next?.softGreProfileId, next.voter)
          setVoteTallyBoard(added)
          break
        case SoftGreDuplicationChangeState.TurnOnSoftGre:
          console.log('TurnOnSoftGre')
          setVoteTallyBoard(
            addVoter(voteTallyBoard, next?.softGreProfileId, next.voter)
          )
          break
        case SoftGreDuplicationChangeState.TurnOffSoftGre:
          console.log('TurnOffSoftGre')
          // 縣刪除原本的board資料
          setVoteTallyBoard(deleteVoter(voteTallyBoard, next.voter))
          break
        case SoftGreDuplicationChangeState.TurnOnLanPort:
          console.log('TurnOnLanPort')
          setVoteTallyBoard(
            addVoter(voteTallyBoard, next?.softGreProfileId, next.voter)
          )
          break
        case SoftGreDuplicationChangeState.TurnOffLanPort:
          console.log('TurnOffLanPort')
          // 縣刪除原本的board資料
          setVoteTallyBoard(deleteVoter(voteTallyBoard, next.voter))
          break
        case SoftGreDuplicationChangeState.ResetToDefault:
          console.log('ResetToDefault')
          setVoteTallyBoard(deleteVoters(voteTallyBoard, next?.voters))
          break
        case SoftGreDuplicationChangeState.FindTheOnlyVoter:
          console.log('FindTheOnlyVoter')
          const { isFoundTheOnlyVoter } = findVoter(next.voter)
          setIsTheOnlyVoter(isFoundTheOnlyVoter)
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
