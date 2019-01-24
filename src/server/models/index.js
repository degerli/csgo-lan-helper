import sequelize from '../config/db'
import Sequelize from 'sequelize'
import rcon from 'srcds-rcon'
import SteamID from 'steamid'
import Steam from 'steam-web'

const Op = Sequelize.Op

const s = new Steam({
  apiKey: 'C5B6350F0C704F374EDBD505A9B0224C',
  format: 'json'
})

// Can be useless later on
export const User = sequelize.define('User', {
  steam_id: { type: Sequelize.STRING, unique: true },
  name: { type: Sequelize.STRING(40) },
  admin: { type:Sequelize.BOOLEAN, defaultValue: false }
  // servers = db.relationship('GameServer', backref='user', lazy='dynamic')
  // teams = db.relationship('Team', backref='user', lazy='dynamic')
  // matches = db.relationship('Match', backref='user', lazy='dynamic')
})

export const Server = sequelize.define('Server', {
  display_name: { type: Sequelize.STRING(32), defaultValue: '' },
  ip_string:{ type: Sequelize.STRING(32) },
  port: { type: Sequelize.INTEGER, defaultValue: 27015 },
  rcon_password: { type: Sequelize.STRING(32) },
  in_use: { type:Sequelize.BOOLEAN, defaultValue: false }
}, {
  classMethods: {

  },
  instanceMethods: {
    async send_rcon_command (command) {
      let conn = rcon({ address: `${this.ip_string}:${this.port}`, password: this.rcon_password })
      await conn.connect()
      let res = await conn.command(command)
      await conn.disconnect()
      return res
    },
    get_hostport () {
      return `${this.ip_string}:${this.port}`
    },
    get_display () {
      if (this.display_name) {
        return `${this.display_name} (${this.get_hostport()})`
      }
      else {
        return this.get_hostport()
      }
    }
  }
})

export const Team = sequelize.define('Team', {
  name: { type: Sequelize.STRING(40) },
  tag: { type: Sequelize.STRING(40), defaultValue: '' },
  flag: { type: Sequelize.STRING(4), defaultValue: '' },
  logo: { type: Sequelize.STRING(10), defaultValue: '' },
  auths: { type: Sequelize.ARRAY(Sequelize.STRING) }
}, {
  classMethods: {
    
  },
  instanceMethods: {
    async get_players () {
      let results = []
      for(let x=0;x<this.auths.length;x++) {
        let steamid = this.auths[x]
        let steam64 = new SteamID(steamid).getSteamID64()
        let summary = await s.getPlayerSummaries({steamids: [steam64]})
        results.push({
          steam64: steam64,
          name: summary.response.players[0].personaname
        })
      }
      return results
    },
    async get_recent_matches (limit=10) {
      return await Match.findAll({
        where: { 
          [Op.or]: [
            {team1_id: this.id}, 
            {team2_id: this.id}
          ],
          cancelled: false,
          start_time: { [Op.not]: null }
        },
        order: 'id DESC',
        limit: limit
      })
    },
    async get_vs_match_result (match_id) {
      let other_team = null
      let my_score = 0
      let other_team_score = 0

      let match = await Match.findById(match_id)
      if(match.team1_id == this.id) {
        my_score = match.team1_score
        other_team_score = match.team2_score
        other_team = await Team.findById(match.team2_id)
      }
      else {
        my_score = match.team2_score
        other_team_score = match.team1_score
        other_team = await Team.findById(match.team1_id)
      }
      
      // for a bo1 replace series score with the map score
      if (match.max_maps == 1){
        let mapstat = await MapStats.findOne({ where: { id: match.map_stats } })
        if (mapstat) {
          if (match.team1_id == this.id) {
            my_score = mapstat.team1_score
            other_team_score = mapstat.team2_score
          }
          else {
            my_score = mapstat.team2_score
            other_team_score = mapstat.team1_score
          }
        }
      }
      if (match.live())
        return `Live, ${my_score}:${other_team_score} vs ${other_team.name}`
      if (my_score < other_team_score)
        return `Lost ${my_score}:${other_team_score} vs ${other_team.name}`
      else if (my_score > other_team_score)
        return `Won ${my_score}:${other_team_score} vs ${other_team.name}`
      else
        return `Tied ${my_score}:${other_team_score} vs ${other_team.name}`
    }
  }
})

