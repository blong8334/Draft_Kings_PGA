const { getStats, getPlayerZscores } = require('./playerStatsAndScores');
const fs = require('fs');

// getPlayerZscores(statids)
// .then(res => {
//   // console.log(res);
//   // return;
//   var mootzie = artificialVarTableauMaker(res, cap, totalPlayerCount);
//   // var solCols = findSolutionCols(mootzie[0]);
//   // console.log('sol cols: ', solCols.length);
//   // console.log('tableau length: ', mootzie.length);
//   var actualObj = mootzie[1];
//   var phase1 = simplexSolver(mootzie[0]);
//   // remove second to last column for every row.
//   var popped = removeArtificial(phase1);
//   // put back original objective function.
//   // put lp in canonical form.
//   var phase2 = putBackObjAndConvertToCanonical(popped, actualObj);
//   // send it to simplex solver.
//   var result = simplexSolver(phase2);
//   // console.log(findSolutionCols(result));
//   var sol = findSolutionCols(result);
//   console.log('sol: ', sol);
//   printWinners(result, sol, res);
//   printTableau(result, 'previous.txt');
// })
// .catch(err => {
//   console.error(err);
// });
var simplexer = function(res, cap, totalPlayerCount) {
  // console.log(res);
  // return;
  var mootzie = artificialVarTableauMaker(res, cap, totalPlayerCount);
  // var solCols = findSolutionCols(mootzie[0]);
  // console.log('sol cols: ', solCols.length);
  // console.log('tableau length: ', mootzie.length);
  var actualObj = mootzie[1];
  var phase1 = simplexSolver(mootzie[0]);
  // remove second to last column for every row.
  if (! phase1) {
    return;
  }
  var popped = removeArtificial(phase1);
  // put back original objective function.
  // put lp in canonical form.
  var phase2 = putBackObjAndConvertToCanonical(popped, actualObj);
  // send it to simplex solver.
  var result = simplexSolver(phase2);
  if (! result) {
    return;
  }
  // console.log(findSolutionCols(result));
  var sol = findSolutionCols(result);
  // console.log('sol: ', sol);
  var zScore = printWinners(result, sol, res);
  // printTableau(result, 'previous.txt');
  return zScore;
}
function printWinners (result, sol, res) {
  var sal = 0;
  var totalZScore = 0;
  // console.log('sol ', res);
  for (var i = 1; i < sol.length; i++) {
    var curr = sol[i];
    if (curr[1] > res.length) {
      break;
    }

    sal += res[curr[1]-1].salary * result[curr[0]][result[i].length - 1];
    totalZScore += res[curr[1]-1].zscore * result[curr[0]][result[i].length - 1];
    // console.log('name: ', res[curr[1]-1]);
    // console.log('Amount: ', result[curr[0]][result[i].length - 1]);
    // console.log('total sal: ', sal);
  }
  // console.log(totalZScore);
  return totalZScore;
}
function putBackObjAndConvertToCanonical(tableau, actualObj) {
  var solCols = findSolutionCols(tableau);
  // console.log('actual obj: ', actualObj);
  // return;
  for (var i = 0; i < actualObj.length; i++) {
    tableau[0][1 + i] = actualObj[i];
  }
  // printTableau(tableau, 'previous.txt');
  // return;
  // console.log('sol cols: ', solCols.length);
  // console.log('tableau length: ', tableau.length);
  for (var i = 0; i < solCols.length; i++) {
    tableau = rowReducer(tableau, solCols[i][0], solCols[i][1]);
  }
  // console.log(findSolutionCols(tableau).length);
  return tableau;
}
function findSolutionCols (tableau) {
  var solCols = [];
  // cols
  for (var i = 0; i < tableau[0].length; i++) {
    var nonZeroCount = 0;
    var solRowCol;
    // rows
    for (var j = 0; j < tableau.length; j++) {
      if (tableau[j][i] !== 0) {
        nonZeroCount ++;
        if (nonZeroCount > 1) {
          break;
        }
        if (tableau[j][i] === 1) {
          solRowCol = [j, i];
        }
      }
    }
    if (nonZeroCount === 1) {
      solCols.push(solRowCol)
    }
  }
  return solCols;
}
function removeArtificial (tableau) {
  for (var i = 0; i < tableau.length; i++) {
    var end = tableau[i].pop();
    tableau[i].pop();
    tableau[i].push(end);
  }
  return tableau;
}
var count = 0;
function simplexSolver (tableau) {
  // the first thing we need to do is check if we are done or not.
  // since we are just solving the artifical tableau, we
  // go until you find the optimal solution.

  // first step is to check the next col for the entering variable.
  // if there is no entering varible, the solution is optimal.
  // then find the exiting variable.
  // if there is no exiting variable, the solutin is unbounded from above.

  // otherwise run the simplex alg and recursivle call with updated tableau.

  // var count = 0;
  // while (true) {

    // console.log('entering!');
    // var cols = findSolutionCols(tableau);
    // console.log('length: ', cols.length);
    // printTableau(tableau, 'previous.txt');

    count ++;

    // console.log('count: ', count);
    // if (count === 15) {
    //   printTableau(tableau, 'previous.txt');
    //   // console.log(cols);
    // }
    var enteringVarCol = enteringCol(tableau);
    // console.log('entering col: ', enteringVarCol);
    if (! enteringVarCol) {
      // printTableau(tableau, 'next.txt');
      // console.log('Optimal solution found! Iterations: ', count);
      return tableau;
    }
    var exitingVarRow = exitingRow(tableau, enteringVarCol);
    // console.log('exiting row: ', exitingVarRow);
    if (! exitingVarRow) {
      // printTableau(tableau, 'next.txt');
      console.log('Problem unbounded from above!');
      return;
    }
    tableau = rowReducer(tableau, exitingVarRow, enteringVarCol);
    // console.log('moving on!');
    // cols = findSolutionCols(tableau);
    // if (count === 15) {
    //   printTableau(tableau, 'next.txt');
    //   // console.log(cols);
    //   break;
    // }

  // }
  return simplexSolver(tableau);
}
function rowReducer (tableau, exitingVarRow, enteringVarCol) {
  // for each row, find the mx for that row to get the col to 0.
  for (var i = 0; i < tableau.length; i++) {
    // console.log('working!')
    if (i === exitingVarRow) {
      continue;
    }
    if (tableau[i][enteringVarCol] === 0) {
      continue;
    }
    // console.log('i, col: ', tableau[i][enteringVarCol]);
    // console.log('exit, enter: ', tableau[exitingVarRow][enteringVarCol]);
    var rowMx = -1 * (tableau[i][enteringVarCol] / tableau[exitingVarRow][enteringVarCol]);
    // console.log('rowMx ', rowMx);
    // console.log('tableau[i].length ', tableau[i].length);
    for (var j = 0; j < tableau[i].length; j++) {
      // console.log('inside j for! ', j);
      tableau[i][j] += tableau[exitingVarRow][j] * rowMx;
      if (j === enteringVarCol) {
        tableau[i][j] = 0;
        // console.log('tableau[i][j] ', tableau[i][j] === 0);
      }
    }
  }
  // need to convert entering var to 1;
  // console.log('value: ', tableau[exitingVarRow][enteringVarCol] === 1);
  if (tableau[exitingVarRow][enteringVarCol] !== 1) {
    var div = tableau[exitingVarRow][enteringVarCol];
    for (var i = 0; i < tableau[exitingVarRow].length; i++) {

      tableau[exitingVarRow][i] /= div;
    }
  }
  return tableau;
}
function exitingRow (tableau, enteringVarCol) {
  // start at row 1, go to the end.
  // min ratio > 0 is the exiting row.
  var minRatio;
  var minRatioRow;
  var currRow = 1;
  var end = tableau.length - 1;
  var endCol = tableau[0].length - 1;

  while (currRow <= end) {
    if (tableau[currRow][endCol] > 0) {
      var currRatio = tableau[currRow][endCol] / tableau[currRow][enteringVarCol];
      if (currRatio > 0 && ! minRatio) {
        minRatio = currRatio;
        minRatioRow = currRow;
      } else if (currRatio > 0 && currRatio < minRatio) {
        minRatio = currRatio;
        minRatioRow = currRow;
      }
    }
    currRow ++;
  }
  return minRatioRow;
}
function enteringCol (tableau) {
  // start at col 1, end at second to last col.
  var currInd = 1;
  var end = tableau[0].length - 2;

  while (currInd <= end) {
    // console.log('Col Value: ', tableau[0][currInd]);
    if (tableau[0][currInd] > 0) {
      return currInd;
    }
    currInd ++;
  }
}
function artificialVarTableauMaker (obj, cap, totalPlayerCount) {
  var tableau = tableauTemplate(obj);
  // the first 3 rows can be created together
  // we need to set up the problem knowing you have an artifical variable.
  //   otherwise we are just wasting time really.
  // first row has a 1 in first col, -1 in 2nd to last col and 0 in last.
  var colCount = tableau[0].length - 1;
  var actualObjective = [];
  tableau[0][0] = 1; tableau[0][colCount - 1] = -1;
  //second and third rows, two main constraints
  // row two are the costs and s1

  // now create x + s <= 1 constraints
  var xsRow = 3;
  var xCol = 1;
  var sCol = obj.length + 2;
  // console.log(obj.length);
  for (var i = 0; i < obj.length; i++) {
    // value
    // console.log(obj[i]);
    actualObjective[i] = obj[i].zscore;
    // console.log();
    // salaries
    tableau[1][i + 1] = obj[i].salary;
    // player count
    tableau[2][i + 1] = 1;
    // x
    tableau[xsRow + i][xCol + i] = 1;
    // s
    tableau[xsRow + i][sCol + i] = 1;
    // RHS
    tableau[xsRow + i][colCount] = 1;

  }
  // end of rows's 2 and 3.
  // row 2 s and RHS
  tableau[1][obj.length + 1] = 1; tableau[1][colCount] = cap;
  // row 3 a and RHS
  tableau[2][colCount - 1] = 1; tableau[2][colCount] = totalPlayerCount;

  // add row three to row 1.
  for (var i = 0; i < tableau[0].length; i++) {
    tableau[0][i] += tableau[2][i];
  }
  return [tableau, actualObjective];

}
function tableauTemplate (obj) {
  // Z, X's..., S's..., A 's..., RHS's
  // S's = x.length;
  // rows: obj + 2 main constraints + x's <= 1 constaints = 1 + 2 + res.length
  // cols: Z + all the x's + all the s's + 1 a + RHS = 1 + x.length + 1 (s for salary constraint) + x.length (s's for x's) + 1 + 1

  // create the rows
  var tableau = new Array(obj.length + 3);

  for (var i = 0; i < tableau.length; i++) {
    tableau[i] = new Array(obj.length * 2 + 4);
    tableau[i].fill(0);
  }

  // console.log(tableau);
  return tableau;
}
function printTableau (tableau, file) {
  var str = '';
  for (var i = 0; i < tableau.length; i++) {
    var rowStr = ''
    for (var j = 0; j < tableau[i].length; j++) {
      // add ' ' until length  is 6.
      var curr = (Math.round(tableau[i][j]*100)/100).toString();
      var lengthToAdd = 5 - curr.length;
      if (lengthToAdd < 0) {
        lengthToAdd = 0;
      }
      // console.log(curr.length);
      var toAdd = new Array(lengthToAdd).join(' ');
      curr = toAdd + curr;
      rowStr += curr + ',';
    }
    str += rowStr + '\n';
  }
  fs.writeFile(__dirname+'/../dk_info/'+file, str, err => {
    if (err) {
      throw err;
    }
    console.log('saved');
  });
}
module.exports = {simplexer};
