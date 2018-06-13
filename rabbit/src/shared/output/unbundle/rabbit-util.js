/*
 *  rabbit-bundler 核心方法;
 *
 */

//InitializeCore模块名
const InitializeCoreName = 'InitializeCore';
//标示RN模块(非业务模块)的路径
const BaseModulesPwd = process.cwd() + '/node_modules';

exports.transform = function (bundle, option) {
    //将startup中调用入口的模块删除
    bundle.startupModules.splice(bundle.startupModules.length - 1, 1);

    //InitializeCore模块Id
    let InitializeCoreId = -1;
    //目标入口Id
    let lazyId = option.rabbitId || '5858';
    
    //判断lazyId是否小于模块数
    if(parseInt(lazyId, 10) <= (bundle.startupModules.length + bundle.lazyModules.length) ){
        console.log('FAILD: The rabbit id is smaller than modules number');
        return;
    }

    for (var i = 0; i < bundle.lazyModules.length; i++) {
        //如果是InitializeCore模块，记录ID用于最后生成调用；
        if(bundle.lazyModules[i].name === InitializeCoreName){
            InitializeCoreId = bundle.lazyModules[i].id;
        }
        //如果是entry-file模块，将该模块ID改成目标入口ID
        if(option.entryFile == bundle.lazyModules[i].name){
            //TODO:提高替换字符串方案，缺乏稳定性；
            bundle.lazyModules[i].code = bundle.lazyModules[i].code.replace(`},${bundle.lazyModules[i].id},[`, `},${lazyId},[`)
            bundle.lazyModules[i].id = lazyId;
        }
        //如果是RN模块，提取到startup
        if (bundle.lazyModules[i].sourcePath.indexOf(BaseModulesPwd) !== -1) {
            bundle.startupModules.push(bundle.lazyModules[i]);
            bundle.lazyModules.splice(i, 1);
            i--;
        }
    }
    let lastLazyModule = getlastLazyModule(lazyId, InitializeCoreId);
    bundle.lazyModules.push(lastLazyModule);
    return bundle;
};

//生成尾部调用模块
let getlastLazyModule = function(lazyId, coreId){
    return  { 
        id: lazyId + '0',
        code: `require(${coreId});require(${lazyId});`,
        map: { 
            version: 3,
            file: '',
            sources: [ '' ],
            sourcesContent: [ '' ],
            names: [],
            mappings: '' 
        },
        name: 'rabbit-append',
        sourcePath: '',
        source: `require(${coreId});require(${lazyId});`,
        type: 'require' 
    }
}
