import fs from "fs";

const htmlContent = fs.readFileSync('regression.html').toString();

// targetComponent will be received as parameter when moving from PoC to Production
const targetComponent = 'SetValue';

let header = htmlContent.match(/3 Table of tested Components[\S\s]*?<\/tr>/g);
if (header) {
    header = header[0];
}

const headerValues = header.match(/>.*?<\/th>/g);

for (let index = 0; index < headerValues.length; index = index + 1) {
    headerValues[index] = headerValues[index].match(/(?<=>).*?(?=<\/th>)/g)[0];
}


let sectionOfInterest = htmlContent.match(/3 Table of tested Components[\S\s]*?4 Table of not tested Components/g);
if (sectionOfInterest) {
    sectionOfInterest = sectionOfInterest[0];
}

const regexExpression = new RegExp(`${targetComponent}[\\S\\s]*?<\/tr>`);
let targetRowEntry = sectionOfInterest.match(regexExpression);
if (targetRowEntry) {
    targetRowEntry = targetRowEntry[0];
}

const rowValues = targetRowEntry.match(/>[\S\s]*?<\/td>/g);
for (let index = 0; index < rowValues.length; index = index + 1) {
    rowValues[index] = rowValues[index].match(/(?<=>)[\S\s]*?(?=<\/td>)/g)[0];
}

let headerIndex = 2;
let rowValuesIndex = 1;
let map = {};

while (headerIndex < headerValues.length) {
    map[headerValues[headerIndex]] = rowValues[rowValuesIndex].replace(/[\s]/g, '');
    headerIndex = headerIndex + 1;
    rowValuesIndex = rowValuesIndex + 1;
}

const failingChecks = [];
if (map['VCar'] !== 'Passed') {
    failingChecks.push(`VCar is ${map['VCar']}`);
}
if (map['Tessy'] !== 'Passed') {
    failingChecks.push(`Tessy is ${map['Tessy']}`);
}
if (map['BTC-MIL'] !== 'Passed') {
    failingChecks.push(`BTC-MIL is ${map['BTC-MIL']}`);
}
if (map['BTC-SIL'] !== 'Passed') {
    failingChecks.push(`BTC-SIL is ${map['BTC-SIL']}`);
}
if (map['BTC-B2B'] !== 'Passed') {
    failingChecks.push(`BTC-B2B is ${map['BTC-B2B']}`);
}
if (map['BTC-Coverage'] !== 'Passed') {
    failingChecks.push(`BTC-Coverage is ${map['BTC-Coverage']}`);
}