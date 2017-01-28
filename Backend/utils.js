function comboCalc (arr, count) {
  if(count > arr.length || count < 0) return;
  let comboArr = [];
  comboHelper(arr, []);
  return comboArr;
  function comboHelper(arr, currList) {
      if (currList.length == count) {
        comboArr.push(currList);
        return;
      }
      if (currList.length + arr.length < count) return;
      let notAdded = currList.slice(0);
      let addedArr = currList.slice(0);
      addedArr.push(arr[0]);
      let newArr = arr.slice(1);
      comboHelper(newArr, addedArr);
      comboHelper(newArr, notAdded);
  }
}
function allCombos (arr, maxLength) {
  let retArr = [];
  for (let i = 1; i <= maxLength; i++) {
    let temp = comboCalc(arr, i);
    retArr.push(...temp);
  }
  return retArr
}

let x = allCombos([1,2,3,4, 5, 6], 5);
console.log(x);
console.log(x.length);

module.exports = {allCombos, comboCalc};
