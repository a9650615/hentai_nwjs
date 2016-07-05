var exports = module.exports = {};

var fs = require('fs');
var path = require('path');
var dir = process.execPath;
var nwDir = path.dirname(dir);

exports.save_data = ( func ) => {
	fs.writeFile(nwDir+'/data.json',JSON.stringify(global.Data),func);
}

exports.save_setting = () => {
	fs.writeFile(nwDir+'/setting.json',JSON.stringify(global.Setting));
}