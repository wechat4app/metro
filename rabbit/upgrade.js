const fs = require('fs');
const rabbitCommand = `{command: '--rabbit-id [string]',description: 'rabbit rabbit entry id'}`;

function init(){
    addCommand();
    replaceMetro();
}

function addCommand(){
    const commandFileUrl = 'node_modules/react-native/local-cli/bundle/bundleCommandLineArgs.js';
    const file = fs.readFileSync(commandFileUrl).toString();
    //TODO: 加强正则
    let newContent = file.replace(/];/, rabbitCommand+'];');
    fs.writeFile(commandFileUrl, newContent, function(){
        console.log('rabbit-id参数输入成功');
    });
}

function replaceMetro(){
    const url = 'node_modules/react-native/local-cli/bundle/unbundle.js';
    const file = fs.readFileSync(url).toString();
    const oldLink = 'metro/src/shared/output/unbundle';
    const newLink = 'rabbit-bundler/src/shared/output/unbundle';
    let newContent = file.replace(oldLink, newLink);
    fs.writeFile(url, newContent, function(){
        console.log('metro替换成功');
    });
} 

init();