import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import numeral from 'numeral'

// 设置语言
dayjs.locale('zh-cn')

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化时间
 * @param {Date|string|number} date 日期
 * @param {string} format 格式
 * @returns {string} 格式化后的时间字符串
 */
export const formatTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 格式化数字
 * @param {number} number 数字
 * @param {string} format 格式
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (number, format = '0,0.00') => {
  if (number === undefined || number === null) return ''
  return numeral(number).format(format)
}

/**
 * 格式化百分比
 * @param {number} number 数字
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercent = (number, decimals = 2) => {
  if (number === undefined || number === null) return ''
  return `${(number * 100).toFixed(decimals)}%`
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * 格式化持续时间
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的持续时间
 */
export const formatDuration = (seconds) => {
  if (!seconds) return '0秒'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}秒`)

  return parts.join('')
}

/**
 * 格式化金额
 * @param {number} amount 金额
 * @param {string} currency 货币符号
 * @returns {string} 格式化后的金额
 */
export const formatCurrency = (amount, currency = '¥') => {
  if (amount === undefined || amount === null) return ''
  return `${currency} ${numeral(amount).format('0,0.00')}`
}

/**
 * 格式化手机号
 * @param {string} phone 手机号
 * @returns {string} 格式化后的手机号
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3')
}

/**
 * 格式化身份证号
 * @param {string} idCard 身份证号
 * @returns {string} 格式化后的身份证号
 */
export const formatIdCard = (idCard) => {
  if (!idCard) return ''
  return idCard.replace(/(\d{6})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4')
}

/**
 * 数字转中文
 * @param {number} num 数字
 * @returns {string} 中文数字
 */
export const numberToChinese = (num) => {
  const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['', '十', '百', '千', '万', '十万', '百万', '千万', '亿']
  const str = Math.floor(num).toString()
  const len = str.length
  let result = ''

  for (let i = 0; i < len; i++) {
    const n = parseInt(str[i])
    const unit = units[len - 1 - i]
    if (n === 0) {
      if (result.charAt(result.length - 1) !== chars[0]) {
        result += chars[0]
      }
    } else {
      result += chars[n] + unit
    }
  }

  result = result.replace(/零+$/, '')
  result = result.replace(/零+/g, '零')
  
  if (result.startsWith('一十')) {
    result = result.substring(1)
  }

  return result || '零'
} 