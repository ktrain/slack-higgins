const _ = require('lodash');
const MicroBots = require('slack-microbots');
const glob = require('glob');
const path = require('path');
const express = require('express');
const app = express();

const config = require('nconf');
config.argv()
	.env({ lowerCase: true })
	.file('environment', { file: 'config/local.json' })
	.file('defaults', { file: 'config/default.json' });
config.env('__');

const logbot = require('slack-microbots/logbot.js');
logbot.setupWebhook(config.get('diagnostics_webhook'));

const Storage = require('slack-microbots/storage')


const Higgins = MicroBots(config.get('slack_bot_token'), {
	name : 'Higgins',
	icon : ':tophat:'
});

let Bots = [];
let Cmds = [];


Storage.init(() => {

	/* Load Bots */
	glob('./bots/**/*.bot.js', {}, (err, files) => {
		if(err) return logbot.error(err);
		const bots = _.reduce(files, (r, botFile)=>{
			try{
				r.push(require(botFile));
				console.log(`Loaded ${botFile}`);
				Bots.push(path.basename(botFile));
			}catch(e){
				logbot.error(e, 'Bot Load Error');
			}
			return r;
		}, []);
		Higgins.loadBots(bots);
		logbot.msg('Successful restart!');
	});

	/* Load Cmds */
	glob('./cmds/**/*.cmd.js', {}, (err, files) => {
		if(err) return logbot.error(err);
		const cmds = _.reduce(files, (r, cmdFile)=>{
			try{
				r.push(require(cmdFile));
				console.log(`Loaded ${cmdFile}`);
				Cmds.push(path.basename(cmdFile));
			}catch(e){
				logbot.error(e, 'Command Load Error');
			}
			return r;
		}, []);
		Higgins.loadCmds(app, cmds);
	});
});


app.get('/', (req, res)=>{
	return res.status(200).json({
		bots : Bots,
		cmds : Cmds,
	})
})



var port = process.env.PORT || 8000;

app.listen(port);
console.log('running bot server at localhost:8000');
