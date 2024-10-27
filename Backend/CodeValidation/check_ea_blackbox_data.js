import fs from "fs"
import {getBlackBoxes} from "../EA/extract-blackbox-data.js"

const count = {};

// blackboxFilePath & blackboxFileName will be received as parameters when moving from PoC to Prodduction
const blackboxFilePath = "../EA/Blackbox FrontAxleCan.xmi";
const blackboxName = "Blackbox FrontAxleCan";

// for Production, inputFileNames will be obtained by reading the files that end with '.c' in a target folder.
// for example:
// fileNames = fs.readdirSync(__dirname);
// for (const fileName of fileNames) {
//    if (fileName.endsWith('.c')) {
//      inputFileNames.append(fileName);
//    }
// }
const inputFileNames = ['FtAxlCan_Main_dbzcf_cc.c', 'FtAxlCan_Plausi_dbzcf_cc.c'];
const numberOfFiles = inputFileNames.length;
const solve = (inputFile) => {
    const text = fs.readFileSync(inputFile).toString();

    const blackBoxData = getBlackBoxes(blackboxFilePath)[blackboxName];

    const tryFindValue = (value) => {
        const matches = text.match(value);
        if (!matches) {
            return false;
        }
        return true;
    }


    const missingValues = [];
    const matchesArray = [];
    for (const key of Object.keys(blackBoxData)) {
        for (const value of blackBoxData[key]) {
            if (!tryFindValue(value)) {
                missingValues.push(value);
            }
            else {
                matchesArray.push(value);
            }
        }
    }

    for (const missingValue of missingValues) {
        if (!count[missingValue]) {
            count[missingValue] = 1
        }
        else {
            count[missingValue] = count[missingValue] + 1;
        }
    }
}

for (const inputFileName of inputFileNames) {
    solve(inputFileName);
}

const elementsMissingFromAllFiles = []
for (const key of Object.keys(count)) {
    if (count[key] === numberOfFiles) {
        elementsMissingFromAllFiles.push(key);
    }
}

const failingChecks = [];
for (const element of elementsMissingFromAllFiles) {
    failingChecks.push(`Blackbox element ${element} is missing from all code files.`);
}