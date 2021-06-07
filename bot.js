console.log('open')

const fs = require('fs')
const Twit = require('twit')

const texts = require('./texts.json')
const images = fs.readdirSync('./images/')
const config = require('./config.js')

var T = new Twit(config)
T.post('statuses/update', {status: 'started'}, tweeted)
var stream = T.stream('statuses/filter', {track: '@botbokita'})
stream.on('tweet', tweetEvent)

function tweetEvent(tweet) {
	printTweet(tweet)

	var name = tweet.user.screen_name
	var id = tweet.id_str

	const imageURL = randomImageURL()

	// Read the file made by Processing
	var b64content = fs.readFileSync(imageURL, {
		encoding: 'base64',
	})

	// Upload the media
	T.post(
		'media/upload',
		{
			media_data: b64content,
		},
		uploaded
	)

	function uploaded(err, data, response) {
		var mediaIdStr = data.media_id_string
		var params = {
			status: '@' + name,
			in_reply_to_status_id: id,
			media_ids: [mediaIdStr],
		}
		T.post('statuses/update', params, tweeted)
	}
}

// Make sure it worked!
function tweeted(err, reply) {
	if (err) {
		console.log('---- Error -----')
		console.log(err.message)
	} else {
		console.log('---- Tweeted -----')
		console.log(reply.text)
	}
}

function randomText() {
	return texts.random()
}

function randomImageURL() {
	return './images/' + images.random()
}

Array.prototype.random = function () {
	return this[Math.floor(Math.random() * this.length)]
}

function printTweet(someTweet) {
	console.log('---- Received tweet -----')
	console.log('User: ' + someTweet.user.screen_name)
	console.log('Text: ' + someTweet.text)
	console.log('Id: ' + someTweet.id_str)
}
