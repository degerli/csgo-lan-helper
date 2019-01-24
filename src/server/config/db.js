import Sequelize from 'sequelize'
export default new Sequelize('data.sqlite', null, null, {
  dialect: 'sqlite',
  operatorsAliases: false,

  storage: './database/data.sqlite'
})