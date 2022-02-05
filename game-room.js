const BGG_USER = '0xACE';

function parsePlaysXML(xml) {
	const plays = [];
	const playsXML = (new window.DOMParser()).parseFromString(xml, "text/xml");
	playsXML.querySelectorAll('play').forEach(function(play) {
		let players = [];
		play.querySelectorAll('player').forEach(function(player) {
			let name = player.getAttribute('name');
			if (name !== 'Anonymous player') {
				players.push(name.split(' ')[0]);
			}
		});

		let comments = '';
		if (play.querySelector('comments')) {
			comments = play.querySelector('comments').textContent;
		}

		const p_json = {
			'bgg_id': play.querySelector('item').getAttribute('objectid'),
			'name': play.querySelector('item').getAttribute('name'),
			'date': play.getAttribute('date'),
			'players': players.join(', '),
			'comments': comments,
			'location': play.getAttribute('location')
		};
		plays.push(p_json);
	});

	return plays;
}

function parseGamesXML(xml) {
	const games = [];
	const gamesXML = (new window.DOMParser()).parseFromString(xml, "text/xml");
	gamesXML.querySelectorAll('item').forEach(function(game) {
		let comments = '';
		if (game.querySelector('comments')) {
			comments = game.querySelector('comments').textContent;
		}

		const p_game = {
			'bgg_id': game.getAttribute('objectid'),
			'name': game.querySelector('name').textContent,
			'image': game.querySelector('image').textContent,
			'year': game.querySelector('yearpublished').textContent,
			'plays': game.querySelector('numplays').textContent,
			'comments': comments
		};

		games.push(p_game);
	});

	return games;
}

function bgg_uri(game) {
	return "https://boardgamegeek.com/boardgame/" + game.bgg_id;
}

function bgg_image(game) {
	const img_id = 'img_' + game.bgg_id;
	$.ajax({
		url: "https://boardgamegeek.com/xmlapi2/thing?id=" + game.bgg_id,
	}).done(function(xml) {
		const src = xml.querySelector('thumbnail').textContent;
		$('.' + img_id).attr('src', src);
	}).fail(function(err) {
		console.log(err);
	});

	return '<img class="game-image ' + img_id + '" />';
}

function render_date(the_date) {
	const d = new Date(the_date + "T00:00:00");
	return the_date + ' '
		+ d.toLocaleDateString('en-US', { weekday: 'long' });
}

$(document).ready(function() {
	$('#play-list').DataTable({
		responsive: true,
		ajax: {
			url: `https://boardgamegeek.com/xmlapi2/plays\?username\=${BGG_USER}`,
			dataType: "text",
			dataSrc: function(xml) {
				return parsePlaysXML(xml);
			}
		},
		paging: false,
		order: [[0, "desc"]],
		columns: [
			{ "data": "date" },
			{ "data": null, "defaultContent": "", "orderable": false },
			{ "data": "name" },
			{ "data": "players", "defaultContent": "" },
			{ "data": "location", "defaultContent": "" },
			{ "data": "comments", "defaultContent": "" }
		],
		columnDefs: [
			{
				targets: 0,
				responsivePriority: 1,
				render: function(data, type, row) {
					return render_date(data);
				}
			},
			{
				targets: 1,
				responsivePriority: 2,
				render: function(data, type, row) {
					return "<a href='" + bgg_uri(row) + "' target='_blank'>"
						+ bgg_image(row) + "</a>";
				}
			},
			{
				targets: 2,
				responsivePriority: 2,
				render: function(data, type, row) {
					return "<a href='" + bgg_uri(row) + "' target='_blank'>" + data + "</a>";
				}
			}
		]
	});

	$('#game-list').DataTable({
		responsive: true,
		ajax: {
			url: `https://boardgamegeek.com/xmlapi2/collection\?username\=${BGG_USER}`,
			dataType: "text",
			dataSrc: function(xml) {
				return parseGamesXML(xml);
			}
		},
		paging: false,
		order: [[1, "asc"]],
		columns: [
			{ "data": "image", "defaultContent": "", "orderable": false},
			{ "data": "name" },
			{ "data": "year", "defaultContent": "" },
			{ "data": "plays", "defaultContent": "0" },
			{ "data": "comments", "defaultContent": "" }
		],
		columnDefs: [
			{
				targets: 0,
				render: function(data, type, row) {
					return "<a href='" + bgg_uri(row) + "' target='_blank'>"
						+ bgg_image(row) + "</a>";

				}
			},
			{
				targets: 1,
				render: function(data, type, row) {
					return "<a href='" + bgg_uri(row) + "' target='_blank'>" + data + "</a>";
				}
			}
		]
	});
});