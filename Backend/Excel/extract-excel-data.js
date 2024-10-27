import XLSX from "xlsx";
import fs from "fs";

// excelReportPath will be received as parameter when moving from PoC to Production
const excelReportPath = "cit_regression_report.xls"
const file = XLSX.readFile(excelReportPath);

const testResults = file.Sheets['TestResults'];

const tests = XLSX.utils.sheet_to_json(testResults);

const statistics = {};

for (const test of tests) {
    const testIdJenkins = test["Test Id"];

    let testIdDoors = testIdJenkins.match(/(?<=_).*(?=_)/g);
    if (!testIdDoors) {
        console.log(`${testIdJenkins} does not respect the naming format`);
        continue;
    }
    testIdDoors = testIdDoors[0];

    const result = test["Result"];

    if (!statistics[testIdDoors]) {
        statistics[testIdDoors] = {};
        statistics[testIdDoors]["Failed Tests"] = [];
        statistics[testIdDoors]["Correct Tests Total"] = 0;
    }

    if(result !== 'passed') {
        statistics[testIdDoors]["Failed Tests"].push(testIdJenkins);
    }
    else {
        statistics[testIdDoors]["Correct Tests Total"] = statistics[testIdDoors]["Correct Tests Total"] + 1;
    }
}

fs.writeFileSync('jenkins-test-data.json', JSON.stringify(statistics, null, 4));