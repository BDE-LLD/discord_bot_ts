# Asking bot (util for QPP and Blindtest)

## How to use
- Replace `./.env.sample` by `.env` and fill it with your own values
- Replace `./src/config.json.sample` by `./src/config.json` and fill it with your own values
- Run `npm install`
- Run `npm run build`
- Run `npm run start`

## Commands

- init:
	- `/init qpp` : Start a QPP game
	- `/init blindtest` : Start a blindtest

Init the choosed game (can bu used to reset the current game)

- ask:
  - `/ask` : Send the next questions
  - `/ask <index>` : Send the question at a certain index

Send a random or defined question in all registered channels and wait for the answer

- stop:
  - `/stop` : Global stop
  - `/stop <coaltion>` : Stop in the channel of the nammed coalition

Stop waiting the answer (print a message in the channel)

- settings:
  - `/settings show` : Show current settings
  - `/settings add_coalition <name> <channe>` : Set/Update coalition's channel
  - `/settings remove_coalition <name>` : Unregister the coalition

Setup the game

- scores
  - `/scores`

Show current ladder of each coalitions

## Questions

Questions' file example:

### QPP
```json
[
	{
		"question": "Donnez 2 des 5 premières lettres de l'alphabet",
		"answers": ["a", "b", "c", "d", "e"],
		"case_sensitive": false,
		"answers_nb": 2
	},
	{
		"question": "Quel est le sens de la vie ?",
		"answers": ["42"],
		"case_sensitive": false,
		"answers_nb": 1
	}
]
```

### Blindtest
```json
[
	{
		"question": "Chanson 1",
		"answers": ["Artiste 1", "Titre 1"]
	},
	{
		"question": "Chanson 2",
		"answers": ["Artiste 2", "Titre 2"]
	}
]
```


## Contributors

### Developers
- dhubleur
- shocquen

### Questions
- dhubleur
- atheveni
- itripoli
- jboisne
- ngiroux