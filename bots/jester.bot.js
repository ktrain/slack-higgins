const Slack = require('pico-slack');
const _ = require('lodash');

const jokes = [
	{
	triggers: ['feeling really triggered', 'ilu bb'],
	joke: 'ye',
	who: ['chris']
	},
	{
	triggers: 'make me a sandwich',
	joke: ['Poof! You\'re a sandwich!'],
	who: ['chris']
	},
	{
	triggers: ['exhausted'],
	joke: 'Last night I dreamed I was a muffler, when I woke up this morning I was exhausted.',
	who: ['chris']
	},
];

const findJoke = (text)=>{
	return _.find(jokes, (joke)=>{
		retutn Slack.msgHas(text, joke.triggers);
	}
}

const ohHai = (msg)=>{
	const joke = findJoke(msg.text)
	if(joke){
		Slack.log('This is what the msg object looks like', msg);
		Slack.sendAs('JokeBot', ':chris:', msg, joke.joke);
	}
}

Slack.onMessage(ohHai);