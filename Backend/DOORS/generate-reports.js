import fs from "fs"
import {getBlackBoxes} from "../EA/extract-blackbox-data.js"
import jenkinsData from '../Excel/jenkins-test-data.json' assert {type: 'json'}

const doorsExportPath = 'DOORS_RAS_GEN_4_CS-PF-09.xml';
const xmlData = fs.readFileSync(doorsExportPath).toString();

const designRequirementsTargetModule = [];
const testsTargetModule = [];
const safetyAnalysisIDs = [];

const objectData = {};
const outputFormat = {};

const targetFeature = 'FEAT_SETVALUE';
const targetTestModulePrefix = 'SetValue-DR-NATS-';
const targetSafetyAnalysisModulePrefix = 'SetValue-DR-SA-';
const targetBlackbox = 'Blackbox SetValue';
const blackboxPath = '../Ea/Blackbox SetValue.xml';

const blackBoxes = getBlackBoxes(blackboxPath);

let targetModuleId;

const buildGraph = (xmlData) => {
  const modules = xmlData.match(/<Module[\S\s]*?<\/Module>/g);
  for (const module of modules) {
    const firstLine = module.match(/<Module[\S\s]*?>/g);
    const moduleId = firstLine[0].match(/(?<=ID=").*?(?=")/g);
    let moduleName = module.match(/(?<=<Attribute name="Name">)[\S\s]*?(?=<\/Attribute>)/g);
    if (moduleName) {
      moduleName = moduleName[0];
    }
    const objects = module.match(/<Object[\S\s]*?<\/Object>/g);
    if (!objects) {
      continue;
    }
    for (const object of objects) {
      const objectAttributes = {}
      const attributes = object.match(/<Attribute[\S\s]*?<\/Attribute>/g);
      for (const attribute of attributes) {
        const attributeName = attribute.match(/(?<=name=").*?(?=")/g);
        const attributeValue = attribute.match(/(?<=>).*?(?=<\/Attribute>)/g);
        if(attributeValue) {
          objectAttributes[attributeName[0]] = attributeValue[0];
        }
      }
      objectAttributes["Module Identifier"] = moduleId[0];
      if (objectAttributes["Feature"] === targetFeature) {
        designRequirementsTargetModule.push(`${moduleId[0]}/${objectAttributes["Absolute Number"]}`);
        targetModuleId = moduleId[0];
      }

      if (objectAttributes["Object Identifier"].startsWith(targetTestModulePrefix)) {
        testsTargetModule.push(`${moduleId[0]}/${objectAttributes["Absolute Number"]}`);
      }
  
      if (objectAttributes["Object Identifier"].startsWith(targetSafetyAnalysisModulePrefix)) {
        safetyAnalysisIDs.push(`${moduleId[0]}/${objectAttributes["Absolute Number"]}`);
      }
  
      const outlinksArray = [];
      const outlinks = object.match(/<OutLink[\S\s]*?>/g);
      if (outlinks) {
        for (const outlink of outlinks) {
          const targetModule = outlink.match(/(?<=targetModule=").*?(?=")/g);
          const targetObjectID = outlink.match(/(?<=targetObjectID=").*?(?=")/g);
          outlinksArray.push({targetModule: targetModule[0], targetObjectID: targetObjectID[0]});
        }
      }
  
      if (!objectData[`${moduleId[0]}/${objectAttributes["Absolute Number"]}`]) {
        objectData[`${moduleId[0]}/${objectAttributes["Absolute Number"]}`] = {};
      }
  
  
      objectData[`${moduleId[0]}/${objectAttributes["Absolute Number"]}`].data = objectAttributes;
      objectData[`${moduleId[0]}/${objectAttributes["Absolute Number"]}`].outlinks = outlinksArray;
      outputFormat[`${moduleId[0]}/${objectAttributes["Absolute Number"]}`] = `${objectAttributes["Object Identifier"]} (${moduleName})`;
      
      for (const outlink of outlinksArray) {
        const outlinkKey = `${outlink.targetModule}/${outlink.targetObjectID}`;
  
        if (!objectData[`${outlinkKey}`]) {
          objectData[`${outlinkKey}`] = {};
          objectData[`${outlinkKey}`].inlinks = [`${moduleId[0]}/${objectAttributes["Absolute Number"]}`];
        }
        else {
          if (!objectData[`${outlinkKey}`].inlinks) {
            objectData[`${outlinkKey}`].inlinks = [];
          }
          objectData[`${outlinkKey}`].inlinks.push(`${moduleId[0]}/${objectAttributes["Absolute Number"]}`);
        }
      }
    }
  }
}

