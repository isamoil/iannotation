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
    const apiName = document.getElementById('apiDescription').value?
        document.getElementById('apiDescription').value.replace(/"/g, '\"\"') :
        'Api Name';
    const apiPath = document.getElementById('apiName').value;
    const method = document.getElementById('method').value

    let response = tabsString + '/**\n' + tabsString + '* @SWG\\Tag(name="' + apiName.replace(/"/g, '\"\"') +
        '", description="';
    if (apiPath){
        response += 'Path: ' + apiPath.split('?')[0].replace(/"/g, '\"\"') + '; ';
    }
    response += 'Request Method:' + method.replace(/"/g, '\"\"').toUpperCase() + '")\n'

    response += addPathParameters();

    response += addQueryParameters();

    const methods = ['post', 'patch', 'put'];
    const exist = methods.indexOf(method)
    if (exist >= 0) {
        let inputParams = aceSchemaEditor.getValue(0);
        let inputJsonParameters = inputParams ? JSON.parse(inputParams) : {};
        if (Object.entries(inputJsonParameters).length !== 0) {
            const descriptionForInput = document.getElementById('descriptionParamsDataInput').value || 'The input parameters';
            response += inputParameters(Object.keys(inputJsonParameters)[0], descriptionForInput, inputJsonParameters)
            response += convertJsonToAnnotation(inputJsonParameters);
            if (typeof inputJsonParameters === "object" && Array.isArray(inputJsonParameters) && !Array.isArray(inputJsonParameters[0])) {
                response += tabsString + '* ' + tabsString + '),\n';
                tabsCount--;
            }
                tabsCount--;

            response += tabsString + '* ' + tabsString.repeat(tabsCount) + ')\n';
        }
    }
    selectedCodes.forEach(code => {
        let description = document.getElementById(code + '_input').value ?
            document.getElementById(code + '_input').value : defaultCodeDescription[code];
        if (parseInt(code) === 200) {
            const resDataInput = aceOutputEditor.getValue(0);
            let jsonData = resDataInput ? JSON.parse(resDataInput) : {};

            response += responseData(200, jsonData);
            tabsCount--;
            response += convertJsonToAnnotation(jsonData);
            // tabsCount--;
            response += response200Description(description, jsonData);
        } else {
            response += errorCodeMessage(code, description)
        }
    });
    response += tabsString + '**/'
    if (!error) {
        const lines = response.split('\n');
        const totalLines = lines.length;
        const el = document.getElementById('finalAnnotations');
        el.innerText = '\n';

        lines.forEach(line => {
            el.innerHTML += '<div>' + line + '</div>';
        });

        el.innerHTML += '\n\n<span aria-hidden="true" class="line-numbers-rows"></span>';
        const linesEl = $('.line-numbers-rows');
        linesEl.removeAttr('hidden');
        linesEl.css('display', 'block');
        linesEl.html('');
        lines.forEach(line => {
            linesEl.append('<span></span>');
        });
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
            codeInput.className = 'form-control';
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
    if (Array.isArray(inputJson) && typeof inputJson[0] === "object" && !Array.isArray(inputJson[0])) {
        finalString += 'type="object",\n';
        tabsCount++;
        Object.keys(inputJson[0]).forEach(function (key) {
            finalString = redirectValue(finalString, key, inputJson[0][key]);
        });
    } else  {
        tabsCount++;
        Object.keys(inputJson).forEach(function (key) {
            finalString = redirectValue(finalString, key, inputJson[key]);
        });
    }


    return finalString;
}

function redirectValue(finalString, key, value) {
    switch (typeof value) {
        case "string":
            if (Date.parse(value)) {
                finalString += addDateProperty(key, value.replace(/"/g, '\"\"'))
            } else {
                finalString += addStringProperty(key, value.replace(/"/g, '\"\"'))
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

function addPathParameters() {
    let response = '';
    let apiPath = document.getElementById('apiName').value
    let itemsApiPath = apiPath.split('/');
    itemsApiPath.forEach(item => {
        if (item[0] === '{') {
            item = item.slice(1);
            item = item.slice(0, -1);
            response = addParameters(item, 'Mandatory', 'path');
        }
    })

    return response;
}

function addQueryParameters() {
    let response = '';
    let apiPath = document.getElementById('apiName').value
    let apiParts = apiPath.split('?');
    if (apiParts.length > 1) {
        let itemsApiQuery = apiParts[1].split('&');
        itemsApiQuery.forEach((item) => {
            response = addParameters(item.split('=')[0],item.substr(itemsApiQuery.indexOf('=') + 1), 'query');
        })
    }

    return response;
}

function addStringProperty(key, value) {
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="string", example="' + value + '"),\n';
}

function addObjectProperty(key, value) {
    let result = tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="object",\n';
    tabsCount++;
    Object.keys(value).forEach(function (newKey) {
        result += redirectValue('', newKey, value[newKey]);
    });
    tabsCount--;

    return result += tabsString + '* ' + tabsString.repeat(tabsCount) + "),\n"
}

function addArrayProperty(key, value) {
    let result = tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="array",\n';
    tabsCount++;
    result += tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Items(';
    if (typeof value[0] === "object") {
        if (!Array.isArray(value[0])) {
            result += 'type="object",\n'
        }
        tabsCount++;
        Object.keys(value[0]).forEach(function (newKey) {
            result += redirectValue('', newKey, value[0][newKey]);
        });
        // tabsCount--;
    } else {
        switch (typeof value[0]) {
            case "string":
                if (Date.parse(value[0])) {
                    result += 'type="datetime", example=' + value[0] + ')\n';
                } else {
                    result += 'type="' + typeof value[0] + '", example="' + value[0] + '")\n';
                }
                break;
            case "number":
                result += 'type="' + typeof value[0] + '", example=' + value[0] + ')\n';
                break;
            case "boolean":
                result += 'type="boolean", example=' + value[0] + ')\n';
                break;
        }
    }
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
    return tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="datetime", example="' + value + '"),\n';
}

function responseData(code, jsonData) {
    let response = tabsString + '* @SWG\\Response(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'response=' + code + ',\n';
    if (Object.entries(jsonData).length !== 0) {
        response += startJsonData(jsonData);
        tabsCount++;
    } else {
        tabsCount++;
    }

    return response;
}

function response200Description(description, jsonData) {
    let response = '';
    if (typeof jsonData === "object" && Array.isArray(jsonData)) {
        tabsCount--;
        response += tabsString + '* ' + tabsString.repeat(tabsCount) + '),\n';
    }
     response += tabsString + '* ' + tabsString.repeat(tabsCount) + 'description="' + description.replace(/"/g, '\"\"') + '"\n' +
        tabsString + '* )\n';

    return response;
}

function errorCodeMessage(code, description) {
    return tabsString + '* @SWG\\Response(\n' +
        tabsString + '* ' + tabsString + 'response=' + code + ',\n' +
        tabsString + '* ' + tabsString + 'description="' + description.replace(/"/g, '\"\"') + '"\n' +
        tabsString + '* )\n';
}

function inputParameters(name, description, inputJsonParameters) {
    let response = tabsString + '* @SWG\\Parameter(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'name="' + name + '",\n' + //data
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'in="body",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'type="object",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'description="' + description.replace(/"/g, '\"\"') + '",\n';
    response += startJsonData(inputJsonParameters);

    return response;
}

function startJsonData(jsonData) {
    let response = ''
    if (typeof jsonData === "object") {
        response = tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Schema(';
        if (Array.isArray(jsonData)) {
            response += 'type="array",\n';
            tabsCount++;
            response += tabsString + '* ' + tabsString.repeat(tabsCount) + '@SWG\\Items(';
        } else {
            response += 'type="object",\n';
        }
    }

    return response;
}

function addParameters(name, description, type) {
    return tabsString + '* @SWG\\Parameter(\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'name="' + name + '",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'in="' + type + '",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'type="string",\n' +
        tabsString + '* ' + tabsString.repeat(tabsCount) + 'description="' + description.replace(/"/g, '\"\"') + '"\n' +
        tabsString + '* )\n';
}