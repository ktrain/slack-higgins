const Slack = require('pico-slack');
const request = require('superagent');
const datefns = require('date-fns');
const cron = require('node-schedule');

//https://coolsville.slack.com/files/U0VAY0TN2/FJ4KWP0EA/image.png

const nums = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];

const getDate = ()=>{
	//const date = datefns.subDays(new Date(), 1);
	const date = new Date();
	return datefns.format(date, 'YYYY/MM/DD');
};

const NUM_TO_SHOW = 5;


const getTopArticles = async ()=>{
	return request.get(`https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia/all-access/${getDate()}`)
		.then((res)=>res.body.items[0].articles)
		.then((articles)=>{
			return articles.filter((art)=>{
				if(art.article == 'Main_Page') return false;
				if(art.article.startsWith('Special:')) return false;
				if(art.article.startsWith('File:')) return false;
				return true
			})
		})
		.then((articles)=>articles.slice(0, NUM_TO_SHOW))
}

const run = ()=>{
	getTopArticles()
		.then((articles)=>{
			const msg = articles.map((art, idx)=>{
				return `:${nums[idx]}: *<https://en.wikipedia.org/wiki/${art.article}|${art.article}>* (_views: ${art.views}_)`;
			}).join('\n')
			Slack.sendAs('wikibot', 'wikipedia', 'hmmm', `Here's the most searched articles on wikipedia today\n\n${msg}`
				+ '\n\n Place your bets on what you think is happening! :monocle:')
		})
}
cron.scheduleJob('11 15 * * *', run)

//---------------------------

cron.scheduleJob('5 * * * *', ()=>{
	console.log('checking');
	getTopArticles()
		.then((articles)=>{
			Slack.send('scott', `worked!\n\n${JSON.stringify(articles)}`)
		})
		.catch((err)=>{
			Slack.send('scott', `broken \n\n ${err.toString()}`)
		})
})
