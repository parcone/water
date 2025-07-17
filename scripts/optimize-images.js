const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const inputDir = path.join(__dirname, '../frontend/src/assets/water/photos')
const outputDir = path.join(__dirname, '../frontend/src/assets/water/optimized')

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

function optimizeImages() {
  const files = fs.readdirSync(inputDir)
  
  files.forEach(file => {
    if (file.match(/\.(png|jpg|jpeg)$/i)) {
      const inputPath = path.join(inputDir, file)
      const outputPath = path.join(outputDir, file)

      sharp(inputPath)
        .resize({ width: 1200, withoutEnlargement: true }) // 限制最大宽度
        .webp({ quality: 80 }) // 转换为WebP并压缩
        .toFile(outputPath)
        .then(() => {
          console.log(`优化完成: ${file}`)
        })
        .catch(err => {
          console.error(`优化失败: ${file}`, err)
        })
    }
  })
}

optimizeImages() 