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

const allFiles = fs
  .readdirSync(__dirname)
  .filter(name => !name.includes(".js"));

allFiles.forEach(file => {
  const rets = fs.readFileSync(path.resolve(__dirname, file), {
    encoding: "utf-8"
  });
  const dataList = rets
    .toString()
    .split("$peakList")[1]
    .split("\n")
    .slice(1);

  const results = [];

  dataList.forEach(item => {
    try {
      const arr = item.split(" ").filter(s => s !== "");

      const hwhmX = arr[4];
      const hwhmY = arr[5];

      if (!hwhmX || !hwhmY) return;
      results.push({
        hwhmX,
        hwhmY,
        multiply: round(chain(hwhmX).multiply(hwhmY).done(), 5),
        sum: round(chain(hwhmX).add(hwhmY).done(), 5)
      });
    } catch (error) {
      console.error(error);
    }
  });

  console.log(results);
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
