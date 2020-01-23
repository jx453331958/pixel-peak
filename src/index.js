const fs = require("fs-extra");
const path = require("path");

const rets = fs.readFileSync(path.resolve("test", "generic_XY.txt"));
const dataList = rets
  .toString()
  .split("$peakList")[1]
  .split("\n")
  .slice(1);

const results = [];

dataList.forEach(item => {
  try {
    const arr = item.split(" ").filter(s => s !== "");
    if (!arr[4] || !arr[5]) return;
    results.push({
      hwhmX: arr[4],
      hwhmY: arr[5]
    });
  } catch (error) {
    console.error(error);
  }
});

console.log(results);
