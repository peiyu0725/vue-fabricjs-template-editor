export const CUSTOM_FABRIC_ATTRS = [
  'selectable',
  'name',
  'sourceNum',
  'sourceInput',
  'cropObj',
  'lastScreenLeft',
  'lastScreenTop',
  'lastScreenScaleX',
  'lastScreenScaleY',
  'ampm',
  'timeFormat',
  'timeFormatVal',
  'hasControls',
  'editable',
  'ratio',
  'ratioMode',
  'originWidth',
  'originHeight',
  'evented',
  'locked'
]

export const TIME_FORMAT = [
  { text: 'YYYY/MM/DD HH:mm:ss', value: 0 },
  { text: 'MM/DD/YYYY HH:mm:ss', value: 1 },
  { text: 'YYYY/MM/DD', value: 2 },
  { text: 'MM/DD/YYYY', value: 3 },
  { text: 'MM/DD', value: 4 },
  { text: 'HH:mm:ss', value: 5 }
]

export const LAYER_NAME = {
  text: {
    title: 'Text',
    icon: 'mdi-format-text'
  },
  rect: {
    title: 'Rect',
    icon: 'mdi-square-outline'
  },
  time: {
    title: 'Time',
    icon: 'mdi-clock-outline'
  },
  image: {
    title: 'Image',
    icon: 'mdi-image'
  },
  sourceGroup: {
    title: 'Screen Group',
    icon: 'source'
  },
  source: {
    title: 'Source',
    icon: 'source'
  },
  background: {
    title: 'Background',
    icon: 'mdi-format-wrap-square'
  },
  backgroundImage: {
    title: 'Background Image',
    icon: 'mdi-format-wrap-square'
  },
  backgroundColor: {
    title: 'Background Color',
    icon: 'mdi-square'
  }
}
