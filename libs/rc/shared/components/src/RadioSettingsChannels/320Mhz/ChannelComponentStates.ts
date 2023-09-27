import _ from 'lodash'

import { RadioChannel } from '../../RadioSettings/RadioSettingsContents'

import type { CheckboxValueType } from 'antd/es/checkbox/Group'

export const ChannelGroup160MHzModel = [
  { value: '15', selected: true },
  { value: '47', selected: true },
  { value: '79', selected: true },
  { value: '111', selected: true },
  { value: '143', selected: true },
  { value: '175', selected: true },
  { value: '205', selected: true }
]

export const filterUnselectedChannels = (channels: RadioChannel[]) : string [] => {
  const selectedChannels = [] as string[]
  channels.forEach((channel)=> {
    if (channel.selected === true) {
      selectedChannels.push(channel.value)
    }
  })
  return selectedChannels
}

/**
 * This function is used for SingleRadioSettings, SingleRadioSettings will only pass selected channels into function.
 *
 * it will find if the input channels has intersection with specific 160Mhz group(Which mean that group is selected),
 * and then it will pass the checked group into next function, findIsolatedGroup().
 *
 * @param selectedChannels String array that contains channels but not channel groups
 * @returns String array contains that 160Mhz checkbox were isolated
 */
export const findIsolatedGroupByChannel = (selectedChannels: string[]) => {
  let checkedGroup = [] as CheckboxValueType[]
  _.forIn(defaultStates.ChannelGroup_160MHz, (value, key) => {
    if(_.intersection(value.channels, selectedChannels).length > 0) {
      checkedGroup.push(key)
    }
  })
  return findIsolatedGroup(checkedGroup)
}

/**
 * Check if the adjunction checkbox is checked or not.
 *
 * The first element just needs to check the checkbox after it, the last is also same pattern.
 *
 * The element among the rest needs to check previous/next element are checked or not, it's isolated
 * when both element are not checked.
 *
 * It will return the value(which is, group key) if it's isolated, return 0 if it's adjuncted.
 * The array will filter out all the zero before return.
 *
 * @param checkedValues Selected 160Mhz checkbox, typically string array
 * @returns String array contains that 160Mhz checkbox were isolated
 */
export const findIsolatedGroup = (checkedValues: CheckboxValueType[]) => {
  const currentModel = ChannelGroup160MHzModel.map((channel) => {
    if (!checkedValues.includes(channel.value)){
      return { value: channel.value, selected: false }
    }
    return channel
  })

  return currentModel.map((element, index, array) => {
    const lastIndex = index - 1
    const nextIndex = index + 1

    if (element.selected === false) {
      return 0
    }

    if (index === 0) {
      return array[nextIndex].selected === false ? element.value : 0
    }

    if (index === array.length - 1) {
      return array[lastIndex].selected === false ? element.value : 0
    }

    if (array[nextIndex].selected === false && array[lastIndex].selected === false) {
      return element.value
    }
    return 0
  }).filter(element => element !== 0)
}


export enum ChannelGroup320MhzEnum {
  Group1,
  Group2
}

export enum ButtonDisplayStatusEnum {
  Display,
  Hide
}

type ChannelGroup = {
    [key: string]: {
        channels: string[];
        channel160Groups?: string[]
        isolated?: boolean
        group?: ChannelGroup320MhzEnum,
        display?: ButtonDisplayStatusEnum
    }
}

export interface ChannelGroupType {
    ChannelGroup_320MHz: ChannelGroup,
    ChannelGroup_160MHz: ChannelGroup
    enabledCheckbox: string[],
    getEnabledChannels: () => CheckboxValueType[]
}

/* eslint-disable max-len */
export const defaultStates : ChannelGroupType = {
  ChannelGroup_320MHz: {
    31: {
      channels: ['1', '5', '9', '13', '17', '21', '25', '29', '33', '37', '41', '45', '49', '53', '57', '61'],
      channel160Groups: ['15', '47'],
      group: ChannelGroup320MhzEnum.Group1,
      display: ButtonDisplayStatusEnum.Display
    },
    63: {
      channels: ['33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93'],
      channel160Groups: ['47', '79'],
      group: ChannelGroup320MhzEnum.Group2,
      display: ButtonDisplayStatusEnum.Display
    },
    95: {
      channels: ['65', '69', '73', '77', '81', '85', '89', '93', '97', '101', '105', '109', '113', '117', '121', '125'],
      channel160Groups: ['79', '111'],
      group: ChannelGroup320MhzEnum.Group1,
      display: ButtonDisplayStatusEnum.Display
    },
    127: {
      channels: ['97', '101', '105', '109', '113', '117', '121', '125', '129', '133', '137', '141', '145', '149', '153', '157'],
      channel160Groups: ['111', '143'],
      group: ChannelGroup320MhzEnum.Group2,
      display: ButtonDisplayStatusEnum.Display
    },
    159: {
      channels: ['129', '133', '137', '141', '145', '149', '153', '157', '161', '165', '169', '173', '177', '181', '185', '189'],
      channel160Groups: ['143', '175'],
      group: ChannelGroup320MhzEnum.Group1,
      display: ButtonDisplayStatusEnum.Display
    },
    191: {
      channels: ['161', '165', '169', '173', '177', '181', '185', '189', '193', '197', '201', '205', '209', '213', '217', '221'],
      channel160Groups: ['175', '205'],
      group: ChannelGroup320MhzEnum.Group2,
      display: ButtonDisplayStatusEnum.Display
    }
  },
  ChannelGroup_160MHz: {
    15: {
      channels: [ '1', '5', '9', '13', '17', '21', '25', '29'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    47: {
      channels: [ '33', '37', '41', '45', '49', '53', '57', '61'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    79: {
      channels: [ '65', '69', '73', '77', '81', '85', '89', '93'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    111: {
      channels: [ '97', '101', '105', '109', '113', '117', '121', '125'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    143: {
      channels: [ '129', '133', '137', '141', '145', '149', '153', '157'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    175: {
      channels: [ '161', '165', '169', '173', '177', '181', '185', '189'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    },
    205: {
      channels: [ '193', '197', '201', '205', '209', '213', '217', '221'],
      isolated: false,
      display: ButtonDisplayStatusEnum.Display
    }
  },
  // Control RadioSettingsChannels320Mhz checkbox displaying
  enabledCheckbox: ['15','47','79','111','143','175','205'],
  getEnabledChannels () : CheckboxValueType[] {
    let enabledChannels = [] as CheckboxValueType[]
    _.forIn(this.ChannelGroup_160MHz, (value, key) => {
      if(this.enabledCheckbox.includes(key)) {
        enabledChannels = enabledChannels.concat(value.channels)
      }
    })
    return enabledChannels
  }
}
