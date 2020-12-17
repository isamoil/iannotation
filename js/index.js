var tabsCount = 1;
var f_space = '    '; //four spaces
var selectedCodes = [200, 400, 403, 500];
var codes = [{value: 200,title: "HTTP_OK"}, {value: 201,title: "HTTP_CREATED"}, {value: 204,title: "HTTP_NO_CONTENT"}, {value: 400,title: "HTTP_BAD_REQUEST"}, {value: 403,title: "HTTP_FORBIDDEN"}, {value: 500,title: "HTTP_INTERNAL_SERVER_ERROR"}, {value: 100,title: "HTTP_CONTINUE"}, {value: 101,title: "HTTP_SWITCHING_PROTOCOLS"}, {value: 102,title: "HTTP_PROCESSING"}, {value: 103,title: "HTTP_EARLY_HINTS"}, {value: 202,title: "HTTP_ACCEPTED"}, {value: 203,title: "HTTP_NON_AUTHORITATIVE_INFORMATION"}, {value: 204,title: "HTTP_NO_CONTENT"}, {value: 205,title: "HTTP_RESET_CONTENT"}, {value: 206,title: "HTTP_PARTIAL_CONTENT"}, {value: 207,title: "HTTP_MULTI_STATUS"}, {value: 208,title: "HTTP_ALREADY_REPORTED"}, {value: 226,title: "HTTP_IM_USED"}, {value: 300,title: "HTTP_MULTIPLE_CHOICES"}, {value: 301,title: "HTTP_MOVED_PERMANENTLY"}, {value: 302,title: "HTTP_FOUND"}, {value: 303,title: "HTTP_SEE_OTHER"}, {value: 304,title: "HTTP_NOT_MODIFIED"}, {value: 305,title: "HTTP_USE_PROXY"}, {value: 306,title: "HTTP_RESERVED"}, {value: 307,title: "HTTP_TEMPORARY_REDIRECT"}, {value: 308,title: "HTTP_PERMANENTLY_REDIRECT"}, {value: 401,title: "HTTP_UNAUTHORIZED"}, {value: 402,title: "HTTP_PAYMENT_REQUIRED"}, {value: 404,title: "HTTP_NOT_FOUND"}, {value: 405,title: "HTTP_METHOD_NOT_ALLOWED"}, {value: 406,title: "HTTP_NOT_ACCEPTABLE"}, {value: 407,title: "HTTP_PROXY_AUTHENTICATION_REQUIRED"}, {value: 408,title: "HTTP_REQUEST_TIMEOUT"}, {value: 409,title: "HTTP_CONFLICT"}, {value: 410,title: "HTTP_GONE"}, {value: 411,title: "HTTP_LENGTH_REQUIRED"}, {value: 412,title: "HTTP_PRECONDITION_FAILED"}, {value: 413,title: "HTTP_REQUEST_ENTITY_TOO_LARGE"}, {value: 414,title: "HTTP_REQUEST_URI_TOO_LONG"}, {value: 415,title: "HTTP_UNSUPPORTED_MEDIA_TYPE"}, {value: 416,title: "HTTP_REQUESTED_RANGE_NOT_SATISFIABLE"}, {value: 417,title: "HTTP_EXPECTATION_FAILED"}, {value: 418,title: "HTTP_I_AM_A_TEAPOT"}, {value: 421,title: "HTTP_MISDIRECTED_REQUEST"}, {value: 422,title: "HTTP_UNPROCESSABLE_ENTITY"}, {value: 423,title: "HTTP_LOCKED"}, {value: 424,title: "HTTP_FAILED_DEPENDENCY"}, {value: 425,title: "HTTP_RESERVED_FOR_WEBDAV_ADVANCED_COLLECTIONS_EXPIRED_PROPOSAL"}, {value: 425,title: "HTTP_TOO_EARLY"}, {value: 426,title: "HTTP_UPGRADE_REQUIRED"}, {value: 428,title: "HTTP_PRECONDITION_REQUIRED"}, {value: 429,title: "HTTP_TOO_MANY_REQUESTS"}, {value: 431,title: "HTTP_REQUEST_HEADER_FIELDS_TOO_LARGE"}, {value: 451,title: "HTTP_UNAVAILABLE_FOR_LEGAL_REASONS"}, {value: 501,title: "HTTP_NOT_IMPLEMENTED"}, {value: 502,title: "HTTP_BAD_GATEWAY"}, {value: 503,title: "HTTP_SERVICE_UNAVAILABLE"}, {value: 504,title: "HTTP_GATEWAY_TIMEOUT"}, {value: 505,title: "HTTP_VERSION_NOT_SUPPORTED"}, {value: 506,title: "HTTP_VARIANT_ALSO_NEGOTIATES_EXPERIMENTAL"}, {value: 507,title: "HTTP_INSUFFICIENT_STORAGE"}, {value: 508,title: "HTTP_LOOP_DETECTED"}, {value: 510,title: "HTTP_NOT_EXTENDED"}, {value: 511,title: "HTTP_NETWORK_AUTHENTICATION_REQUIRED"}];
var error = false;
var errorMessage = '';
var final_response = null;
var countOfSplitPanels = 1;
var aceOutputEditor = [];
var defaultCodeDescription = {200: 'HTTP_OK', 201: 'HTTP_CREATED', 204: 'No content', 400: 'Bad request', 403: 'Permission denied', 500: 'Internal server error'};
$(document).ready(function () {
    editCodesList();
});
function generateAnnotation() {
    tabsCount = 1;
    error = false;
    const apiName = document.getElementById('apiDescription').value ?
        document.getElementById('apiDescription').value.replace(/"/g, '\"\"') :
        'Api Name';
    const apiPath = document.getElementById('apiName').value;
    const method = document.getElementById('method').value

    let response = f_space + '/**\n' + f_space + '* @SWG\\Tag(name="' + apiName.replace(/"/g, '\"\"') +
        '", description="';
    if (apiPath) {
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
        if (Object.keys(inputJsonParameters).length !== 0) {
            const descriptionForInput = document.getElementById('descriptionParamsDataInput').value || 'The input parameters';
            response += inputParameters(Object.keys(inputJsonParameters)[0], descriptionForInput, inputJsonParameters)
            response += convertJsonToAnnotation(inputJsonParameters);
            if (typeof inputJsonParameters === "object" && Array.isArray(inputJsonParameters) && !Array.isArray(inputJsonParameters[0])) {
                response += f_space + '* ' + f_space + '),\n';
                tabsCount--;
            }
            tabsCount--;

            response += `${f_space}* ${f_space.repeat(tabsCount)})\n`;
            response += `${f_space}* )\n`;
        }
    }
    selectedCodes.forEach(code => {
        let description = document.getElementById(`${code}_input`).value ?
            document.getElementById(`${code}_input`).value : defaultCodeDescription[code];
        if (aceOutputEditor && aceOutputEditor[`${code}`]) {
            const resDataInput = aceOutputEditor[`${code}`].getValue(0);
            let jsonData = resDataInput ? JSON.parse(resDataInput) : {};

            response += responseData(code, jsonData);
            tabsCount--;
            response += convertJsonToAnnotation(jsonData);
            tabsCount--;
            response += responseDescription(description, jsonData);
        } else {
            response += errorCodeMessage(code, description)
        }
    });
    response += f_space + '**/'
    final_response = response;

    if (!error) {
        const lines = response.split('\n');
        const el = document.getElementById('finalAnnotationsCode');
        el.innerText = '\n';

        lines.forEach(line => {
            el.innerHTML += '<div>' + line + '</div>';
        });

        el.innerHTML += '\n\n<span aria-hidden="true" class="line-numbers-rows"></span>';
        const linesEl = $('.line-numbers-rows');
        linesEl.removeAttr('hidden');
        linesEl.css('display', 'block');
        linesEl.html('');
        lines.forEach(() => {
            linesEl.append('<span></span>');
        });
    } else {
        swal({
            title: "Upsss!",
            text: `Please update null/empty objects/arrays: \n ${errorMessage.slice(0, -2)}`,
            icon: "warning",
            button: "I got it!",
        });
    }
    $(window).scrollTop(0);
}

$(
    function () {
        $('#method').on('change', (event) => {
            const methods = ['post', 'patch', 'put'];
            const exist = methods.indexOf(event.target.value)
            let paramsData = document.getElementById('paramsData');
            if (exist >= 0) {
                paramsData.style.display = 'block';
            } else {
                paramsData.style.display = 'none';

            }
        })
    }
);

function editCodesList() {
    insertMessageCodes();
    selectedCodes = [];
    let select1 = document.getElementById('responseCode');
    for (let i = 0; i < select1.length; i++) {
        if (select1.options[i].selected) selectedCodes.push(select1.options[i].value);
    }
    const responsesDivExist = document.getElementById('responsesDiv');
    if (responsesDivExist !== null) {
        responsesDivExist.remove()
    }
    this.insertDescriptionInputs();
}

function insertMessageCodes() {
    let codesSelect = document.getElementById('responseCode');
    codes.forEach((code) => {
        let codeOption = document.createElement('option');
        let codeOptionText = document.createTextNode(`${code.title}:${code.value}`);
        codeOption.value = code.value;
        codeOption.id = `${code.value}_code`;
        codeOption.title = code.title;
        if(selectedCodes.indexOf(code.value) >= 0) {
            codeOption.selected = true;
        }
        codeOption.appendChild(codeOptionText);
        codesSelect.appendChild(codeOption);
    })
}

function insertDescriptionInputs() {
    let responsesDiv = document.createElement('div');
    responsesDiv.id = 'responsesDiv';
    selectedCodes.forEach(code => {
        if (document.getElementById(code) === null) {
            let divL = document.getElementById('divL');
            let codeDiv = document.createElement('div');
            let codeLabel = document.createElement('label');
            let labelText = document.createTextNode(`Description for code : ${code} `);
            let codeInput = document.createElement('input');
            let newLine = document.createElement('br');
            let checkBoxContainer = document.createElement('label');
            let checkBoxInput = document.createElement('input');
            let checkBoxMark = document.createElement('span');
            codeLabel.appendChild(labelText);
            codeDiv.id = code;
            codeInput.placeholder = defaultCodeDescription[code] ? defaultCodeDescription[code] : '';
            codeInput.id = `${code}_input`;
            codeInput.className = 'form-control description-input';
            codeLabel.nodeValue = code;
            checkBoxContainer.className = 'cb-container';
            checkBoxInput.type = 'checkbox';
            checkBoxInput.id = `${code}_checkbox`;
            checkBoxInput.setAttribute('onchange', 'addJsonForCode(this)')
            checkBoxMark.className = 'cb-checkmark';
            codeDiv.appendChild(codeLabel);
            codeDiv.appendChild(newLine);
            codeDiv.appendChild(codeInput);
            checkBoxContainer.appendChild(document.createTextNode('JSON'));
            checkBoxContainer.appendChild(checkBoxInput);
            checkBoxContainer.appendChild(checkBoxMark);
            codeDiv.appendChild(checkBoxContainer);
            responsesDiv.appendChild(codeDiv);
            divL.appendChild(responsesDiv);
            divL.insertBefore(responsesDiv, divL.lastChild)
        }
    })
}

function convertJsonToAnnotation(inputJson) {
    let finalString = '';
    if (Array.isArray(inputJson) && typeof inputJson[0] === 'object' && !Array.isArray(inputJson[0]) &&
        Object.keys(inputJson[0]).length !== 0 && inputJson.length !== 0) {
        finalString += 'type="object",\n';
        tabsCount++;
        Object.keys(inputJson[0]).forEach(function (key) {
            finalString = redirectValue(finalString, key, inputJson[0][key]);
        });
    } else {
        if (Object.keys(inputJson).length) {
            tabsCount++;
            Object.keys(inputJson).forEach(function (key) {
                finalString = redirectValue(finalString, key, inputJson[key]);
            });
        }

    }

    return `${finalString.slice(0, -2)}\n`;
}

function redirectValue(finalString, key, value) {
    switch (typeof value) {
        case 'string':
            if (Date.parse(value)) {
                finalString += addDateProperty(key, value.replace(/"/g, '\"\"'))
            } else {
                finalString += addStringProperty(key, value.replace(/"/g, '\"\"'))
            }
            break;
        case 'number':
            finalString += addIntegerProperty(key, value)
            break;
        case 'boolean':
            finalString += addBooleanProperty(key, value)
            break;
        case 'object':
            if (Array.isArray(value)) {
                if (value.length !== 0) {
                    finalString += addArrayProperty(key, value)
                } else {
                    errorMessage += key + ', ';
                }
            } else if (!value) {
                error = true;
                errorMessage += key + ', ';
                return 0;
            } else {
                if (Object.keys(value).length !== 0){
                    tabsCount++;
                    finalString += addObjectProperty(key, value)
                    tabsCount--;
                } else {
                    errorMessage += key + ', ';
                }
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
            response = addParameters(item.split('=')[0], item.substr(itemsApiQuery.indexOf('=') + 1), 'query');
        })
    }

    return response;
}

function addStringProperty(key, value) {
    return f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="string", example="' + value + '"),\n';
}

function addObjectProperty(key, value) {
    let result = f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="object",\n';
    tabsCount++;
    Object.keys(value).forEach(function (newKey) {
        result += redirectValue('', newKey, value[newKey]);
    });
    tabsCount--;

    return result += f_space + '* ' + f_space.repeat(tabsCount) + "),\n"
}

function addArrayProperty(key, value) {
    let result = f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Property(property="' + key + '", type="array",\n';
    tabsCount++;
    result += f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Items(';
    if (typeof value[0] === 'object') {
        if (!Array.isArray(value[0])) {
            result += 'type="object",\n'
        }
        tabsCount++;
        Object.keys(value[0]).forEach(function (newKey) {
            result += redirectValue('', newKey, value[0][newKey]);
        });
    } else {
        switch (typeof value[0]) {
            case 'string':
                if (Date.parse(value[0])) {
                    result += `type="datetime", example=${value[0]})\n`;
                } else {
                    result += `type="${typeof value[0]}", example="${value[0]}")\n`;
                }
                break;
            case 'number':
                result += `type="${typeof value[0]}", example=${value[0]})\n`;
                break;
            case 'boolean':
                result += `type="boolean", example=${value[0]})\n`;
                break;
        }
    }
    tabsCount--;
    result += f_space + '* ' + f_space.repeat(tabsCount) + "),\n"
    tabsCount--;

    return result += f_space + '* ' + f_space.repeat(tabsCount) + "),\n"
}

function addBooleanProperty(key, value) {
    return `${f_space}* ${f_space.repeat(tabsCount)}@SWG\\Property(property="${key}", type="boolean", example=${value}),\n`;
}

function addIntegerProperty(key, value) {
    return `${f_space}* ${f_space.repeat(tabsCount)}@SWG\\Property(property="${key}", type="int", example=${value}),\n`;
}

function addDateProperty(key, value) {
    return `${f_space}* ${f_space.repeat(tabsCount)}@SWG\\Property(property="${key}", type="datetime", example="${value}"),\n`;
}

function responseData(code, jsonData) {
    let response = `${f_space}* @SWG\\Response(\n${f_space}* ${f_space.repeat(tabsCount)}response=${code},\n`;
    if (Object.keys(jsonData).length !== 0) {
        response += startJsonData(jsonData);
        tabsCount++;
    } else {
        tabsCount++;
    }

    return response;
}

function responseDescription(description, jsonData) {
    let response = '';
    if (typeof jsonData === 'object' && Array.isArray(jsonData)) {
        tabsCount--;
        response += `${f_space}* ${f_space.repeat(tabsCount)}),\n`;
    }
    response += `${f_space}* ${f_space.repeat(tabsCount)}),\n`;
    response += `${f_space}* ${f_space.repeat(tabsCount)}description="${description.replace(/"/g, '\"\"')}"\n${f_space}* )\n`;

    return response;
}

function errorCodeMessage(code, description) {
    return f_space + '* @SWG\\Response(\n' +
        f_space + '* ' + f_space + 'response=' + code + ',\n' +
        f_space + '* ' + f_space + 'description="' + description.replace(/"/g, '\"\"') + '"\n' +
        f_space + '* )\n';
}

function inputParameters(name, description, inputJsonParameters) {
    let response = f_space + '* @SWG\\Parameter(\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'name="' + name + '",\n' + //data
        f_space + '* ' + f_space.repeat(tabsCount) + 'in="body",\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'type="object",\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'description="' + description.replace(/"/g, '\"\"') + '",\n';
    response += startJsonData(inputJsonParameters);

    return response;
}

function startJsonData(jsonData) {
    let response = ''
    if (typeof jsonData === "object") {
        response = f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Schema(';
        if (Array.isArray(jsonData) && jsonData.length !== 0) {
            response += 'type="array",\n';
            tabsCount++;
            response += f_space + '* ' + f_space.repeat(tabsCount) + '@SWG\\Items(';
        } else {
            if (Object.keys(jsonData).length !== 0) {
                response += 'type="object",\n';
            }
        }
    }

    return response;
}

function addParameters(name, description, type) {
    return f_space + '* @SWG\\Parameter(\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'name="' + name + '",\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'in="' + type + '",\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'type="string",\n' +
        f_space + '* ' + f_space.repeat(tabsCount) + 'description="' + description.replace(/"/g, '\"\"') + '"\n' +
        f_space + '* )\n';
}

function addJsonForCode(checkbox) {
    const code = checkbox.id.split('_')[0];
    if (checkbox.checked) {
        if (document.getElementById(`split-parent${code}`)) {
            document.getElementById(`split-parent${code}`).hidden = false;
        } else {
            const codeDiv = document.getElementById(code);
            const splitParent = document.createElement('div');
            const splitPanel = document.createElement('div');
            const output = document.createElement('div');
            splitParent.className = 'split-parent';
            splitParent.id = `split-parent${code}`;
            splitPanel.id = `split-panel${code}`;
            splitParent.appendChild(document.createTextNode(`JSON response data for ${code} code:`));
            output.id = `output_${code}`;
            splitPanel.appendChild(output);
            splitParent.appendChild(splitPanel);
            codeDiv.appendChild(splitParent);
            jeSplitPanels.push([`#split-panel${code}`]);
            window.Split(jeSplitPanels[countOfSplitPanels], jeSplitCfg);
            document.querySelector(`#output_${code}`); // Form output
            aceOutputEditor.push(`${code}`);
            aceOutputEditor[`${code}`] = createEditor(document.querySelector(`#output_${code}`), {mode: 'ace/mode/json'});
            countOfSplitPanels++;
        }
    } else {
        document.getElementById(`split-parent${code}`).hidden = true;
    }
}