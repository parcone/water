const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../frontend/src/assets/water/photos');
const output = path.join(__dirname, '../frontend/public/photos.json');

function getAllPngFiles(dir, base = 'src/assets/water/photos') {
  let results = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relPath = path.join(base, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        // 递归处理子目录
        results = results.concat(getAllPngFiles(fullPath, relPath));
      } else if (item.toLowerCase().endsWith('.png')) {
        // 只添加PNG文件
        results.push({
          path: item, // 只存文件名，保证前端100%匹配
          filename: item,
          fullPath: fullPath
        });
      }
    });
  } catch (error) {
    console.error(`读取目录失败: ${dir}`, error.message);
  }
  
  return results;
}

try {
  const allPngs = getAllPngFiles(rootDir);
  
  // 按文件名排序（通常是按日期）
  allPngs.sort((a, b) => a.filename.localeCompare(b.filename));
  
  // 添加时间信息（从文件名解析）
  const photosWithTime = allPngs.map((photo, index) => {
    // 从路径中提取年月日信息
    const pathParts = photo.path.split('/');
    const year = pathParts[2]; // photos1/2025/01/SSM_20250201.png
    const month = pathParts[3];
    
    // 从文件名中提取日期信息
    const dateMatch = photo.filename.match(/(\d{4})(\d{2})(\d{2})/);
    let date = '';
    if (dateMatch) {
      date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    
    return {
      ...photo,
      index,
      year,
      month,
      date,
      displayName: date || photo.filename
    };
  });
  
  fs.writeFileSync(output, JSON.stringify(photosWithTime, null, 2));
  console.log(`✅ 成功生成图片路径文件: ${output}`);
  console.log(`📊 共找到 ${photosWithTime.length} 张PNG图片`);
  
  // 显示一些示例
  if (photosWithTime.length > 0) {
    console.log('\n📋 示例图片:');
    photosWithTime.slice(0, 5).forEach(photo => {
      console.log(`  - ${photo.path} (${photo.date})`);
    });
  }
  
} catch (error) {
  console.error('❌ 生成图片路径文件失败:', error.message);
} 