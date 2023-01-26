"use strict";

const { hashPassword } = require("../helpers/bycript");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const userData = [
      {
        username: "Stephen",
        password: hashPassword("12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Lyra",
        password: hashPassword("12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: "Browne",
        password: hashPassword("12345"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert("Users", userData);
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('Users', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users");
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('Users', null, {});
     */
  },
};
