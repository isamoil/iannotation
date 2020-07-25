var tabsCount = 1;
var tabsString = '    ';
var selectedCodes = ['200', '400', '403', '500'];
var error = false;
var defaultCodeDescription = {
    200: 'HTTP_OK',
    201: 'HTTP_CREATED',
    204: 'No content',
    400: 'Bad request',
    403: 'Permission denied',
    500: 'Internal server error',
}

$(document).ready(function () {
    editCodesList();
});

function generateAnnotation() {
    tabsCount = 1;
    error = false;
    let response = tabsString + '* @SWG\\Tag(name="' + document.getElementById('apiName').value +
        '", description="' + document.getElementById('apiDescription').value + '")\n'

    // api.eiole.local/app_dev.php/v2/dedication/configurations/1/messages?per_page=20&page=1
    response += addPathParameters(response);

    response += addQueryParameters(response);


    let method = document.getElementById('method').value
    const methods = ['post', 'patch', 'put'];
    const exist = methods.indexOf(method)
    if (exist >= 0) {
        let inputParams = document.getElementById('paramsDataInput').value;
        let inputJsonParameters = inputParams ? JSON.parse(inputParams) : {};
        response += inputParameters(Object.keys(inputJsonParameters)[0], document.getElementById('descriptionParamsDataInput').value)
        response += convertJsonToAnnotation(inputJsonParameters);
        response += tabsString + '* ' + tabsString.repeat(tabsCount) + ')\n';
        tabsCount--;
        response += tabsString + '* ' + tabsString.repeat(tabsCount) + ' )\n';
    }
    selectedCodes.forEach(code => {
        let description = document.getElementById(code + '_input').value ?
            document.getElementById(code + '_input').value : defaultCodeDescription[code];
        if (parseInt(code) === 200) {
            let inputJsonData = document.getElementById('responseDataInput').value ? JSON.parse(document.getElementById('responseDataInput').value) : {};
            response += response200();
            tabsCount--;
            response += convertJsonToAnnotation(inputJsonData);
            tabsCount--;
            response += response200Description(description);
        } else {
            response += errorCodeMessage(code, description)
        }
    });
    if (!error) {
        document.getElementById('finalAnnotations').value = response;
    }
}

$(
    function () {
        $('#method').on('change', (event) => {
            const methods = ['post', 'patch', 'put'];
            const exist = methods.indexOf(event.target.value)
            let paramsData = document.getElementById("paramsData");
            if (exist >= 0) {
                paramsData.style.display = 'block';
            } else {
                paramsData.style.display = 'none';

            }
        })
    }
);

function editCodesList() {
    selectedCodes = [];
    let select1 = document.getElementById("responseCode");
    for (let i = 0; i < select1.length; i++) {
        if (select1.options[i].selected) selectedCodes.push(select1.options[i].value);
    }
    if (selectedCodes.indexOf('200') < 0) {
        document.getElementById('responseData').style.display = 'none';
    } else {
        document.getElementById('responseData').style.display = 'block';
    }
    const responsesDivExist = document.getElementById('responsesDiv');
    if (responsesDivExist !== null) {
        responsesDivExist.remove()
    }
    this.insertDescriptionInputs();
}

function insertDescriptionInputs() {
    let responsesDiv = document.createElement('div');
    responsesDiv.id = 'responsesDiv';

    selectedCodes.forEach(code => {
        if (document.getElementById(code) === null && code !== '200') {
            let divL = document.getElementById('divL');
            let codeDiv = document.createElement('div');
            let codeLabel = document.createElement('label');
            let labelText = document.createTextNode('Description for code :' + code + ' ');
            let codeInput = document.createElement('input');
            let newLine = document.createElement('br');
            codeLabel.appendChild(labelText);
            codeDiv.id = code;
            codeInput.placeholder = defaultCodeDescription[code] ? defaultCodeDescription[code] : '';
            codeInput.id = code + '_input';
            codeInput.style.width = '90%';
            codeLabel.nodeValue = code;
            codeDiv.appendChild(codeLabel);
            codeDiv.appendChild(newLine);
            codeDiv.appendChild(codeInput);
            responsesDiv.appendChild(codeDiv);
            divL.appendChild(responsesDiv);
            divL.insertBefore(responsesDiv, divL.lastChild)
        }
    })
}

