export default [
  {
    id: 'default_section',
    type: 'section',
    hasTab: false,
    groups: [{
      id: 'default_group',
      sectionId: 'default_section',
      type: 'group',
      cards: [
        {
          id: 0,
          gridx: 0,
          gridy: 0,
          width: 1,
          height: 4,
          type: 'card',
          isShadow: false,
          currentSizeIndex: 0,
          sizes: [
            {
              width: 1,
              height: 4
            },
            {
              width: 2,
              height: 6
            },
            {
              width: 4,
              height: 9
            }
          ]
        },
        {
          id: 102,
          gridx: 1,
          gridy: 0,
          width: 1,
          height: 6,
          type: 'card',
          isShadow: false
        },
        {
          id: 100,
          gridx: 2,
          gridy: 0,
          width: 1,
          height: 4,
          type: 'card',
          isShadow: false
        }
      ]
    }]
  }
  // {
  //   id: 'a2',
  //   type: 'section',
  //   hasTab: true,
  //   groups: [
  //     {
  //       id: 1,
  //       sectionId: 'a2',
  //       type: 'group',
  //       tabLabel: 'Wi-Fi',
  //       tabValue: 'ap',
  //       defaultTab: true,
  //       cards: [
  //         {
  //           id: 101,
  //           gridx: 0,
  //           gridy: 0,
  //           width: 2,
  //           height: 5,
  //           type: 'card',
  //           isShadow: false,
  //         }
  //       ]
  //     },
  //     {
  //       id: 2,
  //       sectionId: 'a2',
  //       type: 'group',
  //       tabLabel: 'Switch',
  //       tabValue: 'switch',
  //       defaultTab: false,
  //       cards: [
  //         {
  //           id: 104,
  //           gridx: 0,
  //           gridy: 0,
  //           width: 1,
  //           height: 5,
  //           type: 'card',
  //           isShadow: false,
  //         }
  //       ]
  //     }
  //   ]
  // }
]