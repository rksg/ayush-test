import { useEffect, useState, useReducer } from 'react'

import { Form }              from 'antd'
import { DefaultOptionType } from 'antd/lib/select'
import { omit, isEqual }     from 'lodash'

import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { useLazyGetSoftGreViewDataListQuery } from '@acx-ui/rc/services'
import {
  SoftGreDuplicationChangeDispatcher,
  SoftGreDuplicationChangeState,
  SoftGreOptionCandidate,
  useConfigTemplate,
  Voter,
  VoteTallyBoard
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

export const useSoftGreProfileLimitedSelection = (
  venueId: string
) => {
  const { isTemplate } = useConfigTemplate()
  const params = useParams()
  const isEthernetSoftgreEnabled = useIsSplitOn(Features.WIFI_ETHERNET_SOFTGRE_TOGGLE)
  const isEthernetPortProfileEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_TOGGLE)

  const form = Form.useFormInstance()

  const [ softGREProfileOptionList, setSoftGREProfileOptionList] = useState<DefaultOptionType[]>([])
  const [ voteTallyBoard, setVoteTallyBoard ] = useState<VoteTallyBoard[]>([])
  const [ isTheOnlyVoter, setIsTheOnlyVoter] = useState<boolean>(false)
  const [ isBoundIpsec, setIsBoundIpsec] = useState<boolean>(false)

  const allowSoftGetGrePorfiles = !isTemplate
    && isEthernetSoftgreEnabled
    && isEthernetPortProfileEnabled

  const [ getSoftGreViewDataList ] = useLazyGetSoftGreViewDataListQuery()

  useEffect(() => {
    const setData = async () => {
      const softGreProfileList = ((allowSoftGetGrePorfiles) ?
        (await getSoftGreViewDataList({
          params,
          payload: {}
        }).unwrap()).data : [])
      if(softGreProfileList.length > 0) {
        setSoftGREProfileOptionList(softGreProfileList.map((softGreProfile) => {
          return { label: softGreProfile.name, value: softGreProfile.id }
        }))
        setVoteTallyBoard(softGreProfileList.map((softGreProfile) => {

          let vote = 0
          const activations = softGreProfile.activations?.filter(act=> act.venueId === venueId)
          const venueActivations = softGreProfile.venueActivations?.filter((venue) => {
            return venue.venueId === venueId
          }) ?? []
          const apActivations = softGreProfile.apActivations?.filter((ap) => {
            return ap.venueId === venueId
          }) ?? []
          vote = activations.length + venueActivations.length + apActivations.length
          const voters = [] as Voter[]
          venueActivations.forEach((venue) => {
            voters.push({
              model: venue.apModel,
              portId: String(venue.portId)
            })
          })
          apActivations.forEach((ap) => {
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
    } else if (isBoundIpsec) {
      console.log('Now is BoundIpsec') // eslint-disable-line no-console
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

  const addCandidate = async (
    index: string = '0',
    candidate: SoftGreOptionCandidate = {
      option: { label: '', value: '' },
      gatewayIps: []
    },
    voter: Voter = { portId: '0' }
  ) => {

    const deleted = deleteVoter(voteTallyBoard, voter)
    const { isFoundTheOnlyVoter } = findVoter(voter)
    const isLock = !!softGREProfileOptionList.find((option) => {
      return option.disabled === true
    }) && !isFoundTheOnlyVoter

    const profileId = String(candidate.option.value ?? '')

    setSoftGREProfileOptionList([...softGREProfileOptionList, {
      ...candidate.option,
      ...(isLock ? { disabled: true } : {})
    }])
    setVoteTallyBoard([...deleted, {
      softGreProfileId: profileId,
      name: candidate.option.label?.toString(),
      FQDNAddresses: candidate.gatewayIps,
      vote: (isLock ? 0 : 1),
      voters: (isLock ? [] : [voter])
    }])

    if (!isLock) {
      form.setFieldValue(['lan', index, 'softGreProfileId'], profileId)
      try {
        await form.validateFields()
      } catch (error) {// Leave blank }
        setIsTheOnlyVoter(isFoundTheOnlyVoter)
      }
    }
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
          setVoteTallyBoard(deleteVoter(voteTallyBoard, next.voter))
          break
        case SoftGreDuplicationChangeState.ResetToDefault:
          setVoteTallyBoard(deleteVoters(voteTallyBoard, next?.voters))
          break
        case SoftGreDuplicationChangeState.FindTheOnlyVoter:
          const { isFoundTheOnlyVoter } = findVoter(next.voter)
          setIsTheOnlyVoter(isFoundTheOnlyVoter)
          break
        case SoftGreDuplicationChangeState.ReloadOptionList:
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          addCandidate(next?.index, next?.candidate, next?.voter)
          break
        case SoftGreDuplicationChangeState.BoundIpSec:
          boundIpSec(next?.softGreProfileId)
          break
        case SoftGreDuplicationChangeState.UnboundIpSec:
          unboundIpSec()
          break
      }
      return next
    }

  const boundIpSec = (softGreProfileId?: string) => {
    setIsBoundIpsec(true)
    setSoftGREProfileOptionList(softGREProfileOptionList.map((option) => {
      if (option.value === softGreProfileId) {
        return { ...option, disabled: false }
      }
      return { ...option, disabled: true }
    }))
  }
  const unboundIpSec = () => {
    setIsBoundIpsec(false)
    setSoftGREProfileOptionList(softGREProfileOptionList.map((option) => {
      return { ...option, disabled: false }
    }))
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