function convertJsonToAnnotation(inputJson) {
    let finalString = '';
    Object.keys(inputJson).forEach(function (key) {
        console.log(key);
        finalString = redirectValue(finalString, key, inputJson[key]);
    });

    return finalString;
}

function redirectValue(finalString, key, value) {
    switch (typeof value) {
        case "string":
            if (Date.parse(value)) {
                finalString += addDateProperty(key, value)
            } else {
                finalString += addStringProperty(key, value)
            }
            break;
        case "number":
            finalString += addIntegerProperty(key, value)
            break;
        case "boolean":
            finalString += addBooleanProperty(key, value)
            break;
        case "object":
            if (Array.isArray(value)) {
                finalString += addArrayProperty(key, value)
            } else if (!value) {
                alert('Please update null objects: ' + key);
                error = true;
                return 0;
            } else {
                tabsCount++;
                finalString += addObjectProperty(key, value)
                tabsCount--;
            }
            break;
    }

    return finalString;
}

function addPathParameters(response) {
    let apiPath = document.getElementById('apiName').value
    let itemsApiPath = apiPath.split('/');
    itemsApiPath.forEach(item => {
        if (item[0] === '{') {
            item = item.slice(1);
            item = item.slice(0, -1);
            response += addParameters(item, 'Mandatory');
        }
    })

    return response;
}

function addQueryParameters(response, name, value) {
    let apiPath = document.getElementById('apiName').value
    let apiParts = apiPath.split('?');
    if (apiParts.length > 1) {
        let itemsApiQuery = apiParts[1].split('&');
        itemsApiQuery.forEach((item) => {
            response += addParameters(item.split('=')[0], item.split('=')[1]);
        })
    }

    return response;
}

function addStringProperty(key, value) {
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="string", example="' + value + '"),\n';
}

function addObjectProperty(key, value) {
    console.log(tabsCount);
    // tabsCount++;
    // console.log(tabsCount);
    let result = tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="object",\n';
    tabsCount++;
    console.log(tabsCount);
    Object.keys(value).forEach(function (newKey) {
        result += redirectValue('', newKey, value[newKey]);
    });
    tabsCount--;

    console.log(tabsCount);
    console.log('--------');

    return result += tabsString + '* ' + tabsString.repeat(tabsCount) + "),\n"
}

function addArrayProperty(key, value) {
    let result = tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="array",\n';
    tabsCount++;
    result += tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Items(\n';
    tabsCount++;
    Object.keys(value[0]).forEach(function (newKey) {
        result += redirectValue('', newKey, value[0][newKey]);
    });
    tabsCount--;
    result += tabsString + '* ' + tabsString.repeat(tabsCount) + "),\n"
    tabsCount--;

    return result += tabsString + '* ' + tabsString.repeat(tabsCount) + "),\n"
}

function addBooleanProperty(key, value) {
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="boolean", example=' + value + '),\n';

}

function addIntegerProperty(key, value) {
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="int", example=' + value + '),\n';
}

function addDateProperty(key, value) {
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="ISO8601", example="' + value + '"),\n';
}


function response200() {
    let response =  tabsString + '* @SWG\\Response(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'response=200,\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Schema(\n';
    tabsCount++;
    response += tabsString + '* ' + tabsString.repeat(tabsCount) + 'type="object",\n';
    tabsCount++;
    return response;
}

function response200Description(description) {
    return tabsString + '* ' + tabsString + '),\n' +
        tabsString + '* ' + tabsString + 'description="' + description + '"\n' +
        tabsString + '* )\n';
}

function errorCodeMessage(code, description) {
    return tabsString + '* @SWG\\Response(\n' +
        tabsString + '* ' + tabsString + 'response=' + code + ',\n' +
        tabsString + '* ' + tabsString + 'description="' + description + '"\n' +
        tabsString + '* )\n';
}

function inputParameters(name, description) {
    return tabsString + '* @SWG\\Parameter(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'name="' + name + '",\n' + //data
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'in="body",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'type="object",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'description="' + description + '",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Schema(\n' +
        tabsString + '* ' + tabsString.repeat(2) + 'type="object",\n';
}


function addParameters(name, description) {
    console.log(tabsCount, tabsString);
    return tabsString + '* @SWG\\Parameter(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'name="' + name + '",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'in="path",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'type="string",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'description="' + description + '"\n' +
        tabsString + '* )\n';
}