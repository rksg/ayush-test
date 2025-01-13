import { useEffect, useState, useReducer } from 'react'

import { DefaultOptionType } from 'antd/lib/select'
import { omit, isEqual }     from 'lodash'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
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
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)


  const [ softGREProfileOptionList, setSoftGREProfileOptionList] = useState<DefaultOptionType[]>([])
  const [ voteTallyBoard, setVoteTallyBoard ] = useState<VoteTallyBoard[]>([])
  const [ isTheOnlyVoter, setIsTheOnlyVoter] = useState<boolean>(false)

  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()

  useEffect(() => {
    const setData = async () => {
      const softGreProfileList = ((isEthernetSoftgreEnabled && isEthernetPortProfileEnabled) ?
        (await getSoftGreViewDataList({
          params,
          payload: {}
        }).unwrap()).data : [])
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
                portId: String(venue.portId)
              })
            })
          softGreProfile.apActivations
            .filter(ap => ap.venueId === venueId)
            .forEach((ap) => {
              voters.push({
                serialNumber: ap.apSerialNumber,
                portId: String(ap.portId)
              })
            })
          let FQDNAddresses = [softGreProfile.primaryGatewayAddress]
          if (softGreProfile.secondaryGatewayAddress) {
            FQDNAddresses.push(softGreProfile.secondaryGatewayAddress)
          }

          return {
            softGreProfileId: softGreProfile.id,
            name: softGreProfile.name,
            FQDNAddresses,
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
    const activatedSoftGreProfiles = voteTallyBoard.filter(board => board.vote > 0)
    if (activatedSoftGreProfiles.length >= 3 && !isTheOnlyVoter) {
      setSoftGREProfileOptionList(softGREProfileOptionList.map((option) => {
        if (!activatedSoftGreProfiles.find(board => board.softGreProfileId === option.value)){
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

  const findVoter = (voter?: Voter) => {
    let isFound = false
    let softGreProfileId = ''
    let voterIndex = undefined
    let isFoundTheOnlyVoter = false
    if (voter) {
      voteTallyBoard.forEach((board) => {
        board.voters.forEach((existedVoter) => {
          if(isEqual(existedVoter, voter)) {
            isFound = true
            softGreProfileId = board.softGreProfileId
            if (board.vote === 1) {
              isFoundTheOnlyVoter = true
            }
          }
        })
      })
    }
    return { isFound, softGreProfileId, voterIndex, isFoundTheOnlyVoter }
  }

  const deleteVoter = (boards: VoteTallyBoard[], voter?: Voter) => {
    if (!voter) return boards
    const { isFound, softGreProfileId } = findVoter(voter)
    if (isFound) {
      return boards.map((board) => {
        if  (softGreProfileId === board.softGreProfileId) {
          return {
            softGreProfileId,
            name: board.name,
            FQDNAddresses: board.FQDNAddresses,
            vote: board.vote - 1,
            voters: board.voters.filter((v) => !isEqual(v, voter))
          }
        } else {
          return board
        }
      })
    }
    return boards
  }

  const deleteVoters = (boards: VoteTallyBoard[], voters?: Voter[]) => {
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
    return boards
  }

  const addVoter = (boards: VoteTallyBoard[], id?: string, voter?: Voter) => {
    if (!id) return boards
    return boards.map((board) => {
      if  (id === board.softGreProfileId && voter) {
        return {
          softGreProfileId: id,
          name: board.name,
          FQDNAddresses: board.FQDNAddresses,
          vote: board.vote + 1,
          voters: [ ...board.voters, voter ]
        }
      } else {
        return board
      }
    })
  }

  const validateIsFQDNDuplicate = (softGreProfileId: string) => {

    let isDuplicate = false

    if (!softGreProfileId) return isDuplicate

    const selectedProfile = voteTallyBoard.find(board => {
      return board.softGreProfileId === softGreProfileId
    })

    if (!selectedProfile) return isDuplicate

    const activatedSoftGreProfilesWithoutSelected = voteTallyBoard.filter(board => {
      return board.softGreProfileId !== softGreProfileId && board.vote > 0
    })

    selectedProfile.FQDNAddresses.forEach(FQDN => {
      activatedSoftGreProfilesWithoutSelected.forEach(board => {
        if (board.FQDNAddresses.includes(FQDN)) {
          isDuplicate = true
        }
      })
    })

    return isDuplicate
  }

  const actionRunner =
    (current: SoftGreDuplicationChangeDispatcher, next: SoftGreDuplicationChangeDispatcher) => {
      switch (next.state) {
        case SoftGreDuplicationChangeState.Init:
          break
        case SoftGreDuplicationChangeState.OnChangeSoftGreProfile:
          const deleted = deleteVoter(voteTallyBoard, next.voter)
          const added = addVoter(deleted, next?.softGreProfileId, next.voter)
          setVoteTallyBoard(added)
          break
        case SoftGreDuplicationChangeState.TurnOnSoftGre:
          setVoteTallyBoard(
            addVoter(voteTallyBoard, next?.softGreProfileId, next.voter)
          )
          break
        case SoftGreDuplicationChangeState.TurnOffSoftGre:
          setVoteTallyBoard(deleteVoter(voteTallyBoard, next.voter))
          break
        case SoftGreDuplicationChangeState.TurnOnLanPort:
          setVoteTallyBoard(
            addVoter(voteTallyBoard, next?.softGreProfileId, next.voter)
          )
          break
        case SoftGreDuplicationChangeState.TurnOffLanPort:
          // 縣刪除原本的board資料
          setVoteTallyBoard(deleteVoter(voteTallyBoard, next.voter))
          break
        case SoftGreDuplicationChangeState.ResetToDefault:
          setVoteTallyBoard(deleteVoters(voteTallyBoard, next?.voters))
          break
        case SoftGreDuplicationChangeState.FindTheOnlyVoter:
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
      portId: '0'
    }
  })

  return { softGREProfileOptionList, duplicationChangeDispatch, validateIsFQDNDuplicate }

}