const blackboxValueCount = {};
const blackBox = blackBoxes[targetBlackbox];

const safetyAnalysisReviewsNotClosed = [];

const checkSafetyAnalysis = () => {
  for (const key of Object.keys(blackBox)) {
    for (const value of blackBox[key]) {
      blackboxValueCount[value] = 0;
    }
  }

  for (const safetyAnalysisID of safetyAnalysisIDs) {
    const currentSafetyAnalysis = objectData[safetyAnalysisID].data;
    const objectText = currentSafetyAnalysis["Object Text"];
    const valuesToCheck = objectText.split(',').map(element => element.trim())
    for (const valueToCheck of valuesToCheck) {
      if (blackboxValueCount[valueToCheck] === 0) {
        blackboxValueCount[valueToCheck] = 1
      }
    }

    let safetyAnalysisInlinks = objectData[safetyAnalysisID].inlinks;
    if (safetyAnalysisInlinks == undefined) {
      safetyAnalysisInlinks = [];
    }
    for (const safetyAnalysisInlink of safetyAnalysisInlinks) {
      const safetyAnalysisInlinksData = objectData[safetyAnalysisInlink].data;
      const inlinkObjectID = safetyAnalysisInlinksData["Object Identifier"];
      if (inlinkObjectID.includes("-REV-")) {
        const inlinkReviewState = safetyAnalysisInlinksData["Review State"];
        if (inlinkReviewState != "Closed") {
          safetyAnalysisReviewsNotClosed.push(objectID);
        }
      }
    }

  }

  const missingBlackboxItemsFromSafetyAnalysis = []
  for (const key of Object.keys(blackboxValueCount)) {
    if (blackboxValueCount[key] === 0) {
      missingBlackboxItemsFromSafetyAnalysis.push(key);
    }
  }
}

let isTestMarked = {};
let areAllTestsLinkToTargetModule = true;
const testReviewsNotClosed = [];

const checkTests = () => {
  for (const testTargetModule of testsTargetModule) {
    const currentTestValueInDoors = objectData[testTargetModule].data;
    const objectNumber = currentTestValueInDoors["Object Number"];

    if ((objectNumber && objectNumber.startsWith("1.2.1.0-")) && (objectNumber != "1.2.1.0-1")) {
      const objectID = currentTestValueInDoors["Object Identifier"];
      isTestMarked[objectID] = true;

      const currentTestOutlinks = objectData[testTargetModule].outlinks;
      let hasAtLeastOneOutlinkToTargetModule = false;
      for (const testOutlink of currentTestOutlinks) {
        const targetModule = testOutlink.targetModule;
        if (targetModule == targetModuleId) {
          hasAtLeastOneOutlinkToTargetModule = true;
        }
      }

      if(!hasAtLeastOneOutlinkToTargetModule) {
        areAllTestsLinkToTargetModule = false;
      }

      const testInlinks = objectData[testTargetModule].inlinks;
      for (const testInlink of testInlinks) {
        const testInlinksData = objectData[testInlink].data;
        const inlinkObjectID = testInlinksData["Object Identifier"];
        if (inlinkObjectID.includes("-REV-")) {
        const inlinkReviewState = testInlinksData["Review State"];
          if (inlinkReviewState != "Closed") {
            testReviewsNotClosed.push(objectID);
          }
        }
      }
    }
  }
}

const editStates = {};

// fcs stands for 'function contributions'
const fcs = {};
fcs["Edit State"] = {};
fcs["ASIL"] = {};
fcs["MapASIL"] = {};

// fcRevs stands for "function contributions reviews"
const fcRevs = {};
fcRevs["Review State"] = {};

// revs stands for reviews (these are the reviews of the design requirements)
const revs = {};
revs["Review State"] = {};

