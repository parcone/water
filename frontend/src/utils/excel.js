import * as XLSX from 'xlsx'

/**
 * 导出数据到Excel文件
 * @param {Array} header 表头
 * @param {Array} data 数据
 * @param {string} filename 文件名
 */
export const exportToExcel = (header, data, filename) => {
  const ws = XLSX.utils.aoa_to_sheet([header, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  
  // 设置列宽
  const colWidth = header.map(() => ({ wch: 15 }))
  ws['!cols'] = colWidth

  // 导出文件
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * 从Excel文件导入数据
 * @param {File} file Excel文件
 * @returns {Promise<Array>} 解析后的数据
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 })
        resolve(data)
      } catch (error) {
        reject(new Error('Excel文件解析失败'))
      }
    }
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    reader.readAsBinaryString(file)
  })
}

/**
 * 验证Excel文件格式
 * @param {File} file 文件对象
 * @returns {boolean} 是否为有效的Excel文件
 */
export const validateExcelFile = (file) => {
  const types = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return types.includes(file.type)
}

/**
 * 格式化Excel单元格数据
 * @param {*} value 单元格值
 * @param {string} type 期望的数据类型
 * @returns {*} 格式化后的值
 */
export const formatExcelCell = (value, type) => {
  if (value === null || value === undefined) return ''
  
  switch (type) {
    case 'number':
      return isNaN(Number(value)) ? 0 : Number(value)
    case 'date':
      return value instanceof Date ? value : new Date(value)
    case 'boolean':
      return Boolean(value)
    default:
      return String(value)
  }
} 