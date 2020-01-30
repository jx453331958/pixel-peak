/**
 * TODO LIST
 * 1. 输出到out目录
 * 2. 输出的文件打时间戳
 * 3. 读取目录下全部源数据文件
 * 4. 异步任务
 * 5. 输出平均值
 */
const fs = require("fs-extra");
const path = require("path");
const { evaluate, chain, round } = require("mathjs");
const dayjs = require('dayjs');
const mkdirp = require('mkdirp');
const xlsx = require('xlsx');

const now = Date.now();

const dirTimestamp = dayjs(now).format('YYYYMMDD-HHmmss');

const outDirPath = mkdirp.sync(`out_${dirTimestamp}`);

const allFiles = fs
  .readdirSync(path.resolve('./generic-files'))
  .filter(name => !name.includes(".js"));

allFiles.forEach(file => {
  const timestamp = dayjs(Date.now()).format('YYYYMMDD-HHmmss');
  
  const fileName = file.split('.')[0];
  const rets = fs.readFileSync(path.resolve('./generic-files', file), {
    encoding: "utf-8"
  });
  const dataList = rets
    .toString()
    .split("$peakList")[1]
    .split("\n")
    .slice(1);

  const results = [];
  let multiplySum = 0;
  let totalSum = 0;

  dataList.forEach(item => {
    try {
      const arr = item.split(" ").filter(s => s !== "");

      const hwhmX = arr[4];
      const hwhmY = arr[5];

      if (!hwhmX || !hwhmY) return;

      const multiply = round(chain(hwhmX).multiply(hwhmY).done(), 5);
      const sum = round(chain(hwhmX).add(hwhmY).done(), 5)

      multiplySum += multiply;
      totalSum += sum;

      results.push({
        hwhmX,
        hwhmY,
        multiply,
        sum
      });
    } catch (error) {
      console.error(error);
    }
  });

  results.push({
    multiplyAvg: multiplySum / results.length,
    sumAvg: totalSum / results.length
  })
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.json_to_sheet(results);
  xlsx.utils.book_append_sheet(wb, ws, '123');

  xlsx.writeFile(wb, path.join(outDirPath, `${fileName}_${timestamp}.xlsx`));
});

// 获取路径下所有的文件夹名称
function getAllDirNameSync(dirPath, options) {
  return fs.readdirSync(dirPath, options).filter(dirName => {
    return (
      isDirectory(path.resolve(dirPath, dirName)) && !isNodeModules(dirName)
    );
  });
}

function isDirectory(dirPath) {
  return fs.lstatSync(dirPath).isDirectory();
}

function isNodeModules(dirPath) {
  return dirPath === "node_modules" || getFileName(dirPath) === "node_mudules";
}

function getFileName(filePath) {
  return path.basename(filePath);
}