const computeDataRequiredForReports = () => {
  for (const designRequirementTargetModule of designRequirementsTargetModule) {
    const editState = objectData[designRequirementTargetModule].data["EditState"];
    if (!editStates[editState]) {
        editStates[editState] = [outputFormat[designRequirementTargetModule]];
    }
    else {
        editStates[editState].push(outputFormat[designRequirementTargetModule]);
    }

    const outlinks = objectData[designRequirementTargetModule].outlinks;
    for (const outlink of outlinks) {
      const outlinkKey = `${outlink.targetModule}/${outlink.targetObjectID}`;
      if (!fcs[outlinkKey]) {
        fcs[outlinkKey] = {};

        const outlinkObjectId = objectData[outlinkKey].data["Object Identifier"]
        if (outlinkObjectId && outlinkObjectId.includes("-FC-")) {
          const editStateFc = objectData[outlinkKey].data["Edit State"];
          if (editStateFc == undefined) {
            console.log(`hit undefined for ${outlinkKey}`);
          }
          
          if (!fcs["Edit State"][editStateFc]) {
              fcs["Edit State"][editStateFc] = [outputFormat[outlinkKey]];
          }
          else {
              fcs["Edit State"][editStateFc].push(outputFormat[outlinkKey]);
          }

          fcs[outlinkKey].editState = editStateFc;

          const asilFc = objectData[outlinkKey].data["ASIL"];

          if (!fcs["ASIL"][asilFc]) {
              fcs["ASIL"][asilFc] = [outputFormat[outlinkKey]];
          }
          else {
              fcs["ASIL"][asilFc].push(outputFormat[outlinkKey]);
          }

          fcs[outlinkKey].asilFc = asilFc;

          if (objectData[outlinkKey].inlinks) {
            for (const inlink of objectData[outlinkKey].inlinks) {
              if (objectData[inlink].data["Object Identifier"].includes("-FC-REV-")) {
                if (!fcRevs[inlink]) {
                  fcRevs[inlink] = {};
            
                  const reviewState = objectData[inlink].data["Review State"];
                  
                  if (!fcRevs["Review State"][reviewState]) {
                    fcRevs["Review State"][reviewState] = [outputFormat[inlink]];
                  }
                  else {
                    fcRevs["Review State"][reviewState].push(outputFormat[inlink]);
                  }
          
                  fcRevs[inlink].reviewState = reviewState;
                }
              }
            }
          }
        }
      }

      const outlinkObjectId = objectData[outlinkKey].data["Object Identifier"]
      if (outlinkObjectId && outlinkObjectId.includes("-FC-")) {
        if (!fcs["MapASIL"][outlinkKey]) {
            // fcs["MapASIL"][outlinkKey][0] is the ASIL value of the function contribution. I added the '->' at the end because it was easier
            // for me to focus when analysing the values in the debugger. The '->' is not mandatory.
            fcs["MapASIL"][outlinkKey] = [`${objectData[outlinkKey].data["ASIL"]} -> `]
            fcs["MapASIL"][outlinkKey].push(objectData[designRequirementTargetModule].data["ASIL"]);
        }
        else {
            fcs["MapASIL"][outlinkKey].push(objectData[designRequirementTargetModule].data["ASIL"]);
        }
      }
    }

    const inlinks = objectData[designRequirementTargetModule].inlinks ? objectData[designRequirementTargetModule].inlinks : [];

    for (const inlink of inlinks) {
      if (!revs[inlink]) {
        revs[inlink] = {};
        
        const inlinkObjectId = objectData[inlink].data["Object Identifier"];
        
        if (inlinkObjectId && inlinkObjectId.includes("-DR-REV-")) {

          const reviewState = objectData[inlink].data["Review State"];
          
          if (!revs["Review State"][reviewState]) {
            revs["Review State"][reviewState] = [outputFormat[inlink]];
          }
          else {
            revs["Review State"][reviewState].push(outputFormat[inlink]);
          }

          revs[inlink].reviewState = reviewState;
        }
      }
    }

  }
}

let correct = 0;
let incorrect  = 0;
const correctFcs = [];
const incorrectFcs = [];

const checkASIL = () => {
  for (const mapASIL in fcs.MapASIL) {
    let sum = 0;
    // substring(0, fcs.MapASIL[mapASIL][0].length - 4) removes the '->' explained above
    const asil = fcs.MapASIL[mapASIL][0].substring(0, fcs.MapASIL[mapASIL][0].length - 4);
    let asilValue = 0;
    if (asil === 'D') {
      asilValue = 4;
    }
    else if (asil === 'C') {
      asilValue = 3;
    }
    else if (asil === 'B') {
      asilValue = 2;
    }
    else if (asil === 'A') {
      asilValue = 1;
    }
    for (let i = 1; i < mapASIL.length; i = i + 1) {
      const currentAsil = fcs.MapASIL[mapASIL][i];
      let currentAsilValue = 0;
      if (currentAsil === 'D') {
        currentAsilValue = 4;
      }
      else if (currentAsil === 'C') {
        currentAsilValue = 3;
      }
      else if (currentAsil === 'B') {
        currentAsilValue = 2;
      }
      else if (currentAsil === 'A') {
        currentAsilValue = 1;
      }
      sum = sum + currentAsilValue
    }
    if (sum > asilValue) {
      correct = correct + 1;
      correctFcs.push(mapASIL);
    }
    else {
      incorrect = incorrect + 1;
      incorrectFcs.push(mapASIL);
    }
  }
}