export const Match = sequelize.define('Match', {
  server_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Server,
      key: 'id'
    }
  },
  team1_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Team,
      key: 'id'
    }
  }, 
  team2_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Team,
      key: 'id'
    }
  },
  team1_STRING: { type: Sequelize.STRING(32), defaultValue: '' },
  team2_STRING: { type: Sequelize.STRING(32), defaultValue: '' },
  winner: { 
    type: Sequelize.INTEGER,
    references: {
      model: Team,
      key: 'id'
    }
  },
  plugin_version: { type: Sequelize.STRING(32), defaultValue: 'unknown' },

  forfeit: { type:Sequelize.BOOLEAN, defaultValue: false },
  cancelled: { type:Sequelize.BOOLEAN, defaultValue: false },
  start_time: { type: Sequelize.DATE },
  end_time: { type: Sequelize.DATE },
  max_maps: { type: Sequelize.INTEGER },
  title: { type: Sequelize.STRING(60), defaultValue: '' },
  skip_veto: { type:Sequelize.BOOLEAN },
  api_key: { type: Sequelize.STRING(32) },

  veto_mappool: { type: Sequelize.STRING(500) },
  map_stats: {
    type: Sequelize.INTEGER,
    references: {
      model: 'MapStats',
      key: 'id'
    }
  },

  team1_score: { type: Sequelize.INTEGER, defaultValue: 0 },
  team2_score: { type: Sequelize.INTEGER, defaultValue: 0 }
}, {
  classMethods: {
    
  },
  instanceMethods: {
    get_status_string (show_winner=true) {
      if (this.pending()) return 'Pending'
      else if (this.live()) {
        let scores = this.get_current_score()
        return `Live, ${scores[0]}:${scores[2]}`
      }
      else if (this.finished()) {
        let scores = this.get_current_score()
        let min_score = Math.min(scores[0], scores[1])
        let max_score = Math.max(scores[0], scores[1])
        let score_string = `${max_score}:${min_score}`

        if (!show_winner) return 'Finished'
        else if (this.winner == this.team1_id) return `Won ${score_string} by ${this.get_team1().name}`
        else if (this.winner == this.team2_id) return `Won ${score_string} by ${this.get_team2().name}`
        else return `Tied ${score_string}`
      }
      else return 'Cancelled'
    },
    finalized () {
      return this.cancelled() || this.finished()
    },
    pending () {
      return this.start_time == null && !this.cancelled
    },
    finished () {
      return this.end_time != null && !this.cancelled
    },
    live () {
      return this.start_time != null && this.end_time != null && !this.cancelled
    },
    async get_server () {
      return await Server.findOne({ where: { id: this.server_id } })
    },
    async get_current_score () {
      if (this.max_maps == 1) {
        let mapstat = await MapStats.findAll({ where: { id: this.map_stats } })[0]
        if (!mapstat) {
          return [0, 0]
        }
        else return [mapstat.team1_score, mapstat.team2_score]
      }
      else return [this.team1_score, this.team2_score]
    },
    async send_to_server () {
      let server = await Server.findById(this.server_id)
      if (!server) return false

      let url = `${require('my-local-ip')()}:43434/match/${this.id}/config`

      let loadmatch_response = await server.send_rcon_command(`get5_loadmatch_url ${url}`)
      await server.send_rcon_command(`get5_web_api_key ${this.api_key}`)

      if (loadmatch_response) return false

      return true
    },
    async get_team1 () {
      return await Team.findById(this.team1_id)
    },
    async get_team2 () {
      return await Team.findById(this.team2_id)
    },
    async get_winner () {
      if (this.team1_score > this.team2_score) {
        return await this.get_team1()
      }
      else if (this.team2_score > this.team1_score) {
        return await this.get_team2()
      }
      else {
        return null
      }
    },
    async get_loser () {
      if (this.team1_score > this.team2_score) {
        return await this.get_team2()
      }
      else if (this.team2_score > this.team1_score) {
        return await this.get_team1()
      }
      else {
        return null
      }
    },
    async build_match_dict () {
      let d = {}
      d['matchid'] = toString(this.id)
      d['match_title'] = this.title
      d['side_type'] = 'always_knife'

      d['skip_veto'] = this.skip_veto
      d['num_maps'] = this.max_maps

      async function add_team_data (teamkey, teamid, matchtext) {
        let team = await Team.findById(teamid)
        if (!team) return
        d[teamkey] = {}

        // Add entries if they have values.
        function add_if (key, value) {
          if (value) d[teamkey][key] = value
        }
        add_if('name', team.name)
        add_if('name', team.name)
        add_if('tag', team.tag)
        add_if('flag', team.flag.toUpperCase())
        add_if('logo', team.logo)
        add_if('matchtext', matchtext)
        d[teamkey]['players'] = team.auths.filter(x => x != '')
      }

      await add_team_data('team1', this.team1_id, this.team1_string)
      await add_team_data('team2', this.team2_id, this.team2_string)

      d['cvars'] = {}

      d['cvars']['get5_web_api_url'] = `http://${require('my-local-ip')()}:43434`

      if (this.veto_mappool) {
        d['maplist'] = []
        this.this.veto_mappool.split(' ').forEach(map => {
          d['maplist'].push(map)
        })
      }

      return d

    }
  }
})

