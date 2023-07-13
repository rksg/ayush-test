import _ from 'lodash'

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

export const findIsolatedGroupByChannel = (selectedChannels: string[]) => {
  let checkedGroup = [] as CheckboxValueType[]
  _.forIn(defaultStates.ChannelGroup_160MHz, (value, key) => {
    if(_.intersection(value.channels, selectedChannels).length > 0) {
      checkedGroup.push(key)
    }
  })
  return findIsolatedGroup(checkedGroup)
}

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

type ChannelGroup = {
    [key: string]: {
        channels: string[];
        channel160Groups?: string[]
        isolated?: boolean
        group?: ChannelGroup320MhzEnum
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
      group: ChannelGroup320MhzEnum.Group1
    },
    63: {
      channels: ['33', '37', '41', '45', '49', '53', '57', '61', '65', '69', '73', '77', '81', '85', '89', '93'],
      channel160Groups: ['47', '79'],
      group: ChannelGroup320MhzEnum.Group2
    },
    95: {
      channels: ['65', '69', '73', '77', '81', '85', '89', '93', '97', '101', '105', '109', '113', '117', '121', '125'],
      channel160Groups: ['79', '111'],
      group: ChannelGroup320MhzEnum.Group1
    },
    127: {
      channels: ['97', '101', '105', '109', '113', '117', '121', '125', '129', '133', '137', '141', '145', '149', '153', '157'],
      channel160Groups: ['111', '143'],
      group: ChannelGroup320MhzEnum.Group2
    },
    159: {
      channels: ['129', '133', '137', '141', '145', '149', '153', '157', '161', '165', '169', '173', '177', '181', '185', '189'],
      channel160Groups: ['143', '175'],
      group: ChannelGroup320MhzEnum.Group1
    },
    191: {
      channels: ['161', '165', '169', '173', '177', '181', '185', '189', '193', '197', '201', '205', '209', '213', '217', '221'],
      channel160Groups: ['175', '205'],
      group: ChannelGroup320MhzEnum.Group2
    }
  },
  ChannelGroup_160MHz: {
    15: {
      channels: [ '1', '5', '9', '13', '17', '21', '25', '29'],
      isolated: false
    },
    47: {
      channels: [ '33', '37', '41', '45', '49', '53', '57', '61'],
      isolated: false
    },
    79: {
      channels: [ '65', '69', '73', '77', '81', '85', '89', '93'],
      isolated: false
    },
    111: {
      channels: [ '97', '101', '105', '109', '113', '117', '121', '125'],
      isolated: false
    },
    143: {
      channels: [ '129', '133', '137', '141', '145', '149', '153', '157'],
      isolated: false
    },
    175: {
      channels: [ '161', '165', '169', '173', '177', '181', '185', '189'],
      isolated: false
    },
    205: {
      channels: [ '193', '197', '201', '205', '209', '213', '217', '221'],
      isolated: false
    }
  },
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

export const testingData = [
  { value: '1', selected: true },
  { value: '5', selected: true },
  { value: '9', selected: true },
  { value: '13', selected: true },
  { value: '17', selected: true },
  { value: '21', selected: true },
  { value: '25', selected: true },
  { value: '29', selected: true },
  { value: '33', selected: true },
  { value: '37', selected: true },
  { value: '41', selected: true },
  { value: '45', selected: true },
  { value: '49', selected: true },
  { value: '53', selected: true },
  { value: '57', selected: true },
  { value: '61', selected: true },
  { value: '65', selected: true },
  { value: '69', selected: true },
  { value: '73', selected: true },
  { value: '77', selected: true },
  { value: '81', selected: true },
  { value: '85', selected: true },
  { value: '89', selected: true },
  { value: '93', selected: true },
  { value: '97', selected: true },
  { value: '101', selected: true },
  { value: '105', selected: true },
  { value: '109', selected: true },
  { value: '113', selected: true },
  { value: '117', selected: false },
  { value: '121', selected: false },
  { value: '125', selected: false },
  { value: '129', selected: false },
  { value: '133', selected: false },
  { value: '137', selected: false },
  { value: '141', selected: false },
  { value: '145', selected: false },
  { value: '149', selected: false },
  { value: '153', selected: false },
  { value: '157', selected: false },
  { value: '161', selected: false },
  { value: '165', selected: false }
  // { value: '169', selected: true },
  // { value: '173', selected: true },
  // { value: '177', selected: true },
  // { value: '181', selected: true },
  // { value: '185', selected: true },
  // { value: '189', selected: true },
  // { value: '193', selected: true },
  // { value: '197', selected: true },
  // { value: '201', selected: true },
  // { value: '205', selected: true },
  // { value: '209', selected: true },
  // { value: '213', selected: true },
  // { value: '217', selected: true },
  // { value: '221', selected: true }
]