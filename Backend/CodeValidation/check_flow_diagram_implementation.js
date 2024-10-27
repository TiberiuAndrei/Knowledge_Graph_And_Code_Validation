import fs from "fs"

// codeFilePath will be received as parameter when moving from PoC to Prodduction
const codeFilePath = 'FtAxlCan_Main_dbzcf_cc.c';

const text = fs.readFileSync(codeFilePath).toString();

const ifMatches = text.matchAll(/if[\s]*?\(.*/g);
let ifMatchData = [];
for (const ifMatch of ifMatches) {
    ifMatchData.push({index: ifMatch.index, text: ifMatch['0']});
}

const getAllIndexes = (text, character) => {
    let indexArray = [];
    let lastIndex = -1;
    do {
        lastIndex = text.indexOf(character, lastIndex + 1)
        indexArray.push(lastIndex);
    }
    while (lastIndex != -1);
    indexArray.pop();
    return indexArray;
}

const openBracketIndexArray = getAllIndexes(text, '{');
const closeBracketIndexArray = getAllIndexes(text, '}');

const makeBracketPairs = (openBracketIndexArray, closeBracketIndexArray) => {
    let bracketPairs = {};
    let openBracketIterator = 0;
    let closeBracketIterator = 0;
    let queue = [];
    while (openBracketIterator < openBracketIndexArray.length) {
        if (openBracketIndexArray[openBracketIterator] < closeBracketIndexArray[closeBracketIterator]) {
            queue.push(openBracketIndexArray[openBracketIterator])
            openBracketIterator = openBracketIterator + 1;
        }
        else {
            const lastElement = queue.pop();
            bracketPairs[lastElement] = closeBracketIndexArray[closeBracketIterator];
            closeBracketIterator = closeBracketIterator + 1;
        }
    }

    while (closeBracketIterator < closeBracketIndexArray.length) {
        const lastElement = queue.pop();
        bracketPairs[lastElement] = closeBracketIndexArray[closeBracketIterator];
        closeBracketIterator = closeBracketIterator + 1;
    }

    return bracketPairs;
}

const bracketPairs = makeBracketPairs(openBracketIndexArray, closeBracketIndexArray);

const getLeftRight = (ifMatchIndex) => {
    for (const key of Object.keys(bracketPairs)) {
        const numericKey = Number(key);
        if (numericKey > ifMatchIndex) {
            return ({newLeft: numericKey, newRight: bracketPairs[key]});
        }
    }
}

const reverseOperator = {}
reverseOperator['<'] = '>='; reverseOperator['>'] = '<=';
reverseOperator['<='] = '>'; reverseOperator['>='] = '<';

const reverseOperator2 = {}
reverseOperator2['<'] = '>'; reverseOperator2['>'] = '<';
reverseOperator2['<='] = '>='; reverseOperator2['>='] = '<=';

let ifIndex = 0;
let left = 0;
let right = text.length - 1;
const rootCondition = JSON.parse(fs.readFileSync('map.json').toString());

const matchCondition = (text, condition, reverse) => {
    let result = true;

    for (const arg of condition.Arg) {
        if (text.indexOf(arg) == -1) {
            result = false;
            break;
        }
    }

    if (condition.Type == "Comparison") {

        let operator = condition.Op;
        let operator2;
        if (reverse) {
            operator2 = reverseOperator2[operator];
            operator = reverseOperator[operator];
        }

        if (result == true && (text.indexOf(operator) == -1) && (text.indexOf(operator2) == -1)) {
            result = false;
        }
    }

    return result;
}

const elseDetection = (index) => {
    while(/\s/.test(text[index])) {
        index = index + 1;
    }
    if (index + 4 < text.length && text.substring(index, index + 4) == 'else') {
        return true;
    }
    return false;
}

const checkConditionChain = (condition, ifIndex, left, right) => {
    if(condition == undefined) {
        return;
    }

    if (ifIndex >= ifMatchData.length) {
        return;
    }

    while (left > ifMatchData[ifIndex].index) {
        checkConditionChain(condition, ifIndex + 1, left, right);
        ifIndex = ifIndex + 1;
    }

    if (ifMatchData[ifIndex].index > right) {
        return;
    }

    const conditionMatch = matchCondition(ifMatchData[ifIndex].text, condition, false);
    if (conditionMatch) {
        condition['Checked'] = true;
        let {newLeft, newRight} = getLeftRight(ifMatchData[ifIndex].index);
        checkConditionChain(condition.ChildrenTrue, ifIndex + 1, newLeft, newRight);

        const elseCheckStartingIndex = getLeftRight(ifMatchData[ifIndex].index).newRight + 1;
        if (elseDetection(elseCheckStartingIndex)) {
            let {newLeft, newRight} = getLeftRight(elseCheckStartingIndex);
            let x = text.substring(newLeft, newRight);
            checkConditionChain(condition.ChildrenFalse, ifIndex + 1, elseCheckStartingIndex, newRight);
        }
    }
    else {
        if (condition.Type == "Comparison") {
            const reverseConditionMatch = matchCondition(ifMatchData[ifIndex].text, condition, true);
            if (reverseConditionMatch) {
                condition['Checked'] = true;
                let {newLeft, newRight} = getLeftRight(ifMatchData[ifIndex].index);
                checkConditionChain(condition.ChildrenFalse, ifIndex + 1, newLeft, newRight);

                const elseCheckStartingIndex = getLeftRight(ifMatchData[ifIndex].index).newRight + 1;
                if (elseDetection(elseCheckStartingIndex)) {
                    let {newLeft, newRight} = getLeftRight(elseCheckStartingIndex);
                    let x = text.substring(newLeft, newRight);
                    checkConditionChain(condition.ChildrenTrue, ifIndex + 1, elseCheckStartingIndex, newRight);
                }
            }
            else {
                checkConditionChain(condition, ifIndex + 1, left, right);
            }
        }
        else {
            checkConditionChain(condition, ifIndex + 1, left, right);
        }
    }
}

const findMissingConditions = (condition) => {
    if (!condition) {
        return;
    }
    if (!condition.Checked) {
        if (condition.Type === "Comparison") {
            console.log(`Could not find ${condition.Arg[0]} ${condition.Op} ${condition.Arg[1]} at the expected scope in the code`);
        }
        else if (condition.Type === "Validation") {
            console.log(`Could not find ${condition.Arg[0]} at the expected scope in the code`);
        }
    }
    else {
        findMissingConditions(condition.ChildrenTrue);
        findMissingConditions(condition.ChildrenFalse);
    }
}

checkConditionChain(rootCondition, ifIndex, left, right);
findMissingConditions(rootCondition);