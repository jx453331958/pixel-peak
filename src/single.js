/**
 * 读取generic_XY.txt，单个处理
 */
const fs = require("fs-extra");
const path = require("path");
const { evaluate, chain, round } = require("mathjs");
const dayjs = require("dayjs");
const mkdirp = require("mkdirp");
const xlsx = require("xlsx");

const now = Date.now();
const cwd = process.cwd();

const dirTimestamp = dayjs(now).format("YYYYMMDD-HHmmss");

const outDirPath = mkdirp.sync(path.resolve(cwd, `out_${dirTimestamp}`));

const timestamp = dayjs(Date.now()).format("YYYYMMDD-HHmmss");

const fileName = 'generic_XY'
const rets = fs.readFileSync(path.resolve(cwd, 'generic_XY.txt'), {
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

    const multiply = round(
      chain(hwhmX)
        .multiply(hwhmY)
        .done(),
      5
    );
    const sum = round(
      chain(hwhmX)
        .add(hwhmY)
        .done(),
      5
    );

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
});
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(results);
xlsx.utils.book_append_sheet(wb, ws, "123");

xlsx.writeFile(wb, path.join(outDirPath, `${fileName}_${timestamp}.xlsx`));

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
