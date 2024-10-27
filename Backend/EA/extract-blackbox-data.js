import fs from "fs"

const matchLeftsAndRights = (lefts, rights) => {
    const pairs = [];
    const queue = [];
    let leftIndex = 0;
    let rightIndex = 0;
    while (leftIndex < lefts.length) {
        const leftIndexInOriginalXmlString = lefts[leftIndex].index
        const rightIndexInOriginalXmlString = rights[rightIndex].index
        if (leftIndexInOriginalXmlString < rightIndexInOriginalXmlString) {
            queue.push(leftIndex);
            leftIndex = leftIndex + 1;
        }
        else {
            const last = queue[queue.length - 1];
            queue.pop();
            pairs.push({leftIndex: last, rightIndex});
            rightIndex = rightIndex + 1;
        }
    }
    while (queue.length > 0 && rightIndex < rights.length) {
        const last = queue[queue.length - 1];
        queue.pop();
        pairs.push({leftIndex: last, rightIndex});
        rightIndex = rightIndex + 1;
    }
    if (queue.length > 0 || rightIndex < rights.length) {
        console.log(`Uml Packages incorrectly paired.`);
    }
    return pairs;
}

const excludeNonExpansibleItems = (items) => {
    const expandableItems = [];
    for (const item of items) {
        if (item.endsWith('/>')) {
            continue;
        }
        else {
            expandableItems.push(item);
        }
    }
    return expandableItems;
}

export const getBlackBoxes = (blackboxFilePath) => {
    const blackBoxes = {};
    const data = fs.readFileSync(blackboxFilePath).toString();

    let umlPackageLefts = [...data.matchAll(/<UML:Package [\S\s].*?>/g)];
    const umlPackageRights = [...data.matchAll(/<\/UML:Package>/g)];

    if (umlPackageLefts.length !== umlPackageRights.length) {
        umlPackageLefts = excludeNonExpansibleItems(umlPackageLefts);
    }

    if (umlPackageLefts.length !== umlPackageRights.length) {
        console.log(`Uml Packages incorrectly extracted: Number of closing tags do not match number of opening tags even after 'excludeNonExpansibleItems' correction.`);
    }

    const blackBoxValues = {}; 
    const umlPackageIndexPairs = matchLeftsAndRights(umlPackageLefts, umlPackageRights);

    for (const pair of umlPackageIndexPairs) {
        let umlPackageLeft = umlPackageLefts[pair.leftIndex];
        if (umlPackageLeft[0].includes('<UML:Package name="Blackbox')) {   
            const blackBoxName = umlPackageLeft[0].match(/(?<=name=")Blackbox.*?(?=")/g)[0];

            let umlPackageRight = umlPackageRights[pair.rightIndex];
            const blackBox = data.substring(umlPackageLeft.index, umlPackageRight.index);

            let umlClassLefts = [...blackBox.matchAll(/<UML:Class [\S\s].*?>/g)];
            const umlClassRights = [...blackBox.matchAll(/<\/UML:Class>/g)];

            if (umlClassLefts.length !== umlClassRights.length) {
                umlClassLefts = excludeNonExpansibleItems(umlClassLefts);
            }

            if (umlClassLefts.length !== umlClassRights.length) {
                console.log(`Uml Classes incorrectly extracted: Number of closing tags do not match number of opening tags even after 'excludeNonExpansibleItems' correction.`);
            }

            const classIndexPairs = matchLeftsAndRights(umlClassLefts, umlClassRights);

            for (const classPair of classIndexPairs) {
                let umlClassLeft = umlClassLefts[classPair.leftIndex];
                let umlClassRight = umlClassRights[classPair.rightIndex];
                let umlClass = blackBox.substring(umlClassLeft.index, umlClassRight.index);
                const typeMatch = umlClass.match(/<UML:Stereotype .*?>/g)[0];
                const typeValue = typeMatch.match(/(?<=name=").*?(?=")/g)[0];
                const name = umlClassLeft["0"].match(/(?<=name=").*?(?=")/g)[0];
                if (!blackBoxValues[typeValue]) {
                    blackBoxValues[typeValue] = [name]
                }
                else {
                    blackBoxValues[typeValue].push(name);
                }
            }

            blackBoxes[blackBoxName] = blackBoxValues

            // For a Production solution, the code below can be used to detect the ASIL value of the black box, 
            // when given as input a Top Level Package. However, I would advise to investigate for a simpler solution if their admis 
            // finally decide to give us permissions to investigate their environment. Otherwise, please check that the code below works
            // for multiple blackboxes, before using it:

            // const blackBoxModule = blackBoxName.match(/(?<=Blackbox ).*/g)[0]

            // let classiferRoleRegExp = new RegExp(`<UML:ClassifierRole name="${blackBoxModule}"[\\S\\s]*?</UML:ClassifierRole>`, 'g');
            
            // const umlClassifierRoles = data.match(classiferRoleRegExp);

            // for (const umlClassifierRole of umlClassifierRoles) {
            //     let roleRegExp = new RegExp('<UML:Stereotype name="Component"/>', 'g');
            //     if (roleRegExp.test(umlClassifierRole)) {
            //         const classifierId = umlClassifierRole.match(/(?<=<UML:TaggedValue tag="classifier" value=").*?(?="\/>)/g)
            //         let asilRegExp = new RegExp(`<UML:TaggedValue tag="ASIL".*?"${classifierId}"/>`, 'g');
            //         const asils = data.match(asilRegExp);
            //         if (asils.size > 1) {
            //             console.log(`warning: found more than 1 matching asil value`);
            //         }
            //         const asilMatch = asils[0];
            //         let asilValueFullString = asilMatch.match(/(?<=value=").*?(?=")/g)[0]
            //         let asilValue = asilValueFullString.split('#')[0]
            //         blackBoxes[blackBoxName]["ASIL"] = asilValue;
            //     }
            // }
        }
    }

    return blackBoxes;
}

//const blackboxFilePath = 'Top Level Package.xmi';
//getBlackBoxes(blackboxFilePath);