const eaServerFails = [];
const eaSenderAndReceiverFails = [];

const completeChain = [];
const incompleteChain = [];

const report = {}

const buildReport = () => {
  const section1key = `Section 1 - Statistics of Design Requirements filtered by '${targetFeature}'`
  report[section1key] = {}

  for (const key in editStates) {
    report[section1key][`Number of Design Requirements with '${key}' edit state and '${targetFeature}' feature`] = editStates[key].length;
  }
  report[section1key][`Design Requirements 'Edit State' details (filtered by '${targetFeature}')`] = editStates;


  const section2key = `Section 2 - Statistics of Function Contributions referenced by Design Requirements filtered by '${targetFeature}'`
  report[section2key] = {}

  for (const key in fcs["Edit State"]) {
    report[section2key][`Number of Function Contributions with '${key}' edit state, that are also referenced by a Design Requirement with '${targetFeature}' feature`] = fcs["Edit State"][key].length;
  }

  report[section2key][`Function Contributions 'Edit State' details (including only the Function Contributions that are referenced by at least one Design Requirement with '${targetFeature}')`] = fcs["Edit State"];


  const section3key = `Section 3 - Statistics of Review Modules (for Design Requirements) that reference Design Requirements filtered by '${targetFeature}'`
  report[section3key] = {}

  for (const key in revs["Review State"]) {
    report[section3key][`Number of Review Modules (for Design Requirements) with '${key}' review state, that also reference a Design Requirement with '${targetFeature}' feature`] = revs["Review State"][key].length;
  }

  report[section3key][`Review Modules (for Design Requirements) 'Review State' details (including only the Review Modules that reference at least one Design Requirement with '${targetFeature}')`] = revs["Review State"];


  const section4key = `Section 4 - Statistics of Review Modules (for Function Contributions) that reference Function Contributions which are outlinked by Design Requirements filtered by '${targetFeature}'`
  report[section4key] = {}

  for (const key in fcRevs["Review State"]) {
    report[section4key][`Number of Review Modules (for Function Contributions) with '${key}' review state, that also indirectly reference a Design Requirement with '${targetFeature}' feature`] = fcRevs["Review State"][key].length;
  }

  report[section4key][`Review Modules (for Function Contributions) 'Review State' details (including only the Review Modules that indirectly reference at least one Design Requirement with '${targetFeature}')`] = fcRevs["Review State"];

  const serverNames = blackBoxes[targetBlackbox].Server;
  const markServerName = {};
  for (const serverName of serverNames) {
    markServerName[serverName] = true;
  }
  const senderNames = blackBoxes[targetBlackbox].Sender;
  const receiverNames = blackBoxes[targetBlackbox].Receiver;
  for (const designRequirementTargetModule of designRequirementsTargetModule) {
    const incompleteReasons = [];
    if (objectData[designRequirementTargetModule].data["EditState"] !== "Released") {
      incompleteReasons.push(`'EditState' of Design Requirement is ${objectData[designRequirementTargetModule].data["EditState"]}`);
    }

    let outlinks = objectData[designRequirementTargetModule].outlinks;
    for (const outlink of outlinks) {
      const outlinkKey = `${outlink.targetModule}/${outlink.targetObjectID}`;

      const outlinkObjectId = objectData[outlinkKey].data["Object Identifier"]
      if (outlinkObjectId && outlinkObjectId.includes("-FC-")) {

        if (fcs[outlinkKey].editState !== 'released') {
          incompleteReasons.push(`'Edit State' of Function Contribution '${outputFormat[outlinkKey]}' linked to Design Requirement is ${fcs[outlinkKey].editState}`);
        }

        if (objectData[outlinkKey].inlinks) {
          for (const inlink of objectData[outlinkKey].inlinks) {
            if (objectData[inlink].data["Object Identifier"].includes("-FC-REV-")) {
              if (fcRevs[inlink].reviewState !== 'Closed') {
                incompleteReasons.push(`'Review State' of Review Module (Function Contribution) '${inlink}' indirectly linked to Design Requirement is '${fcRevs[inlink].reviewState}' - ${outputFormat[inlink]}`);
              }
            }
          }
        }
      }
    }

    const inlinks = objectData[designRequirementTargetModule].inlinks ? objectData[designRequirementTargetModule].inlinks : [];
    let hasIntegrationTest = false;
    const designRequirementsWithoutIntegrationTests = [];
    for (const inlink of inlinks) {
      const inlinkObjectId = objectData[inlink].data["Object Identifier"]
        
      if (inlinkObjectId && inlinkObjectId.includes("-DR-REV-")) {
        if (revs[inlink].reviewState !== 'Closed') {
          incompleteReasons.push(`'Review State' of Review Module (Design Requirement) '${inlink}' is '${revs[inlink].reviewState}' - ${outputFormat[inlink]}`);
        }
      }

      if (inlinkObjectId && inlinkObjectId.includes("-DR-NATS-")) {
        const editState = objectData[inlink].data["EditState"];
        if (editState != "Released") {
          incompleteReasons.push(`'Edit State' of Test Specification '${outputFormat[inlink]}' is '${editState}'`);
        }

        const objectID = objectData[inlink].data["Object Identifier"];
        if (isTestMarked[objectID]) {
          hasIntegrationTest = true;
        }

        const jenkisParentId = objectData[inlink].data["Object Text"];
        const jenkinsTestData = jenkinsData[jenkisParentId];
        if (jenkinsTestData && jenkinsTestData["Failed Tests"] && jenkinsTestData["Failed Tests"].length > 0) {
          let failuireMessage = `Result of tests: `

          const failedJenkinsTests = jenkinsTestData["Failed Tests"];

          for (const failedJenkinsTest of failedJenkinsTests) {
            failuireMessage = failuireMessage + failedJenkinsTest + ', ';
          }

          failuireMessage = failuireMessage.substring(0, failuireMessage.length - 2) + ` from Jenkins is not 'passed'.`;

          incompleteReasons.push(failuireMessage);
        }
      }
    }

    if(!hasIntegrationTest) {
      incompleteReasons.push("Design Requirement does not have any linked integration test");
      designRequirementsWithoutIntegrationTests.push(designRequirementTargetModule);
    }

    const markIncorrectFcs = {}
    for (const incorrectFc of incorrectFcs) {
      markIncorrectFcs[incorrectFc] = true;
    }
      
    outlinks = objectData[designRequirementTargetModule].outlinks;
    let complete = true;
    let outlink;
    for (const key in outlinks) {
      outlink = `${outlinks[key].targetModule}/${outlinks[key].targetObjectID}`
      if (markIncorrectFcs[outlink]) {
          complete = false;
          break;
      }
    }
    if (!complete) {
      incompleteReasons.push(`Design Requirement is linked to Function Contribution: '${outputFormat[outlink]}', which does not respect the ASIL rule`);
    }

    const currentData = objectData[designRequirementTargetModule].data;
    const serverName = currentData["Servername"];
    const objectText = currentData["Object Text"];

    let hit = false;
    for (const server of serverNames) {
      if (serverName.includes(server)) {
        hit = true;
        break;
      }
    }

    if (!hit) {
      incompleteReasons.push("Design Requirement does not reference a server from its corresponding black box from EA");
      eaServerFails.push(designRequirementTargetModule);
    }


    hit = false;

    for (const sender of senderNames) {
      if (objectText.includes(sender)) {
        hit = true;
        break;
      }
    }

    for (const receiver of receiverNames) {
      if (objectText.includes(receiver)) {
        hit = true;
        break;
      }
    }

    if (!hit) {
      incompleteReasons.push("Design Requirement deos not contain any reference to a sender or receiver from its corresponding black box from EA");
      eaSenderAndReceiverFails.push(designRequirementTargetModule);
    }
    
    if (incompleteReasons.length === 0) {
      completeChain.push(outputFormat[designRequirementTargetModule]);
    }
    else {
      incompleteChain.push({requirement: outputFormat[designRequirementTargetModule], reasons: incompleteReasons});
    }
  }

  const section5key = `Section 5 - Statistics of EA checks`
  report[section5key] = {}

  report[section5key][`Design Requirements which fail EA server name check`] = eaServerFails;
  report[section5key][`Design Requirements which fail to reference senders or receivers`] = eaSenderAndReceiverFails;


  const section6key = `Section 6`
  report[section6key] = {}

  report[section6key][`Complete`] = completeChain;

  report[section6key][`Incomplete`] = incompleteChain;
}

buildGraph(xmlData);
checkSafetyAnalysis(blackBox);
checkTests();
computeDataRequiredForReports();
checkASIL();
buildReport();

fs.writeFileSync('production-data-report.json', JSON.stringify(report, null, 4));
console.log('done');