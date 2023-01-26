'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init({
    CompanyId: DataTypes.INTEGER,
    nameItem: DataTypes.STRING,
    totalItem: DataTypes.INTEGER,
    priceItem: DataTypes.INTEGER,
    grandTotal: DataTypes.INTEGER,
    leftOver: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};