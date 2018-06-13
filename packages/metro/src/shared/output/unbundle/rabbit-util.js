let HasMarkedEntry = false;

//将bundle的lazy中的RN模块提取到startup
exports.transform = function (bundle, option) {
    const BaseModulesPwd = process.cwd() + '/node_modules';
    for(var i=0; i<bundle.lazyModules.length; i++){
        if(bundle.lazyModules[i].sourcePath.indexOf(BaseModulesPwd) !== -1){
            if(!HasMarkedEntry){
                bundle = dealRequire(bundle);
                HasMarkedEntry = true;
            }
            bundle.startupModules.push(bundle.lazyModules[i]);
            bundle.lazyModules.splice(i,1);
            i--;
        } else {
            // console.log(bundle.lazyModules[i].id + ':' + bundle.lazyModules[i].name +';');
        }
    }
    return bundle;   
}

//处理unbundle 基础包最后执行的require(11);
let dealRequire = function(bundle){
    // console.log(bundle.startupModules[bundle.startupModules.length - 1]);
    // { 
    //     id: 11,
    //     code: 'require(11);',
    //     map: { 
    //         version: 3,
    //         file: 'require-11.js',
    //         sources: [ 'require-11.js' ],
    //         sourcesContent: [ 'require(11);' ],
    //         names: [],
    //         mappings: '' 
    //     },
    //     name: 'require-11',
    //     sourcePath: 'require-11.js',
    //     source: 'require(11);',
    //     type: 'require' 
    // }
    bundle.startupModules.splice(bundle.startupModules.length - 1, 1);
    return bundle;
}

//将lazy模块导出一个lazy.bundle文件
exports.saveLazyBundle = function(bundleOutput, lazyCode, encoding){
    console.log('lazyCode', lazyCode);
}
