export const sampleData = {
  nodes: [
    { name: 'AP', value: 5, category: 'center', key: 'AP' },
    { name: 'Non-Interfering AP', value: 12, category: 'non-interfering', key: '12' },
    { name: 'Co-Channel Interfering AP', value: 5, category: 'co-channel', key: '5' },
    { name: 'Rogue AP', value: 10, category: 'rogue', key: '10' }
  ],
  links: [
    { source: 'AP', target: 'Non-Interfering AP' },
    { source: 'AP', target: 'Co-Channel Interfering AP' },
    { source: 'AP', target: 'Rogue AP' }
  ]
}

export const nodeSize = {
  max: 150,
  min: 20
}
