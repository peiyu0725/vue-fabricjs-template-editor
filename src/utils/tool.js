import { VIDEOTYPE, IMAGETYPE } from '@/utils/variable'

export function base64ToByteArray (b64Data, sliceSize = 512) {
  sliceSize = sliceSize || 512
  const byteCharacters = atob(b64Data)
  const byteArrays = []
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  return byteArrays
}

function getBase64RealData (base64) {
  const realData = base64.split(';')[1].split(',')[1]
  return realData
}

function getBase64ContentType (base64) {
  const realData = base64.split(';')[0].split(':')[1]
  return realData
}

export function base64ToBlob (base64, sliceSize = 512) {
  const realData = getBase64RealData(base64)
  const contentType = getBase64ContentType(base64)
  const byteArrays = base64ToByteArray(realData, sliceSize)
  const blob = new Blob(byteArrays, { type: contentType })
  return blob
}

export function base64ToFile (base64, name = '', sliceSize = 512) {
  const realData = getBase64RealData(base64)
  const contentType = getBase64ContentType(base64)
  const byteArrays = base64ToByteArray(realData, sliceSize)
  const file = new File(byteArrays, name, { type: contentType })
  return file
}
export function checkEvenNum (val) {
  const value = String(val).split('.')
  if (Number(value[0]) % 2 === 0) {
    return Math.floor(val)
  } else {
    return Math.ceil(val)
  }
}

export function checkFourNum (val) {
  const value = String(val).split('.')
  if (Number(value[0]) % 4 === 0) {
    return Number(value[0])
  } else if (Math.round(val) % 4 === 0) {
    return Math.round(val)
  } else {
    return Number(value[0]) - Number(value[0]) % 4
  }
}

export function floorRound (val) {
  return Math.round(val * 100) / 100
}

export function downloadFile (uri, name) {
  var link = document.createElement('a')
  link.download = name
  link.href = uri
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function stringUpperCase (str) {
  const tmpChar = str.substring(0, 1).toUpperCase()
  const postString = str.substring(1, str.length)
  return tmpChar + postString
}

export function isVideo (name) {
  return name.match(new RegExp(VIDEOTYPE.join('|'), 'g'))
}

export function isImage (name) {
  return name.match(new RegExp(IMAGETYPE.join('|'), 'g'))
}
