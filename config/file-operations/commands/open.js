module.exports.name = "run_open";
module.exports.args = [];

module.exports.run = function ({console}) {
	console.log(`Hello World! The time is ${new Date()}`);
}