export const PlayerStats = sequelize.define('PlayerStats', {
  match_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Match,
      key: 'id'
    }
  },
  map_id: {
    type: Sequelize.INTEGER,
    references: {
      model: 'MapStats',
      key: 'id'
    }
  },
  team_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Team,
      key: 'id'
    }
  },
  steam_id: Sequelize.STRING(40),
  name: Sequelize.STRING(40),
  kills: { type: Sequelize.INTEGER, defaultValue: 0 },
  deaths: { type: Sequelize.INTEGER, defaultValue: 0 },
  roundsplayed: { type: Sequelize.INTEGER, defaultValue: 0 },
  assists: { type: Sequelize.INTEGER, defaultValue: 0 },
  flashbang_assists: { type: Sequelize.INTEGER, defaultValue: 0 },
  teamkills: { type: Sequelize.INTEGER, defaultValue: 0 },
  suicides: { type: Sequelize.INTEGER, defaultValue: 0 },
  headshot_kills: { type: Sequelize.INTEGER, defaultValue: 0 },
  damage: { type: Sequelize.INTEGER, defaultValue: 0 },
  bomb_plants: { type: Sequelize.INTEGER, defaultValue: 0 },
  bomb_defuses: { type: Sequelize.INTEGER, defaultValue: 0 },
  v1: { type: Sequelize.INTEGER, defaultValue: 0 },
  v2: { type: Sequelize.INTEGER, defaultValue: 0 },
  v3: { type: Sequelize.INTEGER, defaultValue: 0 },
  v4: { type: Sequelize.INTEGER, defaultValue: 0 },
  v5: { type: Sequelize.INTEGER, defaultValue: 0 },
  k1: { type: Sequelize.INTEGER, defaultValue: 0 },
  k2: { type: Sequelize.INTEGER, defaultValue: 0 },
  k3: { type: Sequelize.INTEGER, defaultValue: 0 },
  k4: { type: Sequelize.INTEGER, defaultValue: 0 },
  k5: { type: Sequelize.INTEGER, defaultValue: 0 },
  firstkill_t: { type: Sequelize.INTEGER, defaultValue: 0 },
  firstkill_ct: { type: Sequelize.INTEGER, defaultValue: 0 },
  firstdeath_t: { type: Sequelize.INTEGER, defaultValue: 0 },
  firstdeath_ct: { type: Sequelize.INTEGER, defaultValue: 0 }
}, {
  classMethods: {
    
  },
  instanceMethods: {
    get_steam_url () {
      return `http://steamcommunity.com/profiles/${new SteamID(this.steam_id).getSteamID64()}`
    },
    get_rating () {
      let AverageKPR = 0.679
      let AverageSPR = 0.317
      let AverageRMK = 1.277
      let KillRating = this.kills / this.roundsplayed / AverageKPR
      let SurvivalRating = (this.roundsplayed - this.deaths) / this.roundsplayed / AverageSPR
      let killcount = (this.k1 + 4 * this.k2 + 9 * this.k3 + 16 * this.k4 + 25 * this.k5)
      let RoundsWithMultipleKillsRating = killcount / this.roundsplayed / AverageRMK
      let rating = (KillRating + 0.7 * SurvivalRating + RoundsWithMultipleKillsRating) / 2.7
      return rating
    },
    get_kdr () {
      if (this.deaths == 0) return this.kills
      else return this.kills / this.deaths
    },
    get_hsp () {
      if (this.kills == 0) return 0.0
      else return this.headshot_kills / this.kills
    },
    get_adr () {
      if (this.roundsplayed == 0) return 0.0
      else return this.damage / this.roundsplayed
    },
    get_fpr () {
      if (this.roundsplayed == 0) return 0.0
      else return this.kills / this.roundsplayed
    }
  }
})

export const MapStats = sequelize.define('MapStats', {
  match_id: {
    type: Sequelize.INTEGER,
    references: {
      model: Match,
      key: 'id'
    }
  },
  map_number: Sequelize.INTEGER,
  map_name: Sequelize.STRING(64),
  start_time: Sequelize.DATE,
  end_time: Sequelize.DATE,
  winner: { 
    type: Sequelize.INTEGER,
    references: {
      model: Team,
      key: 'id'
    }
  },
  team1_score: { type: Sequelize.INTEGER, defaultValue: 0 },
  team2_score: { type: Sequelize.INTEGER, defaultValue: 0 },
  player_stats: {
    type: Sequelize.INTEGER,
    references: {
      model: PlayerStats,
      key: 'id'
    }
  }
}, {
  classMethods: {
    
  },
  instanceMethods: {

  }
})